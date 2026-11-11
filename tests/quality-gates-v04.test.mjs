import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,readFile,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createJob,runJob,jobStatus} from '../engine/runner.mjs';
import {simulatedProvider} from '../engine/providers.mjs';
import {listLocalModels,requireInstalledModel} from '../engine/model-preflight.mjs';
import {requestOwnerRevision} from '../engine/review.mjs';

const bad=(prefix)=>Array.from({length:130},(_,i)=>`${prefix} Asha opens the same door with no meaningful change.`).join(' ');
const brief={premise:'Two friends in an isolated valley must return a missing lantern before the annual ceremony.',sections:3,maxCalls:12,maxOutputTokens:1000};
const temp=()=>mkdtemp(join(tmpdir(),'folilune-v04-'));
const dirtyProvider=({fix=false}={})=>{
 const base=simulatedProvider();
 return {...base,async generate(args){
   if(args.role==='writer'&&/SECTION_NUMBER:\s*3\b/.test(args.prompt))return {data:{text:bad('Bad draft')},usage:{inputTokens:20,outputTokens:250}};
   if(args.role==='reviser'&&args.prompt.includes('Fix:')&&!fix)return {data:{text:bad('Repaired but still repetitive')},usage:{inputTokens:20,outputTokens:250}};
   return base.generate(args);
 }};
};

test('persistent repetition blocks an EPUB after at most two automatic repairs',async()=>{
 const root=await temp();try{
  const dir=await createJob(root,brief),state=await runJob(dir,dirtyProvider());
  assert.equal(state.status,'needs_attention');
  assert.equal(state.qualityRepairAttempts,2);
  assert.equal(state.qa.passed,false);
  assert.ok(state.qa.warnings.some(w=>w.code==='HEAVY_REPETITION'));
  await assert.rejects(access(join(dir,'review-only.epub')));
  assert.equal((await runJob(dir,dirtyProvider())).status,'needs_attention','terminal quality failures must not silently rerun');
 } finally{await rm(root,{recursive:true,force:true})}
});

test('repair of bad last section preserves other sections and makes private review artifact',async()=>{
 const root=await temp();try{
  const dir=await createJob(root,brief),state=await runJob(dir,dirtyProvider({fix:true}));
  assert.equal(state.status,'ready_for_owner_review');
  assert.equal(state.qualityRepairAttempts,1);
  assert.equal(state.qa.passed,true);
  assert.ok(state.revisions.some(r=>r.automatedQaRepair));
  assert.ok((await readFile(join(dir,'review-only.epub'))).length>2000);
 } finally{await rm(root,{recursive:true,force:true})}
});

test('owner revision cannot replace valid edition with repetitive draft',async()=>{
 const root=await temp();try{
  const dir=await createJob(root,brief);await runJob(dir,simulatedProvider());
  const before=await jobStatus(dir),old=await readFile(join(dir,'review-only.epub'));
  const model={...simulatedProvider(),async generate(args){return args.role==='reviser'?{data:{text:bad('Regressed')}}:simulatedProvider().generate(args)}};
  await assert.rejects(requestOwnerRevision(dir,model,{sectionId:'section-002',instruction:'Rewrite this section with a more vivid scene.',expectedReviewVersion:1}),/blocking repetition/);
  const after=await jobStatus(dir);
  assert.equal(after.reviewVersion,before.reviewVersion);
  assert.equal(after.sections[1].text,before.sections[1].text);
  assert.deepEqual(await readFile(join(dir,'review-only.epub')),old);
 } finally{await rm(root,{recursive:true,force:true})}
});

test('model preflight only lists allowed installed local names and rejects missing model',async()=>{
 const http=createServer((_req,res)=>{res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({models:[{name:'mistral:latest'},{name:'qwen2.5:7b'},{name:'bad model'}]}))});
 await new Promise(r=>http.listen(0,'127.0.0.1',r));
 const baseUrl=`http://127.0.0.1:${http.address().port}`;
 try{
  const found=await listLocalModels({baseUrl});
  assert.deepEqual(found.models,['mistral:latest','qwen2.5:7b']);
  assert.equal(await requireInstalledModel('qwen2.5:7b',{baseUrl}),true);
  await assert.rejects(requireInstalledModel('not-installed',{baseUrl}),/not installed/);
  await assert.rejects(listLocalModels({baseUrl:'https://example.com'}),/loopback/);
 }finally{http.close()}
});
