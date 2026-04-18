from azure.cosmos.aio import ContainerProxy
from azure.cosmos import exceptions
from fastapi import HTTPException
from typing import Optional, List
import uuid
from datetime import datetime, timezone
from src.db.client import get_container
from src.model.tenants import Tenant, TenantMember, TenantCreateRequest, TenantRole, TenantUpdateRequest

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

    async def list_tenants(self, name_contains: Optional[str] = None, desc_contains: Optional[str] = None, status: Optional[bool] = None, limit: int = 50, offset: int = 0) -> list[Tenant]:
        print("List_Tenants: Starting to list all tenants")
        container = await self._get_container()
        
        query = "SELECT * FROM c"
        parameters = []
        conditions = []

        if name_contains:
            print(f"List_Tenants: Filtering tenants with name containing '{name_contains}'")
            conditions.append("CONTAINS(LOWER(c.name), LOWER(@name))")
            parameters.append({"name": "@name", "value": name_contains})

        if desc_contains:
            print(f"List_Tenants: Filtering tenants with description containing '{desc_contains}'")
            conditions.append("CONTAINS(LOWER(c.description), LOWER(@desc))")
            parameters.append({"name": "@desc", "value": desc_contains})

        if status is not None:
            print(f"List_Tenants: Filtering tenants with isActive '{status}'")
            conditions.append("c.isActive = @status")
            parameters.append({"name": "@status", "value": status})

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

            print(f"List_Tenants: Retrieved {len(results)} tenants")
            return [Tenant(**item) for item in results]
        except exceptions.CosmosHttpResponseError as e:
            print(f"List_Tenants: Error occurred while listing tenants: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while listing tenants: {str(e)}")

    async def update_tenant(self, tenant_id: str, data: TenantUpdateRequest) -> Tenant:
        print(f"Update_Tenant: Starting update for tenant ID {tenant_id}")
        container = await self._get_container()

        tenant = await self.get_tenant_by_id(tenant_id)
        if not tenant:
            print(f"Update_Tenant: No tenant found with ID {tenant_id} to update")
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        tenant_to_update = tenant.model_dump(by_alias=True)
        if data.name is not None:
            tenant_to_update["name"] = data.name.strip()
        if data.description is not None:
            tenant_to_update["description"] = data.description.strip()

        tenant_to_update["modifiedAt"] = datetime.now(timezone.utc).isoformat()

        try:
            updated_tenant = await container.replace_item(item=tenant.id, body=tenant_to_update)
            print(f"Update_Tenant: Tenant with ID {tenant.id} updated successfully")
        except exceptions.CosmosHttpResponseError as e:
            print(f"Update_Tenant: Error occurred while updating tenant: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while updating tenant: {str(e)}")

        return Tenant(**updated_tenant)
    
    async def update_tenant_helper(self, tenant: Tenant) -> Tenant:
        print(f"Update_Tenant_Helper: Starting helper update for tenant ID {tenant.id}")
        container = await self._get_container()

        tenant_to_update = tenant.model_dump(by_alias=True)
        tenant_to_update["modifiedAt"] = datetime.now(timezone.utc).isoformat()

        try:
            updated_tenant = await container.replace_item(item=tenant.id, body=tenant_to_update)
            print(f"Update_Tenant_Helper: Tenant with ID {tenant.id} updated successfully")
        except exceptions.CosmosHttpResponseError as e:
            print(f"Update_Tenant_Helper: Error occurred while updating tenant: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error while updating tenant: {str(e)}")

        return Tenant(**updated_tenant)
    
    async def add_member_to_tenant(self, tenant_id: str, new_member: str, roles: Optional[List[TenantRole]]) -> Tenant:
        print(f"Add_Member_To_Tenant: Starting to add member '{new_member}' to tenant ID {tenant_id}")
        tenant = await self.get_tenant_by_id(tenant_id)
        if not tenant:
            print(f"Add_Member_To_Tenant: No tenant found with ID {tenant_id} to add member")
            raise HTTPException(status_code=404, detail="Tenant not found")

        if any(member.userId == new_member for member in tenant.members):
            print(f"Add_Member_To_Tenant: User '{new_member}' is already a member of tenant ID {tenant_id}")
            raise HTTPException(status_code=400, detail="User is already a member of the tenant")
        
        tenant_member = TenantMember(userId=new_member, roles=roles or ["can_view"])
        tenant.members.append(tenant_member)

        updated_tenant = await self.update_tenant_helper(tenant)
        print(f"Add_Member_To_Tenant: Member '{new_member}' added successfully to tenant ID {tenant_id}")
        return updated_tenant