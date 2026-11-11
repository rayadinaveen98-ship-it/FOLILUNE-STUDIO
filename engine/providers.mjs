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
  const scenes = [
    "At the edge of the village, Asha discovered a torn message sealed beneath a stone. The signature was familiar, but the date contradicted everything her grandmother had taught her.",
    "Dev approached the abandoned bridge carrying a weathered notebook. He confessed that he had concealed a small brass key because it frightened him to imagine what the locked door might reveal.",
    "While the river rose behind the orchard, a boatman described a forgotten ceremony. His careful pauses suggested that he knew more about the missing lantern than he wanted to admit.",
    "In the crowded market, the friends compared their maps. One street had vanished from the latest drawing, leaving an empty white rectangle where the old observatory should stand.",
    "Asha followed a trail of blue threads through the monastery garden. Beside a broken fountain she found a note written in the distinctive handwriting of her childhood teacher.",
    "Under the copper roof of the watchtower, Dev began to question the promises that had guided his decisions. He understood that loyalty could become an excuse for remaining silent.",
    "The caretaker listened without interrupting, then placed three photographs on the wooden table. Each showed a different season, but the same shadow appeared beneath the lighthouse window.",
    "Just before dusk, Asha returned to the square and spoke openly about the evidence. A few villagers dismissed the danger; others offered supplies and joined the search.",
    "The final crossing demanded an uncomfortable choice: protect an old secret or restore the village record. The friends discussed the cost before deciding to tell the truth together.",
    "When the lantern finally shone across the valley, nobody claimed that every wound had healed. Yet the new light gave the community a place from which to begin rebuilding."
];
  const words = (heading, i) => scenes.map((passage,n)=>`${heading} — chapter ${i}, movement ${n+1}. ${passage}`).join('\n\n');
  return {
    kind:'simulated',model:'SYNTHETIC-TEST-ONLY',
    async generate({role,prompt}) {
      calls++;
      if (calls===failAt) throw new Error('Simulated provider failure');
      if (role === 'ideation') return {data:{premise:'A quiet cartographer in a mountain village discovers a map that changes whenever a forgotten promise is remembered. She must find the mapmaker before the village erases its own history.',genre:'mystery fantasy'},usage:{inputTokens:35,outputTokens:75}};
      if (role === 'planner') return {data:{title:'The Lantern Beyond the Mist',summary:'A synthetic sample about an old bridge and a lost lantern.',setting:'An invented village in a misty valley',tone:'gentle mystery',characters:[{name:'Asha',trait:'curious'},{name:'Dev',trait:'thoughtful'}],outline:Array.from({length:Number(/SECTION_COUNT:\s*(\d+)/.exec(prompt)?.[1] ?? 3)},(_,i)=>({title:`Part ${i+1} — The Crossing`,beat:`Asha discovers another clue in movement ${i+1}.`}))},usage:{inputTokens:20,outputTokens:100}};
      if (role === 'story-bible') return {data:{bible:'Asha is curious; Dev is thoughtful. Their village has a bridge and a lantern. The lantern stays missing until the final movement.'},usage:{inputTokens:25,outputTokens:50}};
      if (role === 'writer') return {data:{text:words('Original synthetic chapter',Number(/SECTION_NUMBER:\s*(\d+)/.exec(prompt)?.[1] ?? 1))},usage:{inputTokens:100,outputTokens:360}};
      if (role === 'critic') return {data:{issues:[{sectionIndex:0,problem:'Opening needs a clearer emotional choice',instruction:'Strengthen Asha’s decision and make it more vivid.'}],strengths:['Traceable progression']},usage:{inputTokens:120,outputTokens:80}};
      if (role === 'reviser') return {data:{text:words('Revised synthetic chapter',Number(/SECTION_NUMBER:\s*(\d+)/.exec(prompt)?.[1] ?? 1))},usage:{inputTokens:150,outputTokens:360}};
      throw new Error(`Unsupported simulated role: ${role}`);
    }
  };
}
