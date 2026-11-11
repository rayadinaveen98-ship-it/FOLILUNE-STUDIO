# FOLILUNE Studio — Staged Roadmap & Gates
**Current:** Stage 1 interactive prototype v1 committed; acceptance gates pending. Stage 0 foundation documentation. **Date:** 2026-11-11. No dates or claims of feature implementation are committed.

## Stage 0 — Foundation (documentation started)
Deliver: charter, information architecture, functional requirements, domain model, architecture, release contract RFC, security/rights baseline and decisions.
Exit gate: product-owner agrees on mandatory rules and first-release scope; document proposed vs confirmed items.
Status: DOCUMENTED, awaiting review. Not equivalent to implementation approval.

## Stage 1 — Studio experience and technical spikes
**Checkpoint 2026-11-11:** Standalone HTML Studio v1 committed with project workspace, format-aware editors, image attachments, Story Bible notes, IndexedDB implementation, basic preview and JSON backup/import. Chromium smoke flows passed at 1440x900, 960x760 and 390x844 using simulated IndexedDB only; real browser persistence and Reader compatibility are unverified. See [STAGE1_V1_REPORT.md](STAGE1_V1_REPORT.md). This stage remains IN PROGRESS, not complete.
Deliver: interactive desktop/tablet Studio prototype; local project editor and autosave feasibility tests; representative prose/fable/comic content models; actual compatibility matrix against current Reader v12 and subsequent Reader revisions.
Exit: creator can recover a saved draft after reload/restart, and test packages demonstrate round-trip content without unreported loss. Design direction specifically approved.
Do not modify Reader production sources.

### Stage 1 v2 checkpoint — 2026-11-11
The standalone Studio prototype now sequences saves, guards against stale saved-status updates, supports atomic backup batch import and exports typed private draft models for prose, illustrated stories and comics. A versioned draft JSON Schema and three representative fixtures were added. JS syntax, 7 content-model tests, JSON schema fixture validation, and three simulated-IDB browser smoke profiles passed. **Real IndexedDB browser restart, device recovery and Reader integration remain unverified**. See [STAGE1_V2_REPORT.md](STAGE1_V2_REPORT.md) and [READER_COMPATIBILITY_V1.md](READER_COMPATIBILITY_V1.md). Stage 1 remains IN PROGRESS.

### v3 EPUB packaging checkpoint (2026-11-11)
A standalone Studio v3 prototype adds fully offline, experimental EPUB export for prose and illustrated works. Unit checks 9/9, independent ZIP/XML fixture structural checks 2/2 and three viewport browser smoke flows passed (the browser used simulated IndexedDB only). Comic publication, formal EPUBCheck, actual Reader rendition tests, real storage restart, owner approval and public publishing remain BLOCKED/UNVERIFIED. Stage 1 stays IN PROGRESS. See [STAGE1_V3_REPORT.md](STAGE1_V3_REPORT.md).

**Checkpoint — Stage 1 v4 (2026-11-11):** Added an in-app IndexedDB recovery diagnostic, a real-process Chromium restart test, an official EPUBCheck 5.4 runner, a GitHub Actions test workflow, and an illustrated EPUB alt-text requirement. Local 10/10 exporter unit, 2/2 ZIP/XML and 3/3 simulated-storage viewport checks passed. Real browser navigation here is blocked; no real persistence, EPUBCheck or Reader integration result is claimed. See [Stage 1 v4 report](STAGE1_V4_REPORT.md). Stage 1 remains IN PROGRESS.

## Stage 2 — End-to-end publishing vertical slice
Deliver: private Studio creates one original short story, one illustrated fable, one mini comic; revision snapshots, rights metadata, deterministic build, validation, real Reader preview, owner approval and separately authorized publish.
Exit: releases are immutable, catalog contains approved artifacts only, and real Reader tests show accurate rendering and offline recovery; unsupported comic rendition remains blocked until reader capability is proven.
Initially use a local catalog or test channel; no live public library required.

## Stage 3 — Professional production workflows
Deliver: novel/chapter tools, rich Story Bible, asset library, advanced editorial comments, first native editable comic composition, structured revision compare and reusable production templates.
Exit: complex authored projects preserve content fidelity, stable IDs, safe recovery, accessible alternatives, performance within agreed limits.

## Stage 4 — Publishing operations and distribution
Deliver: authenticated hosted publishing control plane if needed, object storage, release audit, rollout, catalog versioning, idempotency, rollout rollback, safe delivery, rights/takedown mechanisms.
Exit: staging-to-public promotion tested; release never occurs without owner action; Reader migration and failure recovery tested across supported devices.

## Stage 5 — Optional intelligence and multi-edition workflows
Candidate features: AI writing/art assistance, continuity suggestions, translations, narration, serialized releases. Each needs economics, rights, privacy and reader-compatibility review.
Exit: opt-in workflows never automatically alter approved assets or release without authorization.

## Stage 6 — Pilot and release
Deliver: end-to-end regressions, accessibility and Indic-script testing, large image/document safety/performance, privacy/legal/license review, actual device tests, creator feedback and monitored public catalog pilot.
Exit: user-approved launch decision with verified production artifacts, support/rollback plan, and no unknown critical blockers.

## Release gate checklist
- [ ] Private originals and project backups remain outside public repo/catalog
- [ ] Source revision snapshot and reproducible candidate digest
- [ ] Asset/rights provenance complete
- [ ] Security validation passed
- [ ] Publisher metadata, language/RTL and accessibility basics validated
- [ ] Required Reader features actually supported by pinned target build(s)
- [ ] Phone/tablet/desktop visual + functional Reader proof for applicable rendition
- [ ] Save/restart/offline/resume and annotation safety tested where supported
- [ ] Explicit approval tied to exact candidate
- [ ] Separate explicit Publish action, server/local authorization enforced
- [ ] Catalog rollback and failed promotion path demonstrated

## Collaboration contract with Reader project
Studio and Reader work in separate repositories/chats. Studio may inspect Reader's public docs and accepted compatibility evidence. Changes to Reader source are never silently bundled into Studio work. Breaking contract changes require version bump, compatibility fixture tests, acceptance and explicit integration review.
