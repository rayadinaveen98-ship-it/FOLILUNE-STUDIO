/** FOLILUNE Studio Stage 1A. No secrets or model access in the browser. */

const jsonObject = value => {
  const s = String(value ?? '').trim();
  try { return JSON.parse(s); } catch {
    const start = s.indexOf('{'), end = s.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('Model returned no JSON object');
    try { return JSON.parse(s.slice(start, end + 1)); }
    catch { throw new Error('Model response is not valid JSON'); }
  }
};

export function ollamaProvider({ model, baseUrl = 'http://127.0.0.1:11434', timeoutMs = 240000 } = {}) {
  if (!model || !/^[a-zA-Z0-9_.:/-]{1,120}$/.test(model)) throw new Error('Provide a valid installed Ollama model name');
  const base = new URL(baseUrl);
  if (!['127.0.0.1','localhost','[::1]'].includes(base.hostname) || base.protocol !== 'http:') {
    throw new Error('For Stage 1A only loopback Ollama endpoints are permitted; no remote draft uploads');
  }
  if (base.username || base.password || base.search || base.hash || (base.pathname !== '/' && base.pathname !== '')) throw new Error('Ollama base URL must contain only host and port');
  return {
    kind: 'ollama', model,
    async generate({role, prompt, maxOutputTokens = 1200}) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(new URL('/api/chat', base), {
          method:'POST', signal:controller.signal,
          headers:{'content-type':'application/json'},
          body: JSON.stringify({model, stream:false, format:'json',
            messages:[{role:'system', content:'You are a professional ORIGINAL literary creation specialist. Output ONLY a valid JSON object matching the requested keys. Follow the stated language, no markdown fencing. Avoid copyrighted characters and derivative copying.'},{role:'user',content:`ROLE: ${role}\n${prompt}`}],
            options:{temperature:0.6, num_predict:maxOutputTokens}})
        });
        if (!response.ok) throw new Error(`Ollama HTTP ${response.status}: ${(await response.text()).slice(0,300)}`);
        const payload = await response.json();
        const content = payload?.message?.content;
        const result = jsonObject(content);
        if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('Model must return a JSON object');
        return {data:result, usage:{inputTokens:payload.prompt_eval_count ?? null,outputTokens:payload.eval_count ?? null}};
      } catch(e) {
        if (e?.name === 'AbortError') throw new Error(`Ollama did not respond within ${timeoutMs / 1000}s`);
        throw e;
      } finally { clearTimeout(timeout); }
    }
  };
}

// Explicitly synthetic provider for offline integration tests. NEVER represent results as AI-generated books.
export function simulatedProvider({failAt = null} = {}) {
  let calls = 0;
  const words = (heading, i) => Array.from({length:12},(_,n)=>`${heading}: Asha crossed the old stone bridge while mist rose over the valley. She remembered the promise she made to Dev about the missing lantern. The village clock rang, and every sound seemed to carry a secret. A small choice changed the journey; the characters listened, reconsidered, and continued toward the light. Section ${i}, passage ${n+1}.`).join('\n\n');
  return {
    kind:'simulated',model:'SYNTHETIC-TEST-ONLY',
    async generate({role,prompt}) {
      calls++;
      if (calls===failAt) throw new Error('Simulated provider failure');
      if (role === 'planner') return {data:{title:'The Lantern Beyond the Mist',summary:'A synthetic sample about an old bridge and a lost lantern.',setting:'An invented village in a misty valley',tone:'gentle mystery',characters:[{name:'Asha',trait:'curious'},{name:'Dev',trait:'thoughtful'}],outline:Array.from({length:Number(/SECTION_COUNT:\s*(\d+)/.exec(prompt)?.[1] ?? 3)},(_,i)=>({title:`Part ${i+1} — The Crossing`,beat:`Asha discovers another clue in movement ${i+1}.`}))},usage:{inputTokens:20,outputTokens:100}};
      if (role === 'story-bible') return {data:{bible:'Asha is curious; Dev is thoughtful. Their village has a bridge and a lantern. The lantern stays missing until the final movement.'},usage:{inputTokens:25,outputTokens:50}};
      if (role === 'writer') return {data:{text:words('Original synthetic chapter',Number(/SECTION_NUMBER:\s*(\d+)/.exec(prompt)?.[1] ?? 1))},usage:{inputTokens:100,outputTokens:360}};
      if (role === 'critic') return {data:{issues:[{sectionIndex:0,problem:'Opening needs a clearer emotional choice',instruction:'Strengthen Asha’s decision and make it more vivid.'}],strengths:['Traceable progression']},usage:{inputTokens:120,outputTokens:80}};
      if (role === 'reviser') return {data:{text:words('Revised synthetic chapter',Number(/SECTION_NUMBER:\s*(\d+)/.exec(prompt)?.[1] ?? 1))},usage:{inputTokens:150,outputTokens:360}};
      throw new Error(`Unsupported simulated role: ${role}`);
    }
  };
}
