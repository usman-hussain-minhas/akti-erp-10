# AKTI ERP Roadmap

Status: post_phase_4_merged

## Current State

- Phase 1: PASS.
- Phase 2: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 3: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 4: PHASE_4_MERGED_TO_MAIN_VALIDATED.
- Phase 1, Phase 2, Phase 3, and Phase 4 are merged into `main`.
- Phase 3 merge commit: `5f388ca93bdc87bdbbff229a53300ef1554e8157`.
- Phase 4 merge commit: `c052ff2bf654402d6ad0b375f80cb564c55e3d22`.
- Phase 4 proved operational readiness, clean DB/bootstrap, validation, audit packaging, and controlled demo/staging proof.
- Phase 4 frontend evidence showed the app is technically functional but not yet noob-proof or operator-ready.

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
| Phase 4A | Local Demo / Staging Environment Stabilization | Next planning target |
| Phase 4B | Frontend Operational Experience & Mission Control Shell | After Phase 4A |
| Phase 5 | Foundry / Module Installer / AI-Ready Module Governance | After Phase 4A/4B unless later approved decision changes the order |
| Phase 6 | Installable Business Modules with Governed In-Module AI | After Foundry/module rules exist |
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

Create Phase 4A planning/control documents for Local Demo / Staging Environment Stabilization when separately approved, followed by Phase 4B planning/control documents for Frontend Operational Experience & Mission Control Shell. Do not create Phase 4A/4B ticket packs, start Foundry/module installer work, AI runtime work, Phase 5 work, or module scale from this summary.
