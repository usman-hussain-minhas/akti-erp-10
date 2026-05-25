# P4-010 Conditional Re-Plan

Ticket: P4-010 - Staging/deployment proof

Status: ACCEPTED_FOR_EXECUTION

P4-003 selected a controlled local disposable staging/demo path that includes multiple runtime layers: local PostgreSQL, API process, web process, env injection, API/web health, CORS, logs, shutdown, and restart.

The P4-010 split rule is satisfied by executing the proof as four evidence slices inside this ticket:

1. DB/env connectivity proof
2. API staging process proof
3. Web staging process proof
4. Integrated API/web/CORS/shutdown-restart proof

This does not create production launch, cloud staging, provider deployment, real credentials, new dependencies, Phase 5/6 scope, or runtime source changes.

Exact-file plan:

- Update only `codex-review/phase4-operational-proof/ticket-artifacts/P4-010/*`.
- Append `codex-review/phase4-operational-proof/phase4-run-journal.md`.
- Do not modify runtime source, Prisma schema, existing migrations, contracts, generated registry, package files, deployment files, real env files, or secrets.
