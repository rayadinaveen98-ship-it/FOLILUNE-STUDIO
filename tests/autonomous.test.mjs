import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,access,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {createJob,runJob,validateBrief,jobStatus} from '../engine/runner.mjs';
import {ollamaProvider,simulatedProvider} from '../engine/providers.mjs';
import {validateStudioDraft} from '../src/content-model.mjs';

const brief={premise:'The lighthouse shines whenever an old secret is finally told by the village keeper.',language:'en',sections:3,maxCalls:10,maxOutputTokens:800};
const temp=()=>mkdtemp(join(tmpdir(),'folilune-autonomy-'));
test('brief rejects missing premise and excessive calls',()=>{
  assert.throws(()=>validateBrief({premise:'short'}),/Premise/);
  assert.throws(()=>validateBrief({...brief,maxCalls:999}),/maxCalls/);
  assert.equal(validateBrief(brief).sections,3);
});
test('simulation runs whole multi-stage pipeline, exports structured review and EPUB without publishing', async()=>{
  const root=await temp();try{
    const dir=await createJob(root,brief);
    const state=await runJob(dir,simulatedProvider());
    assert.equal(state.status,'ready_for_owner_review');assert.equal(state.calls,7);
    assert.equal(state.sections.length,3);assert.equal(state.revisions.length,1);
    assert.ok(state.revisions[0].before!==state.revisions[0].after);
    assert.equal(state.qa.passed,true);assert.equal(state.qa.realReaderVerified,false);
    assert.equal(state.qa.provider,'simulated');
    assert.equal(validateStudioDraft(JSON.parse(await readFile(join(dir,'review-draft.json')))).ok,true);
    const epub=await readFile(join(dir,'review-only.epub'));
    assert.equal(epub.subarray(0,4).toString('hex'),'504b0304');
    assert.ok(epub.length>2000);
    assert.equal((await runJob(dir,simulatedProvider())).calls,7,'completed job must not regenerate');
    assert.ok(!state.events.some(x=>/published into reader/i.test(x.message)));
  }finally{await rm(root,{recursive:true,force:true});}
});
test('interrupted stage can resume without repeating finished chapters',async()=>{
  const root=await temp();try{
    const dir=await createJob(root,brief);
    const partial=await runJob(dir,simulatedProvider(),{maxStages:3});
    assert.equal(partial.status,'paused');assert.equal(partial.sections.length,1);
    const end=await runJob(dir,simulatedProvider());
    assert.equal(end.status,'ready_for_owner_review');assert.equal(end.calls,7);
    assert.equal(end.sections.length,3);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('provider errors create recoverable checkpoint; no unapproved epub produced',async()=>{
  const root=await temp();try{
    const dir=await createJob(root,brief);
    await assert.rejects(runJob(dir,simulatedProvider({failAt:3})),/Simulated provider failure/);
    const state=await jobStatus(dir);assert.equal(state.status,'failed');assert.equal(state.stage,'chapters');
    await assert.rejects(access(join(dir,'review-only.epub')));
    const resumed=await runJob(dir,simulatedProvider());assert.equal(resumed.status,'ready_for_owner_review');
  }finally{await rm(root,{recursive:true,force:true});}
});
test('provider/model mismatch refuses resume before making requests',async()=>{
  const root=await temp();try{
    const dir=await createJob(root,brief);await runJob(dir,simulatedProvider(),{maxStages:1});
    await assert.rejects(runJob(dir,{kind:'ollama',model:'different',generate:async()=>({})}),/different provider/);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('Ollama adapter actually sends structured chat request to local HTTP stub',async()=>{
  let payload;
  const http=createServer(async(req,res)=>{let s='';for await(const chunk of req)s+=chunk;payload=JSON.parse(s);res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({message:{content:'{"text":"Original local test"}'},prompt_eval_count:12,eval_count:6}));});
  await new Promise(r=>http.listen(0,'127.0.0.1',r));
  try{
    const port=http.address().port;
    const provider=ollamaProvider({model:'local-test-model',baseUrl:`http://127.0.0.1:${port}`,timeoutMs:10000});
    const answer=await provider.generate({role:'writer',prompt:'Write an original paragraph',maxOutputTokens:400});
    assert.deepEqual(answer.data,{text:'Original local test'});
    assert.equal(answer.usage.inputTokens,12);
    assert.equal(payload.stream,false);assert.equal(payload.format,'json');
    assert.equal(payload.options.num_predict,400);
    assert.equal(payload.messages.length,2);
  }finally{http.close();}
});
test('Ollama adapter blocks nonlocal endpoints',()=>{
  assert.throws(()=>ollamaProvider({model:'a',baseUrl:'https://example.com'}),/loopback/);
});
test('no publish functions or catalog changes exist in first engine',async()=>{
  const source=await readFile(new URL('../engine/runner.mjs',import.meta.url),'utf8');
  assert.ok(!source.includes('POST /publish'));
  assert.ok(!source.includes('publishCatalog('));
});

test('authorized autonomy profile generates an idea and complete private work without individual premise',async()=>{
  const {runAuthorizedBatch}=await import('../engine/auto-queue.mjs');
  const root=await temp();try{
    const profile={authorization:'ALLOW_PRIVATE_DRAFT_CREATION_ONLY',theme:'Mysterious small towns and forgotten promises',worksPerRun:1,sections:3,maxCallsPerWork:10};
    const r=await runAuthorizedBatch(profile,simulatedProvider(),{outputRoot:root});
    assert.equal(r.length,1);assert.equal(r[0].status,'ready_for_owner_review');
    const ledger=JSON.parse(await readFile(join(root,'private-production-ledger.json'),'utf8'));
    assert.equal(ledger.history.length,1);
    assert.equal(ledger.history[0].status,'ready_for_owner_review');
    const again=await runAuthorizedBatch(profile,simulatedProvider(),{outputRoot:root});
    assert.equal(again[0].status,'duplicate-blocked');
  }finally{await rm(root,{recursive:true,force:true});}
});

test('autonomous production refuses unapproved or excessive batch profile',async()=>{
  const {validateProfile}=await import('../engine/auto-queue.mjs');
  assert.throws(()=>validateProfile({theme:'A detailed fantasy universe'}),/authorization/);
  assert.throws(()=>validateProfile({authorization:'ALLOW_PRIVATE_DRAFT_CREATION_ONLY',theme:'A detailed fantasy universe',worksPerRun:20}),/At most 2/);
});
