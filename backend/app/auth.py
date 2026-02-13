from datetime import datetime, timedelta
import hashlib
from typing import Dict

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.models import User
from app.database import get_db
from app.constants import ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def _sha256(password: str) -> bytes:
    """Compute SHA256 digest of a string."""
    return hashlib.sha256(password.encode("utf-8")).digest()


def hash_password(password: str) -> str:
    """
    Hash a password using SHA256 + bcrypt.

    Args:
        password (str): Plain password

    Returns:
        str: Hashed password
    """
    return pwd_context.hash(_sha256(password))


def verify_password(password: str, hashed: str) -> bool:
    """
    Verify a plain password against the hashed value.

    Args:
        password (str): Plain password
        hashed (str): Hashed password

    Returns:
        bool: True if match, False otherwise
    """
    return pwd_context.verify(_sha256(password), hashed)


def create_access_token(data: Dict) -> str:
    """
    Create a JWT access token.

    Args:
        data (dict): Payload data to include in token

    Returns:
        str: Encoded JWT
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)
    return token


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the currently authenticated user from JWT token.

    Raises:
        HTTPException: 401 if token is invalid or user not found
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user