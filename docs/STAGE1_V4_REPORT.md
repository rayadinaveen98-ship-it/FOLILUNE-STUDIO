# Stage 1 v4 — Draft Recovery and EPUB Quality Gate
**Date:** 2026-11-11  
**Status:** Studio v4 implemented; Stage 1 remains IN PROGRESS. FOLILUNE Reader unchanged.

## Implemented
- Interactive standalone Studio v4: `prototypes/studio-stage1-v4.html`.
- Settings → **Browser recovery diagnostic**: persist an internal IndexedDB marker, verify it after reopening the same profile/origin, and delete it. Uses existing database v1 and does not migrate or delete projects.
- Prose/illustrated EPUB exporter now blocks illustrations with blank alt text; comic export remains blocked.
- `tests/real-browser-persistence.py` starts a local HTTP origin, saves two chapters including Telugu, then closes/restarts Chromium using the same profile and verifies persisted chapters and diagnostic marker. It uses real IndexedDB, not mocks.
- `scripts/verify-epubcheck.sh` downloads official W3C EPUBCheck v5.4.0 and checks both fixture EPUBs on a network-enabled host.
- `.github/workflows/studio-stage1.yml` defines EPUBCheck and Chromium restart CI jobs. **Committed workflow is not proof of successful execution.**

## What was actually tested here
- **10/10** local EPUB exporter unit checks passed (including missing-alt-text blocking).
- **2/2** sample EPUB ZIP/XML structural checks passed (these are not EPUBCheck).
- **3/3** Chromium viewport UI smoke flows passed at 1440×900, 960×760 and 390×844 using **simulated IndexedDB**, including the recovery controls.
- The real-browser restart script is syntactically valid, but the local browser navigation attempt failed with `ERR_BLOCKED_BY_ADMINISTRATOR`. Do not claim actual IndexedDB persistence has passed.
- The official EPUBCheck binary could not be downloaded in this environment; **formal conformance remains unverified**.
- No real FOLILUNE Reader v12 artifact was available here to render these exact EPUBs; **Reader compatibility remains unverified**.

## Manual recovery test
1. Back up projects before testing; use Chrome or Edge in the same profile and keep the HTML at the same path.
2. Create a two-chapter project, save, and export a JSON backup.
3. Settings → Start recovery test; verify that the in-session marker was saved.
4. Close all browser windows, reopen the exact same file and return to Settings → Verify after reopening.
5. Open the draft and inspect both chapters and any artwork. Use Clear test marker afterward.
6. A successful marker check alone does NOT prove data safety against quota exhaustion, corrupt profiles, crashes or incompatible future releases.

## Open release gates
- CI or physical-device evidence of real browser process restart recovery.
- Official EPUBCheck 5.4 pass on both EPUB fixtures and necessary fixes.
- EPUB import, layout, images, bookmarks and resume verification against a pinned real Reader build.
- Rights/provenance, accessibility, UX owner approval.
- Versioned approval/publishing backend is **not** implemented, and no public catalog is enabled.

## Reader boundary
Only `FOLILUNE-STUDIO` was modified. The `FOLILUNE` Reader repository, visual design, and roadmap remain untouched.

**Reference:** https://github.com/w3c/epubcheck/releases/tag/v5.4.0
