NOMINATIM_URL = "https://nominatim.openstreetmap.org/"
HEADERS = {"User-Agent": "FastAPI-Nominatim-App"}
MAX_MEMORY = 10
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
CACHE_TTL = 900 

# Used for debug purpose
MOCK_COORDS = {
    "source": (28.6139, 77.2090),
    "destination": (52.542, 13.366)
}

