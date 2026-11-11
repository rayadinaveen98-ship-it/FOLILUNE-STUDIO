import {mkdir, open, readFile, rename, rm, writeFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {randomUUID, createHash} from 'node:crypto';
import {buildExperimentalEpub} from '../src/epub-export.mjs';
import {validateStudioDraft} from '../src/content-model.mjs';

const sha256 = x => createHash('sha256').update(x).digest('hex');
const atomic = async (path, bytes) => {const tmp=`${path}.${randomUUID()}.tmp`;try {await writeFile(tmp,bytes,{flag:'wx',mode:0o600});await rename(tmp,path);}catch(e){await rm(tmp,{force:true}).catch(()=>{});throw e;}};
const readJson = async path => JSON.parse(await readFile(path,'utf8'));
const maxStr = (value,max=10000)=>typeof value==='string'?value.trim().slice(0,max):'';
const words = s=>s.trim().split(/\s+/u).filter(Boolean).length;
const asArray = a=>Array.isArray(a)?a:[];
const clone = x=>structuredClone(x);

export function validateBrief(raw) {
  if (!raw || typeof raw!=='object' || Array.isArray(raw)) throw new Error('Creative brief must be a JSON object');
  const premise=maxStr(raw.premise,1200),language=maxStr(raw.language ?? 'en',35);
  if(premise.length<20)throw new Error('Premise must contain at least 20 characters');
  if(!/^[a-z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/i.test(language))throw new Error('Language should be a BCP 47 tag, such as en or te');
  const sections=Number(raw.sections ?? 3);
  if(!Number.isInteger(sections)||sections<3||sections>5)throw new Error('MVP supports 3–5 sections');
  const maxCalls=Number(raw.maxCalls ?? 12);
  if(!Number.isInteger(maxCalls)||maxCalls<sections+4||maxCalls>25)throw new Error('maxCalls must cover the planned stages and be no greater than 25');
  const outputTokens=Number(raw.maxOutputTokens ?? 2200);
  if(!Number.isInteger(outputTokens)||outputTokens<350||outputTokens>6000)throw new Error('maxOutputTokens must be 350–6000 per call');
  return {premise,language,sections,maxCalls,maxOutputTokens:outputTokens,
    genre:maxStr(raw.genre??'literary fiction',70),audience:maxStr(raw.audience??'general readers',90),
    style:maxStr(raw.style??'expressive, original, coherent',220),
    constraints:maxStr(raw.constraints??'Create original characters and settings.',600)};
}

export async function createJob(outputRoot, rawBrief) {
  const brief=validateBrief(rawBrief),id=randomUUID();
  await mkdir(outputRoot,{recursive:true});
  const jobDir=join(resolve(outputRoot),id);await mkdir(jobDir,{mode:0o700});
  const state={version:1,id,kind:'autonomous-short-story',status:'queued',stage:'plan',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    briefHash:sha256(JSON.stringify(brief)),calls:0,tokenUsage:{input:0,output:0},events:[],sections:[],revisions:[],plan:null,bible:null,critique:null,export:null,qa:null,providerKind:null,model:null};
  await atomic(join(jobDir,'brief.json'),JSON.stringify(brief,null,2));
  await atomic(join(jobDir,'state.json'),JSON.stringify(state,null,2));
  return jobDir;
}

const validatePlan = (plan,n)=> {
  if(typeof plan?.title!=='string'||plan.title.trim().length<3||plan.title.length>140)throw new Error('Model plan lacks a usable title');
  if(!Array.isArray(plan.outline)||plan.outline.length!==n)throw new Error(`Outline must contain exactly ${n} sections`);
  if(!plan.outline.every(s=>typeof s.title==='string'&&s.title.trim()&&s.title.length<=140&&typeof s.beat==='string'&&s.beat.trim()))throw new Error('Outline has missing titles/beats');
  if(!Array.isArray(plan.characters)||plan.characters.length<1)throw new Error('Outline must include a character');
  return {title:maxStr(plan.title,140),summary:maxStr(plan.summary,1500),setting:maxStr(plan.setting,350),tone:maxStr(plan.tone,160),outline:plan.outline.map(s=>({title:maxStr(s.title,140),beat:maxStr(s.beat,500)})),characters:plan.characters.slice(0,20).map(x=>({name:maxStr(x.name,80),trait:maxStr(x.trait,240)}))};
};
const promptContext = (b,p,s) => `Write ORIGINAL fiction, no copyrighted franchises. LANGUAGE: ${b.language}. GENRE: ${b.genre}. AUDIENCE: ${b.audience}. STYLE: ${b.style}. CONSTRAINTS: ${b.constraints}. PREMISE: ${b.premise}. SECTIONS: ${b.sections}. STORY PLAN: ${JSON.stringify(p)}. STORY BIBLE: ${s || 'not yet drafted'}.`;
const checkChapter = (s,minWords=100) => {let text=maxStr(s,150000);if(words(text)<minWords)throw new Error(`Generated section too short (${words(text)} words; need ${minWords})`);return text;};

async function withLock(jobDir,fn){const lock=join(jobDir,'.run.lock');let file;try{file=await open(lock,'wx',0o600)}catch(e){if(e?.code==='EEXIST')throw new Error('Job locked by another process; if it crashed, remove .run.lock manually after confirming it is stopped');throw e;}try{return await fn();}finally{await file.close();await rm(lock,{force:true})}}

export async function runJob(jobDir,provider,{maxStages=Infinity,onProgress=()=>{}}={}) {
  if(!provider || typeof provider.generate!=='function')throw new Error('A configured model provider is required');
  return withLock(jobDir,async()=>{
    const brief=validateBrief(await readJson(join(jobDir,'brief.json')));
    let state=await readJson(join(jobDir,'state.json'));
    if(state.briefHash!==sha256(JSON.stringify(brief)))throw new Error('Brief changed after job creation; refusing untracked mutation');
    if(state.status==='ready_for_owner_review')return state;
    if(state.status==='published'||state.status==='approved')throw new Error('Autonomous engine cannot approve or publish anything');
    if(state.providerKind && (state.providerKind!==provider.kind || state.model!==provider.model))throw new Error('Cannot resume with a different provider/model; start a new job instead');
    state.providerKind=provider.kind;state.model=provider.model;
    const save=async(event)=>{state.updatedAt=new Date().toISOString();if(event){state.events.push({...event,at:state.updatedAt});onProgress({stage:state.stage,status:state.status,message:event.message})};await atomic(join(jobDir,'state.json'),JSON.stringify(state,null,2));};
    const generate=async(role,prompt)=>{
      if(state.calls>=brief.maxCalls)throw new Error('Model call limit reached; preserving checkpoint');
      // A local Ollama num_predict cap and per-job request cap are compute controls, not a monetary guarantee.
      state.calls++;await save({stage:state.stage,message:`Calling ${role} (${state.calls}/${brief.maxCalls})`});
      const response=await provider.generate({role,prompt,maxOutputTokens:brief.maxOutputTokens});
      if(!response?.data||typeof response.data!=='object')throw new Error(`${role} returned invalid response`);
      state.tokenUsage.input+=Number(response.usage?.inputTokens||0);state.tokenUsage.output+=Number(response.usage?.outputTokens||0);
      return response.data;
    };
    let completed=0;
    try {
      state.status='running';await save({message:'Production started/resumed'});
      while(completed<maxStages) {
        if(state.stage==='plan'){
          const p=await generate('planner',`Return JSON keys title, summary, setting, tone, characters:[{name,trait}], outline:[{title,beat}]. SECTION_COUNT: ${brief.sections}. Brief: ${JSON.stringify(brief)}. Each section must advance the plot toward a complete resolution.`);
          state.plan=validatePlan(p,brief.sections);state.stage='bible';await save({message:'Outline completed'});
        } else if(state.stage==='bible'){
          const r=await generate('story-bible',`Return JSON {"bible":"..."}. Build a concise continuity guide covering plot chronology, each character, stakes, location, consistent names and ending. ${promptContext(brief,state.plan,'')}`);
          state.bible=maxStr(r.bible,10000);if(state.bible.length<45)throw new Error('Story Bible is too short');
          state.stage='chapters';await save({message:'Story Bible completed'});
        } else if(state.stage==='chapters'){
          const i=state.sections.length;if(i>=brief.sections){state.stage='critique';continue;}
          const previous=state.sections.slice(-1)[0]?.text?.slice(-1600)??'';
          const r=await generate('writer',`Return JSON {"text":"..."}. Write the FULL original prose section in ${brief.language}, at least 150 words; not outline, synopsis, teaser or placeholders. SECTION_NUMBER: ${i+1} of ${brief.sections}. CURRENT BEAT: ${state.plan.outline[i].beat}. CURRENT TITLE: ${state.plan.outline[i].title}. Previous ending: ${previous}. ${promptContext(brief,state.plan,state.bible)}. Narrative must be continuous, with dialogue/action and no outline labels in body.`);
          const chapter={id:`section-${String(i+1).padStart(3,'0')}`,title:state.plan.outline[i].title,text:checkChapter(r.text),locked:false};
          state.sections.push(chapter);state.stage=i+1===brief.sections?'critique':'chapters';await save({message:`Section ${i+1} drafted`});
        } else if(state.stage==='critique'){
          const r=await generate('critic',`Return JSON {"issues":[{"sectionIndex":0,"problem":"...","instruction":"..."}],"strengths":["..."]}. Critique continuity, pacing and clarity. Identify at least one concrete chapter improvement, sectionIndex is ZERO-based. Focus on actionable revision. ${promptContext(brief,state.plan,state.bible)}. CHAPTER SUMMARIES: ${JSON.stringify(state.sections.map((s,i)=>({i,title:s.title,excerpt:s.text.slice(0,900),ending:s.text.slice(-900)})))}.`);
          const issues=asArray(r.issues).filter(i=>Number.isInteger(i?.sectionIndex)&&i.sectionIndex>=0&&i.sectionIndex<state.sections.length).map(i=>({sectionIndex:i.sectionIndex,problem:maxStr(i.problem,400),instruction:maxStr(i.instruction,500)}));
          state.critique={issues,strengths:asArray(r.strengths).map(x=>maxStr(x,300))};state.stage='revision';await save({message:'Editorial critique completed'});
        } else if(state.stage==='revision'){
          const item=state.critique.issues.find(x=>!state.sections[x.sectionIndex].locked)??{sectionIndex:0,problem:'Improve opening scene',instruction:'Improve emotional specificity while preserving facts.'};
          const original=state.sections[item.sectionIndex];
          const r=await generate('reviser',`Return JSON {"text":"..."}. REWRITE THE WHOLE SECTION, not comments or a synopsis. SECTION_NUMBER: ${item.sectionIndex+1}. Preserve continuity, names and essential events. Revision objective: ${item.instruction}. Original section: ${original.text}. ${promptContext(brief,state.plan,state.bible)}`);
          const next=checkChapter(r.text);if(next===original.text)throw new Error('Revision made no changes');
          state.revisions.push({sectionId:original.id,reason:item.problem,instruction:item.instruction,before:original.text,after:next});
          state.sections[item.sectionIndex]={...original,text:next};state.stage='package';await save({message:'Targeted editorial revision completed'});
        } else if(state.stage==='package'){
          const draft={kind:'folilune-studio-draft',schemaVersion:'0.1.0',warning:'Private AI-generated review draft, not a Reader release package.',project:{id:state.id,format:'prose',title:state.plan.title,subtitle:'',language:brief.language,summary:state.plan.summary,storyBible:state.bible,sections:state.sections.map(s=>({id:s.id,role:'chapter',title:s.title,body:{format:'plain-text',text:s.text},artwork:null}))}};
          const check=validateStudioDraft(draft);
          const qa={schemaValid:check.ok,errors:check.errors,sections:state.sections.length,minimumWords:100,wordCounts:state.sections.map(s=>words(s.text)),revisionCount:state.revisions.length,realReaderVerified:false,epubCheckVerified:false,rightsCleared:false,provider:state.providerKind,model:state.model};
          qa.passed=qa.schemaValid&&qa.sections===brief.sections&&qa.wordCounts.every(w=>w>=100)&&qa.revisionCount>=1;
          await atomic(join(jobDir,'review-draft.json'),JSON.stringify(draft,null,2));
          await atomic(join(jobDir,'qa.json'),JSON.stringify(qa,null,2));
          state.qa=qa;
          if(qa.passed){const bytes=buildExperimentalEpub(draft);await atomic(join(jobDir,'review-only.epub'),Buffer.from(bytes));state.export={file:'review-only.epub',sha256:sha256(bytes),bytes:bytes.length};state.status='ready_for_owner_review';}
          else{state.status='needs_attention';state.export=null;}
          state.stage='done';await save({message:qa.passed?'Review draft and EPUB ready. Publishing blocked.':'QA incomplete; no EPUB release candidate.'});break;
        } else break;
        completed++;
      }
      if(state.status==='running'&&completed>=maxStages){state.status='paused';await save({message:'Paused at configured stage boundary'});}
      return state;
    }catch(e){state.status='failed';state.lastError={stage:state.stage,message:e?.message??String(e)};await save({message:`Stopped safely: ${state.lastError.message}`});throw e;}
  });
}

export async function jobStatus(jobDir){return readJson(join(jobDir,'state.json'))}
export async function jobFiles(jobDir){return {state:join(jobDir,'state.json'),draft:join(jobDir,'review-draft.json'),epub:join(jobDir,'review-only.epub')};}
