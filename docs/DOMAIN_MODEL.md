# Domain Model & Lifecycle
**Status:** Proposed domain model. Database structures are not implemented.

## Core entities
- **Workspace:** the owner-controlled production environment and permissions.
- **Project:** the creative work in progress; owns outline, scenes, pages, Story Bible, assets and project settings. Never directly public.
- **Work:** canonical intellectual creation and its stable work ID, independent of any language or published edition.
- **Component:** structured chapter, scene, prose block, illustration, comic page/panel, narration cue or future interaction node; stable identity across edits where semantics remain the same.
- **Asset:** original media or derived artwork with checksum, provenance, creator, license, rights restrictions and alternative text.
- **StoryBibleEntry:** structured character/location/world rule/timeline reference, optionally tied to evidence or approved artwork.
- **Edition:** curated presentation of one work for a particular language, medium, accessibility approach or audience; references a revision snapshot.
- **Revision:** immutable editorial checkpoint (source content and assets) created from editable drafts.
- **CandidateBuild:** immutable export from exactly one revision and one edition, identified by content hash plus toolchain version.
- **ValidationReport:** immutable results for structure, security, rights, accessibility baseline and Reader compatibility, anchored to a candidate hash.
- **Approval:** owner intent for one exact candidate and validation report set; approved snapshot cannot be changed.
- **Release:** a publication event connecting a candidate hash to a version, catalog visibility and audit metadata.
- **CatalogEntry:** public reader-facing metadata pointer to one compatible release, not a mirror of the private project.
- **ReaderState (Reader-owned):** reading location, notes, bookmarks and offline cache; Studio must never assume ownership of this data.

## Identity and versioning
- Use opaque stable identifiers for work, edition, component, asset, candidate and release.
- Separate human-friendly edition version (e.g., 1.0.0) from content-addressed candidate/build digest.
- Asset filenames, titles, page order and chapter numbers can change; IDs should not change when content identity is retained.
- Adding a translation creates a new edition. A comic adaptation becomes a distinct edition/derivative with its own rights verification.
- A republished fix creates a new release; no in-place mutation of previously distributed package bytes.

## Workflow state machines
**Project:** active → archived → restored; delete requires explicit destructive confirmation and a recoverability plan.

**Draft revision:** editing → revision snapshot → candidate build.

**Candidate:** built → validating → blocked OR ready_for_review → approved OR changes_requested → ready_to_publish → published.
- Editing after building produces a new candidate, not a modification to the existing candidate.
- An approval cannot follow a failed validation or reference a different candidate hash.
- Publication is a separate audited action after approval.
- A revoked or superseded candidate remains traceable.
- An already-published release may be removed from discovery or superseded; previously delivered offline artifacts may remain on readers' devices.

## Ownership invariants
1. Private working content never becomes catalog visible solely due to autosave, sync, preview or review.
2. Every public release has an accountable publisher, approval, rights check, candidate digest, validator version and compatibility evidence.
3. A remote reference cannot appear in the publication unless included in the asset integrity and allowlist checks.
4. Migration from one edition to another never silently maps annotations/reading progress when anchors cannot be verified.
5. Public catalog IDs and canonical work IDs must not expose account secrets or private paths.

## Potential relational groups
accounts, workspaces, workspace_roles, projects, works, draft_components, draft_assets, story_bible_entries, revisions, editions, candidate_builds, validation_reports, approvals, releases, catalog_entries, audit_events.

For first prototype, these domain concepts may live in local structured storage; this list does not mandate a hosted database.
