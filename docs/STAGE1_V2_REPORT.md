# Stage 1 v2 — Draft Reliability & Interchange Checkpoint
**Date:** 2026-11-11
**Status:** Implemented standalone prototype; Stage 1 NOT complete.

## Changes
- `prototypes/studio-stage1-v2.html` retains the v1 appearance and project flows.
- Ordered IndexedDB writes and edit generations prevent an older write from falsely marking newer edits as saved.
- Section changes happen immediately in memory; navigation between projects waits for current saves to finish.
- Failed saves show errors and can be retried. Browser navigation requests a warning while there are pending writes where supported.
- JSON backup batch import is a single transaction: either the batch commits or none of it does.
- The new **Draft model** button exports typed private document JSON (prose/illustrated/comic), retaining stable section IDs and language/Unicode.
- Legacy JSON backup import/export remains supported. Structured draft export is NOT EPUB, CBZ or Reader publishing.

## Tests performed
- Node inline-script syntax check: PASS.
- Content model `node --test tests/content-model.test.mjs`: **7/7 PASS**.
- JSON Schema draft 2020-12 validation: PASS; 3 original demo fixtures validated: PASS.
- Chromium simulated IndexedDB smoke flows across **1440×900, 960×760, 390×844**: **3/3 profiles PASS** for project/chapter edits, Telugu text, immediate chapter navigation, save, draft export, injected save failure and retry, injected batch import abort and retry, and horizontal overflow.

## Test limitation — important
This environment blocked browser navigation to file:// and localhost (`ERR_BLOCKED_BY_ADMINISTRATOR`). We used Chromium `set_content` plus an intentionally **simulated IndexedDB** implementation. This verifies UI and transaction-sequencing behavior against a model; it **does not prove** real IndexedDB persistence across browser restart, true crash durability, quota recovery, or physical-device behavior. Stage 1 is not accepted until real Windows/tablet storage tests are complete. No hosted site, APK, Reader package, catalog API, or publishing flow exists.

## Development boundaries
- `src/content-model.mjs`: proposed private draft converter/validator.
- `contracts/studio-draft.v0.1.schema.json`: authoring interchange, not a public publication contract.
- `contracts/publication-manifest.v0.1.schema.json`: separate proposed release manifest, still not implemented.
- Draft data and sample work are not automatically public, and no Reader code is modified.

## Next acceptance gates
1. Real browser reload/restart, offline, quota and backup-restore tests with an actual persistent origin.
2. Product owner visual review and explicit acceptance of Studio v2 workflow.
3. EPUB packaging experiment for prose and illustrated stories, then exact Reader fixture testing.
4. Comic renderer capability demonstration before any comic publication claims.
5. Secure rights/approval/candidate handling in the later publishing slice.

Do not mark Stage 1 complete solely because simulated browser smoke tests passed.
