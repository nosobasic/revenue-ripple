from flask import Flask, request, jsonify, abort, make_response
from flask_cors import CORS
import stripe
import os
import requests
import time
import paypalrestsdk
import json
from datetime import datetime
import re
import hashlib
import uuid


from supabase import create_client, Client
from dotenv import load_dotenv
from ai_assistant import ai_assistant_bp
from command_center_routes import command_center_bp

# Import engagement_bp from server package to avoid conflict with this server.py module
# Use importlib to explicitly load from the server package directory
import importlib.util
import sys
import os as os_module

_server_dir = os_module.path.dirname(os_module.path.abspath(__file__))
_engagement_routes_path = os_module.path.join(_server_dir, 'server', 'engagement', 'routes.py')
spec = importlib.util.spec_from_file_location("engagement_routes", _engagement_routes_path)
engagement_routes_module = importlib.util.module_from_spec(spec)
sys.modules['engagement_routes'] = engagement_routes_module  # Register the module
spec.loader.exec_module(engagement_routes_module)
engagement_bp = engagement_routes_module.engagement_bp

# from insights.routes import insights_bp  # Module not found - commented out
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
CORS(app, origins=["https://www.revenueripple.org", "https://revenueripple.org", "http://localhost:3000", "http://localhost:5173"])

# Stripe secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
print(f"🔍 DEBUG: STRIPE_SECRET_KEY value: {stripe.api_key[:10] + '...' if stripe.api_key else 'None'}")
if not stripe.api_key:
    print("Warning: STRIPE_SECRET_KEY not set. Stripe functionality will not work.")
    stripe.api_key = "sk_test_dummy_key_for_development"
else:
    print("✅ STRIPE_SECRET_KEY loaded successfully")


# Facebook Conversions API Configuration
FACEBOOK_PIXEL_ID = "474617768829501"
FACEBOOK_ACCESS_TOKEN = "EAAaorhtVhdIBPtZCpGyZBnDES7bo8KmhDbCXZAmhctKQcyyuhZCcivpkGu1QrV4kxahttmlzGI6ePE93GR0v28K8FOjt2cy1pZB9uCJ5h4KCvzOdv8BEZBRL1Ggb3gdL0IkahZCx73ipxZANHralNdKAtQN98gjINqlUCoyWCBz7xzORUY6hrAmpHfVQ37rKhwZDZD"
CONVERSIONS_API_URL = f"https://graph.facebook.com/v23.0/{FACEBOOK_PIXEL_ID}/events"

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
app.register_blueprint(command_center_bp)
app.register_blueprint(engagement_bp)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running', 'message': 'Revenue Ripple API is active', 'version': '1.0.1'})

@app.after_request
def after_request(response):
    # Let flask-cors handle CORS headers - don't add duplicate headers
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
                'price': 'price_1RKNpS2Ku9STqdAdLoP8qgb4',  # Pro Reseller $97/month
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

@app.route('/create-pro-reseller-trial-session', methods=['POST'])
def create_pro_reseller_trial_session():
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1RRdNV2Ku9STqdAduqGfLBpt',  # Pro Reseller Trial
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://revenueripple.org/pro-reseller-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/pro-reseller-cancel',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'pro_reseller_trial_subscription'
            }
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
                'price': 'price_1RKNYL2Ku9STqdAd5spylthl',  # Reseller $47/month
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

@app.route('/create-reseller-trial-session', methods=['POST'])
def create_reseller_trial_session():
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1RRdWt2Ku9STqdAd78kUUnEE',  # Reseller Trial
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://revenueripple.org/reseller-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/reseller-cancel',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'reseller_trial_subscription'
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
                'price': 'price_1RI8Me2Ku9STqdAdhTw4iWhS',  # Revenue Ripple Membership
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

@app.route('/create-quarterly-growth-session', methods=['POST'])
def create_quarterly_growth_session():
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1Sexg62Ku9STqdAd4dotWHAi',  # Quarterly Growth $129/3 months
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://revenueripple.org/membership-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/membership-cancel',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'quarterly_growth_subscription'
            }
        )
        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Founders Annual Endpoints - moved here for immediate deployment
@app.route('/founders-test', methods=['GET'])
def founders_test_simple():
    """Simple test endpoint for Founders Annual"""
    return jsonify({'status': 'Founders endpoints active', 'timestamp': datetime.now().isoformat()})

@app.route('/stripe-test', methods=['GET'])
def stripe_test():
    """Test Stripe configuration"""
    try:
        # Test if we can create a simple product
        products = stripe.Product.list(limit=5)
        prices = stripe.Price.list(limit=5)
        return jsonify({
            'status': 'Stripe connected',
            'mode': 'test' if 'test' in stripe.api_key else 'live',
            'api_key_prefix': stripe.api_key[:7] + '...' if stripe.api_key else 'None',
            'products': [{'id': p.id, 'name': p.name} for p in products.data],
            'prices': [{'id': p.id, 'amount': p.unit_amount, 'currency': p.currency} for p in prices.data]
        })
    except Exception as e:
        return jsonify({'error': str(e), 'api_key_prefix': stripe.api_key[:7] + '...' if stripe.api_key else 'None'})

@app.route('/founders-spots-remaining', methods=['GET', 'OPTIONS'])
def founders_spots_simple():
    """Get remaining founder spots - simplified endpoint"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # For now, return a static response until database is set up
        return jsonify({
            'spots_remaining': 15,
            'total_spots': 20,
            'spots_taken': 5
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/create-founders-annual-session', methods=['POST'])
def create_founders_annual_session():
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')
        timer_started_at = data.get('timer_started_at')

        # Create Founders Annual checkout session ($470/year)
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1SBguk2Ku9STqdAdNBuZcJst',  # Founders Annual $470/year
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://revenueripple.org/founders-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/founders-checkout',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'founders_annual_subscription',
                'timer_started_at': timer_started_at or '',
                'note': 'Founders Annual $470/year subscription'
            }
        )
        return jsonify({'url': session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/create-founders-monthly-session', methods=['POST'])
def create_founders_monthly_session():
    """Fallback monthly option on Founders checkout page"""
    try:
        data = request.get_json()
        referrer_username = data.get('referrer_username')
        customer_email = data.get('email')

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_1RI8Me2Ku9STqdAdhTw4iWhS',  # Regular Membership $47/month
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://revenueripple.org/membership-success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://revenueripple.org/founders-checkout',
            metadata={
                'referrer_username': referrer_username or 'none',
                'product': 'membership_subscription',
                'source': 'founders_page_monthly_option'
            },
            customer_email=customer_email if customer_email else None
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
print(f"🔍 DEBUG: STRIPE_WEBHOOK_SECRET value: {'SET' if endpoint_secret else 'NOT SET'}")

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
            
            # Send Purchase event to Facebook Conversions API
            user_data = {'email': customer_email}
            custom_data = {
                'content_name': 'Digital Marketing Domination Book',
                'content_category': 'Digital Product',
                'value': amount_total,
                'currency': 'USD'
            }
            send_conversion_event('Purchase', user_data, custom_data, "https://revenueripple.org/checkout")

        elif product == "founders_annual_subscription":
            print(f"🚀 Founders Annual subscription by {customer_email} — Referrer: {referrer_username} — Amount: ${amount_total}")
            
            # Log to founders_annual_members table
            log_founders_annual_purchase(customer_email, amount_total, referrer_username, session)
            
            # Update user with founder status
            set_user_as_founder(customer_email)
            
            # Add to GetResponse with founder tag
            add_contact_to_getresponse(customer_email, "founders_annual")
            
            # Log commission if there's a referrer
            if referrer_username and referrer_username != 'none':
                log_commission(referrer_username, customer_email, "founders_annual", amount_total)
            
            # Trigger founder bonus emails
            send_founders_welcome_emails(customer_email)
            
            # Send Subscribe event to Facebook Conversions API
            user_data = {'email': customer_email}
            custom_data = {
                'content_name': 'Founders Annual Subscription',
                'content_category': 'Subscription',
                'value': amount_total,
                'currency': 'USD'
            }
            send_conversion_event('Subscribe', user_data, custom_data, "https://revenueripple.org/founders-checkout")

        elif product in ["membership_subscription", "reseller_subscription", "pro_reseller_subscription", "reseller_trial_subscription", "pro_reseller_trial_subscription", "quarterly_growth_subscription"]:
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
            elif product == "reseller_trial_subscription":
                set_user_role(customer_email, "reseller")
            elif product == "pro_reseller_trial_subscription":
                set_user_role(customer_email, "pro_reseller")
            elif product == "quarterly_growth_subscription":
                set_user_role(customer_email, "member")
            
            # Send Subscribe event to Facebook Conversions API
            user_data = {'email': customer_email}
            custom_data = {
                'content_name': f'{tier.capitalize()} Subscription',
                'content_category': 'Subscription',
                'value': amount_total,
                'currency': 'USD'
            }
            send_conversion_event('Subscribe', user_data, custom_data, "https://revenueripple.org/checkout")

    return jsonify({'status': 'success'})

# Helper functions for webhook processing
def log_webhook_event(event):
    """Log webhook event to database for debugging"""
    try:
        supabase.table("webhook_logs").insert({
            "source": "stripe",
            "event_type": event['type'],
            "event_data": event,
            "processed": False,
            "created_at": "now()"
        }).execute()
    except Exception as e:
        print(f"❌ Failed to log webhook event: {e}")

def log_webhook_error(event, error_message):
    """Log webhook processing errors"""
    try:
        supabase.table("webhook_logs").insert({
            "source": "stripe",
            "event_type": event['type'],
            "event_data": event,
            "processed": False,
            "error_message": error_message,
            "created_at": "now()"
        }).execute()
    except Exception as e:
        print(f"❌ Failed to log webhook error: {e}")

def process_tripwire_purchase(customer_email, amount_total, referrer_username):
    """Process tripwire purchase with better error handling"""
    try:
        print(f"Tripwire bought by {customer_email} — Referrer: {referrer_username} — Amount: ${amount_total}")
        
        # Log purchase
        log_tripwire_purchase_to_supabase(customer_email, amount_total, referrer_username)
        
        # Add to email list
        add_contact_to_getresponse(customer_email, "tripwire")
        
        # Log commission if there's a referrer
        if referrer_username and referrer_username != 'none':
            log_commission(referrer_username, customer_email, "tripwire", amount_total)
            
        # Mark webhook as processed
        update_webhook_processed(customer_email, "tripwire_purchase")
        
    except Exception as e:
        print(f"❌ Error processing tripwire purchase: {e}")
        raise e

def process_subscription_purchase(customer_email, amount_total, referrer_username, product):
    """Process subscription purchase with role updates and error handling"""
    try:
        tier = product.replace("_subscription", "")
        print(f"{tier.capitalize()} subscription by {customer_email} — Referrer: {referrer_username} — Amount: ${amount_total}")
        
        # Log subscription
        log_subscription_to_supabase(customer_email, amount_total, referrer_username, tier)
        
        # Add to email list
        add_contact_to_getresponse(customer_email, tier)
        
        # Log commission if there's a referrer
        if referrer_username and referrer_username != 'none':
            log_commission(referrer_username, customer_email, tier, amount_total)
        
        # Update user role based on subscription type
        if product == "membership_subscription":
            set_user_role(customer_email, "member")
        elif product == "reseller_subscription":
            set_user_role(customer_email, "reseller")
        elif product == "pro_reseller_subscription":
            set_user_role(customer_email, "pro_reseller")
            
        # Mark webhook as processed
        update_webhook_processed(customer_email, f"{tier}_subscription")
        
    except Exception as e:
        print(f"❌ Error processing subscription purchase: {e}")
        raise e

def update_subscription_status(customer_email, status):
    """Update subscription status in database"""
    try:
        supabase.table("subscriptions").update({
            "status": status,
            "updated_at": "now()"
        }).eq("email", customer_email).execute()
        print(f"✅ Updated subscription status for {customer_email}: {status}")
    except Exception as e:
        print(f"❌ Failed to update subscription status: {e}")

def update_webhook_processed(customer_email, event_type):
    """Mark webhook as successfully processed"""
    try:
        supabase.table("webhook_logs").update({
            "processed": True,
            "processed_at": "now()"
        }).eq("event_data->customer_details->email", customer_email).eq("event_type", "checkout.session.completed").execute()
    except Exception as e:
        print(f"❌ Failed to mark webhook as processed: {e}")

def add_contact_to_getresponse(email, tag):
    api_key = os.getenv("GET_RESPONSE_TRIPWIRE_KEY")
    
    # Use Founders List for founders_annual purchases, otherwise use default campaign
    if tag == "founders_annual":
        # Founders List token
        campaign_id = "im9O1"
        name = "Founder Member"
    else:
        campaign_id = os.getenv("GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID")
        name = f"{tag.capitalize()} Buyer"

    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }

    body = {
        "email": email,
        "campaign": { "campaignId": campaign_id },
        "name": name,
        "tags": [tag],
        "dayOfCycle": 0
    }

    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers, timeout=10)
        if response.status_code == 202:
            print(f"✔️ Successfully added {email} to GetResponse list: {campaign_id} with tag: {tag}")
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
                "has_paid": True,
                "payment_status": "completed",
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
                    "has_paid": True,
                    "payment_status": "completed",
                    "created_at": "now()"
                }).execute()
                print(f"✅ Created user with role and plan '{role}' for {email}")
            else:
                print(f"❌ Failed to create auth user for {email}")
    except Exception as e:
        print(f"❌ Failed to set role: {str(e)}")

def log_founders_annual_purchase(email, amount, referrer_username, session):
    """Log Founders Annual purchase to database"""
    try:
        # Get user_id from email
        user_response = supabase.table("users").select("id").eq("email", email).execute()
        user_id = user_response.data[0]['id'] if user_response.data else None
        
        # Extract timer_started_at from metadata if available
        timer_started_at = session['metadata'].get('timer_started_at')
        
        data = {
            "user_id": user_id,
            "email": email,
            "stripe_customer_id": session.get('customer'),
            "stripe_subscription_id": session.get('subscription'),
            "amount_paid": amount,
            "referrer_username": referrer_username,
            "timer_started_at": timer_started_at if timer_started_at else None,
            "purchased_at": "now()",
            "is_active": True
        }
        
        response = supabase.table("founders_annual_members").insert(data).execute()
        print(f"✅ Logged Founders Annual purchase to database: {response.data}")
    except Exception as e:
        print(f"❌ Failed to log Founders Annual purchase: {str(e)}")

def set_user_as_founder(email):
    """Update user record with founder status"""
    try:
        response = supabase.table("users").select("id").eq("email", email).execute()
        if response.data and len(response.data) > 0:
            # Update existing user
            supabase.table("users").update({
                "is_founder": True,
                "subscription_type": "annual",
                "role": "member",
                "plan": "founders_annual",
                "founder_benefits": {
                    "vault_access": True,
                    "discord_access": True,
                    "onboarding_call": True,
                    "early_access": True,
                    "locked_pricing": True
                },
                "updated_at": "now()"
            }).eq("email", email).execute()
            print(f"✅ Set founder status for {email}")
        else:
            # Create user with founder status
            auth_response = supabase.auth.admin.create_user({
                "email": email,
                "email_confirm": True,
                "user_metadata": {
                    "is_founder": True,
                    "role": "member"
                }
            })
            
            if auth_response.user:
                user_id = auth_response.user.id
                supabase.table("users").insert({
                    "id": user_id,
                    "email": email,
                    "is_founder": True,
                    "subscription_type": "annual",
                    "role": "member",
                    "plan": "founders_annual",
                    "status": "active",
                    "founder_benefits": {
                        "vault_access": True,
                        "discord_access": True,
                        "onboarding_call": True,
                        "early_access": True,
                        "locked_pricing": True
                    },
                    "created_at": "now()"
                }).execute()
                print(f"✅ Created founder user for {email}")
    except Exception as e:
        print(f"❌ Failed to set founder status: {str(e)}")

def send_founders_welcome_emails(email):
    """Trigger founder welcome email sequence"""
    try:
        # Mark welcome email as sent
        supabase.table("founders_annual_members").update({
            "bonuses_delivered": {
                "welcome_email": True,
                "discord_invite": False,
                "vault_access": False,
                "onboarding_scheduled": False,
                "reminder_sent": False
            }
        }).eq("email", email).execute()
        
        # Note: Actual email sending will be handled by GetResponse automation
        # or you can integrate with an email service here
        print(f"✅ Triggered founder welcome emails for {email}")
        print(f"   - Welcome email (immediate)")
        print(f"   - Discord invite (5 min)")
        print(f"   - Vault access (2 hours)")
        print(f"   - Onboarding reminder (24 hours)")
    except Exception as e:
        print(f"❌ Failed to trigger founder emails: {str(e)}")

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

# Rate limiting storage (in production, use Redis or similar)
submission_attempts = {}

# Book Giveaway API Endpoint
@app.route('/api/book-giveaway', methods=['POST', 'GET'])
def book_giveaway_submission():
    # Handle GET requests for debugging
    if request.method == 'GET':
        return jsonify({
            "status": "Book Giveaway API is running",
            "method": "GET",
            "message": "This endpoint accepts POST requests for form submissions"
        })
    
    # Handle POST requests
    print(f"📥 Book giveaway submission received from {request.remote_addr}")
    print(f"📥 Request method: {request.method}")
    print(f"📥 Request headers: {dict(request.headers)}")
    
    try:
        data = request.get_json()
        print(f"📥 Request data: {data}")
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        ip_address = request.remote_addr
        
        # Rate limiting: max 3 attempts per IP per hour
        current_time = time.time()
        if ip_address in submission_attempts:
            attempts = [t for t in submission_attempts[ip_address] if current_time - t < 3600]  # Last hour
            if len(attempts) >= 3:
                return jsonify({"error": "Too many attempts. Please try again later."}), 429
            submission_attempts[ip_address] = attempts
        else:
            submission_attempts[ip_address] = []
        
        # Record this attempt
        submission_attempts[ip_address].append(current_time)
        
        # Validate input
        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400
        
        # Basic email validation
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({"error": "Please enter a valid email address"}), 400
        
        # Check for duplicate submissions (spam prevention)
        if supabase:
            try:
                # Check if email already exists in book giveaway submissions
                existing = supabase.table("book_giveaway_submissions").select("email").eq("email", email).execute()
                if existing.data and len(existing.data) > 0:
                    return jsonify({"error": "This email has already been used to claim a free book"}), 400
            except Exception as db_error:
                print(f"Warning: Could not check for duplicates: {db_error}")
        
        # Add to GetResponse
        add_book_giveaway_to_getresponse(email, name)
        
        # Log submission to database
        if supabase:
            try:
                submission_data = {
                    "name": name,
                    "email": email,
                    "submitted_at": "now()",
                    "ip_address": ip_address,
                    "user_agent": request.headers.get('User-Agent', '')
                }
                supabase.table("book_giveaway_submissions").insert(submission_data).execute()
                print(f"✅ Logged book giveaway submission for {email}")
            except Exception as db_error:
                print(f"❌ Failed to log book giveaway submission: {db_error}")
        
        return jsonify({
            "success": True,
            "message": "Successfully submitted! Redirecting to your free book..."
        })
        
    except Exception as e:
        print(f"❌ Book giveaway submission error: {str(e)}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500

def get_getresponse_campaign_id():
    """Get the campaign ID for the master list from GetResponse"""
    # Use the campaign ID from environment variable or fallback to the provided one
    campaign_id = os.getenv("GETRESPONSE_CAMPAIGN_ID")
    if not campaign_id:
        print("❌ GETRESPONSE_CAMPAIGN_ID environment variable is required")
        return None
    return campaign_id

# --- Phone normalization and custom field lookup for GetResponse ---
def _normalize_phone_e164(raw: str) -> str:
    """Best-effort E.164 normalizer. Keeps digits, assumes US +1 when 10 digits."""
    if not raw:
        return ""
    digits = re.sub(r"[^0-9+]", "", str(raw)).lstrip()
    # If already starts with '+', assume caller supplied full E.164
    if digits.startswith('+'):
        return digits.replace(' ', '')
    # Strip any leading '+' that might have been removed by lstrip
    digits = re.sub(r"[^0-9]", "", digits)
    if len(digits) == 10:
        return "+1" + digits
    if len(digits) == 11 and digits.startswith('1'):
        return "+" + digits
    # Fallback: prefix '+' if user already included country code length >=11
    return "+" + digits if digits else ""

def get_phone_custom_field_id() -> str | None:
    """Return the GetResponse custom field id for the phone field.
    Uses env GETRESPONSE_PHONE_FIELD_ID if set, otherwise looks up by name.
    """
    api_key = os.getenv("GETRESPONSE_API_KEY")
    if not api_key:
        print("❌ GETRESPONSE_API_KEY environment variable is required to look up custom fields")
        return None
    env_id = os.getenv("GETRESPONSE_PHONE_FIELD_ID")
    if env_id:
        return env_id
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    try:
        # Fetch all custom fields and locate a phone-type field by common names
        resp = requests.get("https://api.getresponse.com/v3/custom-fields", headers=headers, timeout=10)
        if resp.status_code != 200:
            print(f"⚠️ Failed to fetch custom fields: {resp.status_code} {resp.text}")
            return None
        fields = resp.json() or []
        wanted_names = {"phone", "phone_number", "phone number", "mobile", "mobile_phone"}
        for f in fields:
            name = (f.get("name") or "").strip().lower()
            ftype = (f.get("type") or "").strip().lower()
            if name in wanted_names or ftype == "phone":
                cid = f.get("customFieldId") or f.get("id")
                if cid:
                    print(f"🔎 Using phone custom field id: {cid} (name: {name})")
                    return cid
        print("⚠️ No phone custom field found. Create one in GetResponse as type 'Phone'.")
        return None
    except Exception as e:
        print(f"⚠️ Error looking up custom fields: {e}")
        return None

def add_book_giveaway_to_getresponse(email, name):
    """Add book giveaway lead to GetResponse master list"""
    api_key = os.getenv("GETRESPONSE_API_KEY")
    if not api_key:
        print("❌ GETRESPONSE_API_KEY environment variable is required")
        return
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Get the campaign ID
    campaign_id = get_getresponse_campaign_id()
    if not campaign_id:
        print("❌ Could not get GetResponse campaign ID")
        return
    
    body = {
        "email": email,
        "campaign": {"campaignId": campaign_id},
        "name": f"{name} (Book Giveaway)",
        "dayOfCycle": 0
    }
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers, timeout=10)
        if response.status_code == 202:
            print(f"✅ Successfully added {email} to GetResponse (Book Giveaway)")
        elif response.status_code == 409:
            print(f"⚠️ Contact {email} already exists in GetResponse")
        else:
            print(f"❌ GetResponse error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to add contact to GetResponse: {str(e)}")

# Survival Playbook API Endpoint
@app.route('/api/getresponse/survival-playbook', methods=['POST', 'GET'])
def survival_playbook_submission():
    # Handle GET requests for debugging
    if request.method == 'GET':
        return jsonify({
            "status": "Survival Playbook API is running",
            "method": "GET",
            "message": "This endpoint accepts POST requests for form submissions"
        })
    
    # Handle POST requests
    print(f"📥 Survival playbook submission received from {request.remote_addr}")
    print(f"📥 Request method: {request.method}")
    print(f"📥 Request headers: {dict(request.headers)}")
    
    try:
        data = request.get_json()
        print(f"📥 Request data: {data}")
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        source = data.get('source', 'direct')
        utm_source = data.get('utm_source', 'direct')
        utm_medium = data.get('utm_medium', 'organic')
        utm_campaign = data.get('utm_campaign', 'survival-playbook')
        utm_term = data.get('utm_term', '')
        utm_content = data.get('utm_content', '')
        ip_address = request.remote_addr
        
        # Rate limiting: max 3 attempts per IP per hour
        current_time = time.time()
        if ip_address in submission_attempts:
            attempts = [t for t in submission_attempts[ip_address] if current_time - t < 3600]  # Last hour
            if len(attempts) >= 3:
                return jsonify({"error": "Too many attempts. Please try again later."}), 429
            submission_attempts[ip_address] = attempts
        else:
            submission_attempts[ip_address] = []
        
        # Record this attempt
        submission_attempts[ip_address].append(current_time)
        
        # Validate input
        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400
        
        # Basic email validation
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({"error": "Please enter a valid email address"}), 400
        
        # Add to GetResponse with survival-playbook tag
        add_survival_playbook_to_getresponse(email, name, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
        
        # Log submission to database if available
        if supabase:
            try:
                submission_data = {
                    "name": name,
                    "email": email,
                    "source": source,
                    "utm_source": utm_source,
                    "utm_medium": utm_medium,
                    "utm_campaign": utm_campaign,
                    "utm_term": utm_term,
                    "utm_content": utm_content,
                    "submitted_at": "now()",
                    "ip_address": ip_address,
                    "user_agent": request.headers.get('User-Agent', '')
                }
                supabase.table("survival_playbook_submissions").insert(submission_data).execute()
                print(f"✅ Logged survival playbook submission for {email}")
            except Exception as db_error:
                print(f"❌ Failed to log survival playbook submission: {db_error}")
        
        return jsonify({
            "success": True,
            "message": "Successfully submitted! Redirecting to your free guide..."
        })
        
    except Exception as e:
        print(f"❌ Survival playbook submission error: {str(e)}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500

def add_survival_playbook_to_getresponse(email, name, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content):
    """Add survival playbook lead to GetResponse master list - simplified like book giveaway"""
    api_key = os.getenv("GETRESPONSE_API_KEY")
    if not api_key:
        print("❌ GETRESPONSE_API_KEY environment variable is required")
        return
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Get the campaign ID
    campaign_id = get_getresponse_campaign_id()
    if not campaign_id:
        print("❌ Could not get GetResponse campaign ID")
        return
    
    # Simple body like book giveaway - just email, campaign, and name
    # We'll add the tag in the name to identify survival playbook leads
    body = {
        "email": email,
        "campaign": {"campaignId": campaign_id},
        "name": f"{name} (Survival Playbook)",
        "dayOfCycle": 0
    }
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers, timeout=10)
        if response.status_code == 202:
            print(f"✅ Successfully added {email} to GetResponse (Survival Playbook)")
        elif response.status_code == 409:
            print(f"⚠️ Contact {email} already exists in GetResponse")
        else:
            print(f"❌ GetResponse error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to add contact to GetResponse: {str(e)}")

# Facebook Conversions API Helper Functions
def hash_email(email):
    """Hash email for Conversions API using SHA256"""
    if not email:
        return None
    return hashlib.sha256(email.lower().strip().encode('utf-8')).hexdigest()

def hash_phone(phone):
    """Hash phone number for Conversions API using SHA256"""
    if not phone:
        return None
    # Remove all non-digit characters
    phone_digits = re.sub(r'\D', '', phone)
    return hashlib.sha256(phone_digits.encode('utf-8')).hexdigest()

def send_conversion_event(event_name, user_data, custom_data=None, event_source_url=None):
    """Send event to Facebook Conversions API"""
    try:
        # Generate event ID for deduplication
        event_id = str(uuid.uuid4())
        
        # Prepare user data
        user_data_dict = {}
        if user_data.get('email'):
            user_data_dict['em'] = hash_email(user_data['email'])
        if user_data.get('phone'):
            user_data_dict['ph'] = hash_phone(user_data['phone'])
        if user_data.get('first_name'):
            user_data_dict['fn'] = hashlib.sha256(user_data['first_name'].lower().strip().encode('utf-8')).hexdigest()
        if user_data.get('last_name'):
            user_data_dict['ln'] = hashlib.sha256(user_data['last_name'].lower().strip().encode('utf-8')).hexdigest()
        
        # Prepare event data
        event_data = {
            "data": [
                {
                    "event_name": event_name,
                    "event_time": int(time.time()),
                    "event_id": event_id,
                    "action_source": "website",
                    "user_data": user_data_dict,
                    "event_source_url": event_source_url or "https://revenueripple.org"
                }
            ]
        }
        
        # Add custom data if provided
        if custom_data:
            event_data["data"][0]["custom_data"] = custom_data
        
        # Add partner agent for attribution
        event_data["data"][0]["partner_agent"] = "revenue_ripple_1_0"
        
        # Send to Conversions API
        headers = {
            "Authorization": f"Bearer {FACEBOOK_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(CONVERSIONS_API_URL, json=event_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Successfully sent {event_name} event to Conversions API")
            return True
        else:
            print(f"⚠️ Failed to send {event_name} event to Conversions API: {response.status_code} {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending {event_name} event to Conversions API: {str(e)}")
        return False

def get_user_ip():
    """Get user IP address from request headers"""
    # Check for forwarded IP first (for proxy/load balancer setups)
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr

# Membership Mastery API Endpoint
@app.route('/api/getresponse/membership-mastery', methods=['POST', 'GET', 'OPTIONS'])
def membership_mastery_submission():
    # Handle OPTIONS requests for CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    # Handle GET requests for debugging
    if request.method == 'GET':
        return jsonify({
            "status": "Membership Mastery API is running",
            "message": "Use POST to submit form data"
        })
    
    try:
        data = request.get_json()
        print(f"📥 Membership Mastery submission data: {data}")
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract form data - simplified like book giveaway
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        source = data.get('source', 'membership-mastery')
        utm_source = data.get('utm_source', 'direct')
        utm_medium = data.get('utm_medium', 'organic')
        utm_campaign = data.get('utm_campaign', 'membership-mastery')
        utm_term = data.get('utm_term', '')
        utm_content = data.get('utm_content', '')
        
        # Validate required fields
        if not email or not name:
            return jsonify({"error": "Email and name are required"}), 400
        
        # Validate email format
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({"error": "Please enter a valid email address"}), 400
        
        # Add to GetResponse with simplified tracking
        add_membership_mastery_to_getresponse(email, name, phone, source, 'direct', 'organic', 'membership-mastery', '', '')
        
        # Send Lead event to Facebook Conversions API
        user_data = {
            'email': email,
            'phone': phone,
            'first_name': name.split(' ')[0] if name else None,
            'last_name': ' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else None
        }
        custom_data = {
            'content_name': f'Membership Mastery {source}',
            'content_category': 'Lead Generation',
            'value': 7,
            'currency': 'USD'
        }
        send_conversion_event('Lead', user_data, custom_data, f"https://revenueripple.org/{source}")
        
        # Log submission to database if available
        if supabase:
            try:
                submission_data = {
                    'email': email,
                    'name': name,
                    'phone': phone,
                    'source': source,
                    'utm_source': utm_source,
                    'utm_medium': utm_medium,
                    'utm_campaign': utm_campaign,
                    'utm_term': utm_term,
                    'utm_content': utm_content,
                    'submitted_at': 'now()'
                }
                
                result = supabase.table('membership_mastery_submissions').insert(submission_data).execute()
                print(f"✅ Logged membership mastery submission to database: {email}")
                
            except Exception as db_error:
                print(f"⚠️ Database logging failed: {db_error}")
        
        return jsonify({"success": True, "message": "Successfully submitted"})
        
    except Exception as e:
        print(f"❌ Membership mastery submission error: {str(e)}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500

def add_membership_mastery_to_getresponse(email, name, phone, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content):
    """Add membership mastery lead to GetResponse master list - simplified like book giveaway"""
    api_key = os.getenv("GETRESPONSE_API_KEY")
    if not api_key:
        print("❌ GETRESPONSE_API_KEY environment variable is required")
        return
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Get the campaign ID
    campaign_id = get_getresponse_campaign_id()
    if not campaign_id:
        print("❌ Could not get GetResponse campaign ID")
        return
    
    # Body with email, campaign, name, and phone number
    body = {
        "email": email,
        "campaign": {"campaignId": campaign_id},
        "name": f"{name} (Membership Mastery)",
        "dayOfCycle": 0
    }
    # Attach phone as a custom field when available
    phone_field_id = get_phone_custom_field_id()
    norm_phone = _normalize_phone_e164(phone)
    if phone_field_id and norm_phone:
        body["customFieldValues"] = [
            {
                "customFieldId": phone_field_id,
                "value": [norm_phone]
            }
        ]
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers, timeout=10)
        if response.status_code == 202:
            print(f"✅ Successfully added {email} to GetResponse (Membership Mastery - {source})")
        elif response.status_code == 409:
            print(f"⚠️ Contact {email} already exists in GetResponse")
        else:
            print(f"❌ GetResponse error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to add contact to GetResponse: {str(e)}")

# Digital Marketing Domination API Endpoint
@app.route('/api/getresponse/digital-marketing-domination', methods=['POST', 'GET', 'OPTIONS'])
def digital_marketing_domination_submission():
    # Handle OPTIONS requests for CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    # Handle GET requests for debugging
    if request.method == 'GET':
        return jsonify({
            "status": "Digital Marketing Domination API is running",
            "message": "Use POST to submit form data"
        })
    
    try:
        data = request.get_json()
        print(f"📥 Digital Marketing Domination submission data: {data}")
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract form data - simplified like book giveaway
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        source = data.get('source', 'digital-marketing-domination')
        utm_source = data.get('utm_source', 'direct')
        utm_medium = data.get('utm_medium', 'organic')
        utm_campaign = data.get('utm_campaign', 'digital-marketing-domination')
        utm_term = data.get('utm_term', '')
        utm_content = data.get('utm_content', '')
        
        # Validate required fields
        if not email or not name:
            return jsonify({"error": "Email and name are required"}), 400
        
        # Validate email format
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            return jsonify({"error": "Please enter a valid email address"}), 400
        
        # Add to GetResponse with simplified tracking
        add_digital_marketing_domination_to_getresponse(email, name, phone, source, 'direct', 'organic', 'digital-marketing-domination', '', '')
        
        # Send Lead event to Facebook Conversions API
        user_data = {
            'email': email,
            'phone': phone,
            'first_name': name.split(' ')[0] if name else None,
            'last_name': ' '.join(name.split(' ')[1:]) if name and len(name.split(' ')) > 1 else None
        }
        custom_data = {
            'content_name': f'DMD {source}',
            'content_category': 'Lead Generation',
            'value': 7,
            'currency': 'USD'
        }
        send_conversion_event('Lead', user_data, custom_data, f"https://revenueripple.org/{source}")
        
        # Log submission to database if available
        if supabase:
            try:
                submission_data = {
                    'email': email,
                    'name': name,
                    'phone': phone,
                    'source': source,
                    'utm_source': utm_source,
                    'utm_medium': utm_medium,
                    'utm_campaign': utm_campaign,
                    'utm_term': utm_term,
                    'utm_content': utm_content,
                    'submitted_at': 'now()'
                }
                
                result = supabase.table('dmd_submissions').insert(submission_data).execute()
                print(f"✅ Logged DMD submission to database: {email}")
                
            except Exception as db_error:
                print(f"⚠️ Database logging failed: {db_error}")
        
        return jsonify({"success": True, "message": "Successfully submitted"})
        
    except Exception as e:
        print(f"❌ Digital marketing domination submission error: {str(e)}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500

def add_digital_marketing_domination_to_getresponse(email, name, phone, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content):
    """Add digital marketing domination lead to GetResponse master list - simplified like book giveaway"""
    api_key = os.getenv("GETRESPONSE_API_KEY")
    if not api_key:
        print("❌ GETRESPONSE_API_KEY environment variable is required")
        return
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Get the campaign ID
    campaign_id = get_getresponse_campaign_id()
    if not campaign_id:
        print("❌ Could not get GetResponse campaign ID")
        return
    
    # Body with email, campaign, name, and phone number
    body = {
        "email": email,
        "campaign": {"campaignId": campaign_id},
        "name": f"{name} (Digital Marketing Domination)",
        "dayOfCycle": 0
    }
    phone_field_id = get_phone_custom_field_id()
    norm_phone = _normalize_phone_e164(phone)
    if phone_field_id and norm_phone:
        body["customFieldValues"] = [
            {
                "customFieldId": phone_field_id,
                "value": [norm_phone]
            }
        ]
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers, timeout=10)
        if response.status_code == 202:
            print(f"✅ Successfully added {email} to GetResponse (Digital Marketing Domination - {source})")
        elif response.status_code == 409:
            print(f"⚠️ Contact {email} already exists in GetResponse")
        else:
            print(f"❌ GetResponse error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to add contact to GetResponse: {str(e)}")

# Founders Annual API Endpoints
@app.route('/api/founders-test', methods=['GET'])
def founders_test():
    """Test endpoint to verify Founders Annual routes are working"""
    return jsonify({'status': 'Founders Annual endpoints are active', 'timestamp': datetime.now().isoformat()})

@app.route('/api/founders-spots-remaining', methods=['GET', 'OPTIONS'])
def founders_spots_remaining():
    """Get remaining founder spots (20 total - marketing scarcity)"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Count active founders
        result = supabase.table("founders_annual_members").select("id", count="exact").eq("is_active", True).execute()
        count = result.count if result.count is not None else 0
        
        spots_remaining = max(0, 20 - count)
        
        return jsonify({
            'spots_remaining': spots_remaining,
            'total_spots': 20,
            'spots_taken': count
        })
    except Exception as e:
        print(f"❌ Error getting founder spots: {str(e)}")
        return jsonify({'spots_remaining': 15, 'total_spots': 20}), 200  # Fallback

@app.route('/api/founders-timer-start', methods=['POST', 'OPTIONS'])
def founders_timer_start():
    """Record when a user first visits the founders page"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        user_identifier = data.get('identifier')  # email or anonymous ID
        
        if not user_identifier:
            return jsonify({'error': 'identifier required'}), 400
        
        # Check if timer already exists for this identifier
        existing = supabase.table("founders_timer_tracking").select("*").eq("user_identifier", user_identifier).execute()
        
        if existing.data and len(existing.data) > 0:
            # Return existing timer
            timer_data = existing.data[0]
            return jsonify({
                'timer_started_at': timer_data['timer_started_at'],
                'expires_at': timer_data['expires_at'],
                'already_exists': True
            })
        else:
            # Create new timer (3 days from now)
            from datetime import timedelta
            now = datetime.now()
            expires = now + timedelta(days=3)
            
            new_timer = {
                'user_identifier': user_identifier,
                'timer_started_at': now.isoformat(),
                'expires_at': expires.isoformat(),
                'page_visits': 1,
                'converted': False
            }
            
            result = supabase.table("founders_timer_tracking").insert(new_timer).execute()
            
            return jsonify({
                'timer_started_at': now.isoformat(),
                'expires_at': expires.isoformat(),
                'created': True
            })
    except Exception as e:
        print(f"❌ Error starting founder timer: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/founders-timer-check', methods=['POST', 'OPTIONS'])
def founders_timer_check():
    """Check timer status for a user"""
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        user_identifier = data.get('identifier')
        
        if not user_identifier:
            return jsonify({'error': 'identifier required'}), 400
        
        # Get timer data
        result = supabase.table("founders_timer_tracking").select("*").eq("user_identifier", user_identifier).execute()
        
        if result.data and len(result.data) > 0:
            timer_data = result.data[0]
            
            # Update page visit count
            supabase.table("founders_timer_tracking").update({
                'page_visits': timer_data['page_visits'] + 1,
                'updated_at': 'now()'
            }).eq("user_identifier", user_identifier).execute()
            
            return jsonify({
                'timer_started_at': timer_data['timer_started_at'],
                'expires_at': timer_data['expires_at'],
                'converted': timer_data['converted'],
                'exists': True
            })
        else:
            return jsonify({'exists': False})
    except Exception as e:
        print(f"❌ Error checking founder timer: {str(e)}")
        return jsonify({'error': str(e)}), 500


# --- Admin Routes ---
@app.route('/admin/delete-user', methods=['POST'])
def admin_delete_user():
    """Admin endpoint to delete a user from both auth and database"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
        
        # First, delete the user from the users table
        try:
            delete_response = supabase.table("users").delete().eq("id", user_id).execute()
            print(f"✅ Deleted user from users table: {user_id}")
        except Exception as db_error:
            print(f"❌ Error deleting from users table: {str(db_error)}")
            return jsonify({'error': f'Failed to delete user from database: {str(db_error)}'}), 500
        
        # Then try to delete from auth (this requires service role key)
        try:
            # Using Supabase admin API to delete auth user
            supabase.auth.admin.delete_user(user_id)
            print(f"✅ Deleted user from auth: {user_id}")
        except Exception as auth_error:
            # Auth deletion may fail if user doesn't exist in auth, but that's okay
            print(f"⚠️ Warning: Could not delete from auth (user may not exist): {str(auth_error)}")
        
        return jsonify({
            'success': True,
            'message': 'User deleted successfully'
        }), 200
        
    except Exception as e:
        print(f"❌ Error in admin_delete_user: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Community API Routes

@app.route('/api/community/posts', methods=['GET'])
def get_community_posts():
    """Get community posts with pagination and filtering"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        category = request.args.get('category', '')
        sort_by = request.args.get('sort', 'created_at')  # created_at, upvotes, views
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
        
        # Build query
        query = supabase.table('community_posts').select('''
            *,
            users!inner(name, email),
            post_upvotes(count)
        ''')
        
        # Apply filters
        if category:
            query = query.eq('category', category)
        
        # Apply sorting
        if sort_by == 'upvotes':
            query = query.order('upvotes', desc=True)
        elif sort_by == 'views':
            query = query.order('views', desc=True)
        else:
            query = query.order('created_at', desc=True)
        
        # Apply pagination
        offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)
        
        result = query.execute()
        
        return jsonify({
            'posts': result.data,
            'page': page,
            'limit': limit,
            'total': len(result.data)
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting community posts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/posts', methods=['POST'])
def create_community_post():
    """Create a new community post"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        title = data.get('title')
        content = data.get('content')
        category = data.get('category', 'general')
        
        if not all([user_id, title, content]):
            return jsonify({'error': 'user_id, title, and content are required'}), 400
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
        
        # Create post
        result = supabase.table('community_posts').insert({
            'user_id': user_id,
            'title': title,
            'content': content,
            'category': category
        }).execute()
        
        return jsonify({
            'success': True,
            'post': result.data[0] if result.data else None
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating community post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/posts/<post_id>', methods=['GET'])
def get_community_post(post_id):
    """Get a specific community post with replies"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
        
        # Get post
        post_result = supabase.table('community_posts').select('''
            *,
            users!inner(name, email)
        ''').eq('id', post_id).execute()
        
        if not post_result.data:
            return jsonify({'error': 'Post not found'}), 404
        
        # Get replies
        replies_result = supabase.table('community_replies').select('''
            *,
            users!inner(name, email)
        ''').eq('post_id', post_id).order('created_at', desc=False).execute()
        
        # Increment view count
        supabase.table('community_posts').update({
            'views': post_result.data[0]['views'] + 1
        }).eq('id', post_id).execute()
        
        return jsonify({
            'post': post_result.data[0],
            'replies': replies_result.data
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting community post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/posts/<post_id>/reply', methods=['POST'])
def create_community_reply():
    """Create a reply to a community post"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        content = data.get('content')
        parent_reply_id = data.get('parent_reply_id')
        
        if not all([user_id, content]):
            return jsonify({'error': 'user_id and content are required'}), 400
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
        
        # Create reply
        reply_data = {
            'post_id': request.view_args['post_id'],
            'user_id': user_id,
            'content': content
        }
        
        if parent_reply_id:
            reply_data['parent_reply_id'] = parent_reply_id
        
        result = supabase.table('community_replies').insert(reply_data).execute()
        
        return jsonify({
            'success': True,
            'reply': result.data[0] if result.data else None
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating community reply: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/community/posts/<post_id>/upvote', methods=['POST'])
def upvote_community_post():
    """Upvote a community post"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
        
        post_id = request.view_args['post_id']
        
        # Check if already upvoted
        existing = supabase.table('post_upvotes').select('*').eq('post_id', post_id).eq('user_id', user_id).execute()
        
        if existing.data:
            return jsonify({'error': 'Already upvoted'}), 400
        
        # Add upvote
        supabase.table('post_upvotes').insert({
            'post_id': post_id,
            'user_id': user_id
        }).execute()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f"❌ Error upvoting community post: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/success-stories', methods=['GET'])
def get_success_stories():
    """Get success stories"""
    try:
        featured_only = request.args.get('featured', 'false').lower() == 'true'
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
        
        query = supabase.table('success_stories').select('''
            *,
            users!inner(name, email)
        ''').eq('is_approved', True)
        
        if featured_only:
            query = query.eq('is_featured', True)
        
        query = query.order('created_at', desc=True)
        
        result = query.execute()
        
        return jsonify({
            'stories': result.data
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting success stories: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/success-stories', methods=['POST'])
def create_success_story():
    """Create a success story"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        title = data.get('title')
        story = data.get('story')
        outcome = data.get('outcome', '')
        image_url = data.get('image_url', '')
        
        if not all([user_id, title, story]):
            return jsonify({'error': 'user_id, title, and story are required'}), 400
        
        if not supabase:
            return jsonify({'error': 'Database not configured'}), 500
        
        # Create success story
        result = supabase.table('success_stories').insert({
            'user_id': user_id,
            'title': title,
            'story': story,
            'outcome': outcome,
            'image_url': image_url
        }).execute()
        
        return jsonify({
            'success': True,
            'story': result.data[0] if result.data else None
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating success story: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting Revenue Ripple API Server v1.0.1")
    print("🔍 DEBUG: Checking environment variables...")
    print(f"🔍 STRIPE_SECRET_KEY: {'SET' if os.getenv('STRIPE_SECRET_KEY') else 'NOT SET'}")
    print(f"🔍 STRIPE_WEBHOOK_SECRET: {'SET' if os.getenv('STRIPE_WEBHOOK_SECRET') else 'NOT SET'}")
    app.run(debug=True, host='0.0.0.0', port=5001)