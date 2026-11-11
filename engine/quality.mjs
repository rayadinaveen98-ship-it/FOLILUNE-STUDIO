/** Inspectable, deterministic drafting checks. Never claims literary excellence. */
const tokenize = s => String(s ?? '').toLocaleLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];

export function repetitionSignal(text, window = 5) {
  const terms = tokenize(text);
  if (terms.length < window * 8) return {score:0, inspected:0, unique:0};
  const grams = new Set(); let repeated = 0;
  for (let i=0;i+window<=terms.length;i++) {
    const gram=terms.slice(i,i+window).join(' ');
    if (grams.has(gram)) repeated++; else grams.add(gram);
  }
  const inspected=terms.length-window+1;
  return {score:Number((repeated/inspected).toFixed(3)),inspected,unique:grams.size};
}

export function inspectDraft(sections,{minimumWords=100}={}) {
  const warnings = [];
  const sectionMetrics = sections.map((section,i)=>{
    const wordCount=tokenize(section.text).length;
    const repetition=repetitionSignal(section.text);
    if (wordCount < minimumWords) warnings.push({code:'SHORT_SECTION',sectionId:section.id,message:`Section ${i+1} has only ${wordCount} words`});
    if (repetition.score >= 0.48) warnings.push({code:'HEAVY_REPETITION',sectionId:section.id,message:`Section ${i+1} repeats many 5-word sequences (${Math.round(repetition.score*100)}%)`});
    if (/\b(lorem ipsum|as an ai language model|return json|insert your text here)\b/i.test(section.text)) warnings.push({code:'PLACEHOLDER_OR_INSTRUCTION_LEAK',sectionId:section.id,message:`Section ${i+1} contains a placeholder or instruction-like text`});
    return {sectionId:section.id,wordCount,repetition};
  });
  // Never certify originality, copyright safety, artistic merit, or narrative continuity from these heuristics.
  return {sectionMetrics,warnings,literaryQualityVerified:false,originalityVerified:false,continuityVerified:false};
}
