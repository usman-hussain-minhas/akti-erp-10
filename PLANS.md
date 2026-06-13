---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v2.0
created: 2026-06-13
origin_created: 2026-06-13
last_updated: 2026-06-13
status: active
document_type: roadmap_summary
scope: Human-readable Esbla Spark roadmap bridge after v5 ratification; executable repo truth and ratified controls remain authoritative.
---

# Esbla Spark Roadmap Bridge

Status: v5_ratified_stage0_execution_in_progress

## Current State

- Phase 1: PASS.
- Phase 2: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 3: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 4: PHASE_4_MERGED_TO_MAIN_VALIDATED.
- Phase 4A: PHASE_4A_MERGED_TO_MAIN_VALIDATED.
- Phase 4B: PHASE_4B_MERGED_TO_MAIN_VALIDATED.
- Phase 5A: PHASE_5A_MERGED_TO_MAIN_VALIDATED.
- Phase 1, Phase 2, Phase 3, Phase 4, Phase 4A, Phase 4B, and Phase 5A are merged into `main`.
- Phase 3 merge commit: `5f388ca93bdc87bdbbff229a53300ef1554e8157`.
- Phase 4 merge commit: `c052ff2bf654402d6ad0b375f80cb564c55e3d22`.
- Phase 5A control-doc merge commit: `db6372e4b77170d286db63e2e52f9af0db177666`.
- Phase 5A source branch: `phase5a/platform-policy-pack`.
- Phase 5A source branch HEAD: `54cfcb3bb0c8d326e97e4522ca9c5b37b13f2103`.
- Phase 5A merge commit: `a866c7b1fbea2aff44418494286e85215c36cc79`.
- Phase 4 proved operational readiness, clean DB/bootstrap, validation, audit packaging, and controlled demo/staging proof.
- Phase 4B completed the frontend operational experience and Mission Control shell readiness layer.
- Phase 5A completed the policy/ADR/standard/checklist/control layer before Foundry implementation.
- Phase 5B, Phase 5C, Phase 6A, Phase 6B, and Phase 6C have merged planning and/or implementation evidence in the repository.
- Phase 6A through Phase 6C seed FFET work is complete as planning/runtime-seed evidence, but runtime wiring remains deferred to the separately approved 6A-6C Runtime Integration FFET package.
- Esbla v5 is ratified internally, with Stage 0 Waves 2-5 executing under Gate 3 approval except the deferred semantic contract/package identifier rename FFET.
- Public activation remains blocked where counsel or named external review is required by the ratified v5 packet.

## Authority Notice

`PLANS.md` is a human-readable roadmap bridge. It does not override Prisma, contracts, module manifests, generated registry, accepted ADRs, active process docs, ratified doctrine, tests, validation evidence, or closure packages.

Current strategic references:

```text
docs/blueprints/current/esbla_spark_blueprint_master_plan_v3_1.md
docs/ratification/esbla_spark_v5_0/RATIFICATION_Esbla_Spark_v5_0.md
docs/ratification/esbla_spark_v5_0/decision_record_v5_0.json
```

## Corrected Roadmap

| Phase | Name | Status |
| --- | --- | --- |
| Phase 0 | Governance, Source-of-Truth and Architecture Decisions | Complete |
| Phase 1 | Platform Foundation | Complete |
| Phase 2 | First Module-Layer Proof | Complete with accepted deferrals |
| Phase 3 | Trust Foundation | Complete with accepted deferrals |
| Phase 4 | Operational Proof | Complete and merged |
| Phase 4A | Local Demo / Staging Environment Stabilization | Complete and merged |
| Phase 4B | Frontend Operational Experience & Mission Control Shell | Complete and merged |
| Phase 5A | Platform Policy Pack, Governance and Gatekeeper Rulebook | Complete, validated, and merged |
| Phase 5B | Gatekeeper-Governed Module Foundry & Core Platform Completion | Completed in repository history |
| Phase 5C | Frontend Excellence & UI Platform Maturity | Completed in repository history |
| Phase 6A | Golden Module Certification | Seed/runtime-control work complete; wiring deferred |
| Phase 6B | Business Modules | Seed/runtime-control work complete; wiring deferred |
| Phase 6C | Workspace and Collaboration Modules | Seed/runtime-control work complete; wiring deferred |
| Phase 6D | Website / Public Presence foundation | Planned under v5 controls |
| Phase 6E | Campaigns folded into communications scope | Planned under v5 controls |
| Phase 6F | Final pre-doc-as-source-of-truth closure | Planned under v5 controls |
| Phase 7 | Website Builder / Agency Handoff | Future post-6F phase |
| Phase 8 | App Builder | Future post-6F phase |
| Phase 9 | Marketplace / Trust Layer | Future post-6F phase |

## Module Classification

- Lead Desk is a business module, not a core platform module.
- Engagement Gateway Lite is a shared platform module.
- WhatsApp stub is an integration adapter and remains non-production.

## Active Deferrals

- Production deployment.
- Production auth/session provider and credential provisioning.
- Production WhatsApp credentials.
- Real outbound WhatsApp.
- DB-level RLS policies and tenant transaction context.
- Distributed/infrastructure-level rate limiting.
- Production VPS/cloud deployment, if desired, remains a separately approved production decision.
- 6A-6C runtime wiring is deferred to the Runtime Integration FFET package.
- Semantic contract/package identifier rename is deferred to the Stage 2 versioned contract-change pack.
- Public Esbla activation remains blocked where counsel or named external review is required.

These are documented deferrals, not hidden blockers.

## Next Step

Continue Stage 0 execution from the approved FFET queue. Do not start 6A-6C runtime integration, Stage 2 contract-change execution, production deployment, public activation, or future phase implementation from this summary.
