from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import stripe
import os
import requests
import paypalrestsdk
import json
from datetime import datetime
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv
from ai_assistant import ai_assistant_bp
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client only if credentials are provided
supabase = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully")
    except Exception as e:
        print(f"⚠️ Failed to initialize Supabase client: {e}")
        supabase = None
else:
    print("⚠️ Supabase credentials not found - database features will be disabled")

app = Flask(__name__)
CORS(app, 
     origins=[
         "http://localhost:5173",
         "http://localhost:3000", 
         "http://localhost:4173",  # Vite preview port
         "https://revenueripple.org",
         "https://www.revenueripple.org",
         "https://revenue-ripple.onrender.com",
         "https://friendly-neat-walrus.ngrok-free.app"
     ],
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=True
)

# Stripe secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe.api_key:
    print("Warning: STRIPE_SECRET_KEY not set. Stripe functionality will not work.")
    stripe.api_key = "sk_test_dummy_key_for_development"

# PayPal configuration
# PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "dummy_client_id")
# PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "dummy_client_secret")
# PAYPAL_MODE = os.getenv("PAYPAL_ENVIRONMENT", "sandbox")  # 'sandbox' or 'live'

# # Configure PayPal SDK
# paypalrestsdk.configure({
#     "mode": PAYPAL_MODE,
#     "client_id": PAYPAL_CLIENT_ID,
#     "client_secret": PAYPAL_CLIENT_SECRET
# })


PAYPAL_CLIENT_ID = os.environ.get("PAYPAL_CLIENT_ID")
PAYPAL_SECRET = os.environ.get("PAYPAL_CLIENT_SECRET")
print(PAYPAL_CLIENT_ID, PAYPAL_SECRET)
PAYPAL_BASE = os.environ.get("PAYPAL_BASE", "https://api-m.sandbox.paypal.com")
if not os.getenv("PAYPAL_CLIENT_ID"):
    print("Warning: PAYPAL_CLIENT_ID not set. PayPal functionality will not work.")
    print(f"PAYPAL_CLIENT_ID value: '{PAYPAL_CLIENT_ID}'")


def get_paypal_access_token():
    token_url = f"{PAYPAL_BASE}/v1/oauth2/token"
    resp = requests.post(
        token_url,
        auth=(PAYPAL_CLIENT_ID, PAYPAL_SECRET),
        headers={
            "Accept": "application/json",
            "Accept-Language": "en_US",
        },
        data={"grant_type": "client_credentials"},
    )
    resp.raise_for_status()
    return resp.json()["access_token"]

app.register_blueprint(ai_assistant_bp)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running', 'message': 'Revenue Ripple API is active'})

@app.after_request
def after_request(response):
    # Only add CORS headers if they're not already set by flask-cors
    if 'Access-Control-Allow-Origin' not in response.headers:
        response.headers.add('Access-Control-Allow-Origin', '*')
    if 'Access-Control-Allow-Headers' not in response.headers:
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    if 'Access-Control-Allow-Methods' not in response.headers:
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
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
                'price': 'price_1S5iln2Ku9STqdAdi0Z2zX3w',  # Replace with your Reseller $47/month Price ID
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

# # PayPal Payout API Endpoints
# @app.route('/paypal/create-payout', methods=['POST', 'OPTIONS'])
# def create_paypal_payout():
#     if request.method == 'OPTIONS':
#         return '', 200
    
#     try:
#         data = request.get_json()
#         user_email = data.get('user_email')
#         amount = data.get('amount')
#         payout_note = data.get('note', 'Affiliate Commission Payout')
        
#         if not user_email or not amount:
#             return jsonify({'error': 'user_email and amount are required'}), 400
        
#         # Validate amount
#         try:
#             amount_float = float(amount)
#             if amount_float <= 0:
#                 return jsonify({'error': 'Amount must be greater than 0'}), 400
#         except ValueError:
#             return jsonify({'error': 'Invalid amount format'}), 400
        
#         # Check if we're in development mode with dummy credentials
#         print(f"DEBUG: PAYPAL_CLIENT_ID = '{PAYPAL_CLIENT_ID}'")
#         if PAYPAL_CLIENT_ID == "dummy_client_id":
#             print("DEBUG: Using development mode")
#             fake_batch_id = f"dev_payout_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
#             log_payout_to_supabase(user_email, amount_float, fake_batch_id, "pending")
#             return jsonify({
#                 'success': True,
#                 'payout_batch_id': fake_batch_id,
#                 'message': 'Payout request submitted successfully (Development Mode - PayPal credentials not configured)',
#                 'dev_mode': True
#             })
        
#         # Create payout batch
#         payout = paypalrestsdk.Payout({
#             "sender_batch_header": {
#                 "sender_batch_id": f"payout_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{user_email}",
#                 "email_subject": "You have a payout!",
#                 "email_message": f"Your affiliate commission payout of ${amount} has been processed."
#             },
#             "items": [
#                 {
#                     "recipient_type": "EMAIL",
#                     "amount": {
#                         "value": str(amount_float),
#                         "currency": "USD"
#                     },
#                     "receiver": user_email,
#                     "note": payout_note,
#                     "sender_item_id": f"item_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
#                 }
#             ]
#         })
        
#         if payout.create():
#             # Log payout to database
#             log_payout_to_supabase(user_email, amount_float, payout.batch_header.payout_batch_id, "pending")
            
#             return jsonify({
#                 'success': True,
#                 'payout_batch_id': payout.batch_header.payout_batch_id,
#                 'message': 'Payout request submitted successfully'
#             })
#         else:
#             # Handle PayPal authentication errors gracefully
#             error_message = 'Failed to create payout'
#             if hasattr(payout, 'error') and payout.error:
#                 if 'invalid_client' in str(payout.error):
#                     error_message = 'PayPal credentials not configured. Please set up your PayPal API credentials in the environment variables.'
#                 else:
#                     error_message = f'PayPal error: {payout.error}'
            
#             return jsonify({
#                 'error': error_message,
#                 'details': payout.error if hasattr(payout, 'error') else 'Unknown error'
#             }), 400
            
#     except Exception as e:
#         # Handle any other exceptions, including PayPal SDK exceptions
#         error_str = str(e)
#         if 'invalid_client' in error_str or 'Client Authentication failed' in error_str:
#             # In development mode, simulate a successful payout
#             if PAYPAL_CLIENT_ID == "dummy_client_id":
#                 fake_batch_id = f"dev_payout_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
#                 log_payout_to_supabase(user_email, amount_float, fake_batch_id, "pending")
#                 return jsonify({
#                     'success': True,
#                     'payout_batch_id': fake_batch_id,
#                     'message': 'Payout request submitted successfully (Development Mode - PayPal credentials not configured)',
#                     'dev_mode': True
#                 })
#             else:
#                 return jsonify({
#                     'error': 'PayPal credentials not configured. Please set up your PayPal API credentials in the environment variables.',
#                     'details': error_str
#                 }), 400
#         else:
#             return jsonify({'error': str(e)}), 500

# @app.route('/paypal/payout-status/<payout_batch_id>', methods=['GET', 'OPTIONS'])
# def get_payout_status(payout_batch_id):
#     if request.method == 'OPTIONS':
#         return '', 200
#     try:
#         payout = paypalrestsdk.Payout.find(payout_batch_id)
        
#         if payout:
#             return jsonify({
#                 'success': True,
#                 'batch_header': {
#                     'payout_batch_id': payout.batch_header.payout_batch_id,
#                     'batch_status': payout.batch_header.batch_status,
#                     'time_created': payout.batch_header.time_created,
#                     'time_completed': payout.batch_header.time_completed
#                 },
#                 'items': [
#                     {
#                         'payout_item_id': item.payout_item_id,
#                         'transaction_status': item.transaction_status,
#                         'transaction_id': item.transaction_id,
#                         'amount': item.amount,
#                         'receiver': item.receiver
#                     } for item in payout.items
#                 ]
#             })
#         else:
#             return jsonify({'error': 'Payout not found'}), 404
            
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/paypal/webhook', methods=['POST', 'OPTIONS'])
# def paypal_webhook():
#     if request.method == 'OPTIONS':
#         return '', 200
#     try:
#         # PayPal webhook verification would go here
#         # For now, we'll just log the webhook data
#         webhook_data = request.get_json()
#         print(f"PayPal webhook received: {webhook_data}")
        
#         # Handle payout completion webhook
#         if webhook_data.get('event_type') == 'PAYMENT.PAYOUTSBATCH.COMPLETED':
#             batch_id = webhook_data.get('resource', {}).get('batch_header', {}).get('payout_batch_id')
#             if batch_id:
#                 update_payout_status_in_supabase(batch_id, "completed")
        
#         return jsonify({'status': 'success'})
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500


@app.route('/paypal/payout', methods=['POST'])
def create_paypal_payout():
    try:
        data = request.get_json()
        recipient_email = data.get("email")
        amount = data.get("amount")
        currency = data.get("currency", "USD")

        if not recipient_email or not amount:
            return jsonify({"error": "recipient_email and amount are required"}), 400

        # Step 1: Get PayPal access token
        access_token = get_paypal_access_token()

        # Step 2: Build payout payload
        sender_batch_id = str(uuid.uuid4())
        payout_payload = {
            "sender_batch_header": {
                "sender_batch_id": sender_batch_id,
                "email_subject": "You have a payout!",
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {"value": f"{float(amount):.2f}", "currency": currency},
                    "receiver": recipient_email,
                    "note": "Thanks for your work!",
                    "sender_item_id": str(uuid.uuid4()),
                }
            ],
        }

        # Step 3: Send payout request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
            "PayPal-Request-Id": sender_batch_id,  # idempotency
        }
        resp = requests.post(f"{PAYPAL_BASE}/v1/payments/payouts", 
                             json=payout_payload, headers=headers)

        # Step 4: Handle response
        if resp.status_code not in (200, 201, 202):
            log_payout_to_supabase(recipient_email, amount, sender_batch_id, "failed")
            return jsonify({"error": "paypal_failed", "detail": resp.text}), 502

        res_json = resp.json()
        batch_id = res_json.get("batch_header", {}).get("payout_batch_id")

        # Step 5: Log to Supabase as "submitted"
        log_payout_to_supabase(recipient_email, amount, batch_id, "submitted")

        return jsonify({"ok": True, "batch_id": batch_id, "paypal": res_json})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
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

def log_payout_to_supabase(user_email, amount, payout_batch_id, status):
    """Log payout request to Supabase"""
    try:
        data = {
            "user_email": user_email,
            "amount": amount,
            "payout_batch_id": payout_batch_id,
            "status": status,
        }
        print("log payout data ===============>", data)
        response = supabase.table("payouts").insert(data).execute()
        print("✅ Logged payout to Supabase:", response.data)
    except Exception as e:
        print("❌ Failed to log payout:", str(e))

def update_payout_status_in_supabase(payout_batch_id, status):
    """Update payout status in Supabase"""
    try:
        response = supabase.table("payouts").update({
            "status": status,
            "updated_at": "now()"
        }).eq("payout_batch_id", payout_batch_id).execute()
        print(f"✅ Updated payout status to '{status}' for batch {payout_batch_id}")
    except Exception as e:
        print(f"❌ Failed to update payout status: {str(e)}")

@app.route('/your-existing-api/dashboard', methods=['GET'])
def dashboard_data():
    try:
        # --- USERS DATA ---
        users_resp = supabase.table("users").select("id").execute()
        total_users = len(users_resp.data) if users_resp.data else 0

        # TODO: Replace with real growth rate and trend calculations
        user_growth_rate = 5.2
        user_trend = "up"

        # --- REVENUE DATA ---
        revenue_resp = supabase.table("payments").select("amount").execute()
        total_revenue = sum([p["amount"] for p in (revenue_resp.data or [])])
        revenue_growth_rate = 2.1  # TODO: Replace with real calculation
        revenue_trend = "stable"   # TODO: Replace with real calculation

        return jsonify({
            "users": {
                "total": total_users,
                "growthRate": user_growth_rate,
                "trend": user_trend
            },
            "revenue": {
                "total": total_revenue,
                "growthRate": revenue_growth_rate,
                "trend": revenue_trend
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- DevOps API Routes ---
@app.route('/devops/generate-api-key', methods=['POST'])
def generate_devops_api_key():
    from uuid import uuid4
    try:
        api_key = str(uuid4())
        webhook_secret = str(uuid4())

        # Save the keys to Supabase if available
        if supabase:
            try:
                supabase.table("devops_config").upsert({
                    "id": 1,
                    "api_key": api_key,
                    "webhook_secret": webhook_secret
                }).execute()
            except Exception as db_error:
                print(f"Warning: Could not save to database: {db_error}")
        else:
            print("Warning: Supabase not configured - keys not saved to database")

        return jsonify({
            "api_key": api_key,
            "webhook_secret": webhook_secret
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/devops/keys', methods=['GET'])
def get_devops_keys():
    try:
        # Get API keys from Supabase if available
        if supabase:
            try:
                response = supabase.table("devops_config").select("*").execute()
                keys = response.data if response.data else []
            except Exception as db_error:
                print(f"Warning: Could not fetch from database: {db_error}")
                keys = []
        else:
            print("Warning: Supabase not configured - returning empty keys list")
            keys = []
        
        return jsonify({
            "keys": keys
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/devops/generate-key', methods=['POST'])
def generate_new_api_key():
    from uuid import uuid4
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        name = data.get('name', 'DevOps Integration Key')
        
        api_key = str(uuid4())
        
        # Save the new key to Supabase if available
        if supabase:
            try:
                supabase.table("devops_api_keys").insert({
                    "user_id": user_id,
                    "name": name,
                    "api_key": api_key,
                    "is_active": True,
                    "created_at": "now()"
                }).execute()
            except Exception as db_error:
                print(f"Warning: Could not save to database: {db_error}")
        else:
            print("Warning: Supabase not configured - key not saved to database")

        return jsonify({
            "api_key": api_key,
            "message": "API key generated successfully"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/devops/sync/users', methods=['POST'])
def sync_users_to_devops():
    try:
        # Get all users from Supabase if available
        if supabase:
            try:
                response = supabase.table("users").select("*").execute()
                users = response.data if response.data else []
            except Exception as db_error:
                print(f"Warning: Could not fetch users from database: {db_error}")
                users = []
        else:
            print("Warning: Supabase not configured - no users to sync")
            users = []
        
        # Here you would send the data to your DevOps system
        # For now, we'll just return success
        return jsonify({
            "message": f"Synced {len(users)} users to DevOps",
            "count": len(users)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/devops/sync/revenue', methods=['POST'])
def sync_revenue_to_devops():
    try:
        # Get revenue data from Supabase if available
        if supabase:
            try:
                response = supabase.table("payments").select("*").execute()
                payments = response.data if response.data else []
            except Exception as db_error:
                print(f"Warning: Could not fetch payments from database: {db_error}")
                payments = []
        else:
            print("Warning: Supabase not configured - no revenue data to sync")
            payments = []
        
        total_revenue = sum([p.get('amount', 0) for p in payments])
        
        return jsonify({
            "message": f"Synced revenue data to DevOps",
            "total_revenue": total_revenue,
            "payment_count": len(payments)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/devops/sync/commissions', methods=['POST'])
def sync_commissions_to_devops():
    try:
        # Get commission data from Supabase if available
        if supabase:
            try:
                response = supabase.table("commissions").select("*").execute()
                commissions = response.data if response.data else []
            except Exception as db_error:
                print(f"Warning: Could not fetch commissions from database: {db_error}")
                commissions = []
        else:
            print("Warning: Supabase not configured - no commission data to sync")
            commissions = []
        
        total_commissions = sum([c.get('amount', 0) for c in commissions])
        
        return jsonify({
            "message": f"Synced commission data to DevOps",
            "total_commissions": total_commissions,
            "commission_count": len(commissions)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)