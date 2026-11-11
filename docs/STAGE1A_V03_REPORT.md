# FOLILUNE Studio — Stage 1A v0.3 Private Autonomous Queue
**Date:** 2026-11-11  
**Status:** Implemented and locally tested; first real-model content-quality run still outstanding. No public publishing, approval service, or Reader integration.

## Why this change
The owner explicitly asked for the Studio to invent original premises and produce complete literary content rather than primarily provide a manual authoring editor. Stage 1A v0.3 brings the previously CLI-only automated private idea queue directly into the authoring console.

## Delivered
- UI: independent private **Let Studio invent the premise** creative-direction form, language, genre, chapter count, 1–2 works, model/test mode, call budget and explicit per-run authorization.
- Local HTTP: `POST /api/queue/start` and `GET /api/queue`, no public publication endpoint; queue progress and bounded in-process status.
- Existing engine integration: story ideation, plan, Story Bible, full prose drafting, editorial revision, structured manuscript, experimental EPUB. No fake 'sample narrative' claims when synthetic provider selected.
- Persistent queue history: local `output/private-production-ledger.json` survives a local server restart; open completed jobs and use the existing chapter lock/revision and download tools.
- Duplicate idea rejection by exact normalized premise digest. This is not a semantic-similarity or copyright check.
- The server blocks parallel queue/manual/revision requests; queue batch has a separate file lock. Ownership and publishing remain deliberately local-only.
- UI fix: artifact download links now remain genuinely hidden until review output is ready.

## Tests actually run here
1. `node --test`: **15/15 PASS** existing engine and owner-review tests using synthetic provider and local HTTP model stub.
2. `python tests/server-integration.py`: **PASS** real local Node HTTP integration for direct brief, locking, targeted revision, review artifact download and host rejection.
3. `python tests/queue-integration.py`: **PASS** real local Node HTTP integration for owner authorization, invalid batch bounds, single-job concurrency, synthetic 2-work batch (first ready, exact second duplicate blocked), EPUB, no publish endpoint, persisted history after a stopped/restarted server, repeated duplicate suppression.
4. `python tests/queue-ui-smoke.py`: **3/3 PASS** headless Chromium widths 1440×900, 960×760, 390×844, with simulated fetch responses. Checked explicit consent, valid bounded payload, disabled duplicate starts, production history and opening completed review. This is NOT a full real-backend browser integration test.
5. JavaScript parsing checks: PASS; clean ZIP packaging to follow.

## Deliberate limitations
- No installed Ollama model was invoked; no proof of story quality, multilingual consistency or novel-length reliability.
- Synthetically generated text is deliberately repetitive and only demonstrates orchestration, not usable literary content.
- A progress polling loop runs while the local console is open. This is not a cloud/background service: closing the Node server stops its jobs.
- A crashed batch may retain a `.batch.lock`; automatic stale-lock cleanup and resume policy remain engineering gates. Existing completed private drafts are not automatically published or deleted.
- Exact digest comparison cannot catch paraphrased duplicates and does not establish originality or publication rights.
- EPUBCheck and actual Reader import/resume compatibility remain unverified; all generated EPUBs are review-only artifacts.
- Server listens only on `127.0.0.1` and is not hardened for multi-user or remote access. No secrets, manuscripts or private ledgers should be uploaded to the public GitHub repository.
- No creator uploads/marketplace/AI image generation or comic layout generation yet.

## Next gate
Real local-model run with quality review and language fidelity; robust job recovery and semantic-quality review; then official EPUBCheck, actual Reader compatibility and secure owner-only publishing. No change to FOLILUNE Reader repository.
