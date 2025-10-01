#!/usr/bin/env python3
"""
Try adding contact with origin specified
"""

import requests
import json

def try_with_origin():
    """Try adding contact with origin specified"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try with origin specified
    contact_with_origin = {
        "email": "origin-test@example.com",
        "campaign": {"campaignId": campaign_id},
        "name": "Origin Test User",
        "origin": "api"
    }
    
    print("🧪 Trying contact addition with origin specified...")
    print(f"📤 Data: {json.dumps(contact_with_origin, indent=2)}")
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=contact_with_origin, headers=headers)
        print(f"📥 Status: {response.status_code}")
        print(f"📥 Response: {response.text}")
        
        if response.status_code == 202:
            print(f"✅ Contact with origin accepted")
        else:
            print(f"❌ Contact with origin rejected")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def try_with_optin():
    """Try adding contact with opt-in specified"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try with opt-in specified
    contact_with_optin = {
        "email": "optin-test@example.com",
        "campaign": {"campaignId": campaign_id},
        "name": "Opt-in Test User",
        "optinTypes": ["api"]
    }
    
    print(f"\n🧪 Trying contact addition with opt-in specified...")
    print(f"📤 Data: {json.dumps(contact_with_optin, indent=2)}")
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=contact_with_optin, headers=headers)
        print(f"📥 Status: {response.status_code}")
        print(f"📥 Response: {response.text}")
        
        if response.status_code == 202:
            print(f"✅ Contact with opt-in accepted")
        else:
            print(f"❌ Contact with opt-in rejected")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🔍 GetResponse Contact Addition with Origin/Opt-in")
    print("=" * 50)
    
    try_with_origin()
    try_with_optin()
    
    print("\n" + "=" * 50)
