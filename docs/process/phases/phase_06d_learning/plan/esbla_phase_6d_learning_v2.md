---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v2.0
created: 2026-06-13
last_updated: 2026-06-13
status: active
document_type: phase_plan
scope: Full Phase 6D (Learning) plan — ecosystem-native, with runtime wiring inside the phase.
title: Esbla Spark — Phase 6D: Learning — v2
ratifier: Usman Hussain
---

# Esbla Spark — Phase 6D: Learning — v2

**Target repo path:** `docs/process/phases/phase_06d_learning/plan/esbla_phase_6d_learning_v2.md`
**Supersedes:** the v4.1 `6d_learning.md` phase document (becomes historical) and `phase_6d_amendments_v1.md` (in full). This plan is self-contained: Codex consumes only this document plus Blueprint v3.1 and Business Logic v2.
**Catalog rule:** the v4.1 topological component catalog 6D.01–6D.10 is **adopted unchanged as baseline scope** (IDs, dependency columns, event vocabularies, Foundry classifications) and condensed in §4; where this v2 plan extends or modifies a component, this plan wins. Baseline dependencies are re-verified at the catalog stage under the forward-dependency rule.

## §1 Phase objective

Deliver the learning surface of the ecosystem: institutions and individual educators operate programmes, cohorts, assessment, grading, content, and credentials on the amended 6A–6C substrate — with students as first-class ecosystem participants whose learning produces portable, evidence-grade skill validation. Phase 6D remains **Learning** (locked); it is not repurposed.

## §2 Entry dependencies

Phases 6A–6C closed **including** the consolidated amendment (Stage 1) and runtime wiring (Stage 2). 6D components depend only on 6A–6C and earlier-ordered 6D components (forward-dependency rule). The learning surface consumes: tiered identity + guardian-linked mode (6A-X2), evidence ledger with context-at-write (6A-X3), reputation interpretation (6A-X4), gateway channels (6A-X5), configuration layers (6A-X6), AI dual-plane (6A-X7), Foundry grants and pruning (6A-X8), billing/invoicing (6B), workspaces and structured agreements (6C-X1/X2).

## §3 In-phase delivery rule (binding — the key v2 change)

**Every 6D component ships, within Phase 6D:** (a) seed-level artifacts through the standard pipeline; (b) **runtime wiring** — Nest controllers/modules/routes live, every route through the Access Core → Gatekeeper → audit → Foundry spine, RLS verified; (c) **frontend exposure** in the tenant frontend, activation-pruned; (d) an **extension of the falsifiable demo script** covering the component's golden path. There is no separate post-phase wiring pack. **Phase exit = the 6D golden-path E2E green in CI** (enrol → attend → submit → assess → grade → certificate issued → certificate visible as portable attestation), plus the negative tests in §7.

## §4 Component catalog (baseline carried + v2 ecosystem extensions)

| ID | Component (baseline carried) | v2 ecosystem extension |
|----|------------------------------|------------------------|
| 6D.01 | Academic Structure and Programme Catalogue | Programme catalogue entries are Foundry-managed and exportable (config YAML off-ramp) |
| 6D.02 | Student Profile and Lifecycle | Student = participant type: **one student profile per Person** linked to the Person Graph; admissions respect tier states; minors enter **guardian-linked mode** automatically |
| 6D.03 | Timetable, Classes, Cohorts | Cross-tenant guest-teacher access via Foundry capability grants; meeting links through gateway |
| 6D.04 | Attendance and At-Risk Rules | At-risk flags are internal learning signals only — never exported to marketplace/employment contexts (P-25 discipline); interventions audited |
| 6D.05 | Assignments, Submissions, Integrity | Integrity logs write to the evidence ledger **with context-at-write**; integrity flags follow due process (graduated response, appealable) — never auto-publish |
| 6D.06 | Assessment and Examination | Proctoring extensions optional and consent-disclosed; attempts produce evidence-grade records |
| 6D.07 | Grading, Transcript, Progression | Grade releases/appeals follow the appeals-ladder pattern (P-18 SLAs); transcripts exportable |
| 6D.08 | Content Library and Learning Standards | SCORM/xAPI/H5P/LRS per baseline; **export honesty**: content packages and completion state export in standard formats (off-ramp mandate) |
| 6D.09 | Student, Teacher, Coordinator, Parent Portals | Parent portal **is** the guardian-linked mode implementation: configured visibility only; no marketplace surfaces for minors; communication via monitored gateway channels |
| 6D.10 | Certificates, Completion, Alumni, University-Scale | Certificates issue as **signed portable attestations** (JSON-LD/VC per Blueprint IV.6) with revocation events; credential IDs verifiable; alumni status is a disclosure-profile element |

## §5 Ecosystem doctrine bindings (binding on all 6D sub-surfaces)

1. **Learning → earning pathway.** Completed assessments and certificates generate **skill validations** that feed cold-start fairness (P-07) and the "Esbla Certified" disclosure element — weighted in matching *in lieu of* engagement history for new marketplace entrants. Learning signals never cross into marketplace or employment matching without the Person's opt-in (BL v2 §4).
2. **Minors.** Marketplace participation under 18 is prohibited (hard rule); guardian-linked accounts; adult–minor messaging only in monitored channels; mentorship involving minors only with vetted mentors in monitored channels. The 6D minor-safety surfaces are part of the Blueprint X.6 gate evidence.
3. **Mentorship tiering.** Unpaid public peer-help: T1. Paid or private adult mentorship: T2, via structured agreements (6C-X2).
4. **AI in learning.** Platform-meta AI may tutor, summarize, and guide within freemium governance; **prohibited inferences apply in full** — no personality profiling of students, no background-based performance prediction; any "pathway exploration" assistance is participant-initiated, transparent about inputs, and produces no hidden labels.
5. **Tenant sovereignty.** An institution tenant owns its academic data; student Persons own their profiles, evidence, and attestations across institutions — the same Person studying at two institution tenants holds one student profile with institution-scoped enrolments.

## §6 Explicit non-scope

No marketplace placement of students (Phase 9); no employment matching from learning data (P-25 disabled); no Scope C campaign features; no native mobile apps; no new payout rails (6B adapters only); no stipend/scholarship disbursement beyond existing billing primitives (deferred to a XIII.3 gate).

## §7 Gates and definition of done

Pipeline: phase decision register → human ratification → sub-surface catalog → dependency extraction → fidelity → seed matrix → FFET pack planning (12 gates) → Gate-2 zero-trust audit per stage (against JSON artifacts) → **Gate-3 human approval** → autonomous run **including wiring and frontend per §3**. Exit requires: 6D golden-path E2E green in CI; negative tests green (guardian-linked student blocked from any marketplace route; opted-out guardian receives no campaign/notification traffic; an integrity flag cannot publish without due-process state; cross-tenant student-data isolation attempt fails); demo-script extension merged; audit doc headers matching live JSON counts; failure-pattern library updated.

**Parameters referenced:** P-05, P-06, P-07, P-08, P-09, P-16 (acceptance ladder reused for grade-release acknowledgements), P-18, P-24, P-25.

End of Phase 6D plan v2.
