from fastapi import APIRouter, Depends, HTTPException, status
from src.repository.template_repository import TemplateRepository
from src.service.template_service import TemplateService
from src.model.templates import TemplateCreateRequest, TemplateResponse, Template, TemplateVersionInfo
from typing import List, Optional, Literal

router = APIRouter(prefix="/templates", tags=["templates"], responses={500: {"description": "Internal Server Error"}})

async def get_template_service():
    repo = TemplateRepository()
    return TemplateService(repo)


@router.post(
    "/",
    response_model=TemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new template",
    responses={
        201: {"description": "Template created successfully"},
        400: {"description": "Validation error"},
        422: {"description": "Pydantic validation error"}
    }
)
async def create_template(payload: TemplateCreateRequest, service: TemplateService = Depends(get_template_service)):
    print("Create template endpoint called")
    try:
        created_template = await service.create_new_template(payload)
        print("Create template endpoint: Template created successfully")
        return created_template
    except HTTPException as e:
        print("Create template endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Create template endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during template creation", "error": str(e)})
    
@router.get(
    "/{template_id}",
    response_model=TemplateResponse,
    summary="Get a template by ID",
    responses={
        200: {"description": "Template retrieved successfully"},
        404: {"description": "Template not found"}
    }
)
async def get_template_by_id(template_id: str, service: TemplateService = Depends(get_template_service)):
    print("Get template endpoint called")
    try:
        template = await service.get_template_by_id(template_id)
        if template:
            print("Get template endpoint: Template retrieved successfully")
            return template
        else:
            print("Get template endpoint: Template not found")
            raise HTTPException(status_code=404, detail="Template not found")
    except HTTPException as e:
        print("Get template endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Get template endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during template retrieval", "error": str(e)})
    
@router.get(
    "/",
    response_model=List[Template],
    summary="List templates with filters",
    responses={200: {"description": "List of templates"}}
)
async def list_templates(name: Optional[str] = None, desc: Optional[str] = None, state: Optional[Literal["active", "archived"]] = None, limit: int = 50, offset: int = 0, service: TemplateService = Depends(get_template_service)):
    print("List templates endpoint called")
    try:
        templates = await service.list_templates(name_contains=name, desc_contains=desc, state=state, limit=limit, offset=offset)
        print(f"List templates endpoint: Retrieved {len(templates)} templates")
        return templates
    except HTTPException as e:
        print("List templates endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("List templates endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during listing templates", "error": str(e)})
    
@router.put(
    "/{template_id}",
    response_model=TemplateResponse,
    summary="Update a template (creates a new version and archives the old one)",
    responses={
        200: {"description": "New active version created successfully"},
        400: {"description": "Only active templates can be updated"},
        404: {"description": "Template not found"},
    }
)
async def update_template(template_id: str, payload: TemplateCreateRequest, service: TemplateService = Depends(get_template_service)):
    print("Update template endpoint called")
    try:
        updated_template = await service.update_template(template_id, payload)
        print("Update template endpoint: Template updated successfully")
        return updated_template
    except HTTPException as e:
        print("Update template endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Update template endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during template update", "error": str(e)})
    
@router.get(
    "/{template_id}/versions",
    response_model=List[TemplateVersionInfo],
    summary="Get version history of a template",
    responses={
        200: {"description": "Version history retrieved successfully"},
        404: {"description": "Template not found"},
    }
)
async def get_version_history(template_id: str, service: TemplateService = Depends(get_template_service)):
    print("Get version history endpoint called")
    try:
        version_history = await service.get_version_history(template_id)
        print(f"Get version history endpoint: Retrieved {len(version_history)} versions")
        return version_history
    except HTTPException as e:
        print("Get version history endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Get version history endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during retrieving version history", "error": str(e)})