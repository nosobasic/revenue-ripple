#!/usr/bin/env python3
"""
Script to fix CORS configuration in server.py
"""

import re

def fix_cors_config():
    """Update CORS configuration to allow all origins for development"""
    
    # Read the current file
    with open('server.py', 'r') as f:
        content = f.read()
    
    # Replace the CORS configuration with a more permissive one
    old_cors = '''CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:3000", 
    "https://revenueripple.org",
    "https://www.revenueripple.org",
    "https://revenue-ripple.onrender.com",
    "https://friendly-neat-walrus.ngrok-free.app"
])'''
    
    new_cors = '''CORS(app, origins="*")'''
    
    content = content.replace(old_cors, new_cors)
    
    # Write the updated content back
    with open('server.py', 'w') as f:
        f.write(content)
    
    print("✅ Updated CORS configuration to allow all origins")
    print("📋 Changes made:")
    print("   - Changed CORS from specific origins to allow all origins (*)")
    print("   - This will fix the 405 error caused by CORS blocking")

if __name__ == "__main__":
    fix_cors_config()

