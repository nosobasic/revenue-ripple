#!/usr/bin/env python3
"""
Debug Command Center Environment Variables
Check if the environment variables are being read correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def debug_env_vars():
    print("🔍 Command Center Environment Variable Debug")
    print("=" * 50)
    
    # Check the exact environment variable
    command_center_enabled = os.getenv('REVRIPPLE_COMMAND_CENTER_ENABLED')
    write_mode = os.getenv('REVRIPPLE_WRITE_MODE')
    
    print(f"REVRIPPLE_COMMAND_CENTER_ENABLED: '{command_center_enabled}'")
    print(f"REVRIPPLE_WRITE_MODE: '{write_mode}'")
    print()
    
    # Check if it's being read correctly
    if command_center_enabled:
        if command_center_enabled.lower() == 'true':
            print("✅ Command Center should be ENABLED")
        else:
            print(f"⚠️  Command Center is set to '{command_center_enabled}' (not 'true')")
    else:
        print("❌ REVRIPPLE_COMMAND_CENTER_ENABLED is not set")
    
    print()
    print("🔧 Troubleshooting Steps:")
    print("1. Make sure the variable name is exactly: REVRIPPLE_COMMAND_CENTER_ENABLED")
    print("2. Make sure the value is exactly: true")
    print("3. Restart your Render service after adding the variable")
    print("4. Check the Render logs for any errors")

if __name__ == "__main__":
    debug_env_vars()

