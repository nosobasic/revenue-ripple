import sys,os,json,uuid,hashlib,subprocess
from pathlib import Path
C=Path(sys.argv[1]).resolve()
R=Path(__file__).resolve().parent
sys.path[:0]=[str(C),str(R/'tests/visibility')]
from support import LocalDatabase,app_for,A,B
import visibility.routes as routes
import visibility.domain as domain
import middleware.verified_identity as identity
assert Path(routes.__file__).is_relative_to(C) and Path(identity.__file__).is_relative_to(C)
n=0
def check(v,label):
 global n
 assert v,label
 n+=1;print('PASS',label)
db=LocalDatabase()
try:
 db.call('sql_script',sql="ALTER TABLE auth.users ADD COLUMN email_confirmed_at timestamptz,ADD COLUMN deleted_at timestamptz,ADD COLUMN banned_until timestamptz;UPDATE auth.users SET email_confirmed_at=now();UPDATE rr_v_config SET enabled=false,provider='disabled',budget_micros=0")
 for f in ['integrated-owner-pilot','beta-admission','luna-accounting','invoice-correction']:
  db.call('sql_script',sql=(R/'docs/review-sql'/('visibility-'+f+'.sql')).read_text())
 c=app_for(db).test_client(); h={'Authorization':'Bearer demo-a'};body={'business_name':'Synthetic','domain':'example.test','topic':'tutoring'}
 def submit(user='demo-a',**extra):
  return c.post('/api/visibility/jobs',json={**body,'preview_hash':preview['preview_hash'],**extra},headers={'Authorization':'Bearer '+user,'Idempotency-Key':str(uuid.uuid4())})
 check(c.get('/api/visibility/access').status_code==401,'missing auth')
 check(c.get('/api/visibility/access',headers={'Authorization':'Bearer invalid'}).status_code==401,'invalid auth')
 check(c.get('/api/visibility/access',headers={**h,'x-user-id':B}).status_code==403,'header identity mismatch')
 preview=c.post('/api/visibility/preview',json=body,headers=h).json
 check(len(preview['prompts'])==3,'closed preview remains read-only')
 check(c.get('/api/visibility/access',headers=h).json['enabled']==False,'closed access')
 check(submit().status_code==403,'unassigned pilot403')
 db.sql("UPDATE rr_v_config SET enabled=true,provider='fixture',budget_micros=10000000,pilot_owner_uuid=$1",[A])
 check(submit('demo-b',user_id=A,role='admin').status_code==403,'body identity cannot bypass owner')
 j=submit();check(j.status_code==202,'owner accepted202');jid=j.json['id']
 check(c.get('/api/visibility/jobs/'+jid,headers={'Authorization':'Bearer demo-b'}).status_code==404,'cross-user404')
 check(c.get('/api/visibility/jobs/'+jid,headers=h).status_code==200,'owner fetch200')
 check(submit().status_code==409,'consumed pilot409')
 token=db.call('rr_v_worker',p_op='claim',p_job=jid)['job']['token'];db.call('rr_v_worker',p_op='fail',p_job=jid,p_token=token)
 db.sql("UPDATE rr_v_config SET admission_mode='beta'")
 check(submit().status_code==403,'nonmember beta403')
 db.sql("INSERT INTO rr_v_beta_members(slot,user_id,enabled,admissions) VALUES(1,$1,true,2)",[A])
 check(submit().status_code==409,'beta cap409')
 c.application.config['VISIBILITY_OFFLINE_DEMO']=False
 check(c.get('/api/visibility/access',headers=h).status_code==503,'hosted fixture forbidden503')
 check(submit().status_code==503,'hosted fixture submit forbidden503')
 check(c.get('/api/visibility/jobs/not-uuid',headers=h).status_code==404,'malformed job404')
 check(c.post('/api/visibility/jobs',json=body,headers=h).status_code==400,'missing idempotency400')
 check(c.post('/api/visibility/preview',json={'user_id':A},headers=h).status_code==400,'malformed preview400')
 check(c.get('/api/visibility/jobs/latest',headers={'Authorization':'Bearer demo-b'}).json['job'] is None,'other latest isolated')
 print(json.dumps({'assertions':n,'candidate':str(C),'routes':routes.__file__,'identity':identity.__file__,'database':'PGlite synthetic baseline plus all4 migrations','provider_calls':0}))
finally:db.close()
