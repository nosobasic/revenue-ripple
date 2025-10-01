#!/usr/bin/env python3
"""
Check for specific test contacts and see if they appear
"""

import requests
import json

def check_specific_contacts():
    """Check for specific test contacts"""
    api_key = "tnkyixvg8dxdsmwks2ll69y8k31zd7qg"
    campaign_id = "5lkFO"
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Test emails to look for
    test_emails = [
        "test@example.com",
        "debug-test@example.com", 
        "minimal-test@example.com"
    ]
    
    print("🔍 Checking for specific test contacts...")
    
    try:
        # Get all contacts from the campaign
        response = requests.get(f"https://api.getresponse.com/v3/contacts?campaigns[]={campaign_id}", headers=headers)
        
        if response.status_code == 200:
            contacts = response.json()
            print(f"📊 Total contacts in campaign: {len(contacts)}")
            
            # Check for test emails
            found_contacts = []
            for contact in contacts:
                email = contact.get('email', '').lower()
                if any(test_email.lower() in email for test_email in test_emails):
                    found_contacts.append(contact)
            
            if found_contacts:
                print(f"\n✅ Found {len(found_contacts)} test contacts:")
                for contact in found_contacts:
                    print(f"   📧 {contact.get('email')} - {contact.get('name', 'No name')}")
                    print(f"      Created: {contact.get('createdOn', 'Unknown')}")
                    print(f"      Status: {contact.get('origin', 'Unknown')}")
            else:
                print(f"\n❌ No test contacts found")
                print(f"   Looking for: {', '.join(test_emails)}")
                
                # Show some recent contacts to see the pattern
                print(f"\n📋 Recent contacts (last 3):")
                for i, contact in enumerate(contacts[:3]):
                    print(f"   {i+1}. {contact.get('email')} - {contact.get('name', 'No name')}")
                    print(f"      Created: {contact.get('createdOn', 'Unknown')}")
                    print(f"      Origin: {contact.get('origin', 'Unknown')}")
            
            return len(found_contacts) > 0
            
        else:
            print(f"❌ Failed to get contacts: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error checking contacts: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Test Contacts Check")
    print("=" * 50)
    
    found = check_specific_contacts()
    
    if found:
        print(f"\n✅ Test contacts were successfully added!")
    else:
        print(f"\n❌ Test contacts were NOT added.")
        print(f"   This could mean:")
        print(f"   1. GetResponse has a delay in processing")
        print(f"   2. There are validation rules we're not meeting")
        print(f"   3. The campaign has specific requirements")
        print(f"   4. There's an issue with the API integration")
    
    print("\n" + "=" * 50)
