from fastapi import APIRouter, Depends, HTTPException, Response, status
from src.repository.attribute_repository import AttributeRepository
from src.service.attribute_service import AttributeService
from src.model.common import User
from src.model.attributes import AttributeCreateRequest, AttributeFilterByTenantRequest, AttributeResponse, Attribute, AttributeType, AttributeUpdateRequest
from src.utils.auth_utils import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/attributes", tags=["attributes"], responses={500: {"description": "Internal Server Error"}})

async def get_attribute_service():
    repo = AttributeRepository()
    return AttributeService(repo)

@router.post(
    "/",
    response_model=AttributeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new attribute",
    responses={
        201: {"description": "Attribute created successfully"},
        400: {"description": "Validation error"},
        422: {"description": "Pydantic validation error"}
    }
)
async def create_attribute(payload: AttributeCreateRequest, current_user: User = Depends(get_current_user), service: AttributeService = Depends(get_attribute_service)):
    print("Create attribute endpoint called")
    try:
        created_attribute = await service.create_new_attribute(payload, current_user)
        print("Create attribute endpoint: Attribute created successfully")
        return created_attribute
    except HTTPException as e:
        print("Create attribute endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Create attribute endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during attribute creation", "error": str(e)})
    
@router.get(
    "/",
    response_model=List[Attribute],
    summary="List attributes with filters",
    responses={200: {"description": "List of attributes"}}
)
async def list_attributes(name: Optional[str] = None, desc: Optional[str] = None, type: Optional[AttributeType] = None, limit: int = 50, offset: int = 0, service: AttributeService = Depends(get_attribute_service)):
    print("List attributes endpoint called")
    try:
        attributes = await service.list_attributes(name_contains=name, desc_contains=desc, type=type, limit=limit, offset=offset)
        print(f"List attributes endpoint: Retrieved {len(attributes)} attributes")
        return attributes
    except HTTPException as e:
        print("List attributes endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("List attributes endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during listing attributes", "error": str(e)})
    
@router.get(
    "/{attribute_id}",
    response_model=AttributeResponse,
    summary="Get an attribute by ID",
    responses={
        200: {"description": "Attribute retrieved successfully"},
        404: {"description": "Attribute not found"}
    }
)
async def get_attribute_by_id(attribute_id: str, service: AttributeService = Depends(get_attribute_service)):
    print("Get attribute endpoint called")
    try:
        attribute = await service.get_attribute_by_id(attribute_id)
        if attribute:
            print("Get attribute endpoint: Attribute retrieved successfully")
            return attribute
        else:
            print("Get attribute endpoint: Attribute not found")
            raise HTTPException(status_code=404, detail="Attribute not found")
    except HTTPException as e:
        print("Get attribute endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Get attribute endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during attribute retrieval", "error": str(e)})
    
@router.delete(
    "/{attribute_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an attribute by ID",
    responses={
        204: {"description": "Attribute deleted successfully"},
        404: {"description": "Attribute not found"},
        500: {"description": "Unexpected server error"}
    }
)
async def delete_attribute(attribute_id: str, service: AttributeService = Depends(get_attribute_service)):
    print(f"Delete attribute endpoint called for ID: {attribute_id}")

    deleted = await service.delete_attribute_by_id(attribute_id)

    if not deleted:
        print(f"Delete attribute endpoint: Attribute not found: {attribute_id}")
        raise HTTPException(status_code=404, detail="Attribute not found")

    print(f"Delete attribute endpoint: Successfully deleted attribute {attribute_id}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.put(
    "/{attribute_id}",
    response_model=AttributeResponse,
    summary="Update an attribute",
    responses={
        200: {"description": "Attribute updated successfully"},
        404: {"description": "Attribute not found"},
        500: {"description": "Unexpected server error"}
    }
)
async def update_attribute(attribute_id: str, payload: AttributeUpdateRequest, service: AttributeService = Depends(get_attribute_service)):
    print("Update attribute endpoint called")
    try:
        updated_attribute = await service.update_attribute(attribute_id, payload)
        print("Update attribute endpoint: Attribute updated successfully")
        return updated_attribute
    except HTTPException as e:
        print("Update attribute endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Update attribute endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during attribute update", "error": str(e)})
    
@router.post(
    "/filter-by-tenant",
    response_model=List[str],
    summary="Filter attribute IDs by tenant",
    responses={
        200: {"description": "Filtered attributes successfully successfully"},
        422: {"description": "Pydantic validation error"},
        500: {"description": "Unexpected server error"}
    }
)
async def filter_attributes_by_tenant(request: AttributeFilterByTenantRequest, service: AttributeService = Depends(get_attribute_service)):
    print("Filter attribute by tenant endpoint called")
    try:
        filtered = await service.filter_attributes_by_tenant(attribute_ids=request.attributeIds, tenant_id=request.tenantId)
        print("Filter attribute by tenant endpoint: Attributes filtered successfully")
        return filtered
    except HTTPException as e:
        print("Filter attribute by tenant endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Filter attribute by tenant endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during attribute filtering", "error": str(e)})