# Experience Architecture
**Status:** Proposed information architecture; not a visual design approval.

## Top-level Studio
1. **Home:** one clear Continue action, recent projects, review queue; no overwhelming analytics.
2. **Library of Projects:** search/filter; projects/series/archived projects; no reader-side user libraries here.
3. **Project Workspace:** contextual tabs: Manuscript / Pages, Story Bible, Assets, Editions, Review & Publish.
4. **Release Center:** candidate builds, compatibility outcomes, approval history, published editions and rollback.
5. **Settings:** backup/export, accessibility, privacy, connection to staging catalog, publishing credentials and future team roles.

## Editing canvas layout
- Desktop: project outline left, primary canvas center, inspector/notes on demand right.
- Tablet: split pane with collapsible outline and inspector, large touch targets, stylus where appropriate.
- Mobile: review, comments and simple edits; complex page composition can be desktop-only until verified.
- Modes: Focus writing (distraction-free), Structure (chapters/pages), Design (illustrations/panels), Review (checklist and comments), Preview (actual Reader runtime).

## Progressive discovery
- Show contextual actions only after a project type and current workflow is known.
- Keep advanced publishing, AI, exporting, layout and accessibility tools one level below the primary creative action.
- Never hide critical errors, rights controls or the release state under progressive disclosure.
- Explain why validation blocked a release and how to resolve issues.

## Design relationship
Studio may use a complementary Modern Atelier visual language: quiet typographic hierarchy, clear surfaces, careful spacing and restrained movement. It should feel related to Reader but can use denser professional creation tools. No new visual direction is approved by this document. Reader's current design remains untouched.

## Example paths
**Prose:** Home → New Novel/Story → Outline → Chapter editor → Preview EPUB → Review → Approve → Publish.
**Fable:** New Illustrated Story → Compose text-image sequence → Validate image and alt text → Preview → Approve → Publish.
**Comic:** New Comic → Pages → Artwork and panel/lettering assets → Reading-order/scale preview → Review → Approve → Publish.
**Revision:** Published edition → Create new revision branch → Edit → Build new candidate → fresh approval → Publish new version.

## Accessibility interaction principles
Keyboard-operable authoring, screen reader labels, visible focus, reduced-motion settings, language tagging, non-color-only statuses, and large-screen responsive ergonomics. Complex visual tools need equivalent text-oriented workflows when practical.
