"""Local HTTP integration test: autonomous bounded queue, safety, history, recovery.
Uses a synthetic provider only; NOT evidence of true model prose quality.
"""
import json,os,socket,subprocess,tempfile,time,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
with socket.socket() as sock:
    sock.bind(('127.0.0.1',0)); PORT=sock.getsockname()[1]
BASE=f'http://127.0.0.1:{PORT}'
def request(path,data=None,method=None):
    body=None if data is None else json.dumps(data).encode()
    req=urllib.request.Request(BASE+path,data=body,headers={'Content-Type':'application/json'} if body else {},method=method or ('POST' if body else 'GET'))
    try:
        with urllib.request.urlopen(req,timeout=10) as res:
            raw=res.read();return res.status,raw if path.endswith('/epub') else json.loads(raw)
    except urllib.error.HTTPError as err:
        return err.code,json.loads(err.read())
def start(tmp):
    proc=subprocess.Popen(['node','engine/server.mjs'],cwd=ROOT,env={**os.environ,'FOLILUNE_PORT':str(PORT),'FOLILUNE_OUTPUT':tmp},stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    for _ in range(50):
        try:
            status,data=request('/api/queue')
            if status==200:return proc
        except Exception:time.sleep(.1)
    proc.terminate();raise RuntimeError('Server did not start')
def stop(proc):
    proc.terminate()
    try:proc.wait(timeout=4)
    except subprocess.TimeoutExpired:proc.kill();proc.wait(timeout=4)
profile={'authorization':'ALLOW_PRIVATE_DRAFT_CREATION_ONLY','theme':'Quiet coastal tales about missing names and forgotten promises','language':'te','genre':'gentle mystery','sections':3,'worksPerRun':2,'maxCallsPerWork':12,'maxOutputTokens':1200}
with tempfile.TemporaryDirectory(prefix='folilune_queue_http_') as tmp:
    proc=start(tmp)
    try:
        status,error=request('/api/queue/start',{'provider':'simulated','profile':{**profile,'authorization':'DENY'}})
        assert status==400 and 'authorization' in error['error']
        status,error=request('/api/queue/start',{'provider':'simulated','profile':{**profile,'worksPerRun':3}})
        assert status==400 and 'At most 2 works' in error['error']
        status,data=request('/api/queue/start',{'provider':'simulated','profile':profile})
        assert status==202 and data['publishingEnabled'] is False and data['count']==2
        status,error=request('/api/run',{'provider':'simulated','brief':{'premise':'The story cannot start while a batch has the engine busy.','sections':3}})
        assert status==429, (status,error)
        for i in range(200):
            status,q=request('/api/queue')
            if not q['active']:
                break
            time.sleep(.05)
        else:raise AssertionError('Private queue did not finish')
        assert q['publishingEnabled'] is False
        assert q['lastError'] is None,q
        assert len(q['lastResults'])==2,q['lastResults']
        assert {x['status'] for x in q['lastResults']}=={'ready_for_owner_review','duplicate-blocked'},q['lastResults']
        assert len(q['history'])==1,q['history']
        record=q['history'][0]; assert record['status']=='ready_for_owner_review'
        assert record['provider']=='simulated'
        jid=record['id']
        status,job=request('/api/jobs/'+jid)
        assert status==200 and len(job['sections'])==3 and job['provider']=='simulated'
        status,epub=request('/api/jobs/'+jid+'/epub')
        assert status==200 and epub[:4]==b'PK\x03\x04'
        status,publish=request('/api/publish',{'jobId':jid})
        assert status==404 and 'error' in publish
    finally:stop(proc)
    proc=start(tmp)
    try:
        status,q2=request('/api/queue')
        assert status==200 and not q2['active']
        assert len(q2['history'])==1 and q2['history'][0]['id']==jid
        status,job=request('/api/jobs/'+jid)
        assert status==200 and job['status']=='ready_for_owner_review'
        status,d=request('/api/queue/start',{'provider':'simulated','profile':{**profile,'worksPerRun':1}})
        assert status==202
        for _ in range(200):
            status,q3=request('/api/queue')
            if not q3['active']:break
            time.sleep(.05)
        else:raise AssertionError('Second batch did not finish')
        assert q3['lastResults'][0]['status']=='duplicate-blocked',q3['lastResults']
        assert len(q3['history'])==1,'Duplicate production must not create a second story job'
    finally:stop(proc)
print('Queue HTTP integration: PASS (authorization, limits, concurrency, synthetic ideation, duplicate prevention, private EPUB, restart history, publication blocked)')
