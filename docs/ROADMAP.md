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
