from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_hostname: str
    database_username: str
    database_password: str
    database_port: int
    database_name: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    redis_host: str
    redis_port: int
    OPENAI_API_KEY: str
    DATABASE_URL: str

    class Config:
        env_file = ".env"


settings = Settings()