# Server package
# This file makes server a Python package
# We need to re-export the app from the parent server.py file so gunicorn can find it

import sys
import os
import importlib.util

# Get the parent directory where server.py lives
_parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_server_py_path = os.path.join(_parent_dir, 'server.py')

# Load the actual server.py module
spec = importlib.util.spec_from_file_location("server_module", _server_py_path)
server_module = importlib.util.module_from_spec(spec)
sys.modules['server_module'] = server_module
spec.loader.exec_module(server_module)

# Re-export the app and other important objects so gunicorn can find them
app = server_module.app
__all__ = ['app']
