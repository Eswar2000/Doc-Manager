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