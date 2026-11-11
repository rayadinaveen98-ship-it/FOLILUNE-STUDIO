# FOLILUNE Studio ↔ Reader Publication Contract (RFC v0.1)
**Status:** PROPOSED, not Reader-approved or implemented.

## Purpose
Define the boundary that lets Studio release structured reading artifacts to FOLILUNE Reader without importing authoring-only concepts, breaking the Reader UI, or silently losing user progress.

## Principles
- Canonical creative structure is independent of a reading engine.
- Release packages are immutable, reproducible, versioned and integrity-checked.
- Publication format and Reader capabilities are explicit: prose, illustrated story, comic and future interactive media are distinct experiences.
- The Reader is free to choose/revise its rendering engine behind its adapter boundary.
- Reader owns user annotations, progress and offline library; Studio only owns publication artifacts.
- Unsupported or unsafe content results in a clear block, never an invented 'perfect' rendering claim.

## Proposed release manifest fields
- schemaVersion; candidateId; publicationId; workId; editionId; editionVersion.
- title, subtitle, synopsis, creators with role, language (BCP 47), optional series/volume, type.
- rights: declared publishing authority/license, content-rights review status; no raw private contract.
- readingDirection (ltr/rtl), audience/age rating, accessibility declarations.
- requiredCapabilities: explicit feature IDs and minimum version (e.g. prose-epub3-v1 or comic-pages-v1).
- readingOrder: ordered stable item IDs and safe package-relative paths, declared MIME media types.
- assets: safe package-relative paths, declared MIME types, byte lengths, SHA-256, alt text when applicable.
- Reader compatibility evidence and approved Reader build matrix are stored in the external validation report, not self-asserted as release permissions in an editable manifest.
- sourceRevisionDigest, build toolchain ID and build timestamp/reproducibility policy. The package digest is recorded OUTSIDE the package in the immutable candidate/release record to avoid self-hashing. Release ID and catalog status also belong to that external record.
- release state/public catalog eligibility lives on the release server and is **not** controlled by a client-edited manifest flag.

## Canonical document types
**Prose:** document → chapters → blocks; stable chapter/block IDs and semantic text with allowed marks.
**Illustrated story:** document → ordered spreads/sections → text blocks + image placements; alt text and image order preserved.
**Comic:** volume/episode → pages → optional editable panels, artwork and dialogue objects; reader can consume safe precomposed pages plus transcript until panel rendering is verified.
**Future branching story:** graph of stable nodes and edges with choice rules; incompatible with V1 Reader until separate capability.

## Packaging adapters
1. **EPUB 3.3 export candidate** for reflowable prose/illustrated works; use EPUB standards validators and real rendered reader tests. Do not claim every EPUB3 feature is supported.
2. **Comic package candidate** for fixed page images and manifest reading order; CBZ export can be investigated, but a native publication profile may be more expressive for accessible transcripts.
3. **Local Reader handoff (first milestone):** a signed/hashed release candidate imported to a known Reader test build. The actual catalog API comes after the reliable local path works.
4. **Web Publication/OPDS interoperability (future):** evaluate Readium-compatible manifest profiles and catalogs rather than inventing a rival public standard.

## Anchor and migration contract
- Every section/page/panel has a stable logical ID.
- For EPUB, actual read locations may use EPUB CFI. Never assume internal paragraph IDs map 1:1 to CFI.
- Same-edition update may offer a verified anchor migration map; if ambiguous, preserve the prior locator and ask the Reader to surface uncertainty.
- New language/medium edition is a separate rendition with distinct progress unless user opts into mapping; no silent overwrite.

## Validation gate before owner approval
- Schema, required fields, duplicate IDs, reading order, referenced assets, checksums and actual MIME types.
- Safe import and packaging (no path escape, unsupported embedded script, remote active content or archive bomb).
- Rights/provenance attestation for text, images, cover, translation and generated material.
- Accessibility baseline: headings, language, alt text / transcripts and text scale/contrast testing.
- Real Reader compatibility tests for selected exact Reader build(s) at phone/tablet/laptop sizes; required features must be supported.
- Incomplete comic feature support blocks catalog publication until Reader adapter succeeds.

## Versioning
- schemaVersion changes independently of edition semver. Additive changes may be minor; incompatible changes are major.
- Packages are immutable, addressed by a digest stored in candidate/release metadata outside the package. A corrected publication is a new release, not in-place mutation.
- Approval is bound to a candidate digest and validation report digest, invalidated if either changes.

## References
- W3C EPUB 3.3: https://www.w3.org/TR/epub-33/
- W3C EPUB accessibility: https://www.w3.org/publishing/epub/
- Readium Web Publication Manifest: https://readium.org/webpub-manifest/
- Existing Reader boundary: https://github.com/rayadinaveen98-ship-it/FOLILUNE/blob/main/docs/READER_ENGINE_INTERFACE.md
