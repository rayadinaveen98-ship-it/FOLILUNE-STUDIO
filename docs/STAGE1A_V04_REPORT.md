# Stage 1A v0.4 — Real Model Preflight and Bounded Quality Repair
**Date:** 2026-11-11
**Status:** local executable prototype; no production model evaluation or Reader publishing.

## Implemented
- `engine/model-preflight.mjs`: loopback-only, timeout-controlled Ollama `/api/tags` model discovery and exact installed-model check before starting real work. No story prompt is transmitted during preflight.
- `GET /api/models`: local console diagnostic, with clear 503 response when Ollama is unavailable. Console offers **Check local AI models**.
- `engine/runner.mjs`: new `quality` stage after editorial revision. Heavy repetition or apparent instruction/placeholder leakage blocks private EPUB packaging and triggers **at most two** targeted repair calls within the existing job call budget. Persist stage checkpoints, repair attempts and QA outcomes. Unresolved problems yield `needs_attention`, not a false-ready EPUB.
- `engine/review.mjs`: reject owner-directed rewrites that introduce blocking quality warnings; preserve the previous finished review artifact and version.
- Simulated test provider now contains varied but still **synthetic** paragraphs, avoiding false assertions that intentionally repetitive fixtures represent a good draft.
- Added `tests/quality-gates-v04.test.mjs` covering repair success, persistent failure, owner revision safety and local model preflight.

## Verification performed
- **19/19** Node built-in tests passed locally (including preflight against a loopback HTTP stub).
- Local HTTP `tests/server-integration.py`: PASS, including owner locks, rewrites, download and publishing endpoint lockout.
- Local HTTP `tests/queue-integration.py`: PASS, including batch authorization, duplicate blocking, history after restart and private EPUB output.
- Simulated-storage Chromium UI checks at 1440×900, 960×760 and 390×844: **3/3** PASS.

## Limitations / release blockers
- **No Ollama installation or real language model was available in this execution environment**; genuine writing quality, Telugu literary fidelity, latency and resource use are not measured. Ollama's request/response integration remains tested only against a loopback stub.
- Repetition heuristics can miss weak writing or generate false positives. They do not verify originality, actual continuity, copyright compliance, author intent, or literary merit.
- Only prose short stories are automated. Image generation, comic panel production and novel-scale continuity have not been implemented.
- Local run/batch model-call limits do **not** guarantee monetary cost, RAM needs, duration or energy use.
- Existing documentation's real IndexedDB browser restart, official EPUBCheck and exact Reader rendition still remain open gates.
- **No owner authentication, public approval/publish service, catalog or Reader connection exists.** There is no publishing endpoint.
- `FOLILUNE` Reader repository was not modified.

## Next gate
Run a real owner-approved short-story brief on a suitable local Ollama model with tracked token counts, length, continuity, revisions, errors, costs/resource usage and evaluation by the owner. Then adjust writing prompts and model settings with evidence; do not mark literary output ready merely because deterministic checks pass.
