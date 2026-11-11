# Decision Register — FOLILUNE Studio
**As of:** 2026-11-11. CONFIRMED means established by product-owner direction; PROPOSED requires review; DEFERRED is not scope.

| ID | Decision | Status | Rationale / guardrail |
|---|---|---|---|
| S-001 | Develop Studio in separate FOLILUNE-STUDIO repository, Reader in FOLILUNE | CONFIRMED | Parallel work without Reader code edits |
| S-002 | Studio creates prose, stories, fables, comics, later other literary works | CONFIRMED (vision) | Distinct format-aware workflows |
| S-003 | Owner approval required before publication into Reader | CONFIRMED | Preserve creative/editorial control |
| S-004 | Maintain Reader's existing visual and development work independently | CONFIRMED | No regression-by-integration |
| S-005 | Use a separate authenticated Publish action after specific candidate approval | PROPOSED | Prevent accidental release |
| S-006 | Desktop-first Studio UX, tablet-friendly, mobile review-first | PROPOSED | Authoring ergonomics |
| S-007 | Modern Atelier-inspired but tool-dense creator design language | PROPOSED | Cohesive ecosystem; visual design not yet approved |
| S-008 | Local-first drafts, exportable backup, optional cloud services | PROPOSED | Resilience and cost control |
| S-009 | TypeScript/React plus constrained structured editor, relational metadata, object storage | CANDIDATE | Evaluate in Stage 1 |
| S-010 | Internal publication manifest + EPUB3/visual-package export adapters | PROPOSED RFC | Explicit, versioned Reader compatibility |
| S-011 | V1 vertical slice: one short story, one illustrated fable, one mini comic | PROPOSED | Evidence of complete publishing flow |
| S-012 | Autonomous production engine (story planning, full drafting, revision, format-specific artwork, QA) | CONFIRMED — CORE PRODUCT | Owner explicitly clarified the automated engine is the primary purpose; earlier AI deferral was wrong |
| S-013 | Broader independent creator submissions and publishing opportunity | CONFIRMED — FUTURE VISION | Curated creator onboarding, attribution and review after owner-operated production and Reader publishing work; payments remain deferred |
| S-014 | Fixed release dates, revenue targets and technology vendor locks | NOT DECIDED | Need evidence/cost and platform tests |
| S-015 | No copyrighted text/image redistribution without license, and no secret drafts in public repo | PROPOSED baseline | Security and rights |
| S-016 | Reader capabilities must be proven before any content type becomes public | PROPOSED baseline | Prevent broken reading experiences |

| S-017 | Automated production from brief or pre-authorized bounded queue, with owner final approval | CONFIRMED — VISION | Engine generates finished content without chapter-by-chapter prompting; no autonomous public publication |
| S-018 | First engine milestone is a complete auto-generated short story with editorial revision + review EPUB | PROPOSED — IMPLEMENTATION MILESTONE | Delivers a realistic test of end-to-end autonomy before full novels/comics |
| S-019 | Provider/model selection, cost caps, local/cloud split and retries | PROPOSED | Needed before enabling autonomous external model calls |
| S-020 | Multi-creator publishing includes content moderation and rights verification | PROPOSED FOR FUTURE | Avoid uncontrolled distribution or copyright problems |

## Open product questions, not blocking documentation work
- V1 is owner-controlled; when should invited external creators first participate in a curated pilot?
- What is the first artwork source workflow: imported finished art only, or on-canvas editing from Stage 2?
- Which Reader build is stable enough to be the first publishing acceptance target?
- Will the first catalog be private test-only or limited public release?
- How much offline creation/storage do we guarantee in the first real desktop build?

Update this register whenever an option is approved or evidence disproves an assumption. Do not silently reclassify candidates as decisions.
