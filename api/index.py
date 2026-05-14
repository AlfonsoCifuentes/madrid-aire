from pathlib import Path
import sys


repo_root = Path(__file__).resolve().parents[1]
api_root = repo_root / "apps" / "api"

if str(api_root) not in sys.path:
    sys.path.insert(0, str(api_root))

from src.main import app  # noqa: E402