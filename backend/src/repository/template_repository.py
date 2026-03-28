from azure.cosmos.aio import ContainerProxy
from azure.cosmos import exceptions
from fastapi import HTTPException
from typing import Literal, Optional
import uuid
from datetime import datetime, timezone
from src.db.client import get_container

from src.model.templates import Template, TemplateCreateRequest, TemplateVersionInfo


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
            rules=data.rules,
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

    async def create_template_version(self, template_dict: dict) -> Template:
        print("Create_Template_Version: Starting template version creation process")
        container = await self._get_container()
        try:
            new_template = await container.create_item(template_dict)
            print(f"Create_Template_Version: Template version created successfully with ID {new_template['id']}")
            return Template(**new_template)
        except exceptions.CosmosHttpResponseError as e:
            raise HTTPException(status_code=500, detail=f"Database error while creating template version: {str(e)}")

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

    async def archive_template(self, template: Template) -> bool:
        print("Archive_Template: Starting template archival process")

        if not template:
            print(f"Archive_Template: No template found with ID {template.id} to archive")
            return False
        if template.state != "active":
            print(f"Archive_Template: Template with ID {template.id} is not active and cannot be archived")
            return False
        
        container = await self._get_container()
        try:    
            template_to_update = template.model_dump(by_alias=True)
            template_to_update["state"] = "archived"
            await container.replace_item(item=template.id, body=template_to_update)
            print(f"Archive_Template: Template with ID {template.id} archived successfully")
            return True
        
        except exceptions.CosmosHttpResponseError as e:
            print(f"Archive_Template: Error occurred while archiving template: {str(e)}")
            if e.status_code == 409:
                raise HTTPException(status_code=409, detail="Concurrency conflict — template updated by another process")
            return False
        
    async def update_template(self, template_id: str, payload: TemplateCreateRequest) -> Template:
        print(f"Update_Template: Starting update for template ID {template_id}")

        existing_template = await self.get_template_by_id(template_id)
        if not existing_template:
            print(f"Update_Template: No template found with ID {template_id} to update")
            raise HTTPException(status_code=404, detail="Template not found")
        
        if existing_template.state != "active":
            print(f"Update_Template: Template with ID {template_id} is not active and cannot be updated")
            raise HTTPException(status_code=400, detail="Only active templates can be updated")
        
        root_v1_id = existing_template.parentTemplateId or existing_template.id
        print(f"Update_Template: Root v1 ID determined as {root_v1_id}")

        archived_template = await self.archive_template(existing_template)
        if not archived_template:
            print(f"Update_Template: Failed to archive existing template with ID {template_id}")
            raise HTTPException(status_code=500, detail="Failed to archive existing template")

        print(f"Update_Template: Successfully archived old version {template_id}")

        now = datetime.now(timezone.utc).isoformat()
        new_version = existing_template.version + 1
        
        new_template = Template(
            id=str(uuid.uuid4()),
            name=payload.name,
            description=payload.description,
            htmlContent=payload.htmlContent,
            jsonContent=payload.jsonContent,
            attributes=payload.attributes,
            rules=payload.rules,
            version=new_version,
            state="active",
            parentTemplateId=root_v1_id,
            createdAt=now
        )

        print(f"Update_Template: Preparing new version {new_version} with ID {new_template.id}")
        updated_template = await self.create_template_version(new_template.model_dump(by_alias=True))
        print(f"Update_Template: Successfully created new version {new_version} with ID {updated_template.id}")
        return updated_template

    async def get_version_history(self, template_id: str) -> list[TemplateVersionInfo]:
        print(f"Get_Version_History: Fetching version history for template ID {template_id}")
        container = await self._get_container()

        current_template = await self.get_template_by_id(template_id)
        if not current_template:
            print(f"Get_Version_History: No template found with ID {template_id}")
            raise HTTPException(status_code=404, detail="Template not found")
        
        parent_template_id = current_template.parentTemplateId or current_template.id

        try:
            query = "SELECT c.id AS templateId, c.parentTemplateId, c.version, c.state FROM c WHERE c.parentTemplateId = @parent_id OR c.id = @parent_id ORDER BY c.version"
            items = container.query_items(query, parameters=[{"name": "@parent_id", "value": parent_template_id}])
            
            results = [item async for item in items]
            print(f"Get_Version_History: Retrieved {len(results)} versions for template ID {template_id}")

            return [TemplateVersionInfo(**item) for item in results]
        except exceptions.CosmosHttpResponseError as e:
            print(f"Get_Version_History: Error occurred while fetching version history: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while fetching version history: {str(e)}")