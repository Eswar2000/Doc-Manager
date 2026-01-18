from src.router.template_router import router as template_router
from fastapi import FastAPI

app = FastAPI(
    title="Doc-Manager API",
    version="1.0.0",
    description="API for managing documents and related operations for contracts lifecycle management.",
    docs_url="/swagger",
    redoc_url="/redoc"
)

app.include_router(template_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}