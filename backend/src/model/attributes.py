from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import Optional
from enum import Enum
from src.model.common import User

class AttributeType(str, Enum):
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    EMAIL = "email"

    def __str__(self) -> str:
        return self.value

    def __repr__(self) -> str:
        return self.value

class Attribute(BaseModel):
    id: str = Field(..., description="Unique identifier for the attribute")
    name: str = Field(..., description="Display name of the attribute")
    description: Optional[str] = Field(None, description="Description of the attribute")
    type: AttributeType = Field(..., description="Type of the attribute")
    createdAt: str = Field(default_factory=datetime.now(timezone.utc).isoformat(), description="Timestamp (UTC timestamp in ISO format) when the attribute was created")
    modifiedAt: Optional[str] = Field(None, description="Timestamp (UTC timestamp in ISO format) when the attribute was modified")
    createdBy: User = Field(..., description="User information of the creator")
    modifiedBy: Optional[User] = Field(None, description="User information of the last modifier")
    tenantId: str = Field(None, description="Identifier for the tenant to which the attribute belongs")

    class Config:
        from_attributes = True
        populate_by_name = True

class AttributeCreateRequest(BaseModel):
    name: str = Field(..., description="Display name of the attribute", min_length=1, max_length=50)
    description: Optional[str] = Field(None, description="Description of the attribute", max_length=150)
    type: AttributeType = Field(..., description="Type of the attribute")

class AttributeUpdateRequest(BaseModel):
    name: str = Field(None, description="Display name of the attribute", min_length=1, max_length=50)
    description: Optional[str] = Field(None, description="Description of the attribute", max_length=150)

class AttributeFilterByTenantRequest(BaseModel):
    attributeIds: list[str] = Field(..., description="List of attribute IDs to filter")
    tenantId: Optional[str] = Field(None, description="Identifier for the tenant to filter attributes by")

class AttributeResponse(Attribute):
    class Config:
        populate_by_name = True