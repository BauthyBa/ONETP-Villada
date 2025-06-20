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

    # CORS - Allow all origins in production
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    PROJECT_NAME: str = "Tour Packages API - ONIET 2025"
    
    # Algorithm for JWT
    ALGORITHM: str = "HS256"
    
    # Email settings
    EMAILS_ENABLED: bool = True
    EMAILS_FROM_EMAIL: str = "barberogaticabautista@gmail.com"  # Your Gmail address
    EMAILS_FROM_PASSWORD: str = ""  # Your Gmail app password
    EMAILS_FROM_NAME: str = "ONIET"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"  # Allow extra fields from .env
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str) -> Any:
            if field_name == 'BACKEND_CORS_ORIGINS' and raw_val:
                if raw_val == "*":
                    return ["*"]
                return [origin.strip() for origin in raw_val.split(",")]
            return cls.json_loads(raw_val)


settings = Settings() 