---
origin_created: 2026-06-11
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v3.1
created: 2026-06-13
last_updated: 2026-06-13
status: for_ratification
document_type: blueprint
scope: Strategic spine of the Esbla Spark v5.0 documentation suite.
title: Esbla Spark — Blueprint Master Plan v3.1
ratifier: Usman Hussain
---

# Esbla Spark — Blueprint Master Plan v3.1

**Company:** HAUTM. **Product:** Esbla Spark. **Documentation suite:** v5.0.
**Supersedes:** Blueprint v3, v2, v1 (moved to legacy). v3.1 is a consistency-and-review patch incorporating the accepted findings of the v3 review; it is not a conceptual redraft. The suite version is v5.0; this file's version is v3.1 — the metadata standard separates the two.
**v3.1 changelog:** (1) v5.0 suite frontmatter, source-of-truth bridge, and active Phase 6C continuity rule added; (2) P-25 employment cross-context crossing disabled by default pending counsel and T&S review; (3) P-20 bond cap made market-specific in local currency; (4) "white-label" wording replaced with "agency-branded client editor with mandatory Esbla Spark platform identity"; (5) marketplace GMV/AOV gate now requires a recorded sufficiency decision; (6) risk rows 21–27 added (cross-tenant leak, chargeback spiral, BYO-API leak, trustee abuse, refactor breakage, metadata drift, stale-document authority); (7) parameter registry fixes (P-04 window, P-09 wording, P-10 provisional default, P-13 "greater of"); (8) Scope C non-commitment wording de-contradicted. **Declined from the v3 review (logged):** renaming this file to v5.0 — the suite carries v5.0 per founder ruling; Phase 7–10 renumbering — Phase 9 is restored as Marketplace / Trust Layer and Phase 10 becomes Intelligence Scale / Ecosystem Expansion.
**Status:** For ratification per Part 0.

---

## Part 0 — Ratification, authority, and document status

### 0.1 What is being ratified

This blueprint is ratified as **strategic doctrine**: binding constraints plus strategic guidance, by part:

| Parts | Status |
|---|---|
| I (Definition), II (Lens) | Binding principles |
| III–VII (Identity, Reputation, Fairness, Substrate rules, Conventions) | Binding constraints on all future phase docs and features |
| VIII (Capability map), IX (Phase/artifact plan), XI (GTM) | Strategic guidance; changes need a decision-gate record, not re-ratification |
| X (Launch gates), XII (Risk register), XIII (Governance/liability/kill), XIV (Neutrality), XV (Non-commitments) | Binding; "intact" required for ratification |

"Intact" means: present, not weakened, amendable only through 0.5. Ratification does **not** authorize implementation; implementation requires phase-specific control documents, ticket packs, validation gates, and acceptance criteria.

### 0.2 Ratification artifact and signature

Ratification produces: (a) `RATIFICATION_Esbla_Spark_v5_0.md` and (b) `decision_record_v5_0.json` — document ID, version, content hash, date, ratifier name, links to the three-AI stress-test artifacts, external-review status per section category, and outstanding conditions — merged to the repo by PR. **Ratifier: Usman Hussain. Founder/Operator: Usman Hussain until delegated.** Three-AI review (Codex, Claude, DeepSeek) is a mandatory **stress-test, not governance**; accountability sits with the human signature. For reputation, identity-enforcement, escrow, marketplace, and minor-safety doctrine, at least one qualified external human reviewer (legal or T&S practitioner as appropriate) must review the relevant sections **before public activation** of those capabilities, and is recommended before ratification where feasible. Ratification is repo-internal; public doctrine versions are published when external marketing begins.

### 0.3 Authority hierarchy and conflict rule

For future intended doctrine, the order is: applicable law and regulation > signed participant contracts > **this blueprint** (strategic constraints) > business logic doctrine (operational rules) > phase plans (implementation scope) > implementation. For current executable repo state, until doc-as-SOT activation after Phase 6F closure, the existing repository hierarchy remains authoritative for implemented truth: Prisma schema, contracts, module manifests, generated registry, accepted ADRs, active controls, tests, and validation evidence. A lower document may never silently override a higher one. When intended doctrine and implemented truth differ, Codex must not guess; the gap becomes an ADR, control amendment, migration ticket, or blocked item. After doc-as-SOT activation, code is never source of truth over documents except through the safeguarded propagation process in XIII.4. **v4.1→v5.0 bridge:** during the suite transition, the v5.0 suite manifest is the source-of-truth bridge — it enumerates which v4.1-era documents are superseded, which are historical, and which active repo artifacts remain executable truth. Phase 6C seed FFET closure is verified on main before any runtime, filename, package, contract, or active-process refactor wave begins.

### 0.4 How implementers consume this document

Codex and other implementers do **not** implement from this blueprint directly. The blueprint binds the *authors* of phase documents, amendments, and ticket packs; implementers consume those phase-specific artifacts. This preserves the exact-file, gate-audited discipline.

### 0.5 Amendment process

Binding parts change only through: drafted amendment → three-AI stress-test → P-26 cooling period for backbone-touching changes (XIII.2) with a written strongest-critic self-challenge → human ratification record. Parameters (Appendix A) change through the lighter parameter-governance process (XIII.3) with notice per P-11.

---

## Part I — The definition

**Esbla is an entrepreneurial ecosystem based on collaboration and governed by reputation.**

Expanded: *Esbla is an entrepreneurial ecosystem that enables collaboration across distance, scale, and trust, governed by evidence-based reputation accumulated through real work, built on customer-sovereign substrate that respects data ownership and cost honesty.*

---

## Part II — The lens

The platform works for participants, not the other way around. Bounded customer-first rule (replacing v2's absolute "the platform yields"):

> When the platform's commercial interest and a participant's legitimate interest conflict, Esbla favors the participant **unless doing so would violate law, safety, fairness to other participants, platform integrity, or long-term operational sustainability.** Where two participants hold conflicting legitimate interests, the platform applies the due-process and fairness rules of Parts IV–V rather than favoring either by status or revenue.

The eight commitments carry from v2 with corrected references: (1) outcomes over features; (2) active help, measured by Part X validation; (3) **communicate capabilities clearly, never guarantee outcomes**; (4) configurability with constraints and a small immutable backbone (XIII.2); (5) operating conventions adopted for Esbla first; (6) hard decisions with due process (Part V); (7) fail fast with kill criteria (**XIII.8**); (8) substrate mastery, not domain mastery.

---

## Part III — Participants and identity

### III.1 Tiered identity

**Tier 0 — Anonymous:** browsing, public content, course previews. **Tier 1 — Contact-verified** (email/phone): learning, community participation (rate-limited), profile drafting, platform-meta AI within freemium limits. Reputation accumulates marked "identity unverified." **Tier 2 — Identity-verified** (KYC or jurisdiction-appropriate equivalent): marketplace participation, hiring/being hired, payments in, structured agreements, paid mentorship of adults, reputation portability. **Tier 3 — Payout/business-verified:** payouts, escrow release, employment contracts, commercial tenant operation, B2B transactions. **Guardian-linked mode (minors):** learning and supervised community only; no marketplace, no payouts, no unsupervised adult–minor messaging; mentorship involving minors only in monitored channels with vetted mentors (hard gate, X.6).

### III.2 Tier transitions and edge cases (rulings)

- **Tier 1 reputation continuity.** Tier 1 history belongs to the same Person record; upon Tier 2 verification it converts to full standing automatically — no merge needed. Until then it influences ranking **only within Tier 1 contexts** (learning, community); it never enters marketplace or employment matching.
- **Tier 1 access loss** occurs only for abuse, fraud, or safety violations — never for low quality scores; learning contexts do not gate access by performance.
- **Failed Tier 2 verification** leaves the Person at Tier 1 with full Tier 1 scope, an explained reason category, and the III.3 appeal path. Verification failure alone is never treated or labeled as fraud.
- **Multiple Tier 1 accounts** (shared family phone/email is a recognized reality): upon Tier 2 verification the Person designates one canonical account; others close. Learning history may merge on request after review; reputation-bearing history does not auto-merge (anti-gaming).
- **De-duplication flags** trigger human review with appeal, never automatic accusation or closure.
- **Mentorship tiering:** unpaid public peer-help is Tier 1; paid or private mentorship of adults requires Tier 2.

### III.3 Identity lifecycle

Name/document changes (marriage, legal change, gender transition, citizenship) re-verify while preserving the Person record and reputation continuity. Identity disputes enter appeal/recovery with human review (SLA P-18). Recovery uses multi-factor paths defined pre-launch and exercised in the annual drill (VI.7).

### III.4 One profile per participant type; organizations; brands

- **One profile per participant type** (freelancer, job-seeker, student, staff, mentor) — hard rule. A freelancer profile holds **multiple service categories** (e.g., design, development, copywriting), each with its own skill evidence and category-scoped rating context, under one identity and one aggregate integrity record.
- A profile may display a **brand/DBA name**; verification and reputation anchor to the Person.
- **Agencies and businesses are tenants, not profiles.** A Person may own multiple tenant organizations and simultaneously hold a staff profile in others. Personal reputation and organizational reputation are distinct ledgers: organizational actions attribute to the organization with the responsible individual recorded; an organization's reputation does not auto-transfer to every member, but an individual who is the responsible actor across organizations carries that pattern personally. Spillover in either direction is appealable.
- **Restriction scoping:** conduct violations scope to the context in which they occurred (a freelance-conduct restriction does not restrict the student profile); **integrity violations** (fraud, identity abuse, safety) scope to the whole Person.

### III.5 Collective accounts

A family business, cooperative, or collective operates as a tenant: the **designated representative** completes Tier 2/3 verification and is the responsible party for the entity's platform obligations; members hold staff profiles with individual conduct records. Reputation attaches to the collective organizationally and to members individually for their own conduct; one member's abuse scopes to that member unless pattern review shows the collective's governance enabled it. Departing members carry their individual history. Payouts go to the collective's verified payout account; internal splits are the collective's affair (split tooling is post-v1). Representative changes are supported with re-verification and continuity.

### III.6 KYC alternatives and reputation bonds (bounded)

Jurisdiction-specific facts in this blueprint — KYC vendor coverage (including NADRA/CNIC paths in Pakistan), payout-rail capabilities, registration obligations (e.g., PSEB), residency rules — are **launch-gate assumptions pending counsel, vendor contracts, or regulator-facing confirmation**, not frozen doctrine. Where lawful KYC is genuinely unavailable to a legitimate participant, bounded alternatives may unlock limited Tier 2 scopes. **Reputation bonds:** capped per P-20 (≤50% of transaction value; absolute cap set per market in local currency), refundable, held in a segregated account, proportional to transaction size, **never required for learning or community use**, never seizable by a counterparty (platform releases per dispute outcome with appeal), offered with a non-cash alternative where feasible (staged limits, voucher/co-signing). Bonds are an exception path, never the default substitute for identity.

---

## Part IV — Reputation architecture

### IV.1 Evidence ledger — and erasure mechanics

Append-only factual events with context captured at write time. Definitions: **soft delete** = participant-initiated hide, recoverable; **redaction** = content removed, record persists; **tombstone** = marker preserving existence and hash after lawful erasure; **legal erasure** = rights-based removal of content and identity linkage; **legal hold** = retention override during disputes/obligations, with notice where lawful. Rulings:

- On lawful erasure, aggregates are **recomputed excluding the erased source where technically separable**; where not separable, the aggregate is flagged "contains erased-source contributions," its weight is capped, and it can never be the **sole** basis for any adverse consequence.
- Participants may request recomputation after erasure; the request routes through appeal level 1.
- Counterparties to a shared engagement are notified that evidence in that engagement was redacted (not why), because their records reference it.
- Erasure requests are reviewed by the T&S function (founder until delegated) against legal-hold status, with the decision recorded.

### IV.2 Interpretation — versions, weights, contexts

Versioned, explainable, time-decayed (P-05), confidence-aware (P-06: under five completed structured engagements, no numeric score — "New — insufficient history"), role-contextual, appealable. Rulings:

- **Launch role contexts:** freelance-marketplace, employment-candidacy, learning, mentorship, organizational.
- **Cross-context defaults (P-25):** crossing freelance signals into employment matching is **disabled by default** until counsel and T&S review approve activation (XIII.1). When enabled, freelance signals enter employment matching at 50% weight and only in the categories *delivery reliability, communication responsiveness, dispute outcomes*. Never crossing into employment matching: rate levels, client identities, niche-specific quality scores. Learning signals never enter marketplace or employment matching without the Person's opt-in.
- **Weight changes** follow parameter governance (XIII.3): participants notified, public changelog, old-vs-new score comparison available for 90 days. Matching is forward-only — past matches are not re-run except to remedy upheld appeals.
- **Disclosure emphasis:** a Person may publish a disclosure profile emphasizing recent work; the profile is marked "recent-history view selected by participant." Decay (P-05) already provides structural recovery; there is no silent fresh-start that hides the marker.

### IV.3 Context fields — capture, absence, contest

System-known context (timestamps, outages, payment state) attaches automatically. **Dependency state** is evidence-based: a party marks "waiting on [counterparty] for [input]"; the counterparty is notified and may contest within the review window; uncontested markers stand as context; contested markers route to the engagement's dispute path and the affected signal is suspended pending outcome. Signals missing required context compute at reduced confidence and **cannot drive serious consequences alone**. Context may be supplemented after the fact through appeal level 1. "Agreement clarity" is a structural marker (objective-criteria count, revision-definition presence) computed from the agreement itself, not an opinion field.

### IV.4 Disclosure, matching, and the shadow-score boundary

Participant-controlled disclosure per audience; matching opt-out (future-effect); inference transparency with per-category signal blocking for outbound matching. Definitions: **safety restriction** = action limits from fraud/safety risk; **matching suppression** = removal from surfaced results; **ranking downweight** = lower position. Ruling on the boundary: fraud/safety signals may restrict actions and suppress visibility **temporarily** — maximum undisclosed window P-17 (14 days) — with notice that a safety review is underway (without detection mechanics). Beyond the window, the consequence either converts to a disclosed, appealable restriction or lifts. Every suppression is appealable. **"Affects opportunity"** means any change to matching eligibility, ranking, visibility, proposal/posting caps, pricing tiers, or escrow terms; all such signals are disclosable to the affected Person.

### IV.5 Consumer-reporting-style protections (rewording per legal review)

Because reputation signals can affect participant opportunities, **Esbla voluntarily adopts consumer-reporting-style protections**: access (full ledger and every interpretation applied), dispute (interpretation and missing context), correction (upheld disputes correct interpretation; affected future matching corrects forward), **adverse-action notice**, and no third-party sale (XIII.2). This is a protections framework, not a legal self-classification; jurisdiction-specific classification analysis is counsel-gated before marketplace launch. Adverse-action scope ruling: notice is generated when a Person loses eligibility, receives a cap reduction or restriction, is suppressed, or is excluded from a shortlist they otherwise qualified for **primarily due to one signal category**; routine ranking-position variation does not generate notices. The platform issues notices for platform-driven decisions; counterparties' own human decisions are theirs (the platform encourages structured feedback but cannot compel notice). Exported attestations carry a use-limitation notice; misuse by third parties is outside platform liability and stated as such.

### IV.6 Portability

Signed reputation attestation (JSON-LD verifiable credentials): credentials, verification tier, aggregates with confidence, evidence references. Raw evidence stays in Esbla; attestations move at the Person's initiative; returning Persons re-link history.

### IV.7 Cold-start fairness

Profiles below the P-06 threshold display "New — insufficient history" with certifications, skill validations, and portfolio carrying matching weight in lieu of history. **Exposure floor (P-07):** where qualified new candidates exist, matching reserves a floor share of surfaced shortlists for them, ranked by fit and validation evidence under explicit uncertainty. "New" is a neutral state, not a below-average rank. This is the structural counter to rich-get-richer reputation lock-in.

---

## Part V — Fairness, power asymmetry, and due process

### V.1 Consequence parity — enumerated

Counterparty consequences available and used: matching downweight, visibility reduction, **escrow-terms tightening in the counterparty's disfavor** (higher upfront funding, faster release to the other side), loss of auto-acceptance privileges, mandatory stricter agreement templates, candidate-search access limits, posting/proposal caps, suspension. High-impact consequences (suspending an active tenant; employment-affecting restrictions) require human sign-off. **A party's revenue contribution is explicitly inadmissible in enforcement decisions** — doctrine, not guidance.

### V.2 Power-imbalance detection

Presumptive review for tenants above the dispute-rate parameter (P-03); pattern flag at the win-rate parameter (P-04); named patterns for late approvals, post-acceptance refund demands, unusual churn, post-resignation review clusters. A high win-rate that survives human pattern review because the party is simply right clears the flag — flags trigger review, never automatic consequence (V.3).

### V.3 Meta-pattern specification

Unchanged from v2 and now parameterized: every production meta-pattern has a pattern ID, evidence threshold, observation window, excluded factors, confidence level, human-review threshold, appeal path, decay rule, and documented counter-examples. No serious consequence flows solely from an opaque aggregate. All thresholds live in Appendix A with measurement window, denominator, minimum sample size (below min-n: flags only, no consequences), and scope; threshold values are public by default, with a sparingly used, documented anti-gaming exception for exact values whose publication enables evasion.

### V.4 Graduated response

As v2: minor (signal only) → moderate (matching weight, visible, recoverable) → serious (suspension pending investigation; written allegation and evidence; P-27 response window before reputational publication; P-28 investigation window or restrictions lift) → severe (time-bound ban, published reinstatement path, anonymized public documentation) → catastrophic (permanent ban, legal reporting). Behavior-based, never demographic- or geography-based. Restriction scoping per III.4.

### V.5 Appeals — including before the panel exists

Ladder: automated recheck (P-29) → human review (P-18) → independent panel (P-31; activates at X.5 volumes). **Pre-panel protocol:** human review is performed by the T&S operator (founder initially) under a conflict rule — the reviewer of an appeal cannot be the original discretionary decision-maker; where the founder made the original discretionary call, the appeal gets a documented second-look protocol (cooling period, written strongest-critic self-challenge, and external reviewer involvement when stakes are high). **Pre-panel irreversibility bar (P-24):** permanent bans and public reputation publication are unavailable before the panel exists, except the catastrophic category. Panel mechanics: members are qualified external practitioners, paid from a ring-fenced platform budget, selection criteria published; decisions bind the platform's interpretations and consequences (not counterparties' off-platform conduct); one panel review per case, reopenable only on new evidence. Annual transparency report from year one.

---

## Part VI — Substrate primitives

### VI.1–VI.2 Identity and evidence

Per Parts III–IV, with Web3-ready nullable fields carried from v1/v2.

### VI.3 Workspace-level working copy — transfer mechanics and IP

Workspace as the unit of working copy (tenant-, freelancer-, collective-, or consortium-owned), role-scoped multi-participant access, transfer as permission change. Rulings:

- **Transfer manifest** is defined per milestone at agreement time: files, pages, configurations, data records, assets, and credential/secret rotation steps. What transfers is what the manifest says — ambiguity is an agreement defect surfaced at creation, not a post-hoc fight.
- Client receives **version history from engagement start** for transferred artifacts; the freelancer retains their own workspace history.
- Post-transfer, the client may revoke freelancer access instantly; during the engagement, revocation operates as pause/termination per agreement terms.
- A **snapshot is taken at every transfer** and retained per the retention policy.
- Multi-contributor workspaces transfer workspace state regardless of contributor count; contribution attribution lives in workspace roles and evidence.
- **Accepted milestones are final**: a dispute on milestone 3 does not claw back milestone 1; the only exception is fraud established through the dispute process.
- Continuous-delivery engagements use recurring acceptance checkpoints with identical manifest mechanics.
- **IP definitions:** *delivered instance* = the specific configured artifact transferred, including client content, brand assets, client-specific copy, and the assembled composition as delivered — owned by the client. *Structural pattern* = reusable arrangement, component logic, and non-client-specific code, excluding client content, assets, copy, and client-confidential configuration — license retained by the freelancer unless exclusivity (full or named-component partial) is purchased at agreement time or by later addendum at a price the freelancer sets and may decline. Client content and assets never enter the section library. The platform enforces **its own agreement terms** with evidence; it does not adjudicate external copyright originality — it is not a copyright court, and parties pursue external IP claims through the legal system.

### VI.4 Communication Gateway

As v2: central routing, opt-out, audit, optional AI translation, bounded cross-tenant channels, guardian-mode restrictions.

### VI.5 Configuration with constraints

Canonical defaults, declared overrides, save-time combination validation, periodic re-baselining offers, layered resolution (platform → industry pack → participant-type → tenant → Person). Industry packs: versioned, never auto-updated, tenant-owned on application, removable without data loss.

### VI.6 AI dual-plane — governed, defined, bounded

- **A credit** is a cost-normalized unit; the user-facing schedule expresses it in actions ("a question ≈ 1; a document summary ≈ 5") and is published. **Chat credits** and **action credits** (AI-generated workflows, proposals, consequence-bearing actions) meter separately; consequence-bearing AI actions pass Gatekeeper.
- Freemium: P-08 per Person per day plus a per-tenant organization pool per P-09 (a reduced per-staff rate with a hard cap) — a thousand-staff tenant does not multiply freemium a thousandfold. Purchasing-power adjustment is a per-market parameter. Earnable credits require **accepted** contributions (quality-reviewed; per-period caps) — farming low-quality contributions earns nothing. Risk-tiered limits are permitted, disclosed, and appealable. Tightening requires notice per P-11; the cost kill-switch (P-10) triggers parameter review, never silent removal.
- **BYO-API data boundary:** a freelancer's key may process client-tenant data only with the client's explicit consent, captured at engagement setup on a surface showing the provider, model, and a link to that provider's data-use and retention terms. Consent is revocable mid-project with prospective effect. If the client's AI plane is used instead, the client pays and that is disclosed at setup. Provider liability follows the key owner's provider relationship; both parties acknowledge third-party-provider risk at consent. **Prohibited from BYO processing:** any other tenant's data, platform credentials, identity verification artifacts, and anything the client marks restricted. Engagement-related AI prompts/outputs used for deliverables are workspace records (evidence-eligible); personal drafting is not. AI outputs entering the section library follow the VI.3 pattern-vs-instance rule.

### VI.7 Off-ramps, export honesty, and the restore drill

- Export formats are defined per primitive before implementation (identity JSON-LD/VC, evidence NDJSON, workflow state-machine definitions, configuration YAML, reputation attestation, sites as standard static assets).
- **Export honesty tiers:** static content exports at full fidelity. Dynamic capabilities export as data + content + structure plus a documented capability map of what requires re-implementation elsewhere: forms export their definitions with standard endpoint/webhook configuration; authentication, e-commerce checkout, and LMS-dynamic surfaces are platform services whose data and content export fully while the running service does not. The commitment is **no content, data, or configuration hostage** — ever; functional parity export wherever the feature is static-expressible. Export packages include assets, DNS guidance, deployment instructions, and environment-variable documentation.
- **Export is never withheld for unpaid invoices**; collection is pursued separately. Post-exit, tenant operational data is deleted per the retention schedule after export; the evidence ledger is retained per legal and dispute needs, disclosed in the privacy policy. Tenant data export and platform evidence export are distinct artifacts.
- **Restore drill:** annual; performed by a non-founder (the trustee or a contracted external engineer); synthetic or consented pilot-tenant data only; objectives per P-19 (RTO/RPO); tested both from encrypted backups and by reapplying a customer export to a fresh instance; **failure automatically blocks the next front-name launch** until remediated; the written drill report lives in the repo, with summaries available to investors on request.

### VI.8 AI verification and acceptance flow

- Criteria are flagged objective or subjective at agreement time, drawn from a criteria library plus custom entries; either party may require a minimum count of objective criteria; zero-objective agreements trigger a dispute-exposure warning to both sides.
- **Shadow mode first (P-15):** the first 100 AI-verified milestones platform-wide run advisory-only; thereafter AI verification is **binding only where both parties opted in at agreement**; otherwise it remains advisory input to mutual acceptance.
- Binding auto-verification requires confidence ≥ P-12; below threshold, human or mutual review. Milestones above the high-value threshold (P-13) always require explicit counterparty confirmation regardless of AI verdict.
- On AI pass: the client's confirmation window opens (auto-acceptance ladder below). On AI fail: the freelancer receives a remediation window before any dispute; a failed verification never blocks payment by itself — it routes to review.
- **Auto-acceptance ladder (subjective criteria and post-pass confirmation):** the agreed review window (default P-16) **plus** at least two successful notices through approved channels **plus** a visible in-platform pending status **plus** a final 48-hour grace notice. Failed notification delivery pauses the clock. Milestones above P-13 are excluded from auto-acceptance entirely — they require explicit response or route to dispute. Auto-acceptance is reversible only through dispute with cause (fraud, proven notice failure). Auto-acceptance events are recorded as evidence of client non-response context.
- Verification-related human review: SLA per P-18 (5 business days); cost platform-absorbed at launch volume from the T&S budget (parameterized later).
- **Scope-narrowing trigger (P-14):** verification-related disputes above 3% of AI-verified milestones over a 30-day window (minimum sample applies), **or any single disputed AI verification above P-13**, triggers verification-scope review.

### VI.9 Remaining primitives

Audit/outbox, Access Core/Gatekeeper, Foundry activation with tenant-activation-aware frontend bundle pruning, billing substrate with multiple pricing presentations, design system — carried from v2, subject to VI.5 constraints and VI.7 off-ramps.

---

## Part VII — Operating conventions

As v2's fourteen, with v3 wording: evidence-first reputation; three-layer reputation; symmetric measurement with consequence parity; specified meta-patterns only; structured agreements with objective/subjective flagging and IP terms; workspace-level working copy; tiered identity with one profile per participant type; graduated response with due process and time-bound bans (reinstatement paths except catastrophic); customer sovereignty operationalized through off-ramps; platform independence through pluggable adapters; configurability with constraints and a small immutable backbone; prohibited inferences paired with affirmative participant control; communicate capabilities, never guarantee outcomes; consumer-reporting-style protections with no third-party sale.

---

## Part VIII — Capability map

Carried from v2 (tenant operations, freelancer toolkit, client hiring, job-seeker matching, student learning-to-earning, staff employment, future B2B and mentorship), with:

- **Payout rails as verification-pending assumptions:** the per-rail capability matrix (refund support, hold/escrow-like support, business accounts, foreign-client payouts, fee structures) is completed and counsel/vendor-verified per market before that market's marketplace launch. Known facts stand (PayPal does not operate in Pakistan); suitability claims for Payoneer, Wise, bank transfer under SBP rules, JazzCash, EasyPaisa, and Raast are launch-gate assumptions until verified. PSEB registration is surfaced as obligation guidance; whether it is required before payouts is counsel-gated. Payout fees are passed through transparently. **Payout failures caused by platform or rail do not affect participant reputation.**
- Consequence-bearing capabilities remain capacity-gated (X.4).
- **Data residency** is decided per market before commercial launch by counsel-informed analysis covering primary data, logs, backups, AI prompts, exports, and analytics; the decision record names the counsel input and the founder's sign-off; cross-border serving questions (e.g., a Pakistani freelancer serving an EU client) are part of that analysis; BYO-API residency implications are disclosed on the consent surface.

---

## Part IX — Phase structure and artifact plan

### IX.1 Phases

6A → 6B → 6C → 6D → 6E (campaign scope = cross-platform attribution + internal outbound; Scope C deferred; **Phase 9 restored — locked**) → 6F → foundations transition (runtime wiring completion, doc-as-SOT activation, doctrine ratification) → Phase 7 wedge → Phase 8 (demand-gated) → Phase 10 (gate-controlled).

### IX.2 Artifact plan and source-of-truth reconciliation

- 6A–6C are the **existing generated repo artifacts**; they receive one **consolidated amendment** covering ecosystem architectural extensions and the runtime wiring scope. The amendment's own control document lists its exact files; the blueprint does not enumerate files. Where existing phase docs conflict with this blueprint, the amendment resolves the conflict explicitly — the blueprint never silently overrides (0.3).
- 6D–6F receive **full self-contained phase plans** (not amendments), authored under this blueprint's binding constraints.
- Dependency-violation checking of the amendment and new plans is performed by three-AI review plus the standard gate audit.
- The phase structure continues the existing v4.1 numbering; the AKTI→Esbla naming refactor (XIII.3 gate) renames artifacts without renumbering history.
- **Active-run continuity (binding):** the in-flight Phase 6C run completes under its approved run contract. v5.0 work that touches runtime (refactor Waves 3–5, runtime wiring) begins only after 6C closure is verified from git history, the run journal, and ticket artifacts. Docs-and-control authoring (Waves 1–2, amendment and plan ratification) may proceed in parallel. No v5.0 document claims current execution status without that verification.

### IX.3 Runtime wiring — falsifiable completion

The demo script from v2 (register → tier up → tenant → industry pack → Foundry activation → absent-when-inactive → Gatekeeper action → audit visible → invoice → export) is extended with **negative tests**: a cross-tenant isolation attempt fails; a failed-KYC path lands correctly at Tier 1; a message to an opted-out recipient is blocked at the gateway; a failed payment produces a correctable invoice state; an inactive module's route returns 404 server-side. The script runs in CI (nightly post-wiring) against seeded fixtures; the platform owner (founder until delegated) owns script maintenance. Accessibility and browser-rendering checks are a separate QA track, not the wiring gate.

### IX.4 Environment and test doctrine

Staging and production with deployment cadence, migration discipline, and rollback before the first external tenant; test pyramid (seed → integration → E2E golden paths) required per phase; restore drill per VI.7.

---

## Part X — Launch gates and revenue validation

### X.1 Revenue-validation overlay — with definitions

R0 internal use → R1 three paying clients (concierge) → R2 ten (repeatable onboarding) → R3 thirty (churn and support measured; unit economics positive) → R4 generalize. **Definitions:** a *paying client* is an external party paying a real invoice at no less than the price floor (P-22: ≥50% of list), not refunded within 60 days; repeat clients count once per stage; *workflow complete* = the full wedge loop (delivery → acceptance → payment) at least once; churn at R3 uses a 90-day window (P-23); *unit economics positive* = contribution margin **including founder/operator labor costed at market replacement rate**. R2 and R3 must track operator minutes per client across onboarding, support, rework, and delivery-assist; concierge profitability that depends on uncosted founder labor is not profitability.

### X.2 Validation sprint — with pilot liability boundary

After Phase 6C wiring: P-30 external tenants, one vertical, free, concierge-onboarded, four weeks of real use. **Pilot terms are mandatory:** scope, support limits, data-export guarantee, rollback path, explicit no-production-critical-dependency statement, and escalation process. Free pilots **exclude** regulated payments, employment consequences, public reputation, escrow, and irreversible actions unless separately approved. Pilots still require ToS, privacy policy, data-processing terms, and the appropriate identity tier.

### X.3 GTM thesis — agency channel, specified

First segment: solo web freelancers and 2–10-person web/design agencies serving SMBs. The agency incentive bundle: the handoff/edit-mode system removes their post-delivery support burden; the section library compounds their speed; recurring revenue share or bill-through on client subscriptions; agency-branded client editor with mandatory Esbla Spark platform identity; reduced client lock-in as a selling point *to their clients*. Payment flow: the client pays the platform subscription; the agency margins or bills through — both supported. Off-platform leakage by agencies is an accepted risk mitigated by client-side value, not surveillance. **Minimum channel success before scaling GTM:** three agencies, each with three or more client sites live and retained 90 days.

### X.4 Operating-capacity gate

Unchanged from v2, with the capacity ceiling explicit: the named T&S operator (founder initially) carries a documented concurrent-case ceiling; beyond it, consequence-bearing volume throttles rather than due process degrading.

### X.5 Marketplace launch gates — supply and demand

Supply gates use P-32 through P-35: active Tier-2 supply-side participants, completed structured beta projects, beta dispute rate, payout rail count, tested escrow failure paths including refunds, named T&S operator, appeal ladder evidence, and transparency-report readiness. **Demand gates use P-36 through P-38:** active demand-side clients, repeat-client rate or evidence-based exception, median client time-to-first-qualified-provider, median provider time-to-first-paid-project, payment and payout success, gross marketplace volume, average order value, and a recorded sufficiency decision at the gate review. Time elapsed is not a trigger; these P-IDs and that decision are.

### X.6 Minor-safety gate

Unchanged from v2; immutable per XIII.2. Marketplace participation under 18 is prohibited, hard rule.

---

## Part XI — Go-to-market and competitive posture

Honest competitive set (Zoho One, Odoo as nearest comparators; differentiation = reputation infrastructure, integrated marketplace with structured agreements and escrow, builder-handoff wedge, tiered-identity trust, cost-honest pricing); sequential front-names with explicit maintenance budgets or sunset plans; brand transparency guardrail (no acquisition-style framing implying history that did not exist; approved framings "powered by Esbla," "part of the Hautm product family"); stages per v2. **Naming:** the product is Esbla Spark; Hautm is the company and operator brand; AKTI references persist only in historical artifacts; code/package renaming follows the XIII.3 gate; trademark search for "Esbla" and "Hautm" is counsel-gated before public launch; the rename completes before any public marketing under the Esbla name.

---

## Part XII — Risk register

Owner defaults to **Usman Hussain** until explicitly delegated; Founder/Operator: Usman Hussain until delegated; delegation requires a named person, authority boundary, escalation path, and review date. Thresholds reference Appendix A parameters (measurement window, denominator, minimum sample, scope, and change process live there).

| # | Risk | Why it matters | Mitigation | Owner | Trigger (param) | Stop condition |
|---|------|----------------|------------|-------|-----------------|----------------|
| 1 | KYC exclusion | Mission failure | Tiered identity; jurisdiction alternatives (III) | F | P-01 breach | Market expansion paused until alternative verification live |
| 2 | Reputation harm | Trust collapse; legal exposure | Three layers, decay, appeals, IV.5 protections | F | P-02 breach | Interpretation changes frozen; external review |
| 3 | Algorithmic bias | Liability; mission betrayal | Context fields; audits; reviewer-pattern detection | F | Disparate-impact audit finding | Algorithm version suspended; manual mode |
| 4 | Dispute abuse by powerful parties | Adverse selection | P-03/P-04 detection; consequence parity | F | Flags >2% of active tenants | Presumptive review tightened; enforcement data published |
| 5 | Freemium AI cost blowout | Unbounded liability | Governed parameters; org pools; earnable credits | F | P-10 breach 2 consecutive months | Parameter tightening with P-11 notice |
| 6 | One-operator incapacity | Continuity failure | Trustee; DR runbook; non-founder restore drill (XIII.5) | F | Operator unreachable P-39 | Trustee protocol activates |
| 7 | Premature marketplace launch | Trust destruction | X.5 supply + demand gates | F | Any gate unmet | Launch blocked |
| 8 | Brand transparency backfire | Reputational damage | XI guardrail; legal review | F | Any reveal planned | Reveal blocked pending review |
| 9 | Data residency / regulatory | Market loss; fines | Counsel-gated residency decision (VIII) | F | New-market entry | Launch blocked pending decision record |
| 10 | Payout-rail gaps and legality | Mission-critical payments fail | Verified rail matrix; local rail as gate | F | <2 verified rails in market | Marketplace blocked in market |
| 11 | KYC vendor coverage (NADRA/CNIC) | Tier 2/3 unreachable | Local vendor contracting pre-launch | F | Coverage unconfirmed 90 days pre-launch | Launch date moves |
| 12 | AI-provider dependency | Workflow breakage | Multi-provider adapters; version pinning; eval suites | F | Provider policy change notice | Provider switch; degradation mode |
| 13 | Channel policy volatility (WhatsApp etc.) | Outbound loss | Adapters + fallbacks; number-reputation management | F | Restriction event | Fallback channels activate |
| 14 | AI verification error/dispute rate | Payment disputes | Objective-only scope; shadow mode; thresholds (VI.8) | F | **P-14: >3%/30d or any high-value dispute** | Verification scope narrowed; human review expanded |
| 15 | Configuration fragmentation | Support impossibility | Constraints; save-time validation; re-baselining | F | Non-reproducible bug trend | Combination freeze; cleanup sprint |
| 16 | First-wedge scope creep | Launch never ships | X.2 wedge rule | F | Backlog exceeds wedge definition | Items deferred post-R3; scope frozen |
| 17 | Willingness-to-pay failure | No viable business | Price discovery R1–R2; R3 unit-economics gate incl. founder labor | F | R3 negative | Pricing/segment pivot review |
| 18 | Minor-safety incident | Catastrophic harm | X.6 gate; guardian mode; monitored channels | F | Any minor-safety signal | Affected surfaces suspended |
| 19 | Doc-as-SOT propagation misuse | Doctrinal single point of failure | Blast-radius caps; human gates; cooling periods (XIII.4) | F | >20 files or >2 services touched | Human review required pre-merge |
| 20 | Venture sunk-cost blindness | Years past honest reassessment | Annual checkpoint with kill criteria (**XIII.8**) | F | Checkpoint date or any stop condition firing | Documented continue/pivot/stop decision |
| 21 | Cross-tenant data leak | Isolation is the trust foundation | DB-level RLS in wiring scope; negative isolation tests in the demo script; audit | F | Any isolation test failure or credible report | Affected surfaces frozen; incident process |
| 22 | Chargeback/fraud spiral | Marketplace economics collapse | Processor-as-MoR posture; velocity limits; escrow holds; payment-success gates (P-21) | F | Chargeback rate exceeds processor threshold | New-buyer limits tightened; marketplace intake throttled |
| 23 | BYO-API data leak | Client data reaches a third-party AI without consent | VI.6 consent boundary; prohibited data classes; consent surface | F | Any boundary violation | BYO suspended for the actor; incident process |
| 24 | Trustee abuse | Emergency powers misused | Audited trustee actions; second-contact suspension; founder replaceability (XIII.5) | F | Any unauthorized trustee action | Trustee suspended pending review |
| 25 | Rename/refactor breakage | Blind AKTI→Esbla rename breaks runtime or contracts | Wave plan with inventory, classification, exact-file PRs, validation gates | Usman Hussain | Any unclassified active hit or failed gate | Rename wave blocked until classified |
| 26 | Metadata drift | Headers break parsers, schemas, or generated files | Metadata standard unsafe-file list; registry fallback | F | Any parser/schema failure caused by metadata | Metadata edits reverted; registry-only for that file class |
| 27 | Stale-document authority | Codex follows superseded documents as authority | Suite manifest; document registry; status fields; archive structure | F | Any artifact citing a superseded document as authority | Work product invalidated and re-derived |

---

## Part XIII — Governance, liability, and kill criteria

### XIII.1 Ratification and review

Cooling period (P-26) for backbone-touching changes with written strongest-critic self-challenge; **three-AI review is a stress-test, not governance** — final ratification requires a human decision record per 0.2; external human review of reputation, identity-enforcement, escrow, marketplace, and minor-safety doctrine before public activation of those capabilities (recommended pre-ratification where feasible). Reviewer qualifications: licensed counsel for legal sections; practitioners with operational T&S experience for trust sections. Reviewer comments are stored in the repo. Usman Hussain may override an external review only with a written record stating the recommendation, the override, and the reasoning — silence is not an override.

### XIII.2 Immutable backbone (bounded wording)

Security primitives; tiered identity verification for high-trust actions; customer-first data rules; the lens (Part II, bounded form); prohibited-inference rules with affirmative participant control; anti-discrimination and bias protections; consumer-reporting-style reputation rights; minor-safety rules; forward-dependency rule; two-frontend rule; communicate-capabilities-never-guarantee-outcomes; and the following, with legal bounds stated:

- **Reputation and behavioral data are never sold or licensed as a commercial data product.** Authorized subprocessors, participant-initiated portability, legal compliance, and safety disclosures are governed separately and create no commercial resale rights.
- **No demographic- or geography-based enforcement.** Lawful sanctions compliance, age rules protecting minors, and jurisdiction-specific legal restrictions are regulatory compliance, not enforcement bias, and are applied as narrowly as law requires.
- **No outcome guarantees.** Factually accurate testimonials and case studies are permitted with results-not-typical framing; guarantees are not.

### XIII.3 Decision gates and parameter governance

The v2 decision-gate table carries forward (AKTI naming, wedge positioning, builder stack, pricing per front-name, residency per market, platform fee — published, bounded by fee ≤ platform value delivered, with fee-to-cost ratio published, default 5%; Web3; marketplace launch; reveal; ownership/funding; T&S staffing). **Parameter governance:** every Appendix A parameter has an ID, default, window, denominator, minimum sample, scope, and owner; changes require a recorded decision, a public changelog entry, and notice per P-11; values are public by default with a documented anti-gaming exception used sparingly.

### XIII.4 Doc-as-SOT propagation safeguards

Allowed trigger documents are enumerated in the propagation control doc (ratified doctrine and phase plans only); **never auto-propagated:** Prisma/schema, contracts packages, security configuration, payment code, and generated registries — these always require a human gate; propagation PRs require passing tests; blast-radius caps (>20 files or >2 services → human review) and rate limits (one wave in flight); full lineage audit; blast-radius classification is itself reviewed at audit; account compromise is mitigated by the human gates plus mandatory hardware-key 2FA on the ratifier account.

### XIII.5 One-operator continuity — trustee specified

Before the first external paying tenant: DR runbook; a named **trustee** under a limited legal mandate (power-of-attorney-style) with enumerated powers — restart services, send status communications, freeze new billing, initiate restore, engage pre-authorized vendors up to a spending cap — and enumerated prohibitions: no tenant-data browsing beyond operational necessity, no doctrine changes, no funds movement beyond the vendor cap. Activation: operator unreachable seven days via a defined multi-channel contact protocol with emergency-contact verification, or operator self-activation. Safeguards: trustee actions are fully audited; a second emergency contact can suspend the trustee; the founder can replace the trustee at any time. The ToS discloses that business-continuity procedures exist; the trustee's identity remains private.

### XIII.6 Participant harm review

Unchanged from v2: written harm review (exclusion, wrongful penalty, manipulation, appeal path, correctability, decay, human review) before any reputation, identity-enforcement, employment, marketplace, or AI-matching feature launches; stored with the launch record.

### XIII.7 Liability boundaries

"Platform of record" is an **internal term, not a legal classification**; the actual legal posture per market — marketplace facilitator or intermediary status, merchant-of-record allocation (default: the payment processor partner is merchant of record where available; the platform avoids MoR), chargeback handling through the processor with the platform's dispute-process interface, fraud-loss allocation in ToS, and tax-document issuance (1099-K equivalents and analogues) — is **determined by counsel per market before that market's marketplace launch** and recorded as a decision gate. Esbla provides templates, escrow mechanics, evidence, measurement, and dispute process; participants contract with each other; Esbla does not warrant outcomes, work quality, or business results. **Templates and compliance packs:** drafted with counsel per jurisdiction before public availability (AI-assisted drafting permitted; counsel review required); each carries a verified-as-of date and a limitation notice the user must acknowledge; tenants may modify templates (the platform does not review modifications); packs are informational plus workflow scaffolding, versioned, with a commercially reasonable update commitment when law changes and explicit disclaimers for reliance on outdated guidance. Voluntary IV.5 protections double as liability reduction: due process documented is exposure reduced.

### XIII.8 Kill criteria and venture checkpoints

Feature-level: success metrics and kill criteria defined at inception; missed kill criteria → sunset with data preserved. Venture-level: an annual checkpoint, plus out-of-cycle on any risk-register stop condition, answering in writing: is R-stage progress real (R1 within 12 months of wedge launch; R3 within 24, or a documented evidence-based revision); is churn consistent with viability; is founder runway (financial and personal) sufficient; would a rational outsider, on the evidence alone, continue, pivot, or stop. The written answer is the artifact. Sunk cost is not a reason to continue.

---

## Part XIV — Neutrality and language standard

Factual, testable language; no competitor disparagement; no moral-superiority claims; no guaranteed-outcome language; no implication that other platform models are universally exploitative. **Scope:** ratified doctrine, all external materials, founder public posts, and investor decks follow this standard; internal working documents may use stronger shorthand but never contradict the bounded doctrine. Testimonials and case studies follow XIII.2's accuracy-with-no-guarantee rule. Marketing copy is reviewed against this standard before each front-name launch.

---

## Part XV — Non-commitments with revisit triggers

These are strategic defaults, changeable only through the XIII.3 decision-gate process — never by ad-hoc sales pressure:

| Non-commitment | Revisit trigger |
|---|---|
| No enterprise sales motion | Sustained inbound enterprise demand after R3, evaluated at a gate |
| No campaign Scope C (AI ad creation); Phase 9 restored | Phase 9 is restored as Marketplace / Trust Layer. Scope C is reconsidered only through a XIII.3 gate (AI capability maturity plus documented demand) |
| No native mobile apps v1 | Measured PWA limitations blocking adoption |
| No Web3 activation | Existing XIII.3 gate |
| No full EOR infrastructure v1 | ≥10 tenants requesting compliant cross-border employment |
| No multi-vendor-stack positioning v1 | Year-3 review or strategic-partner gate; off-ramp and import tooling are sovereignty features, fully compatible with Esbla-native positioning |
| No outcome guarantees | Permanent (XIII.2, bounded form) |
| No commercial sale of reputation/behavioral data | Permanent (XIII.2, bounded form) |
| No demographic/geography-based enforcement | Permanent (XIII.2, bounded form) |
| First launch ≠ ecosystem launch | Permanent until R3 |

---

## Appendix A — Parameter registry

All governed operational thresholds in this doctrine live here and only here; dates, version numbers, phase numbers, document versions, section numbers, examples, and non-governed explanatory counts are exempt; other suite documents reference parameters by ID (single-source-of-numbers rule, metadata standard). Owner: Founder for every parameter until delegated under the Part XII delegation format. Defaults apply at launch; changes follow XIII.3 with P-11 notice. Window = measurement window; min-n = minimum sample below which flags fire but consequences do not; where a rate lacks an explicit denominator, the denominator is the count of qualifying events in the window.

| ID | Parameter | Default | Window / scope | Min-n | Notes |
|----|-----------|---------|----------------|-------|-------|
| P-01 | Tier-2 rejection-rate alert | >10% | 90d / per market | 50 | Risk 1 trigger |
| P-02 | Appeal-volume alert | >5% of scored engagements | 90d / platform | 100 | Risk 2 trigger |
| P-03 | Tenant dispute-rate presumptive review | >2× platform median | 90d / per market | 5 disputes | Flags → human review |
| P-04 | Win-rate pattern flag | ≥90% across ≥10 disputes vs counterparties <10 engagements | trailing 12mo / per market | 10 | Review, not auto-consequence |
| P-05 | Reputation decay | ≤25% weight >24mo; excluded from matching >48mo | — | — | Per signal |
| P-06 | Numeric-score minimum | 5 completed structured engagements | — | — | Below: "New" badge |
| P-07 | New-profile exposure floor | 15% of surfaced shortlists where qualified new candidates exist | per query | — | Cold-start fairness |
| P-08 | Freemium credits / Person | 300/day | daily / per market (PPP-adjustable) | — | Chat vs action metered separately |
| P-09 | Org freemium pool | max(1,500, 30×staff), hard cap 10,000/day | daily / per tenant | — | Reduced per-staff rate; hard cap |
| P-10 | Freemium cost ceiling | US$0.25 per MAU (provisional; revalidated at R1) | monthly / platform | — | 2 consecutive breaches → review |
| P-11 | Parameter-change notice | 14 days (30 for material tightening) | — | — | — |
| P-12 | Binding AI-verification confidence | ≥0.90 | per verification | — | Below: advisory |
| P-13 | High-value milestone threshold | greater of US$1,000 or top-decile AOV | per market | — | Excluded from auto-accept; binding AI prohibited |
| P-14 | AI-verification dispute trigger | >3% of AI-verified milestones, or any disputed verification >P-13 | 30d / platform | 30 | Risk 14 |
| P-15 | AI shadow-mode span | First 100 AI-verified milestones advisory | platform | — | Then opt-in binding only |
| P-16 | Auto-accept review window | 7 days + 2 notices + 48h grace | per agreement | — | Clock pauses on failed delivery |
| P-26 | Backbone-change cooling period | 7 days | per backbone-touching doctrine change | — | Applies before human ratification of binding backbone changes |
| P-27 | Serious-case response window | 7 days | per serious case | — | Response window for serious due-process cases |
| P-28 | Serious-case investigation window | 30 days | per serious case | — | Investigation target for serious due-process cases |
| P-29 | Automated appeal recheck SLA | 72h | per appeal | — | First-stage automated recheck before human review |
| P-30 | Validation sprint pilot tenant count | 5-10 pilot tenants | per validation sprint | 5 tenants | Pilot count target under pilot terms |
| P-31 | Independent appeal panel review window | 30 days | per activated panel case | — | Independent panel window after human review |
| P-32 | Marketplace supply-side active participant gate | At least 100 active Tier-2 supply-side participants over trailing 30 days | per marketplace launch gate | — | Supply readiness threshold |
| P-33 | Marketplace completed structured beta project gate | At least 50 completed structured beta projects | per marketplace launch gate | — | Structured beta completion threshold |
| P-34 | Marketplace beta dispute-rate gate | Less than 5% beta dispute rate | per marketplace launch gate | — | Marketplace quality threshold |
| P-35 | Marketplace payout rail gate | At least 2 payout rails live in launch market, with at least one local rail | per marketplace launch gate | — | Payout readiness threshold |
| P-36 | Marketplace demand-side active client gate | At least 30 active demand-side clients over trailing 60 days | per marketplace launch gate | — | Demand readiness threshold |
| P-37 | Marketplace repeat-client gate | At least 20% repeat-client rate or evidence-based exception | per marketplace launch gate | — | Demand quality threshold |
| P-38 | Marketplace payment and payout success gate | At least 98% payment and payout success | per marketplace launch gate | — | Payment reliability threshold |
| P-39 | Trustee protocol operator-unreachable trigger | 7 days | per continuity incident | — | Trustee protocol activation trigger |
| P-17 | Max undisclosed safety suppression | 14 days | per case | — | Then disclose-or-lift |
| P-18 | Human review SLAs | Appeals 14d; verification reviews 5 business days | per case | — | — |
| P-19 | Restore drill objectives | RTO 24h; RPO 24h | annual | — | Failure blocks next launch |
| P-20 | Reputation bond | ≤50% transaction value; market-specific local-currency cap (reference US$500) | per transaction / per market | — | Refundable; segregated; never for learning |
| P-21 | Marketplace demand gates | ≥30 active clients/60d; ≥20% repeat; payment & payout success ≥98% | trailing / launch market | — | Plus measured GMV, AOV, time-to-first metrics |
| P-22 | R-stage price floor | ≥50% of list price | per invoice | — | Defines "paying client" |
| P-23 | R3 churn window | 90 days | R3 | — | — |
| P-24 | Pre-panel irreversibility bar | No permanent bans or public reputation publication before panel, except catastrophic | until panel active | — | — |
| P-25 | Cross-context reputation weight | Disabled by default; when enabled: freelance→employment 50%, limited categories | — | — | Activation gated on counsel + T&S review (IV.2, XIII.1) |

---

## Closing

V1 articulated the vision. V2 bound it to mechanisms. V3 makes it decidable: every absolute is bounded, every threshold is a governed parameter, every open question is either ruled on here or assigned to a named gate with an owner and a verification requirement. What remains genuinely unknown — jurisdiction law, vendor capability, market willingness to pay — is marked as exactly that, with the launch gates that prevent it from being assumed.

End of blueprint v3.1 — strategic spine of documentation suite v5.0.
