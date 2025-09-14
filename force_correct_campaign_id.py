#!/usr/bin/env python3
"""
Temporary fix to force the correct campaign ID
"""

def force_correct_campaign_id():
    """Update server.py to force the correct campaign ID regardless of environment variable"""
    
    # Read the current file
    with open('server.py', 'r') as f:
        content = f.read()
    
    # Replace the function to always return the correct campaign ID
    old_function = '''def get_getresponse_campaign_id():
    """Get the campaign ID for the master list from GetResponse"""
    # Use the campaign ID from environment variable or fallback to the provided one
    return os.getenv("GETRESPONSE_CAMPAIGN_ID", "50yn9")'''
    
    new_function = '''def get_getresponse_campaign_id():
    """Get the campaign ID for the master list from GetResponse"""
    # TEMPORARY FIX: Force correct campaign ID regardless of environment variable
    # TODO: Update Render environment variable GETRESPONSE_CAMPAIGN_ID to 50yn9
    return "50yn9"'''
    
    content = content.replace(old_function, new_function)
    
    # Write the updated content back
    with open('server.py', 'w') as f:
        f.write(content)
    
    print("✅ TEMPORARY FIX APPLIED")
    print("📋 Changes made:")
    print("   - Modified get_getresponse_campaign_id() to always return '50yn9'")
    print("   - This bypasses any incorrect environment variable settings")
    print("   - This is a temporary fix until you update Render environment variables")
    print("\n🔧 PERMANENT FIX:")
    print("   1. Go to Render dashboard")
    print("   2. Update GETRESPONSE_CAMPAIGN_ID environment variable to: 50yn9")
    print("   3. Then revert this temporary change")

if __name__ == "__main__":
    force_correct_campaign_id()

