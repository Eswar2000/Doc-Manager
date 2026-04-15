from fastapi import APIRouter, Depends, HTTPException, status
from src.utils.auth_utils import get_current_user
from src.repository.tenant_repository import TenantRepository
from src.service.tenant_service import TenantService
from src.model.tenants import TenantCreateRequest, TenantResponse

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