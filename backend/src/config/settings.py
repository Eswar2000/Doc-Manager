from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_PATH = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    cosmos_connection_string: str
    cosmos_database_name: str = "doc-manager"
    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

settings = Settings()