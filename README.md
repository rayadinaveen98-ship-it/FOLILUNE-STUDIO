# FOLILUNE Studio

**Create with intention. Publish with confidence.**

FOLILUNE Studio is an **autonomous literary creation and publishing system**, not primarily a manual writing editor. Its central engine will plan, write, revise, illustrate and assemble original prose, stories, fables, comics and future reading experiences, with owner-controlled budgets and a mandatory explicit approval gate before publishing. The manual editor is an oversight and correction tool. It is developed independently of FOLILUNE Reader and sends content to that app only through a versioned, validated, explicitly approved publishing process.

## Status

**Stage 1 — interactive prototype v4 (2026-11-11), acceptance incomplete.** Foundation documentation is committed and a standalone local-first authoring prototype exists. There is no production backend, release service, Reader integration, or proven physical-device persistence.

## Corrected primary roadmap (2026-11-11)

- **CONFIRMED direction:** autonomous story/comic production is the core product; it was incorrectly deferred in the earlier manual-editor-first plan.
- [Autonomous creation engine — pipeline, roles, budgets, controls and first MVP](docs/AUTONOMOUS_CREATION_ENGINE.md)
- [Future independent creators — submission workflow, rights and editorial governance](docs/CREATOR_ECOSYSTEM_FUTURE.md)
- **Actual progress:** Studio v4 only contains manual authoring, local data handling and experimental EPUB export. No real generative agents, scheduler, image-generation pipeline, approvals backend or Reader publishing exists yet.

## Stage 1 v4 — working proof (not production)

- [Standalone Studio v4](prototypes/studio-stage1-v4.html): local drafts, experimental EPUB export, and browser-recovery diagnostic.
- [v4 verification report](docs/STAGE1_V4_REPORT.md): actual passing checks vs. blocked tests.
- [Real browser restart test](tests/real-browser-persistence.py) and [official EPUBCheck runner](scripts/verify-epubcheck.sh) are committed. A GitHub Actions workflow exists, but a successful run has not been independently verified.
- **No Reader integration or public publishing.** Actual persistent storage, EPUBCheck conformance, and FOLILUNE Reader fidelity remain open gates.

## Non-negotiable boundaries

- `FOLILUNE-STUDIO` contains Studio planning and future Studio code only.
- The existing `FOLILUNE` repository and its Modern Atelier Reader design are not changed by this project.
- Draft content is private; nothing enters a public catalog without authenticated owner approval and a separate publish action.
- The public repo contains no private manuscripts, API keys, credentials, or unpublished illustrations.
- Compatibility with Reader is tested against real supported reader versions; features are gated until that evidence exists.

## Stage 1 prototype and verification

- [Current v3 authoring prototype with experimental EPUB export](prototypes/studio-stage1-v3.html)
- [EPUB exporter source](src/epub-export.mjs)
- [v3 verification report and open gates](docs/STAGE1_V3_REPORT.md)
- [Packager unit checks](tests/epub-export.test.mjs) and [structural EPUB checks](tests/epub-structure.py)

## Earlier Stage 1 prototype

- [Open Stage 1 v2 interactive Studio prototype](prototypes/studio-stage1-v2.html) (download Raw HTML to test locally)
- [Latest v2 reliability and test report](docs/STAGE1_V2_REPORT.md)
- [Private structured draft contract](contracts/studio-draft.v0.1.schema.json) and [draft model adapter](src/content-model.mjs)
- [Prose](fixtures/prose.draft.json), [illustrated](fixtures/illustrated.draft.json) and [comic](fixtures/comic.draft.json) test fixtures
- [Current Studio-to-Reader compatibility assessment](docs/READER_COMPATIBILITY_V1.md)
- [Previous v1 prototype](prototypes/studio-stage1-v1.html) and [v1 report](docs/STAGE1_V1_REPORT.md)

## Documentation

- [Product charter & principles](docs/PRODUCT_CHARTER.md)
- [Functional specification](docs/FUNCTIONAL_SPEC.md)
- [Experience architecture](docs/EXPERIENCE_ARCHITECTURE.md)
- [Domain model](docs/DOMAIN_MODEL.md)
- [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Publication contract](docs/PUBLICATION_CONTRACT.md)
- [Publication manifest JSON Schema — RFC v0.1](contracts/publication-manifest.v0.1.schema.json)
- [Security, privacy & rights](docs/SECURITY_RIGHTS.md)
- [Roadmap & acceptance gates](docs/ROADMAP.md)
- [Decision register](docs/DECISIONS.md)

Our first target is an **autonomous short-story production MVP** that produces a complete original draft, revision evidence, and experimental EPUB for owner review; next is verified approval-to-Reader publication. Illustrated fables and assembled mini comics follow. Reader code remains untouched unless a separately approved integration task is necessary.
