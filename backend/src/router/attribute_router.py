from fastapi import APIRouter, Depends, HTTPException, status
from src.repository.attribute_repository import AttributeRepository
from src.service.attribute_service import AttributeService
from src.model.attributes import AttributeCreateRequest, AttributeResponse, Attribute
from typing import List, Optional, Literal

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
async def create_attribute(payload: AttributeCreateRequest, service: AttributeService = Depends(get_attribute_service)):
    print("Create attribute endpoint called")
    try:
        created_attribute = await service.create_new_attribute(payload)
        print("Create attribute endpoint: Attribute created successfully")
        return created_attribute
    except HTTPException as e:
        print("Create attribute endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Create attribute endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during attribute creation", "error": str(e)})