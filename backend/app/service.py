"""
Service utilities for route distance, history, and LLM-based insights.
"""

import json
import math
from datetime import datetime
from typing import List, Tuple, Dict

import faiss
import httpx
import numpy as np
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq

from app.config import settings, redis_client
from app.constants import HEADERS, MAX_MEMORY, NOMINATIM_URL
from app.database import model
from app.chat_memory import chat_memory_store
import logging

logger = logging.getLogger(__name__)


async def get_coordinates(address: str) -> Tuple[float, float]:
    """
    Fetch latitude and longitude for an address using Nominatim API.
    Results are cached in Redis for 1 day.
    Args:
        address (str): Address string to geocode.
    Returns:
        Tuple[float, float]: Latitude and Longitude.
    """
    cache_key = f"geo:{address.lower()}"
    cached = redis_client.get(cache_key)
    if cached:
        return tuple(json.loads(cached))

    params = {"q": address, "format": "json", "addressdetails": 1}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(NOMINATIM_URL + "search", params=params, headers=HEADERS)
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        logger.error(f"Nominatim API returned HTTP {e.response.status_code} for '{address}'")
        raise ValueError(f"Nominatim API error: {e.response.status_code}. Please try again later.")
    except httpx.RequestError as e:
        logger.error(f"Nominatim request failed for '{address}': {e}")
        raise ValueError("Failed to contact Nominatim API. Please try again later.")

    data = response.json()
    if not data:
        raise ValueError(f"Address not found: {address}")

    coords = (float(data[0]["lat"]), float(data[0]["lon"]))

    try:
        redis_client.setex(cache_key, 86400, json.dumps(coords))
    except Exception as e:
        logger.warning(f"Failed to cache coordinates for '{address}': {e}")

    return coords


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Compute the Haversine distance between two points on Earth.
    Args:
        lat1, lon1, lat2, lon2 (float): Latitude and Longitude in decimal degrees.

    Returns:
        float: Distance in kilometers.
    """
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return 6371 * c


def history_to_text(row) -> str:
    """Convert a History row to a text string for embedding."""
    return (
        f"Route from {row.source} to {row.destination},"
        f"distance {row.kilometer_distance} km, recorded at {row.created_at}"
    )


def build_user_index(rows: List):
    """
    Build a FAISS index from user history.
    Args:
        rows (List): List of History model rows.
    Returns:
        FAISS index and original texts.
    """
    texts = [history_to_text(r) for r in rows]
    vectors = model.encode(texts)
    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(vectors))
    return index, texts


def search_history(question: str, index: faiss.IndexFlatL2, texts: List[str], k: int = 5) -> List[str]:
    """
    Retrieve most relevant history entries from FAISS index.

    Args:
        question (str): User question.
        index (IndexFlatL2): FAISS index.
        texts (List[str]): Original texts.
        k (int): Top-k results.

    Returns:
        List[str]: Retrieved history strings.
    """
    q_vec = model.encode([question])
    D, I = index.search(np.array(q_vec), k)
    return [texts[i] for i in I[0]]


def build_prompt(
    question: str,
    retrieved_routes: List[str],
    memory: List[Dict]
) -> str:
    """
    Build prompts for LLM call
    """

    # keep only recent turns → token control
    memory = memory[-6:]

    mem_block = "\n".join(
        f"{m['role']}: {m['content']}"
        for m in memory
    )

    ctx_block = "\n".join(retrieved_routes)

    return (
        "You are a route history assistant.\n"
        "Answer ONLY using provided route records.\n"
        "If data missing — say you don't know.\n"
        "Keep answers under 3 sentences.\n"
        "Do not explain reasoning.\n\n"
        "If data is insufficient, say so\n"

        f"Conversation:\n{mem_block}\n\n"
        f"Route records:\n{ctx_block}\n\n"
        f"Answer ONLY using this data.\n"
        "If unsure, say you don't know.\n\n"
        f"Question:\n{question}"
    )


def call_llm(prompt: str) -> str:
    """Call the LLM to answer a question. 
    Returns fallback string on failure."""
    
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
        logger.error(f"LLM error: {e}")
        return "Sorry — I could not analyze the history right now."



def save_memory(user_id: str, session_id: str, role: str,
    content: str
):
    """Save a message to chat memory, keeping last MAX_MEMORY entries."""
    user_bucket = chat_memory_store.setdefault(user_id, {})
    session_bucket = user_bucket.setdefault(session_id, [])

    session_bucket.append({
        "role": role,
        "content": content,
        "ts": datetime.utcnow().isoformat()
    })

    # trim window
    user_bucket[session_id] = session_bucket[-MAX_MEMORY:]


def load_memory(user_id: str, session_id: str
) -> List[Dict]:
    """Load chat memory for a user."""
    return chat_memory_store.get(user_id, {}).get(session_id, [])

