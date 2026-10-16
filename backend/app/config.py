import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from version 1.0 or parent directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
else:
    load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
SERP_API_KEY = os.getenv("SERP_API_KEY", "")

# Directory configurations
DATA_DIR = BASE_DIR / "data"

def get_user_artifacts_dir(user_id: str = "user1") -> Path:
    """Returns the isolated artifact directory for a specific test user."""
    safe_user = "".join(c for c in user_id if c.isalnum() or c in ("_", "-")) or "user1"
    target = DATA_DIR / "artifacts" / safe_user
    target.mkdir(parents=True, exist_ok=True)
    return target

ARTIFACTS_DIR = get_user_artifacts_dir("user1")

SQLITE_DB_PATH = DATA_DIR / "aura_v1.db"

# Multi-tier resilient model configuration (benchmarked for sub-3s response)
PRIMARY_MODEL = "gemini-3.6-flash"
FALLBACK_MODELS = [
    "gemini-3.5-flash",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash-lite"
]
