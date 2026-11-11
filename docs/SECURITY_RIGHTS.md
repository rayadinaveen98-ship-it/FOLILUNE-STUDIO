# Security, Privacy, Content Rights & AI Policy
**Status:** Proposed security baseline; requires implementation and threat-model validation.

## Safety boundaries
- Studio is private. Only authorized creators can read unpublished manuscripts, assets, story bibles, editorial notes, validation reports and candidates.
- The repository is public; never commit secrets, personal drafts, unpublished manuscript bytes, licensed non-public artwork, tokens, project backups or cloud credentials.
- Reader receives only approved publication assets and public-facing metadata, never Studio account identifiers or private review notes.
- Enforce role and authorization checks on the server or secure local owner action, not merely by hiding UI buttons.
- Require a fresh authenticated owner action for release; log it with content digest; an approval alone is insufficient.

## File import threat model
Untrusted image, EPUB, archive and document uploads can contain scripts, traversal paths, malformed metadata, compression bombs, remote references and vulnerable-parser payloads.
Required defenses:
- Allowed format/type and size limits validated by file content, not filename alone.
- Safe filenames/IDs; reject absolute paths, traversal, symlink escapes and duplicate-path collisions.
- Sandboxed parsing/conversion with memory, CPU, decompression and time quotas; do not execute embedded scripts or fetch remote resources automatically.
- Validate and sanitize structured text and HTML; preserve semantic content while rejecting active payloads.
- Inspect image dimensions, decode/re-encode derivatives where useful while retaining private masters.
- Review third-party dependency advisories, licenses and server security configuration.
- Use checksums/signatures and allowlisted MIME types on release asset delivery.
- Never promote a build whose security checks are missing or failed.

## Intellectual property and provenance
Every text/image/voice/translation asset needs author/owner, source, rights basis, approved uses, restrictions and provenance. Unknown rights status blocks publication.
- Support original author-owned content, genuinely public domain with jurisdiction check, and adequately licensed or permissioned content.
- A familiar folktale or fable may be public domain while a particular translation, illustration, retelling or recording is protected.
- Creative adaptations of existing works require separate rights evaluation.
- AI-generated assets need prompt/provider/process provenance and commercial-use/license review; do not claim originality or exclusive ownership automatically.
- Do not produce and publish imitation copies of copyrighted books, character designs or identifiable living artists' protected material.
- Record translation permissions and release authorization separately by edition.
- Maintain takedown/correction processes if the catalog becomes public.

## Reader privacy
- Reader progress, annotations, highlights and private imports stay in Reader's domain; Studio must not collect them by default.
- Any future analytics are aggregate and opt-in with clear purpose and retention limits.
- Public catalog access must not expose whether a particular person reads a particular work.
- Support deletion/export and minimal collection; avoid embedded tracking in content packages.

## Optional AI safety
- AI feature requests are explicit and reviewable; never send private drafts to third-party AI without clear disclosure and approval.
- Show estimated cost/provider whenever remote inference is involved and allow a fully non-AI workflow.
- Keep generation outputs as proposals in a revision, not publishable canonical material until reviewed.
- Document provenance and editing history; do not claim zero errors or visual continuity guarantees.
- No automated full book/graphic novel publication pipeline in V1.

## Reliability and audit
- Protect against stale approvals and replay with candidate digest and idempotency keys.
- Sign authorization and validate session freshness, apply least privilege, and keep immutable audit logs where backend exists.
- Backups must be restorable, encrypted when containing private works, and tested before promising recovery.
- Emergency rollback should never modify the bytes of a published release; change catalog pointing instead.

## External references
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- W3C EPUB 3.3: https://www.w3.org/TR/epub-33/
