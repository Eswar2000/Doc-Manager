from azure.cosmos.aio import ContainerProxy
from azure.cosmos import exceptions
from fastapi import HTTPException
import uuid
from datetime import datetime, timezone
from src.db.client import get_container
from src.model.tenants import Tenant, TenantMember, TenantCreateRequest

class TenantRepository:
    def __init__(self):
        pass

    async def _get_container(self) -> ContainerProxy:
        return await get_container(container_name="tenants")
    

    async def create_tenant(self, data: TenantCreateRequest, current_user: dict) -> Tenant:
        print("Create_Tenant: Starting tenant creation process")
        container = await self._get_container()
        now = datetime.now(timezone.utc).isoformat()

        tenant = Tenant(
            id=str(uuid.uuid4()),
            name=data.name,
            description=data.description,
            isActive=True,

            # Make the creator of the tenant by default part of members (as admin)
            members=[
                TenantMember(
                    userId=current_user.get("userId"),
                    roles=["admin"]
                )
            ],
            createdAt=now
        )

        print(f"Create_Tenant: Prepared tenant data: {tenant}")

        try:
            item = await container.create_item(tenant.model_dump(by_alias=True))
            print(f"Create_Tenant: Tenant created successfully with ID {item['id']}")
            print(f"Create_Tenant: End of tenant creation process")
            return Tenant(**item)
        except exceptions.CosmosHttpResponseError as e:
            print(f"Create_Tenant: Error occurred while creating tenant: {str(e)}")
            if e.status_code == 409:
                print("Create_Tenant: Tenant ID conflict detected")
                print("Create_Tenant: End of tenant creation process with error")
                raise HTTPException(409, "Tenant ID conflict")
            print("Create_Tenant: End of tenant creation process with error")
            raise HTTPException(status_code=500, detail=f"Database error while creating tenant: {str(e)}")