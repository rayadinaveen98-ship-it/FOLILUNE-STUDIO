/** FOLILUNE Studio private draft interchange v0.1. This is NOT a Reader release package. */
export const DRAFT_SCHEMA_VERSION = '0.1.0';
export const SECTION_ROLE = Object.freeze({prose:'chapter', illustrated:'spread', comic:'page'});

const allowedImage = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
const asText = (value, max) => String(value ?? '').slice(0, max);

export function toStudioDraft(project) {
  if (!project || !Object.hasOwn(SECTION_ROLE, project.type) || !Array.isArray(project.sections)) {
    throw new TypeError('Unsupported Studio project');
  }
  if (project.sections.length < 1 || project.sections.length > 250) {
    throw new RangeError('Draft needs 1–250 sections');
  }
  const seen = new Set();
  const sections = project.sections.map(section => {
    if (!section || typeof section.id !== 'string' || !section.id || seen.has(section.id)) {
      throw new TypeError('Every section needs a unique stable ID');
    }
    seen.add(section.id);
    let artwork = null;
    if (section.image != null) {
      if (typeof section.image !== 'string' || !allowedImage.test(section.image) || section.image.length > 3_000_000) {
        throw new TypeError('Unsupported artwork in draft');
      }
      artwork = {id: section.id + ':artwork', dataUrl: section.image, altText: asText(section.alt,350)};
    }
    return {
      id: section.id,
      role: SECTION_ROLE[project.type],
      title: asText(section.title,140),
      body: {format:'plain-text', text: asText(section.body,150000)},
      artwork
    };
  });
  return {
    kind:'folilune-studio-draft',
    schemaVersion: DRAFT_SCHEMA_VERSION,
    warning:'Private authoring interchange only. Not a Reader publication package.',
    project: {
      id: asText(project.id,128),
      format: project.type,
      title: asText(project.title,140),
      subtitle: asText(project.subtitle,180),
      language: asText(project.language || 'en',35),
      summary: asText(project.summary,1500),
      storyBible: asText(project.storyBible,10000),
      sections
    }
  };
}

export function validateStudioDraft(value) {
  const errors = [];
  if (!value || value.kind !== 'folilune-studio-draft' || value.schemaVersion !== DRAFT_SCHEMA_VERSION) errors.push('Unknown draft schema');
  const p = value?.project;
  if (!p || !Object.hasOwn(SECTION_ROLE,p.format)) errors.push('Invalid project format');
  if (!p || typeof p.title !== 'string' || !p.title.trim()) errors.push('Missing title');
  if (!p || typeof p.id !== 'string' || !p.id) errors.push('Missing project ID');
  if (!Array.isArray(p?.sections) || p.sections.length<1 || p.sections.length>250) errors.push('Invalid section count');
  const seen = new Set();
  for (const s of Array.isArray(p?.sections)?p.sections:[]) {
    if (!s || typeof s.id !== 'string' || !s.id || seen.has(s.id)) errors.push('Missing or duplicate section ID');
    if (s?.id) seen.add(s.id);
    if (s?.role !== SECTION_ROLE[p.format]) errors.push('Mismatched section role');
    if (s?.body?.format !== 'plain-text' || typeof s?.body?.text !== 'string') errors.push('Invalid plain-text body');
    if (s?.artwork != null) {
      if (p.format === 'prose') errors.push('Prose section has unsupported artwork in v0.1');
      if (typeof s.artwork.dataUrl !== 'string' || !allowedImage.test(s.artwork.dataUrl) || s.artwork.dataUrl.length>3_000_000) errors.push('Invalid artwork data');
    }
  }
  return {ok:errors.length===0, errors};
}
