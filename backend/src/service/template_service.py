from typing import Optional, Literal
from src.repository.template_repository import TemplateRepository
from src.model.templates import TemplateCreateRequest, Template


class TemplateService:
    def __init__(self, repo: TemplateRepository):
        self.repo = repo

    async def create_new_template(self, request: TemplateCreateRequest) -> Template:
        return await self.repo.create_template(request)

    async def get_template_by_id(self, template_id: int) -> Template:
        return await self.repo.get_template_by_id(template_id)
    
    async def list_templates(self, name_contains: Optional[str] = None, desc_contains: Optional[str] = None, state: Optional[Literal["active", "archived"]] = None, limit: int = 50, offset: int = 0) -> list[Template]:
        return await self.repo.list_templates(name_contains, desc_contains, state, limit, offset)