#!/usr/bin/env python3
"""
Debug GetResponse contact addition to see what's happening
"""

import requests
import json

def debug_contact_addition():
    """Debug the contact addition process"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test contact data
    test_contact = {
        "email": "debug-test@example.com",
        "campaign": {"campaignId": campaign_id},
        "name": "Debug Test User"
    }
    
    print("🔍 Debugging GetResponse contact addition...")
    print(f"📤 Sending contact data: {json.dumps(test_contact, indent=2)}")
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=test_contact, headers=headers)
        
        print(f"\n📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        print(f"📥 Response Body: {response.text}")
        
        if response.status_code == 202:
            print(f"\n✅ Contact addition accepted (202)")
            # Check if there's a location header with the contact ID
            location = response.headers.get('Location')
            if location:
                print(f"📍 Contact location: {location}")
                # Try to get the contact details
                contact_response = requests.get(location, headers=headers)
                print(f"📋 Contact details: {contact_response.text}")
        elif response.status_code == 409:
            print(f"\n⚠️ Contact already exists (409)")
        else:
            print(f"\n❌ Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

if __name__ == "__main__":
    print("🔍 GetResponse Contact Addition Debug")
    print("=" * 50)
    
    debug_contact_addition()
    
    print("\n" + "=" * 50)
