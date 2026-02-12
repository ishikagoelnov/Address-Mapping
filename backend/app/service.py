import json
import math
import faiss
from datetime import datetime
from fastapi import HTTPException
import httpx
from langchain_groq import ChatGroq
import numpy as np
from app.database import model
from app.constants import HEADERS, MAX_MEMORY, NOMINATIM_URL
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from app.config import settings, redis_client
from app.chat_memory import chat_memory_store

async def get_coordinates(address: str):    
    cache_key = f"geo:{address.lower()}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    params = {"q": address, "format": "json", "addressdetails": 1}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            NOMINATIM_URL + "search", 
            params=params, headers=HEADERS
        )
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Nominatim API error")
    
    data = response.json()
    if not data:
        raise HTTPException(status_code=404, detail=f"Address not found: {address}")
    
    coords =  (float(data[0]["lat"]), float(data[0]["lon"]))
    redis_client.setex(
        cache_key, 86400,
        json.dumps(coords)
    )

    return coords


def haversine_distance(lat1, lon1, lat2, lon2):
    # convert decimal degree to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371  # Earth radius in km
    return c * r


def history_to_text(row):
    return f"""
        Route from {row.source} to {row.destination},
        distance {row.kilometer_distance} km,
        at {row.created_at}
    """


def build_user_index(rows):
    """
    Add data to the vector db 
    """
    texts = [history_to_text(r) for r in rows]
    vectors = model.encode(texts)
    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(vectors))

    return index, texts


def search_history(question, index, texts, k=5):
    q_vec = model.encode([question])
    D, I = index.search(np.array(q_vec), k)
    return [texts[i] for i in I[0]]


def build_prompt(question, retrieved_routes, memory):

    mem_block = "\n".join(
        f"{m['role']}: {m['content']}" for m in memory
    )

    ctx_block = "\n".join(retrieved_routes)

    return f"""
        You are a route history assistant.
        RULES:
        - Answer briefly and clearly
        - Give final answers only
        - Do NOT show calculation steps
        - Do NOT explain your reasoning
        - Do not include reasoning or steps.
        - Use numbers directly when asked
        - If data is insufficient, say so
        - Keep answers under 3 sentences

        Conversation so far:
        {mem_block}

        Relevant route records:
        {ctx_block}

        Answer ONLY using this data.
        If unsure, say you don't know.

        User question:
        {question}
    """


def save_memory(user_id, role, content):
    chat_memory_store[user_id].append({
        "role": role,
        "content": content,
        "ts": datetime.utcnow().isoformat()
    })

    chat_memory_store[user_id] = chat_memory_store[user_id][-MAX_MEMORY:]


def load_memory(user_id):
    return chat_memory_store.get(user_id, [])


def clear_memory(user_id):
    chat_memory_store.pop(user_id, None)


def call_llm(prompt: str) -> str:
    llm = ChatGroq(
        api_key=settings.groq_api_key,
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        max_tokens=1024
    )

    messages = [
        SystemMessage(
            content=(
                "You are a route history assistant. "
                "Answer only from provided data. "
                "Do not hallucinate. "
                "If answer not found, say you don't know."
            )
        ),
        HumanMessage(content=prompt)
    ]

    try:
        resp = llm.invoke(messages)
        return resp.content.strip()

    except Exception as e:
        print("LLM error:", e)
        return "Sorry — I could not analyze the history right now."
