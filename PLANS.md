# AKTI ERP Roadmap

Status: post_phase_3_merged

## Current State

- Phase 1: PASS.
- Phase 2: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 3: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 1, Phase 2, and Phase 3 are merged into `main`.
- Phase 3 merge commit: `5f388ca93bdc87bdbbff229a53300ef1554e8157`.

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
| Phase 4 | Operational Proof | Next planning target |
| Phase 5 | Foundry / Module Installer / AI-Ready Module Governance | Future planning target |
| Phase 6 | Installable Business Modules with Governed In-Module AI | After Foundry/module rules exist |
| Phase 6B or later | Evidence Foundation from Real Module Events | After real modules emit enough evidence |
| Phase 7 | Intelligence Core / Predictability / Platform AI Operations | After Foundry and real module evidence exist |
| Phase 8 | Scale / Marketplace / Enterprise | Future maturity target |

## Module Classification

- Lead Desk is a business module, not a core platform module.
- Engagement Gateway Lite is a shared platform module.
- WhatsApp stub is an integration adapter and remains non-production.

## Accepted Deferrals After Phase 3

- Production deployment.
- Production auth/session provider and credential provisioning.
- Production WhatsApp credentials.
- Real outbound WhatsApp.
- Fresh empty-database bootstrap proof.
- DB-level RLS policies and tenant transaction context.
- Browser-rendered frontend tests.
- Distributed/infrastructure-level rate limiting.

These are documented deferrals, not hidden Phase 3 blockers.

## Next Step

Create Phase 4 planning/control documents for Operational Proof when separately approved. Do not start Phase 4 implementation, Foundry/module installer work, AI runtime work, or module scale from this summary.
