from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings
from sentence_transformers import SentenceTransformer

engine = create_engine(
    settings.database_url, pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# Vector database
model = SentenceTransformer("all-MiniLM-L6-v2")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()