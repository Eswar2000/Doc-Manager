from fastapi import Depends, Header, HTTPException, status
from src.repository.tenant_repository import TenantRepository
from src.service.tenant_service import TenantService
from src.utils.auth_utils import get_current_user

async def get_tenant_service():
    repo = TenantRepository()
    return TenantService(repo)

async def get_current_tenant_id(x_tenant_id: str = Header(..., alias="X-Tenant-ID"), current_user: dict = Depends(get_current_user), tenant_service: TenantService = Depends(get_tenant_service)) -> str:
    if not x_tenant_id or not x_tenant_id.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="X-Tenant-ID header is required and cannot be empty")
    
    tenant = await tenant_service.get_tenant_by_id(x_tenant_id.strip())

    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tenant with ID {x_tenant_id} not found")

    # TODO: Implement permission checks for the user against the tenant here

    if not tenant.isActive:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Tenant with ID {x_tenant_id} is not active")

    return x_tenant_id.strip()
    