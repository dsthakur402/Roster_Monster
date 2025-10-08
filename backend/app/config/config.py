from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    # Database settings
    database_hostname: str = "localhost"
    database_username: str = "root"
    database_password: str = ""
    database_port: int = 3306
    database_name: str = "roster_monster"
    DATABASE_URL: Optional[str] = None
    
    # Security settings
    secret_key: str = secrets.token_urlsafe(32)
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # Redis settings
    redis_host: str = "localhost"
    redis_port: int = 6379
    
    # External services
    OPENAI_API_KEY: Optional[str] = None
    
    # Application settings
    app_name: str = "Roster Monster API"
    debug: bool = False
    version: str = "1.0.0"
    
    # CORS settings
    allowed_origins: list = ["*"]
    allowed_methods: list = ["*"]
    allowed_headers: list = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Generate DATABASE_URL if not provided
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"mysql+mysqlconnector://{self.database_username}:"
                f"{self.database_password}@{self.database_hostname}:"
                f"{self.database_port}/{self.database_name}"
            )


settings = Settings()