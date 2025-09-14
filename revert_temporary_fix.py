#!/usr/bin/env python3
"""
Revert the temporary fix and restore proper environment variable usage
"""

def revert_temporary_fix():
    """Restore the proper get_getresponse_campaign_id function"""
    
    # Read the current file
    with open('server.py', 'r') as f:
        content = f.read()
    
    # Replace the temporary fix with the proper function
    old_function = '''def get_getresponse_campaign_id():
    """Get the campaign ID for the master list from GetResponse"""
    # TEMPORARY FIX: Force correct campaign ID regardless of environment variable
    # TODO: Update Render environment variable GETRESPONSE_CAMPAIGN_ID to 50yn9
    return "50yn9"'''
    
    new_function = '''def get_getresponse_campaign_id():
    """Get the campaign ID for the master list from GetResponse"""
    # Use the campaign ID from environment variable or fallback to the provided one
    return os.getenv("GETRESPONSE_CAMPAIGN_ID", "50yn9")'''
    
    content = content.replace(old_function, new_function)
    
    # Write the updated content back
    with open('server.py', 'w') as f:
        f.write(content)
    
    print("✅ REVERTED TEMPORARY FIX")
    print("📋 Changes made:")
    print("   - Restored proper environment variable usage")
    print("   - Function now uses os.getenv('GETRESPONSE_CAMPAIGN_ID', '50yn9')")
    print("   - Since you fixed the Render environment variable, this will work correctly")
    print("\n🎯 Result:")
    print("   - Production will use the environment variable value")
    print("   - Local development will use the fallback value")
    print("   - Both should now be '50yn9'")

if __name__ == "__main__":
    revert_temporary_fix()

