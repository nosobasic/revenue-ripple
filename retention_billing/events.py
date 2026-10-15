"""Signed-event entrypoint for the injected retention evidence service.

No route, scheduler, credential discovery or checkout is installed automatically.
The deployment adapter passes unchanged request bytes and existing endpoint secret.
"""
import stripe
from .types import ReviewRequired, object_id
from .store import EvidenceStore
from .stripe_adapter import plain

class EventHandler:
    def __init__(self, connect, provider, endpoint_secret):
        self.connect,self.provider,self.secret=connect,provider,endpoint_secret
        self.store=EvidenceStore(connect,provider)
    def handle(self,raw,signature):
        event=plain(stripe.Webhook.construct_event(raw,signature,self.secret,tolerance=300))
        scope=self.provider.scope
        if (event.get('livemode') is not scope.live or event.get('account',scope.account)!=scope.account
            or event.get('api_version')!=scope.api_version):raise ReviewRequired('event_scope_mismatch')
        kind=event['type'];obj=event['data']['object'];ident=obj.get('id')
        if not ident:raise ReviewRequired('missing_event_object')
        if kind.startswith(('charge.dispute.','refund.')) or kind=='charge.refunded':
            charge=ident if kind=='charge.refunded' else object_id(obj.get('charge'))
            if not charge:raise ReviewRequired('missing_charge_reference')
            return self.store.review_charge(charge)
        invoice=None
        if kind in ('invoice.paid','invoice.payment_succeeded','invoice.payment_failed','invoice.voided','invoice.marked_uncollectible'):
            invoice=ident;canonical=self.provider.invoice(invoice)
            sub=object_id((canonical.get('parent') or {}).get('subscription_details',{}).get('subscription')) or object_id(canonical.get('subscription'))
        elif kind.startswith('customer.subscription.'):
            sub=ident
        else:return 'ignored' # Checkout never grants coverage or creates a binding.
        if not sub:raise ReviewRequired('missing_subscription_reference')
        with self.connect() as con:
            if con.autocommit:raise ValueError('transaction_required')
            with con.cursor() as cur:
                cur.execute('SET TRANSACTION READ ONLY')
                cur.execute('SELECT user_id FROM public.rr_retention_bindings WHERE account_id=%s AND subscription_id=%s',(scope.account,sub))
                row=cur.fetchone()
        if row is None:return 'unmatched_review'
        return self.store.reconcile(str(row[0]),sub,invoice)
