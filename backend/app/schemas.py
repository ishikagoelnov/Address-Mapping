from pydantic import BaseModel, EmailStr
from enum import Enum
from pydantic import BaseModel

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class DistanceUnit(str, Enum):
    kilometers = "kilometers"
    miles = "miles"
    both = "both"

class DistanceRequest(BaseModel):
    source: str
    destination: str
    unit: DistanceUnit

class HistoryChatRequest(BaseModel):
    question: str