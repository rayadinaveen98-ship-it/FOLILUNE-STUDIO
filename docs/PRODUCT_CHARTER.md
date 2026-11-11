# FOLILUNE Studio — Product Charter & Principles
**Status:** Proposed foundation, awaiting product-owner review. **Date:** 2026-11-11.

## Mission
Build an autonomous creative production engine that independently plans, writes, revises, illustrates, assembles and quality-checks original literary works from a user-approved brief or pre-authorized production queue. The human owner controls editorial direction, budgets, rights and final approval; no work is publicly published without a separate authorization. The manual writing workspace remains available as a correction and management tool.

## Product promise
A calm command center for commissioning complete original stories, fables, novels and comics instead of requiring a human to construct every chapter or panel by hand. A capable autonomous engine executes production workflows, records provenance and submits finished candidate works for owner review. The creator remains the final editorial decision-maker. The finished work should feel native to FOLILUNE Reader, not like an uploaded document bolted onto its UI.

## Product boundary
FOLILUNE Studio is the **private authoring and release control plane**. FOLILUNE Reader is the **public consumption plane**. A publishing service bridges them through a versioned contract and explicit release approval. Studio must not mutate Reader code or design by itself.

## Primary personae
1. **Owner/publisher (V1):** one authenticated person creates, reviews and authorizes publications.
2. **Contributing creator (future):** invited writer, illustrator, translator or editor with granular rights.
3. **Reader (separate product):** only accesses published, compatible editions; user-owned imported books remain private.
No marketplace or open creator signup in V1.

## Twelve founding principles
1. **Story first.** Creative quality, readability, editorial integrity and accessibility outrank novelty.
2. **Quiet surface, deep capabilities.** Progressive disclosure; don't present every tool at once.
3. **Format-aware, not format-locked.** Common publishing primitives, specialist authoring workflows for prose and comics.
4. **Autonomy is the core capability.** The engine performs production stages proactively within a controlled brief and budget. It must never silently overwrite approved or human-locked content.
5. **No implicit publication.** Save, review approval and public release are different actions.
6. **Reader fidelity is a release criterion.** Preview must use the actual supported renderer and the exact release candidate, not a decorative approximation.
7. **No regression by integration.** Studio and Reader evolve independently; integrations require explicit gates, compatibility checks and rollback.
8. **Portable, durable work.** Local export/backup, revision history, immutable published editions and recoverable drafts.
9. **Copyright and consent by design.** Provenance and rights clearance attached to every asset and contribution.
10. **Accessible and multilingual from the model up.** Unicode, language metadata, text alternatives and directionality; launch claims depend on testing.
11. **Private until published.** Drafts and creator notes never live in the public repository/catalog.
12. **Evidence before declarations.** Do not call a format, feature, APK or publishing flow complete without reproducible test evidence.

## Work that Studio supports
- Novel and short-fiction development: outline, chapters, scenes, notes, revisions.
- Illustrated fables: text-plus-image page/section composition.
- Comics: page and panel sequencing, artwork, lettering and reading direction.
- Story Bible: characters, relationships, visual references, timeline and continuity.
- Production: editorial checklist, rights registry, asset preparation, metadata, preview, approval, export, release and rollback.
- Core autonomous multi-stage creation (planning, drafting, editorial revision, illustrations where required, comic composition, QA and review). Optional later localization, narration, serialized release and broader collaboration.

## Explicit non-goals for first vertical slice
- Attempting a full-length professional comic or novel before the autonomous short-story production flow works. Autonomy is in scope from the first engine milestone; full-length quality must be staged.
- Built-in paid AI inference or reliance on paid cloud services.
- Self-publishing by the public, monetization/paywalls, social features.
- Replacing the FOLILUNE Reader renderer, changing its theme, or requiring Reader development to stop.
- Guaranteed lossless conversion of every document, every script, every comic layout and all reader annotations.
- Hosting unpublished manuscripts in a public GitHub repository.

## Success definition
**First engine milestone:** From one approved creative brief, automatically produce a complete multi-section short story with a Story Bible, at least one editorial review and targeted revision, traceable outputs, bounded costs, manual intervention controls and an experimental EPUB review artifact—without prompting the owner to write each chapter. **Next milestones:** produce an illustrated fable with actual artwork and a mini comic with readable assembled pages; add authenticated approval and verified Reader publication when compatibility gates are met. Longer novels and other works follow iteratively. If the comic renderer is unsupported, integration must be explicitly blocked until a safe adapter is demonstrated.

## Source of truth for automation
See [AUTONOMOUS_CREATION_ENGINE.md](AUTONOMOUS_CREATION_ENGINE.md). Future creator submissions: [CREATOR_ECOSYSTEM_FUTURE.md](CREATOR_ECOSYSTEM_FUTURE.md). Old references to 'AI later' are superseded by this core-product correction.
