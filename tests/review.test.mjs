import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createJob,runJob,jobStatus} from '../engine/runner.mjs';
import {simulatedProvider} from '../engine/providers.mjs';
import {setSectionLock,requestOwnerRevision} from '../engine/review.mjs';
import {inspectDraft,repetitionSignal} from '../engine/quality.mjs';
const brief={premise:'A coastal village loses its history when the old lighthouse shuts down during a festival.',language:'en',sections:3,maxCalls:12,maxOutputTokens:1000};
const temp=()=>mkdtemp(join(tmpdir(),'folilune-review-'));
const setup=async()=>{const root=await temp(),dir=await createJob(root,brief);await runJob(dir,simulatedProvider());return {root,dir};};

test('deterministic quality signals spot extreme repetition without certifying artistic quality',()=>{
  assert.ok(repetitionSignal('river stone '.repeat(180)).score>.8);
  const report=inspectDraft([{id:'c1',text:'A quiet river stone '.repeat(140)}]);
  assert.equal(report.literaryQualityVerified,false);
  assert.ok(report.warnings.some(w=>w.code==='HEAVY_REPETITION'));
});

test('owner lock prevents changing one chapter and preserves review files',async()=>{
  const {root,dir}=await setup();try{
    const before=await readFile(join(dir,'review-only.epub'));
    const r=await setSectionLock(dir,'section-002',true);
    assert.equal(r.locked,true);
    await assert.rejects(requestOwnerRevision(dir,simulatedProvider(),{sectionId:'section-002',instruction:'Please strengthen the emotional stakes with details.',expectedReviewVersion:1}),/locked/);
    assert.deepEqual(await readFile(join(dir,'review-only.epub')),before);
    const current=await jobStatus(dir);assert.equal(current.sections[1].locked,true);
    assert.equal(current.calls,7,'rejected action must not call model');
  }finally{await rm(root,{recursive:true,force:true});}
});

test('targeted rewrite increments version, changes only selected section, and keeps original artifacts',async()=>{
  const {root,dir}=await setup();try{
    const old=await jobStatus(dir);
    await setSectionLock(dir,'section-001',true);
    const output=await requestOwnerRevision(dir,simulatedProvider(),{sectionId:'section-002',instruction:'Make the characters choose a difficult truth in this scene.',expectedReviewVersion:1});
    assert.equal(output.reviewVersion,2);
    const next=await jobStatus(dir);assert.equal(next.status,'ready_for_owner_review');
    assert.equal(next.sections[0].text,old.sections[0].text);
    assert.notEqual(next.sections[1].text,old.sections[1].text);
    assert.equal(next.sections[2].text,old.sections[2].text);
    assert.equal(next.sections[0].locked,true);
    assert.equal(next.revisions.length,old.revisions.length+1);
    assert.equal(next.calls,old.calls+1);
    assert.equal(next.qa.realReaderVerified,false);
    assert.equal(next.qa.literaryQualityVerified,false);
    assert.equal(next.reviewArtifacts.epub,'review-only-v2.epub');
    assert.ok((await readFile(join(dir,'review-only-v2.epub'))).length>2000);
    await access(join(dir,'review-only.epub'));
    const draft=JSON.parse(await readFile(join(dir,'review-draft-v2.json'),'utf8'));
    assert.equal(draft.project.sections[1].body.text,next.sections[1].text);
    assert.equal(next.export.sha256,output.export.sha256);
    await assert.rejects(requestOwnerRevision(dir,simulatedProvider(),{sectionId:'section-002',instruction:'Try another revision to improve the scene.',expectedReviewVersion:1}),/Review version changed/);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('provider failure consumes one attempt but leaves the last completed review intact',async()=>{
  const {root,dir}=await setup();try{
    const old=await jobStatus(dir),bytes=await readFile(join(dir,'review-only.epub'));
    await assert.rejects(requestOwnerRevision(dir,simulatedProvider({failAt:1}),{sectionId:'section-001',instruction:'Rewrite the opening to create a more memorable beginning.',expectedReviewVersion:1}),/Simulated provider failure/);
    const next=await jobStatus(dir);
    assert.equal(next.status,'ready_for_owner_review');assert.equal(next.calls,old.calls+1);
    assert.equal(next.reviewVersion,1);assert.equal(next.sections[0].text,old.sections[0].text);
    assert.deepEqual(await readFile(join(dir,'review-only.epub')),bytes);
  }finally{await rm(root,{recursive:true,force:true});}
});

test('exhausted budget blocks owner revision without modifying chapter',async()=>{
  const root=await temp();try{
    const dir=await createJob(root,{...brief,maxCalls:7});await runJob(dir,simulatedProvider());
    await assert.rejects(requestOwnerRevision(dir,simulatedProvider(),{sectionId:'section-001',instruction:'Please rewrite the scene and preserve its established facts.',expectedReviewVersion:1}),/budget exhausted/);
    assert.equal((await jobStatus(dir)).calls,7);
  }finally{await rm(root,{recursive:true,force:true});}
});
