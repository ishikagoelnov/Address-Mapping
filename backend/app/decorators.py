from functools import wraps
from fastapi import HTTPException
from app.config import redis_client

def throttle(limit: int = 10, window: int=60):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get("current_user")
            if not current_user:
                return await func(*args, **kwargs)
            
            key = f'rate:{current_user.id}'
            count = redis_client.incr(key)

            if count == 1:
                redis_client.expire(key, window)

            if count > limit:
                raise HTTPException(
                    status_code=429, 
                    detail="Rate limit exceeded. Try After sometime."
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator