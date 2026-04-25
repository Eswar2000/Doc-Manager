from fastapi_azure_auth import MultiTenantAzureAuthorizationCodeBearer
from src.config.settings import settings

azure_scheme = MultiTenantAzureAuthorizationCodeBearer(
    app_client_id=settings.azure_client_id,
    scopes={
        f"api://{settings.azure_client_id}/access_as_user": "Access API as user"
    },
    
    # For development, we can skip issuer validation to allow tokens from any tenant. In production, this should be set to True and the allowed tenants should be specified.
    validate_iss=False,

    # This allows users from any tenant to authenticate. In production, you might want to restrict this to specific tenants.
    allow_guest_users=True
)