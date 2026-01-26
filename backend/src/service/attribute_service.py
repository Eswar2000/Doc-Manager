from typing import Optional, Literal
from src.model.templates import Template
from src.repository.attribute_repository import AttributeRepository
from src.model.attributes import AttributeCreateRequest, Attribute

class AttributeService:
    def __init__(self, repo: AttributeRepository):
        self.repo = repo

    async def create_new_attribute(self, request: AttributeCreateRequest) -> Attribute:
        return await self.repo.create_attribute(request)