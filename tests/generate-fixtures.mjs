import {writeFileSync} from 'node:fs';
import {toStudioDraft} from '../src/content-model.mjs';
const directions=[
  {type:'prose',title:'The Lantern at Dawn',language:'en',summary:'Original demo about a lantern on a quiet hill.',parts:[['The hill','Mira reached the quiet hill before sunrise.',''],['A signal','A warm light flickered through the mist.','']]},
  {type:'illustrated',title:'చిన్న దీపం',language:'te',summary:'An original illustrated fable in Telugu.',parts:[['మొదటి పుట','ఒక చిన్న దీపం చీకటిలో వెలిగింది.',''],['రెండవ పుట','దాని వెలుగు దారిని చూపించింది.','']]},
  {type:'comic',title:'The Last Paper Star',language:'en',summary:'An original miniature comic.',parts:[['Page One','Panel 1: a child holds a paper star. Dialogue: Is it really mine?','A child holding a paper star'],['Page Two','Panel 2: the star catches the morning light. Dialogue: It always was.','A paper star glowing in the morning']]},
];
for(const e of directions){
 const p={id:`fixture-work-${e.type}`,type:e.type,title:e.title,subtitle:'',language:e.language,summary:e.summary,storyBible:'Original fictional characters and settings.',sections:e.parts.map(([title,body,alt],i)=>({id:`${e.type}-section-${i+1}`,title,body,alt,image:e.type==='prose'?null:'data:image/png;base64,iVBORw0KGgo='}))};
 const model=toStudioDraft(p);
 writeFileSync(new URL(`../fixtures/${e.type}.draft.json`,import.meta.url),JSON.stringify(model,null,2)+'\n');
}
