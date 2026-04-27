from typing import Optional
from src.repository.attribute_repository import AttributeRepository
from src.model.common import User
from src.model.attributes import AttributeCreateRequest, Attribute, AttributeType, AttributeUpdateRequest

class AttributeService:
    def __init__(self, repo: AttributeRepository):
        self.repo = repo

    async def create_new_attribute(self, request: AttributeCreateRequest, current_user: User, tenant_id: str) -> Attribute:
        return await self.repo.create_attribute(request, current_user, tenant_id)
    
    async def list_attributes(self, name_contains: Optional[str] = None, desc_contains: Optional[str] = None, type: Optional[AttributeType] = None, limit: int = 50, offset: int = 0) -> list[Attribute]:
        return await self.repo.list_attribute(name_contains, desc_contains, type, limit, offset)
    
    async def get_attribute_by_id(self, attribute_id: str) -> Optional[Attribute]:
        return await self.repo.get_attribute_by_id(attribute_id)
    
    async def delete_attribute_by_id(self, attribute_id: str) -> bool:
        return await self.repo.delete_attribute_by_id(attribute_id)
    
    async def update_attribute(self, attribute_id: str, data: AttributeUpdateRequest, current_user: User, tenant_id: str) -> Attribute:
        return await self.repo.update_attribute(attribute_id, data, current_user, tenant_id)
    
    async def filter_attributes_by_tenant(self, attribute_ids: list[str], tenant_id: Optional[str]) -> list[str]:
        return await self.repo.filter_attributes_by_tenant(attribute_ids, tenant_id)