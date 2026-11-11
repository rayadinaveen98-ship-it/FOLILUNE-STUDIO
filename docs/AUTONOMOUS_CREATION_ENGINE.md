# FOLILUNE Studio — Autonomous Creation Engine
**Status:** Core product direction CONFIRMED by owner; architecture PROPOSED. **2026-11-11**
**Code status:** NOT IMPLEMENTED. Existing Studio v4 is a manual authoring/EPUB prototype only.

## Mission
The primary capability of FOLILUNE Studio is **automated end-to-end original literary content production**. The system should generate, edit, illustrate, assemble and quality-check works with minimal routine intervention. It may operate from an owner prompt, an approved creative brief or a pre-authorized content schedule. It must NOT publish or grant rights without deliberate authorized review. The owner may choose a single explicit **Approve & Publish** action: the backend records approval for the exact immutable candidate and, only if all gates still pass, atomically publishes it. **Approve for later** leaves publication pending.

The manual Studio editor is the owner’s intervention, oversight and revision surface—not the dominant experience.

## Core modes
1. **Create for me**: owner gives genre, language, style, target audience, scope, format and constraints; engine runs the approved production workflow.
2. **Ideas to production**: owner selects an original premise or approves an engine-suggested brief; engine produces the complete draft autonomously.
3. **Series production**: use a locked Story Bible and approved series plan to propose/produce consistent episodes, with episode-by-episode owner release approval.
4. **Production queue**: owners may explicitly schedule drafts or allow a capped queue to run within defined budgets; publishing is always a separate approval-gated action.
5. **Direct edit**: manual authoring and revisions remain available, with human edits protected from unintended regeneration.

## Production state machine
CREATIVE_BRIEF → OUTLINE → STORY_BIBLE → DRAFTING → EDITORIAL_REVISION → (ART_BRIEF → ART_GENERATION → LAYOUT_AND_LETTERING when needed) → PACKAGING → AUTOMATED_QA → READY_FOR_OWNER_REVIEW → OWNER_CHANGES_REQUESTED or OWNER_APPROVED → EXPLICIT_PUBLISH → READER_CATALOG.
- Every stage consumes a versioned artifact and returns inspectable outputs plus machine-readable quality evidence.
- Every stage is restartable and idempotent; failed stages can retry with capped attempts, back off or stop for intervention.
- Each run has a single immutable brief snapshot, model/tool versions, explicit budgets, job status, logs and provenance. Regenerating a chapter/page creates a new revision, not a destructive overwrite.
- Owner approval references an immutable release candidate hash. Any change invalidates approval. Publishing is a separate authenticated action.
- Owner may pause, cancel, retry, lock/rewrite specific chapters/pages, and roll back to previous approved revisions.

## Specialist roles coordinated by one orchestrator
- **Creative director / planner:** original premises, length, narrative arc, audience and style specification.
- **Story architect:** act structure, chapter/scene breakdown, pacing goals, episode continuity.
- **Writer:** actual prose/dialogue in requested language, maintaining genre/voice and source brief.
- **Continuity editor:** compares chapters/scenes to Story Bible; identifies contradictions and flags uncertainty.
- **Line editor / critic:** checks voice, readability, repetition, pacing, narrative coherence. Produces targeted revision tasks.
- **Illustration director:** consistent character/setting references, pose and composition plans, rights/provenance.
- **Illustration producer:** creates or assembles artwork; consistency is tested and human-reviewed, never guaranteed by prompts.
- **Comic compositor:** page/panel arrangement, dialogue placement, readability, cropping, text alternatives and export.
- **Accessibility/localization checker:** readability and supported-language requirements.
- **Publication engineer / QA:** transforms structured source into EPUB for compatible prose, image-page packages for verified comics, validates rights/structure/reader support.

These are logical roles, not a requirement for a separate paid model for every role. Start with a simple configurable orchestration pipeline and only add complexity when measured quality improves.

## Deliverables and measurable quality
- Full inspectable story project with chapter/page drafts, planned length and actual length metrics.
- Revision trail and explanation of why revisions were generated.
- Consistent Story Bible, scene list, named characters, timeline and asset provenance.
- For illustrated works: actual image assets with alt text and page/spread intents.
- For comics: approved style sheet, character references, scene/panel plan, text bubbles, assembled page exports and transcript. A comic is not complete if it only contains a screenplay or vague illustration prompts.
- EPUB validity and *actual* reader rendition proof for a selected Reader build before declaring delivery-ready.
- QA report distinguishes deterministic checks (can pass) from subjective quality signals (need owner judgment).
- Final user-facing preview is the exact candidate expected by Reader, not a static imitation.

## Limits, trust and economics
- Autonomy covers production within guardrails, NOT public release. New projects may start autonomously only under pre-authorized rules and spending caps.
- Budget limits for tokens/model invocations, image generation, storage, repeated revisions and concurrent jobs. Alert before expensive operations; stop safely on budget exhaustion.
- Running paid cloud models is NOT free by default. Provide local/offline model options where feasible but never promise equivalent output quality or zero hardware cost.
- Research must distinguish facts from generated fiction; real-world claims, translations and copyright assertions need separate verification.
- No automatic imitation of protected books/characters/styles beyond rights granted; record source/license for external inputs.
- No silent uploading of private manuscripts to remote AI. Owner controls AI providers, privacy, permissions and model choices.
- A model cannot certify its own literary quality. Owner reviews and can demand revisions.

## First autonomous MVP (replaces manual-first goal)
A **single original short story in a chosen language**:
1. Owner approves a brief, chooses budget and presses Generate.
2. Engine automatically plans a 3–5-section story, creates a small Story Bible, drafts all sections, runs structural/continuity review and makes at least one targeted revision pass where needed.
3. Engine assembles a draft and generates an experimental EPUB using current Studio exporter.
4. QA produces a transparent report; ready-for-review state gives owner full story plus readable differences and a test preview.
5. Owner can request changes; new revision is generated and revalidated.
6. **No publish button is considered functional** until Reader compatibility, rights clearance, owner authorization, immutable packaging, delivery and rollback are implemented/tested.

Then add an illustrated fable with images and later a mini comic with assembled readable pages and verified Reader renderer. Long novels and serials follow after continuity and cost tests.

## Acceptance gates
1. No routine chapter-by-chapter user prompting in autonomous flow.
2. Repeatable deterministic workflow states, retries, pause/resume and recovery.
3. Model/provider errors leave drafts intact; budget caps enforceable; provenance recorded.
4. Generated story has real complete chapter content and an inspectable revision trail.
5. Owner intervention can target a single scene/page and preserve locked content.
6. Prepublication QA and Reader fidelity gate the public release.
7. Explicit owner approval and separate publication action; no bypass.
8. Costs, originality, content rights and provider privacy are disclosed and controlled.
