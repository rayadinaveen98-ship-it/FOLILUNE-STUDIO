/** Loopback-only Ollama diagnostics. Does not send manuscripts or prompts. */
const modelPattern = /^[a-zA-Z0-9_.:/-]{1,120}$/;
export async function listLocalModels({baseUrl='http://127.0.0.1:11434',timeoutMs=3500}={}) {
  const base = new URL(baseUrl);
  if(base.protocol!=='http:' || !['127.0.0.1','localhost','[::1]'].includes(base.hostname) || base.username || base.password || base.search || base.hash || base.pathname!=='/') throw Error('Only loopback Ollama endpoints allowed');
  const controller=new AbortController();const t=setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const response=await fetch(new URL('/api/tags',base),{signal:controller.signal});
    if(!response.ok)throw Error(`Ollama returned HTTP ${response.status}`);
    const data=await response.json();
    if(!Array.isArray(data.models))throw Error('Ollama model list has an unexpected shape');
    const models=data.models.map(m=>String(m?.name??'')).filter(n=>modelPattern.test(n)).slice(0,100);
    return {available:true,models};
  } catch(e) {
    if(e?.name==='AbortError')throw Error('Local Ollama did not respond in time');
    throw Error(`Local Ollama unavailable: ${e.message}`);
  } finally { clearTimeout(t); }
}
export async function requireInstalledModel(model,options={}) {
  if(typeof model!=='string'||!modelPattern.test(model))throw Error('Choose a valid local model name');
  const info=await listLocalModels(options);
  if(!info.models.includes(model))throw Error(`Local Ollama model '${model}' is not installed. Available: ${info.models.slice(0,8).join(', ')||'none'}`);
  return true;
}
