# FOLILUNE Studio — Future Creator Ecosystem
**Status:** Future product direction requested by owner; NOT implemented or included in first MVP. **2026-11-11**

## Vision
After proving high-quality owner-operated autonomous production and a reliable Reader release gate, extend Studio into a curated creative publishing platform where independent writers, illustrators, comic creators and translators can submit their own work to reach FOLILUNE Reader users.

Creators must retain attribution and receive understandable rights/terms. Allow both human-authored and transparently disclosed AI-assisted content under clear rules. Do not make "accept any upload and immediately publish" the baseline.

## Intended future journey
Creator applies/onboards → verifies identity/account appropriate to jurisdiction → agrees to publishing terms → creates or imports original work → declares authorship and content/asset rights → optional assisted Studio tooling → automated structural/security/rights screening → editorial/moderation queue → approved release candidate → separate publishing authorization according to platform policy → FOLILUNE Reader catalog.

## Role and governance model
- **Platform owner/admin:** owns platform policy, adjudication/appeals and final catalog release authority during curated pilot.
- **Creator:** controls own drafts; may submit candidate editions; cannot publish into public catalog without permission.
- **Editor/reviewer:** reviews assigned work; no blanket permission to alter or release unrelated projects.
- **Translator/illustrator/contributor:** limited access to contracted assets and assignments.
- **Reader:** consumes approved works; reader-owned notes and progress are not shared with creators by default.

Use workspace-level isolation and server-enforced role-based permissions. Avoid leaking private manuscripts, prompts, contracts or unsubmitted art across creator accounts.

## Lifecycle and controls
- Submission status: draft → submitted → automated validation → editorial review → revisions requested / approved / rejected → publication scheduled or released.
- Detailed rejection reasons, revision submission, appeal path, abuse controls and emergency catalog takedown.
- Rights declarations for stories, fonts, art, licenses, translations and models; content fingerprinting is useful for review but not sole copyright proof.
- Moderation and age classification; anti-spam and duplicate detection; no unreviewed self-publication at launch.
- Machine-generated content labeling policy; avoid flooding Reader with low-quality generated works.
- Creator dashboards for title status and permitted aggregate engagement only; reader-specific activity stays private.

## Business possibilities (research later)
- Curated licensed publishing and promotional collections.
- Optional creator subscriptions for advanced creative tooling; usage-based generation credits if economics justify.
- Revenue share / royalties / paid books only after tax, consumer, local payment, rights and payout obligations are understood.
- Clear content ownership and portability; exports must be feasible, not lock-in by default.

## Roadmap condition
Do not build creator sign-up, payments or multi-tenant publishing infrastructure before the owner production MVP and actual approval-to-Reader handoff are reliable. However, design the domain model now with owner/workspace/creator attribution so the future expansion does not require destructive data migration.
