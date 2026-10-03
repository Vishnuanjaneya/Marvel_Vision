from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.websocket_routes import (
    router as websocket_router,
)


app = FastAPI(
    title="Marvel Vision API",
    description="Computer Vision powered superhero experience",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    websocket_router,
)


@app.get("/")
def root():

    return {
        "application": "Marvel Vision",
        "status": "online",
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
    }