#!/usr/bin/env python3
"""
Command Center Feature Flag Test
Tests the Command Center API endpoints and feature flag functionality
"""

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_feature_flag():
    """Test Command Center feature flag functionality"""
    print("🧪 Testing Command Center Feature Flags\n")
    
    # Test health endpoint
    try:
        response = requests.get('http://localhost:5000/api/command-center/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health endpoint working")
            print(f"   Feature enabled: {data.get('feature_enabled', 'unknown')}")
            print(f"   Write mode: {data.get('write_mode', 'unknown')}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure Flask is running on localhost:5000")
        return
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
        return
    
    print()
    
    # Test agent catalog (should work if feature enabled)
    try:
        response = requests.get('http://localhost:5000/api/agents/catalog', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Agent catalog working")
            print(f"   Found {len(data.get('data', []))} agents")
        elif response.status_code == 403:
            print("⚠️  Agent catalog disabled (feature flag off)")
        else:
            print(f"❌ Agent catalog failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Agent catalog error: {e}")
    
    print()
    
    # Test agent list (requires auth - should fail gracefully)
    try:
        response = requests.post('http://localhost:5000/api/agents/list', 
                               json={}, 
                               headers={'Content-Type': 'application/json'},
                               timeout=5)
        if response.status_code == 401:
            print("✅ Agent list properly requires authentication")
        elif response.status_code == 403:
            print("⚠️  Agent list disabled (feature flag off)")
        else:
            print(f"❌ Agent list unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Agent list error: {e}")
    
    print()
    print("🎯 Feature Flag Test Complete")
    print("\nTo enable Command Center:")
    print("1. Set REVRIPPLE_COMMAND_CENTER_ENABLED=true in your environment")
    print("2. Restart your Flask server")
    print("3. Run this test again")

if __name__ == "__main__":
    test_feature_flag()
