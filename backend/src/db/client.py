from contextlib import asynccontextmanager
from azure.cosmos.aio import CosmosClient
from azure.cosmos import PartitionKey
from fastapi import FastAPI
from src.config.settings import settings

@asynccontextmanager
async def get_cosmos_client() -> CosmosClient:
    client = CosmosClient.from_connection_string(settings.COSMOS_DB_CONNECTION_STRING)
    try:
        yield client
    finally:
        await client.close()
    
async def get_database(client: CosmosClient):
    return client.get_database_client(id=settings.COSMOS_DB_DATABASE_NAME)

async def get_container(client: CosmosClient, container_name: str):
    database = await get_database(client)
    return database.get_container_client(container_name)
