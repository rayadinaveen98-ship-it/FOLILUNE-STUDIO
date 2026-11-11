# FOLILUNE Studio — Stage 1A Autonomous Creation Engine — v0.4

**Private creative production prototype · no public publishing**

This is the current experimental autonomous story engine, now including bounded QA repair and local model preflight. It can use an explicitly selected **local Ollama model** to propose an original premise, plan an outline, write the complete 3–5-section story, run an editorial critique, revise a section, and prepare an experimental EPUB for human review.

A **synthetic provider** is included only to test pipeline reliability; its artificial paragraphs must not be mistaken for literary-quality AI writing.

## What you need
- Windows/macOS/Linux with **Node.js 22+**.
- For genuine model generation, **Ollama** and an appropriate locally installed text model. This kit does not automatically install or pay for a model.
- Use a model suitable for your language and available RAM; quality and performance are not guaranteed.

## Stage 1A v0.3 — private idea-to-story batches

- The **Let Studio invent the premise** section now creates owner-authorized batches of 1–2 private short-story drafts, with theme, language, genre, sections, model mode and capped model calls.
- Completed drafts can be reopened from the on-disk production history, chapter-locked/revised and exported as private review EPUBs.
- Explicit authorization is required per batch. No publishing or Reader integration exists.
- [Detailed v0.3 setup instructions](docs/STAGE1A_V03_ENGINE_README.md) · [Implementation/test report](docs/STAGE1A_V03_REPORT.md).
- **Tests:** 15/15 synthetic engine checks, real local HTTP manual and queue integration, 3 responsive browser UI mock-HTTP checks. Real Ollama creative quality remains unverified.

## Stage 1A v0.4 — current checkpoint

- **Local model preflight:** Check installed Ollama models before trying to generate; unavailable or unknown models are rejected before a production job is created.
- **Bounded autonomous quality repair:** Severe repetition or apparent prompt leakage triggers at most two revision attempts within the existing call limit; unresolved work is marked **needs_attention** and is not exported as ready.
- **Safer owner revisions:** Rewrites that introduce blocking quality warnings are rejected; the previous approved-for-review artifact is preserved.
- **Verified locally:** 19/19 Node tests, local HTTP production/review and queue integration, and 3/3 simulated-browser viewport flows.
- **Not yet verified:** genuine AI prose quality, installed Ollama execution, EPUBCheck certification, Reader rendering or publication. **Reader repository untouched.**
- [v0.4 report](docs/STAGE1A_V04_REPORT.md) · [model preflight source](engine/model-preflight.mjs) · [quality gate tests](tests/quality-gates-v04.test.mjs).

## 1. Try the studio console (Windows)
Double-click `START_STUDIO_WINDOWS.bat`, then open `http://127.0.0.1:44831` in Chrome/Edge. Use **Test workflow (synthetic)** to verify the whole pipeline without a model. If Ollama is already running, select **Check local AI models**, enter an installed model name and then select **Generate with local model**.

From a terminal (all systems):

```bash
node engine/server.mjs
```

The console binds to `127.0.0.1` only; it has no internet-facing authentication. Don't reverse-proxy or expose it publicly.

## 2. Actual autonomous writing from a creative brief
With Ollama running and a model installed:

```bash
node engine/cli.mjs run fixtures/brief.json --provider ollama --model YOUR_INSTALLED_MODEL
```

This performs **seven model calls for a 3-section story**: plan, Story Bible, 3 chapters, critique, revision. All state is checkpointed in `output/JOB_ID/`. Exact results depend on model instruction-following and creative capability. A failure safely leaves a checkpoint. To continue:

```bash
node engine/cli.mjs resume output/JOB_ID --provider ollama --model SAME_MODEL
```

## 3. Truly auto-initiated *private* story creation
Set `fixtures/autonomy-profile.json` to your **approved** theme, language, limitations and `worksPerRun` (1–2). It contains `authorization: ALLOW_PRIVATE_DRAFT_CREATION_ONLY`.

Then run:

```bash
node engine/auto-queue.mjs fixtures/autonomy-profile.json ollama YOUR_INSTALLED_MODEL
```

This first asks the local model to devise an original premise from the theme, then runs the complete production pipeline **without requiring a per-story prompt**. A private ledger helps reject exact duplicate premises. No public publishing is possible. You can later schedule this command through a local operating-system scheduler **only after deliberately configuring that schedule**; there is no silent background task in this kit.

## Owner-directed chapter revisions (v0.2)

Once a synthetic or real-model job reaches **Ready for owner review**, you can use the browser console to:

- **Lock** any chapter that should not be regenerated.
- Select one unlocked chapter, enter a clear revision instruction (12–1200 characters), and press **Regenerate selected chapter**.
- Review a new immutable private review version (`review-draft-v2.json`, `review-only-v2.epub`), while the original review remains on disk.
- Download the latest private draft and experimental EPUB from the same links.

Each targeted revision consumes one remaining model-call allowance; stale revision requests and attempts to modify a locked chapter are refused. The selected model is fixed for the job. A failed revision cannot replace the last completed review. Deterministic metrics now flag severe repetition/short sections, but **never certify literary quality, copyright originality or continuity**. This is still an owner-review proof, not a public release system.

## 4. Safe verification without Ollama

```bash
npm test
python tests/server-integration.py
npm run simulate
npm run simulate:auto
```

The tests use **synthetic content** and a local HTTP stub for the Ollama adapter. They do NOT demonstrate real narrative quality.

## Artifacts and privacy
- `output/JOB_ID/state.json`: stage log, checkpoints, request counts and revisions.
- `output/JOB_ID/review-draft.json`: private manuscript compatible with Studio's existing draft schema.
- `output/JOB_ID/review-only.epub`: *experimental* offline EPUB (not a verified Reader release).
- `output/private-production-ledger.json`: pre-authorized batch history.

**Do not upload `output/` to public GitHub.** It is ignored in `.gitignore`.

## Known limitations
- Only prose/short stories: illustrated fables, artwork, comics and novels are future engineering stages.
- Real Ollama model generation not run in this build environment; tests proved request formatting using a local stub only.
- Neither an approval backend nor a public Reader catalog has been implemented. Reader code is untouched. No public publish APIs exist.
- Publisher rights, EPUBCheck compliance, real Reader rendering and literary quality remain review gates.
- No hardened paid-cloud billing enforcement; local Ollama is the only real provider in this build. Request caps bound model calls, not electricity, time, or total monetary spend.
- The browser console now includes a bounded private idea queue; `auto-queue.mjs` remains supported as a CLI.
- An error may consume a configured call attempt. Resume may require raising the limit in a *new* job rather than editing an existing brief.

## Roadmap
Next: browser UI for explicitly authorized private idea queue, formal model-output schemas and bounded retries, real local-model quality evaluation, EPUBCheck/Reader fidelity, then immutable owner approval → safe publishing.

See [Stage 1A v0.2 verification](docs/STAGE1A_V02_REPORT.md) for exact test evidence and limitations. Independent creator uploads remain a future moderated platform phase.
