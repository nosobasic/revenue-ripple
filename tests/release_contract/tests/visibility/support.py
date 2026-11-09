import json
import threading
import subprocess
from pathlib import Path
from types import SimpleNamespace
from flask import Flask
from visibility.routes import visibility_bp

ROOT=Path(__file__).resolve().parents[2]
A='00000000-0000-0000-0000-000000000001'
B='00000000-0000-0000-0000-000000000002'

class LocalDatabase:
    def __init__(self):
        self.lock=threading.Lock()
        self.process=subprocess.Popen(['node','tests/visibility/db_server.mjs'],cwd=ROOT,stdin=subprocess.PIPE,stdout=subprocess.PIPE,text=True)
        line=self.process.stdout.readline().strip()
        if line!='READY':
            self.close()
            raise RuntimeError('Local database failed: '+line)
        self.rpc=self
    def call(self,name,**args):
        with self.lock:
            self.process.stdin.write(json.dumps({'name':name,'args':args})+'\n');self.process.stdin.flush()
            line=self.process.stdout.readline()
            if not line:raise RuntimeError('Fixture database stopped')
            response=json.loads(line)
            if 'error' in response:raise RuntimeError(response['error'])
            return response['result']
    def sql(self,sql,args=None):return self.call('sql',sql=sql,args=args or [])
    def close(self):
        self.process.terminate();self.process.wait(timeout=10)
        self.process.stdin.close();self.process.stdout.close()


def app_for(db):
    app=Flask('visibility_offline_demo');app.config['VISIBILITY_OFFLINE_DEMO']=True
    def verify(token):
        if token not in ('demo-a','demo-b'):raise ValueError('Invalid fixture token')
        return SimpleNamespace(user=SimpleNamespace(id=A if token=='demo-a' else B,email='fixture@example.test'))
    app.supabase=SimpleNamespace(auth=SimpleNamespace(get_user=verify),
        rpc=lambda name,args:SimpleNamespace(execute=lambda:SimpleNamespace(data=db.rpc.call(name,**args))))
    app.register_blueprint(visibility_bp)
    return app
