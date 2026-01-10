from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    cosmos_connection_string: str
    cosmos_database_name: str = "doc-manager"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

settings = Settings()