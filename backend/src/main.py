from src.router.attribute_router import router as attribute_router
from src.router.template_router import router as template_router
from src.router.tenant_router import router as tenant_router
from src.config.auth_config import azure_scheme
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import settings

app = FastAPI(
    title="Doc-Manager API",
    version="1.0.0",
    description="API for managing documents and related operations for contracts lifecycle management.",
    docs_url="/swagger",
    redoc_url="/redoc",

    swagger_ui_oauth2_redirect_url="/oauth2-redirect",
    swagger_ui_init_oauth={
        'usePkceWithAuthorizationCodeGrant': True,
        'clientId': settings.azure_client_id,
        'scopes': f"api://{settings.azure_client_id}/access_as_user"
    }
)

# Load OpenID configuration on startup to ensure authentication is ready before handling requests
@app.on_event("startup")
async def startup():
    await azure_scheme.openid_config.load_config()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Only for development, restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with authentication dependency
app.include_router(template_router, dependencies=[Depends(azure_scheme)])
app.include_router(attribute_router, dependencies=[Depends(azure_scheme)])
app.include_router(tenant_router, dependencies=[Depends(azure_scheme)])

# Health check endpoint, no authentication required
@app.get("/health", dependencies=[])
async def health_check():
    return {"status": "healthy"}