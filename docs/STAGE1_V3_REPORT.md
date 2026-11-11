# FOLILUNE Studio Stage 1 v3 — Experimental EPUB Export
**Date:** 2026-11-11 | **Status:** Stage 1 proof; NOT a production release or Reader-approved export.

## Delivered
- Standalone offline Studio HTML: `prototypes/studio-stage1-v3.html`.
- Original offline EPUB ZIP/OCF packager: `src/epub-export.mjs`.
- **Test EPUB** control for prose and illustrated-story projects. Comic EPUB export is blocked.
- The experimental ebook contains a first uncompressed `mimetype` entry, `META-INF/container.xml`, OPF, navigation, CSS, XHTML chapters, and optional PNG/JPEG assets. Unicode/Telugu text is retained.
- Nothing changes Reader, builds public catalog entries, approves a release or sends unpublished drafts to any backend.

## Checks carried out in container (local development kit)
- **9/9** packager checks: two fixture exports, byte-for-byte reproducibility, comic block, duplicate chapter IDs, invalid language, WebP rejection, malformed JPEG rejection and safe XML character handling.
- **2/2** independent structural ZIP/XML inspections: CRC, OCF entries, linked manifest paths, navigation, chapter count, well-formed XML and Telugu/image data.
- **3/3** Chromium viewport interaction flows (1440×900, 960×760 and 390×844): create/edit/switch chapters, save, structured draft export, experimental EPUB download, injected save error/retry and atomic backup import failure/retry.
- These browser flows used **simulated IndexedDB** because Chromium blocked file://, localhost and routed navigation in this environment. They are not evidence of real local storage durability, browser restart or hardware recovery.

## Important unresolved gates
1. Official EPUBCheck has NOT been run. Passing ZIP/XML checks is not EPUB 3 conformance certification. The exporter uses ZIP STORE, fixed placeholder modified date, simple paragraph conversion and minimal metadata only.
2. Real FOLILUNE Reader v12 and later have NOT opened this exact exported EPUB in a verified test. Reader EPUB.js was documented as a prototype, not a production guarantee.
3. Full image decoding, accessibility, RTL/multilingual typography, annotations, precise reading location and CFI continuity need testing.
4. Local IndexedDB must be checked across actual reopen/restart, file-origin variation, storage quota failure and device recovery.
5. Release signing, immutable candidate validation, rights/approval and authenticated Publish are future work. They remain disabled.
6. The Studio visual direction still requires product-owner acceptance.

## Manual check
Use an external JSON backup before opening a different HTML filename; browser file origins may isolate IndexedDB. Open the HTML in Chrome/Edge, import backup if necessary, create a prose or illustrated work, choose **Test EPUB**, and open the exported file in a separate EPUB reader. Report any visual or persistence issues.

## Standards
EPUB 3.3 specification: https://www.w3.org/TR/epub-33/
Official EPUBCheck: https://github.com/w3c/epubcheck
Reader v12 report: https://github.com/rayadinaveen98-ship-it/FOLILUNE/blob/main/docs/INTEGRATED_READER_V12.md
