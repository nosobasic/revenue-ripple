#!/usr/bin/env bash
set -euo pipefail
# Deliberately selected patched build tools (Python >=3.10), not runtime freeze pins.
python -m pip install --upgrade 'pip==26.2.2' 'setuptools==84.2.1'
python -m pip install -r requirements.txt
python -m pip check
python - <<'PY'
import json, platform
from importlib.metadata import version
print('DEPENDENCY_BUILD ' + json.dumps({
    'python': platform.python_version(),
    'certifi': version('certifi'),
    'pip': version('pip'),
    'setuptools': version('setuptools'),
}))
PY
