#!/usr/bin/env node
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createJob,runJob,jobStatus} from './runner.mjs';
import {ollamaProvider,simulatedProvider} from './providers.mjs';

const port=Number(process.env.FOLILUNE_PORT || 44831);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Invalid FOLILUNE_PORT');
const root=resolve(process.env.FOLILUNE_OUTPUT || 'output');
const ui=fileURLToPath(new URL('./studio-console.html',import.meta.url));
const appJs=fileURLToPath(new URL('./app.js',import.meta.url));
const jobs=new Map();
const idCheck=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const respond=(res,code,data,mime='application/json; charset=utf-8')=>{res.writeHead(code,{'content-type':mime,'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"});res.end(mime.startsWith('application/json')?JSON.stringify(data):data)};
const fail=(res,code,message)=>respond(res,code,{error:message});
const jsonBody=async req=>{let data='';for await (const chunk of req){data+=chunk;if(data.length>12000)throw new Error('Request exceeds 12 KB');}return JSON.parse(data)};
const validateOrigin=req=>{const o=req.headers.origin;if(!o)return true;try{const u=new URL(o);return u.protocol==='http:'&&u.hostname==='127.0.0.1'&&u.port===String(port);}catch{return false}};
const server=createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,'http://127.0.0.1').pathname;
    if(!validateOrigin(req))return fail(res,403,'Cross-site requests are blocked');
    if(req.method==='GET'&&path==='/')return respond(res,200,await readFile(ui,'utf8'),'text/html; charset=utf-8');
    if(req.method==='GET'&&path==='/app.js')return respond(res,200,await readFile(appJs,'utf8'),'text/javascript; charset=utf-8');
    if(req.method==='POST'&&path==='/api/run'){
      if([...jobs.values()].some(x=>x.active))return fail(res,429,'Only one production job at a time in Stage 1A');
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
    const match=/^\/api\/jobs\/([a-z0-9-]+)(?:\/(draft|epub))?$/.exec(path);
    if(match&&idCheck.test(match[1])){
      const [_,id,which]=match,dir=join(root,id);
      if(req.method!=='GET')return fail(res,405,'GET only');
      if(!which){const status=await jobStatus(dir);return respond(res,200,{id:status.id,status:status.status,stage:status.stage,calls:status.calls,progress:jobs.get(id)?.progress??'',qa:status.qa,plan:status.plan,sections:status.sections.map(s=>({id:s.id,title:s.title,text:s.text})),revisions:status.revisions.map(r=>({sectionId:r.sectionId,reason:r.reason})),error:status.lastError,provider:status.providerKind});}
      const status=await jobStatus(dir);
      if(status.status!=='ready_for_owner_review')return fail(res,409,'Review artifacts are not ready');
      if(which==='draft')return respond(res,200,await readFile(join(dir,'review-draft.json'),'utf8'),'application/json; charset=utf-8');
      const epub=await readFile(join(dir,'review-only.epub'));
      res.writeHead(200,{'content-type':'application/epub+zip','content-disposition':`attachment; filename="FOLILUNE-review-${id}.epub"`,'cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(epub);
    }
    return fail(res,404,'Not found');
  }catch(e){return fail(res,e?.code==='ENOENT'?404:400,e.message??'Unexpected error');}
});
server.listen(port,'127.0.0.1',()=>console.log(`FOLILUNE Studio local production console: http://127.0.0.1:${port}\nNo public publishing is available.`));
