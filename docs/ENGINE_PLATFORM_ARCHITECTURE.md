# FOLILUNE — Production Platform Architecture
**Status:** Technical target, NOT deployed. **Date:** 2026-11-11.

## 1. Logical systems
1. **Editorial Scheduler** — runs a pre-approved daily programming calendar and bounded content quotas; no run without an enabled policy.
2. **Creative Orchestrator** — persistent state machine creates original premise, outline, Story Bible, chapters, critique, revision tasks and assets; forks content-specific pipelines.
3. **Generation Gateway** — server-side interface for text, images and review tasks. Studio owner sees “FOLILUNE Engine”, not model selection menus. Provider SDKs are replaceable internal adapters; keep keys out of browsers/Reader/repos.
4. **Production Workers** — prose, novel continuity, illustration direction/generation, comic composition/lettering, translations and format packing.
5. **Quality & Rights Service** — structural, security, provenance, originality-similarity alerts, repetition, accessibility, genre/language and reader-fidelity checks, with independent critical reviewer sampling.
6. **Private Review Service** — full candidate and comparative revisions, issue annotations, frozen preview, owner decision, approval audit.
7. **Publication Service** — immutable candidate digest, rights clearance, Reader capability compatibility, authenticated approval, idempotent atomic catalog pointer promotion, rollback and unpublish.
8. **Public Catalog/Delivery** — only approved releases, metadata search/filters, signed/integrity-checked assets, offline downloads and reader-safe versioning.
9. **Reader Integration Adapter** — separate change request/test harness against FOLILUNE Reader; maintain independence of the Reader repo and UX.
10. **Creator Gateway (future)** — creator signup, authenticated workspaces, rights verification, moderation, submissions, limited editorial permissions and eventually royalty ledger.

## 2. End-to-end data flow
Approved editorial policy → time-triggered scheduler → production order/unique idempotency key → private job queue → story premise → structure/bible → draft sections → critic reports → targeted rewrite loops → (visual direction + image assets + lettering as applicable) → format assembler → reproducible QA + preview → READY_FOR_OWNER_REVIEW → owner review and approval → publisher authorization/transaction → immutable release + catalog index → Reader catalog sync/download.

Each stage outputs immutable snapshots and typed status transitions. Do not put model-written arbitrary code or HTML directly into the Reader.

## 3. Proposed minimal service stack
**Near-term single-tenant hosted target:** Node.js + TypeScript service, authenticated owner-only React/TypeScript Studio, a durable SQL store for job/project/approval metadata, object storage for manuscripts/images/epubs, a transactional outbox + durable queue backed by SQL for first operating volume, worker processes, provider abstraction and secure secrets store.
- Reuse existing versioned draft model and EPUB packager only after audit, conformance/rights tests.
- Current v0.4 local Node code should become a tested orchestration library, not be exposed to the internet as-is.
- Avoid prematurely splitting into many microservices. Isolate security-sensitive publication/approval boundaries and model/asset parsers.
- Public catalog can initially be a static HTTPS index with immutable artifacts plus a transactional promotion service.
- Future distributed/multi-tenant scaling may need managed queue, stronger isolation, rate limits, tenancy-aware billing and webhooks; decide on measured evidence.

**Hosting choice is not locked.** Managed inference means compute and API costs; local generation may reduce per-call charges but requires owned always-on hardware, operations and power. No free unlimited inference is assumed. Do not expose the localhost v0.4 server publicly; it has no public authentication.

## 4. State machine and invariants
order: proposed → authorized → queued → running → [paused | blocked_budget | blocked_quality | failed_retryable | failed_terminal] → ready_for_review → [changes_requested | rejected | approved] → release_pending → published / publish_failed / withdrawn.
- Every transition writes an event and a versioned artifact reference in one durable transaction/outbox.
- Retry with idempotency key; stage leases, expiry and heartbeats recover worker crashes without double publishing.
- At most configured retries per stage; no indefinite generation loops; no silent changes to human-locked revisions.
- A partial book is always labeled partial; no export/release as a finished book.
- Approval tied to exact candidate digest + validation report digest. Any mutation causes new candidate and invalidates approval.
- Only authenticated owner/publisher authority can publish. An explicit Approve & Publish action may combine owner intent in UI, but audit and backend checks remain distinct.
- Disabled scheduler defaults to NO JOBS; disabled public publishing defaults to NO RELEASES.

## 5. Core domain objects
PublisherPolicy, EditorialCalendar, ContentSlot, GenerationOrder, ProductionJob, StageAttempt, ProviderInvocation, PromptTemplateVersion, ModelVersion, StoryBible, Scene/Section, Work, Series, Episode, Edition, Asset, AssetRightsRecord, Revision, CandidateBuild, QAReport, OwnerDecision, Release, CatalogEntry, ReaderCapabilityProfile, AuditEvent, CreatorWorkspace (future).
Each has stable IDs, schema version, timestamps and clear owner/tenant isolation fields. Distinguish Work (intellectual identity) from Edition (language/format) and Release (specific immutable artifact).
Never log private manuscript body in plaintext operational telemetry. Encrypt sensitive at rest and transit; explicit export/backups/retention.

## 6. Generation gateway contract
generate({jobId, stage, role, briefDigest, sourceArtifactRefs, language, maxInputTokens, maxOutputTokens, maxCostUnits, modelPolicyId, deadline, idempotencyKey}) → {typedOutput, usage, provenance, providerRunId, safetyFlags, sourceDigests, errors}.
- Gateway selects the configured provider invisibly under budget/quality policy; owner sees an understandable “generation capacity/cost” and no model setup.
- This is orchestration built by FOLILUNE, NOT a base language model trained from scratch. Some working inference engine and computing resources are indispensable.
- Provider timeouts, retries and content policy failures must be explicit and recoverable.
- Never send private drafts to third parties without owner consent and disclosure; model/data retention terms must be reviewed.
- Output is untrusted: validate typed schemas, length/character rules, no remote URLs/scripts, language integrity and asset metadata before moving forward.
- Track token/image usage and projected spend per stage, per work and per day; enforce hard caps **before** calls, with a reserve for unknown charges.

## 7. Daily production capacity
One content slot = one intended candidate in a format/genre/language/length band. Start daily quota at 1, then 3, 5, and only after quality/cost/operations evidence, 10 short-story candidates/day. Slots can be skipped for quality/budget or provider failure; NEVER fill them with placeholders.
For 10 short stories/day at 1,500–3,500 words each, planned output is approximately 15,000–35,000 prose words/day (450,000–1,050,000 over a 30-day period), before critique, discarded revisions and translation. This is an engineering *volume model*, not a performance promise.
The daily scheduler must vary genre/language/story mechanics, retain review capacity and manage concurrent jobs with a global work budget. A strict separation between candidate generation and publication allows overnight production without unintended uploads.

## 8. Reader publication boundary
- EPUB 3 for compatible reflowable stories and suitable illustrated works; verify with EPUBCheck and actual Reader rendition, localization and accessibility. Latest production-ready EPUBCheck as of this plan is 5.4.0 (check when running).
- Comics need a verified paginated/CBZ or richer image+transcript Reader profile, never assume EPUB.js comic-demo screen implies compatibility.
- Catalog uses publishable metadata and immutable integrity digests only, not private draft data. Reader caches/downloads atomically and preserves its own progress/bookmarks, with uncertain migration surfaced.
- Existing Reader docs/prototype prove only limited EPUB behavior; no published Studio-to-Reader connection exists.

## 9. Security and reliability
Threats: compromised publisher credential; forged approvals; prompt injection from submitted text/images; copyright/rights mistakes; harmful or misleading children's content; asset parser attacks; duplicate publication; provider outages; unbounded billing; creator tenant leakage; catalog rollback corruption; loss of drafts.
Controls: server-side RBAC and step-up authentication for publish, idempotent release transactions, sandboxed parsers and allowlisted content, strict image/EPUB MIME checking, WAF/rate limits for future creator portal, secrets rotation, immutable audit, backups + restore drills, billing caps + alerts, kill switches for generation and publication, content rights register.
**Availability SLOs and compliance claims must be established by testing, never invented.**

## 10. Required environments
Development (synthetic tests), Private staging (actual model + authentic reader fixture tests), Pilot catalog (limited approved users), Production (public Reader release). Separate credentials, buckets and catalog indices. Synthetic work is never eligible for public promotion.
