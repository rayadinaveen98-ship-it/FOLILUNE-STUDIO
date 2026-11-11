const $=id=>document.getElementById(id);
let timer=null;
const buttonState=busy=>{ $('real').disabled=busy;$('demo').disabled=busy; };
const uiStatus=(message,bad=false)=>{$('status').textContent=message;$('status').style.background=bad?'#fff0e7':'#eef3eb';};
async function start(provider){
  if(!$('brief').reportValidity())return;
  if(provider==='ollama'&&!$('model').value.trim()){uiStatus('Enter a local Ollama model name first.',true);return;}
  buttonState(true);$('downloads').hidden=true;$('chapters').replaceChildren();
  uiStatus(provider==='simulated'?'Starting SYNTHETIC TEST (not real writing)...':'Starting local model generation...');
  const brief={premise:$('premise').value,language:$('lang').value,genre:$('genre').value,style:$('style').value,sections:Number($('sections').value),maxCalls:12,maxOutputTokens:2200};
  try{
    const res=await fetch('/api/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({provider,model:$('model').value.trim(),brief})});
    const data=await res.json();if(!res.ok)throw Error(data.error||'Unable to start');
    timer=setInterval(()=>poll(data.id),1000);await poll(data.id);
  }catch(e){uiStatus(e.message,true);buttonState(false);}
}
async function poll(id){
  try{
    const res=await fetch('/api/jobs/'+id);const data=await res.json();if(!res.ok)throw Error(data.error);
    const synthetic=data.provider==='simulated'?'SYNTHETIC DEMO · ':'';
    uiStatus(`${synthetic}${data.status.toUpperCase()} · ${data.stage} · ${data.calls} model calls. ${data.progress||''}`,data.status==='failed');
    $('summary').textContent=data.plan?`${data.plan.title} · ${data.sections.length}/${data.plan.outline.length} sections · ${data.revisions.length} editorial revisions`:'Planning and preparing...';
    $('chapters').replaceChildren();for(const section of data.sections){const div=document.createElement('div');div.className='chapter';const title=document.createElement('h3');title.textContent=section.title;const p=document.createElement('p');p.textContent=section.text;div.append(title,p);$('chapters').append(div);}
    if(data.status==='ready_for_owner_review'){$('downloads').hidden=false;$('json').href=`/api/jobs/${id}/draft`;$('epub').href=`/api/jobs/${id}/epub`;}
    if(['ready_for_owner_review','failed','needs_attention'].includes(data.status)){clearInterval(timer);timer=null;buttonState(false);if(data.error)uiStatus(`${data.status}: ${data.error.message}`,true);}
  }catch(e){clearInterval(timer);timer=null;uiStatus(e.message,true);buttonState(false);}
}
$('brief').addEventListener('submit',e=>{e.preventDefault();start('ollama')});
$('demo').addEventListener('click',()=>start('simulated'));
