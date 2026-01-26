from src.router.attribute_router import router as attribute_router
from src.router.template_router import router as template_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Doc-Manager API",
    version="1.0.0",
    description="API for managing documents and related operations for contracts lifecycle management.",
    docs_url="/swagger",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Only for development, restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(template_router)
app.include_router(attribute_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}