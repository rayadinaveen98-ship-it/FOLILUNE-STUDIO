import test from 'node:test';import assert from 'node:assert/strict';
import {managedProvider,managedProviderStatus} from '../engine/managed-provider.mjs';
const env={FOLILUNE_AI_ENABLE_PAID_GENERATION:'I_APPROVE_PAID_PRIVATE_DRAFTS',FOLILUNE_AI_API_KEY:'server-secret',FOLILUNE_AI_MODEL:'provider-model'};
test('paid private production is off without admin opt-in',()=>{
 assert.equal(managedProviderStatus({}).ready,false);
 assert.throws(()=>managedProvider({env:{...env,FOLILUNE_AI_ENABLE_PAID_GENERATION:''}}),/OFF/i);
});
test('server-only gateway requires keys and an allowed HTTPS host',()=>{
 assert.throws(()=>managedProvider({env:{...env,FOLILUNE_AI_API_KEY:''}}),/not configured/i);
 assert.throws(()=>managedProvider({env:{...env,FOLILUNE_AI_ENDPOINT:'http://127.0.0.1:9999/test'}}),/approved HTTPS/i);
 assert.throws(()=>managedProvider({env:{...env,FOLILUNE_AI_ENDPOINT:'https://evil.example/v1/chat/completions'}}),/approved HTTPS/i);
});
test('gateway returns parsed JSON and usage with key only in request header',async()=>{
 let seen;
 const provider=managedProvider({env,fetchImpl:async(url,options)=>{seen={url,options};return {ok:true,text:async()=>JSON.stringify({choices:[{message:{content:'{"title":"Original story"}'}}],usage:{prompt_tokens:15,completion_tokens:20}})}}});
 assert.equal(provider.kind,'managed');
 const output=await provider.generate({role:'planner',prompt:'New fictional short story',maxOutputTokens:500});
 assert.equal(output.data.title,'Original story');assert.equal(output.usage.inputTokens,15);
 assert.equal(seen.url,'https://api.openai.com/v1/chat/completions');
 assert.equal(seen.options.headers.authorization,'Bearer server-secret');
 assert(!seen.options.body.includes('server-secret'));
});
test('gateway rejects malformed response, invalid token cap and fake endpoint errors',async()=>{
 let provider=managedProvider({env,fetchImpl:async()=>({ok:true,text:async()=>JSON.stringify({choices:[{message:{content:'not valid json'}}]})})});
 await assert.rejects(provider.generate({role:'writer',prompt:'hello',maxOutputTokens:500}),/exact JSON/);
 await assert.rejects(provider.generate({role:'writer',prompt:'hello',maxOutputTokens:10000}),/token limit/);
 provider=managedProvider({env,fetchImpl:async()=>({ok:false,status:429,text:async()=>''})});
 await assert.rejects(provider.generate({role:'writer',prompt:'hello',maxOutputTokens:500}),/HTTP 429/);
});