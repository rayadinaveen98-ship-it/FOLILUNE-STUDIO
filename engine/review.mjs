/** Owner-only local review controls for autonomous manuscripts.
 * Locks and revised artifacts are isolated from published catalog operations (none exist here).
 */
import {mkdir, open, readFile, rename, rm, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {randomUUID, createHash} from 'node:crypto';
import {buildExperimentalEpub} from '../src/epub-export.mjs';
import {validateStudioDraft} from '../src/content-model.mjs';
import {inspectDraft,hasBlockingQualityWarnings} from './quality.mjs';

const digest = data => createHash('sha256').update(data).digest('hex');
const readJson=async file=>JSON.parse(await readFile(file,'utf8'));
const words=s=>String(s ?? '').trim().split(/\s+/u).filter(Boolean).length;
const writeAtomic=async(file,bytes)=>{const tmp=`${file}.${randomUUID()}.tmp`;try{await writeFile(tmp,bytes,{flag:'wx',mode:0o600});await rename(tmp,file);}catch(e){await rm(tmp,{force:true}).catch(()=>{});throw e;}};
async function locked(jobDir, fn){
  const file=join(jobDir,'.run.lock');let h;
  try{h=await open(file,'wx',0o600)}catch(e){if(e?.code==='EEXIST')throw Error('Job is already running or being edited');throw e;}
  try{return await fn();}finally{await h.close();await rm(file,{force:true});}
}
function onlyReview(state){if(state.status!=='ready_for_owner_review')throw Error('Only a completed review draft can be edited');}
function getSection(state,id){const section=state.sections?.find(s=>s.id===id);if(!section)throw Error('Unknown section ID');return section;}
const jobFile=(jobDir,name)=>join(resolve(jobDir),name);

export async function setSectionLock(jobDir,sectionId,isLocked){
  return locked(jobDir,async()=>{
    const state=await readJson(jobFile(jobDir,'state.json'));
    onlyReview(state);
    if(typeof isLocked!=='boolean')throw Error('isLocked must be boolean');
    const section=getSection(state,sectionId);
    section.locked=isLocked;
    state.events.push({at:new Date().toISOString(),stage:'owner-review',message:`Section ${sectionId} ${isLocked?'locked':'unlocked'} by owner`});
    state.updatedAt=new Date().toISOString();
    await writeAtomic(jobFile(jobDir,'state.json'),JSON.stringify(state,null,2));
    return {sectionId,locked:isLocked,reviewVersion:state.reviewVersion??1};
  });
}

export async function requestOwnerRevision(jobDir,provider,{sectionId,instruction,expectedReviewVersion}={}){
  if(typeof instruction!=='string'||instruction.trim().length<12||instruction.length>1200)throw Error('Revision instruction must be 12–1200 characters');
  if(!Number.isInteger(expectedReviewVersion)||expectedReviewVersion<1)throw Error('Expected review version is required to prevent stale edits');
  if(!provider||typeof provider.generate!=='function')throw Error('A model provider is required');
  return locked(jobDir,async()=>{
    const state=await readJson(jobFile(jobDir,'state.json'));
    const brief=await readJson(jobFile(jobDir,'brief.json'));
    onlyReview(state);
    const currentVersion=state.reviewVersion??1;
    if(expectedReviewVersion!==currentVersion)throw Error(`Review version changed: expected ${expectedReviewVersion}, current ${currentVersion}`);
    if(state.providerKind!==provider.kind||state.model!==provider.model)throw Error('Revision must use the original provider/model');
    const section=getSection(state,sectionId);
    if(section.locked)throw Error('Section is locked; unlock it before requesting changes');
    if(state.calls >= brief.maxCalls)throw Error('Model call budget exhausted; create a new job with a larger approved budget');
    const existing=state.sections.map(s=>({id:s.id,title:s.title,text:s.text}));
    const prompt=`Return JSON {"text":"..."} containing the FULL revised prose section, not notes or suggestions. LANGUAGE: ${brief.language}. GENRE: ${brief.genre}. AUTHOR STYLE: ${brief.style}. ORIGINAL PREMISE: ${brief.premise}. STORY BIBLE: ${state.bible}. OUTLINE: ${JSON.stringify(state.plan.outline)}. Owner instruction: ${instruction.trim()}. SECTION TO REVISE: ${section.title}. ORIGINAL COMPLETE SECTION: ${section.text}. Other sections for continuity, do not edit them: ${JSON.stringify(existing.filter(s=>s.id!==sectionId).map(s=>({title:s.title,opening:s.text.slice(0,900),ending:s.text.slice(-900)})))}. Preserve named characters and established events unless owner specifically requests otherwise.`;
    state.calls++;
    state.events.push({at:new Date().toISOString(),stage:'owner-review',message:`Owner requested revision of ${sectionId} (call ${state.calls}/${brief.maxCalls})`});
    await writeAtomic(jobFile(jobDir,'state.json'),JSON.stringify(state,null,2));
    let generated;
    try{
      const response=await provider.generate({role:'reviser',prompt,maxOutputTokens:brief.maxOutputTokens});
      generated=response?.data?.text;
      if(typeof generated!=='string'||words(generated)<100||generated.length>150000)throw Error('Revised section failed length/structure checks');
      if(generated.trim()===section.text.trim())throw Error('Revision returned unchanged text');
      state.tokenUsage.input+=Math.max(0,Number(response?.usage?.inputTokens)||0);
      state.tokenUsage.output+=Math.max(0,Number(response?.usage?.outputTokens)||0);
    }catch(e){
      state.events.push({at:new Date().toISOString(),stage:'owner-review',message:`Revision rejected; previous review remains valid: ${e.message}`});
      state.updatedAt=new Date().toISOString();await writeAtomic(jobFile(jobDir,'state.json'),JSON.stringify(state,null,2));
      throw e;
    }
    const before=section.text;
    const nextSections=state.sections.map(s=>s.id===sectionId?{...s,text:generated.trim()}:s);
    const draft={kind:'folilune-studio-draft',schemaVersion:'0.1.0',warning:'Private generated review draft. NOT a Reader publication.',project:{id:state.id,format:'prose',title:state.plan.title,subtitle:'',language:brief.language,summary:state.plan.summary,storyBible:state.bible,sections:nextSections.map(s=>({id:s.id,role:'chapter',title:s.title,body:{format:'plain-text',text:s.text},artwork:null}))}};
    const validated=validateStudioDraft(draft);
    if(!validated.ok)throw Error(`Updated draft failed structural validation: ${validated.errors.join('; ')}`);
    const quality=inspectDraft(nextSections);
    if(hasBlockingQualityWarnings(quality))throw Error('Revision has blocking repetition or instruction-leak warnings; original review preserved');
    const qa={...state.qa,...quality,schemaValid:true,errors:[],sections:nextSections.length,wordCounts:nextSections.map(s=>words(s.text)),revisionCount:state.revisions.length+1,realReaderVerified:false,epubCheckVerified:false,rightsCleared:false,passed:true};
    const epub=Buffer.from(buildExperimentalEpub(draft));
    // Immutable artifact names. A crash before the state pointer updates leaves the old review intact.
    const version=currentVersion+1;
    const files={draft:`review-draft-v${version}.json`,epub:`review-only-v${version}.epub`,qa:`qa-v${version}.json`};
    await writeAtomic(jobFile(jobDir,files.draft),JSON.stringify(draft,null,2));
    await writeAtomic(jobFile(jobDir,files.epub),epub);
    await writeAtomic(jobFile(jobDir,files.qa),JSON.stringify(qa,null,2));
    const updated={...state,sections:nextSections,qa,reviewVersion:version,reviewArtifacts:files,export:{file:files.epub,sha256:digest(epub),bytes:epub.length},updatedAt:new Date().toISOString()};
    updated.revisions=[...state.revisions,{sectionId,reason:'Owner requested changes',instruction:instruction.trim(),before,after:generated.trim(),reviewVersion:version,at:updated.updatedAt}];
    updated.events=[...state.events,{at:updated.updatedAt,stage:'owner-review',message:`Private review v${version} built; no publication occurred`}];
    await writeAtomic(jobFile(jobDir,'state.json'),JSON.stringify(updated,null,2));
    return {sectionId,reviewVersion:version,qa,export:updated.export};
  });
}
