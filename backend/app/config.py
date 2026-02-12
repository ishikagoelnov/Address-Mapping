import redis
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    database_url: str
    debug: bool = False
    cors_origins: str = ""
    groq_api_key: str

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        extra="ignore",
    )

    @property
    def cors_allow_origins(self) -> list[str]:
        if not self.cors_origins:
            return []
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True
)