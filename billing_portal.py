"""Read-only customer resolution; portal sessions only after explicit authenticated POST.
No customer creation, email matching, entitlement writes, or portal configuration changes.
"""
import os
from uuid import uuid4
from urllib.parse import urlparse
import stripe
from flask import Blueprint, current_app, jsonify, request
from werkzeug.exceptions import HTTPException
from middleware.verified_identity import verified_identity

billing_portal = Blueprint('billing_portal', __name__)
ORIGINS = frozenset(('https://www.revenueripple.org', 'https://revenueripple.org'))


def field(value, key, default=None):
    try:
        return value[key]
    except (KeyError, TypeError):
        return default


def reply(state, code=200, **values):
    response = jsonify(state=state, **values)
    response.status_code = code
    response.headers['Cache-Control'] = 'private, no-store'
    return response


def configure_portal(app, environ=None):
    """Disabled by default. Never reuse the legacy payment key."""
    env = os.environ if environ is None else environ
    flag = env.get('RR_PORTAL_ENABLED', 'false')
    app.extensions['rr_portal'] = None
    if flag == 'false':
        return
    if flag != 'true':
        raise ValueError('Invalid portal activation flag')
    key = env.get('RR_PORTAL_KEY', '')
    config = env.get('RR_PORTAL_CONFIGURATION_ID', '')
    account = env.get('RR_PORTAL_ACCOUNT_ID', '')
    if (not key.startswith('rk_live_') or not config.startswith('bpc_') or
            account != 'acct_1RHozW2Ku9STqdAd'):
        raise ValueError('Incomplete approved live portal configuration')
    client = stripe.StripeClient(key, stripe_version='2025-03-31.basil',
        stripe_account=account, max_network_retries=0,
        http_client=stripe.RequestsClient(timeout=10))
    app.extensions['rr_portal'] = (client.v1, config)


def provider():
    return current_app.extensions['rr_portal'][0]


def configuration_id():
    return current_app.extensions['rr_portal'][1]


def safe_configuration(configuration, config_id):
    features = field(configuration, 'features', {})
    return (field(configuration, 'id') == config_id and
            field(configuration, 'active') is True and
            field(configuration, 'livemode') is True and
            field(field(features, 'invoice_history', {}), 'enabled') is True and
            all(field(field(features, name, {}), 'enabled') is False for name in
                ('customer_update', 'payment_method_update', 'subscription_cancel',
                 'subscription_update')) and
            field(field(configuration, 'login_page', {}), 'enabled') is False and
            all(field(field(features, name, {}), 'enabled', False) is False for name in
                ('subscription_pause', 'usage_based_billing')))



def resolve_customer(user_id):
    # Legacy founder rows are email-attributed, not verified account ownership.
    # Only the reviewed authenticated checkout mapping may authorize a customer.
    client = current_app.supabase
    subscriptions = client.table('rr_subscriptions').select(
        'subscription_id').eq('user_id', user_id).limit(21).execute().data
    if not isinstance(subscriptions, list) or len(subscriptions) > 20:
        raise ValueError('Mapping requires review')
    customers, modes = set(), set()
    subscription_ids = {row.get('subscription_id') for row in subscriptions}
    for sub_id in subscription_ids:
        if not isinstance(sub_id, str) or not sub_id.startswith('sub_'):
            raise ValueError('Invalid mapping')
        subscription = provider().subscriptions.retrieve(sub_id)
        metadata = field(subscription, 'metadata', {})
        mode = field(subscription, 'livemode')
        if (field(subscription, 'id') != sub_id or
                field(metadata, 'rr_user_id') != user_id or mode is not True):
            raise ValueError('Subscription ownership requires review')
        modes.add(mode)
        customer = field(subscription, 'customer')
        if not isinstance(customer, str) or not customer.startswith('cus_'):
            raise ValueError('Invalid customer')
        customers.add(customer)
    if not customers:
        return None
    if len(customers) != 1:
        raise ValueError('Ambiguous billing mapping')
    customer_id = next(iter(customers))
    if not isinstance(customer_id, str) or not customer_id.startswith('cus_'):
        raise ValueError('Invalid mapping')
    customer = provider().customers.retrieve(customer_id)
    if field(customer, 'deleted') or field(customer, 'id') != customer_id:
        raise ValueError('Unavailable customer')
    if not isinstance(field(customer, 'livemode'), bool) or modes != {field(customer, 'livemode')}:
        raise ValueError('Unknown mode')
    return customer


@billing_portal.route('/api/billing/status', methods=['GET'])
@billing_portal.route('/api/billing/portal', methods=['POST'])
def handle_billing():
    try:
        if not current_app.extensions.get('rr_portal'):
            return reply('unavailable', 503)
        identity = verified_identity()
        # Nothing about identity, customer, configuration, or destination comes
        # from browser parameters. Reject ambiguous input rather than ignoring it.
        if request.args or (request.method == 'POST' and request.get_data() not in (b'', b'{}')):
            return reply('invalid_request', 400)
        if request.method == 'POST' and request.headers.get('Origin') not in ORIGINS:
            return reply('invalid_origin', 403)
        customer = resolve_customer(str(identity.id))
        if customer is None:
            return reply('not_linked', 200 if request.method == 'GET' else 409)
        config_id = configuration_id()
        if not config_id:
            return reply('unavailable', 503)
        configuration = provider().billing_portal.configurations.retrieve(config_id)
        if not safe_configuration(configuration, config_id):
            return reply('unavailable', 503)
        if request.method == 'GET':
            return reply('linked')
        return_url = request.headers['Origin'] + '/profile?billing=returned'
        session = provider().billing_portal.sessions.create(
            params=dict(customer=field(customer, 'id'), configuration=config_id,
                        return_url=return_url),
            options={'idempotency_key': str(uuid4())})
        if (field(session, 'livemode') is not True or
                field(session, 'customer') != field(customer, 'id') or
                field(session, 'configuration') != config_id or
                field(session, 'return_url') != return_url or
                not str(field(session, 'id', '')).startswith('bps_')):
            raise ValueError('Unexpected portal session')
        url = field(session, 'url', '')
        parsed = urlparse(url)
        if parsed.scheme != 'https' or parsed.netloc != 'billing.stripe.com' or parsed.username:
            raise ValueError('Unexpected portal destination')
        return reply('ready', url=url)
    except HTTPException as error:
        return reply('authentication_required' if error.code == 401 else 'unavailable', error.code)
    except Exception:
        # Do not expose or log provider payloads, customer IDs, or signed URLs.
        return reply('unavailable', 503)
