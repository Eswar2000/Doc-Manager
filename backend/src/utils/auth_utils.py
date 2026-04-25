from fastapi import Depends, HTTPException
from fastapi_azure_auth.user import User
from src.config.auth_config import azure_scheme


class CurrentUser:
    """Returns clean, typed user info from Azure AD token"""
    
    def __call__(self, user: User = Depends(azure_scheme)):
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
        user = {
            "email": user.email or user.preferred_username or user.upn,
            "name": user.name or user.preferred_username,
        }

        if not user["email"]:
            raise HTTPException(status_code=401, detail="Invalid token - missing user identifier")

        return user


get_current_user = CurrentUser()