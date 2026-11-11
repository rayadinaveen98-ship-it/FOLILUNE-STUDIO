# Technical Architecture — Proposed
**Status:** Architecture proposal, not an implemented stack or deployment.

## Logical boundaries
1. **Studio UI (local-first):** project dashboard, typed editors, local working copy, Story Bible, artwork assets, revision tools, review workflow and Reader preview launcher.
2. **Authoring domain service:** stable IDs, structural rules, project versioning, document conversion, content derivation; no renderer-specific HTML as the source of truth.
3. **Asset pipeline:** safe imports, media inspection, orientation/crop intent, original preservation, derived files, cryptographic checksums.
4. **Build/validation worker:** deterministic packaging, archive safety checks, rights/metadata checks, accessibility reports, Reader capability validation, signed integrity index.
5. **Approval/release service:** authenticated owner action, immutable candidate lookup, atomic catalog promotion, rollback and audit history.
6. **Catalog/delivery plane:** approved public metadata and immutable artifact URLs; suitable for offline downloads and cache validation.
7. **Reader (separate repository):** resolves compatible catalog entries, downloads, verifies and renders through its independent ReaderEngine adapter.

## Data flow
Creator changes → local draft → revision snapshot → candidate builder → validators + evidence → exact Reader preview → owner approval (candidate digest) → explicit owner publish → catalog entry + immutable artifact → Reader fetch/import.

## Technology candidates; defer final selection
- Frontend: TypeScript + React/Vite as one feasible desktop-first web/PWA stack; only select after prototype and accessibility tests.
- Authoring: a structured document editor (ProseMirror/Tiptap or equivalent) with a constrained portable schema, not uncontrolled HTML.
- Local drafts: IndexedDB or equivalent persistent storage with transactional autosave and exportable recovery snapshots; test quotas, private mode, interruptions and cross-browser behavior.
- Data services if needed: authenticated API with SQL transactional metadata and object storage for assets/release artifacts. PostgreSQL and S3-compatible storage are candidates, not commitments.
- Build worker: sandboxed job producing deterministic packages, validation reports and content hashes. Content processing must be isolated from public API processes.
- Release delivery: versioned static files and an index/cache; a CDN is optional until real traffic justifies it.
- Preview: a compatibility harness importing the exact candidate into a pinned Reader runtime/build; rendered screenshots alone are insufficient.
- Auth: managed identity or equivalent with server-side role enforcement. No admin secrets, signing secrets, or publishing tokens in the browser bundle.
- AI: optional adapters executed on explicit user request; no model or paid provider dependency in the core flow.

## API boundary (candidate resource model)
- POST /projects ; GET /projects/:id ; PATCH /projects/:id
- POST /projects/:id/revisions ; GET /revisions/:id
- POST /editions/:id/candidates ; GET /candidates/:id
- GET /candidates/:id/validation ; POST /candidates/:id/validate
- POST /candidates/:id/approval ; POST /candidates/:id/release
- GET /catalog ; GET /catalog/:workId ; GET /releases/:id/manifest
These are design targets, not active endpoints. The client must not be able to bypass an authorization or validation check by calling a release endpoint directly.

## Publishing transaction
1. Confirm candidate hash, provenance, validator snapshot, compatible Reader profile and owner authority.
2. Stage immutable package and asset digests in private storage.
3. Approval is recorded against the staged digest.
4. On separate Publish action, transactionally insert release + update catalog pointer only if all gates still pass.
5. If promotion fails, keep catalog at previous release, report actionable failure and allow idempotent retry.
6. Audit events capture responsible identity, revision, digest, outcome and time.

## Compatibility and isolation
- Studio's canonical content contract is versioned independently from Reader runtime/renderer versions.
- Reader must explicitly advertise capabilities, e.g. prose-epub3, illustrated-epub, comic-pages-v1; no blanket 'all EPUB' assumption.
- A feature requires proven renderer behavior and a fallback strategy before it can be marked supported.
- EPUB conversion and comic delivery use separate format adapters; don't force comics into EPUB reflow if quality requires image-page rendition.
- Reader may import through a temporary adapter or file handoff first; no live public catalog is needed for the initial proof.
- Maintain a compatibility matrix of Studio contract version × artifact type × Reader build × device/test results.
- No cross-repository code updates in this project unless requested and approved.

## Failure/recovery rules
- Editing and autosave are separate from publication; store periodic recoverable snapshots.
- Offline edits queue locally; reconnect is conflict-aware (compare revisions, never last-write-wins for manuscripts).
- Failed conversion leaves prior candidate/release untouched.
- Partial downloads never replace valid offline Reader editions; check full integrity before promoting local cache.
- Keep prior published version available for explicit rollback.
- Record test fixture versions and dependency licenses.

## Operational constraints
Start with zero mandatory recurring cloud bills. Paid storage/AI/runners are opt-in only after cost and quota review. No direct publication to a live user catalog during early architecture and proof stages.
