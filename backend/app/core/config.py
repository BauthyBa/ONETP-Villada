import os
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v: str) -> str:
        if not v:
            raise ValueError("SECRET_KEY environment variable is required")
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        if v == "change-me-in-production":
            raise ValueError("SECRET_KEY must be changed from default value")
        return v
    
    # Database
    DATABASE_URL: Optional[PostgresDsn] = None

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        # Fallback for local development
        return "postgresql://postgres:postgres@localhost:5432/tour_packages_db"

    # CORS - Allow common origins for development and production
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        # Default CORS origins for development and production
        return [
            "http://localhost:3000",
            "http://localhost:8000", 
            "https://localhost:3000",
            "https://localhost:8000",
            # Add your Vercel domains here when deployed
        ]

    PROJECT_NAME: str = "Tour Packages API - ONIET 2025"
    
    # Algorithm for JWT
    ALGORITHM: str = "HS256"

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings() 