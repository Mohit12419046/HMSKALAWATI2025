#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "Project root: $ROOT"
# 1) Create virtualenv for backend
python3 -m venv "$ROOT/.venv"
source "$ROOT/.venv/bin/activate"
# 2) Install backend deps
pip install --upgrade pip
pip install -r "$ROOT/backend/requirements.txt"
# 3) Build optional C extension (if gcc & python dev headers present)
echo "Building C extension (optional) ..."
if [ -f "$ROOT/backend/cmodules/healthcalc.c" ]; then
  cd "$ROOT/backend/cmodules"
  python3 setup.py build_ext --inplace || echo "C build failed; continuing without C module."
  cd "$ROOT"
fi
# 4) Start Flask backend (in background)
echo "Starting backend..."
cd "$ROOT/backend"
# ensure DB exists
python - <<PY
from models import init_db
init_db()
print("DB initialized at backend/hms.db")
PY
# run in background
python app.py &
echo "Backend started at http://127.0.0.1:5000"
echo "Open the frontend file frontend/index.html in your browser (file:// or via simple http server)."
# optional: start a tiny HTTP server for frontend
cd "$ROOT/frontend"
python3 -m http.server 8000 &
echo "Frontend served at http://127.0.0.1:8000"
echo "Done. Ctrl+C to stop servers."
