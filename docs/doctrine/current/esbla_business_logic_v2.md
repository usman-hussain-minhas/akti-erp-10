---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v2.0
created: 2026-06-13
last_updated: 2026-06-13
status: for_ratification
document_type: operational_doctrine
scope: Global business logic for Esbla Spark — operational doctrine tier under Blueprint v3.1.
title: Esbla Spark — Global Business Logic v2
ratifier: Usman Hussain
---

# Esbla Spark — Global Business Logic v2

**Target repo path:** `docs/doctrine/current/esbla_business_logic_v2.md`
**Authority tier (Blueprint 0.3):** future intended doctrine order is law > participant contracts > Blueprint v3.1 > **this document** > phase plans > implementation. Current executable repo truth remains Prisma, contracts, manifests, generated registry, accepted ADRs, active controls, tests, and validation evidence until post-6F doc-as-SOT activation.
**Supersedes:** `business_logic_v4_amendments_v1.md` in full (disposition in §12). The *Spark Platform v4 Global Business Logic* (`0_business_logic.md`, sections 1–22) becomes historical evidence. The active carry-forward rule set is transcribed into `esbla_business_logic_v2_appendix_a_carried_forward_v4_rules.md`; Codex must not rely on historical AKTI-era files as required active doctrine.

## §0 Carry-forward and supersession rule

Every LOCKED rule carried forward from business logic v4 is active only through the Esbla-named carry-forward appendix unless enumerated below. The enumerated supersessions are:

1. **Naming (v4 §2):** company HAUTM, product Esbla Spark; AKTI naming is legacy-only per the refactor plan and metadata standard. Commercial model (capability-based modules/services, consumption-honest pricing, cost honesty) carries unchanged.
2. **Identity (v4 §8 registration reading):** any reading of "one Person = one verified identity at registration" is superseded by **tiered identity** (§3). The Person Graph itself, global opt-out (ADL-004), and one-Person-one-account remain.
3. **Reputation:** the opinion-review prohibition carries forward and is now implemented as the **three-layer architecture** (§4); "permanent and immutable evidence" is superseded by **append-only with tombstone/redaction and legal hold**.
4. **AI assistance:** any unbounded-freemium reading is superseded by the **governed dual-plane** (§7).
5. All v4 architecture invariants explicitly carry: forward-dependency rule (N depends on ≤N), two-frontend separation, Foundry as single runtime authority (foundry_runtime_authority is bootstrap root; service_manifest_contract depends on it, never the reverse), soft delete, transactional outbox/Saga (ADL-001, no 2PC), UUIDv4 idempotency (ADL-003), two-phase uninstall (ADL-006), invoice immutability, budget caps/prepaid, customer-first data protection (v4 §15), industry configuration system, compliance packs, optimization system, ADL-013–024.

**Single-source-of-numbers:** governed operational thresholds appear here only as parameter IDs; values live solely in Blueprint v3.1 Appendix A. Dates, versions, phase numbers, document versions, examples, section numbers, and non-governed explanatory counts are exempt.

## §1 Hard-rule additions (immutable without ADR + blueprint amendment)

Added to the v4 §3 hard-rule set, sourced from Blueprint XIII.2: no commercial sale or licensing of reputation/behavioral data as a data product; no demographic- or geography-based enforcement (behavior-based only; lawful compliance applied as narrowly as law requires); minor-safety rules (no marketplace under 18; guardian-linked mode; monitored minor-involved mentorship); communicate capabilities, never guarantee outcomes; prohibited inferences (no personality inference, no background-based performance prediction, no fit-scoring beyond stated preferences, no hidden matching logic) paired with affirmative participant signal-blocking; bounded customer-first rule (Blueprint Part II).

## §2 Participants and profiles

Participant types: tenant-owner, staff, freelancer, client, job-seeker, student, mentor (B2B and others post-6F). **One profile per participant type per Person** — hard rule; a freelancer profile holds multiple service categories under one identity. A Person may own **multiple tenant organizations** and hold staff profiles in others; personal and organizational reputations are distinct ledgers with recorded responsible-individual attribution. **Collective accounts** operate as tenants with a designated verified representative; member conduct scopes to members. **Restriction scoping:** conduct violations scope to their context; integrity violations (fraud, identity abuse, safety) scope to the whole Person.

## §3 Tiered identity

T0 anonymous (browse) → T1 contact-verified (learning, community, drafting, platform-meta AI; reputation marked "identity unverified," used only in T1 contexts) → T2 identity-verified via provider-neutral KYC adapters (marketplace, hiring, payments-in, structured agreements, paid adult mentorship, portability) → T3 payout/business-verified (payouts, escrow release, employment contracts, commercial tenant operation). Guardian-linked mode for minors. Tier-transition rulings (continuity, failed-KYC stays T1 with appeal, canonical-account designation for multiple T1 histories, de-dup flags → human review) per Blueprint III.2–III.3. Jurisdiction KYC paths (NADRA/CNIC, bank-account verification) and reputation bonds (P-20 bounds; never for learning/community) are launch-gate assumptions per Blueprint III.6. Bans are tier-scoped, time-bound with reinstatement paths except the catastrophic category.

## §4 Reputation — three layers

**Evidence ledger:** append-only factual events with context captured at write time (timezone, availability, dependency state via contestable waiting-on markers, outage flags, payment state, agreement-clarity markers, dispute outcome); tombstone/redaction framework for lawful erasure (aggregates recomputed where separable, else flagged and weight-capped, never the sole basis for adverse action); legal hold; counterparty redaction notice. **Interpretation:** versioned, explainable, time-decayed (P-05), confidence-aware (P-06 — below threshold: "New — insufficient history," no numeric score), role-contextual (cross-context crossing **disabled by default**, P-25), forward-only on algorithm change with 90-day old/new comparison. **Disclosure:** participant-controlled per audience; matching opt-out (future effect); inference transparency with per-category signal blocking; **no shadow scores** — safety suppression is time-boxed (P-17) then disclosed-or-lifted; everything affecting opportunity is disclosable and appealable. Consumer-reporting-style protections: access, dispute, correction, adverse-action notice, no third-party sale. Portability: signed attestations (JSON-LD/VC); raw evidence stays in-platform. Cold-start: validation evidence weighs in lieu of history; exposure floor P-07.

## §5 Fairness and due process

Symmetric measurement with **consequence parity**: enumerated counterparty consequences (matching downweight, visibility reduction, escrow-terms tightening, loss of auto-acceptance, stricter templates, search/posting caps, suspension); high-impact consequences require human sign-off; **revenue contribution is inadmissible in enforcement**. Power-imbalance detection: P-03 presumptive review, P-04 win-rate flag — flags trigger review, never automatic consequence. Every production meta-pattern carries the full specification (ID, thresholds, window, exclusions, confidence, review threshold, appeal path, decay, counter-examples); no serious consequence from an opaque aggregate. Graduated response (minor → moderate → serious with P-27 response window and P-28 investigation window → severe time-bound ban with published reinstatement → catastrophic permanent). Appeals ladder: automated recheck P-29 → human review (P-18) with conflict-of-interest rule → independent panel post-X.5; pre-panel irreversibility bar (P-24). Annual transparency report from year one.

## §6 Marketplace mechanics

**Structured agreements** are the marketplace primitive: criteria flagged objective/subjective at creation (criteria library + custom; zero-objective warning); IP terms embedded (client owns the **delivered instance**; freelancer retains **structural-pattern** license unless exclusivity purchased; client content never enters the section library); transfer manifest per milestone; **accepted milestones are final** (fraud-only exception). **Workspace-level working copy:** tenant-, freelancer-, collective-, or consortium-owned; role-scoped access; transfer = permission change with snapshot; solo handoff is the default template. **AI verification:** shadow-advisory first (P-15), then binding only by mutual opt-in at confidence ≥ P-12; high-value milestones (P-13) always require explicit confirmation; failed verification routes to remediation/review, never auto-blocks payment; scope-narrowing trigger P-14. **Auto-acceptance** only via the notice ladder (P-16 notice ladder; clock pauses on delivery failure; P-13 milestones excluded; reversible only by dispute with cause; recorded as non-response context). Escrow and platform-fee line per 6B substrate; bonds per P-20 as segregated ledger objects; payout rails through provider-neutral adapters with a counsel/vendor-verified capability matrix per market; **payout failures caused by platform or rail never affect participant reputation**.

## §7 AI dual-plane (governed)

Three states per tenant: platform-meta AI (freemium), tenant-business AI (BYO-API or pass-through credits), disabled. Freemium is permanent in principle, operationally governed: P-08 per Person, P-09 org pool (reduced per-staff rate, hard cap), chat vs action credits metered separately, earnable credits via accepted contributions only, P-10 cost ceiling with P-11 notice before tightening — never silent removal. Consequence-bearing AI actions pass Gatekeeper. **BYO-API boundary:** a key processes only data its owner is authorized to see; client-tenant data requires the client's explicit consent on a surface showing provider, model, and retention terms; revocable prospectively; prohibited classes (other tenants' data, platform credentials, identity artifacts, client-restricted data) never flow to BYO providers. Engagement AI artifacts used for deliverables are workspace records; AI outputs entering the library follow §6 IP rules.

## §8 Sovereignty and off-ramps

v4 §15 customer-first data protection carries unchanged, operationalized: export format defined per primitive before implementation (identity JSON-LD/VC, evidence NDJSON, workflow state-machines, configuration YAML, reputation attestations, sites as standard static assets); **export honesty tiers** (full-fidelity static; data+content+structure plus a capability map for dynamic features); **no content, data, or configuration hostage — export is never withheld for unpaid invoices**; post-exit retention disclosed (operational data deleted per schedule; evidence ledger retained per legal/dispute needs); annual non-founder restore drill (P-19) — failure blocks the next front-name launch.

## §9 Growth and campaign scope

Campaign scope is locked: **Scope A** (cross-platform attribution and coordination via provider APIs; ads remain native on their platforms) plus **Scope B** (internal outbound: email/WhatsApp/SMS/push to the operator's own CRM through the Communication Gateway with ADL-004 opt-out enforcement). **No Scope C** (AI-generated ads pushed to platforms) and Marketplace / Trust Layer is Phase 9; Scope C remains locked; Scope C reopens only through a Blueprint XIII.3 gate. Channel adapters are provider-neutral with fallback doctrine; number/sender reputation management is an operational requirement.

## §10 Trust & safety operations

Consequence-bearing capabilities (marketplace escrow disputes, reputation publication, employment matching, scaled ban enforcement) are gated on a named T&S operating function with a documented concurrent-case ceiling; beyond the ceiling, volume throttles rather than due process degrading (Blueprint X.4). Minor-safety gate per Blueprint X.6. Written participant harm review before launching any reputation, identity-enforcement, employment, marketplace, or AI-matching feature (Blueprint XIII.6).

## §11 Compliance and jurisdiction

v4 §18 compliance packs carry forward as informational plus workflow scaffolding, versioned, counsel-reviewed before public availability, with verified-as-of dates and acknowledged limitation notices. Data residency, payout-rail legality, KYC vendor coverage, PSEB-type obligations, and money-services classification are **counsel/vendor-gated launch assumptions**, decided per market through XIII.3 gates and recorded.

## §12 Disposition of business_logic_v4_amendments_v1 (48 items)

That overlay is superseded in full. Disposition: **carried as-is** — all items adding ecosystem participant types, cross-tenant relationships, communication-gateway extensions, configuration layering, Foundry cross-tenant grants, evidence/audit extensions, Web3-ready nullable fields. **Carried, updated:** identity items → tiered identity (§3, replacing absolute registration KYC); reputation items → three layers (§4); marketplace items → §6 mechanics (verification shadow mode, auto-accept ladder, IP rule, bonds); AI freemium items → governed plane (§7); graduated-response items → §5 due-process timelines; wording items → capabilities-not-outcomes. **Dropped:** none — no amendment item is abandoned; each is traceable into §§2–11 or the 6A–6C consolidated amendment.

## §13 Conflict-resolution log (v2 over v4)

Where this document and v4 prose differ, this document wins (v4 is historical). Where this document and Blueprint v3.1 differ, the blueprint wins and the difference is logged as a doctrine issue per Blueprint 0.3. Phase plans must cite this document and the blueprint by section/P-ID rather than restating rules.

End of global business logic v2.
