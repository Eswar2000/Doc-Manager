from azure.cosmos.aio import ContainerProxy
from azure.cosmos import exceptions
from fastapi import HTTPException
import uuid
from datetime import datetime, timezone
from src.db.client import get_container

from src.model.attributes import AttributeCreateRequest, Attribute, AttributeType

class AttributeRepository:
    def __init__(self):
        pass

    async def _get_container(self) -> ContainerProxy:
        return await get_container(container_name="attributes")

    async def create_attribute(self, data: AttributeCreateRequest) -> Attribute:
        print("Create_Attribute: Starting attribute creation process")
        container = await self._get_container()
        now = datetime.now(timezone.utc).isoformat()

        attribute = Attribute(
            id=str(uuid.uuid4()),
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
            type=data.type,
            createdAt=now,
            updatedAt=now,
            tenantId=data.tenantId if data.tenantId else "default"
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