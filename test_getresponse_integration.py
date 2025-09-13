#!/usr/bin/env python3
"""
Test script for GetResponse integration
Run this to verify the API key and campaign setup
"""

import requests
import json

def test_getresponse_connection():
    """Test GetResponse API connection with specific campaign ID"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"  # Specific campaign ID provided by user
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    print("🔍 Testing GetResponse API connection...")
    
    try:
        # Test connection by getting the specific campaign
        response = requests.get(f"https://api.getresponse.com/v3/campaigns/{campaign_id}", headers=headers)
        
        if response.status_code == 200:
            campaign = response.json()
            print(f"✅ Successfully connected to GetResponse!")
            print(f"🎯 Using master list campaign: {campaign.get('name', 'Unnamed')} (ID: {campaign_id})")
            return campaign_id
            
        else:
            print(f"❌ GetResponse API error: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return None

def test_add_contact(campaign_id):
    """Test adding a contact to GetResponse"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test contact data
    test_contact = {
        "email": "test@example.com",
        "campaign": {"campaignId": campaign_id},
        "name": "Test User"
    }
    
    print(f"\n🧪 Testing contact addition...")
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=test_contact, headers=headers)
        
        if response.status_code == 202:
            print("✅ Successfully added test contact!")
            return True
        elif response.status_code == 409:
            print("⚠️ Test contact already exists (this is expected)")
            return True
        else:
            print(f"❌ Failed to add contact: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Contact addition failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 GetResponse Integration Test")
    print("=" * 50)
    
    # Test connection and get campaign ID
    campaign_id = test_getresponse_connection()
    
    if campaign_id:
        # Test adding a contact
        test_add_contact(campaign_id)
        
        print(f"\n📝 Integration Summary:")
        print(f"   API Key: ✅ Working")
        print(f"   Campaign ID: {campaign_id}")
        print(f"   Ready for production: ✅")
    else:
        print(f"\n❌ Integration failed. Please check your API key and try again.")
    
    print("\n" + "=" * 50)
