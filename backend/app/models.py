from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    first_name=Column(String(200), nullable=False)
    last_name=Column(String(200), nullable=False)
    password = Column(String(250), nullable=False)
    created_at=Column(DateTime, default=datetime.utcnow)
    
    histories = relationship(
        "History", back_populates="user",
        cascade="all, delete-orphan"
    )

class History(Base):
    __tablename__ = 'route_history'
    id = Column(Integer, primary_key=True, index=True)

    source = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)

    mile_distance = Column(Float, nullable=True)
    kilometer_distance = Column(Float, nullable=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    created_at=Column(DateTime, default=datetime.utcnow)
    user = relationship(
        "User", back_populates="histories"
    )
