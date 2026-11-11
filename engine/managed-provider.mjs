/** Server-only model gateway for FOLILUNE Studio. NEVER import this in a browser.
 * This is an OpenAI-compatible chat endpoint adapter, not a model implementation.
 * No model calls occur without explicit paid-generation opt-in and credentials.
 */
const SYSTEM = 'You are an ORIGINAL literary production specialist. Reply with one valid JSON object matching the requested fields. Follow the requested language, avoid copied copyrighted stories, and write substantive prose. No markdown fences.';
function parseJson(text) {
  if (typeof text !== 'string' || text.length > 2_000_000) throw new Error('Invalid model response size');
  const trimmed = text.trim();
  try { const obj = JSON.parse(trimmed); if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Expected a JSON object'); return obj; }
  catch { throw new Error('Model did not return an exact JSON object'); }
}
function endpointFromEnv(env) {
  const val = env.FOLILUNE_AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
  const u = new URL(val);
  const allowed = (env.FOLILUNE_AI_ALLOWED_HOST || 'api.openai.com').trim().toLowerCase();
  if (u.protocol !== 'https:' || u.hostname.toLowerCase() !== allowed || !/^[a-z0-9.-]+$/.test(allowed) || u.username || u.password || u.hash || u.search) {
    throw new Error('Managed inference endpoint must be an approved HTTPS host without URL credentials or query');
  }
  if (!u.pathname.startsWith('/') || u.pathname.includes('..')) throw new Error('Invalid inference endpoint path');
  return u.href;
}
export function managedProvider({env=process.env,fetchImpl=fetch}={}) {
  if (env.FOLILUNE_AI_ENABLE_PAID_GENERATION !== 'I_APPROVE_PAID_PRIVATE_DRAFTS') {
    throw new Error('Paid private generation is OFF. An administrator must explicitly authorize costs.');
  }
  const key = String(env.FOLILUNE_AI_API_KEY||'');
  const model = String(env.FOLILUNE_AI_MODEL||'');
  if (!key || !/^[A-Za-z0-9._:\/-]{1,120}$/.test(model)) throw new Error('Managed inference service is not configured');
  const endpoint = endpointFromEnv(env);
  return {
    kind:'managed', model,
    async generate({role,prompt,maxOutputTokens=1200}) {
      const n=Number(maxOutputTokens);
      if (!Number.isInteger(n) || n<100 || n>6000) throw new Error('Output token limit is outside approved range');
      const message=`ROLE: ${String(role).slice(0,80)}\n${String(prompt)}`;
      if (Buffer.byteLength(message, 'utf8') > 90_000) throw new Error('Model input too large for approved gateway limits');
      const control = new AbortController();
      const timeout = setTimeout(()=>control.abort(),120_000);
      try {
        const resp=await fetchImpl(endpoint,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${key}`},signal:control.signal,
          body:JSON.stringify({model,messages:[{role:'system',content:SYSTEM},{role:'user',content:message}],response_format:{type:'json_object'},max_completion_tokens:n})});
        if(!resp.ok) throw new Error(`Managed inference failed (HTTP ${resp.status}); inspect provider billing and configuration`);
        const raw=await resp.text();
        if(raw.length>3_000_000)throw new Error('Model response exceeds output size limit');
        const payload=JSON.parse(raw), content=payload?.choices?.[0]?.message?.content;
        return {data:parseJson(content),usage:{inputTokens:payload.usage?.prompt_tokens??null,outputTokens:payload.usage?.completion_tokens??null}};
      } catch(e) {if(e?.name==='AbortError')throw new Error('Managed inference request timed out');throw e;}
      finally {clearTimeout(timeout)}
    }
  };
}
export function managedProviderStatus(env=process.env) {
  const ready=env.FOLILUNE_AI_ENABLE_PAID_GENERATION==='I_APPROVE_PAID_PRIVATE_DRAFTS' && !!env.FOLILUNE_AI_API_KEY && !!env.FOLILUNE_AI_MODEL;
  return {ready,mode:'server-managed',note:ready?'Private generation configured. Per-request usage may incur charges.':'Production generation not configured; no paid model calls can start.'};
}