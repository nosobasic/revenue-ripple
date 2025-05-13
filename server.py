from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import stripe
import os
import requests

from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
CORS(app)

# Stripe secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

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

# Replace with your actual Stripe webhook signing secret
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

# Do not include `app.run(...)` when using gunicorn
# Gunicorn will use `app` defined at the global level