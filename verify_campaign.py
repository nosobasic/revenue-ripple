#!/usr/bin/env python3
"""
Verify campaign details and check for any restrictions
"""

import requests
import json

def verify_campaign():
    """Verify campaign details and check for restrictions"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    print("🔍 Verifying campaign details...")
    
    try:
        # Get campaign details
        response = requests.get(f"https://api.getresponse.com/v3/campaigns/{campaign_id}", headers=headers)
        
        if response.status_code == 200:
            campaign = response.json()
            print(f"✅ Campaign details retrieved!")
            print(f"📊 Campaign Info:")
            print(f"   Name: {campaign.get('name', 'Unknown')}")
            print(f"   ID: {campaign.get('campaignId', 'Unknown')}")
            print(f"   Language: {campaign.get('languageCode', 'Unknown')}")
            print(f"   Timezone: {campaign.get('timezone', 'Unknown')}")
            print(f"   Is Default: {campaign.get('isDefault', 'Unknown')}")
            print(f"   Created: {campaign.get('createdOn', 'Unknown')}")
            
            # Check if there are any restrictions
            if 'optinTypes' in campaign:
                print(f"   Opt-in Types: {campaign['optinTypes']}")
            
            return campaign
        else:
            print(f"❌ Failed to get campaign details: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error getting campaign details: {str(e)}")
        return None

def try_simple_contact():
    """Try adding a contact with minimal data"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Try with minimal data
    minimal_contact = {
        "email": "minimal-test@example.com",
        "campaign": {"campaignId": campaign_id}
    }
    
    print(f"\n🧪 Trying minimal contact addition...")
    print(f"📤 Data: {json.dumps(minimal_contact, indent=2)}")
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=minimal_contact, headers=headers)
        print(f"📥 Status: {response.status_code}")
        print(f"📥 Response: {response.text}")
        
        if response.status_code == 202:
            print(f"✅ Minimal contact accepted")
        else:
            print(f"❌ Minimal contact rejected")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🔍 GetResponse Campaign Verification")
    print("=" * 50)
    
    campaign = verify_campaign()
    if campaign:
        try_simple_contact()
    
    print("\n" + "=" * 50)
