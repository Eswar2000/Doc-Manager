from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional, Literal

TenantRole = Literal["can_create", "can_edit", "can_delete", "can_use", "can_view", "admin"]
TemplateMetadataType = Literal["Text", "Single Select", "Multi Select"]

class TenantBranding(BaseModel):
    header: Optional[str] = Field(None, description="Header CSS for the generated documents")
    footer: Optional[str] = Field(None, description="Footer CSS for the generated documents")
    table: Optional[str] = Field(None, description="Table CSS for the generated documents")

class TenantMember(BaseModel):
    userId: str = Field(..., description="Unique identifier for the user")
    roles: List[TenantRole] = Field(default_factory=lambda: ["can_view"], description="Roles for the user under that tenant")

class TenantAttributeSettings(BaseModel):
    mandatoryAttributes: List[str] = Field(default_factory=list, description="List of attribute keys that must be filled when generating a document under this tenant")

class TemplateMetadata(BaseModel):
    name: str = Field(..., description="Name of the metadata field")
    type: TemplateMetadataType = Field(..., description="Type of metadata field")
    options: Optional[List[str]] = Field(None, description="List of options (only required for single or multi select)")

class TenantTemplateSettings(BaseModel):
    metadata: List[TemplateMetadata] = Field(default_factory=list, description="Custom metadata fields for templates under the tenant")

class Tenant(BaseModel):
    id: str = Field(..., description="Unique identifier for the tenant")
    name: str = Field(..., description="Name of the tenant")
    description: Optional[str] = Field(None, description="Description of the tenant")
    isActive: bool = Field(True, description="Status of the tenant")
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat(), description="Timestamp (UTC timestamp in ISO format) when the template was created")
    modifiedAt: Optional[str] = Field(None, description="Timestamp (UTC timestamp in ISO format) when the template was last modified")
    members: List[TenantMember] = Field(default_factory=list, description="Members of the tenant")
    branding: Optional[TenantBranding] = Field(None, description="Styling of document sections")
    attributeSettings: Optional[TenantAttributeSettings] = Field(None, description="Settings for attributes defined under the tenant")
    templateSettings: Optional[TenantTemplateSettings] = Field(None, description="Settings for templates defined under the tenant")

    class Config:
        from_attributes = True
        populate_by_name = True

class TenantResponse(Tenant):
    class Config:
        populate_by_name = True

class TenantCreateRequest(BaseModel):
    name: str = Field(..., description="Name of the tenant")
    description: Optional[str] = Field(None, description="Description of the tenant")

class TenantUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, description="Name of the tenant")
    description: Optional[str] = Field(None, description="Description of the tenant")

class TenantAddMemberRequest(BaseModel):
    new_member: str = Field(..., description="User ID of the new member to be added to the tenant")
    roles: Optional[List[TenantRole]] = Field(None, description="Roles to be assigned to the new member under the tenant")