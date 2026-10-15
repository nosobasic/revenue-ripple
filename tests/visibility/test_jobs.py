import json
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor
from visibility.domain import prepare
from visibility.providers import FixtureProvider
from visibility.worker import run_job,dispatch_outbox
from support import LocalDatabase,app_for,A,B

class JobTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.db=LocalDatabase()
    @classmethod
    def tearDownClass(cls):cls.db.close()
    def setUp(self):
        self.db.sql('TRUNCATE rr_v_reconciliations,rr_v_outbox,rr_v_questions,rr_v_jobs')
        self.db.sql("UPDATE rr_v_config SET enabled=true,provider='fixture',budget_micros=10000000,max_running=2,max_pending=50,attempts_per_day=3")
        self.client=app_for(self.db).test_client();self.rpc=self.db.rpc
        self.body={'business_name':'Example Studio','domain':'business.example','topic':'Tutoring for high school students in Austin'}
        self.headers={'Authorization':'Bearer demo-a','Idempotency-Key':str(uuid.uuid4())}
        self.preview=self.client.post('/api/visibility/preview',json=self.body,headers=self.headers).json
    def submit(self,**overrides):
        return self.client.post('/api/visibility/jobs',json={**self.body,'preview_hash':self.preview['preview_hash'],**overrides},headers=self.headers)
    def call(self,op,j,token=None,idx=None,data=None):
        return self.rpc.call('rr_v_worker',p_op=op,p_job=j,p_token=token,p_idx=idx,p_data=data or {})
    def test_complete_journey_and_credit(self):
        before=self.rpc.call('rr_v_access',p_user=A);self.assertEqual(before['remaining'],1)
        r=self.submit();self.assertEqual(r.status_code,202);j=r.json['id']
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['reserved'],1)
        queue=[];self.assertEqual(dispatch_outbox(self.rpc,queue.append,log=lambda *a,**k:None),1)
        self.assertEqual(queue,[j])
        self.assertEqual(run_job(self.rpc,FixtureProvider(),j,log=lambda *a,**k:None),'completed')
        saved=self.client.get('/api/visibility/jobs/'+j,headers=self.headers).json['job']
        self.assertEqual(saved['completed_questions'],3);self.assertEqual(saved['credit'],'charged')
        self.assertEqual(len(saved['result']['actions']),3);self.assertTrue(saved['result']['is_fixture'])
        self.assertEqual(len(saved['result']['evidence']),3)
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['used'],1)
        self.assertEqual(self.submit().json['id'],j)
        self.assertEqual(run_job(self.rpc,FixtureProvider(),j),'completed')
    def test_auth_ownership_preview_and_production_fixture_gate(self):
        self.assertEqual(self.client.post('/api/visibility/jobs',json=self.body).status_code,401)
        self.assertEqual(self.submit(preview_hash='changed').status_code,409)
        j=self.submit(user_id=B,role='admin',plan='premium',credit_plan='premium').json['id']
        self.assertEqual(self.db.sql('SELECT credit_plan FROM rr_v_jobs WHERE id=$1',[j])[0]['credit_plan'],'free')
        self.assertEqual(self.client.get('/api/visibility/jobs/'+j,headers={'Authorization':'Bearer demo-b'}).status_code,404)
        self.client.application.config['VISIBILITY_OFFLINE_DEMO']=False
        self.assertEqual(self.client.get('/api/visibility/access',headers=self.headers).status_code,503)
    def test_concurrent_submit_and_worker_claim(self):
        values,prompts,h=prepare(self.body)
        def submit(key):return self.rpc.call('rr_v_submit',p_user=A,p_key=key,p_hash=h,p_input=values,p_prompts=prompts)
        key=str(uuid.uuid4())
        with ThreadPoolExecutor(4) as pool:results=list(pool.map(submit,[key,key,str(uuid.uuid4()),str(uuid.uuid4())]))
        jobs=[r['id'] for r in results if 'id' in r];self.assertEqual(len(set(jobs)),1)
        with ThreadPoolExecutor(4) as pool:claims=list(pool.map(lambda _:self.call('claim',jobs[0]),range(4)))
        self.assertEqual(sum(c['status']=='claimed' for c in claims),1)
    def test_queue_failure_and_lost_ack_are_recoverable(self):
        j=self.submit().json['id']
        with self.assertRaises(RuntimeError):dispatch_outbox(self.rpc,lambda _:(_ for _ in ()).throw(RuntimeError('queue down')))
        self.assertEqual(self.rpc.call('rr_v_get',p_user=A,p_job=j)['status'],'queued')
        self.db.sql("UPDATE rr_v_outbox SET lease_until=now()-interval '1 second'")
        queued=[];dispatch_outbox(self.rpc,queued.append)
        self.db.sql("UPDATE rr_v_outbox SET next_send_at=now()-interval '1 second'")
        dispatch_outbox(self.rpc,queued.append);self.assertEqual(queued,[j,j])
        provider=FixtureProvider();calls=[];original=provider.ask
        provider.ask=lambda *a:(calls.append(a) or original(*a))
        for item in queued:run_job(self.rpc,provider,item)
        self.assertEqual(len(calls),3)
    def test_pre_dispatch_failure_refunds(self):
        j=self.submit().json['id'];p=FixtureProvider()
        p.preflight=lambda _:(_ for _ in ()).throw(RuntimeError('disabled'))
        self.assertEqual(run_job(self.rpc,p,j),'failed')
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['remaining'],1)
        self.assertEqual(self.db.sql('SELECT hold_micros FROM rr_v_jobs')[0]['hold_micros'],0)
    def test_timeout_is_not_retried_or_budget_refunded(self):
        j=self.submit().json['id'];p=FixtureProvider();calls=[]
        def ask(*args):calls.append(args);raise TimeoutError('possibly accepted')
        p.ask=ask
        self.assertEqual(run_job(self.rpc,p,j),'reconciliation')
        self.assertEqual(run_job(self.rpc,p,j),'reconciliation');self.assertEqual(len(calls),1)
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['remaining'],1)
        self.assertEqual(self.db.sql('SELECT hold_micros FROM rr_v_jobs')[0]['hold_micros'],100000)
        self.assertEqual(self.db.sql('SELECT cost_kind FROM rr_v_questions WHERE idx=0')[0]['cost_kind'],'unknown')
        self.headers['Idempotency-Key']=str(uuid.uuid4());self.assertEqual(self.submit().json['error'],'run_in_progress')
        self.rpc.call('rr_v_reconcile',p_job=j,p_idx=0,p_actual_micros=15000,p_note='Synthetic provider billing record confirms one accepted call')
        self.assertEqual(self.db.sql('SELECT cost_micros FROM rr_v_questions WHERE idx=0')[0]['cost_micros'],15000)
        self.assertEqual(self.submit().status_code,202)
    def test_resume_returned_response_without_repeating_question(self):
        j=self.submit().json['id'];c=self.call('claim',j);token=c['job']['token']
        dispatch=self.call('dispatch',j,token,0);p=FixtureProvider()
        response=p.ask(c['job']['prompts'][0],dispatch['attempt_id'],'fixture');response['raw']['_rr_observed_at']='2026-10-07T00:00:00+00:00'
        self.call('returned',j,token,0,{**response,'attempt_id':dispatch['attempt_id']})
        self.db.sql("UPDATE rr_v_jobs SET lease_until=now()-interval '1 second'")
        self.rpc.call('rr_v_sweep');calls=[];original=p.ask;p.ask=lambda *args:(calls.append(args) or original(*args))
        self.assertEqual(run_job(self.rpc,p,j),'completed');self.assertEqual(len(calls),2)
        result=self.rpc.call('rr_v_get',p_user=A,p_job=j)['result']
        self.assertEqual(result['evidence'][0]['observed_at'],'2026-10-07T00:00:00+00:00')
        self.assertEqual(self.call('dispatch',j,token,1)['error'],'stale_worker')
    def test_crash_after_dispatch_never_reclaims_provider_work(self):
        j=self.submit().json['id'];c=self.call('claim',j);token=c['job']['token'];self.call('dispatch',j,token,0)
        self.db.sql("UPDATE rr_v_jobs SET lease_until=now()-interval '1 second'");self.rpc.call('rr_v_sweep')
        self.assertEqual(self.call('claim',j)['status'],'reconciliation')
        self.assertEqual(self.call('dispatch',j,token,1)['error'],'stale_worker')
    def test_invalid_answer_refunds_user_but_retains_cost(self):
        j=self.submit().json['id'];p=FixtureProvider();original=p.ask
        def ask(*args):
            r=original(*args);r['raw']['status']='incomplete';r['cost_micros']=12000;r['cost_kind']='estimated';return r
        p.ask=ask;self.assertEqual(run_job(self.rpc,p,j),'failed')
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['remaining'],1)
        self.assertEqual(self.db.sql('SELECT sum(cost_micros)::int total FROM rr_v_questions')[0]['total'],12000)
        self.assertEqual(self.db.sql('SELECT hold_micros FROM rr_v_jobs')[0]['hold_micros'],0)
    def test_global_budget_concurrency_and_attempt_caps(self):
        self.db.sql('UPDATE rr_v_config SET budget_micros=100000,max_running=1')
        j=self.submit().json['id']
        values,prompts,h=prepare(self.body)
        r=self.rpc.call('rr_v_submit',p_user=B,p_key=str(uuid.uuid4()),p_hash=h,p_input=values,p_prompts=prompts)
        self.assertEqual(r['error'],'budget_unavailable')
        self.db.sql('UPDATE rr_v_config SET budget_micros=200000')
        other=self.rpc.call('rr_v_submit',p_user=B,p_key=str(uuid.uuid4()),p_hash=h,p_input=values,p_prompts=prompts)['id']
        self.assertEqual(self.call('claim',j)['status'],'claimed');self.assertEqual(self.call('claim',other)['status'],'busy')
    def test_queue_expiry_restores_credit(self):
        j=self.submit().json['id'];self.db.sql("UPDATE rr_v_jobs SET created_at=now()-interval '31 minutes'")
        self.rpc.call('rr_v_sweep');self.assertEqual(self.rpc.call('rr_v_get',p_user=A,p_job=j)['status'],'failed')
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['remaining'],1)
    def test_daily_attempt_cap_after_refunds(self):
        self.db.sql('UPDATE rr_v_config SET attempts_per_day=2')
        for _ in range(2):
            self.headers['Idempotency-Key']=str(uuid.uuid4());j=self.submit().json['id']
            claim=self.call('claim',j);self.call('fail',j,claim['job']['token'])
        self.headers['Idempotency-Key']=str(uuid.uuid4())
        self.assertEqual(self.submit().json['error'],'attempt_cap')
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['remaining'],1)
    def test_readiness_does_not_spend_evidence_credit(self):
        self.db.sql('INSERT INTO rr_scans(user_id,request_key,input_hash,result) VALUES($1,$2,$3,$4)',[A,str(uuid.uuid4()),'readiness',{'actions':[]}])
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['remaining'],1)
    def test_deadline_stops_before_dispatch(self):
        j=self.submit().json['id']
        self.assertEqual(run_job(self.rpc,FixtureProvider(),j,can_dispatch=lambda:False),'failed')
        self.assertEqual(self.db.sql("SELECT count(*)::int n FROM rr_v_questions WHERE state='dispatched'")[0]['n'],0)
        self.assertEqual(self.rpc.call('rr_v_access',p_user=A)['remaining'],1)
    def test_cost_anomaly_stops_further_dispatch(self):
        j=self.submit().json['id'];p=FixtureProvider();original=p.ask;calls=[]
        def ask(*args):
            calls.append(args);r=original(*args);r['cost_micros']=110000;r['cost_kind']='estimated';return r
        p.ask=ask
        self.assertEqual(run_job(self.rpc,p,j),'failed');self.assertEqual(len(calls),1)
        self.assertFalse(self.rpc.call('rr_v_access',p_user=A)['enabled'])
        metrics=self.rpc.call('rr_v_metrics');self.assertEqual(metrics['accounted_cost_micros'],110000)
    def test_worker_and_dispatcher_roles_have_narrow_access(self):
        for role in ['anon','authenticated','rr_visibility_worker','rr_visibility_dispatcher']:
            try:
                self.db.sql('SET ROLE '+role)
                with self.assertRaises(RuntimeError):self.db.sql('SELECT * FROM rr_v_config')
                with self.assertRaises(RuntimeError):self.db.sql('UPDATE rr_v_config SET budget_micros=100000000')
                with self.assertRaises(RuntimeError):self.rpc.call('rr_v_submit',p_user=A,p_key=str(uuid.uuid4()),p_hash='x',p_input={},p_prompts=['a','b','c'])
            finally:self.db.sql('RESET ROLE')
    def test_ambiguous_outcome_keeps_concurrency_slot(self):
        self.db.sql('UPDATE rr_v_config SET max_running=1')
        j=self.submit().json['id'];c=self.call('claim',j);self.call('dispatch',j,c['job']['token'],0)
        self.call('fail',j,c['job']['token'])
        values,prompts,h=prepare(self.body)
        other=self.rpc.call('rr_v_submit',p_user=B,p_key=str(uuid.uuid4()),p_hash=h,p_input=values,p_prompts=prompts)['id']
        self.assertEqual(self.call('claim',other)['status'],'busy')
    def test_disabled_default_no_execution(self):
        self.db.sql('UPDATE rr_v_config SET enabled=false')
        self.assertEqual(self.submit().status_code,503)

if __name__=='__main__':unittest.main()
