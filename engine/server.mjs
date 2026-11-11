#!/usr/bin/env node
/** Localhost-only Stage 1A production console. Not internet-facing, no authentication, no publishing. */
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createJob,runJob,jobStatus} from './runner.mjs';
import {validateProfile,runAuthorizedBatch} from './auto-queue.mjs';
import {ollamaProvider,simulatedProvider} from './providers.mjs';
import {requestOwnerRevision,setSectionLock} from './review.mjs';

const port=Number(process.env.FOLILUNE_PORT || 44831);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid FOLILUNE_PORT');
const root=resolve(process.env.FOLILUNE_OUTPUT || 'output');
const ui=fileURLToPath(new URL('./studio-console.html',import.meta.url));
const appJs=fileURLToPath(new URL('./app.js',import.meta.url));
const jobs=new Map();
let queueState={active:false,progress:'No authorized private production batch in progress',currentJobId:null,lastResults:[],lastError:null,startedAt:null};
const anyBusy=()=>queueState.active||[...jobs.values()].some(x=>x.active);
const queueHistory=async()=>{
  try{const file=JSON.parse(await readFile(join(root,'private-production-ledger.json'),'utf8'));
    if(!Array.isArray(file.history))return [];
    return Promise.all(file.history.slice(-30).reverse().filter(x=>idCheck.test(x.id)).map(async x=>{
      let title=null,reviewVersion=null;
      try{const s=await jobStatus(join(root,x.id));title=s.plan?.title??null;reviewVersion=s.reviewVersion??1;}
      catch{ /* interrupted batch may have no completed project yet */ }
      return {id:x.id,status:x.status,theme:x.theme,provider:x.provider,model:x.model,createdAt:x.createdAt,error:x.error??null,title,reviewVersion};
    }));
  }catch(e){if(e.code==='ENOENT')return [];throw e;}
};
const idCheck=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const respond=(res,code,data,mime='application/json; charset=utf-8')=>{res.writeHead(code,{'content-type':mime,'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"});res.end(mime.startsWith('application/json')?JSON.stringify(data):data)};
const fail=(res,code,message)=>respond(res,code,{error:message});
const jsonBody=async req=>{let data='';for await (const chunk of req){data+=chunk;if(data.length>12000)throw new Error('Request exceeds 12 KB');}return JSON.parse(data)};
const validateHost=req=>req.headers.host===`127.0.0.1:${port}`;
const validateOrigin=req=>{const o=req.headers.origin;if(!o)return true;try{const u=new URL(o);return u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port===String(port);}catch{return false}};
const server=createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,'http://127.0.0.1').pathname;
    if(!validateHost(req)||!validateOrigin(req))return fail(res,403,'Non-loopback host or origin blocked');
    if(req.method==='GET'&&path==='/')return respond(res,200,await readFile(ui,'utf8'),'text/html; charset=utf-8');
    if(req.method==='GET'&&path==='/app.js')return respond(res,200,await readFile(appJs,'utf8'),'text/javascript; charset=utf-8');
    if(req.method==='GET'&&path==='/api/queue'){
      return respond(res,200,{...queueState,history:await queueHistory(),publishingEnabled:false});
    }
    if(req.method==='POST'&&path==='/api/queue/start'){
      if(anyBusy())return fail(res,429,'Another production or review job is running');
      const payload=await jsonBody(req);
      const profile=validateProfile(payload.profile);
      const provider=payload.provider==='simulated'?simulatedProvider():payload.provider==='ollama'?ollamaProvider({model:payload.model}):null;
      if(!provider)return fail(res,400,'Select synthetic test or an installed local Ollama model');
      queueState={active:true,progress:'Authorized batch queued; only private draft creation permitted',currentJobId:null,lastResults:[],lastError:null,startedAt:new Date().toISOString()};
      setImmediate(async()=>{
        try{
          const results=await runAuthorizedBatch(payload.profile,provider,{outputRoot:root,
            onJobCreated:x=>{queueState.currentJobId=x.id;queueState.progress=`Producing private work ${x.index}/${x.total}`;jobs.set(x.id,{active:true,progress:queueState.progress});},
            onJobComplete:x=>{jobs.set(x.id,{active:false,progress:x.status});queueState.progress=`Completed ${x.index}/${x.total}: ${x.status}`;},
            onProgress:x=>{queueState.progress=x.message||'Generating private draft';if(x.jobId)jobs.set(x.jobId,{active:true,progress:queueState.progress});}
          });
          queueState.lastResults=results.map(x=>({id:x.id??null,status:x.status,error:x.error??null}));
          const ready=queueState.lastResults.filter(x=>x.status==='ready_for_owner_review').length;
          const skipped=queueState.lastResults.filter(x=>x.status==='duplicate-blocked').length;
          const failed=queueState.lastResults.filter(x=>x.status==='failed').length;
          queueState.progress=`Private batch finished: ${ready} ready for review, ${skipped} duplicate ideas skipped, ${failed} failed. Nothing published.`;
        }catch(e){queueState.lastError=e.message;queueState.progress=`Private batch stopped: ${e.message}`;}
        finally{queueState.active=false;queueState.currentJobId=null;for(const [id,item] of jobs)if(item.active)jobs.set(id,{...item,active:false});}
      });
      return respond(res,202,{status:'queued',count:profile.works,publishingEnabled:false});
    }
    if(req.method==='POST'&&path==='/api/run'){
      if(anyBusy())return fail(res,429,'Only one production job at a time in Stage 1A');
      const payload=await jsonBody(req);
      const provider=payload.provider==='simulated'?simulatedProvider():payload.provider==='ollama'?ollamaProvider({model:payload.model}):null;
      if(!provider)return fail(res,400,'Choose simulated or an installed local Ollama model');
      const dir=await createJob(root,payload.brief);
      const id=dir.split(/[\\/]/).at(-1);
      jobs.set(id,{active:true,progress:'Queued'});
      setImmediate(async()=>{
        try{await runJob(dir,provider,{onProgress:e=>{jobs.set(id,{active:true,progress:e.message})}});}
        catch(e){jobs.set(id,{active:false,progress:`Stopped: ${e.message}`});return;}
        jobs.set(id,{active:false,progress:'Ready for owner review'});
      });
      return respond(res,202,{id,status:'queued'});
    }
    const match=/^\/api\/jobs\/([a-z0-9-]+)(?:\/(draft|epub|lock|revise))?$/.exec(path);
    if(match&&idCheck.test(match[1])){
      const [_,id,which]=match,dir=join(root,id);
      if(which==='lock'&&req.method==='POST'){
        const data=await jsonBody(req);
        const result=await setSectionLock(dir,data.sectionId,data.locked);
        return respond(res,200,result);
      }
      if(which==='revise'&&req.method==='POST'){
        if(anyBusy())return fail(res,429,'Another generation or revision is active');
        const data=await jsonBody(req);const state=await jobStatus(dir);
        if(state.status!=='ready_for_owner_review')return fail(res,409,'Review draft not ready');
        const provider=state.providerKind==='simulated'?simulatedProvider():state.providerKind==='ollama'?ollamaProvider({model:state.model}):null;
        if(!provider)return fail(res,409,'No supported provider recorded for this job');
        if(data.expectedReviewVersion!==(state.reviewVersion??1))return fail(res,409,'Stale review version; reload before editing');
        if(!state.sections.some(s=>s.id===data.sectionId&&!s.locked))return fail(res,409,'Section not found or locked');
        if(typeof data.instruction!=='string'||data.instruction.trim().length<12||data.instruction.length>1200)return fail(res,400,'Provide an instruction of 12–1200 characters');
        jobs.set(id,{active:true,progress:'Revising selected chapter'});
        setImmediate(async()=>{
          try{await requestOwnerRevision(dir,provider,data);jobs.set(id,{active:false,progress:'New private review version ready'});}
          catch(e){jobs.set(id,{active:false,progress:`Revision failed safely: ${e.message}`});}
        });
        return respond(res,202,{id,status:'revision_queued'});
      }
      if(req.method!=='GET')return fail(res,405,'Unsupported action');
      if(!which){const status=await jobStatus(dir);return respond(res,200,{id:status.id,status:status.status,stage:status.stage,calls:status.calls,progress:jobs.get(id)?.progress??'',reviewBusy:jobs.get(id)?.active??false,reviewVersion:status.reviewVersion??1,qa:status.qa,plan:status.plan,sections:status.sections.map(s=>({id:s.id,title:s.title,text:s.text,locked:!!s.locked})),revisions:status.revisions.map(r=>({sectionId:r.sectionId,reason:r.reason,instruction:r.instruction,reviewVersion:r.reviewVersion})),error:status.lastError,provider:status.providerKind});}
      const status=await jobStatus(dir);
      if(status.status!=='ready_for_owner_review')return fail(res,409,'Review artifacts are not ready');
      if(which==='draft')return respond(res,200,JSON.parse(await readFile(join(dir,status.reviewArtifacts?.draft??'review-draft.json'),'utf8')),'application/json; charset=utf-8');
      const epub=await readFile(join(dir,status.reviewArtifacts?.epub??'review-only.epub'));
      res.writeHead(200,{'content-type':'application/epub+zip','content-disposition':`attachment; filename="FOLILUNE-review-${id}.epub"`,'cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(epub);
    }
    return fail(res,404,'Not found');
  }catch(e){return fail(res,e?.code==='ENOENT'?404:400,e.message??'Unexpected error');}
});
server.listen(port,'127.0.0.1',()=>console.log(`FOLILUNE Studio local production console: http://127.0.0.1:${port}\nNo public publishing is available.`));
