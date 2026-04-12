from pydantic import BaseModel, Field
from datetime import datetime, timezone
from typing import List, Optional, Literal, Any, Dict
from src.model.common import User
from src.model.attributes import AttributeType

# Schema definition of attribute used inside a template
class TemplateAttribute(BaseModel):
    attributeId: str = Field(..., description="Unique identifier for the attribute")
    label: str = Field(..., description="Name of the attribute")
    required: bool = Field(..., description="Indicates if the attribute is mandatory")
    hidden: bool = Field(..., description="Indicates if the attribute is hidden")
    type: AttributeType = Field(..., description="Data type of the attribute, e.g. 'text', 'number', 'date'")
    defaultValue: Optional[Any] = Field(None, description="Default value for the attribute")
    trackerIds: List[str] = Field(default_factory=list, description="List of associated tracker IDs from the document")

# Supporting models for rule conditions
class TemplateRuleConditionItem(BaseModel):
    fieldKey: str = Field(..., description="Attribute/field key used in the condition")
    operator: str = Field(..., description="Operator, e.g. 'equals', 'not_equals', 'greater', 'less'")
    value: str = Field(..., description="Value to compare against (stored as string)")


class TemplateRuleCondition(BaseModel):
    join: Optional[Literal["and", "or"]] = Field("and", description="How to join multiple items")
    items: List[TemplateRuleConditionItem] = Field(..., description="List of condition items")


class TemplateRule(BaseModel):
    ruleId: str = Field(..., description="Unique identifier for the rule")
    name: str = Field(..., description="Name of the rule")
    action: Literal["show", "hide"] = Field("show", description="Action when condition matches: 'show' or 'hide'")
    condition: Optional[TemplateRuleCondition] = Field(None, description="Condition group that controls the rule (join + items)")
    content: Any = Field(..., description="JSON representation of the conditional block's content (ProseMirror node JSON)")
    

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
    rules: List[TemplateRule] = Field(default_factory=list, description="List of rules associated with the template")
    createdAt: str = Field(default_factory=datetime.now(timezone.utc).isoformat(), description="Timestamp (UTC timestamp in ISO format) when the template was created")
    createdBy: Optional[User] = Field(None, description="User information of the creator")
    modifiedBy: Optional[User] = Field(None, description="User information of the last modifier")

    class Config:
        from_attributes = True
        populate_by_name = True

class TemplateCreateRequest(BaseModel):
    name: str = Field(..., description="Name of the template", min_length=1, max_length=50)
    description: Optional[str] = Field(None, description="Description of the template", max_length=150)
    htmlContent: str = Field(default="", description="HTML content of the template")
    jsonContent: Any = Field(..., description="JSON representation of the template - ProseMirror format")
    attributes: List[TemplateAttribute] = Field(default_factory=list, description="List of attributes associated with the template")
    rules: List[TemplateRule] = Field(default_factory=list, description="List of rules associated with the template")

class TemplateResponse(Template):
    class Config:
        populate_by_name = True

class TemplateVersionInfo(BaseModel):
    templateId: str = Field(..., description="Unique ID of the template")
    parentTemplateId: Optional[str] = Field(None, description="ID of the parent (the root) template")
    version: int = Field(..., description="Version number of the template")
    state: Literal["active", "archived"] = Field(..., description="State of the template")

class TemplateRollbackRequest(BaseModel):
    srcTemplateId: str = Field(..., description="ID of the current template")
    destTemplateId: Optional[str] = Field(None, description="ID of the destination template to roll back to if exists")

class DocumentGenerationRequest(BaseModel):
    attributeValues: Dict[str, str] = Field(..., description="Key-value pairs (string->string) of attribute labels/IDs and their corresponding values to be used for document generation")
    templateId: str = Field(..., description="ID of the template to use for document generation")