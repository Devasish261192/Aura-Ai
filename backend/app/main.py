from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import chat, artifacts, resume, jobs, auth

app = FastAPI(
    title="Aura Career Engine API (v1.0)",
    description="Deterministic AI Career Agent and Canonical Artifact Engine",
    version="1.0.0"
)

# Configure CORS for local development and future web client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Aura Career Engine (v1.0)",
        "memory_footprint": "Ultra-lightweight (<80MB RAM)"
    }

@app.get("/")
def root():
    """Redirect to the Vite frontend UI or show API docs."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="http://localhost:5173")

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    from fastapi import Response
    return Response(status_code=204)

# Mount subrouters
app.include_router(chat.router)
app.include_router(artifacts.router)
app.include_router(resume.router)
app.include_router(resume.cv_forge_router)
app.include_router(jobs.router)
app.include_router(auth.router)

# Mount CV Forge Interactive Studio
from fastapi.staticfiles import StaticFiles
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CV_FORGE_DIST = BASE_DIR / "cvforge-dist"
if not CV_FORGE_DIST.exists():
    CV_FORGE_DIST = Path(__file__).resolve().parent.parent / "cvforge-dist"
if not CV_FORGE_DIST.exists():
    dev_path = Path(r"D:\job search\version 0.0\CV_forge\cvforge-studio\dist")
    if dev_path.exists():
        CV_FORGE_DIST = dev_path

if CV_FORGE_DIST.exists():
    app.mount("/cv-forge", StaticFiles(directory=str(CV_FORGE_DIST), html=True), name="cv-forge")
    assets_dir = CV_FORGE_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="root-assets")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
