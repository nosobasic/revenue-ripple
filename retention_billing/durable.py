"""Inactive, explicitly composed durable receipt/worker implementation.

Only authenticated minimal event references are stored; no customer payloads or
signing secrets. Provider verification occurs again from canonical GETs at work time.
No loop, scheduler, credentials, schema setup, or production route is installed.
"""
import hashlib
import json
from uuid import uuid4
import stripe
from flask import Flask, jsonify, request
from psycopg.types.json import Jsonb
from .events import EventHandler
from .store import RestrictedEvidenceStore
from .stripe_adapter import plain
from .types import ReviewRequired, object_id

INVOICE_EVENTS = {'invoice.paid', 'invoice.payment_succeeded', 'invoice.payment_failed',
                  'invoice.voided', 'invoice.marked_uncollectible'}
SUB_EVENTS = {'customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'}
REVIEW_EVENTS = {'charge.refunded','refund.created','refund.updated','refund.failed',
                 'charge.dispute.created','charge.dispute.updated','charge.dispute.closed'}
SUCCESS = {'recorded','duplicate','review','no_extension','unchanged','ignored'}


def reference(value):
    if not isinstance(value,str) or not value or len(value)>255:
        raise ReviewRequired('invalid_reference')
    return value


def minimal_event(event, scope):
    if (event.get('livemode') is not scope.live or event.get('account',scope.account)!=scope.account
        or event.get('api_version')!=scope.api_version):
        raise ReviewRequired('event_scope_mismatch')
    kind=event['type']; ident=reference(event['id'])
    if kind not in INVOICE_EVENTS | SUB_EVENTS | REVIEW_EVENTS:return None
    source=event['data']['object']; obj={'id':reference(source['id'])}
    if kind in REVIEW_EVENTS and kind!='charge.refunded':
        obj['charge']=reference(object_id(source.get('charge')))
    return {'id':ident,'account':scope.account,'livemode':scope.live,
            'api_version':scope.api_version,'type':kind,'data':{'object':obj}}


class ReceiptQueue:
    MAX_ATTEMPTS=8
    LEASE_SECONDS=120
    def __init__(self,connect,scope):self.connect,self.scope=connect,scope

    def enqueue(self,event):
        event=minimal_event(event,self.scope)
        if event is None:return 'ignored'
        digest=hashlib.sha256(json.dumps(event,sort_keys=True,separators=(',',':')).encode()).hexdigest()
        with self.connect() as con:
            if con.autocommit:raise ValueError('transaction_required')
            con.execute('''INSERT INTO rr_billing_private.receipts(account_id,event_id,event,fingerprint)
                VALUES(%s,%s,%s,%s) ON CONFLICT(account_id,event_id) DO NOTHING''',
                (self.scope.account,event['id'],Jsonb(event),digest))
            row=con.execute('SELECT fingerprint FROM rr_billing_private.receipts WHERE account_id=%s AND event_id=%s',
                            (self.scope.account,event['id'])).fetchone()
            if row is None or row[0]!=digest:raise ReviewRequired('event_identity_conflict')
        return 'accepted' # commit has completed before acknowledgment

    def claim(self):
        token=str(uuid4())
        with self.connect() as con:
            if con.autocommit:raise ValueError('transaction_required')
            # A crash during the last allowed attempt must become visible dead work.
            con.execute('''UPDATE rr_billing_private.receipts SET status='dead',result='attempts_exhausted',
                lease_token=NULL,lease_until=NULL WHERE account_id=%s AND status='running'
                AND lease_until<=clock_timestamp() AND attempts>=%s''',(self.scope.account,self.MAX_ATTEMPTS))
            row=con.execute('''WITH candidate AS (
                SELECT account_id,event_id FROM rr_billing_private.receipts WHERE account_id=%s
                AND attempts<%s AND ((status='pending' AND next_attempt<=clock_timestamp())
                OR (status='running' AND lease_until<=clock_timestamp()))
                ORDER BY next_attempt,event_id FOR UPDATE SKIP LOCKED LIMIT 1)
                UPDATE rr_billing_private.receipts r SET status='running',attempts=r.attempts+1,
                lease_token=%s,lease_until=clock_timestamp()+(%s*interval '1 second')
                FROM candidate c WHERE r.account_id=c.account_id AND r.event_id=c.event_id
                RETURNING r.event_id,r.event,r.attempts''',
                (self.scope.account,self.MAX_ATTEMPTS,token,self.LEASE_SECONDS)).fetchone()
        return None if row is None else (row[0],row[1],row[2],token)

    def finish(self,claim,result,retry=False,dead=False):
        ident,event,attempt,token=claim
        status='dead' if dead or (retry and attempt>=self.MAX_ATTEMPTS) else 'pending' if retry else 'done'
        delay=min(3600,30*2**(attempt-1))
        with self.connect() as con:
            if con.autocommit:raise ValueError('transaction_required')
            changed=con.execute('''UPDATE rr_billing_private.receipts SET status=%s,result=%s,
                lease_token=NULL,lease_until=NULL,next_attempt=clock_timestamp()+(%s*interval '1 second')
                WHERE account_id=%s AND event_id=%s AND status='running' AND lease_token=%s''',
                (status,result,delay,self.scope.account,ident,token)).rowcount
        return changed==1 # stale workers cannot finish another worker's lease

    def counts(self):
        with self.connect() as con:
            return dict(con.execute('SELECT status,count(*) FROM rr_billing_private.receipts WHERE account_id=%s GROUP BY status',
                                    (self.scope.account,)).fetchall())


class ReceiptWorker:
    def __init__(self,queue,handler):
        if queue.scope!=handler.provider.scope:raise ValueError('worker_scope_mismatch')
        self.queue,self.handler=queue,handler
    def run_once(self):
        claim=self.queue.claim()
        if claim is None:return 'idle'
        try:
            event=minimal_event(claim[1],self.queue.scope)
            if event is None:raise ReviewRequired('unsupported_receipt')
            result=self.handler.process_verified(event)
        except ReviewRequired:
            self.queue.finish(claim,'event_requires_review',dead=True)
            return 'dead'
        except Exception:
            self.queue.finish(claim,'retry_required',retry=True)
            return 'retry'
        if result not in SUCCESS:
            self.queue.finish(claim,'binding_requires_review' if result=='unmatched_review' else 'retry_required',retry=True)
            return 'retry'
        return result if self.queue.finish(claim,result) else 'lease_lost'


def create_durable_app(*,connect,provider,endpoint_secret,policy):
    handler=EventHandler(connect,provider,endpoint_secret,policy,store_factory=RestrictedEvidenceStore)
    queue=ReceiptQueue(connect,provider.scope)
    app=Flask(__name__);app.config['MAX_CONTENT_LENGTH']=1024*1024
    @app.after_request
    def no_cache(response):
        response.headers['Cache-Control']='no-store';return response
    @app.post('/webhook/retention')
    def ingest():
        signature=request.headers.get('Stripe-Signature')
        if not signature:return jsonify(status='invalid_signature'),400
        raw=request.get_data(cache=False)
        try:
            event=plain(stripe.Webhook.construct_event(raw,signature,endpoint_secret,tolerance=300))
            result=queue.enqueue(event)
        except stripe.error.SignatureVerificationError:return jsonify(status='invalid_signature'),400
        except ReviewRequired:return jsonify(status='event_requires_review'),409
        except (KeyError,TypeError,ValueError,AttributeError):return jsonify(status='invalid_event'),400
        except Exception:return jsonify(status='retry_required'),503
        return jsonify(status=result),200
    # Explicit return for operator composition. Nothing starts a worker automatically.
    return app,ReceiptWorker(queue,handler)
