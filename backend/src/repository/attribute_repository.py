from azure.cosmos.aio import ContainerProxy
from azure.cosmos import exceptions
from fastapi import HTTPException
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from src.model.common import User
from src.db.client import get_container
from src.model.attributes import AttributeCreateRequest, Attribute, AttributeType, AttributeUpdateRequest

class AttributeRepository:
    def __init__(self):
        pass

    async def _get_container(self) -> ContainerProxy:
        return await get_container(container_name="attributes")

    async def create_attribute(self, data: AttributeCreateRequest, current_user: User, tenant_id: str) -> Attribute:
        print("Create_Attribute: Starting attribute creation process")
        container = await self._get_container()
        now = datetime.now(timezone.utc).isoformat()

        attribute = Attribute(
            id=str(uuid.uuid4()),
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
            type=data.type,
            createdAt=now,
            createdBy=current_user,
            tenantId=tenant_id.strip()
        )

        print(f"Create_Attribute: Prepared attribute data: {attribute}")

        try:
            item = await container.create_item(attribute.model_dump(by_alias=True))
            print(f"Create_Attribute: Attribute created successfully with ID {item['id']}")
            print(f"Create_Attribute: End of attribute creation process")
            return Attribute(**item)
        except exceptions.CosmosHttpResponseError as e:
            print(f"Create_Attribute: Error occurred while creating attribute: {str(e)}")
            if e.status_code == 409:
                print("Create_Attribute: Attribute ID conflict detected")
                print("Create_Attribute: End of attribute creation process with error")
                raise HTTPException(409, "Attribute ID conflict")
            print("Create_Attribute: End of attribute creation process with error")
            raise HTTPException(status_code=500, detail=f"Database error while creating attribute: {str(e)}")
    
    async def list_attribute(self, name_contains: Optional[str] = None, desc_contains: Optional[str] = None, type: Optional[AttributeType] = None, limit: int = 50, offset: int = 0) -> list[Attribute]:
        print("List_Attributes: Starting to list all attributes")
        container = await self._get_container()
        
        query = "SELECT * FROM c"
        parameters = []
        conditions = []

        if name_contains:
            print(f"List_Attributes: Filtering attributes with name containing '{name_contains}'")
            conditions.append("CONTAINS(LOWER(c.name), LOWER(@name))")
            parameters.append({"name": "@name", "value": name_contains})

        if desc_contains:
            print(f"List_Attributes: Filtering attributes with description containing '{desc_contains}'")
            conditions.append("CONTAINS(LOWER(c.description), LOWER(@desc))")
            parameters.append({"name": "@desc", "value": desc_contains})

        if type:
            print(f"List_Attributes: Filtering attributes with type '{type}'")
            conditions.append("c.type = @type")
            parameters.append({"name": "@type", "value": type})

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

            print(f"List_Attributes: Retrieved {len(results)} attributes")
            return [Attribute(**item) for item in results]
        except exceptions.CosmosHttpResponseError as e:
            print(f"List_Attributes: Error occurred while listing attributes: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while listing attributes: {str(e)}")
        
    async def get_attribute_by_id(self, attribute_id: str) -> Optional[Attribute]:
        print("Get_Attribute_By_ID: Starting attribute retrieval process")
        container = await self._get_container()

        try:
            query = "SELECT * FROM c WHERE c.id = @attribute_id"
            parameters = [{"name": "@attribute_id", "value": attribute_id}]
            items = container.query_items(
                query=query,
                parameters=parameters,
                partition_key=None
            )

            results = [item async for item in items]
            if results:
                print(f"Get_Attribute_By_ID: Attribute found with ID {attribute_id}")
                return Attribute(**results[0])
            else:
                print(f"Get_Attribute_By_ID: No attribute found with ID {attribute_id}")
                return None
        except exceptions.CosmosHttpResponseError as e:
            if e.status_code == 404:
                print(f"Get_Attribute_By_ID: No attribute found with ID {attribute_id}")
                return None
            print(f"Get_Attribute_By_ID: Error occurred while retrieving attribute: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while retrieving attribute: {str(e)}")
        
    async def delete_attribute_by_id(self, attribute_id: str) -> bool:
        print("Delete_Attribute_By_ID: Starting attribute deletion process")
        container = await self._get_container()

        try:
            attr = await self.get_attribute_by_id(attribute_id)
            if not attr:
                return False

            await container.delete_item(item=attribute_id, partition_key=attr.tenantId)
            print(f"Delete_Attribute_By_ID: Attribute with ID {attribute_id} deleted successfully")

            return True
        except exceptions.CosmosHttpResponseError as e:
            if e.status_code == 404:
                print(f"Delete_Attribute_By_ID: No attribute found with ID {attribute_id} to delete")
                return False
            print(f"Delete_Attribute_By_ID: Error occurred while deleting attribute: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while deleting attribute: {str(e)}")
        
    async def update_attribute(self, attribute_id, data: AttributeUpdateRequest, current_user: User, tenant_id: str) -> Attribute:
        print("Update_Attribute: Starting attribute update process")
        container = await self._get_container()

        attr = await self.get_attribute_by_id(attribute_id)
        if not attr:
            print(f"Update_Attribute: No attribute found with ID {attribute_id} to update")
            raise HTTPException(status_code=404, detail="Attribute not found")
        
        if attr.tenantId != tenant_id:
            print(f"Update_Attribute: Tenant ID mismatch for attribute {attribute_id}")
            raise HTTPException(status_code=403, detail="Not allowed to update attribute from a different tenant")

        updated_data = attr.model_dump()
        if data.name is not None:
            updated_data["name"] = data.name.strip()
        if data.description is not None:
            updated_data["description"] = data.description.strip()
        updated_data["modifiedAt"] = datetime.now(timezone.utc).isoformat()
        updated_data["modifiedBy"] = current_user

        try:
            updated_attr = await container.replace_item(item=attribute_id, body=updated_data)
            print(f"Update_Attribute: Attribute with ID {attribute_id} updated successfully")
        except exceptions.CosmosHttpResponseError as e:
            print(f"Update_Attribute: Error occurred while updating attribute: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while updating attribute: {str(e)}")

        return Attribute(**updated_attr)

    async def filter_attributes_by_tenant(self, attribute_ids: List[str], tenant_id: Optional[str]) -> list[str]:
        print("Filter_Attributes_By_Tenant: Starting to filter attributes by tenant")
        if not tenant_id:
            tenant_id = "default"
        
        container = await self._get_container()

        query = "SELECT VALUE c.id FROM c WHERE ARRAY_CONTAINS(@attrIds, c.id) AND c.tenantId = @tenantId"
        parameters = [
            {"name": "@attrIds", "value": attribute_ids},
            {"name": "@tenantId", "value": tenant_id}
        ]

        try:
            items = container.query_items(
                query=query,
                parameters=parameters,
                partition_key=None
            )

            results = [item async for item in items]
            print(f"Filter_Attributes_By_Tenant: Retrieved {len(results)} attributes")
            return results
        except exceptions.CosmosHttpResponseError as e:
            print(f"Filter_Attributes_By_Tenant: Error occurred while filtering attributes: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while filtering attributes: {str(e)}")