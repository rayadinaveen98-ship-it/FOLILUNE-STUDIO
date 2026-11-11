/** Private scheduled draft factory. At-most-once reservation per daily slot.
 * No public publishing, no automatic reruns of uncertain/crashed slots.
 * Running this module does NOT launch an always-on service.
 */
import {mkdir,readFile,writeFile,rename,open,rm} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {runAuthorizedBatch} from './auto-queue.mjs';

export const POLICY_AUTH='ALLOW_PRIVATE_DRAFT_CREATION_ONLY';
const SHA=x=>createHash('sha256').update(x).digest('hex');
const safeStr=(s,max)=>String(s||'').trim().slice(0,max);
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
export function validateDailyPolicy(input) {
  if(!input || typeof input!=='object'||Array.isArray(input))throw new Error('Expected a daily production policy');
  if(input.authorization!==POLICY_AUTH)throw new Error('Daily production requires an explicit private-drafts-only authorization');
  if(typeof input.enabled!=='boolean')throw new Error('Daily policy enabled must be true or false');
  const worksPerDay=Number(input.worksPerDay??1), sections=Number(input.sections??3),maxCallsPerWork=Number(input.maxCallsPerWork??12);
  if(!Number.isInteger(worksPerDay)||worksPerDay<1||worksPerDay>10)throw new Error('Only 1–10 private story candidates per day supported');
  if(!Number.isInteger(sections)||sections<3||sections>5)throw new Error('Sections must be 3–5');
  if(!Number.isInteger(maxCallsPerWork)||maxCallsPerWork<sections+4||maxCallsPerWork>25)throw new Error('Invalid per-work model call cap');
  const dailyCallCap=Number(input.maxDailyModelCalls??130);
  if(!Number.isInteger(dailyCallCap)||dailyCallCap<1||dailyCallCap>300)throw new Error('Daily model call cap must be 1–300');
  // A full candidate can consume maxCallsPerWork plus one ideation call.
  if(worksPerDay*(maxCallsPerWork+1)>dailyCallCap)throw new Error('Daily slots exceed the authorized model-call ceiling');
  const timezone=safeStr(input.timezone||'Asia/Kolkata',60);
  try{new Intl.DateTimeFormat('en-CA',{timeZone:timezone}).format(new Date())}catch{throw new Error('Invalid editorial calendar timezone')}
  const languages=input.languages,genres=input.genres;
  if(!Array.isArray(languages)||!languages.length||languages.length>12||!languages.every(s=>typeof s==='string'&&/^[a-z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/i.test(s)))throw new Error('Provide 1–12 valid language tags');
  if(!Array.isArray(genres)||!genres.length||genres.length>20||!genres.every(s=>typeof s==='string'&&s.trim().length>=3&&s.length<=70))throw new Error('Provide 1–20 valid genres');
  const theme=safeStr(input.theme,500);
  if(theme.length<12)throw new Error('Provide a meaningful editorial theme');
  const runAt=safeStr(input.runAt||'07:00',5);
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(runAt))throw new Error('runAt must be HH:MM in the editorial timezone');
  const mode=input.mode??'simulated';
  if(!['simulated','managed'].includes(mode))throw new Error('Daily factory supports synthetic testing or server-managed inference only');
  const liveAuthorized=input.liveAuthorized===true;
  if(mode==='managed' && !liveAuthorized && input.enabled)throw new Error('Explicit live generation authorization missing');
  const maxOutputTokens=Number(input.maxOutputTokens??2200);
  if(!Number.isInteger(maxOutputTokens)||maxOutputTokens<350||maxOutputTokens>6000)throw new Error('Invalid max output token limit');
  const maxDailySpendUSD=Number(input.maxDailySpendUSD??0);
  if(!Number.isFinite(maxDailySpendUSD)||maxDailySpendUSD<0||maxDailySpendUSD>10000)throw new Error('Invalid approved daily spending cap');
  if(mode==='managed'&&input.enabled&&maxDailySpendUSD<=0)throw new Error('Set a positive approved spending cap before live scheduling');
  return {version:1,enabled:input.enabled,authorization:POLICY_AUTH,worksPerDay,sections,maxCallsPerWork,maxDailyModelCalls:dailyCallCap,
    maxOutputTokens,timezone,runAt,theme,languages:[...languages],genres:genres.map(x=>x.trim()),mode,
    liveAuthorized,maxDailySpendUSD,audience:safeStr(input.audience||'general readers',90),style:safeStr(input.style||'original and cohesive',220),constraints:safeStr(input.constraints||'Original work with an ending.',600)};
}
export function localDate(timezone,now=new Date()) {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const part=(t)=>parts.find(p=>p.type===t)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function planDailySlots(raw,date) {
  const policy=validateDailyPolicy(raw);
  if(!datePattern.test(date) || new Date(`${date}T00:00:00Z`).toISOString().slice(0,10)!==date)throw new Error('Invalid date for production plan');
  const slots=[];
  for(let i=0;i<policy.worksPerDay;i++){
    const key=SHA(`${date}|${i}|${policy.theme}|${policy.languages.join(',')}|${policy.genres.join(',')}`).slice(0,24);
    slots.push({key,date,index:i+1,genre:policy.genres[(i+Number(date.slice(-2)))%policy.genres.length],language:policy.languages[(i+Number(date.slice(-2)))%policy.languages.length],status:'planned'});
  }
  return {date,enabled:policy.enabled,mode:policy.mode,worksPerDay:slots.length,slots};
}
async function atomic(file,value){const tmp=`${file}.${randomUUID()}.tmp`;try{await writeFile(tmp,JSON.stringify(value,null,2),{flag:'wx',mode:0o600});await rename(tmp,file)}catch(e){await rm(tmp,{force:true}).catch(()=>{});throw e}}
async function readOr(file,fallback){try{return JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code==='ENOENT')return fallback;throw e}}
/** Run due slots ONCE. If a process crashes, a 'claimed' slot is left uncertain;
 * don't automatically double-charge or duplicate it. Reconciliation is manual.
 */
export async function runDailyOnce(raw,{root='output',date,provider,onProgress=()=>{}}={}){
  const p=validateDailyPolicy(raw);
  if(!p.enabled)throw new Error('Daily production is disabled by the owner policy');
  if(p.mode==='managed')throw new Error('Live daily managed generation remains blocked until persistent spending reservations and provider billing reconciliation are implemented');
  if(!provider || provider.kind!==p.mode)throw new Error('No compatible, configured provider for this private daily policy');
  const day=date??localDate(p.timezone);
  const plan=planDailySlots(p,day),output=resolve(root),folder=join(output,'daily-factory');
  await mkdir(folder,{recursive:true});
  const lockPath=join(folder,`${day}.lock`),journalPath=join(folder,`${day}.json`);
  let lock;
  try{lock=await open(lockPath,'wx',0o600)}catch(e){if(e.code==='EEXIST')throw new Error('Daily factory locked. Confirm no job is running before recovery.');throw e;}
  try{
    const old=await readOr(journalPath,{version:1,date:day,policyDigest:null,slots:[]});
    const policyDigest=SHA(JSON.stringify(p));
    if(old.policyDigest && old.policyDigest!==policyDigest)throw new Error('Editorial policy changed for this date; previous production plan remains locked');
    if(old.slots?.some(x=>x.status!=='ready_for_owner_review'))throw new Error('Previous daily slot needs reconciliation. No further jobs will be started automatically.');
    const journal={version:1,date:day,policyDigest,slots:old.slots};
    const save=()=>atomic(journalPath,journal);
    for(const slot of plan.slots){
      if(journal.slots.some(s=>s.key===slot.key))continue;
      const entry={...slot,status:'claimed',claimedAt:new Date().toISOString(),jobId:null};
      journal.slots.push(entry);await save();
      onProgress({status:'claimed',index:slot.index,total:p.worksPerDay,key:slot.key});
      const profile={authorization:POLICY_AUTH,theme:`${p.theme} — ${slot.genre} — distinct premise slot ${slot.key}`,language:slot.language,genre:slot.genre,
        audience:p.audience,style:p.style,constraints:p.constraints,sections:p.sections,maxCallsPerWork:p.maxCallsPerWork,maxOutputTokens:p.maxOutputTokens,worksPerRun:1};
      try{
        const results=await runAuthorizedBatch(profile,provider,{outputRoot:output,
          onJobCreated:job=>{entry.jobId=job.id;},
          onJobComplete:job=>{entry.jobId=job.id;},onProgress:e=>onProgress({...e,index:slot.index})});
        entry.status=results[0]?.status??'failed';entry.completedAt=new Date().toISOString();entry.jobId=entry.jobId??results[0]?.id??null;
        if(results[0]?.error)entry.error=String(results[0].error).slice(0,300);
      }catch(e){entry.status='failed';entry.error=String(e.message).slice(0,300);entry.completedAt=new Date().toISOString();}
      await save();onProgress({status:entry.status,index:slot.index,total:p.worksPerDay,key:slot.key});
      // Stop on a failure: no silent spam to make up quota or repeated paid attempts.
      if(entry.status==='failed'||entry.status==='needs_attention'||entry.status==='duplicate-blocked')break;
    }
    return journal;
  }finally{await lock.close();await rm(lockPath,{force:true})}
}
export async function readDailyJournal(root,date){if(!datePattern.test(date))throw new Error('Invalid journal date');return readOr(join(resolve(root),'daily-factory',`${date}.json`),null)}

export function shouldRunNow(raw,now=new Date()) {
  const p=validateDailyPolicy(raw);
  if(!p.enabled)return false;
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:p.timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
  const get=(t)=>parts.find(x=>x.type===t)?.value;
  return `${get('hour')}:${get('minute')}` >= p.runAt;
}