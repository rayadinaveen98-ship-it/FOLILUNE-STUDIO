# FOLILUNE — Capacity, Cost and Governance Framework
**Status:** Planning model, NOT measured production costs. **Date:** 2026-11-11.

## 1. Reality of computational generation
FOLILUNE can own its unique idea-generation logic, workflows, QA, datasets (where licensed), authoring tools, publishing contracts, layout, brand and Reader integration. But useful generative writing and illustration require a trained inference model and compute somewhere—an internal locally hosted model or managed remote AI inference. A ChatGPT consumer chat subscription does not provide a 24/7 unattended API for this app, and training frontier-quality language+image models entirely from zero is not a realistic zero-budget alternative.
The **owner UX** must hide provider complexity, exposing only one understandable creative engine, a daily target and spend/capacity setting. Engineers/operators can select, switch and audit backend providers.

## 2. Capacity assumptions and volume
Editorial target: 10 complete unique short-story **candidates**/day when validated, each 1,500–3,500 finished words in a recommended initial short-story lane. This implies ~15,000–35,000 finished prose words/day or ~450,000–1,050,000/month at 30 days, before discarded and rewritten words. Inference volume and storage increase with outlining, background briefs, continuity checks, editorial passes, format exports and retries. Cover/image generation adds a separate major component.
Do not estimate paid API cost using only final word count. Don't set one size for every genre or call a 3-section sample a complete full novel.

## 3. Transparent ledger
For each order, record:
- generation input and output tokens per stage;
- provider/model version, task name, latency, retries, failures, estimated vs billed cost;
- generated images/assets and output sizes;
- build storage, bandwidth, queue/compute cost where applicable;
- editorial/review labor time and revenue-related overhead (later);
- rights/licensing fees if assets require it.
Separate `cost per attempted work`, `cost per complete candidate` and `cost per approved published release`. A low cost per attempted work can hide massive failure/waste.

## 4. Formulae (no invented prices)
`MonthlyAI = Σ_j (inputTokens_j × inputRate_j + outputTokens_j × outputRate_j + imageCount_j × imageRate_j + fixedJobCharges_j)`
`MonthlyOperations = AI + hosting + objectStorage + egress + backups + monitoring + humanQualityReview + contingency`
`EffectiveCostPerApprovedRelease = MonthlyOperations / approvedPublishedTitles` (when denominator > 0).
Use real measured invoice/provider tariff, with correct rate units/currencies and taxes, not guesses. Set a maximum daily/monthly amount in the chosen billing currency BEFORE enabling autonomous jobs; alert at threshold and hard-stop with safe recovery before exceeding. Some external providers bill asynchronously; use a conservative margin and reconcile actual invoices. Do not claim exact zero unexpected spend if a third-party billing system is uncontrolled.

## 5. Quotas and safety controls
- Daily/weekly/monthly spend caps, tokens per stage, image count per page, max retries, number of concurrent jobs, deadline per work and provider request rate.
- Every run reserves worst-case projected resources before starting; balance consumed on completion/failure. Hard fails cannot bypass the cap by restarting the job.
- Production circuit breaker on abnormal quality flags, provider failures, duplicate outputs, bill spikes or incomplete books.
- Default schedule OFF until owner authorizes policy. Human approval still required to publish.
- Capacity settings do not grant payment authorization by themselves; secrets and provider billing require a separate explicit admin setup.
- Cost-saving strategy: reuse validated intermediate assets, summarize prior chapters, run expensive editor checks selectively with sampling/spot checks, adapt model tier to stage, and cache content by stable digest only when privacy rules permit.

## 6. Zero/low-budget modes
A local prototype with synthetic responses can run almost free but **does not** satisfy production storytelling. Running a trained local model may avoid per-request API charges but requires sufficient computer hardware, storage, power and continuous scheduling; quality varies. Hosted AI can simplify owner operations but incurs usage/hosting bills. A genuinely fully autonomous 10-stories/day production guarantee with zero hardware and zero service cost is not a grounded expectation.
No secrets, tokens or creator drafts committed to public GitHub; production job output lives in private storage.

## 7. Governance and owner approval
Owner selects editorial policy and approves spend ceiling and private draft schedule. Owner reviews finished candidates; **Approve & Publish** authorizes backend release of that exact candidate after verification. When approval is absent, nothing appears in Reader. Support “Approve for later,” revision request, reject, batch review with visible per-title checks, stop/pause creation and emergency unpublish.
Future invited creators get separate terms, content/rights attestations, moderation/appeal rights and contract-based payout decisions. No open public upload-to-publish pipeline before this trust layer is built.

## 8. Operational service targets (set after measurement)
Measure job completion rate, average/95th percentile production latency, scheduler drift, human review backlog, acceptance rate, EPUB/package validation pass, model outages, retry amplification, real spend per work, Reader download/restore success, rollback correctness and rights complaints. Set SLO numeric thresholds only from pilot observations.
