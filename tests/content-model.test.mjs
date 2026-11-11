import test from 'node:test';
import assert from 'node:assert/strict';
import {toStudioDraft,validateStudioDraft,SECTION_ROLE} from '../src/content-model.mjs';
const make = format => ({id:'work-001',type:format,title:`An original ${format} work`,subtitle:'',language:'te',summary:'A brief story.',storyBible:'The heroine is Mira.',sections:[{id:'part-001',title:'Opening',body:'ఒకప్పుడు ఒక కథ.',image:format==='prose'?null:'data:image/png;base64,iVBORw0KGgo=',alt:'Opening illustration'}]});
for (const format of Object.keys(SECTION_ROLE)) test(`draft ${format}: stable IDs, Unicode and artwork`,()=>{
  const raw=make(format),draft=toStudioDraft(raw);
  assert.equal(draft.kind,'folilune-studio-draft');
  assert.equal(draft.project.sections[0].id,'part-001');
  assert.equal(draft.project.sections[0].role,SECTION_ROLE[format]);
  assert.equal(draft.project.sections[0].body.text,'ఒకప్పుడు ఒక కథ.');
  assert.equal(!!draft.project.sections[0].artwork,format!=='prose');
  assert.equal(validateStudioDraft(draft).ok,true);
});
test('duplicate ID is blocked',()=>{const p=make('prose');p.sections.push({...p.sections[0]});assert.throws(()=>toStudioDraft(p),/unique stable ID/)});
test('invalid artwork is blocked',()=>{const p=make('comic');p.sections[0].image='https://example.invalid/remote.png';assert.throws(()=>toStudioDraft(p),/Unsupported artwork/)});
test('missing title is rejected during validation',()=>{const d=toStudioDraft(make('prose'));d.project.title='';assert.equal(validateStudioDraft(d).ok,false)});
test('unsupported format is rejected',()=>assert.throws(()=>toStudioDraft(make('interactive')),/Unsupported/));
