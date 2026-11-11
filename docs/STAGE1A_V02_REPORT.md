# FOLILUNE Studio Stage 1A v0.2 — Owner Review and Draft Quality
**Date:** 2026-11-11 · **Scope:** Separate Studio repository only · **Status:** prototype, NOT production/publishing ready.

## Delivered
- `engine/review.mjs`: job-lock-coordinated section lock/unlock and owner-directed rewrite of a selected chapter. Requires expected review version to prevent stale edits; respects provider/model and job model-call budget.
- Versioned, immutable review artifacts: `review-draft-vN.json`, `review-only-vN.epub`, `qa-vN.json` with the active version and SHA-256 recorded in `state.json`. Initial legacy review files remain untouched.
- Stronger failure protection: a failed/rejected revision consumes its bounded call attempt but leaves the last finished review, chapters and EPUB intact.
- `engine/quality.mjs`: deterministic short-section, high-repetition and placeholder/instruction leakage signals. Explicitly **does not verify** literary merit, originality, rights, continuity or real Reader fidelity.
- Local server `/api/jobs/:id/lock` and `/api/jobs/:id/revise` POST routes, revised GET status and fixed download endpoint JSON double-encoding bug.
- Minimal owner-review UI in existing Studio Console: lock buttons, chapter selector, revision instruction, quality warnings. No app-wide redesign.
- HTTP Host check to reduce DNS-rebinding exposure; server still binds only `127.0.0.1` and must not be exposed to the internet.

## Verified locally
- `node --test`: **15 / 15 passed** (10 original engine tests + 5 review/quality tests).
- `python tests/server-integration.py`: **PASS** using real local Node HTTP and a synthetic test provider. Created a story, polled results, checked locked chapter, requested targeted rewrite, checked review v2, fetched latest draft/EPUB and rejected a bad Host header.
- `node --check`: all new and modified JS modules checked.
- The simulated provider creates repetitive test text on purpose; it is **not** evidence of real AI literary quality.

## Unverified / blockers
- No actual Ollama model is installed in the execution environment. Real local-model original story quality, token budgets and running-time reliability remain untested. A stubbed Ollama HTTP adapter was already unit-tested in v0.1.
- Formal EPUBCheck and exact FOLILUNE Reader rendering are still unverified. EPUBs are private experiments, not releases.
- The UI was not independently verified against browser accessibility/device matrix in this update. User visual approval and a real-device test remain open.
- Restart persistence for the earlier standalone Studio and cloud orchestration are not yet verified.
- No authenticated approval service, public catalog, comic renderer, finished artwork, hosted production, external creator submission or public publishing capability exists.
- Model-generated text could be inconsistent or inaccurate; deterministic warnings cannot certify editorial quality.

## Privacy & compatibility
No drafts, story outputs, secrets or private model artifacts are placed into public GitHub. `output/` is ignored. All changes are confined to `FOLILUNE-STUDIO`; the Reader repository has not been changed.

## Next step
After owner review of v0.2: add the explicitly authorized automatic idea-queue flow to the console, then test a real local model under cost/usage limits, tighten model-output schemas and retry policies, and prove EPUB/Reader compatibility. Approval-to-catalog publishing remains gated behind separate security and compatibility work.
