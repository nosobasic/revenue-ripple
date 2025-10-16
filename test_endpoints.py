#!/usr/bin/env python3
"""
Quick test script to verify Founders Annual endpoints are working
"""
import requests
import json

# Test the endpoints locally
BASE_URL = "http://localhost:5001"
PROD_URL = "https://revenue-ripple.onrender.com"

def test_endpoint(url, endpoint, method="GET", data=None):
    """Test a single endpoint"""
    full_url = f"{url}{endpoint}"
    print(f"\n🔍 Testing {method} {full_url}")
    
    try:
        if method == "GET":
            response = requests.get(full_url, timeout=10)
        elif method == "POST":
            response = requests.post(full_url, json=data, timeout=10)
        elif method == "OPTIONS":
            response = requests.options(full_url, timeout=10)
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            try:
                json_data = response.json()
                print(f"   Response: {json_data}")
            except:
                print(f"   Response: {response.text[:100]}...")
        else:
            print(f"   Error: {response.text[:200]}...")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

def main():
    print("🧪 Testing Founders Annual Endpoints")
    print("=" * 50)
    
    # Test endpoints
    endpoints_to_test = [
        ("/api/founders-spots-remaining", "GET"),
        ("/api/founders-spots-remaining", "OPTIONS"),
        ("/api/founders-timer-start", "OPTIONS"),
        ("/create-founders-annual-session", "OPTIONS"),
    ]
    
    # Test both local and production
    for url in [BASE_URL, PROD_URL]:
        print(f"\n🌐 Testing against: {url}")
        print("-" * 30)
        
        for endpoint, method in endpoints_to_test:
            test_endpoint(url, endpoint, method)
    
    # Test POST with data
    print(f"\n🌐 Testing POST with data against: {PROD_URL}")
    print("-" * 30)
    test_endpoint(PROD_URL, "/api/founders-timer-start", "POST", {"identifier": "test_user"})

if __name__ == "__main__":
    main()
