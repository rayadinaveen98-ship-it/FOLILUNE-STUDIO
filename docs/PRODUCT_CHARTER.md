# FOLILUNE Studio — Product Charter & Principles
**Status:** Proposed foundation, awaiting product-owner review. **Date:** 2026-11-11.

## Mission
Make it possible for one creator to develop, produce, quality-check, approve and publish beautiful original literary experiences without having to operate a different production system for novels, short stories, illustrated fables and comics.

## Product promise
A calm and approachable creative workspace with powerful, discoverable tools beneath the surface. The creator remains the author and final decision-maker. The finished work should feel native to FOLILUNE Reader, not like an uploaded document bolted onto its UI.

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
4. **Author remains in control.** AI can assist, critique, propose or generate drafts; it cannot silently overwrite approved work.
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
- Optional later AI assistance, localization, narration, serial release and collaborators.

## Explicit non-goals for first vertical slice
- Generating a full professional comic autonomously.
- Built-in paid AI inference or reliance on paid cloud services.
- Self-publishing by the public, monetization/paywalls, social features.
- Replacing the FOLILUNE Reader renderer, changing its theme, or requiring Reader development to stop.
- Guaranteed lossless conversion of every document, every script, every comic layout and all reader annotations.
- Hosting unpublished manuscripts in a public GitHub repository.

## Success definition
First milestone: create one original short story, one illustrated fable and one miniature comic; preserve draft/revision history; validate each; preview on representative desktop/tablet/phone profiles; approve as owner; publish compatible immutable releases; import or deliver those releases to the Reader without disturbing its existing library. If the comic renderer is unsupported, integration must be explicitly blocked until a safe adapter is demonstrated.
