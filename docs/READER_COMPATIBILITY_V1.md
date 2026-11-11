# Stage 1 — Studio ↔ Reader Capability Matrix
**Date:** 2026-11-11
**Status:** Document-based assessment; no end-to-end publication test.

## Source of truth
- FOLILUNE Reader `docs/INTEGRATED_READER_V12.md`: real EPUB.js 0.3.93 browser proof for chapter TOC, embedded image, CFI/bookmarks and theming. Browser-tested prototype, **not production approved**.
- Reader `docs/READER_ENGINE_INTERFACE.md`: proposed adapter boundary, not a stable API.
- v12's Comic and Study interfaces are demonstration screens. The Reader docs explicitly do not certify complex EPUB fixed-layout, scripts, RTL/Indic, large files, or full accessibility.
- Reader v12 HTML is described as a conversation artifact rather than confirmed source-controlled code; repository documentation does not prove exact executable parity.

## Compatibility candidates
| Studio type | Current Studio v2 | Reader evidence | Gate |
|---|---|---|---|
| Prose story | Private draft JSON with typed chapters | EPUB.js reflowable sample worked in Reader v12 browser test | Build valid EPUB and import it into the exact Reader version; check TOC, CFI, offline resume |
| Illustrated fable | Private text/image spreads with alt text | EPUB with embedded image worked in Reader v12 sample | Generate illustrated EPUB and check image fidelity, alt text, pagination and resizing |
| Comic | Page notes and a single artwork attachment per page; no editable panels | Comic screen is only a demonstration | **Blocked**. Prove fixed-page format, reading direction, zoom and transcript support |
| Interactive/audio | Not implemented | No verified compatible renderer | Deferred |

## Design constraints
1. Private drafts and public manifests have different schemas and independent version numbers.
2. Stable creative section IDs do not magically equal EPUB CFIs or Reader bookmark anchors.
3. Release approval, signed artifact digest and compatibility evidence must be stored in owner/backend-controlled records, not trusted from editable JSON.
4. Readers must support a declared capability before a work can be published for that Reader build.
5. All Studio-to-Reader adapters require explicit cross-repo validation; Reader stays untouched until that work is approved.

**Next:** obtain the actual current Reader test artifact, package a small original prose EPUB and one illustrated fixture, then run isolated import fidelity tests.
