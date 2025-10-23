#!/usr/bin/env python3
"""
Test script for Facebook Conversions API integration
This script tests the Conversions API functionality without affecting real data
"""

import requests
import json
import time

# Configuration
FACEBOOK_PIXEL_ID = "474617768829501"
FACEBOOK_ACCESS_TOKEN = "EAAaorhtVhdIBPtZCpGyZBnDES7bo8KmhDbCXZAmhctKQcyyuhZCcivpkGu1QrV4kxahttmlzGI6ePE93GR0v28K8FOjt2cy1pZB9uCJ5h4KCvzOdv8BEZBRL1Ggb3gdL0IkahZCx73ipxZANHralNdKAtQN98gjINqlUCoyWCBz7xzORUY6hrAmpHfVQ37rKhwZDZD"
CONVERSIONS_API_URL = f"https://graph.facebook.com/v23.0/{FACEBOOK_PIXEL_ID}/events"

def test_conversions_api():
    """Test the Conversions API with a sample Lead event"""
    
    # Test data (using test email to avoid affecting real data)
    test_data = {
        "data": [
            {
                "event_name": "Lead",
                "event_time": int(time.time()),
                "event_id": "test_event_123",
                "action_source": "website",
                "user_data": {
                    "em": "test@example.com",  # This should be hashed in real implementation
                    "ph": "1234567890"        # This should be hashed in real implementation
                },
                "custom_data": {
                    "content_name": "Test Lead Generation",
                    "content_category": "Lead Generation",
                    "value": 7,
                    "currency": "USD"
                },
                "event_source_url": "https://revenueripple.org/test",
                "partner_agent": "revenue_ripple_1_0"
            }
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    print("🧪 Testing Facebook Conversions API...")
    print(f"📡 Sending to: {CONVERSIONS_API_URL}")
    print(f"📊 Test data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(CONVERSIONS_API_URL, json=test_data, headers=headers, timeout=10)
        
        print(f"\n📈 Response Status: {response.status_code}")
        print(f"📄 Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Conversions API test successful!")
            result = response.json()
            if 'events_received' in result:
                print(f"📊 Events received: {result['events_received']}")
            if 'messages' in result:
                print(f"💬 Messages: {result['messages']}")
        else:
            print("❌ Conversions API test failed!")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing Conversions API: {str(e)}")

def test_server_endpoint():
    """Test the server endpoint with a sample form submission"""
    
    test_payload = {
        "email": "test@example.com",
        "name": "Test User",
        "phone": "1234567890",
        "source": "test-variation"
    }
    
    print("\n🧪 Testing server endpoint...")
    print(f"📊 Test payload: {json.dumps(test_payload, indent=2)}")
    
    try:
        # Test against local server (adjust URL as needed)
        response = requests.post(
            "http://localhost:5001/api/getresponse/membership-mastery",
            json=test_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\n📈 Response Status: {response.status_code}")
        print(f"📄 Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Server endpoint test successful!")
        else:
            print("❌ Server endpoint test failed!")
            
    except Exception as e:
        print(f"❌ Error testing server endpoint: {str(e)}")
        print("💡 Make sure the server is running on localhost:5001")

if __name__ == "__main__":
    print("🚀 Facebook Conversions API Integration Test")
    print("=" * 50)
    
    # Test Conversions API directly
    test_conversions_api()
    
    # Test server endpoint (optional - requires running server)
    print("\n" + "=" * 50)
    print("💡 To test the server endpoint, make sure your server is running:")
    print("   python server.py")
    print("   Then run this script again")
    
    # Uncomment the line below to test server endpoint
    # test_server_endpoint()
