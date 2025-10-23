#!/usr/bin/env python3
"""
Test script for n8n webhook integration
Run this to test your n8n workflow webhook callback
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BACKEND_URL = "https://revenue-ripple.onrender.com"
WEBHOOK_SECRET = os.getenv("N8N_WEBHOOK_SECRET", "test-secret-key")

def test_webhook_callback():
    """Test the n8n webhook callback endpoint"""
    
    # Test payload (simulates what n8n would send)
    payload = {
        "user_id": "test-user-123",
        "instance_id": "test-instance-456", 
        "agent_id": "daily-pulse",
        "status": "completed",
        "started_at": datetime.now().isoformat(),
        "finished_at": datetime.now().isoformat(),
        "output_json": {
            "metrics": {
                "mrr": 15000,
                "new_signups": 25,
                "conversion_rate": 3.2
            },
            "summary": "Daily metrics generated successfully"
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Secret": WEBHOOK_SECRET
    }
    
    try:
        print("🧪 Testing n8n webhook callback...")
        print(f"📡 URL: {BACKEND_URL}/api/webhooks/n8n/run-callback")
        print(f"🔑 Secret: {WEBHOOK_SECRET}")
        print(f"📦 Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            f"{BACKEND_URL}/api/webhooks/n8n/run-callback",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📄 Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Webhook test successful!")
            return True
        else:
            print("❌ Webhook test failed!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_command_center_health():
    """Test the Command Center health endpoint"""
    
    try:
        print("\n🏥 Testing Command Center health...")
        response = requests.get(f"{BACKEND_URL}/api/command-center/health", timeout=10)
        
        print(f"📊 Health Status: {response.status_code}")
        print(f"📄 Health Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Command Center is healthy!")
            return True
        else:
            print("❌ Command Center health check failed!")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 n8n Webhook Integration Test")
    print("=" * 50)
    
    # Test health first
    health_ok = test_command_center_health()
    
    if health_ok:
        # Test webhook
        webhook_ok = test_webhook_callback()
        
        if webhook_ok:
            print("\n🎉 All tests passed! Your n8n workflow should work.")
        else:
            print("\n⚠️  Webhook test failed. Check your configuration.")
    else:
        print("\n❌ Command Center is not healthy. Check your backend.")
    
    print("\n📝 Next steps:")
    print("1. Configure your n8n workflow with the credentials above")
    print("2. Set the webhook secret in your backend environment")
    print("3. Test the full workflow from Command Center")

