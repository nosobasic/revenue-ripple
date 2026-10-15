import json
import time
from datetime import datetime,timezone
from .evidence import parse_evidence
from .domain import actions_for


def event_log(kind,**fields):
    # Never log prompts, raw answers, tokens, or user contact details.
    print(json.dumps({'component':'visibility','event':kind,**fields}))


def run_job(rpc,provider,job_id,log=event_log,can_dispatch=lambda:True):
    started=time.monotonic()
    claim=rpc.call('rr_v_worker',p_op='claim',p_job=job_id)
    if claim['status'] in ('completed','failed','reconciliation','missing'):return claim['status']
    if claim['status']!='claimed':return 'busy'
    job=claim['job'];token=job['token'];evidence=[]
    def transition(op,index=None,data=None):
        result=rpc.call('rr_v_worker',p_op=op,p_job=job_id,p_token=token,p_idx=index,p_data=data or {})
        if result.get('error'):raise RuntimeError(result['error'])
        return result
    try:
        provider.preflight(job) # before marking any question dispatched
        for question in claim['questions']:
            i=question['idx'];prompt=job['prompts'][i]
            if question['state']=='complete':
                evidence.append(question['evidence']);continue
            raw=question.get('raw')
            if question['state']=='pending':
                if not can_dispatch():raise RuntimeError('Insufficient worker time for another provider call')
                dispatch=transition('dispatch',i)
                response=provider.ask(prompt,dispatch['attempt_id'],job['model'])
                response['raw']['_rr_observed_at']=datetime.now(timezone.utc).isoformat()
                # Persist raw evidence/cost before parsing, so a parsing failure
                # retains observed spend, and restarts can reuse the same response.
                transition('returned',i,{**response,'attempt_id':dispatch['attempt_id']})
                log('provider_response',job_id=job_id,question=i,provider_latency_ms=response['latency_ms'],
                    cost_micros=response['cost_micros'],cost_kind=response['cost_kind'])
                raw=response['raw']
            elif question['state']!='returned':
                raise RuntimeError('Unknown provider outcome')
            record=parse_evidence(raw,prompt=prompt,business_name=job['input']['business_name'],
                                  domain=job['input']['domain'],observed_at=raw['_rr_observed_at'])
            if job['provider']=='fixture':
                record['provider']='Offline fixture';record['is_fixture']=True
                record['interpretation']='Synthetic local demonstration. No live search was run; these are not business observations.'
            else:record['is_fixture']=False
            transition('evidence',i,record);evidence.append(record)
        result={'business_name':job['input']['business_name'],'domain':job['input']['domain'],
                'is_fixture':job['provider']=='fixture','evidence':evidence,'actions':actions_for(evidence),
                'checked_at':datetime.now(timezone.utc).isoformat(),
                'limitations':'Three responses from one configured API run, not consumer ChatGPT results, a search ranking, or an estimate of overall visibility. Check time is not source publication time.'}
        transition('finish',data=result)
        log('completed',job_id=job_id,worker_duration_ms=round((time.monotonic()-started)*1000))
        return 'completed'
    except Exception as exc:
        log('worker_exception',job_id=job_id,error_type=type(exc).__name__)
        # If this DB call also fails, leave the lease for the sweeper. It will
        # inspect durable question state and will not repeat an ambiguous call.
        outcome=transition('fail')
        log('failed',job_id=job_id,status=outcome['status'],worker_duration_ms=round((time.monotonic()-started)*1000))
        return outcome['status']


def dispatch_outbox(rpc,send,log=event_log):
    recovery=rpc.call('rr_v_sweep')
    log('recovery',**recovery)
    sent=0
    for row in rpc.call('rr_v_outbox_claim'):
        # Enqueue first, ack second. A crash between them may duplicate a queue
        # message, but cannot duplicate provider work because claims are durable.
        send(row['job_id'])
        rpc.call('rr_v_outbox_ack',p_job=row['job_id'],p_token=row['token'])
        sent+=1
    log('outbox_dispatch',sent=sent)
    return sent
