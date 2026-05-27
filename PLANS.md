# AKTI ERP Roadmap

Status: phase_5a_policy_pack_in_progress

## Current State

- Phase 1: PASS.
- Phase 2: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 3: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 4: PHASE_4_MERGED_TO_MAIN_VALIDATED.
- Phase 4A: PHASE_4A_MERGED_TO_MAIN_VALIDATED.
- Phase 4B: PHASE_4B_MERGED_TO_MAIN_VALIDATED.
- Phase 5A control docs: PHASE_5A_CONTROL_DOCS_MERGED_AND_READINESS_CHECK_COMPLETE.
- Phase 1, Phase 2, Phase 3, Phase 4, Phase 4A, Phase 4B, and Phase 5A control docs are merged into `main`.
- Phase 3 merge commit: `5f388ca93bdc87bdbbff229a53300ef1554e8157`.
- Phase 4 merge commit: `c052ff2bf654402d6ad0b375f80cb564c55e3d22`.
- Phase 5A control-doc merge commit: `db6372e4b77170d286db63e2e52f9af0db177666`.
- Phase 4 proved operational readiness, clean DB/bootstrap, validation, audit packaging, and controlled demo/staging proof.
- Phase 4B completed the frontend operational experience and Mission Control shell readiness layer.
- Phase 5A is now the active policy/ADR/standard/checklist/control layer before Foundry implementation.

## Authority Notice

`PLANS.md` is a human-readable roadmap summary. It does not override Prisma, contracts, module manifests, generated registry, ADRs, `AGENTS.md`, active process docs, tests, validation evidence, or closure packages.

The strategic roadmap reference is:

```text
docs/process/AKTI_ERP_Master_Roadmap_Reference_v2.md
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
| Phase 5A | Platform Policy Pack, Governance and Gatekeeper Rulebook | Active execution target |
| Phase 5B | Gatekeeper-Governed Module Foundry & Core Platform Completion | After Phase 5A approval |
| Phase 5C | Frontend Excellence & UI Platform Maturity | After Phase 5B approval |
| Phase 6A | Golden Module Certification | After Phase 5B/5C foundation is ready |
| Phase 6B+ | Business Modules | After Foundry/module rules and Golden Module certification exist |
| Phase 6B or later | Evidence Foundation from Real Module Events | After real modules emit enough evidence |
| Phase 7 | Intelligence Core / Predictability / Platform AI Operations | After Foundry and real module evidence exist |
| Phase 8 | Scale / Marketplace / Enterprise | Future maturity target |

## Module Classification

- Lead Desk is a business module, not a core platform module.
- Engagement Gateway Lite is a shared platform module.
- WhatsApp stub is an integration adapter and remains non-production.

## Accepted Deferrals After Phase 4

- Production deployment.
- Production auth/session provider and credential provisioning.
- Production WhatsApp credentials.
- Real outbound WhatsApp.
- DB-level RLS policies and tenant transaction context.
- Distributed/infrastructure-level rate limiting.
- Production VPS/cloud deployment, if desired, remains a separately approved production decision.
- Frontend noob-proof/operator-ready experience is a Phase 4B input before Foundry/module scale.

These are documented deferrals, not hidden Phase 4 blockers.

## Next Step

Execute the approved Phase 5A policy/decision ticket queue on `phase5a/platform-policy-pack`. Do not start Phase 5B, Foundry/module installer runtime work, runtime AI work, production auth, production deployment, or business-module implementation from this summary.
