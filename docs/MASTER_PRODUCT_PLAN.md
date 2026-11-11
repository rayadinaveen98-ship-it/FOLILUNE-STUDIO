# FOLILUNE — Master Product Plan
**Version:** 1.0 planning baseline · **Date:** 2026-11-11
**Status:** Product vision confirmed from owner statements; architecture, cadence and execution gates are proposals. This is NOT implemented software.

## 1. North star: an autonomous original-content publishing house
FOLILUNE is not a manual writing app with an AI button. It is a coordinated system of (a) a behind-the-scenes creative production factory, (b) a private publisher's command center, (c) a secure content and approval pipeline, (d) a premium reading/discovery experience, and (e) later, a curated independent-creator platform.

**Product promise:** Owner should not need to install an AI model, pick providers, write a prompt for each piece, operate generation scripts, edit every chapter, or upload each book manually. The system autonomously proposes original ideas, develops complete literary works, performs bounded revisions and quality checks, packages appropriate formats and presents genuinely readable finished candidates. The owner reviews and authorizes publication. Reader discovers and downloads only cleared releases.

## 2. Non-negotiable outcomes
- **Daily short fiction:** target sustained capacity of TEN distinct, complete, original short-story *candidates* per day, across a varied genre/language schedule. A candidate is not a published title and can be rejected.
- **Multiple content families:** short stories, fables, illustrated works, serialized novels, completed novels, comics and future experiments. These have different lengths, production tasks and cadences; never call a chapter or comic script a finished novel/comic.
- **No routine prompting:** production can initiate from a pre-approved editorial calendar, content themes and budget envelopes.
- **One owner review place:** desktop-first private Studio dashboard with one-click request revision, reject, approve for later, or authenticated Approve & Publish.
- **Reader is its own app:** no forced changes to reader UX. Approved catalog entries appear in Reader through a versioned service with actual format support and offline downloads.
- **Future creator opportunities:** other writers/illustrators can submit works; platform-wide rights, permissions, moderation and editorial decisions remain enforced.
- **Owner simplicity:** no mandatory local Ollama install or provider configuration in the product UX. Model inference is managed by a backend operator under recorded resource/cost limits.
- **No false autonomy:** neither the assistant in this chat nor the current local prototype constitutes a 24/7 publishing system. Continuous work requires a deployed scheduler, compute, secure generation service and persistent storage.

## 3. Product surfaces
### FOLILUNE Studio — Owner command center
Home: Today's plan, Production in progress, Needs attention, Ready for review, Recently released, Budget/health indicators. A detailed creative brief is optional; default is a preapproved editorial strategy.
Production: genre/language/format quota board, active job states, capped retry/pause/resume, content diversity calendar.
Review: full readable manuscript/panel pages, side-by-side revisions, Story Bible/character sheet, issue list, provenance and rights, Reader-accurate preview, one clear release decision.
Catalog operations: versioned editions, cover/metadata, series scheduling, takedown/rollback, visibility, audit.
Configuration: publisher policy, languages, age limits, content exclusions, editorial tone, daily quota, cost limits, permission rules, privacy, providers managed behind the system.
No public drafts in this interface; all authoring content is private and authenticated.

### FOLILUNE Reader — Consumer product
Reader's existing Modern Atelier design remains independent. New Arrivals, Genre Shelves, Languages, Novels & Series, Short Reads, Illustrated Tales, Comics, Continue Reading, New Episodes and Editorial Collections should only be added through separate Reader design approval.
Each item must have title, synopsis, original cover, genre, language, length, age classification, creators/attribution, publication and edition IDs, series info where applicable, accessible reading directions, and approved artifact(s).
Readers can browse published works, download offline, read and resume; personal annotations/reading position never transfer to Studio without explicit opt-in.
AI-production disclosure must be transparent and consistent, not masquerade as independent human authorship.

### Creator platform — later
Creator accounts, private drafts, rights declarations, upload/format conversion, editorial submission, status, appeals, payout/royalty policy (if eventually adopted) and separation between creators.
Creator content is not automatically approved or published.

## 4. Production families and editorial cadence
### Short-fiction line — first scale target
Initial format: genuine original complete stories, with a defined beginning/middle/end, title, synopsis, proper prose, revision record, cover or approved fallback. Proposed editorial length bands (validate with audience):
- Flash: ~500–1,200 words;
- Short: ~1,500–3,500 words;
- Longer short fiction: ~3,500–7,500 words.
Ten/day is a **production-capacity target**, not a promise to publish ten regardless of quality. The pipeline must count “ready to review”, “approved” and “published” separately.

### Novels and serials
Maintain a long-running book plan, character/world bible, timeline, chapter dependencies, rolling continuity summaries and chapter-specific revisions. Daily newly released **episodes** may be feasible; complete novels follow multi-day/multi-week production and editorial gates. Mark “novel completed” only once a complete, quality-reviewed edition exists.
Do not mislabel a daily 3-chapter draft as a novel.

### Illustrated fables / children's content
Original tale + age-appropriate review + consistent illustration style/character reference + actual image assets per spread + alt text + readable layout + cover. Publishing requires real visual QA and reader tests.

### Comics / graphic stories
Full story + panel/scene breakdown + consistent character/environment/reference assets + actual original artwork + balloon/lettering at readable sizes + image-page/layout export + transcript/alt text + right reading order/zoom verification in Reader. Comic scripts and image prompts alone are NOT finished comics. Longer comics receive a slower schedule.

## 5. Editorial programming
A publication slate controls format/genre/language distribution, character/plot diversity, age suitability, repetition, seasonal themes and ongoing series. Proposed pilot genre mix: mystery, science fiction, fantasy, romance, thriller, slice-of-life, adventure, comedy, horror, fable. Schedule may rotate Telugu, English and other languages, but only after native-language review quality is verified.
Use novelty fingerprints and catalog overlap alerts to discourage repeated premises; these are indicators, not guarantees against copying.
Avoid a single global automatic quality score. Fail structural/security checks deterministically; show editorial scores with rationales and require human judgment for subjective quality.

## 6. Approval vs automation
The owner can preauthorize **draft creation** and budget ceilings; this does not authorize public publication. For a candidate, the owner can request a targeted revision, reject, approve for later or choose one explicit authenticated **Approve & Publish** action that records exact-candidate approval and safely promotes the checked release. Unapproved work stays private.
Enable batch approval only after trustworthy previews, per-item inspection and reliable rollback; never silently approve an unattended nightly batch.

## 7. Target business and UX qualities
- Quality before output volume. Low acceptance rate means fix production, not lower gates.
- Zero routine model administration for the owner; provider routing behind server-side service with cost/availability visibility.
- Privacy, provenance, copyright and model-usage disclosures by design.
- Accessible Indic text, fonts/typography, captions, transcripts and language metadata.
- Reader retention must be earned by good stories; avoid automatic catalog flooding.
- No surprise billing; no paid production without a configured, enforced spend ceiling and owner authorization.

## 8. Current reality vs vision
**Current verified Studio repository:** v0.4 local Node/Ollama short-story experiment, synthetic provider tests, limited auto-idea batches of 1–2, chapter revision, local private draft and experimental EPUB. Real model output quality is unverified; no production scheduler, provider management, novel/comic/illustration factory, public approval service, hosted catalog or Reader integration. The Reader repository is separate and untouched.
See [DELIVERY_ROADMAP_MASTER.md](DELIVERY_ROADMAP_MASTER.md) for exact deliverable gates and [ENGINE_PLATFORM_ARCHITECTURE.md](ENGINE_PLATFORM_ARCHITECTURE.md) for implementation constraints.
