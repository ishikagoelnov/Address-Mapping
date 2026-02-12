import asyncio
from sqlalchemy.orm import Session
from typing import Dict
from fastapi import APIRouter, Depends, HTTPException, Query
import httpx
from app.constants import *
from app.database import get_db
from app.decorators import throttle
from app.dependencies import get_current_user
from app.models import History
from app.service import build_prompt, build_user_index, call_llm, get_coordinates, haversine_distance, load_memory, save_memory, search_history
from app.schemas import DistanceRequest, HistoryChatRequest
import logging
from app.config import settings
import json
from app.config import redis_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix='/nominatim',
    tags=["nominatim"]
)

@router.post('/distance', response_model=Dict)
@throttle(limit=10, window=60)
async def distance_between_addresses(
    payload: DistanceRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cache_key = f'dist:{payload.source}:{payload.destination}'
    cached_distance_km =  redis_client.get(cache_key)
    if cached_distance_km:
        logger.info(f"{cached_distance_km}, {cache_key}")
        distance_km = float(cached_distance_km)
    else:
        if not settings.debug:
            lat1, lon1 = await get_coordinates(payload.source)
            lat2, lon2 = await get_coordinates(payload.destination)
        else:
            lat1, lon1 = MOCK_COORDS.get('source')
            lat2, lon2 = MOCK_COORDS.get('destination')

        distance_km = haversine_distance(lat1, lon1, lat2, lon2)
        redis_client.setex(
            cache_key, 21600, distance_km
        )
    
    distance_miles = distance_km * 0.621371

    # Store history
    history = History(
        source=payload.source,
        destination=payload.destination,
        kilometer_distance=round(distance_km, 2),
        mile_distance=round(distance_miles, 2),
        user_id=current_user.id,
    )
    db.add(history)
    db.commit()

    return {
        "source": payload.source,
        "destination": payload.destination,
        "unit": payload.unit,
        "distance_km": round(distance_km, 2),
        "distance_miles": round(distance_miles, 2)
    }


@router.get("/history")
def get_history(db: Session = Depends(get_db),
    current_user = Depends(get_current_user)):
    histories = db.query(History).filter(History.user_id == current_user.id)
    response = [
        {
            "source": history.source,
            "destination": history.destination,
            "distance_km": history.kilometer_distance,
            "distance_miles": history.mile_distance
        }
        for history in histories
    ]
    return response

@router.post("/history-insights")
def history_insights(
        req: HistoryChatRequest,
        db: Session=Depends(get_db),
        current_user = Depends(get_current_user)
    ):
    rows = db.query(History).filter(History.user_id==current_user.id).limit(500).all()
    if not rows:
        return {"answer": "You don't have any route history yet."}
    
    index, texts = build_user_index(rows)
    retrieved = search_history(req.question, index, texts, k=5)
    memory = load_memory(current_user.id)
    prompt = build_prompt(req.question, retrieved, memory)
    answer = call_llm(prompt)

    save_memory(current_user.id, "user", req.question)
    save_memory(current_user.id, "assistant", answer)

    return {
        "answer": answer,
        "retrieved_context": retrieved
    }