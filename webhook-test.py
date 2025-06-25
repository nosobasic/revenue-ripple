#!/usr/bin/env python3
"""
Webhook Validation Test Script
This script helps test and validate webhook functionality for Revenue Ripple
"""

import requests
import json
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
WEBHOOK_URL = "https://your-domain.com/webhook"  # Replace with your actual webhook URL
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

def test_webhook_endpoint():
    """Test if the webhook endpoint is accessible"""
    print("🔍 Testing webhook endpoint accessibility...")
    
    try:
        # Try to access the webhook endpoint (should return 405 Method Not Allowed for GET)
        response = requests.get(WEBHOOK_URL, timeout=10)
        print(f"✅ Webhook endpoint accessible (Status: {response.status_code})")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Webhook endpoint not accessible: {e}")
        return False

def validate_webhook_signature():
    """Test webhook signature validation"""
    print("\n🔐 Testing webhook signature validation...")
    
    if not WEBHOOK_SECRET:
        print("❌ STRIPE_WEBHOOK_SECRET not configured")
        return False
    
    # Create a test payload
    test_payload = {
        "id": "evt_test_webhook",
        "object": "event",
        "api_version": "2020-08-27",
        "created": 1643823006,
        "data": {
            "object": {
                "id": "cs_test_123",
                "object": "checkout.session",
                "customer_details": {
                    "email": "test@example.com"
                },
                "metadata": {
                    "referrer_username": "test_user",
                    "product": "digital_marketing_domination_book"
                },
                "amount_total": 700
            }
        },
        "livemode": False,
        "pending_webhooks": 1,
        "request": {
            "id": "req_test_123",
            "idempotency_key": None
        },
        "type": "checkout.session.completed"
    }
    
    try:
        # Create a webhook signature
        import time
        import hmac
        import hashlib
        
        timestamp = str(int(time.time()))
        payload_str = json.dumps(test_payload)
        signed_payload = f"{timestamp}.{payload_str}"
        
        signature = hmac.new(
            WEBHOOK_SECRET.encode('utf-8'),
            signed_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        headers = {
            'Content-Type': 'application/json',
            'Stripe-Signature': f't={timestamp},v1={signature}'
        }
        
        response = requests.post(WEBHOOK_URL, 
                               data=payload_str, 
                               headers=headers, 
                               timeout=10)
        
        if response.status_code == 200:
            print("✅ Webhook signature validation working correctly")
            return True
        else:
            print(f"❌ Webhook returned status: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing webhook signature: {e}")
        return False

def test_stripe_connection():
    """Test Stripe API connection"""
    print("\n💳 Testing Stripe API connection...")
    
    if not STRIPE_SECRET_KEY:
        print("❌ STRIPE_SECRET_KEY not configured")
        return False
    
    try:
        # Test Stripe connection by retrieving account info
        account = stripe.Account.retrieve()
        print(f"✅ Connected to Stripe account: {account.id}")
        print(f"   Business name: {account.business_profile.name}")
        print(f"   Country: {account.country}")
        return True
    except Exception as e:
        print(f"❌ Stripe connection failed: {e}")
        return False

def check_required_env_vars():
    """Check if all required environment variables are set"""
    print("🔧 Checking environment variables...")
    
    required_vars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
        else:
            print(f"✅ {var} is set")
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        return False
    
    return True

def test_supabase_connection():
    """Test Supabase connection"""
    print("\n🗄️  Testing Supabase connection...")
    
    try:
        from supabase import create_client
        
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("❌ Supabase credentials not configured")
            return False
        
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Test connection by checking users table
        response = supabase.table("users").select("id").limit(1).execute()
        print("✅ Supabase connection successful")
        print(f"   Found {len(response.data)} users in test query")
        return True
        
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

def main():
    """Run all webhook validation tests"""
    print("🚀 Revenue Ripple Webhook Validation Test")
    print("=" * 50)
    
    # Run all tests
    tests = [
        check_required_env_vars,
        test_stripe_connection,
        test_supabase_connection,
        test_webhook_endpoint,
        validate_webhook_signature
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Webhook system is ready for production.")
    else:
        print("⚠️  Some tests failed. Please fix the issues before going live.")
    
    print("\n📝 Webhook Configuration Summary:")
    print(f"   Webhook URL: {WEBHOOK_URL}")
    print(f"   Events to listen for:")
    print(f"   - checkout.session.completed")
    print(f"   - invoice.payment_succeeded")
    print(f"   - customer.subscription.updated")

if __name__ == "__main__":
    main()