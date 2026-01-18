from typing import Optional
from azure.cosmos.aio import CosmosClient
from fastapi import FastAPI

from src.config.settings import settings

_client: Optional[CosmosClient] = None

async def get_cosmos_client() -> CosmosClient:
    """
    Returns the shared CosmosClient instance (lazy initialization).
    Recommended way for most FastAPI + Cosmos applications.
    """
    global _client

    if _client is None:
        _client = CosmosClient.from_connection_string(settings.cosmos_connection_string,)
    return _client


async def get_database():
    client = await get_cosmos_client()
    return client.get_database_client(settings.cosmos_database_name)


async def get_container(container_name: str = "templates"):
    db = await get_database()
    return db.get_container_client(container_name)


def init_cosmos_client(app: FastAPI):
    @app.on_event("startup")
    async def startup_event():
        await get_cosmos_client()

    @app.on_event("shutdown")
    async def shutdown_event():
        global _client
        if _client is not None:
            await _client.close()
            _client = None