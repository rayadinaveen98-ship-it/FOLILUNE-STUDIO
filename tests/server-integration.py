"""Run the local HTTP console against real Node HTTP, synthetic model (not Ollama)."""
import json, os, socket, subprocess, tempfile, time, urllib.request, urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
with socket.socket() as s:
    s.bind(('127.0.0.1',0)); PORT=s.getsockname()[1]
BASE=f'http://127.0.0.1:{PORT}'

def req(path, data=None, headers=None):
    body=None if data is None else json.dumps(data).encode()
    r=urllib.request.Request(BASE+path, data=body, headers=({'Content-Type':'application/json'} if body else {}) | (headers or {}), method='POST' if body else 'GET')
    with urllib.request.urlopen(r,timeout=10) as result:
        b=result.read()
        return b if '/epub' in path else (b.decode() if path in ('/','/app.js') else json.loads(b))
with tempfile.TemporaryDirectory(prefix='folilune_http_test_') as tmp:
    env={**os.environ,'FOLILUNE_PORT':str(PORT),'FOLILUNE_OUTPUT':tmp}
    proc=subprocess.Popen(['node','engine/server.mjs'],cwd=ROOT,env=env,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    try:
        for i in range(40):
            try:
                home=req('/')
                if 'Commission a new story.' in home:break
            except Exception:time.sleep(0.1)
        else:raise RuntimeError('HTTP server not ready')
        brief={'premise':'A shy boatbuilder discovers that a fog-covered coastline keeps forgetting its old name.','language':'en','sections':3,'maxCalls':12,'maxOutputTokens':1000}
        data=req('/api/run',{'provider':'simulated','brief':brief})
        job=data['id']
        for i in range(100):
            status=req('/api/jobs/'+job)
            if status['status']=='ready_for_owner_review' and not status['reviewBusy']:break
            time.sleep(.1)
        else:raise RuntimeError(f'Job not completed: {status}')
        assert status['reviewVersion']==1 and len(status['sections'])==3
        assert b'PK\x03\x04' in req(f'/api/jobs/{job}/epub')[:4]
        assert req(f'/api/jobs/{job}/lock',{'sectionId':'section-001','locked':True})['locked']
        rev=req(f'/api/jobs/{job}/revise',{'sectionId':'section-002','instruction':'Improve the tension of the middle scene and preserve names.','expectedReviewVersion':1})
        assert rev['status']=='revision_queued'
        for i in range(100):
            status=req('/api/jobs/'+job)
            if status['reviewVersion']==2 and not status['reviewBusy']:break
            time.sleep(.1)
        else:raise RuntimeError(f'Revision not complete {status}')
        assert status['sections'][0]['locked'] is True
        assert status['reviewVersion']==2 and status['qa']['literaryQualityVerified']==False
        draft=req(f'/api/jobs/{job}/draft')
        assert draft['project']['sections'][1]['body']['text']==status['sections'][1]['text']
        try:
            req('/',headers={'Host':'evil.example'})
            raise AssertionError('Bad host accepted')
        except urllib.error.HTTPError as e: assert e.code==403
        print('Real local HTTP integration: PASS (create, synthesize, lock, revise, download latest EPUB, Host rejection)')
    finally:
        proc.terminate()
        try:proc.wait(timeout=3)
        except subprocess.TimeoutExpired:proc.kill()
