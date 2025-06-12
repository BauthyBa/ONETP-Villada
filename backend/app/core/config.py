from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tour Packages API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "tourpackages"
    POSTGRES_PASSWORD: str = "tourpackages123"
    POSTGRES_DB: str = "tourpackages_db"

    def get_database_url(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    # JWT
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Email - SendGrid
    SENDGRID_API_KEY: Optional[str] = None
    EMAILS_FROM_EMAIL: str = "noreply@tourpackages.com"
    EMAILS_FROM_NAME: str = "Tour Packages - Olimpíada ETP 2025"
    
    # Email templates
    EMAILS_ENABLED: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 