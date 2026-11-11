#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createJob,runJob,jobStatus} from './runner.mjs';
import {ollamaProvider,simulatedProvider} from './providers.mjs';

const usage=`FOLILUNE STUDIO — AUTONOMOUS STORY ENGINE (Stage 1A)

  node engine/cli.mjs run fixtures/brief.json --provider ollama --model YOUR_LOCAL_MODEL
  node engine/cli.mjs run fixtures/brief.json --provider simulated
  node engine/cli.mjs resume output/JOB_ID --provider ollama --model SAME_MODEL
  node engine/cli.mjs status output/JOB_ID

Options: --output DIR (default ./output)   --max-stages N (pause at a stage boundary)
No network AI request is made unless --provider ollama is explicitly selected.
Only local Ollama http://127.0.0.1:11434 is supported. No public publish operation exists.
`;
const args=process.argv.slice(2);
const opt=(name,fallback)=>{const i=args.indexOf(`--${name}`);return i<0?fallback:args[i+1]};
const command=args[0];
async function main(){
  if(!command||['help','-h','--help'].includes(command)){console.log(usage);return;}
  if(command==='status'){
    if(!args[1])throw new Error('Job directory required');
    const s=await jobStatus(resolve(args[1]));console.log(JSON.stringify({id:s.id,status:s.status,stage:s.stage,calls:s.calls,sectionCount:s.sections.length,model:s.model,qa:s.qa,error:s.lastError},null,2));return;
  }
  if(!['run','resume'].includes(command))throw new Error(`Unknown command ${command}`);
  if(!args[1])throw new Error('Provide brief JSON path or existing job directory');
  const providerName=opt('provider','simulated');
  const provider=providerName==='simulated'?simulatedProvider():providerName==='ollama'?ollamaProvider({model:opt('model',process.env.OLLAMA_MODEL),baseUrl:process.env.OLLAMA_BASE_URL}):null;
  if(!provider)throw new Error('Only simulated and ollama providers are supported');
  const jobDir=command==='run'?
    await createJob(resolve(opt('output','output')),JSON.parse(await readFile(resolve(args[1]),'utf8'))):resolve(args[1]);
  console.log(`JOB: ${jobDir}`);
  if(provider.kind==='simulated')console.log('WARNING: SYNTHETIC DEMO CONTENT. This does not call a real text model.');
  const maxStages=Number(opt('max-stages','Infinity'));
  const s=await runJob(jobDir,provider,{maxStages,onProgress:event=>console.log(`${event.status} ${event.stage}: ${event.message}`)});
  console.log(`RESULT: ${s.status}\nMODEL CALLS: ${s.calls}\nWORD COUNTS: ${s.qa?.wordCounts?.join(', ')??'not yet packaged'}`);
  console.log(`Draft and experimental EPUB, if completed: ${jobDir}`);
}
main().catch(e=>{console.error(`ERROR: ${e.message}`);process.exitCode=1;});
