from flask import Flask, request, jsonify, abort, make_response
from flask_cors import CORS
import stripe
import os
import requests
import time
import paypalrestsdk
import json
from datetime import datetime

from supabase import create_client, Client
from dotenv import load_dotenv
from ai_assistant import ai_assistant_bp
from insights.routes import insights_bp
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
CORS(app, origins="*")

# Stripe secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe.api_key:
    print("Warning: STRIPE_SECRET_KEY not set. Stripe functionality will not work.")
    stripe.api_key = "sk_test_dummy_key_for_development"

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

>>>>>>> d9037f6c58dc979bec06aba733a4ce6a80f6cd63
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


endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

@app.route('/webhook', methods=['POST'])
def stripe_webhook():
<<<<<<< Current (Your changes)
    payload = request.data
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except stripe.error.SignatureVerificationError as e:
        print(f"❌ Webhook signature verification failed: {e}")
        return abort(400)
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        return abort(400)

    # Log webhook event
    log_webhook_event(event)

    if event['type'] == 'checkout.session.completed':
        try:
            session = event['data']['object']
            referrer_username = session['metadata'].get('referrer_username', 'none')
            customer_email = session['customer_details']['email']
            amount_total = session['amount_total'] / 100
            product = session['metadata'].get('product')

            print(f"✅ Processing payment: {product} by {customer_email} — Referrer: {referrer_username} — Amount: ${amount_total}")

            if product == "digital_marketing_domination_book":
                process_tripwire_purchase(customer_email, amount_total, referrer_username)
                
            elif product in ["membership_subscription", "reseller_subscription", "pro_reseller_subscription"]:
                process_subscription_purchase(customer_email, amount_total, referrer_username, product)
            
            else:
                print(f"⚠️ Unknown product type: {product}")

        except Exception as e:
            print(f"❌ Error processing webhook: {e}")
            # Don't return error to Stripe - we've received the webhook
            # Log the error for manual review
            log_webhook_error(event, str(e))

    elif event['type'] == 'invoice.payment_succeeded':
        # Handle recurring subscription payments
        try:
            invoice = event['data']['object']
            customer_email = invoice['customer_email']
            amount_total = invoice['amount_paid'] / 100
            print(f"✅ Recurring payment successful: {customer_email} — Amount: ${amount_total}")
            
            # Update subscription status if needed
            update_subscription_status(customer_email, 'active')
            
        except Exception as e:
            print(f"❌ Error processing recurring payment: {e}")
            log_webhook_error(event, str(e))

    elif event['type'] == 'invoice.payment_failed':
        # Handle failed payments
        try:
            invoice = event['data']['object']
            customer_email = invoice['customer_email']
            print(f"⚠️ Payment failed for: {customer_email}")
            
            # Update subscription status
            update_subscription_status(customer_email, 'past_due')
            
        except Exception as e:
            print(f"❌ Error processing failed payment: {e}")
            log_webhook_error(event, str(e))

        elif product == 'founders_annual':
            print(f"Founders annual by {customer_email} — Referrer: {referrer_username} — Amount: ${amount_total}")
            try:
                if supabase:
                    # increment sold_count and enforce cap inside DB function
                    supabase.rpc('increment_founders_sold').execute()
                    supabase.table('founder_members').upsert({
                        'email': customer_email,
                        'badge': 'founder',
                        'status': 'active',
                    }).execute()
                    add_contact_to_getresponse(customer_email, 'founder')
            except Exception as e:
                print(f"⚠️ Founders post-purchase error: {e}")

    return jsonify({'status': 'success'})
=======
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
>>>>>>> Incoming (Background Agent changes)

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
    campaign_id = os.getenv("GET_RESPONSE_TRIPWIRE_CAMPAIGN_ID")

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
            "created_at": "now()"
        }
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
    return os.getenv("GETRESPONSE_CAMPAIGN_ID", "50yn9")

def add_book_giveaway_to_getresponse(email, name):
    """Add book giveaway lead to GetResponse master list"""
    api_key = os.getenv("GETRESPONSE_API_KEY", "tnkyixvg8dxdsmwks2ll69y8k31zd7qg")
    
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
        "name": f"{name} (Book Giveaway)"
    }
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers)
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
    api_key = os.getenv("GETRESPONSE_API_KEY", "tnkyixvg8dxdsmwks2ll69y8k31zd7qg")
    
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
        "name": f"{name} (Survival Playbook)"
    }
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers)
        if response.status_code == 202:
            print(f"✅ Successfully added {email} to GetResponse (Survival Playbook)")
        elif response.status_code == 409:
            print(f"⚠️ Contact {email} already exists in GetResponse")
        else:
            print(f"❌ GetResponse error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to add contact to GetResponse: {str(e)}")

# Membership Mastery API Endpoint
@app.route('/api/getresponse/membership-mastery', methods=['POST', 'GET'])
def membership_mastery_submission():
    # Handle GET requests for debugging
    if request.method == 'GET':
        return jsonify({
            "status": "Membership Mastery API is running",
            "message": "Use POST to submit form data"
        })
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract form data
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        source = data.get('source', 'membership-mastery')
        
        # Extract UTM parameters
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
        
        # Add to GetResponse with membership-mastery tag
        add_membership_mastery_to_getresponse(email, name, phone, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
        
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
    """Add membership mastery lead to GetResponse master list"""
    api_key = os.getenv("GETRESPONSE_API_KEY", "tnkyixvg8dxdsmwks2ll69y8k31zd7qg")
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Get the campaign ID
    campaign_id = get_getresponse_campaign_id()
    if not campaign_id:
        print("❌ Could not get GetResponse campaign ID")
        return
    
    # Create name with source tracking
    name_with_source = f"{name} ({source})"
    
    body = {
        "email": email,
        "campaign": {"campaignId": campaign_id},
        "name": name_with_source
    }
    
    # Add phone if provided
    if phone:
        body["customFieldValues"] = [
            {
                "customFieldId": "phone",  # You'll need to create this custom field in GetResponse
                "value": [phone]
            }
        ]
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers)
        if response.status_code == 202:
            print(f"✅ Successfully added {email} to GetResponse (Membership Mastery - {source})")
        elif response.status_code == 409:
            print(f"⚠️ Contact {email} already exists in GetResponse")
        else:
            print(f"❌ GetResponse error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to add contact to GetResponse: {str(e)}")

# Digital Marketing Domination API Endpoint
@app.route('/api/getresponse/digital-marketing-domination', methods=['POST', 'GET'])
def digital_marketing_domination_submission():
    # Handle GET requests for debugging
    if request.method == 'GET':
        return jsonify({
            "status": "Digital Marketing Domination API is running",
            "message": "Use POST to submit form data"
        })
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract form data
        email = data.get('email', '').strip().lower()
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        source = data.get('source', 'digital-marketing-domination')
        
        # Extract UTM parameters
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
        
        # Add to GetResponse with dmd tag
        add_digital_marketing_domination_to_getresponse(email, name, phone, source, utm_source, utm_medium, utm_campaign, utm_term, utm_content)
        
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
    """Add digital marketing domination lead to GetResponse master list"""
    api_key = os.getenv("GETRESPONSE_API_KEY", "tnkyixvg8dxdsmwks2ll69y8k31zd7qg")
    
    headers = {
        "X-Auth-Token": f"api-key {api_key}",
        "Content-Type": "application/json"
    }
    
    # Get the campaign ID
    campaign_id = get_getresponse_campaign_id()
    if not campaign_id:
        print("❌ Could not get GetResponse campaign ID")
        return
    
    # Create name with source tracking
    name_with_source = f"{name} ({source})"
    
    body = {
        "email": email,
        "campaign": {"campaignId": campaign_id},
        "name": name_with_source
    }
    
    # Add phone if provided
    if phone:
        body["customFieldValues"] = [
            {
                "customFieldId": "phone",  # You'll need to create this custom field in GetResponse
                "value": [phone]
            }
        ]
    
    try:
        response = requests.post("https://api.getresponse.com/v3/contacts", json=body, headers=headers)
        if response.status_code == 202:
            print(f"✅ Successfully added {email} to GetResponse (Digital Marketing Domination - {source})")
        elif response.status_code == 409:
            print(f"⚠️ Contact {email} already exists in GetResponse")
        else:
            print(f"❌ GetResponse error {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ Failed to add contact to GetResponse: {str(e)}")


if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', port=5001)