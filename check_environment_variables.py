#!/usr/bin/env python3
"""
Script to check current environment variables and help debug GetResponse campaign ID issue
"""

import os

def check_environment_variables():
    """Check all GetResponse related environment variables"""
    print("🔍 Checking GetResponse Environment Variables")
    print("=" * 50)
    
    # Check book giveaway variables
    book_api_key = os.getenv("GETRESPONSE_API_KEY")
    book_campaign_id = os.getenv("GETRESPONSE_CAMPAIGN_ID")
    
    print(f"📧 Book Giveaway Integration:")
    print(f"   GETRESPONSE_API_KEY: {'✅ Set' if book_api_key else '❌ Not set'}")
    print(f"   GETRESPONSE_CAMPAIGN_ID: {book_campaign_id if book_campaign_id else '❌ Not set'}")
    
    # Check tripwire variables
    tripwire_api_key = os.getenv("GET_RESPONSE_TRIPWIRE_KEY")
    tripwire_campaign_id = os.getenv("GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID")
    
    print(f"\n🎯 Tripwire Integration:")
    print(f"   GET_RESPONSE_TRIPWIRE_KEY: {'✅ Set' if tripwire_api_key else '❌ Not set'}")
    print(f"   GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID: {tripwire_campaign_id if tripwire_campaign_id else '❌ Not set'}")
    
    # Test the function
    print(f"\n🧪 Testing get_getresponse_campaign_id() function:")
    try:
        from server import get_getresponse_campaign_id
        result = get_getresponse_campaign_id()
        print(f"   Function result: {result}")
        
        if result == "50yn9":
            print("   ✅ Function returns correct campaign ID")
        elif result == "5lkFO":
            print("   ❌ Function returns OLD campaign ID - environment variable override!")
        else:
            print(f"   ⚠️ Function returns unexpected campaign ID: {result}")
            
    except Exception as e:
        print(f"   ❌ Error testing function: {e}")
    
    print(f"\n💡 Recommendations:")
    if book_campaign_id == "5lkFO":
        print("   🚨 URGENT: GETRESPONSE_CAMPAIGN_ID is set to old value '5lkFO'")
        print("   📝 Update Render environment variable to '50yn9'")
    elif book_campaign_id == "50yn9":
        print("   ✅ Environment variable is correct")
    elif not book_campaign_id:
        print("   ⚠️ Environment variable not set - using fallback value")
    
    print(f"\n🔧 To fix in Render:")
    print(f"   1. Go to Render dashboard")
    print(f"   2. Navigate to your service")
    print(f"   3. Go to Environment tab")
    print(f"   4. Update GETRESPONSE_CAMPAIGN_ID to: 50yn9")
    print(f"   5. Redeploy the service")

if __name__ == "__main__":
    check_environment_variables()

