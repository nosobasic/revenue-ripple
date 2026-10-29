"""Transactional evidence reconciliation; no checkout/provider mutations.

Caller injects an explicit DB connection factory and account-scoped provider.
No HTTP endpoint is installed. Provider reads occur under the user's DB lock so
concurrent/out-of-order work cannot publish a previously fetched stale decision.
"""
from .types import Binding, ReviewRequired
from .policy import PaidPolicy


class EvidenceStore:
    def __init__(self, connect, provider, policy=None):
        self.connect, self.provider = connect, provider
        self.policy = policy or PaidPolicy()

    def lock_user(self, cur, user):
        cur.execute('SELECT id FROM public.users WHERE id=%s FOR UPDATE', (user,))
        return cur.fetchone() is not None

    def binding(self, cur, user, subscription):
        cur.execute('''SELECT customer_id,price_id,product_id FROM public.rr_retention_bindings
            WHERE account_id=%s AND subscription_id=%s AND user_id=%s FOR UPDATE''',
            (self.provider.scope.account,subscription,user))
        return cur.fetchone()

    @staticmethod
    def hold(cur, user, reason, reference):
        cur.execute('''INSERT INTO public.rr_retention_review_holds(user_id,reason,evidence_ref)
            VALUES(%s,%s,%s) ON CONFLICT(user_id,reason) DO NOTHING''',(user,reason,reference))

    def reconcile(self, user, subscription, invoice_id=None):
        with self.connect() as con:
            if con.autocommit: raise ValueError('transaction_required')
            with con.cursor() as cur:
                if not self.lock_user(cur,user):return 'unmatched_review'
                row=self.binding(cur,user,subscription)
                if row is None:return 'unmatched_review'
                binding=Binding(self.provider.scope,subscription,row[0],str(user),row[1],row[2])
                try:
                    cur.execute('''SELECT 1 FROM public.rr_retention_catalog WHERE account_id=%s AND price_id=%s
                        AND product_id=%s AND amount=4700 AND currency='usd' AND interval_unit='month' AND interval_count=1''',
                        (binding.scope.account,binding.price,binding.product))
                    if cur.fetchone() is None:raise ReviewRequired('catalog_missing')
                    sub=self.provider.subscription(subscription)
                    invoice=self.provider.invoice(invoice_id) if invoice_id else None
                    # Always review prior paid charges on cancellation/failed renewal as well.
                    cur.execute('SELECT charge_id FROM public.rr_retention_evidence WHERE user_id=%s',(user,))
                    for (charge_id,) in cur.fetchall():
                        charge=self.provider.charge(charge_id)
                        if (charge.get('livemode') is not binding.scope.live or
                            charge.get('refunded') is not False or charge.get('amount_refunded')!=0 or
                            charge.get('disputed') is not False or self.provider.payment_reviews(charge_id)):
                            raise ReviewRequired('refund_or_dispute_manual_review')
                    if invoice is not None and invoice.get('status') != 'paid':
                        cur.execute('SELECT 1 FROM public.rr_retention_evidence WHERE account_id=%s AND invoice_id=%s',
                            (binding.scope.account,invoice_id))
                        if cur.fetchone():raise ReviewRequired('settled_invoice_no_longer_paid')
                    settlement=self.policy.decide(binding,sub,invoice,self.provider)
                    if settlement.end is None:return 'no_extension'
                    cur.execute('SELECT extract(epoch FROM clock_timestamp())')
                    if settlement.start>cur.fetchone()[0]:raise ReviewRequired('future_paid_period')
                    values=(binding.scope.account,subscription,binding.user_id,binding.customer,binding.price,binding.product,
                        settlement.invoice_id,settlement.charge,settlement.payment_intent,4700,'usd',settlement.start,settlement.end)
                    cur.execute('''SELECT account_id,subscription_id,user_id::text,customer_id,price_id,product_id,
                        invoice_id,charge_id,payment_intent_id,amount_paid,currency,
                        extract(epoch FROM period_start)::bigint,extract(epoch FROM period_end)::bigint
                        FROM public.rr_retention_evidence WHERE account_id=%s AND invoice_id=%s''',
                        (binding.scope.account,settlement.invoice_id))
                    old=cur.fetchone()
                    if old:
                        if tuple(old)!=tuple(values):raise ReviewRequired('settled_evidence_changed')
                        return 'duplicate'
                    cur.execute('''SELECT 1 FROM public.rr_retention_evidence WHERE
                        (user_id=%s AND period_start<to_timestamp(%s) AND to_timestamp(%s)<period_end)
                        OR (account_id=%s AND (charge_id=%s OR payment_intent_id=%s)) LIMIT 1''',
                        (user,settlement.end,settlement.start,binding.scope.account,settlement.charge,settlement.payment_intent))
                    if cur.fetchone():raise ReviewRequired('overlap_or_reused_payment')
                    cur.execute('''INSERT INTO public.rr_retention_evidence(account_id,subscription_id,user_id,customer_id,
                        price_id,product_id,invoice_id,charge_id,payment_intent_id,amount_paid,currency,
                        period_start,period_end,verified_at,provider_state)
                        VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,to_timestamp(%s),to_timestamp(%s),clock_timestamp(),%s)''',
                        values+(sub['status'],))
                    return 'recorded'
                except ReviewRequired as exc:
                    self.hold(cur,user,str(exc),invoice_id or subscription)
                    return 'review'
                except (KeyError,TypeError,ValueError):
                    self.hold(cur,user,'malformed_provider_evidence',invoice_id or subscription)
                    return 'review'

    def review_charge(self, charge_id):
        """Canonical refund/dispute reconciliation, addressed by stored charge.

        Event dispatch must call this for payment-review events; even a historical
        refund/dispute remains on manual hold. There is deliberately no clear API.
        """
        with self.connect() as con:
            if con.autocommit:raise ValueError('transaction_required')
            with con.cursor() as cur:
                cur.execute('''SELECT user_id FROM public.rr_retention_evidence
                    WHERE account_id=%s AND charge_id=%s''',(self.provider.scope.account,charge_id))
                row=cur.fetchone()
                if row is None:return 'unmatched_review'
                if not self.lock_user(cur,row[0]):return 'unmatched_review'
                c=self.provider.charge(charge_id)
                if (c.get('livemode') is not self.provider.scope.live or c.get('refunded') is not False
                    or c.get('amount_refunded')!=0 or c.get('disputed') is not False
                    or self.provider.payment_reviews(charge_id)):
                    self.hold(cur,row[0],'refund_or_dispute_manual_review',charge_id)
                    return 'review'
                return 'unchanged'


class RestrictedEvidenceStore(EvidenceStore):
    """Private lock capability + append-only table privileges. Explicit opt-in.

    Catalog/bindings are owner-maintained and immutable while ingestion runs.
    No profile/table UPDATE privilege is needed by this worker.
    """
    def lock_user(self, cur, user):
        cur.execute('SELECT rr_billing_private.lock_bound_user(%s)', (user,))
        return cur.fetchone()[0] is not None

    def binding(self, cur, user, subscription):
        cur.execute('''SELECT customer_id,price_id,product_id FROM public.rr_retention_bindings
            WHERE account_id=%s AND subscription_id=%s AND user_id=%s''',
            (self.provider.scope.account,subscription,user))
        return cur.fetchone()
