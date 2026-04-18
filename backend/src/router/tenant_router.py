from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from src.utils.auth_utils import get_current_user
from src.repository.tenant_repository import TenantRepository
from src.service.tenant_service import TenantService
from src.model.tenants import TenantCreateRequest, TenantResponse, Tenant, TenantRole, TenantUpdateRequest, TenantAddMemberRequest

router = APIRouter(prefix="/tenants", tags=["tenants"], responses={500: {"description": "Internal Server Error"}})

async def get_tenant_service():
    repo = TenantRepository()
    return TenantService(repo)

@router.post(
    "/",
    response_model=TenantResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new tenant",
    responses={
        201: {"description": "Tenant created successfully"},
        400: {"description": "Validation error"},
        422: {"description": "Pydantic validation error"}
    }
)
async def create_tenant(payload: TenantCreateRequest, current_user: dict = Depends(get_current_user), service: TenantService = Depends(get_tenant_service)):
    print("Create tenant endpoint called")
    try:
        created_tenant = await service.create_new_tenant(payload, current_user)
        print("Create tenant endpoint: Tenant created successfully")
        return created_tenant
    except HTTPException as e:
        print("Create tenant endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Create tenant endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during tenant creation", "error": str(e)})

@router.get(
    "/my",
    response_model=List[Tenant],
    summary="List my tenants",
    responses={200: {"description": "List of my tenants"}}
)
async def list_my_tenants(current_user: dict = Depends(get_current_user), service: TenantService = Depends(get_tenant_service)):
    print("List my tenants endpoint called")
    try:
        tenant = await service.list_my_tenants(current_user)
        print(f"List my tenants endpoint: Retrieved {len(tenant)} tenants")
        return tenant
    except HTTPException as e:
        print("List my tenants endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("List my tenants endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during listing tenants", "error": str(e)})

@router.get(
    "/{tenant_id}",
    response_model=TenantResponse,
    summary="Get a tenant by ID",
    responses={
        200: {"description": "Tenant retrieved successfully"},
        404: {"description": "Tenant not found"}
    }
)
async def get_tenant_by_id(tenant_id: str, service: TenantService = Depends(get_tenant_service)):
    print("Get tenant endpoint called")
    try:
        tenant = await service.get_tenant_by_id(tenant_id)
        if tenant:
            print("Get tenant endpoint: Tenant retrieved successfully")
            return tenant
        else:
            print("Get tenant endpoint: Tenant not found")
            raise HTTPException(status_code=404, detail="Tenant not found")
    except HTTPException as e:
        print("Get tenant endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Get tenant endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during tenant retrieval", "error": str(e)})
    
@router.get(
    "/",
    response_model=List[Tenant],
    summary="List tenants with filters",
    responses={200: {"description": "List of tenants"}}
)
async def list_tenants(name: Optional[str] = None, desc: Optional[str] = None, status: Optional[bool] = None, limit: int = 50, offset: int = 0, service: TenantService = Depends(get_tenant_service)):
    print("List tenants endpoint called")
    try:
        tenants = await service.list_tenants(name_contains=name, desc_contains=desc, status=status, limit=limit, offset=offset)
        print(f"List tenants endpoint: Retrieved {len(tenants)} tenants")
        return tenants
    except HTTPException as e:
        print("List tenants endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("List tenants endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during listing tenants", "error": str(e)})
    
@router.put(
    "/{tenant_id}",
    response_model=TenantResponse,
    summary="Update a tenant's basic information",
    responses={
        200: {"description": "Basic information of the tenant updated successfully"},
        404: {"description": "Tenant not found"},
    }
)
async def update_tenant(tenant_id: str, payload: TenantUpdateRequest, service: TenantService = Depends(get_tenant_service)):
    print("Update tenant endpoint called")
    try:
        updated_tenant = await service.update_tenant(tenant_id, payload)
        print("Update tenant endpoint: Tenant updated successfully")
        return updated_tenant
    except HTTPException as e:
        print("Update tenant endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Update tenant endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during tenant update", "error": str(e)})
    
@router.post(
    "/{tenant_id}/members",
    response_model=TenantResponse,
    summary="Add a member to a tenant",
    responses={
        200: {"description": "Member added to tenant successfully"},
        400: {"description": "User is already a member of the tenant"},
        404: {"description": "Tenant not found"}
    }
)
async def add_member_to_tenant(tenant_id: str, payload: TenantAddMemberRequest, service: TenantService = Depends(get_tenant_service)):
    print("Add member to tenant endpoint called")
    try:
        updated_tenant = await service.add_member_to_tenant(tenant_id, payload.new_member, payload.roles)
        print("Add member to tenant endpoint: Member added successfully")
        return updated_tenant
    except HTTPException as e:
        print("Add member to tenant endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Add member to tenant endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during adding member to tenant", "error": str(e)})
    
@router.delete(
    "/{tenant_id}/members/{member_id}",
    response_model=TenantResponse,
    summary="Remove a member from a tenant",
    responses={
        200: {"description": "Member removed from tenant successfully"},
        400: {"description": "User is not a member of the tenant"},
        403: {"description": "Cannot remove the last admin from the tenant"},
        404: {"description": "Tenant not found"}
    }
)
async def remove_member_from_tenant(tenant_id: str, member_id: str, service: TenantService = Depends(get_tenant_service)):
    print("Remove member from tenant endpoint called")
    try:
        updated_tenant = await service.remove_member_from_tenant(tenant_id, member_id)
        print("Remove member from tenant endpoint: Member removed successfully")
        return updated_tenant
    except HTTPException as e:
        print("Remove member from tenant endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Remove member from tenant endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during removing member from tenant", "error": str(e)})