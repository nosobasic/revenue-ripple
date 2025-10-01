#!/usr/bin/env python3
"""
Script to fix frontend API URL to point to correct backend
"""

import re

def fix_frontend_api_url():
    """Update frontend to use correct backend URL in production"""
    
    # Read the current file
    with open('src/pages/BookGiveaway.jsx', 'r') as f:
        content = f.read()
    
    # Replace the relative API URL with the correct backend URL
    old_fetch = '''const response = await fetch('/api/book-giveaway', {'''
    
    new_fetch = '''const response = await fetch('https://revenue-ripple.onrender.com/api/book-giveaway', {'''
    
    content = content.replace(old_fetch, new_fetch)
    
    # Write the updated content back
    with open('src/pages/BookGiveaway.jsx', 'w') as f:
        f.write(content)
    
    print("✅ Updated frontend to use correct backend URL")
    print("📋 Changes made:")
    print("   - Changed API URL from '/api/book-giveaway' to 'https://revenue-ripple.onrender.com/api/book-giveaway'")
    print("   - This will fix the 405 error by pointing to the correct backend server")

if __name__ == "__main__":
    fix_frontend_api_url()

