"""AWS adapters only. Core worker remains independent of queue/runtime."""
import json
import os
from functools import lru_cache
from .rpc import RPC
from .providers import OpenAISearchProvider
from .worker import run_job,dispatch_outbox,event_log

@lru_cache(maxsize=2)
def configuration(secret_id):
    import boto3
    value=boto3.client('secretsmanager').get_secret_value(SecretId=secret_id)['SecretString']
    return json.loads(value)

def worker_handler(event,context):
    failures=[]
    # Infrastructure and live-provider switches are both off by default.
    for record in event.get('Records',[]):
        try:
            if os.getenv('RR_VISIBILITY_ALLOW_LIVE')!='true':raise RuntimeError('Pilot disabled')
            settings=configuration(os.environ['VISIBILITY_SECRET_ARN'])
            rpc=RPC(settings['rpc_url'],settings['rpc_token'],api_key=settings['rpc_api_key'])
            provider=OpenAISearchProvider(settings.get('openai_key'))
            job_id=json.loads(record['body'])['job_id']
            outcome=run_job(rpc,provider,job_id,
                can_dispatch=lambda:context.get_remaining_time_in_millis()>45000)
            if outcome=='busy':raise RuntimeError('Claim busy')
        except Exception as exc:
            event_log('queue_retry',error_type=type(exc).__name__)
            failures.append({'itemIdentifier':record['messageId']})
    return {'batchItemFailures':failures}

def dispatcher_handler(event,context):
    import boto3
    settings=configuration(os.environ['VISIBILITY_SECRET_ARN'])
    rpc=RPC(settings['rpc_url'],settings['rpc_token'],api_key=settings['rpc_api_key'])
    queue=boto3.client('sqs')
    def send(job_id):
        if context.get_remaining_time_in_millis()<12000:raise RuntimeError('Dispatcher deadline')
        queue.send_message(QueueUrl=os.environ['VISIBILITY_QUEUE_URL'],MessageBody=json.dumps({'job_id':job_id}))
    sent=dispatch_outbox(rpc,send)
    event_log('ledger_metrics',**rpc.call('rr_v_metrics'))
    return {'sent':sent}
