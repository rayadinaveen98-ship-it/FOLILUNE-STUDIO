/** FOLILUNE Studio experimental EPUB3 packager.
 * Private local preview/export only. No Reader compatibility / EPUBCheck certification.
 * Original code. ZIP uses STORE (no compression), bounded input, deterministic header timestamps.
 */
const EPUB_MIMETYPE = 'application/epub+zip';
const XML = s => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'\uFFFD').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&apos;'}[c]));
const utf8 = s => new TextEncoder().encode(s);
const bcp47 = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
function textParagraphs(value) {
  const normalized=String(value||'').replace(/\r\n?/g,'\n');
  return normalized.split(/\n{2,}/).map(segment => segment.trim()).filter(Boolean)
    .map(segment => '<p>'+segment.split('\n').map(XML).join('<br/>')+'</p>').join('\n');
}
function bytesFromBase64(b64) {
  const raw=atob(b64), out=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
  return out;
}
function write16(view,offset,n){view.setUint16(offset,n,true)}
function write32(view,offset,n){view.setUint32(offset,n>>>0,true)}
const CRC_TABLE=(()=>{const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let j=0;j<8;j++)c=c&1?(0xedb88320^(c>>>1)):c>>>1;table[n]=c>>>0}return table})();
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=CRC_TABLE[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
function zipStore(entries){
  if(entries.length>300)throw new Error('Too many EPUB files');
  const prepared=entries.map(([name,value])=>{
    if(!/^[\w./-]+$/.test(name)||name.includes('..')||name.startsWith('/'))throw new Error('Unsafe EPUB filename');
    const path=utf8(name), data=typeof value==='string'?utf8(value):value;
    if(!(data instanceof Uint8Array))throw new Error('Invalid EPUB entry');
    return {path,data,crc:crc32(data)};
  });
  const total=prepared.reduce((t,e)=>t+30+e.path.length+e.data.length+46+e.path.length,22);
  if(total>30*1024*1024)throw new Error('EPUB exceeds experimental 30 MB limit');
  const out=new Uint8Array(total), view=new DataView(out.buffer), central=[];
  let off=0;
  // ZIP DOS timestamp fixed: 2000-01-01 00:00; stable for identical drafts.
  const dosTime=0, dosDate=((2000-1980)<<9)|(1<<5)|1;
  for(const e of prepared){
    const here=off;
    write32(view,off,0x04034b50);write16(view,off+4,20);write16(view,off+6,0x0800);
    write16(view,off+8,0);write16(view,off+10,dosTime);write16(view,off+12,dosDate);
    write32(view,off+14,e.crc);write32(view,off+18,e.data.length);write32(view,off+22,e.data.length);
    write16(view,off+26,e.path.length);write16(view,off+28,0);off+=30;
    out.set(e.path,off);off+=e.path.length;out.set(e.data,off);off+=e.data.length;
    central.push({e,here});
  }
  const centralStart=off;
  for(const {e,here} of central){
    write32(view,off,0x02014b50);write16(view,off+4,20);write16(view,off+6,20);write16(view,off+8,0x0800);
    write16(view,off+10,0);write16(view,off+12,dosTime);write16(view,off+14,dosDate);
    write32(view,off+16,e.crc);write32(view,off+20,e.data.length);write32(view,off+24,e.data.length);
    write16(view,off+28,e.path.length);write16(view,off+30,0);write16(view,off+32,0);
    write16(view,off+34,0);write16(view,off+36,0);write32(view,off+38,0);write32(view,off+42,here);
    off+=46;out.set(e.path,off);off+=e.path.length;
  }
  const cSize=off-centralStart;
  write32(view,off,0x06054b50);write16(view,off+4,0);write16(view,off+6,0);
  write16(view,off+8,central.length);write16(view,off+10,central.length);
  write32(view,off+12,cSize);write32(view,off+16,centralStart);write16(view,off+20,0);
  return out;
}
export function buildExperimentalEpub(draft) {
  if(!draft||draft.kind!=='folilune-studio-draft'||draft.schemaVersion!=='0.1.0')throw new Error('Unsupported private draft model');
  const p=draft.project;
  if(!p||!['prose','illustrated'].includes(p.format))throw new Error('EPUB experiment supports only prose and illustrated stories');
  if(!p.title?.trim()||!p.id||!Array.isArray(p.sections)||!p.sections.length||p.sections.length>250)throw new Error('Draft missing title, ID or valid section count');
  if(!bcp47.test(p.language))throw new Error('Language must be a valid basic BCP 47 tag');
  if(p.sections.some(s=>!s?.id||!s?.body||s.body.format!=='plain-text'||typeof s.body.text!=='string'))throw new Error('Invalid chapter structure');
  if(new Set(p.sections.map(s=>s.id)).size!==p.sections.length)throw new Error('Duplicate chapter IDs');
  const lang=XML(p.language), title=XML(p.title), escapedId=XML(String(p.id).replace(/[^\w-]/g,'-').slice(0,90));
  const entries=[['mimetype',EPUB_MIMETYPE],['META-INF/container.xml',xmlHeader+'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>']];
  const items=[`<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,`<item id="css" href="styles/book.css" media-type="text/css"/>`];
  const spine=[],nav=[];
  p.sections.forEach((s,index)=>{
    if(s.artwork&&p.format==='prose')throw new Error('Prose artwork is not supported by this draft schema');
    const id=String(index+1).padStart(3,'0'), href=`text/part-${id}.xhtml`,chapterTitle=XML(s.title||`Section ${index+1}`);
    let artwork='';
    if(s.artwork){
      const match=/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(s.artwork.dataUrl||'');
      if(!match)throw new Error('For EPUB export, artwork must be PNG or JPEG; convert WebP first');
      if(match[2].length>2_800_000)throw new Error('Artwork exceeds EPUB proof size limit');
      if(!s.artwork.altText?.trim())throw new Error('Illustrations need descriptive alt text before EPUB export');
      const raw=bytesFromBase64(match[2]);
      if(!raw.length||raw.length>2*1024*1024)throw new Error('Artwork is invalid or too large');
      const validPng=match[1]==='png'&&raw.length>=24&&[137,80,78,71,13,10,26,10].every((n,i)=>raw[i]===n);
      const validJpeg=match[1]==='jpeg'&&raw.length>=16&&raw[0]===255&&raw[1]===216&&raw[2]===255&&raw.at(-2)===255&&raw.at(-1)===217;
      if(!validPng&&!validJpeg)throw new Error('Image bytes do not match PNG/JPEG type');
      const type=match[1]==='png'?'image/png':'image/jpeg',ext=match[1]==='png'?'png':'jpg';
      const imageHref=`images/art-${id}.${ext}`;
      entries.push([`EPUB/${imageHref}`,raw]);
      items.push(`<item id="img${id}" href="${imageHref}" media-type="${type}"/>`);
      artwork=`<figure><img src="../${imageHref}" alt="${XML(s.artwork.altText||'')}"/></figure>`;
    }
    const contents=textParagraphs(s.body.text);
    const xhtml=xmlHeader+`<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${lang}" lang="${lang}"><head><title>${chapterTitle}</title><meta charset="utf-8"/><link rel="stylesheet" type="text/css" href="../styles/book.css"/></head><body><main><h1 id="part-${id}">${chapterTitle}</h1>${artwork}${contents}</main></body></html>`;
    entries.push([`EPUB/${href}`,xhtml]);
    items.push(`<item id="sec${id}" href="${href}" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="sec${id}"/>`);
    nav.push(`<li><a href="${href}">${chapterTitle}</a></li>`);
  });
  const navDoc=xmlHeader+`<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}"><head><title>Contents</title><meta charset="utf-8"/></head><body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>${nav.join('')}</ol></nav></body></html>`;
  const css=`body{font-family:serif;line-height:1.65;margin:5% auto;max-width:44em}h1{font-size:1.6em;line-height:1.3}p{margin:0 0 1em}figure{text-align:center;margin:1.3em 0}img{max-width:100%;height:auto}`;
  const opf=xmlHeader+`<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="${lang}"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="pub-id">urn:folilune:private-draft:${escapedId}</dc:identifier><dc:title>${title}</dc:title><dc:language>${lang}</dc:language><meta property="dcterms:modified">2000-01-01T00:00:00Z</meta></metadata><manifest>${items.join('')}</manifest><spine>${spine.join('')}</spine></package>`;
  entries.push(['EPUB/nav.xhtml',navDoc],['EPUB/styles/book.css',css],['EPUB/package.opf',opf]);
  return zipStore(entries);
}
