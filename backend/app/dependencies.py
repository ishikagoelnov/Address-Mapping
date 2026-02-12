from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.auth import ALGORITHM, SECRET_KEY
from app.models import User
from app.database import get_db

oauth2_scheme  = OAuth2PasswordBearer(tokenUrl='/auth/login')
def get_current_user(
    token: str=Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get('user_id')
        if user_id is None:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401)
    
    return user
