# FOLILUNE Studio — Stage 1A Autonomous Creation Engine

**Private creative production prototype v0.3 · no public publishing**

This is the Stage 1A v0.3 executable autonomous story engine. It can use an explicitly selected **local Ollama model** to propose an original premise, plan an outline, write the complete 3–5-section story, run an editorial critique, revise a section, and prepare an experimental EPUB for human review.

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

## 2. NEW — private autonomous idea queue inside Studio
In the browser console, scroll to **Let Studio invent the premise**. Choose a creative theme, language, genre, 3–5 sections, and 1–2 works. Select **Synthetic workflow test** or **Local Ollama model**, enter a locally installed model name for genuine writing, then explicitly check the private-draft authorization box. Press **Start private production batch**.

The console displays production progress and a durable local history under `output/private-production-ledger.json`. When a work is ready, choose **Open completed story** to inspect chapters, lock chapters, request targeted rewrites, and download the private draft or experimental EPUB. A browser refresh can reconnect to the history; restarting the local server also preserves completed history while keeping the same output directory.

The engine rejects exact-repeat premises in its private production ledger. It does *not* guarantee semantic originality, full literary quality, or non-derivativeness; you must review works and content rights before any future publication.

The queue is **one at a time**, accepts at most **two private works per batch**, and enforces a per-work call limit. One additional idea-generation request is made per attempted work. Ollama costs are local compute, not a monetary budget guarantee. A crashed batch does **not** automatically restart: inspect the local checkpoint and ledger before retrying. Queued status may remain until the owner intervenes.

Nothing in the queue approves, exports to the public catalog, or publishes. `FOLILUNE` Reader remains untouched.

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

## 4. Safe verification without Ollama

```bash
npm run test:autonomous
npm run simulate
npm run simulate:auto
python tests/queue-integration.py
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
- Neither an approval backend nor a public Reader catalog has been implemented. Reader code is untouched.
- Publisher rights, EPUBCheck compliance, real Reader rendering and literary quality remain review gates.
- No hardened paid-cloud billing enforcement; local Ollama is the only real provider in this build. Request caps bound model calls, not electricity, time, or total monetary spend.
- The browser console now supports an authorized private idea batch; the CLI remains available. Actual model quality testing is pending.
- An error may consume a configured call attempt. Resume may require raising the limit in a *new* job rather than editing an existing brief.

## Roadmap
Next: run real locally installed Ollama model end-to-end and assess writing quality; strengthen recovery/semantic duplicate screening and budget policies; official EPUBCheck/Reader fidelity; then immutably approval-gated publication. Independent creator uploads remain future scope. Independent creator uploads remain a future moderated platform phase.
