from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # PayPal Config
    PAYPAL_CLIENT_ID: str
    PAYPAL_CLIENT_SECRET: str
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"
    
    # AI Config
    GEMINI_API_KEY: Optional[str] = None # No longer required
    GROQ_API_KEY: str # Required for our new setup
    TAVILY_API_KEY: str


    # Database Config
    DATABASE_URL: str
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings() -> Settings:
    return Settings()