"""Read-only provider transport; injected SDK client, no credential discovery."""
import stripe
from .types import Scope, ReviewRequired, RetryRequired

def plain(value):
    if isinstance(value, stripe.StripeObject):
        value = value.to_dict()
    if isinstance(value, dict):
        return {k: plain(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [plain(v) for v in value]
    return value


def project(obj, names):
    return {key: plain(obj[key]) for key in names.split() if key in obj}


def references(obj):
    # Expanded references carry customer/payment metadata; retain identity only.
    if isinstance(obj, list):
        return [references(x) for x in obj]
    if not isinstance(obj, dict):
        return obj
    result = {}
    for key, value in obj.items():
        if key in ('customer', 'product', 'subscription', 'subscription_item',
                   'payment_intent', 'latest_charge', 'invoice') and isinstance(value, dict):
            value = value.get('id')
        elif key == 'metadata':
            value = project(value or {}, 'rr_user_id rr_order_id')
        elif key == 'parent' and isinstance(value, dict):
            value = project(value, 'type subscription_details subscription_item_details')
        elif key == 'subscription_details' and isinstance(value, dict):
            value = project(value, 'subscription')
        elif key == 'subscription_item_details' and isinstance(value, dict):
            value = project(value, 'subscription subscription_item proration')
        result[key] = references(value)
    return result


class StripeReadAdapter:
    """Injected StripeClient only. Each call explicitly pins account and version.

    Construction makes no requests. No create/update/cancel/refund methods exist.
    Normalized documents are evidence, never an entitlement decision.
    """

    def __init__(self, client, scope):
        if not isinstance(scope, Scope) or not scope.account or type(scope.live) is not bool or scope.api_version != '2025-03-31.basil':
            raise ValueError('invalid_adapter_configuration')
        self._client, self.scope = client, scope
        self._options = {'stripe_account': scope.account, 'stripe_version': scope.api_version,
                         'max_network_retries': 0}

    def _read(self, method, *args, **kwargs):
        try:
            return plain(method(*args, options=self._options, **kwargs))
        except Exception:
            raise RetryRequired('stripe_read_retry') from None

    def _object(self, method, ident, fields):
        if not isinstance(ident, str) or not ident or len(ident) > 255:
            raise ReviewRequired('invalid_provider_id')
        obj = self._read(method, ident)
        if obj.get('id') != ident or obj.get('livemode') is not self.scope.live:
            raise ReviewRequired('canonical_object_scope_mismatch')
        return references(project(obj, fields))

    def _pages(self, method, *args, params=None):
        params = dict(params or {}, limit=100)
        rows, seen = [], set()
        for _ in range(10):
            page = self._read(method, *args, params=params)
            data = page.get('data')
            if not isinstance(data, list) or type(page.get('has_more')) is not bool:
                raise ReviewRequired('invalid_provider_page')
            for row in data:
                ident = row.get('id')
                if not ident or ident in seen:
                    raise ReviewRequired('duplicate_provider_page')
                seen.add(ident)
                rows.append(row)
            if not page['has_more']:
                return {'data': rows, 'has_more': False}
            if not data:
                raise ReviewRequired('empty_provider_page')
            params['starting_after'] = data[-1]['id']
        raise ReviewRequired('provider_page_limit')

    def subscription(self, ident):
        obj = self._object(self._client.v1.subscriptions.retrieve, ident,
            'id customer livemode metadata status cancel_at_period_end cancel_at canceled_at ended_at '
            'trial_start trial_end pause_collection pending_update billing_cycle_anchor items')
        obj['metadata'] = project(obj.get('metadata') or {}, 'rr_user_id rr_order_id')
        items = obj.get('items') or {}
        if items.get('has_more') is not False:
            raise ReviewRequired('incomplete_subscription_items')
        normalized = []
        for item in items.get('data', []):
            row = project(item, 'id quantity current_period_start current_period_end')
            price = item.get('price')
            if not isinstance(price, dict):
                raise ReviewRequired('missing_expanded_price')
            row['price'] = project(price, 'id product unit_amount currency billing_scheme')
            row['price']['recurring'] = project(price.get('recurring') or {}, 'interval interval_count usage_type')
            normalized.append(row)
        obj['items'] = {'data': normalized, 'has_more': False}
        return obj

    def invoice(self, ident):
        obj = self._object(self._client.v1.invoices.retrieve, ident,
            'id customer livemode subscription parent status currency collection_method billing_reason '
            'amount_due amount_paid amount_remaining total starting_balance ending_balance '
            'total_discount_amounts total_taxes pre_payment_credit_notes_amount post_payment_credit_notes_amount')
        lines = self._pages(self._client.v1.invoices.line_items.list, ident)
        lines['data'] = [project(x, 'id parent pricing quantity amount currency period') for x in lines['data']]
        payments = self._pages(self._client.v1.invoice_payments.list, params={'invoice': ident})
        payments['data'] = [project(x, 'id invoice status amount_paid payment') for x in payments['data']]
        obj.update(lines=lines, payments=payments)
        return references(obj)

    def payment_intent(self, ident):
        return self._object(self._client.v1.payment_intents.retrieve, ident,
            'id customer livemode status currency amount amount_received latest_charge')

    def charge(self, ident):
        return self._object(self._client.v1.charges.retrieve, ident,
            'id customer payment_intent livemode status paid captured amount_captured amount currency '
            'refunded amount_refunded disputed')

    def payment_reviews(self, charge_id):
        # A pending/failed refund still requires manual review; never auto-clear.
        refunds=self._pages(self._client.v1.refunds.list, params={'charge':charge_id})
        disputes=self._pages(self._client.v1.disputes.list, params={'charge':charge_id})
        for row in refunds['data']+disputes['data']:
            if row.get('livemode', self.scope.live) is not self.scope.live or object_reference(row.get('charge')) != charge_id:
                raise ReviewRequired('payment_review_scope_mismatch')
        return bool(refunds['data'] or disputes['data'])

def object_reference(value):
    return value.get('id') if isinstance(value,dict) else value
