# P4A-008 Exact-File Plan

Ticket: P4A-008 - Local smoke script

## Files To Change

- `scripts/dev/local-smoke.sh`
- `codex-review/phase4a-local-demo-staging/ticket-artifacts/P4A-008/*`
- `codex-review/phase4a-local-demo-staging/phase4a-run-journal.md`

## Scope Boundary

The smoke script uses the local/demo runtime created by P4A-006 and the lifecycle scripts from P4A-007. It verifies local API health, web root availability, setup/bootstrap reachability, allowed local CORS, and security headers.

No app runtime source, Prisma schema, migrations, contracts, generated registry, package files, dependencies, deployment files, secrets, Phase 4B redesign, Phase 5, Foundry, AI runtime, or business-module implementation are changed.

## Correction Strategy

Add one noob-proof command that starts the existing local runtime when needed, emits clear pass/fail messages, classifies failures, and tells the operator how to clean up proof services.
