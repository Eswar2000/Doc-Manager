from typing import Optional, List
from src.repository.tenant_repository import TenantRepository
from src.model.tenants import TenantCreateRequest, Tenant, TenantRole, TenantUpdateRequest

class TenantService:
    def __init__(self, repo: TenantRepository):
        self.repo = repo

    async def create_new_tenant(self, request: TenantCreateRequest, current_user: dict) -> Tenant:
        return await self.repo.create_tenant(request, current_user)
    
    async def get_tenant_by_id(self, tenant_id: str) -> Optional[Tenant]:
        return await self.repo.get_tenant_by_id(tenant_id)
    
    async def list_tenants(self, name_contains: Optional[str] = None, desc_contains: Optional[str] = None, status: Optional[bool] = None, limit: int = 50, offset: int = 0) -> list[Tenant]:
        return await self.repo.list_tenants(name_contains, desc_contains, status, limit, offset)
    
    async def list_my_tenants(self, current_user: dict) -> List[Tenant]:
        return await self.repo.list_my_tenants(current_user)
    
    async def update_tenant(self, tenant_id: str, request: TenantUpdateRequest) -> Tenant:
        return await self.repo.update_tenant(tenant_id, request)
    
    async def add_member_to_tenant(self, tenant_id: str, new_member: str, roles: Optional[List[TenantRole]] = None) -> Tenant:
        return await self.repo.add_member_to_tenant(tenant_id, new_member, roles)