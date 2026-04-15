from azure.cosmos.aio import ContainerProxy
from azure.cosmos import exceptions
from fastapi import HTTPException
from typing import Optional, List
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
                    userId=current_user.get("email"),
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
        
    async def get_tenant_by_id(self, tenant_id: str) -> Optional[Tenant]:
        print("Get_Tenant_By_ID: Starting tenant fetch process")
        container = await self._get_container()

        try:
            query = "SELECT * FROM c WHERE c.id = @tenant_id"
            parameters = [{"name": "@tenant_id", "value": tenant_id}]
            items = container.query_items(
                query=query,
                parameters=parameters,
                partition_key=None
            )

            results = [item async for item in items]
            if results:
                print(f"Get_Tenant_By_ID: Tenant found with ID {tenant_id}")
                return Tenant(**results[0])
            else:
                print(f"Get_Tenant_By_ID: No tenant found with ID {tenant_id}")
                return None
        except exceptions.CosmosHttpResponseError as e:
            if e.status_code == 404:
                print(f"Get_Tenant_By_ID: No tenant found with ID {tenant_id}")
                return None
            print(f"Get_Tenant_By_ID: Error occurred while retrieving tenant: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while retrieving tenant: {str(e)}")
    
    async def list_my_tenants(self, current_user: dict) -> List[Tenant]:
        print("Get_My_Tenants: Starting my tenants fetch process")
        container = await self._get_container()

        try:
            query = "SELECT * FROM c WHERE ARRAY_CONTAINS(c.members, {'userId': @userId}, true)"
            parameters = [{"name": "@userId", "value": current_user.get("email")}]
            items = container.query_items(
                query=query,
                parameters=parameters,
                partition_key=None
            )
            results = [item async for item in items]

            print(f"Get_My_Tenants: Retrieved {len(results)} tenants")
            return [Tenant(**item) for item in results]
        except HTTPException as e:
            print("Get_My_Tenants: HTTPException occurred:", e.detail)
            raise e
        except Exception as e:
            print("Get_My_Tenants: Unexpected error occurred:", str(e))
            raise HTTPException(status_code=500, detail={"message": "Unexpected error during listing tenants", "error": str(e)})

