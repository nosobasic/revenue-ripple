#!/usr/bin/env python3
"""
Check GetResponse contacts to verify if test contact was added
"""

import requests
import json

def check_getresponse_contacts():
    """Check contacts in the GetResponse campaign"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    print("🔍 Checking contacts in your GetResponse campaign...")
    
    try:
        # Get contacts from the specific campaign
        response = requests.get(f"https://api.getresponse.com/v3/contacts?campaigns[]={campaign_id}", headers=headers)
        
        if response.status_code == 200:
            contacts = response.json()
            print(f"✅ Successfully retrieved contacts!")
            print(f"📊 Total contacts in campaign {campaign_id}: {len(contacts)}")
            
            if contacts:
                print(f"\n📋 Recent contacts:")
                for i, contact in enumerate(contacts[:5]):  # Show last 5 contacts
                    print(f"  {i+1}. {contact.get('name', 'No name')} - {contact.get('email', 'No email')}")
                    print(f"     Added: {contact.get('createdOn', 'Unknown date')}")
                
                # Check if test contact exists
                test_emails = ["test@example.com"]
                for contact in contacts:
                    if contact.get('email') in test_emails:
                        print(f"\n🎯 Found test contact: {contact.get('name')} - {contact.get('email')}")
                        print(f"   Created: {contact.get('createdOn')}")
                        return True
                
                print(f"\n⚠️ Test contact (test@example.com) not found in the list")
                return False
            else:
                print(f"\n📭 No contacts found in this campaign")
                return False
                
        else:
            print(f"❌ GetResponse API error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to check contacts: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 GetResponse Contacts Check")
    print("=" * 50)
    
    found_test_contact = check_getresponse_contacts()
    
    if found_test_contact:
        print(f"\n✅ Test contact was successfully added to your list!")
    else:
        print(f"\n❌ Test contact was NOT added to your list.")
        print(f"   This suggests there might be an issue with the contact addition process.")
    
    print("\n" + "=" * 50)
