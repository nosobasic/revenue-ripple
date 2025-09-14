#!/usr/bin/env python3
"""
Script to update GetResponse environment variable names in server.py
"""

import re

def update_server_file():
    """Update server.py with correct environment variable names"""
    
    # Read the current file
    with open('server.py', 'r') as f:
        content = f.read()
    
    # Update tripwire integration to use GET_RESPONSE_TRIPWIRE_KEY
    content = re.sub(
        r'api_key = os\.getenv\("GETRESPONSE_API_KEY"\)',
        'api_key = os.getenv("GET_RESPONSE_TRIPWIRE_KEY")',
        content
    )
    
    content = re.sub(
        r'campaign_id = os\.getenv\("GETRESPONSE_CAMPAIGN_ID"\)',
        'campaign_id = os.getenv("GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID")',
        content
    )
    
    # Update book giveaway integration to use GETRESPONSE_API_KEY
    content = re.sub(
        r'api_key = os\.getenv\("GETRESPONSE_API_KEY", "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"\)',
        'api_key = os.getenv("GETRESPONSE_API_KEY", "tnkyixvg8dxdsmwks2ll69y8k31zd7qg")',
        content
    )
    
    content = re.sub(
        r'return os\.getenv\("GETRESPONSE_CAMPAIGN_ID", "5lkFO"\)',
        'return os.getenv("GETRESPONSE_CAMPAIGN_ID", "5lkFO")',
        content
    )
    
    # Write the updated content back
    with open('server.py', 'w') as f:
        f.write(content)
    
    print("✅ Updated server.py with correct environment variable names")
    print("📋 Changes made:")
    print("   - Tripwire integration now uses GET_RESPONSE_TRIPWIRE_KEY")
    print("   - Tripwire integration now uses GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID")
    print("   - Book giveaway integration uses GETRESPONSE_API_KEY")
    print("   - Book giveaway integration uses GETRESPONSE_CAMPAIGN_ID")

if __name__ == "__main__":
    update_server_file()

