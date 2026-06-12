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
document_type: phase_plan
scope: Full Phase 6F (Intelligence, Advanced Admin, Design Polish) plan — with runtime wiring inside the phase and the foundations-transition handoff.
title: Esbla Spark — Phase 6F: Intelligence, Advanced Admin, and Design Polish — v2
ratifier: Usman Hussain
---

# Esbla Spark — Phase 6F: Intelligence, Advanced Admin, and Design Polish — v2

**Target repo path:** `docs/process/phases/phase_06f_intelligence_admin_design/plan/esbla_phase_6f_intelligence_admin_design_v2.md`
**Supersedes:** the v4.1 `6f_intelligence_admin_design_polish.md` phase document (historical) and `phase_6f_amendments_v1.md` (in full). Self-contained for Codex alongside Blueprint v3.1 and Business Logic v2.
**Catalog rule:** the v4.1 component catalog 6F.01–6F.08 is adopted unchanged as baseline scope and condensed in §4; this plan wins where it extends or modifies. Forward-dependency re-verified at catalog stage.

## §1 Phase objective

Deliver the intelligence layer (governed, consent-bounded AI over the evidence substrate), the advanced admin/support layer that becomes the platform's trust-and-safety operating tooling, the migration/off-ramp workbench that makes customer sovereignty operational, and the experience-quality system. 6F is the last substrate phase; its exit hands off to the **foundations transition** (doc-as-SOT activation, doctrine ratification completion, validation sprint).

## §2 Entry dependencies

6A–6E closed per their v2 plans (each with in-phase wiring). 6F.01 reads across 6A–6E evidence and configuration; all AI flows pass the 6A-X7 dual-plane proxy; admin tooling builds on 6A.17/6C.05 surfaces; design polish builds on 6A.18/6E.08.

## §3 In-phase delivery rule (binding)

Identical to 6D/6E: every component ships seeds, runtime wiring on the full enforcement spine, activation-pruned frontend, and a demo-script extension within the phase. **Phase exit = 6F golden-path E2E green in CI**: context broker prepares a context map with prohibited-data exclusions → consultant answers with confidence/freshness labels and cost evidence → an optimization suggestion is accepted and its before/after recorded → a support ticket opens with SLA tracking → a migration export runs and re-imports to a fresh tenant → accessibility audit records produced — plus §7 negative tests.

## §4 Component catalog (baseline carried + v2 ecosystem extensions)

| ID | Component (baseline carried) | v2 ecosystem extension |
|----|------------------------------|------------------------|
| 6F.01 | AI Context Broker and Evidence Readiness | The broker is the **enforcement point** for prohibited-inference maps and the BYO-API data boundary: context maps exclude prohibited categories structurally; `ai_context.blocked` events are evidence; cross-tenant context never assembled without explicit grants; freshness metadata mandatory |
| 6F.02 | AI Business Consultant | Ecosystem-aware (reads tenant + activated-module context only); tenant-plane cost caps honored; every brief carries confidence and freshness; **capabilities-not-outcomes language enforced in output templates** (no guarantees) |
| 6F.03 | Proactive AI Optimization | Suggestions are advisory; accept/reject is evidence; the manual Optimize button remains when alerts are disabled; consequence-bearing applies pass Gatekeeper |
| 6F.04 | Prediction, AAR, Collective Intelligence | Strictly **consent-governed opt-in**; anonymised benchmarks with minimum-cohort thresholds; never cross-tenant identity leakage; predictions labeled with confidence; AARs feed the failure-pattern library |
| 6F.05 | Advanced Admin, Support, Diagnostics | This is the **T&S operating tooling**: case queues with the concurrent-case ceiling (Blueprint X.4) and throttle behavior; appeals-ladder consoles with P-18 SLA tracking; P-24 irreversibility bar enforced in admin actions; support windows audited; Super Admin vs Tenant Admin separation per the two-frontend rule |
| 6F.06 | AI Concierge and Advanced Onboarding | Guided setup proposes, **human approves applied config** (no silent configuration writes); sample-data packs clearly marked and removable without trace |
| 6F.07 | Documentation, Community, Migration Workbench | The workbench is the **off-ramp implementation**: per-primitive export formats (identity JSON-LD/VC, evidence NDJSON, config YAML, sites static), full-tenant export, **restore-to-fresh-instance tooling that powers the P-19 annual drill**, import mappings for inbound migration, and **reputation portability attestation issuance** (Blueprint IV.6); community answers carry accepted-answer evidence |
| 6F.08 | Advanced Design Polish and Experience Quality | Accessibility audits as recorded evidence; visual QA records; noob-proof patterns; **UI copy linted against the Part XIV neutrality/no-guarantee standard**; not tenant-toggleable (core quality layer) |

## §5 Ecosystem doctrine bindings

1. **AI governance is structural, not behavioral.** The broker excludes prohibited data before any model sees it; the proxy meters chat vs action credits (P-08/P-09) and enforces the P-10 ceiling instrumentation; BYO keys never receive prohibited classes; consent surfaces precede any client-data processing under a freelancer key.
2. **Adverse-action notice plumbing.** Where 6F intelligence influences matching, ranking, or restrictions, the IV.5 notice hooks fire; no shadow scores — P-17 disclosure-or-lift applies to any safety suppression the admin tooling can impose.
3. **Sovereignty proof.** 6F.07's export→restore round-trip is the standing mechanism for the annual non-founder drill (P-19); a failed round-trip in CI is a sev-1 doctrine breach and blocks the next launch.
4. **Foundations transition (post-6F exit).** Doc-as-SOT propagation activates only after 6F closure, under Blueprint XIII.4 safeguards (enumerated trigger docs; never-auto files; blast-radius caps >20 files or >2 services → human gate; one wave in flight; lineage audit). The X.2 validation sprint (P-30 pilot tenants under pilot terms) is scheduled at this transition.

## §6 Explicit non-scope

No autonomous AI actions without Gatekeeper; no cross-tenant benchmarking without opt-in consent; no reputation interpretation changes from 6F intelligence (interpretation lives in 6A-X4 with its governance); no Phase 7 wedge packaging (next phase); no marketplace activation (Phase 9 gates); no employment cross-context activation (P-25 stays disabled pending counsel/T&S).

## §7 Gates and definition of done

Standard pipeline, 12 planning gates, zero-trust Gate-2 audits, **Gate-3 human approval**, wiring in-phase per §3. Exit negative tests: a prohibited-inference category provably absent from a prepared context map; a BYO call attempting a prohibited data class blocked with evidence; a benchmark request below the minimum cohort refused; an admin action violating P-24 blocked; a restore round-trip to a fresh instance succeeds and diffs clean; an unconsented cross-tenant context assembly attempt fails. Exit also requires audit headers matching live JSON counts, failure-pattern library updated, demo-script extension green nightly, and the foundations-transition checklist (doc-as-SOT safeguards configured, validation-sprint pilot terms drafted) handed to the founder.

**Parameters referenced:** P-08, P-09, P-10, P-11, P-17, P-18, P-19, P-24, P-25.

End of Phase 6F plan v2.
