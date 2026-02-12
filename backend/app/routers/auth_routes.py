from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin
from app.auth import hash_password, verify_password, create_access_token
import logging

router = APIRouter(prefix="/auth", tags=["auth"])


log = logging.getLogger(__name__)


@router.post("/signup")
def signup(payload: UserCreate, db: Session=Depends(get_db)):
    log.info(f"Payload is {payload}")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=payload.email,
        first_name=payload.first_name,
        last_name=payload.last_name,
        password=hash_password(payload.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session=Depends(get_db)):
    email = form_data.username
    password = form_data.password
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    token = create_access_token({"user_id": user.id})
    return {
        "access_token": token,
        "token_type": "bearer"
    }
