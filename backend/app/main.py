from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import *
from app.routers import nominatim, auth_routes

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_routes.router)
app.include_router(nominatim.router)

@app.get("/")
async def root():
    return {"message": "Welcome to my FastAPI app!"}