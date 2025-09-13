#!/usr/bin/env python3
"""
Try adding contact with realistic email address
"""

import requests
import json

def try_realistic_email():
    """Try adding contact with realistic email"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try with realistic email
    realistic_contact = {
        "email": "john.doe.realistic.test@gmail.com",
        "campaign": {"campaignId": campaign_id},
        "name": "John Doe Test"
    }
    
    print("🧪 Trying contact addition with realistic email...")
    print(f"📤 Data: {json.dumps(realistic_contact, indent=2)}")
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=realistic_contact, headers=headers)
        print(f"📥 Status: {response.status_code}")
        print(f"📥 Response: {response.text}")
        
        if response.status_code == 202:
            print(f"✅ Realistic contact accepted")
            return True
        else:
            print(f"❌ Realistic contact rejected")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 GetResponse Realistic Contact Test")
    print("=" * 50)
    
    success = try_realistic_email()
    
    if success:
        print(f"\n⏳ Waiting 15 seconds to check if contact appears...")
        import time
        time.sleep(15)
        
        # Check if the contact appears
        print(f"\n🔍 Checking for the realistic contact...")
        # This would need the check function, but let's just note it for now
        print(f"   Check your GetResponse dashboard for: john.doe.realistic.test@gmail.com")
    
    print("\n" + "=" * 50)
