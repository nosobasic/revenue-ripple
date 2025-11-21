#!/usr/bin/env python3
"""
Surgical script to update ONLY GetResponse contacts that are missing dayOfCycle
These are contacts that were added via API before we fixed the dayOfCycle parameter

NOTE: This script requires GETRESPONSE_API_KEY and GETRESPONSE_CAMPAIGN_ID environment variables.
      On Render.com, these are set in the environment. To run locally, ensure your .env file
      has these variables set, or run this script on Render.com via SSH or as a one-off task.
"""

import requests
import os
import time
from typing import List, Dict, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_getresponse_campaign_id():
    """Get the campaign ID from environment variable"""
    campaign_id = os.getenv("GETRESPONSE_CAMPAIGN_ID")
    if not campaign_id:
        print("❌ GETRESPONSE_CAMPAIGN_ID environment variable is required")
        return None
    return campaign_id

def get_all_contacts(api_key: str, campaign_id: str) -> List[Dict]:
    """Fetch all contacts from the GetResponse campaign"""
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    all_contacts = []
    page = 1
    per_page = 100  # GetResponse API limit
    
    print(f"📥 Fetching contacts from campaign {campaign_id}...")
    
    while True:
        try:
            url = f"https://api.getresponse.com/v3/contacts"
            params = {
                "campaigns[]": campaign_id,
                "perPage": per_page,
                "page": page
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                contacts = response.json()
                
                if not contacts:  # No more contacts
                    break
                
                all_contacts.extend(contacts)
                print(f"   Fetched page {page}: {len(contacts)} contacts (Total: {len(all_contacts)})")
                
                if len(contacts) < per_page:  # Last page
                    break
                
                page += 1
                time.sleep(0.5)  # Rate limiting
            else:
                print(f"❌ Error fetching contacts: {response.status_code}")
                print(f"Response: {response.text}")
                break
                
        except Exception as e:
            print(f"❌ Failed to fetch contacts: {str(e)}")
            break
    
    return all_contacts

def analyze_contacts(contacts: List[Dict]) -> Dict:
    """Analyze contacts to find those missing dayOfCycle"""
    missing_cycle = []
    has_cycle = []
    
    for contact in contacts:
        day_of_cycle = contact.get('dayOfCycle')
        
        # Check if dayOfCycle is None, null, or not present
        if day_of_cycle is None:
            missing_cycle.append(contact)
        else:
            has_cycle.append({
                'email': contact.get('email'),
                'dayOfCycle': day_of_cycle
            })
    
    return {
        'missing_cycle': missing_cycle,
        'has_cycle': has_cycle,
        'total': len(contacts)
    }

def update_contact_autoresponder(api_key: str, contact_id: str, email: str) -> bool:
    """Update a contact to add them to autoresponder cycle (dayOfCycle: 0)"""
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    body = {
        "dayOfCycle": 0
    }
    
    try:
        response = requests.patch(
            f"https://api.getresponse.com/v3/contacts/{contact_id}",
            json=body,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            return True
        else:
            print(f"   ⚠️ Failed to update {email}: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error updating {email}: {str(e)}")
        return False

def main():
    """Main function to surgically update only contacts missing dayOfCycle"""
    api_key = os.getenv("GETRESPONSE_API_KEY")
    if not api_key:
        print("❌ GETRESPONSE_API_KEY environment variable is required")
        return
    
    campaign_id = get_getresponse_campaign_id()
    if not campaign_id:
        return
    
    print("=" * 70)
    print("🔬 Surgical GetResponse Contact Autoresponder Update")
    print("   (Only updates contacts missing dayOfCycle)")
    print("=" * 70)
    print()
    
    # Fetch all contacts
    contacts = get_all_contacts(api_key, campaign_id)
    
    if not contacts:
        print("❌ No contacts found or failed to fetch contacts")
        return
    
    print(f"\n📊 Analyzing {len(contacts)} contacts...")
    print()
    
    # Analyze contacts
    analysis = analyze_contacts(contacts)
    
    missing = analysis['missing_cycle']
    has_cycle = analysis['has_cycle']
    
    print("=" * 70)
    print("📈 Analysis Results")
    print("=" * 70)
    print(f"✅ Contacts WITH autoresponder cycle: {len(has_cycle)}")
    print(f"❌ Contacts MISSING autoresponder cycle: {len(missing)}")
    print(f"📧 Total contacts: {len(contacts)}")
    print()
    
    if not missing:
        print("🎉 All contacts already have dayOfCycle set! Nothing to update.")
        return
    
    # Show sample of contacts that will be updated
    print("📋 Sample of contacts that will be updated (first 10):")
    print("-" * 70)
    for i, contact in enumerate(missing[:10], 1):
        email = contact.get('email', 'Unknown')
        name = contact.get('name', 'Unknown')
        created = contact.get('createdOn', 'Unknown')
        print(f"  {i}. {email} ({name}) - Created: {created}")
    
    if len(missing) > 10:
        print(f"  ... and {len(missing) - 10} more")
    
    print()
    print("=" * 70)
    
    # Ask for confirmation
    print(f"\n⚠️  Ready to update {len(missing)} contacts that are missing dayOfCycle")
    print("   These contacts will be set to dayOfCycle: 0 (start of autoresponder)")
    print()
    response = input("Continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("❌ Update cancelled")
        return
    
    print()
    print("🔄 Updating contacts...")
    print()
    
    # Update only contacts missing dayOfCycle
    updated = 0
    failed = 0
    
    for i, contact in enumerate(missing, 1):
        contact_id = contact.get('contactId')
        email = contact.get('email', 'Unknown')
        name = contact.get('name', 'Unknown')
        
        print(f"   [{i}/{len(missing)}] 🔄 {email} ({name})...", end=" ")
        
        if update_contact_autoresponder(api_key, contact_id, email):
            print("✅ Updated")
            updated += 1
        else:
            failed += 1
        
        # Rate limiting - update every 0.5 seconds
        if i < len(missing):
            time.sleep(0.5)
    
    print()
    print("=" * 70)
    print("📊 Update Summary")
    print("=" * 70)
    print(f"✅ Successfully updated: {updated}")
    print(f"❌ Failed: {failed}")
    print(f"📧 Total contacts needing update: {len(missing)}")
    print()
    
    if updated > 0:
        print(f"🎉 Successfully added {updated} contacts to autoresponder cycle!")
        print("   They will now receive the autoresponder sequence starting from day 0.")
    
    print("=" * 70)

if __name__ == "__main__":
    main()

