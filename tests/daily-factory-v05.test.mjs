import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {validateDailyPolicy,planDailySlots,runDailyOnce,localDate,shouldRunNow} from '../engine/daily-factory.mjs';
import {simulatedProvider} from '../engine/providers.mjs';
const policy={authorization:'ALLOW_PRIVATE_DRAFT_CREATION_ONLY',enabled:true,mode:'simulated',maxDailySpendUSD:0,
  worksPerDay:2,maxDailyModelCalls:40,maxCallsPerWork:12,sections:3,maxOutputTokens:2200,timezone:'Asia/Kolkata',
  theme:'Original fiction about quiet mysteries and choices',genres:['mystery','fantasy','adventure'],languages:['en','te']};

test('policy requires owner authorization and defaults to no spend',()=>{
  assert.equal(validateDailyPolicy(policy).worksPerDay,2);
  assert.throws(()=>validateDailyPolicy({...policy,authorization:''}),/authorization/i);
  assert.throws(()=>validateDailyPolicy({...policy,worksPerDay:11}),/1–10/);
  assert.throws(()=>validateDailyPolicy({...policy,maxDailyModelCalls:2}),/ceiling/);
});
test('live production requires separate authorization and positive spend cap',()=>{
  assert.throws(()=>validateDailyPolicy({...policy,mode:'managed'}),/authorization/i);
  assert.throws(()=>validateDailyPolicy({...policy,mode:'managed',liveAuthorized:true}),/spending cap/);
  assert.equal(validateDailyPolicy({...policy,mode:'managed',liveAuthorized:true,maxDailySpendUSD:10}).mode,'managed');
});
test('deterministic slots and language/genre variety',()=>{
  const a=planDailySlots(policy,'2026-11-12'),b=planDailySlots(policy,'2026-11-12');
  assert.deepEqual(a,b);assert.equal(a.slots.length,2);
  assert.notEqual(a.slots[0].key,a.slots[1].key);
  assert.notEqual(a.slots[0].genre,a.slots[1].genre);
  assert.notEqual(a.slots[0].language,a.slots[1].language);
  assert.throws(()=>planDailySlots(policy,'2026-02-30'),/Invalid|RangeError/);
});
test('timezone date follows Asia/Kolkata, not machine local timezone',()=>{
  assert.equal(localDate('Asia/Kolkata',new Date('2026-11-11T20:00:00Z')),'2026-11-12');
});
test('default disabled policy never executes private batch',async()=>{
  await assert.rejects(runDailyOnce({...policy,enabled:false},{provider:simulatedProvider()}),/disabled/i);
});
test('synthetic slots are private, saved and never regenerated for same day',async()=>{
  const root=await mkdtemp(join(tmpdir(),'folilune-daily-'));
  try{
    const base=simulatedProvider();let ideas=0;const distinct={...base,generate:async req=>req.role==='ideation'?{data:{premise:`Original speculative mystery number ${++ideas}: a distinct inhabitant of an unusual coastal village must make a difficult choice about a lost artifact.`,genre:ideas%2?'mystery':'fantasy'},usage:{inputTokens:0,outputTokens:0}}:base.generate(req)};
    const first=await runDailyOnce(policy,{root,date:'2026-11-12',provider:distinct});
    assert.equal(first.slots.length,2);
    assert(first.slots.every(s=>s.status==='ready_for_owner_review'));
    assert(first.slots.every(s=>s.jobId));
    const before=await readFile(join(root,'daily-factory','2026-11-12.json'),'utf8');
    const second=await runDailyOnce(policy,{root,date:'2026-11-12',provider:distinct});
    const after=await readFile(join(root,'daily-factory','2026-11-12.json'),'utf8');
    assert.equal(second.slots.length,2);assert.equal(before,after);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('crashed/claimed slot must be reconciled manually',async()=>{
  const root=await mkdtemp(join(tmpdir(),'folilune-daily-'));
  try{
    await mkdir(join(root,'daily-factory'));
    // A claimed job may already have incurred a paid call, so do not retry automatically.
    await writeFile(join(root,'daily-factory','2026-11-12.json'),JSON.stringify({version:1,date:'2026-11-12',policyDigest:null,slots:[{status:'claimed',key:'uncertain'}]}));
    await assert.rejects(runDailyOnce(policy,{root,date:'2026-11-12',provider:simulatedProvider()}),/reconciliation/i);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('incompatible provider cannot execute private policy',async()=>{
  await assert.rejects(runDailyOnce(policy,{provider:{kind:'managed',generate(){}}}),/compatible/i);
});

test('scheduled synthetic production only becomes due after editorial local time',()=>{
 const q={...policy,runAt:'07:00'};
 assert.equal(shouldRunNow(q,new Date('2026-11-12T01:20:00Z')),false);
 assert.equal(shouldRunNow(q,new Date('2026-11-12T01:40:00Z')),true);
 assert.equal(shouldRunNow({...q,enabled:false},new Date('2026-11-12T01:40:00Z')),false);
});
test('live paid daily generation is denied even with valid policy until metered billing is built',async()=>{
 await assert.rejects(runDailyOnce({...policy,mode:'managed',liveAuthorized:true,maxDailySpendUSD:10},{provider:{kind:'managed',generate(){}}}),/billing reconciliation/);
});