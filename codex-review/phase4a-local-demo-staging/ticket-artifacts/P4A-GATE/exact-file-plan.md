# P4A-GATE Exact-File Plan

Ticket: P4A-GATE - Phase 4A closure audit and final external audit package

## Tracked Files To Change

- `docs/process/AKTI_ERP_Phase_4A_Audit_Report_v1.md`
- `docs/process/AKTI_ERP_Phase_4B_Readiness_Handoff_After_Phase_4A_v1.md`
- `codex-review/phase4a-local-demo-staging/phase4a-run-journal.md`

## Local Evidence Files To Generate

- `codex-review/phase4a-local-demo-staging/ticket-artifacts/P4A-GATE/*`
- `codex-review/phase4a-local-demo-staging/final-external-audit/*`

## Packaging Rule

The final source ZIP must be generated from committed branch `HEAD` using `git archive`, after the closure docs are committed. The final external audit package remains under ignored `codex-review` evidence so the source ZIP excludes it and `git status --short` can remain clean.

## Scope Boundary

No runtime app source, Prisma schema or migrations, contracts, generated registry, package/dependency files, deployment/cloud files, secrets, production launch, real WhatsApp production behavior, Phase 4B implementation, Phase 5, Foundry, AI runtime, or business-module implementation are changed.
