"""Read-only inspection using the same canonical policy as persistence.
No credentials, HTTP routes, checkout or mutation APIs are installed here.
"""
from retention_billing.types import Binding, ReviewRequired
from retention_billing.policy import PaidPolicy

class Reconciler:
    def __init__(self, connect_readonly, provider, policy=None):
        self.connect_readonly,self.provider=connect_readonly,provider
        self.policy=policy or PaidPolicy()
    def inspect(self,user_id,subscription,invoice_id=None):
        try:
            with self.connect_readonly() as con:
                if con.autocommit:return {'state':'review'}
                with con.cursor() as cur:
                    cur.execute('SET TRANSACTION READ ONLY')
                    cur.execute('''SELECT customer_id,price_id,product_id FROM public.rr_retention_bindings
                        WHERE user_id=%s AND account_id=%s AND subscription_id=%s''',
                        (user_id,self.provider.scope.account,subscription))
                    row=cur.fetchone()
                    if row is None:return {'state':'review'}
                    binding=Binding(self.provider.scope,subscription,row[0],str(user_id),row[1],row[2])
                    cur.execute('SELECT 1 FROM public.rr_retention_review_holds WHERE user_id=%s LIMIT 1',(user_id,))
                    if cur.fetchone():return {'state':'review'}
                    sub=self.provider.subscription(subscription)
                    inv=self.provider.invoice(invoice_id) if invoice_id else None
                    settlement=self.policy.decide(binding,sub,inv,self.provider)
                    cur.execute('SELECT extract(epoch FROM clock_timestamp())')
                    now=cur.fetchone()[0]
                    if settlement.end is None:return {'state':'no_extension'}
                    if settlement.start>now:return {'state':'review'}
                    if settlement.end<=now:return {'state':'denied'}
                    return {'state':'eligible_proposal','period_start':settlement.start,'period_end':settlement.end}
        except Exception:
            return {'state':'review'}
