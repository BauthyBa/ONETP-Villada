from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://localhost:3000", 
    "https://localhost:8000",
    # Add your Vercel deployment URL here when ready
    # "https://your-app.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "🌎 Tour Packages API - ONIET 2025",
        "status": "✅ API is running",
        "docs": "/docs",
        "api": settings.API_V1_STR,
        "health": "/health"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "tour-packages-api",
        "version": "1.0.0"
    } 