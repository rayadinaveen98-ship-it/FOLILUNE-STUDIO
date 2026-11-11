#!/usr/bin/env node
/** A pre-authorized local content batch: ideate + produce original drafts only. Never publishes. */
import {mkdir,readFile,writeFile,rename,open,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID,createHash} from 'node:crypto';
import {createJob,runJob,validateBrief} from './runner.mjs';
import {ollamaProvider,simulatedProvider} from './providers.mjs';

const sha=s=>createHash('sha256').update(s).digest('hex');
const atomic=async(file,data)=>{const tmp=`${file}.${randomUUID()}.tmp`;try{await writeFile(tmp,data,{mode:0o600,flag:'wx'});await rename(tmp,file)}catch(e){await rm(tmp,{force:true}).catch(()=>{});throw e}};
export function validateProfile(input){
  if(input?.authorization!=='ALLOW_PRIVATE_DRAFT_CREATION_ONLY')throw new Error('Autonomous batch requires explicit private-draft authorization');
  const theme=String(input.theme??'').trim().slice(0,500);
  if(theme.length<12)throw new Error('Provide a theme of at least 12 characters');
  const works=Number(input.worksPerRun ?? 1);
  if(!Number.isInteger(works)||works<1||works>2)throw new Error('At most 2 works per batch in Stage 1A');
  const base=validateBrief({premise:'A sample premise long enough to pass initial brief checks.',language:input.language??'en',genre:input.genre??'literary fantasy',audience:input.audience??'general readers',style:input.style??'original and cohesive',constraints:input.constraints??'Original fiction only',sections:input.sections??3,maxCalls:input.maxCallsPerWork??10,maxOutputTokens:input.maxOutputTokens??2200});
  return {...base,theme,works};
}
export async function runAuthorizedBatch(profileInput,provider,{outputRoot='output',onProgress=()=>{},onJobCreated=()=>{},onJobComplete=()=>{}}={}){
  const p=validateProfile(profileInput),root=resolve(outputRoot),ledgerFile=join(root,'private-production-ledger.json'),lockFile=join(root,'.batch.lock');
  await mkdir(root,{recursive:true});
  let lock;try{lock=await open(lockFile,'wx',0o600)}catch(e){if(e.code==='EEXIST')throw new Error('A production batch is already active; no concurrent run permitted');throw e;}
  try{
    let ledger;try{ledger=JSON.parse(await readFile(ledgerFile,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e;ledger={version:1,history:[]};}
    const results=[];
    for(let i=0;i<p.works;i++){
      const prompt=`Propose ONE specific original, emotionally compelling fiction premise for a complete short story, not an outline or an existing plot. Return JSON {"premise":"...","genre":"..."}. LANGUAGE ${p.language}, THEME ${p.theme}, GENRE ${p.genre}. Avoid all copyrighted universes and celebrity characters. Distinct protagonist and meaningful dilemma.`;
      const idea=await provider.generate({role:'ideation',prompt,maxOutputTokens:650});
      const premise=String(idea?.data?.premise??'').trim().slice(0,1200);
      if(premise.length<30)throw new Error('Idea generator returned an unusable premise');
      const digest=sha(premise.toLocaleLowerCase());
      if(ledger.history.some(x=>x.digest===digest)){
        onProgress({message:'Duplicate idea blocked, not creating another project'});results.push({status:'duplicate-blocked'});continue;
      }
      const brief={premise,language:p.language,genre:String(idea.data.genre??p.genre).slice(0,70),audience:p.audience,style:p.style,constraints:p.constraints,sections:p.sections,maxCalls:p.maxCalls,maxOutputTokens:p.maxOutputTokens};
      const dir=await createJob(root,brief);
      const entry={id:dir.split(/[\\/]/).at(-1),digest,theme:p.theme,provider:provider.kind,model:provider.model,createdAt:new Date().toISOString(),status:'queued'};
      ledger.history.push(entry);await atomic(ledgerFile,JSON.stringify(ledger,null,2));
      onJobCreated({id:entry.id,index:i+1,total:p.works});
      try{const job=await runJob(dir,provider,{onProgress:e=>onProgress({...e,jobId:entry.id})});entry.status=job.status;results.push({id:entry.id,jobDir:dir,status:job.status});}
      catch(e){entry.status='failed';entry.error=e.message;results.push({id:entry.id,jobDir:dir,status:'failed',error:e.message});}
      await atomic(ledgerFile,JSON.stringify(ledger,null,2));
      onJobComplete({id:entry.id,status:entry.status,error:entry.error??null,index:i+1,total:p.works});
    }
    return results;
  }finally{await lock.close();await rm(lockFile,{force:true})}
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const args=process.argv.slice(2),profilePath=args[0],providerArg=args[1]??'simulated',model=args[2]??process.env.OLLAMA_MODEL;
  if(!profilePath){console.error('Usage: node engine/auto-queue.mjs fixtures/autonomy-profile.json simulated|ollama [local-model-name]');process.exitCode=1;}
  else {
    const provider=providerArg==='ollama'?ollamaProvider({model}):providerArg==='simulated'?simulatedProvider():null;
    if(!provider){console.error('Choose simulated or ollama');process.exitCode=1;}
    else {try{const profile=JSON.parse(await readFile(resolve(profilePath),'utf8'));if(provider.kind==='simulated')console.log('SYNTHETIC DEMO — NOT REAL AI WRITING');const results=await runAuthorizedBatch(profile,provider,{onProgress:x=>console.log(x.message)});console.log(JSON.stringify(results,null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
  }
}
