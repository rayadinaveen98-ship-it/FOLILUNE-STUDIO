# Functional Specification — FOLILUNE Studio
**Status:** Proposed; not implemented. All implementation phases are subject to acceptance gates.

## Core user journey
Create project → choose publication format → author and assemble → attach rights/provenance → revise → run checks → preview exact candidate → request editorial approval → owner approves a specific revision → owner separately releases → catalog indexes immutable artifact → compatible Reader opens or clearly rejects it.

## V1 capabilities (first vertical slice)
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
- Explicitly invoked AI assistants: writing critique, outlines, comic breakdown, alternate copy, illustration generation. All suggestions remain drafts and show provenance/cost.
- Collaborative roles, editorial assignments, review queues.
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
Define the initial editor and offline storage approach after tests; set first Reader compatibility baseline; approve first real comic delivery strategy; prioritize AI/cloud only after core editorial-to-reader flow works.
