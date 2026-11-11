# FOLILUNE — Master Delivery Roadmap & Engineering Release Gates
**Plan version:** 1.0 · **Date:** 2026-11-11 · **Status:** Proposed milestone gates, not shipped functionality, no guaranteed dates.

## Guiding rule
Build ONE shared orchestrator + rights/approval/release platform, then specialist prose/novel/illustration/comic workers. Reuse existing Studio v0.4 code as an experimental kernel **only after a code audit**. Do not keep adding disconnected prototypes or creating 50 artificial phases. Protect the Reader repo and approved UX. No product milestone is “done” just because code compiled, simulated tests passed or a picture looks good.

### Gate 0 — Master plan and baseline audit (CURRENT)
- Deliverables: master vision, target architecture, quality policy, economics, Reader integration specification, creator future, milestone gates, existing code inventory and known failures.
- Real current inventory: local v0.4 story pipeline, Ollama adapter, synthetic test provider, idea queue 1–2, local chapter revisions, experimental EPUB. There is no hosted generation service, no automatically deployed daily schedule, no image/comic/novel creator, no authenticated publishing service, no Reader catalog.
- Exit: owner accepts direction; next implementation stays on the engine path. Architecture documentation complete ≠ functioning service.

### Gate 1 — Real generation runtime, owner-simple experience
**Build:** production-grade persistent job state/worker foundation; server-side managed model gateway with explicit privacy, auth, caps and provider fallback policy; one owner-only dashboard; brief and editorial calendar; provenance; pause/cancel/resume, retry ceilings, hard daily spend limits and kill switch. Do not expose model choices or require Ollama setup in owner UX.
**Proof:** using REAL inference (not synthetic), create a coherent original story of agreed length in one click without per-section prompts, preserve exact generation artifacts and token/cost/latency trace, recover an interrupted job without duplicate paid stages, handle failures/restarts, and demonstrate no production job exceeding hard caps.
**Blockers:** operating budget and provider terms, access to managed compute, encryption and authentication setup, real quality evaluation. No unattended processing until owner approves policy and budget.

### Gate 2 — Editorial story factory MVP
**Build:** automatic original premise invention, varied slate, outline, locked Story Bible, complete short-story drafting, independent critique, targeted revisions, constrained acceptance checks, editorial Review Inbox, immutable review candidate, plagiarism/similarity warning (non-authoritative), complete prose preview.
**Proof:** one genuinely written original finished story with narrative ending and no filler, reviewed by owner and at least one independent editorial check; test 10+ real varied pilot pieces for errors and quality. Native-language reviewers check Telugu before claiming Telugu quality.
**Failure behavior:** incomplete, copied-looking, poor, unsafe or repetitive work stays private with clear defect report.

### Gate 3 — First validated Studio → Reader release (HIGHEST PRIORITY INTEGRATION)
**Build:** owner auth, approve-for-later / Approve & Publish, rights record, immutable candidate digest and release transaction, official EPUBCheck and exact Reader build compatibility harness, catalog service and offline asset delivery, rollback/takedown.
**Proof:** owner produces real prose → reviews whole work → explicitly publishes → release appears in a separate Reader test build (without disturbing existing Reader users) → opens, downloads, reads offline, TOC/bookmarks/position survive restart; rejected/unapproved work cannot appear in catalog; failed promotions leave prior catalog intact; repeatable regression suite.
**Cross-repo rule:** Studio remains in its own repository. Actual Reader integration is a separate approved Reader task; versioned contract and capability matrix required.

### Gate 4 — Scale *short-story candidates* to 10/day
**Build:** scheduled and owner-authorized editorial programming; daily format/genre/language quotas; safe capacity controller; duplicate detection; production worker concurrency; queue dashboard; cost/health monitoring; content rotation; owner batch review features; automatic pause for low-quality/error/cost spikes.
**Ramp:** 1/day → 3/day → 5/day → 10/day. Each rung requires multiple consecutive successful production days, actual owner literary assessment and budget adherence; do not set calendar dates until real rate/cost measurements exist.
**Proof for 10/day:** completed, structurally valid, distinct genuine candidates hitting quota on agreed trial days *without* fabricated filler; separately measure how many were approved/published. On failures produce fewer, never fill quotas with low-quality books.
**Critical:** an owner can permit unattended **draft generation**, but no unattended publication at initial launch.

### Gate 5 — Serialized fiction and complete novels
**Build:** series/novel planning tools, full-book plot architecture, character/world canon, timeline and chapter dependency graph, rolling summaries, per-chapter retries, arc-level consistency checks, whole-book editorial passes, editions/episode lifecycle and Reader series support.
**Proof:** a complete finished novel, all required chapters/ending present and independently checked; one serialized work with correctly ordered updates, no content loss and Reader progress-safe edition migration.
**Cadence:** multiple concurrent novel projects possible; not ten complete novels every day. Daily new novel episodes are an option, not a synonym for whole-book releases.

### Gate 6 — Illustrated fables, then comics
**Build fables:** creative story + art direction + character reference sheets + actual images + visual consistency QA + age/rights/alt text + EPUB or other verified Reader format.
**Build comics:** complete script and storyboard → consistent original character/environment assets → actual panel artwork → readable balloon/lettering layout → composed pages → transcript/alt text → Reader paginated zoom-capable rendering.
**Proof:** one fully illustrated original fable that renders appropriately at phone/tablet/desktop, then a small COMPLETE comic where every page/panel exists and text stays legible; compare visuals across multiple scenes. Art delivery must be real files, not prompts.
**Restrictions:** higher costs and lower cadence; do not promise automated quality without character consistency and human review evidence.

### Gate 7 — Production catalog, retention and reader trust
**Build:** consumer-appropriate shelves, genres/languages, original-series discovery, search, age/category metadata, content correction/takedown, rights documentation, provenance disclosures and opt-in aggregate analytics. Improve production quality based on feedback rather than gaming daily title counts.
**Proof:** stable pilot cohort can browse/read/save/reopen verified released works, accessibility/privacy/security review, backup restores, incident/rollback drills and sensible performance budgets.

### Gate 8 — Independent creator platform (after controlled pilot)
**Build:** creator sign-up, moderated workspace, licenses/permissions, manuscript/image import, automated prep, editorial submission and appeals, provenance, platform review, account isolation, spam/risk prevention and appropriate compensation terms if commercial distribution approved.
**Proof:** outside creator submits a rights-cleared work, reviewer verifies and approves, Reader receives it; another creator never sees the private draft. Run creator beta and rights/moderation operations before general access.

## Explicit backlog and prioritization for immediate implementation
P0: managed generation service & secrets, job state durability, central quota/budget enforcement, private owner authentication.
P0: complete real story + independent quality evaluation + owner review candidate; remove routine provider setup from UI.
P0: approval/release service and pinned Reader integration test path.
P1: scheduled idea/genre slate and ramp toward 10 short stories/day with QA.
P1: novels/serials continuity graph and Reader edition semantics.
P1: illustrated fable art pipeline; comics only after visual consistency proof.
P2: independent creator marketplace and monetization (future).
P2: voice narration, interactive fiction and extra experiences only after core reliability.

## Definition of a release gate
Every gate includes: working source, reproducible deployment or binary, data migration, automated tests, realistic full end-to-end original-content artifacts, human review evidence, security/license/cost check, known limitations, rollback, updated README and honest status in GitHub. Simulated demos do not count as genuine outputs. A GitHub workflow definition is not a successful workflow run.

## Quality/cost stop conditions
Suspend a production lane if severe copyright/safety issue, incorrect publishing permission, invalid release artifacts, repeated hallucinated facts where facts matter, large language quality regression, billing cap exceeded, privacy leak, security exposure or Reader-breaking regression. Partial/incomplete jobs remain resumable; release catalog must stay consistent.

## Timing
No unsupported calendar deadline is committed. Engineering duration and costs will be estimated only after the first genuine model-generation run, target infrastructure and spending envelope are measurable. Milestone gates—not arbitrary “v50” feature churn—are our source of truth.
