from typing import Optional, Literal
from src.repository.attribute_repository import AttributeRepository
from src.model.attributes import AttributeCreateRequest, Attribute, AttributeType

class AttributeService:
    def __init__(self, repo: AttributeRepository):
        self.repo = repo

    async def create_new_attribute(self, request: AttributeCreateRequest) -> Attribute:
        return await self.repo.create_attribute(request)
    
    async def list_attributes(self, name_contains: Optional[str] = None, desc_contains: Optional[str] = None, type: Optional[AttributeType] = None, limit: int = 50, offset: int = 0) -> list[Attribute]:
        return await self.repo.list_attribute(name_contains, desc_contains, type, limit, offset)