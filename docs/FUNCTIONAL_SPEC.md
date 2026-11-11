# Functional Specification — FOLILUNE Studio
**Status:** Proposed; not implemented. All implementation phases are subject to acceptance gates.

## Core user journey — autonomous first
Owner defines/approves a creative brief (or authorizes a bounded production queue) → autonomous planner proposes structure and Story Bible → writing engine generates complete sections → editorial reviewers identify problems → targeted automatic revisions → illustration/panel composition where format requires → package and deterministic QA → owner reviews complete work and may request changes → owner approves a specific candidate → owner separately publishes through authorized service → compatible Reader receives publication.

**Priority correction:** Automated generation and orchestration are not optional later enhancements; they are FOLILUNE Studio's primary value proposition. Existing manual authoring features provide an oversight/repair interface and infrastructure. The first engine MVP is a multi-section, end-to-end generated original short story with an auditable revision trail and experimental EPUB for owner review; Reader publication is gated separately.

## Autonomous production capabilities — primary scope
- Brief setup: genre, language, audience, length/format, creative constraints, preferred output, model/provider and maximum spend; a clearly visible Start production action.
- Orchestration: stages for outline, Story Bible, complete drafts, editorial critique and revision, format-specific artwork/lettering, QA and export; status, resumability, bounded retries and failure diagnostics.
- Full content outputs, not only ideas, prompts or planning documents. A work cannot be called complete until required chapters/pages and actual assets are generated/assembled.
- Run controls: pause/resume, cancel, redo chapter or page, protect human-locked changes, compare revisions, inspect provenance and costs.
- Owner review: finished candidate, visual/reader preview where supported, editorial findings, revision requests and explicit approval. Release remains a separate authenticated action.
- Optional future authorized recurrence: autonomous batch jobs under limits; never silent public publishing.
- First acceptance test: an approved short-story brief produces all sections and a substantive revision pass with no per-chapter prompting, within a controlled job budget. See [AUTONOMOUS_CREATION_ENGINE.md](AUTONOMOUS_CREATION_ENGINE.md).

## Supporting authoring and publication capabilities (existing Stage 1 foundation)
### 1. Workspace and projects
- Project dashboard: continue work, projects, recent edits, pending reviews; no clutter.
- Create project types: prose/short story, illustrated story, comic. Form fields adapt to type.
- Project-level title, synopsis, language, creator attribution, target audience, rights status and cover draft.
- Autosave with explicit saved/unsaved/error feedback; controlled revisions and export/import of entire project.
- Search within a project, duplicate project, archive/unarchive, safe deletion requiring confirmation.

### 2. Authoring and structuring
- Prose: chapters, headings, paragraphs, rich text within an allowlist, chapter order, footnote/reference support as a later expansion.
- Illustrated story: ordered sections or pages each holding approved text and linked images; image alt text, optional caption and layout intent.
- Comic: ordered pages/panels, background art references, bubbles/lettering as positioned editable objects, reading direction and text alternatives. Initial delivery can use flattened pages with accessible transcript; editable panel composition is Stage 3.
- Maintain stable IDs for chapters/pages/panels across edits; never use visible page number as canonical identity.

### 3. Asset library
- Import allowed image formats, inspect pixel size/type, record checksum, rights owner, license, source, alteration history.
- Retain master originals and publish resized/optimized derivatives without destroying source.
- Asset status: private draft → reviewed → approved for an edition; a reused asset still retains its license/constraints.

### 4. Story Bible and editorial tools
- Project reference entries: characters, locations, timeline, terms, visual references, continuity notes.
- Editorial checklist: missing sections, broken links, alt text, overflow, attribution, language, age/content warnings.
- Human review comments anchored to stable content identifiers; resolved/unresolved states.
- No speculative automatic claims of factual correctness.

### 5. Preview, validation and release
- Build a deterministic candidate artifact with manifest, content, assets, integrity digests and capability requirements.
- Validation levels: structural / security / content-rights / reader-compatibility / visual-experience.
- Reader preview opens the exact candidate through the supported real Reader code path. Screenshots are supportive evidence, not a substitute for functional checks.
- Each approval references a specific candidate digest. Any post-approval change invalidates that approval.
- A distinct authenticated Publish action promotes only the approved digest; failures are atomic and recoverable.
- Publication history lists edition, version, timestamp, validation evidence, who approved and who released.
- Unpublish from catalog and rollback promotion do not erase user-owned offline copies.

### 6. Reader catalog integration
- Catalog contains only public eligible releases; no drafts or editor notes.
- List metadata + cover thumbnail + language + supported formats + compatible Reader versions.
- Reader fetches or imports a manifest plus assets, verifies digests, checks supported capabilities, downloads atomically, caches offline and opens in appropriate engine.
- Reading progress/notes belong to Reader, never overwritten by Studio; updates require version-aware anchor migration and rollback protection.

## Stage 2/3 production expansions
- Rich manuscript revision compare, multiple covers, series/volume organization.
- Panel editor with balloons, panel ordering, crop/bleed and native portrait/landscape preview.
- Enhanced Story Bible and continuity checking with citations to project materials.
- Reusable templates, in-app tutorials, layout presets and assisted exports.

## Optional later expansions (not approved for V1)
- Premium specialized agents and additional model integrations beyond the first autonomous workflow, with transparent cost and privacy settings.
- Multi-creator submissions, collaborative roles, editorial assignments, review queues (see CREATOR_ECOSYSTEM_FUTURE.md).
- Language variants with per-language approval.
- Audiobook and synchronized narration, interactive branching fiction.
- Paid titles, storefront operations, reader opt-in analytics and scheduled serialized releases.

## Behavior / quality requirements
- Empty state explains one clear next step; advanced settings emerge contextually.
- Desktop-first authoring with accessible keyboard workflows; tablet support after interaction testing; phone may be review-only initially.
- Offline creation should remain possible; sync conflicts cannot silently discard edits.
- Debounced auto-save backed by transaction-safe local storage; recovery of interrupted drafts.
- Publication must remain blocked if invalid assets, rights state or Reader capability evidence is missing.
- Show meaningful structured errors with fixes; never report success based only on a click.
- Every release must be reproducible from an immutable snapshot and pinned toolchain.

## Product decision points
Define local-versus-cloud AI execution economics, safe job orchestration and budget enforcement; complete the autonomous short-story MVP before expanding to more formats. Establish first Reader compatibility baseline and first comic delivery strategy; cloud providers are opt-in rather than an assumption.
