from src.repository.template_repository import TemplateRepository
from src.model.templates import TemplateCreateRequest, Template


class TemplateService:
    def __init__(self, repo: TemplateRepository):
        self.repo = repo

    async def create_new_template(self, request: TemplateCreateRequest) -> Template:
        return await self.repo.create_template(request)