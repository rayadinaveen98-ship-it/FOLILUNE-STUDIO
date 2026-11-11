"""Isolated UI behavior smoke; uses mocked fetch, not real server, persistence or real model."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'engine/studio-console.html').read_text()
script=(ROOT/'engine/app.js').read_text()
fetch_stub=r'''window.queueFake={active:false,progress:'No private queue started',history:[],publishingEnabled:false,lastResults:[]};
window.lastQueueStart=null;
window.fetch=async function(input,opts={}) {
  let url=String(input);
  if(url==='/api/queue')return {ok:true,status:200,json:async()=>window.queueFake};
  if(url.startsWith('/api/jobs/'))return {ok:true,status:200,json:async()=>({id:'11111111-1111-1111-1111-111111111111',status:'ready_for_owner_review',stage:'done',calls:7,reviewVersion:1,reviewBusy:false,progress:'Ready for owner review',provider:'simulated',plan:{title:'Synthetic sample',outline:[{title:'A'},{title:'B'},{title:'C'}]},sections:[{id:'section-001',title:'Chapter A',text:'Original story test text',locked:false},{id:'section-002',title:'Chapter B',text:'More test text',locked:false},{id:'section-003',title:'Chapter C',text:'Final test text',locked:false}],revisions:[{sectionId:'section-001'}],qa:{warnings:[]}})};
  if(url==='/api/queue/start'){
    window.lastQueueStart=JSON.parse(opts.body);
    window.queueFake={active:true,progress:'Generating a private original story',history:[{id:'11111111-1111-1111-1111-111111111111',status:'queued',provider:'simulated',theme:window.lastQueueStart.profile.theme,createdAt:'2026-11-11T00:00:00Z'}],publishingEnabled:false,lastResults:[]};
    return {ok:true,status:202,json:async()=>({status:'queued',publishingEnabled:false,count:window.lastQueueStart.profile.worksPerRun})};
  }
  return {ok:false,status:404,json:async()=>({error:'Not in synthetic UI test'})};
};'''
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--disable-web-security','--no-sandbox'])
    for w,h in [(1440,900),(960,760),(390,844)]:
        page=browser.new_page(viewport={'width':w,'height':h})
        errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        page.set_content(html)
        page.evaluate(fetch_stub)
        page.add_script_tag(content=script)
        page.wait_for_timeout(150)
        assert page.locator('#autonomy-heading').inner_text()=='Let Studio invent the premise.'
        assert page.locator('#queueStatus').inner_text().startswith('No private queue started')
        assert page.locator('#downloads').is_hidden(), 'private artifact links must stay hidden until a review is ready'
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), f'Overflow at {w}'
        page.locator('#queueWorks').select_option('2')
        page.locator('#queueConsent').check()
        page.locator('#queueStart').click()
        page.wait_for_timeout(200)
        submitted=page.evaluate('window.lastQueueStart')
        assert submitted['profile']['worksPerRun']==2
        assert submitted['profile']['authorization']=='ALLOW_PRIVATE_DRAFT_CREATION_ONLY'
        assert submitted['provider']=='simulated'
        assert page.locator('#queueStart').is_disabled()
        assert page.locator('.queue-item').count()==1
        assert page.locator('.queue-item .queue-meta').count()==1
        # After the synthetic production finishes, its review is retrievable from local history.
        page.evaluate("window.queueFake.active=false;window.queueFake.progress='Batch finished';window.queueFake.history[0].status='ready_for_owner_review';window.queueFake.history[0].title='Synthetic sample'")
        page.evaluate('refreshQueue()')
        page.wait_for_timeout(100)
        assert page.locator('.queue-item button').is_enabled()
        page.locator('.queue-item button').click()
        page.wait_for_timeout(100)
        assert page.locator('.chapter').count()==3
        assert not page.locator('#downloads').is_hidden()
        assert not errs,errs
        if w==1440:page.screenshot(path='/mnt/data/FOLILUNE_Studio_Autonomous_Stage1A_v0.3_Desktop.png',full_page=True)
        if w==390:page.screenshot(path='/mnt/data/FOLILUNE_Studio_Autonomous_Stage1A_v0.3_Mobile.png',full_page=True)
        page.close()
    browser.close()
print('UI simulated browser flows: PASS 3/3 (theme queue, explicit consent, private authorization, responsive layout, disabled duplicate start)')
