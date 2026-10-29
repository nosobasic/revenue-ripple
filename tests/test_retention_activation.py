"""Offline replay of Oct29 sandbox lifecycle; synthetic GETs and local HMAC only.

Observed order: subscription.created(incomplete), invoice.paid,
subscription.updated(active), invoice.payment_succeeded, subscription.deleted.
No credential, provider request, or captured webhook signature is used here.
"""
import time
import unittest
import test_retention_integration as fixture
from test_retention_durable import DurableBilling
from retention_fixture import USER

class Activation(unittest.TestCase):
    setUpClass = classmethod(DurableBilling.setUpClass.__func__)
    setUp = DurableBilling.setUp
    send = DurableBilling.send
    due = DurableBilling.due

    def process(self, event, kind, ident='sub_fixture'):
        self.assertEqual(self.send(event_id=event, kind=kind, ident=ident).status_code, 200)
        return self.worker.run_once()

    def state(self):
        return fixture.Integration.decision(self)

    def count(self, table):
        with fixture.connect() as con:
            return con.execute('SELECT count(*) FROM '+table).fetchone()[0]

    def pending(self):
        self.docs['/v1/subscriptions/sub_fixture']['status']='incomplete'
        self.docs['/v1/invoices/in_fixture'].update(status='open',amount_paid=0,amount_remaining=4700,billing_reason='subscription_create')
        self.assertEqual(self.process('evt_created','customer.subscription.created'),'no_extension')
        # Existing access contract labels bound-but-unpaid as review, with no sticky hold.
        self.assertEqual(self.state()['state'],'review')
        self.assertEqual(self.count('rr_retention_review_holds'),0)
        self.assertEqual(self.count('rr_retention_evidence'),0)

    def pay(self):
        self.docs['/v1/subscriptions/sub_fixture']['status']='active'
        self.docs['/v1/invoices/in_fixture'].update(status='paid',amount_paid=4700,amount_remaining=0)
        self.assertEqual(self.process('evt_paid','invoice.paid','in_fixture'),'recorded')
        self.assertEqual(self.state()['state'],'allowed')
        return self.state()['valid_until']

    def test_observed_incomplete_paid_duplicate_canceled_sequence(self):
        self.pending()
        end=self.pay()
        self.assertEqual(self.process('evt_updated','customer.subscription.updated'),'no_extension')
        self.assertEqual(self.process('evt_success','invoice.payment_succeeded','in_fixture'),'duplicate')
        self.docs['/v1/subscriptions/sub_fixture'].update(status='canceled',canceled_at=int(time.time()))
        self.assertEqual(self.process('evt_deleted','customer.subscription.deleted'),'no_extension')
        self.assertEqual(self.state()['state'],'allowed')
        self.assertEqual(self.state()['valid_until'],end)
        self.assertEqual(self.count('rr_retention_evidence'),1)
        self.assertEqual(self.count('rr_retention_review_holds'),0)
        with fixture.connect() as con:con.execute('UPDATE rr_retention_evidence SET period_end=now()')
        self.assertEqual(self.state()['state'],'denied')

    def test_unpaid_failure_and_duplicate_created_do_not_grant(self):
        self.pending()
        self.assertEqual(self.send(event_id='evt_created',kind='customer.subscription.created',ident='sub_fixture').status_code,200)
        self.assertEqual(self.worker.run_once(),'idle')
        self.assertEqual(self.process('evt_failed','invoice.payment_failed','in_fixture'),'no_extension')
        # Existing access contract labels bound-but-unpaid as review, with no sticky hold.
        self.assertEqual(self.state()['state'],'review')
        self.assertEqual(self.count('rr_retention_review_holds'),0)

    def test_delayed_creation_and_paid_after_cancellation(self):
        end=self.pay()
        self.docs['/v1/subscriptions/sub_fixture'].update(status='canceled',canceled_at=int(time.time()))
        self.assertEqual(self.process('evt_deleted','customer.subscription.deleted'),'no_extension')
        # Delayed envelopes must use current canonical state, never embedded status.
        self.assertEqual(self.send(event_id='evt_old_created',kind='customer.subscription.created',ident='sub_fixture',status='incomplete').status_code,200)
        self.assertEqual(self.worker.run_once(),'no_extension')
        self.assertEqual(self.process('evt_old_paid','invoice.paid','in_fixture'),'duplicate')
        self.assertEqual(self.state()['valid_until'],end)
        self.assertEqual(self.count('rr_retention_review_holds'),0)

    def test_paid_invoice_with_incomplete_canonical_state_retries(self):
        self.docs['/v1/subscriptions/sub_fixture']['status']='incomplete'
        self.assertEqual(self.process('evt_paid','invoice.paid','in_fixture'),'retry')
        self.assertEqual(self.count('rr_retention_evidence'),0)
        self.assertEqual(self.count('rr_retention_review_holds'),0)
        self.docs['/v1/subscriptions/sub_fixture']['status']='active'
        self.due();self.assertEqual(self.worker.run_once(),'recorded')
        self.assertEqual(self.state()['state'],'allowed')

    def test_existing_ambiguous_hold_is_not_automatically_cleared(self):
        with fixture.connect() as con:
            con.execute("INSERT INTO rr_retention_review_holds VALUES(%s,'unsupported_subscription_change','sub_fixture')",(USER,))
        self.assertEqual(self.process('evt_paid','invoice.paid','in_fixture'),'recorded')
        self.assertEqual(self.state()['state'],'review')
        self.assertEqual(self.count('rr_retention_review_holds'),1)

    def test_incomplete_does_not_bypass_unsafe_changes(self):
        self.docs['/v1/subscriptions/sub_fixture'].update(status='incomplete',pending_update={'expires_at':1})
        self.assertEqual(self.process('evt_bad','customer.subscription.created'),'review')
        self.docs['/v1/subscriptions/sub_fixture'].update(status='active',pending_update=None)
        self.assertEqual(self.process('evt_paid','invoice.paid','in_fixture'),'recorded')
        self.assertEqual(self.state()['state'],'review')

    def test_incomplete_does_not_bypass_owner_or_event_scope(self):
        self.docs['/v1/subscriptions/sub_fixture'].update(status='incomplete',customer='cus_wrong')
        self.assertEqual(self.send(event_id='evt_cross',kind='customer.subscription.created',ident='sub_fixture',account='acct_wrong').status_code,409)
        self.assertEqual(self.process('evt_owner','customer.subscription.created'),'review')
        self.assertEqual(self.count('rr_retention_evidence'),0)

    def test_refund_hold_survives_later_valid_payment(self):
        self.pay()
        self.docs['/v1/charges/ch_fixture']['disputed']=True
        self.assertEqual(self.send(event_id='evt_dispute',kind='charge.dispute.created',ident='dp_fixture',charge='ch_fixture').status_code,200)
        self.assertEqual(self.worker.run_once(),'review')
        self.docs['/v1/charges/ch_fixture']['disputed']=False
        self.assertEqual(self.process('evt_old_paid','invoice.paid','in_fixture'),'duplicate')
        self.assertEqual(self.state()['state'],'review')
