from src.repository.tenant_repository import TenantRepository
from src.model.tenants import TenantCreateRequest, Tenant

class TenantService:
    def __init__(self, repo: TenantRepository):
        self.repo = repo

    async def create_new_tenant(self, request: TenantCreateRequest, current_user: dict) -> Tenant:
        return await self.repo.create_tenant(request, current_user)