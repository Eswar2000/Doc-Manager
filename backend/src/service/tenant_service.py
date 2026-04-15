from typing import Optional, List
from src.repository.tenant_repository import TenantRepository
from src.model.tenants import TenantCreateRequest, Tenant

class TenantService:
    def __init__(self, repo: TenantRepository):
        self.repo = repo

    async def create_new_tenant(self, request: TenantCreateRequest, current_user: dict) -> Tenant:
        return await self.repo.create_tenant(request, current_user)
    
    async def get_tenant_by_id(self, tenant_id: str) -> Optional[Tenant]:
        return await self.repo.get_tenant_by_id(tenant_id)
    
    async def list_my_tenants(self, current_user: dict) -> List[Tenant]:
        return await self.repo.list_my_tenants(current_user)