# FOLILUNE — Editorial Quality, Format and Safety Standard
**Status:** Proposed release criteria, not automatically achieved. **2026-11-11.**

## 1. Definition of done for a story
A story candidate must include: original premise + full outline + consistent Story Bible + complete title/synopsis + substantive beginning, rising development, payoff/ending + actual requested prose length + human-readable chapter/scene boundaries + clear genre/language + original/cleared cover or approved fallback + complete metadata + at least one editorial pass + revision trace + privacy/provenance record + valid format artifact + preview.
No empty pages, placeholder paragraphs, prompt leakage, repetitive filler, truncated endings or foreign-language mix-ups. A generated premise is not a story. A test fixture is not a book.

## 2. Format-specific gates
- **Short story:** complete independently readable narrative; consistency, voice, pacing and resolution; EPUB/text edition passing structural, typography and actual-reader checks.
- **Novel:** locked premise/bible; chapter dependency graph; long-range character arc, timeline and causal consistency; chapter-by-chapter progress, full-book editorial passes and narrative ending. A released chapter can be called a serial episode, not a complete novel.
- **Illustrated fable:** text is complete and age appropriate; character/style sheet, original real images, image-text correspondence, alt text/captions, appropriate aspect/crop/readability; passing Reader illustration tests.
- **Comic:** complete page art and editable/flattened lettering source, safe reading sequence, consistent character visual features and expressions, legible dialogue at phone scale, transcript/alt text, chapter continuity; format/pagination supported in Reader. Never mark a panel outline or image prompt as a published comic.
- **Translations:** new edition ID, translator/provenance and rights, fluent language quality verified by native-language reviewer, culturally suitable names and script shaping, correct directionality and audio/alt-text where relevant.

## 3. Quality-gate sequence (do not collapse into one score)
**G0 policy/budget:** production authorized, creative exclusions and content rights allowed, resource caps fit; otherwise do not start.
**G1 integrity:** complete output fields, section count, stable IDs, canonical JSON, parsable text, no truncated responses, no unsafe URLs/HTML, no bogus assets; automatic hard failures.
**G2 narrative:** plot coherence, causality, originality concerns, believable dialogue, emotional payoff, genre fit, credible character behavior, non-repetitive prose; editorial reviewer produces issues/evidence, targeted revisions, uncertainty flags. A model is not a reliable final literary judge.
**G3 continuity:** compare scenes against Story Bible/scene anchors, timeline, character traits, setting/geography. Contradictions require correction or human review.
**G4 language:** script correctness, idiomatic Telugu/English/etc., text shaping, reading level, consistent narration register; sample review by fluent readers.
**G5 rights/safety:** no unlicensed borrowed excerpts/characters/third-party art, accurate AI disclosure, age suitability, privacy, sensitive material and any applicable policy requirements; similarity alerts are not definitive copyright clearance.
**G6 visual/a11y:** cover match, pages, images, text alternatives, font scaling, zoom and screen-reader basics. Some automated checks; also actual human and device review.
**G7 technical:** immutable package, integrity hashes, EPUBCheck where applicable, real Reader build smoke tests, offline reopen/bookmarks and performance.
**G8 owner approval:** a specific frozen candidate is approved. Batch approval may be supported with clear preview/provenance but is never automatic during the initial launch.

Failed G1, G5 or G7 blocks promotion. Severe G2/G3/G4/G6 issues block until resolved/reviewed. Editorial ratings are decision support, not “98% quality” guarantees.

## 4. Daily diversity and anti-flood rules
- Slot planner uses controlled combinations of genre, language, motif, point of view, narrative structure, target length and audience.
- Reject close duplicates against recent premises, character/world concepts and full catalog; use similarity checks as red flags, not proof.
- Prevent near-identical covers and recycled scene outlines.
- Limited retries with meaningful editorial defect logs. If five fail, publish fewer—not filler.
- Detect brand harm from low-quality bulk writing; review actual reader satisfaction and abandon unpopular formulas.
- Label AI-produced original works transparently and do not credit invented human authors.

## 5. Review studio UX
Inbox: Ready / Needs changes / Blocked by budget / Blocked by rights / Publishing / Published.
For every work: synopsis, genre/language/length, Story Bible, entire prose/assembled pages, editorial issues with citations to specific scene IDs, version diff, artwork provenance, Reader-fidelity preview, export. Actions: Revise selected, Lock approved scene, Reject, Approve for later, Approve & Publish.
Bulk views must never substitute a complete inspection requirement for high-risk, children's, sensitive or rights-ambiguous material.

## 6. Operating metrics
Track generated complete candidates, acceptance rate, rejection/revision reasons, median editing passes, duplicate rate, language pass rate, preview defects, EPUB/Reader validation failures, cost per completed candidate and per approved release, overnight worker recovery, Reader retention (opt-in aggregate only), content complaints/takedowns, user ratings/engagement by format/genre.
**North-star launch metric:** readers consistently find enjoyable, safe, accessible new original works; “ten per day” is a capacity goal, not a quality metric.
Proposed pilot gates (to validate, not prior results): 100% explicit-release authentication and immutable candidate mapping in automated tests, zero simulated books eligible for public catalog, no known critical security issue, all shipped EPUBs pass current EPUBCheck plus pinned Reader fixture matrix, manually inspect a representative editorial sample for every language/genre/format, successful restoration/rollback drills.

## 7. Source references
EPUB 3.3: https://www.w3.org/TR/epub-33/
EPUB Accessibility 1.1: https://www.w3.org/TR/epub-a11y/
EPUBCheck: https://github.com/w3c/epubcheck/releases
Readium Web Publication Manifest: https://github.com/readium/webpub-manifest
