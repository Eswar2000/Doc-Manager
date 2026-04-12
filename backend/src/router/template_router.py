from fastapi import APIRouter, Depends, HTTPException, status, Response
from src.utils.pdf_utils import html_to_pdf_bytes
from src.utils.auth_utils import get_current_user
from src.repository.template_repository import TemplateRepository
from src.service.template_service import TemplateService
from src.model.templates import TemplateCreateRequest, DocumentGenerationRequest, TemplateResponse, Template, TemplateRollbackRequest, TemplateVersionInfo
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
async def update_template(template_id: str, payload: TemplateCreateRequest, current_user: dict = Depends(get_current_user), service: TemplateService = Depends(get_template_service)):
    print("Update template endpoint called")
    try:
        updated_template = await service.update_template(template_id, payload, current_user)
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

@router.post(
    "/rollback",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Rollback to specified version of a template (if exists), else rollback to previous version",
    responses={
        204: {"description": "Template rolled back successfully"},
        400: {"description": "Invalid rollback request"},
        404: {"description": "Template not found"},
        500: {"description": "Unexpected server error"}
    }
)
async def rollback_template_version(request: TemplateRollbackRequest, service: TemplateService = Depends(get_template_service)):
    print(f"Rollback template version endpoint called for ID: {request.srcTemplateId}")

    rolled_back = await service.rollback_template_version(request.srcTemplateId, request.destTemplateId)

    if not rolled_back:
        print(f"Rollback template version endpoint: Template not found: {request.srcTemplateId}")
        raise HTTPException(status_code=404, detail="Template not found")

    print(f"Rollback template version endpoint: Successfully rolled back template {request.srcTemplateId} to {request.destTemplateId if request.destTemplateId else 'previous version'}")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get(
    "/{template_id}/content",
    response_model=str,
    summary="Get the content of a template in HTML format",
    responses={
        200: {"description": "Template content retrieved successfully"},
        404: {"description": "Template not found"},
    }
)
async def get_template_content(template_id: str, service: TemplateService = Depends(get_template_service)):
    print("Get template content endpoint called")
    try:
        content = await service.get_template_content(template_id)
        print("Get template content endpoint: Content retrieved successfully")
        return content
    except HTTPException as e:
        print("Get template content endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Get template content endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during retrieving template content", "error": str(e)})
    
@router.post(
    "/generate",
    response_class=Response,
    summary="Generate a document based on a template and provided attribute values (returns PDF)",
    responses={
        200: {"description": "PDF generated successfully"},
        400: {"description": "Missing required attributes or invalid input"},
        404: {"description": "Template not found"},
    }
)
async def generate_document(request: DocumentGenerationRequest, service: TemplateService = Depends(get_template_service)):
    print("Generate document endpoint called")
    try:
        # Generate HTML from template + values
        generated_html = await service.generate_document(request.templateId, request.attributeValues)
        print("Generate document endpoint: HTML generated successfully")

        # Convert HTML to PDF bytes
        pdf_bytes = await html_to_pdf_bytes(generated_html, title=f"Template {request.templateId}")
        
        filename = f"template-{request.templateId}.pdf"
        print("Generate document endpoint: PDF generated successfully")
        return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=\"{filename}\""})
    except HTTPException as e:
        print("Generate document endpoint: HTTPException occurred:", e.detail)
        raise e
    except Exception as e:
        print("Generate document endpoint: Unexpected error occurred:", str(e))
        raise HTTPException(status_code=500, detail={"message": "Unexpected error during document generation", "error": str(e)})