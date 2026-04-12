from pydantic import BaseModel, Field
from typing import Optional

# Schema definition for an user (used in created_by and modified_by)
class User(BaseModel):
    userId: str = Field(..., description="Unique identifier for the user (from Azure AD)")
    email: Optional[str] = Field(None, description="Email of the user")
    name: Optional[str] = Field(None, description="Name of the user")