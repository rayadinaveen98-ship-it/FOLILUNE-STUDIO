# FOLILUNE Studio — Daily Factory v0.5 Engineering Checkpoint
**Date:** 2026-11-11 · **Status:** Private engineering prototype; no real unattended content creation or publishing deployed.

## Purpose
Advance the locked master roadmap toward automated daily original fiction production, without requiring the product owner to install or choose models in the finished product. v0.5 supplies a deterministic daily editorial slate, an at-most-once reservation journal and an internal managed-inference adapter. This is **not** a complete, live or self-hosted AI model, and **cannot produce ten real stories/day today**.

## Implementation
- `engine/daily-factory.mjs`: owner-authorized daily capacity 1–10, date-specific idempotency keys, genre/language rotation, Asia/Kolkata time support, max-calls admission rules, private per-date journal. Journal stores claimed slots and completed/failed statuses; an uncertain slot blocks further automatic work pending reconciliation. Each slot calls the existing private idea→draft→critique→revision→EPUB workflow with one-work batches.
- `engine/daily-cli.mjs`: `plan`, `status`, `run-once`, `serve`. The **serve** process checks at local editorial time every minute only while it remains running; it does not create a cloud service or survive a machine being off. Scheduling defaults OFF. A `run-once` is idempotent for a completed day and never reruns ready slots automatically.
- `fixtures/daily-policy.example.json`: disabled policy with theme, language/genre slate, daily cap and 07:00 India time example. Intent to enable *private draft production* is explicit and does NOT authorize publishing.
- `engine/managed-provider.mjs`: internal server-side OpenAI-compatible JSON chat gateway, controlled by environment-only credentials and explicit paid-draft opt-in. It is not exposed to browsers or the unauthenticated localhost console, and is not a model trained from scratch. It is tested using a fake HTTP responder; no real remote API calls were made.
- Live managed **daily scheduling is intentionally blocked** pending persistent billing reservations, actual reconciliation with provider invoices and secure owner authorization. The example policy does not execute anything automatically. Simulation is never eligible for publishing.

## Tests executed in this environment
- `npm test`: **33/33 passing** (19 prior + 14 new tests) including policy authorization, deterministic slate, timezone, simulated two-story production, idempotency on rerun, crash/claim fail closed, managed gateway request formatting, secrets confined to server header and hostile endpoint rejection.
- `python tests/server-integration.py`: PASS with real local HTTP server and synthetic provider.
- `python tests/queue-integration.py`: PASS with real local HTTP server and synthetic provider.
- `node engine/daily-cli.mjs plan fixtures/daily-policy.example.json 2026-11-12`: produced three deterministic private test slots and reported **enabled=false**.

## Deliberate limitations
- **No real trained AI generation** was executed; only synthetic provider integration. No story quality, language fidelity or novelty claim.
- Live managed provider requires external trained inference/compute, credentials, charges and provider-specific compatibility testing. No paid request was sent.
- The managed gateway does not yet have production-grade metered budget enforcement, so daily paid mode is blocked even if env credentials are present.
- CLI run-once and foreground scheduler are NOT a persistent hosted daemon or a 24/7 service.
- Existing v0.4 owner console remains local and unauthenticated. **Never expose it to the public internet.** No paid endpoints added to it.
- No new novels, illustrations, comics, owner authentication, catalog sync or Reader publishing. Reader repository untouched.
- `maxDailyModelCalls` is a request-count ceiling, **not a cost guarantee**. Stage 1 secure spend ledger, vendor reconciliation and infrastructure are still needed.
- Existing v0.4 EPUBCheck, browser real restart and Reader compatibility blockers remain.

## Try the private factory planner safely

```sh
node engine/daily-cli.mjs plan fixtures/daily-policy.example.json 2026-11-12
node engine/daily-cli.mjs status fixtures/daily-policy.example.json 2026-11-12
npm test
```

No models, credentials, spend or production jobs are required for these three commands. By design, the example policy has `enabled: false`. To run synthetic experiments, **only in an isolated development copy**, set `enabled: true` and retain `mode: "simulated"`, then run `node engine/daily-cli.mjs run-once fixtures/daily-policy.example.json 2026-11-12`. Output is clearly synthetic and private. Re-execution on the same day will not repeat a completed slot. Never enable paid scheduling from this prototype.

## Next accepted engineering tasks
1. Authenticated owner-only private backend with durable SQL job/outbox and actual model gateway integration.
2. Provider usage and cost metering with persistent reservations; enforce approved daily and monthly billing ceilings. Demonstrate stop behavior at limit.
3. Real quality study with independently evaluated full original stories in Telugu and English; complete length/plot criteria.
4. One validated owner-approved story into a separate Reader test catalog, no public releases until tests and permission checks pass.
5. Only then capacity ramp 1→3→5→10 real candidates/day; novels, illustration and comics follow format-specific pipelines.