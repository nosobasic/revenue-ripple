from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import stripe
import os
import requests
import uuid
import secrets
from datetime import datetime, timedelta
import hashlib

from dotenv import load_dotenv
from ai_assistant import ai_assistant_bp
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Make Supabase optional for testing
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized")
    except Exception as e:
        print(f"⚠️ Supabase connection failed: {e}")
        supabase = None
else:
    print("⚠️ Supabase credentials not found - using mock data for testing")

app = Flask(__name__)
CORS(app)

# Stripe secret key
stripe_key = os.getenv("STRIPE_SECRET_KEY")
if stripe_key:
    stripe.api_key = stripe_key
    print("✅ Stripe client initialized")
else:
    print("⚠️ Stripe key not found - payment endpoints will be disabled")

app.register_blueprint(ai_assistant_bp)

# Mock storage for testing when Supabase is not available
mock_data = {
    'users': [
        {'id': '1', 'email': 'test@example.com', 'role': 'admin', 'status': 'active', 'created_at': '2024-01-01T00:00:00Z'},
        {'id': '2', 'email': 'user@example.com', 'role': 'member', 'status': 'active', 'created_at': '2024-01-02T00:00:00Z'},
    ],
    'subscriptions': [
        {'id': '1', 'email': 'user@example.com', 'amount': 47, 'tier': 'membership', 'subscribed_at': '2024-01-01T00:00:00Z'},
    ],
    'commissions': [
        {'id': '1', 'referrer_username': 'affiliate1', 'commission': 23.50, 'tier': 'membership', 'created_at': '2024-01-01T00:00:00Z'},
    ],
    'api_keys': []
}

def get_data(table):
    """Get data from Supabase or mock data"""
    if supabase:
        try:
            response = supabase.table(table).select("*").execute()
            return response.data or []
        except Exception as e:
            print(f"Error accessing {table}: {e}")
            return mock_data.get(table, [])
    else:
        return mock_data.get(table, [])

def insert_data(table, data):
    """Insert data to Supabase or mock storage"""
    if supabase:
        try:
            response = supabase.table(table).insert(data).execute()
            return response.data
        except Exception as e:
            print(f"Error inserting to {table}: {e}")
            # Fall back to mock storage
            if table not in mock_data:
                mock_data[table] = []
            mock_data[table].append(data)
            return [data]
    else:
        if table not in mock_data:
            mock_data[table] = []
        mock_data[table].append(data)
        return [data]

@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
    if not stripe_key:
        return jsonify(error="Stripe not configured"), 503
    try:
        intent = stripe.PaymentIntent.create(
            amount=4700,  # $47.00 in cents
            currency='usd',
            automatic_payment_methods={'enabled': True},
        )
        return jsonify({'clientSecret': intent.client_secret})
    except Exception as e:
        return jsonify(error=str(e)), 403

@app.route('/create-tripwire-session', methods=['POST'])
def create_tripwire_session():
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1RKIXE2Ku9STqdAdktgTsVDf',  # $7 Tripwire price
                'quantity': 1,
            }],
            mode='payment',
            success_url='https://revenueripple.org/tripwire-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/tripwire-cancel',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'digital_marketing_domination_book'
            }
        )
        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Membership Subscription Checkout Session
@app.route('/create-pro-reseller-session', methods=['POST'])
def create_pro_reseller_session():
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')
        three_months_free = data.get('three_months_free', False)

        # Create a coupon for 3 months free if requested
        coupon = None
        if three_months_free:
            coupon = stripe.Coupon.create(
                duration='repeating',
                duration_in_months=3,
                percent_off=100,
                name='3 Months Free Pro Reseller'
            )

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1RKNpS2Ku9STqdAdLoP8qgb4',  # Pro Reseller $97/month Price ID
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://revenueripple.org/pro-reseller-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/pro-reseller-cancel',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'pro_reseller_subscription',
                'three_months_free': str(three_months_free)
            },
            discounts=[{'coupon': coupon.id}] if coupon else None
        )
        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/create-reseller-session', methods=['POST'])
def create_reseller_session():
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1RKNYL2Ku9STqdAd5spylthl',  # Replace with your Reseller $47/month Price ID
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://revenueripple.org/reseller-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/reseller-cancel',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'reseller_subscription'
            }
        )
        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/create-membership-session', methods=['POST'])
def create_membership_session():
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1RKP5i2Ku9STqdAdEkkGTxet', 
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://revenueripple.org/membership-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/membership-cancel',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'membership_subscription'
            }
        )
        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except stripe.error.SignatureVerificationError:
        return abort(400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        referrer_username = session['metadata'].get('referrer_username')
        customer_email = session['customer_details']['email']
        amount_total = session['amount_total'] / 100

        product = session['metadata'].get('product')

        if product == "digital_marketing_domination_book":
            print(f"Tripwire bought by {customer_email} — Referrer: {referrer_username} — Amount: ${amount_total}")
            log_tripwire_purchase_to_supabase(customer_email, amount_total, referrer_username)
            add_contact_to_getresponse(customer_email, "tripwire")
            if referrer_username and referrer_username != 'none':
                log_commission(referrer_username, customer_email, "tripwire", amount_total)

        elif product in ["membership_subscription", "reseller_subscription", "pro_reseller_subscription"]:
            tier = product.replace("_subscription", "")
            print(f"{tier.capitalize()} subscription by {customer_email} — Referrer: {referrer_username} — Amount: ${amount_total}")
            log_subscription_to_supabase(customer_email, amount_total, referrer_username, tier)
            add_contact_to_getresponse(customer_email, tier)
            if referrer_username and referrer_username != 'none':
                log_commission(referrer_username, customer_email, tier, amount_total)
            if product == "membership_subscription":
                set_user_role(customer_email, "member")
            elif product == "reseller_subscription":
                set_user_role(customer_email, "reseller")
            elif product == "pro_reseller_subscription":
                set_user_role(customer_email, "pro_reseller")

    return jsonify({'status': 'success'})

def add_contact_to_getresponse(email, tag):
    api_key = os.getenv("GETRESPONSE_API_KEY")
    campaign_id = os.getenv("GETRESPONSE_CAMPAIGN_ID")

    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }

    body = {
        "email": email,
        "campaign": { "campaignId": campaign_id },
        "name": f"{tag.capitalize()} Buyer",
        "tags": [tag]
    }

    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers)
        if response.status_code == 202:
            print("✔️ Successfully added to GetResponse.")
        else:
            print(f"❌ GetResponse error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to add contact to GetResponse: {str(e)}")


# Log tripwire purchase to Supabase
def log_tripwire_purchase_to_supabase(email, amount, referrer_username):
    try:
        data = {
            "email": email,
            "amount": amount,
            "referrer_username": referrer_username
            # "purchased_at": "now()"  # Optional: Supabase default
        }
        response = supabase.table("tripwire_purchases").insert(data).execute()
        print("✅ Logged to Supabase:", response.data)
    except Exception as e:
        print("❌ Failed to log tripwire purchase:", str(e))

def log_subscription_to_supabase(email, amount, referrer_username, tier):
    try:
        data = {
            "email": email,
            "amount": amount,
            "referrer_username": referrer_username,
            "tier": tier,
            "subscribed_at": "now()"
        }
        response = supabase.table("subscriptions").insert(data).execute()
        print("✅ Logged subscription to Supabase:", response.data)
    except Exception as e:
        print("❌ Failed to log subscription:", str(e))

def log_commission(referrer_username, buyer_email, tier, amount):
    try:
        # Example: 50% commission
        commission = round(amount * 0.50, 2)

        data = {
            "referrer_username": referrer_username,
            "email": buyer_email,
            "tier": tier,
            "amount": amount,
            "commission": commission
            # "timestamp": "now()"  # Optional: Supabase default
        }

        response = supabase.table("commissions").insert(data).execute()
        print("✅ Logged commission to Supabase:", response.data)
    except Exception as e:
        print("❌ Failed to log commission:", str(e))

def set_user_role(email, role):
    try:
        response = supabase.table("users").select("id").eq("email", email).execute()
        if response.data and len(response.data) > 0:
            # User exists, update role and plan
            supabase.table("users").update({
                "role": role,
                "plan": role,
                "updated_at": "now()"
            }).eq("email", email).execute()
            print(f"✅ Updated role and plan to '{role}' for {email}")
        else:
            # User not found, create auth user first
            auth_response = supabase.auth.admin.create_user({
                "email": email,
                "email_confirm": True,
                "user_metadata": {
                    "role": role,
                    "plan": role
                }
            })
            
            if auth_response.user:
                # Then create user record
                supabase.table("users").insert({
                    "id": auth_response.user.id,
                    "email": email,
                    "role": role,
                    "plan": role,
                    "created_at": "now()"
                }).execute()
                print(f"✅ Created user with role and plan '{role}' for {email}")
            else:
                print(f"❌ Failed to create auth user for {email}")
    except Exception as e:
        print(f"❌ Failed to set role: {str(e)}")

@app.route('/your-existing-api/dashboard', methods=['GET'])
def dashboard_data():
    try:
        users = get_data("users")
        subscriptions = get_data("subscriptions")
        
        total_users = len(users)
        total_revenue = sum([s.get('amount', 0) for s in subscriptions])
        
        return jsonify({
            "users": {
                "total": total_users,
                "growthRate": 5.2,
                "trend": "up"
            },
            "revenue": {
                "total": total_revenue,
                "growthRate": 2.1,
                "trend": "stable"
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DevOps Integration API Key Management
@app.route('/api/devops/generate-key', methods=['POST'])
def generate_devops_api_key():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
            
        # Verify user is admin (simplified for testing)
        users = get_data("users")
        user = next((u for u in users if u['id'] == user_id), None)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        # Generate secure API key
        api_key = 'rr_' + secrets.token_urlsafe(32)
        
        # Store API key in database
        api_key_data = {
            'id': str(uuid.uuid4()),
            'api_key': hashlib.sha256(api_key.encode()).hexdigest(),  # Store hashed
            'user_id': user_id,
            'name': data.get('name', 'DevOps Integration Key'),
            'permissions': ['read_metrics', 'write_webhooks'],
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(days=365)).isoformat(),
            'last_used': None,
            'is_active': True
        }
        
        insert_data("api_keys", api_key_data)
        
        return jsonify({
            'api_key': api_key,  # Return unhashed key only once
            'key_id': api_key_data['id'],
            'permissions': api_key_data['permissions'],
            'expires_at': api_key_data['expires_at']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/devops/keys', methods=['GET'])
def list_devops_api_keys():
    try:
        user_id = request.headers.get('x-user-id')
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
            
        # Verify user is admin (simplified for testing)
        users = get_data("users")
        user = next((u for u in users if u['id'] == user_id), None)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
            
        # Get API keys (without exposing actual keys)
        api_keys = get_data("api_keys")
        user_keys = [k for k in api_keys if k.get('user_id') == user_id]
        
        # Remove sensitive data
        for key in user_keys:
            key.pop('api_key', None)
        
        return jsonify({'keys': user_keys})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DevOps Data Sync Endpoints
@app.route('/api/devops/sync/users', methods=['GET'])
def sync_users_to_devops():
    try:
        api_key = request.headers.get('x-api-key')
        if not verify_api_key(api_key, 'read_metrics'):
            return jsonify({'error': 'Invalid API key'}), 401
            
        # Get user metrics
        users = get_data("users")
        
        # Format for DevOps consumption
        user_metrics = {
            'timestamp': datetime.now().isoformat(),
            'total_users': len(users),
            'users_by_role': {},
            'users_by_status': {},
            'recent_signups': 0,
            'users': users
        }
        
        # Calculate metrics
        for user in users:
            role = user.get('role', 'member')
            status = user.get('status', 'inactive')
            
            user_metrics['users_by_role'][role] = user_metrics['users_by_role'].get(role, 0) + 1
            user_metrics['users_by_status'][status] = user_metrics['users_by_status'].get(status, 0) + 1
            
            # Recent signups (last 7 days)
            if user.get('created_at'):
                try:
                    created_date = datetime.fromisoformat(user['created_at'].replace('Z', '+00:00'))
                    if created_date > datetime.now() - timedelta(days=7):
                        user_metrics['recent_signups'] += 1
                except:
                    pass
        
        # Update API key last used
        update_api_key_usage(api_key)
        
        return jsonify(user_metrics)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/devops/sync/revenue', methods=['GET'])
def sync_revenue_to_devops():
    try:
        api_key = request.headers.get('x-api-key')
        if not verify_api_key(api_key, 'read_metrics'):
            return jsonify({'error': 'Invalid API key'}), 401
            
        # Get revenue data
        subscriptions = get_data("subscriptions")
        tripwire = get_data("tripwire_purchases")
        
        # Calculate revenue metrics
        total_revenue = sum([s.get('amount', 0) for s in subscriptions])
        tripwire_revenue = sum([t.get('amount', 0) for t in tripwire])
        
        # Monthly recurring revenue
        active_subscriptions = [s for s in subscriptions if s.get('tier') in ['membership', 'reseller', 'pro_reseller']]
        mrr = sum([s.get('amount', 0) for s in active_subscriptions])
        
        revenue_metrics = {
            'timestamp': datetime.now().isoformat(),
            'total_revenue': total_revenue + tripwire_revenue,
            'subscription_revenue': total_revenue,
            'tripwire_revenue': tripwire_revenue,
            'monthly_recurring_revenue': mrr,
            'active_subscriptions': len(active_subscriptions),
            'subscription_breakdown': {},
            'recent_transactions': []
        }
        
        # Subscription breakdown
        for sub in subscriptions:
            tier = sub.get('tier', 'unknown')
            if tier not in revenue_metrics['subscription_breakdown']:
                revenue_metrics['subscription_breakdown'][tier] = {'count': 0, 'revenue': 0}
            revenue_metrics['subscription_breakdown'][tier]['count'] += 1
            revenue_metrics['subscription_breakdown'][tier]['revenue'] += sub.get('amount', 0)
        
        update_api_key_usage(api_key)
        return jsonify(revenue_metrics)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/devops/sync/commissions', methods=['GET'])
def sync_commissions_to_devops():
    try:
        api_key = request.headers.get('x-api-key')
        if not verify_api_key(api_key, 'read_metrics'):
            return jsonify({'error': 'Invalid API key'}), 401
            
        # Get commission data
        commissions = get_data("commissions")
        
        commission_metrics = {
            'timestamp': datetime.now().isoformat(),
            'total_commissions': sum([c.get('commission', 0) for c in commissions]),
            'total_transactions': len(commissions),
            'top_performers': [],
            'commission_by_tier': {},
            'recent_commissions': commissions[-5:] if len(commissions) > 5 else commissions
        }
        
        # Calculate top performers
        performer_data = {}
        for commission in commissions:
            referrer = commission.get('referrer_username')
            if referrer:
                if referrer not in performer_data:
                    performer_data[referrer] = {'total': 0, 'count': 0}
                performer_data[referrer]['total'] += commission.get('commission', 0)
                performer_data[referrer]['count'] += 1
        
        # Sort and get top 10
        commission_metrics['top_performers'] = sorted(
            [{'username': k, 'total_commission': v['total'], 'transaction_count': v['count']} 
             for k, v in performer_data.items()],
            key=lambda x: x['total_commission'],
            reverse=True
        )[:10]
        
        update_api_key_usage(api_key)
        return jsonify(commission_metrics)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/devops/webhook', methods=['POST'])
def devops_webhook():
    try:
        api_key = request.headers.get('x-api-key')
        if not verify_api_key(api_key, 'write_webhooks'):
            return jsonify({'error': 'Invalid API key'}), 401
            
        data = request.get_json()
        
        # Log DevOps webhook data
        webhook_data = {
            'id': str(uuid.uuid4()),
            'source': 'devops_module',
            'event_type': data.get('event_type', 'unknown'),
            'data': data,
            'created_at': datetime.now().isoformat(),
            'processed': False
        }
        
        insert_data("webhook_log", webhook_data)
        
        update_api_key_usage(api_key)
        return jsonify({'status': 'success', 'webhook_id': webhook_data['id']})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper functions
def verify_api_key(api_key, required_permission):
    if not api_key or not api_key.startswith('rr_'):
        return False
        
    try:
        hashed_key = hashlib.sha256(api_key.encode()).hexdigest()
        api_keys = get_data("api_keys")
        
        key_data = next((k for k in api_keys if k.get('api_key') == hashed_key and k.get('is_active')), None)
        
        if not key_data:
            return False
            
        # Check expiration
        if key_data.get('expires_at'):
            try:
                expires_at = datetime.fromisoformat(key_data['expires_at'])
                if expires_at < datetime.now():
                    return False
            except:
                pass
        
        # Check permissions
        if required_permission not in key_data.get('permissions', []):
            return False
            
        return True
        
    except Exception as e:
        print(f"API key verification error: {e}")
        return False

def update_api_key_usage(api_key):
    try:
        hashed_key = hashlib.sha256(api_key.encode()).hexdigest()
        # In a real implementation, this would update the database
        print(f"API key used: {api_key[:10]}...")
    except Exception as e:
        print(f"Error updating API key usage: {e}")

if __name__ == '__main__':
    print("🚀 Starting Revenue Ripple DevOps Integration Server")
    print("📊 Available endpoints:")
    print("   - POST /api/devops/generate-key")
    print("   - GET  /api/devops/keys")
    print("   - GET  /api/devops/sync/users")
    print("   - GET  /api/devops/sync/revenue")
    print("   - GET  /api/devops/sync/commissions")
    print("   - POST /api/devops/webhook")
    app.run(debug=True, host='0.0.0.0', port=5000)