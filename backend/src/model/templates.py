from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional, Literal, Any

# Schema definition of attribute used inside a template
class TemplateAttribute(BaseModel):
    attributeId: str = Field(..., description="Unique identifier for the attribute")
    label: str = Field(..., description="Name of the attribute")
    required: bool = Field(..., description="Indicates if the attribute is mandatory")
    hidden: bool = Field(..., description="Indicates if the attribute is hidden")
    defaultValue: Optional[Any] = Field(None, description="Default value for the attribute")
    trackerIds: List[str] = Field(default_factory=list, description="List of associated tracker IDs from the document")

# Schema definition for a template
class Template(BaseModel):
    id: str = Field(..., description="Unique identifier for the template")
    name: str = Field(..., description="Name of the template")
    description: Optional[str] = Field(None, description="Description of the template")
    version: int = Field(..., description="Version number of the template")
    state: Literal["active", "archived"] = Field(..., description="State of the template")
    parentTemplateId: Optional[str] = Field(None, description="ID of the parent template, if any")
    htmlContent: str = Field(..., description="HTML content of the template")
    jsonContent: Any = Field(..., description="JSON representation of the template - ProseMirror format")
    attributes: List[TemplateAttribute] = Field(default_factory=list, description="List of attributes associated with the template")
    createdAt: str = Field(default_factory=datetime.now(timezone.utc).isoformat(), description="Timestamp (UTC timestamp in ISO format) when the template was created")

    class Config:
        from_attributes = True
        populate_by_name = True

class TemplateCreateRequest(BaseModel):
    name: str = Field(..., description="Name of the template", min_length=1, max_length=50)
    description: Optional[str] = Field(None, description="Description of the template", max_length=150)
    htmlContent: str = Field(default="", description="HTML content of the template")
    jsonContent: Any = Field(..., description="JSON representation of the template - ProseMirror format")
    attributes: List[TemplateAttribute] = Field(default_factory=list, description="List of attributes associated with the template")

class TemplateResponse(Template):
    class Config:
        populate_by_name = True