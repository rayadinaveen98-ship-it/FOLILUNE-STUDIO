#!/usr/bin/env node
/** Safe preview and one-shot private production commands; no publishing. */
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {validateDailyPolicy,localDate,planDailySlots,runDailyOnce,readDailyJournal,shouldRunNow} from './daily-factory.mjs';
import {simulatedProvider} from './providers.mjs';
import {managedProvider} from './managed-provider.mjs';
const [, ,cmd='help', policyPath='fixtures/daily-policy.example.json',dateArg] = process.argv;
const show=(x)=>console.log(JSON.stringify(x,null,2));
try {
  if(cmd==='help'){console.log('Usage: node engine/daily-cli.mjs plan|status|run-once|serve [policy.json] [YYYY-MM-DD]\nDisabled by default; run-once requires explicit authorization. NO PUBLIC PUBLISHING.');}
  else {
    const policy=validateDailyPolicy(JSON.parse(await readFile(resolve(policyPath),'utf8')));
    const date=dateArg||localDate(policy.timezone);
    if(cmd==='plan')show(planDailySlots(policy,date));
    else if(cmd==='status')show({policy: {enabled:policy.enabled,mode:policy.mode,worksPerDay:policy.worksPerDay,date},journal:await readDailyJournal('output',date),publishingEnabled:false});
    else if(cmd==='serve'){
      if(!policy.enabled)throw new Error('Policy disabled. Explicitly authorize only a private synthetic schedule to test it.');
      if(policy.mode!=='simulated')throw new Error('Live scheduled inference is blocked until a verified billing gate exists');
      console.log('PRIVATE SYNTHETIC SCHEDULER RUNNING; will execute once per day while this Node process is alive. Ctrl+C stops it.');
      let busy=false;
      const tick=async()=>{if(busy||!shouldRunNow(policy))return;busy=true;try{const p=simulatedProvider();await runDailyOnce(policy,{root:'output',provider:p});}catch(e){console.error('Scheduler stopped this cycle:',e.message)}finally{busy=false}};
      await tick();setInterval(tick,60_000);
    }
    else if(cmd==='run-once'){
      const provider=policy.mode==='simulated'?simulatedProvider():managedProvider();
      if(provider.kind==='simulated')console.log('SYNTHETIC DEMO ONLY: no real stories, no catalog publishing.');
      show(await runDailyOnce(policy,{root:'output',date,provider,onProgress:e=>console.log(`[slot ${e.index||'?'}] ${e.message||e.status}`)}));
    }else throw new Error('Unknown command');
  }
}catch(e){console.error('Daily factory:',e.message);process.exitCode=1}