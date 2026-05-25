# AKTI ERP Post-Phase-2 Roadmap

Status: post_phase_2_merged

## Current State

- Phase 1: PASS.
- Phase 1 hardening: PASS.
- Phase 2: PASS_WITH_ACCEPTED_DEFERRALS.
- Phase 1 + Phase 2 are merged into `main`.
- Latest post-merge validation on `main` passed.

## Authority Notice

`PLANS.md` is a human-readable roadmap. It does not override Prisma, contracts, module manifests, generated registry, ADRs, `AGENTS.md`, or active process docs.

Historical Phase 2 process docs remain useful evidence and learning material. They are not active Phase 3 or Phase 4 execution contracts.

## Corrected Roadmap

| Phase | Name | Status |
| --- | --- | --- |
| Phase 0 | Governance and source-of-truth baseline | Complete |
| Phase 1 | Platform foundation | Complete |
| Phase 2 | First module-layer proof: Engagement Gateway, Lead Desk, WhatsApp stub adapter | Complete with accepted deferrals |
| Phase 3 | Security/Auth/Tenant Hardening | Next planning target |
| Phase 4 | Deployment/Staging/Visual QA | Future planning target |
| Phase 5 | Foundry/Module Installer Framework | Future planning target |
| Phase 6+ | Parallel installable modules | After Foundry/module installer exists |

## Module Classification

- Lead Desk is a business module, not a core platform module.
- Engagement Gateway is a shared platform module.
- WhatsApp stub is an integration adapter and remains non-production.

## Accepted Deferrals After Phase 2

- Production deployment.
- Production auth/session.
- Production WhatsApp credentials.
- Real outbound WhatsApp.
- Fresh empty-database bootstrap baseline.
- Runtime route limiting.
- Browser-rendered frontend tests.

These are documented deferrals, not hidden Phase 1/2 blockers.

## Future Autonomous Operating Model

Future autonomous runs must use stable contract plus flexible runtime:

- Control docs define queue, scope, boundaries, gates, and stop conditions.
- Control docs are not live execution ledgers.
- Runtime state comes from git history, journal entries, ticket artifacts, optional run-state files, and ordered queue position.
- Exact-file implementation plans are required before edits.
- Bounded validation repair is allowed only inside active ticket scope.
- Validation/test-runner wiring may be updated only to include active-ticket tests, without dependencies or unrelated script rewrites.
- Lightweight artifacts are expected per ticket.
- Heavy audit packages are reserved for gates and final closure.
- Full-access/elevated execution exception remains bounded by active control docs and is not retired.

## Next Step

Create a Phase 3 planning package for Security/Auth/Tenant Hardening. Do not start Phase 3 or Phase 4 implementation from stale Phase 2 process docs.
