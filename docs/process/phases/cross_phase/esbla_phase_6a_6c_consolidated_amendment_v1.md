---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v1.0
created: 2026-06-13
last_updated: 2026-06-13
status: for_ratification
document_type: phase_amendment
scope: Consolidated ecosystem amendment and runtime-wiring scope for Phases 6A–6C (Codex Stages 1–2).
title: Esbla Spark — Phase 6A–6C Consolidated Amendment v1
ratifier: Usman Hussain
---

# Esbla Spark — Phase 6A–6C Consolidated Amendment v1

**Target repo path:** `docs/process/phases/cross_phase/esbla_phase_6a_6c_consolidated_amendment_v1.md` (Codex may split per-phase sections into the per-phase `amendments/` folders mechanically during Wave 2; section boundaries are designed for that split).
**Supersedes:** `phase_6a_amendments_v1.md`, `phase_6b_amendments_v1.md`, `phase_6c_amendments_v1.md` in full.
**Relationship to originals:** the v4.1 phase documents 6A/6B/6C and all their generated artifacts (catalogs, extraction edges, seeds, FFETs, closure records) are **historical and remain the baseline of record**. This amendment is the active overlay; nothing here invalidates closed runs. Where this amendment and a baseline artifact conflict, this amendment governs *future* work only.
**Doctrine basis:** Blueprint v3.1 (binding constraints) + Global Business Logic v2. Parameters by P-ID only.
**Prerequisite (binding):** Phase 6C closure verified per the refactor plan Wave 0 before any FFET of this amendment executes. Document ratification may precede closure.

## §1 Doctrine corrections applied across all prior amendment content

The superseded per-phase amendment files contained pre-v3 doctrine. The following corrections apply wherever their content is carried forward:

1. **Tiered identity replaces "one Person = one verified identity at registration, forever."** Verification is T0–T3 + guardian-linked (BL v2 §3); KYC is a tier-gate for high-trust actions, not a registration wall.
2. **Workspace-level working copy replaces "freelancer-owned working copy" as the primitive.** Solo freelancer handoff is the default template, not the only case (BL v2 §6).
3. **Three-layer reputation replaces any monolithic "permanent immutable reputation record."** Evidence ledger (append-only + tombstone/redaction) / interpretation / disclosure (BL v2 §4).
4. **Governed freemium replaces unbounded freemium AI** (P-08/P-09/P-10/P-11; chat vs action credits).
5. **P-25 cross-context reputation crossing is disabled by default** pending counsel/T&S review.

## §2 Phase 6A extensions (foundation substrate)

- **6A-X1 Person Graph, multi-participant.** One profile per participant type per Person; multiple tenant organizations per Person; collective accounts with designated representative; restriction scoping (conduct → context; integrity → Person). Extends the existing Person/identity components without altering closed seeds; new sub-surfaces enter through the standard catalog→extraction→fidelity→seed pipeline.
- **6A-X2 Tiered verification.** T0–T3 + guardian-linked states; provider-neutral KYC adapter registry (NADRA/CNIC and bank-verification paths as verification-pending market adapters); failed-verification appeal path; de-dup flags route to human review.
- **6A-X3 Evidence ledger hardening.** Context-at-write fields (timezone, availability, dependency markers, outage, payment state, agreement-clarity, dispute outcome); tombstone/redaction/legal-hold operations; counterparty redaction notice events; soft-delete vs redaction vs erasure vs hold distinguished in schema and audit.
- **6A-X4 Reputation interpretation service.** Three-layer separation; versioned interpretation with changelog; decay P-05; confidence display P-06; role contexts; adverse-action notice hooks into audit; disclosure profiles; per-category signal blocking; exposure-floor support P-07.
- **6A-X5 Communication Gateway.** Cross-tenant channel types (project, hiring, mentorship, B2B) bounded and audited; guardian-mode restrictions (no unsupervised adult–minor DMs; monitored mentorship channels); ADL-004 opt-out enforced at the gateway for every channel including future 6E campaigns.
- **6A-X6 Configuration constraints.** Canonical defaults; declared overrides; save-time combination validation (invalid combinations blocked with explanation); re-baselining offer mechanism; layer order platform → industry pack → participant-type → tenant → Person.
- **6A-X7 AI proxy dual-plane.** Three tenant states; chat/action credit metering; P-08/P-09 enforcement; BYO-API consent surface (provider, model, retention link) with prohibited data classes; Gatekeeper interception of consequence-bearing AI actions.
- **6A-X8 Foundry.** Cross-tenant capability grants (scoped freelancer access inside client tenants); tenant-activation-aware frontend chunk registration so bundle pruning is enforceable at wiring time; two-phase uninstall unchanged (ADL-006).

## §3 Phase 6B extensions (commerce substrate)

- **6B-X1 Marketplace transaction infrastructure.** Escrow primitives (fund, hold, release, refund) as Saga flows; platform-fee line item; multi-currency support; P-13 high-value flag plumbed into billing objects.
- **6B-X2 Payout rails.** Provider-neutral payout adapters; per-market capability matrix (refunds, holds, business accounts, foreign-client payouts, fees) marked verification-pending until counsel/vendor confirmation; payout failures recorded with platform/rail causation context and **never** as participant reputation events.
- **6B-X3 Cross-tenant invoicing.** Tenant↔tenant and tenant↔freelancer invoicing with evidence linkage; invoice immutability carried.
- **6B-X4 Billing honesty surfaces.** AI cost surfacing (plane, credits, unit costs) in tenant billing UI; bond ledger objects (P-20) as segregated, refundable balances.
- **6B-X5 Pricing presentations.** Multiple pricing presentations carried; consumption honesty unchanged; ADL-016 FX gain/loss remains 6B scope.

## §4 Phase 6C extensions (operations substrate)

- **6C-X1 Workspace-level working copy.** Extends 6C project/workspace components: workspace ownership types (tenant, freelancer, collective, consortium); role-scoped multi-participant access; transfer-as-permission-change with snapshot; transfer manifests defined per milestone at agreement time; **accepted milestones final** (fraud-only exception); continuous-delivery checkpoints reuse the same mechanics.
- **6C-X2 Structured agreements.** Objective/subjective criterion flags with criteria library; zero-objective warning; embedded IP terms (delivered instance vs structural pattern; exclusivity addendum); agreement-clarity markers feed evidence context.
- **6C-X3 AI verification hooks.** P-15 shadow-advisory accounting; P-12 confidence gate; P-13 exclusions (explicit confirmation required; binding AI prohibited); P-16 auto-acceptance notice ladder with delivery-failure clock pause; P-14 scope-narrowing trigger instrumentation.
- **6C-X4 Employment ↔ reputation linkage.** Employment records emit evidence into the three-layer system; anti-retaliation meta-pattern instrumentation (post-resignation review clusters); P-25 crossing disabled by default.
- **6C-X5 Dispute and appeals scaffolding.** Appeal ladder hooks (recheck → human review P-18 → panel-ready interfaces); pre-panel irreversibility bar P-24 enforced in enforcement actions; power-imbalance patterns P-03/P-04 as named, specified meta-patterns (flags → review, never auto-consequence).
- **6C-X6 Cross-tenant scheduling and recruitment.** Scheduling across tenant boundaries through gateway-mediated availability; recruitment flows consume disclosure profiles only (no retroactive snooping).

## §5 Runtime wiring scope (Codex Stage 2)

**Objective:** convert the substrate from scaffold to running platform: 6A components out of scaffold_control_only; the 6B service files wired into Nest controllers/modules/routes; 6C runtime completed; the cross-cutting enforcement spine live.

- **Process:** RI-FFET pack built **against this amendment's substrate** (not the unamended baseline): discovery → wiring matrices (route↔service↔capability↔audit) → registry → independent Gate-2 audit (zero-trust, against JSON artifacts) → **Gate-3 human approval (Usman exclusive)** → implementation.
- **Enforcement spine:** every route passes Access Core → Gatekeeper (four-outcome) → audit/evidence emission → Foundry activation check; **DB-level RLS** implemented and verified; activation state owned by the Foundry backend registry (no optimistic UI commits).
- **Frontend:** tenant-activation-aware bundle pruning — the measured bundle delta between a minimal and maximal tenant must be materially nonzero; inactive modules absent from navigation **and** chunks.
- **Falsifiable demo gate (Blueprint IX.3), the wiring definition of done:** positive path — register Person → verify T1 then sandbox T2 → create tenant → apply industry pack → Foundry-activate a module → confirm an unactivated module absent from navigation and bundle → perform a Gatekeeper-gated action with approval flow → observe audit/evidence for every step → generate an invoice from metered usage → export the tenant and parse the export. Negative tests — a cross-tenant isolation attempt fails; a failed-KYC path lands at T1 correctly; a message to an opted-out recipient is blocked at the gateway; a failed payment yields a correctable invoice state; an inactive module's route returns 404 server-side. The script runs in CI (nightly post-wiring) on seeded fixtures. **Wiring is complete when this script is green — never by file or FFET counts.**

## §6 Execution staging and gates

- **Stage 1 (amendments):** decision register for this amendment → human ratification → catalog/extraction/fidelity/seed updates for new sub-surfaces → amendment FFETs → standard gate audits. The 20 lifecycle rules and 12 ticket-pack planning gates apply unchanged; zero-trust audit verifies against live JSON artifacts, never audit docs.
- **Stage 2 (wiring):** §5 pack. Stage 2 may not start before Stage 1's seed-level artifacts are READY for the touched components.
- **Sequencing context (suite manifest):** Stage 0 refactor precedes Stage 1; Stages 3–5 (6D/6E/6F) each contain their own wiring in-phase — no separate wiring stage exists after 6C.

End of consolidated amendment v1.
