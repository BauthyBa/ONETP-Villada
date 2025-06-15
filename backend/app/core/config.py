import os
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://tourpackages:tourpackages123@localhost:5432/tourpackages_db")

    # CORS - Allow common origins for development and production
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000", 
        "https://localhost:3000",
        "https://localhost:8000",
    ]

    PROJECT_NAME: str = "Tour Packages API - ONIET 2025"
    
    # Algorithm for JWT
    ALGORITHM: str = "HS256"
    
    # Email settings
    SENDGRID_API_KEY: Optional[str] = os.getenv("SENDGRID_API_KEY")
    EMAILS_ENABLED: bool = os.getenv("EMAILS_ENABLED", "false").lower() == "true"
    EMAILS_FROM_EMAIL: str = os.getenv("EMAILS_FROM_EMAIL", "noreply@tourpackages.com")
    EMAILS_FROM_NAME: str = os.getenv("EMAILS_FROM_NAME", "Tour Packages")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"  # Allow extra fields from .env


settings = Settings() 