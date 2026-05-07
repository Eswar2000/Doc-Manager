from typing import Optional, Literal
from src.repository.template_repository import TemplateRepository
from src.model.templates import TemplateCreateRequest, Template, TemplateVersionInfo


class TemplateService:
    def __init__(self, repo: TemplateRepository):
        self.repo = repo

    async def create_new_template(self, request: TemplateCreateRequest, current_user: dict, tenant_id: str) -> Template:
        return await self.repo.create_template(request, current_user, tenant_id)

    async def get_template_by_id(self, template_id: str, tenant_id: str) -> Template:
        return await self.repo.get_template_by_id(template_id, tenant_id)
    
    async def list_templates(self, name_contains: Optional[str] = None, desc_contains: Optional[str] = None, state: Optional[Literal["active", "archived"]] = None, limit: int = 50, offset: int = 0) -> list[Template]:
        return await self.repo.list_templates(name_contains, desc_contains, state, limit, offset)
    
    async def update_template(self, template_id: str, request: TemplateCreateRequest, current_user: dict, tenant_id: str) -> Template:
        return await self.repo.update_template(template_id, request, current_user, tenant_id)

    async def get_version_history(self, template_id: str, tenant_id: str) -> list[TemplateVersionInfo]:
        return await self.repo.get_version_history(template_id, tenant_id)
    
    async def rollback_template_version(self, tenant_id: str, src_template_id: str, dest_template_id: Optional[str]) -> bool:
        return await self.repo.rollback_template_version(tenant_id, src_template_id, dest_template_id)
    
    async def delete_template_by_id(self, template_id: str, tenant_id: str) -> bool:
        return await self.repo.delete_template_by_id(template_id, tenant_id)
    
    async def generate_document(self, template_id: str, attribute_values: dict, tenant_id: str) -> str:
        return await self.repo.generate_document(template_id, attribute_values, tenant_id)
    
    async def get_attribute_usage(self, attribute_id: str) -> bool:
        return await self.repo.get_attribute_usage(attribute_id)