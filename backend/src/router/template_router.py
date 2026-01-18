from fastapi import APIRouter, Depends, HTTPException, status
from src.repository.template_repository import TemplateRepository
from src.service.template_service import TemplateService
from src.model.templates import TemplateCreateRequest, TemplateResponse

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