# FOLILUNE Studio — Stage 1A Autonomous Creation Engine — v0.2

**Private creative production prototype · no public publishing**

This is the first executable autonomous story engine and its v0.2 owner-review update. It can use an explicitly selected **local Ollama model** to propose an original premise, plan an outline, write the complete 3–5-section story, run an editorial critique, revise a section, and prepare an experimental EPUB for human review.

A **synthetic provider** is included only to test pipeline reliability; its output is deliberately repetitive and must not be mistaken for a real AI-authored literary work.

## What you need
- Windows/macOS/Linux with **Node.js 22+**.
- For genuine model generation, **Ollama** and an appropriate locally installed text model. This kit does not automatically install or pay for a model.
- Use a model suitable for your language and available RAM; quality and performance are not guaranteed.

## 1. Try the studio console (Windows)
Double-click `START_STUDIO_WINDOWS.bat`, then open `http://127.0.0.1:44831` in Chrome/Edge. Use **Test workflow (synthetic)** to verify the whole pipeline without a model. If Ollama is already running, enter the name of your installed model and use **Generate with local model**.

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
- The browser console lacks an automatic-ideation button; use `auto-queue.mjs` for story creation without a per-story premise.
- An error may consume a configured call attempt. Resume may require raising the limit in a *new* job rather than editing an existing brief.

## Roadmap
Next: browser UI for explicitly authorized private idea queue, formal model-output schemas and bounded retries, real local-model quality evaluation, EPUBCheck/Reader fidelity, then immutable owner approval → safe publishing.

See [Stage 1A v0.2 verification](docs/STAGE1A_V02_REPORT.md) for exact test evidence and limitations. Independent creator uploads remain a future moderated platform phase.
