#!/usr/bin/env python3
"""
Test script for Revenue Ripple Insights Integration

This script tests the complete insights functionality including:
- Daily insights caching
- Quota enforcement for Core tier users
- API endpoints functionality
- Database operations
"""

import os
import sys
import requests
import json
import time
from datetime import date, datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
BASE_URL = "http://localhost:5000"  # Adjust if your Flask server runs on different port
TEST_USER_ID = "test-user-123"
TEST_BUSINESS_ID = "test-business-456"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/insights/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data.get('message', 'Unknown')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_daily_insight_caching():
    """Test daily insight caching functionality"""
    print("\n🔍 Testing daily insight caching...")
    
    # First request - should generate new insight
    print("  Making first request...")
    try:
        response = requests.get(
            f"{BASE_URL}/insights/api/daily",
            headers={"Authorization": f"Bearer test-token-{TEST_USER_ID}"},
            params={"business_id": TEST_BUSINESS_ID}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ First request successful: {data.get('title', 'No title')}")
            first_insight_id = data.get('id')
        else:
            print(f"  ❌ First request failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ First request error: {e}")
        return False
    
    # Second request - should return cached insight
    print("  Making second request (should be cached)...")
    try:
        response = requests.get(
            f"{BASE_URL}/insights/api/daily",
            headers={"Authorization": f"Bearer test-token-{TEST_USER_ID}"},
            params={"business_id": TEST_BUSINESS_ID}
        )
        
        if response.status_code == 200:
            data = response.json()
            second_insight_id = data.get('id')
            if second_insight_id == first_insight_id:
                print("  ✅ Caching working correctly - same insight returned")
                return True
            else:
                print("  ❌ Caching not working - different insights returned")
                return False
        else:
            print(f"  ❌ Second request failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ Second request error: {e}")
        return False

def test_quota_enforcement():
    """Test quota enforcement for Core tier users"""
    print("\n🔍 Testing quota enforcement...")
    
    # Simulate Core tier user making multiple requests
    core_user_id = "core-user-123"
    current_month = date.today().replace(day=1)
    
    print(f"  Testing Core tier user (limit: 10 insights/month)")
    
    success_count = 0
    quota_exceeded = False
    
    for i in range(12):  # Try 12 requests (should fail after 10)
        try:
            response = requests.get(
                f"{BASE_URL}/insights/api/daily",
                headers={"Authorization": f"Bearer test-token-{core_user_id}"},
                params={"business_id": TEST_BUSINESS_ID}
            )
            
            if response.status_code == 200:
                success_count += 1
                print(f"    Request {i+1}: ✅ Success")
            elif response.status_code == 403:
                data = response.json()
                if data.get('code') == 'QUOTA_EXCEEDED':
                    quota_exceeded = True
                    print(f"    Request {i+1}: ✅ Quota exceeded (expected)")
                    break
                else:
                    print(f"    Request {i+1}: ❌ Unexpected 403: {data}")
                    return False
            else:
                print(f"    Request {i+1}: ❌ Unexpected status: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"    Request {i+1}: ❌ Error: {e}")
            return False
    
    if quota_exceeded and success_count <= 10:
        print(f"  ✅ Quota enforcement working correctly - {success_count} requests succeeded before quota exceeded")
        return True
    else:
        print(f"  ❌ Quota enforcement failed - {success_count} requests succeeded, quota exceeded: {quota_exceeded}")
        return False

def test_growth_tier_unlimited():
    """Test that Growth tier users have unlimited access"""
    print("\n🔍 Testing Growth tier unlimited access...")
    
    growth_user_id = "growth-user-123"
    
    print(f"  Testing Growth tier user (unlimited insights)")
    
    success_count = 0
    
    for i in range(5):  # Test 5 requests
        try:
            response = requests.get(
                f"{BASE_URL}/insights/api/daily",
                headers={"Authorization": f"Bearer test-token-{growth_user_id}"},
                params={"business_id": TEST_BUSINESS_ID}
            )
            
            if response.status_code == 200:
                success_count += 1
                print(f"    Request {i+1}: ✅ Success")
            else:
                print(f"    Request {i+1}: ❌ Failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"    Request {i+1}: ❌ Error: {e}")
            return False
    
    if success_count == 5:
        print(f"  ✅ Growth tier unlimited access working correctly - all {success_count} requests succeeded")
        return True
    else:
        print(f"  ❌ Growth tier unlimited access failed - only {success_count}/5 requests succeeded")
        return False

def test_api_endpoints():
    """Test all API endpoints"""
    print("\n🔍 Testing API endpoints...")
    
    endpoints = [
        ("/insights/api/prompts", "GET"),
        ("/insights/api/suggestions", "GET"),
        ("/insights/api/competitors", "GET"),
        ("/insights/api/analytics", "GET"),
        ("/insights/api/limits", "GET"),
    ]
    
    success_count = 0
    
    for endpoint, method in endpoints:
        try:
            if method == "GET":
                response = requests.get(
                    f"{BASE_URL}{endpoint}",
                    headers={"Authorization": f"Bearer test-token-{TEST_USER_ID}"}
                )
            
            if response.status_code in [200, 403]:  # 403 is expected for some endpoints based on tier
                print(f"  ✅ {method} {endpoint}: {response.status_code}")
                success_count += 1
            else:
                print(f"  ❌ {method} {endpoint}: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ {method} {endpoint}: Error - {e}")
    
    if success_count == len(endpoints):
        print(f"  ✅ All {success_count} endpoints responded correctly")
        return True
    else:
        print(f"  ❌ Only {success_count}/{len(endpoints)} endpoints responded correctly")
        return False

def test_environment_toggle():
    """Test that the environment toggle works"""
    print("\n🔍 Testing environment toggle...")
    
    # Check if VITE_USE_FLASK_INSIGHTS is set
    flask_insights_enabled = os.getenv("VITE_USE_FLASK_INSIGHTS", "false").lower() == "true"
    
    if flask_insights_enabled:
        print("  ✅ VITE_USE_FLASK_INSIGHTS is enabled")
        return True
    else:
        print("  ⚠️  VITE_USE_FLASK_INSIGHTS is disabled (set to 'true' to enable Flask insights)")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Revenue Ripple Insights Integration Tests")
    print("=" * 60)
    
    tests = [
        ("Health Check", test_health_check),
        ("Environment Toggle", test_environment_toggle),
        ("API Endpoints", test_api_endpoints),
        ("Daily Insight Caching", test_daily_insight_caching),
        ("Quota Enforcement", test_quota_enforcement),
        ("Growth Tier Unlimited", test_growth_tier_unlimited),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Insights integration is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
