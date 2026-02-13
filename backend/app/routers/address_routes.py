import pickle
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict

from app.database import get_db
from app.auth import get_current_user
from app.config import redis_client
from app.models import History
from app.schemas import DistanceRequest, HistoryChatRequest
from app.service import (
    get_coordinates, haversine_distance,
    build_user_index, search_history,
    build_prompt, call_llm,
    save_memory, load_memory
)
from app.decorators import throttle
from app.config import settings
from app.constants import MOCK_COORDS, CACHE_TTL
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/routes", tags=["routes"])


@router.post("/distance", response_model=Dict)
@throttle(limit=10, window=60)
async def distance_between_addresses(
    payload: DistanceRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Fetch the distance between source and destination in kilometer and
    miles using nominatim open source api.
    """
    try:
        # Get coordinates
        if settings.debug:
            lat1, lon1 = MOCK_COORDS.get("source")
            lat2, lon2 = MOCK_COORDS.get("destination")
        else:
            lat1, lon1 = await get_coordinates(payload.source)
            lat2, lon2 = await get_coordinates(payload.destination)

        distance_km = haversine_distance(lat1, lon1, lat2, lon2)
        distance_miles = distance_km * 0.621371

        # Save history
        try:
            history = History(
                source=payload.source,
                destination=payload.destination,
                kilometer_distance=round(distance_km, 2),
                mile_distance=round(distance_miles, 2),
                user_id=current_user.id
            )
            db.add(history)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning(f"Failed to save history: {e}")

        return {
            "success": True,
            "source": payload.source,
            "destination": payload.destination,
            "unit": payload.unit,
            "distance_km": round(distance_km, 2),
            "distance_miles": round(distance_miles, 2)
        }

    except Exception as e:
        logger.exception(f"Distance calculation failed: Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate distance")



@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    offset: int = Query(0, ge=0, description="Start index"),
    limit: int = Query(10, gt=0, le=100, description="Number of records to fetch"),
):
    """
    Fetch paginated history for the current user.
    """
    try:
        base_query = db.query(History).filter(
            History.user_id == current_user.id
        )

        total = base_query.count()

        histories = (
            base_query
            .order_by(History.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        data = [
            {
                "source": h.source,
                "destination": h.destination,
                "distance_km": h.kilometer_distance,
                "distance_miles": h.mile_distance
            }
            for h in histories
        ]

        return {
            "total": total,
            "items": data
        }
    except Exception as e:
        logger.exception(f"Fetching history failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve history")


@router.post("/history-insights")
def history_insights(
    req: HistoryChatRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
        Fetches the history related insights and answer the user queries 
        using the past data.
    """
    try:
        cache_key = f"history_rag:{current_user.id}:{req.session_id}"
        index, texts = None, None
        cached_blob = redis_client.get(cache_key)

        if cached_blob:
            try:
                index, texts = pickle.loads(cached_blob)
            except Exception as e:
                logger.warning(f"Cache decode failed — rebuilding index: {e}")
                cached_blob = None

        # Handle cache miss
        if not cached_blob:
            rows = (
                db.query(History)
                .filter(History.user_id == current_user.id)
                .limit(500)
                .all()
            )

            if not rows:
                return {
                    "success": True,
                    "answer": "You don't have any route history yet.",
                    "retrieved_context": []
                }

            index, texts = build_user_index(rows)

            redis_client.setex(
                cache_key,
                CACHE_TTL,
                pickle.dumps((index, texts))
            )

        retrieved = search_history(req.question, index, texts, k=5)

        # refresh TTL on follow-up queries
        redis_client.expire(cache_key, CACHE_TTL)

        # load chat memory
        memory = load_memory(current_user.id, req.session_id)
        prompt = build_prompt(
            question=req.question,
            retrieved_routes=retrieved,
            memory=memory
        )
        answer = call_llm(prompt)

        # save memory
        save_memory(current_user.id, req.session_id, "user", req.question)
        save_memory(current_user.id, req.session_id, "assistant", answer)

        return {
            "success": True,
            "answer": answer,
            "retrieved_context": retrieved
        }

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        logger.exception(f"History-insights failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process history insights"
        )
