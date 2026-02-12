from datetime import datetime, timedelta
import hashlib
from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = "super-secret-key"   # move to env later
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def _sha256(password: str):
    return hashlib.sha256(password.encode("utf-8")).digest()

def hash_password(password:str):
    return pwd_context.hash(_sha256(password))

def verify_password(password, hashed):
    return pwd_context.verify(_sha256(password), hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)