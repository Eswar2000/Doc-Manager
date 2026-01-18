from azure.cosmos.aio import ContainerProxy
from azure.cosmos import exceptions
from fastapi import HTTPException
from typing import Literal, Optional
import uuid
from datetime import datetime, timezone
from src.db.client import get_container

from src.model.templates import Template, TemplateCreateRequest


class TemplateRepository:
    def __init__(self):
        pass

    async def _get_container(self) -> ContainerProxy:
        return await get_container(container_name="templates")


    async def create_template(self, data: TemplateCreateRequest) -> Template:
        print("Create_Template: Starting template creation process")
        container = await self._get_container()
        now = datetime.now(timezone.utc).isoformat()

        template = Template(
            id=str(uuid.uuid4()),
            name=data.name,
            description=data.description,
            htmlContent=data.htmlContent,
            jsonContent=data.jsonContent,
            attributes=data.attributes,
            version=1,
            state="active",
            parentTemplateId=None,
            createdAt=now
        )

        print(f"Create_Template: Prepared template data: {template}")

        try:
            item = await container.create_item(template.model_dump(by_alias=True))
            print(f"Create_Template: Template created successfully with ID {item['id']}")
            print(f"Create_Template: End of template creation process")
            return Template(**item)
        except exceptions.CosmosHttpResponseError as e:
            print(f"Create_Template: Error occurred while creating template: {str(e)}")
            if e.status_code == 409:
                print("Create_Template: Template ID conflict detected")
                print("Create_Template: End of template creation process with error")
                raise HTTPException(409, "Template ID conflict")
            print("Create_Template: End of template creation process with error")
            raise HTTPException(status_code=500, detail=f"Database error while creating template: {str(e)}")
        
    async def get_template_by_id(self, template_id: str) -> Optional[Template]:
        print("Get_Template_By_ID: Starting template creation process")
        container = await self._get_container()

        try:
            query = "SELECT * FROM c WHERE c.id = @template_id"
            parameters = [{"name": "@template_id", "value": template_id}]
            items = container.query_items(
                query=query,
                parameters=parameters,
                partition_key=None
            )

            results = [item async for item in items]
            if results:
                print(f"Get_Template_By_ID: Template found with ID {template_id}")
                return Template(**results[0])
            else:
                print(f"Get_Template_By_ID: No template found with ID {template_id}")
                return None
        except exceptions.CosmosHttpResponseError as e:
            if e.status_code == 404:
                print(f"Get_Template_By_ID: No template found with ID {template_id}")
                return None
            print(f"Get_Template_By_ID: Error occurred while retrieving template: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while retrieving template: {str(e)}")

    async def list_templates(self, name_contains: Optional[str] = None, desc_contains: Optional[str] = None, state: Optional[Literal["active", "archived"]] = None, limit: int = 50, offset: int = 0) -> list[Template]:
        print("List_Templates: Starting to list all templates")
        container = await self._get_container()
        
        query = "SELECT * FROM c"
        parameters = []
        conditions = []

        if name_contains:
            print(f"List_Templates: Filtering templates with name containing '{name_contains}'")
            conditions.append("CONTAINS(LOWER(c.name), LOWER(@name))")
            parameters.append({"name": "@name", "value": name_contains})

        if desc_contains:
            print(f"List_Templates: Filtering templates with description containing '{desc_contains}'")
            conditions.append("CONTAINS(LOWER(c.description), LOWER(@desc))")
            parameters.append({"name": "@desc", "value": desc_contains})

        if state:
            print(f"List_Templates: Filtering templates with state '{state}'")
            conditions.append("c.state = @state")
            parameters.append({"name": "@state", "value": state})

        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY c.createdAt DESC OFFSET @offset LIMIT @limit"
        parameters.append({"name": "@offset", "value": offset})
        parameters.append({"name": "@limit", "value": limit})

        try:
            items = container.query_items(
                query=query,
                parameters=parameters,
                partition_key=None
            )

            results = [item async for item in items]

            print(f"List_Templates: Retrieved {len(results)} templates")
            return [Template(**item) for item in results]
        except exceptions.CosmosHttpResponseError as e:
            print(f"List_Templates: Error occurred while listing templates: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while listing templates: {str(e)}")