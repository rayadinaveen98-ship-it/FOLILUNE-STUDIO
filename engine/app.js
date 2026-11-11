const $ = id=>document.getElementById(id);
let timer=null, currentJob=null, currentVersion=1, reviewBusy=false, currentSections=[];
let queueTimer=null, queueBusy=false, manualBusy=false;
const buttonState=busy=>{manualBusy=busy;$('real').disabled=busy||queueBusy;$('demo').disabled=busy||queueBusy;$('queueStart').disabled=busy||queueBusy;};
const uiStatus=(message,bad=false)=>{$('status').textContent=message;$('status').style.background=bad?'#fff0e7':'#eef3eb';};
const post=async(path,data)=>{
  const res=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
  const json=await res.json();if(!res.ok)throw Error(json.error||'Request failed');return json;
};
async function start(provider){
  if(!$('brief').reportValidity())return;
  if(provider==='ollama'&&!$('model').value.trim()){uiStatus('Enter a local Ollama model name first.',true);return;}
  buttonState(true);$('downloads').hidden=true;$('reviewtools').hidden=true;$('chapters').replaceChildren();
  uiStatus(provider==='simulated'?'Starting SYNTHETIC TEST (not real writing)...':'Starting local model generation...');
  const brief={premise:$('premise').value,language:$('lang').value,genre:$('genre').value,style:$('style').value,sections:Number($('sections').value),maxCalls:12,maxOutputTokens:2200};
  try{
    const data=await post('/api/run',{provider,model:$('model').value.trim(),brief});
    currentJob=data.id; clearInterval(timer);timer=setInterval(()=>poll(currentJob),1000);await poll(currentJob);
  }catch(e){uiStatus(e.message,true);buttonState(false);}
}
async function lockChapter(id,locked){
  if(!currentJob||reviewBusy)return;
  try{await post(`/api/jobs/${currentJob}/lock`,{sectionId:id,locked});await poll(currentJob);}
  catch(e){uiStatus(e.message,true);}
}
function renderChapters(data){
  $('chapters').replaceChildren();
  for(const section of data.sections){
    const div=document.createElement('div');div.className='chapter';
    const title=document.createElement('h3');title.textContent=section.title;
    const p=document.createElement('p');p.textContent=section.text;
    div.append(title,p);
    if(data.status==='ready_for_owner_review'){
      const lock=document.createElement('button');lock.type='button';lock.className='lockbtn';lock.textContent=section.locked?'Unlock chapter':'Lock chapter';
      lock.disabled=!!data.reviewBusy;lock.addEventListener('click',()=>lockChapter(section.id,!section.locked));div.append(lock);
    }
    $('chapters').append(div);
  }
}
function renderReview(data){
  const isReady=data.status==='ready_for_owner_review';
  $('reviewtools').hidden=!isReady;$('downloads').hidden=!isReady||!!data.reviewBusy;
  if(!isReady)return;
  const selection=$('targetSection').value;
  $('targetSection').replaceChildren();
  for(const section of data.sections){
    const option=document.createElement('option');option.value=section.id;option.textContent=section.title+(section.locked?' (locked)':'');option.disabled=!!section.locked;$('targetSection').append(option);
  }
  const available=data.sections.filter(s=>!s.locked);
  $('targetSection').value=available.some(s=>s.id===selection)?selection:(available[0]?.id??'');
  $('targetSection').disabled=!available.length||data.reviewBusy;
  $('revisionInstruction').disabled=data.reviewBusy;
  $('revise').disabled=!available.length||data.reviewBusy;
  const warnings=data.qa?.warnings||[];
  $('qaNotes').replaceChildren();
  if(warnings.length){const p=document.createElement('p');p.className='qualitywarn';p.textContent=`Heuristic quality warnings (${warnings.length}): `+warnings.map(x=>x.message).slice(0,3).join(' · ');$('qaNotes').append(p);}
  else{const p=document.createElement('p');p.className='hint';p.textContent='No deterministic structure/repetition warnings. Literary quality, originality and Reader compatibility are NOT certified.';$('qaNotes').append(p);}
}
async function poll(id){
  try{
    const res=await fetch('/api/jobs/'+id);const data=await res.json();if(!res.ok)throw Error(data.error);
    const synthetic=data.provider==='simulated'?'SYNTHETIC DEMO · ':'';
    reviewBusy=!!data.reviewBusy;currentVersion=data.reviewVersion??1;currentSections=data.sections||[];
    uiStatus(`${synthetic}${data.status.toUpperCase()} · ${data.stage} · review v${currentVersion} · ${data.calls} model calls. ${data.progress||''}`,data.status==='failed');
    $('summary').textContent=data.plan?`${data.plan.title} · ${data.sections.length}/${data.plan.outline.length} sections · ${data.revisions.length} editorial revisions`:'Planning and preparing...';
    renderChapters(data);renderReview(data);
    if(data.status==='ready_for_owner_review'){$('json').href=`/api/jobs/${id}/draft`;$('epub').href=`/api/jobs/${id}/epub`;}
    if(['ready_for_owner_review','failed','needs_attention'].includes(data.status)&&!data.reviewBusy){clearInterval(timer);timer=null;buttonState(false);if(data.error)uiStatus(`${data.status}: ${data.error.message}`,true);}
  }catch(e){clearInterval(timer);timer=null;uiStatus(e.message,true);buttonState(false);}
}
async function ownerRevise(){
  if(!currentJob||reviewBusy)return;
  const sectionId=$('targetSection').value,instruction=$('revisionInstruction').value.trim();
  if(instruction.length<12){uiStatus('Give a specific revision instruction (at least 12 characters).',true);return;}
  reviewBusy=true;$('revise').disabled=true;
  try{
    await post(`/api/jobs/${currentJob}/revise`,{sectionId,instruction,expectedReviewVersion:currentVersion});
    uiStatus('Targeted revision requested. Other chapters remain unchanged.');
    $('revisionInstruction').value='';clearInterval(timer);timer=setInterval(()=>poll(currentJob),1000);await poll(currentJob);
  }catch(e){reviewBusy=false;uiStatus(e.message,true);await poll(currentJob);}
}
$('brief').addEventListener('submit',e=>{e.preventDefault();start('ollama');});
$('demo').addEventListener('click',()=>start('simulated'));
$('revise').addEventListener('click',ownerRevise);

// Private autonomous work queue. No publication API exists.
function showQueueHistory(data){
  $('queueItems').replaceChildren();
  const entries=data.history||[];
  if(!entries.length){const p=document.createElement('p');p.className='hint';p.textContent='No local production history yet.';$('queueItems').append(p);return;}
  for(const entry of entries){
    if(!entry.id)continue;
    const item=document.createElement('div');item.className='queue-item';
    const title=document.createElement('strong');title.textContent=entry.title?entry.title+' · '+(entry.status==='ready_for_owner_review'?'Ready for review':entry.status):entry.status==='ready_for_owner_review'?'Draft ready for your review':entry.status==='queued'?'Queued private production':entry.status==='failed'?'Private production failed':'Private draft · '+entry.status;
    const meta=document.createElement('div');meta.className='queue-meta';meta.textContent=`${entry.provider==='simulated'?'SYNTHETIC TEST':'LOCAL MODEL'} · ${entry.createdAt||''} · ${entry.theme||''}`;
    const open=document.createElement('button');open.className='btn alt';open.type='button';open.textContent=entry.status==='ready_for_owner_review'?'Open completed story':'Inspect work';
    open.disabled=queueBusy;
    open.addEventListener('click',()=>{currentJob=entry.id;clearInterval(timer);timer=setInterval(()=>poll(currentJob),1000);poll(currentJob);document.getElementById('summary').scrollIntoView({behavior:'smooth',block:'center'});});
    item.append(title,meta,open);
    if(entry.error){const error=document.createElement('p');error.className='hint';error.textContent='Error: '+entry.error;item.append(error);}
    $('queueItems').append(item);
  }
}
async function refreshQueue(){
  try{
    const res=await fetch('/api/queue');const data=await res.json();if(!res.ok)throw Error(data.error||'Queue unavailable');
    queueBusy=!!data.active;
    $('queueStatus').textContent=(data.progress||'No queue in progress')+(data.active?' · Working locally…':'');
    $('queueStart').disabled=manualBusy||queueBusy;
    $('real').disabled=manualBusy||queueBusy;$('demo').disabled=manualBusy||queueBusy;
    $('queueProvider').disabled=queueBusy;
    showQueueHistory(data);
  }catch(e){$('queueStatus').textContent='Queue check failed: '+e.message;}
}
async function startPrivateBatch(event){
  event.preventDefault();
  if(!$('queueForm').reportValidity())return;
  const provider=$('queueProvider').value,model=$('queueModel').value.trim();
  if(provider==='ollama'&&!model){$('queueStatus').textContent='Select an installed local Ollama model first.';return;}
  const profile={authorization:'ALLOW_PRIVATE_DRAFT_CREATION_ONLY',theme:$('queueTheme').value,language:$('queueLanguage').value,genre:$('queueGenre').value,worksPerRun:Number($('queueWorks').value),sections:Number($('queueSections').value),maxCallsPerWork:Number($('queueMaxCalls').value),maxOutputTokens:2200};
  $('queueStart').disabled=true;$('queueStatus').textContent='Requesting a bounded, private production batch…';
  try{
    await post('/api/queue/start',{provider,model,profile});
    $('queueConsent').checked=false;
    await refreshQueue();
    clearInterval(queueTimer);queueTimer=setInterval(refreshQueue,1200);
  }catch(e){$('queueStatus').textContent='Could not start: '+e.message;await refreshQueue();}
}
$('queueForm').addEventListener('submit',startPrivateBatch);
refreshQueue();
queueTimer=setInterval(refreshQueue,3500);
