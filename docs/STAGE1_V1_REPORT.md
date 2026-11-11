# Stage 1 — Studio v1 Prototype Verification
**Date:** 2026-11-11
**Status:** Interactive prototype committed. Stage 1 acceptance NOT complete.
**Prototype:** [prototypes/studio-stage1-v1.html](../prototypes/studio-stage1-v1.html)

## Build characteristics
- Single standalone HTML file containing HTML/CSS/vanilla JavaScript; no framework, network dependencies, backend or remote assets.
- Intended to open directly in a modern browser with IndexedDB available.
- Local IndexedDB project store, debounced draft saving, project creation and deletion, optional sample project.
- Three format profiles (prose, illustrated and comic), each with sections and adapted authoring copy.
- Basic story-bible notes, prose text fields, image attachments for illustrated/comic projects (PNG/JPEG/WebP under 2 MB each) with alt-text field.
- Manuscript-only Studio preview; JSON project/all-project export/import. Import duplicates with new IDs, does not overwrite existing projects.
- Release Center deliberately disabled. No approval/publishing backend, EPUB/CBZ output, Reader connection or claimed Reader fidelity.

## Verification conducted
### Source inspection
- JavaScript syntax passed Node `--check`.
- HTML parsed as a document with one inline script and one stylesheet.
- GitHub commit is to FOLILUNE-STUDIO only.

### Headless Chromium smoke test suite A
Viewport sizes: 1440×900, 960×760, 390×844.
- Empty home state renders, new illustrated project created.
- Chapter/spread title and text edited, Story Bible note saved in test model.
- New second section created and both sections edited separately.
- Project can be reopened from project list **inside the test's mocked storage environment**.
- Studio preview shows exact draft text and warns that it is not Reader proof.
- Exported JSON contains expected two sections and text.
- Release Center remains disabled.
- No uncaught page errors in tested flows.
**Result:** all 3 viewport flows passed against simulated IndexedDB.

### Headless Chromium smoke test suite B
Same viewport sizes.
- Comic project created, text entered, PNG attached, image visible in local editor.
- Alt text retained in downloaded JSON.
- Export/import creates a second project copy without overriding original.
- No horizontal overflow in project list at tested widths.
- No uncaught page errors.
**Result:** all 3 viewport flows passed against simulated IndexedDB.

## Explicit verification limitation
The execution environment's Chromium policy blocked browser navigation to both localhost and file:// pages (`ERR_BLOCKED_BY_ADMINISTRATOR`). Smoke tests therefore loaded the page via `set_content` on an opaque origin and installed a *simulated IndexedDB* API. The prototype's IndexedDB code was exercised against that simulation, **not a real persistent browser database**. Consequently, do NOT claim verified persistence across page reload, actual browser restart or Android device; that remains an open Stage 1 gate.

## Known limitations and blockers
- Stage 1 design direction and interaction quality are prototype proposals, not product-owner-approved visuals.
- IndexedDB capacity, private-mode behavior, abrupt shutdown recovery, import transactional behavior and corrupted backups need real browser/hardware tests.
- Image type/size checking is basic client-side validation; published asset pipeline requires deeper security, rights and decoding defenses.
- Project editor is text-area based; it does not implement the full structured editor or editable comic panels.
- Story Bible is an unstructured field; no continuity engine.
- There is no EPUB/CBZ conversion or Reader preview. Studio preview is not Reader fidelity evidence.
- No rights attestation, validation reports, signatures, approval, release or catalog service.
- Imported data is sanitized for displayed text, but production threat modeling and security testing are pending.
- No published link or live hosted application is claimed.

## Next gates
1. Real desktop browser IndexedDB reload, restart, offline and backup/restore validation (including safe failure paths).
2. Product owner reviews desktop/tablet visuals and functionality against Studio design direction.
3. Portable structured document model and representative prose/fable/comic JSON fixtures with stable IDs.
4. Compare against Reader's actual supported capabilities; build a compatibility matrix and identify first viable handoff.
5. Only after these steps move to Stage 2's secure, versioned candidate/approval/release mechanism.

No changes to FOLILUNE Reader were made or required for this prototype.
