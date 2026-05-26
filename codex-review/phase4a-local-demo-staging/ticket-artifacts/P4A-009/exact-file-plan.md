# P4A-009 Exact-File Plan

Ticket: P4A-009 - Browser inspection and screenshot capture support

## Files To Change

- `scripts/dev/local-capture-frontend.sh`
- `codex-review/phase4a-local-demo-staging/ticket-artifacts/P4A-009/*`
- `codex-review/phase4a-local-demo-staging/phase4a-run-journal.md`

## Scope Boundary

The helper script prepares a repeatable local/demo browser inspection path using the P4A local runtime and no new browser dependencies. Screenshots are captured with already-available Codex in-app Browser tooling.

No frontend redesign, app runtime source changes, Prisma schema or migrations, contracts, generated registry, package files, dependency additions, deployment files, secrets, Phase 4B, Phase 5, Foundry, AI runtime, or business-module implementation are included.

## Current Frontend Evidence Input

P4A-009 uses the Phase 4 current-state frontend evidence package as input, especially:

- `codex-review/phase4-operational-proof/frontend-current-state/frontend-route-inventory.md`
- `codex-review/phase4-operational-proof/frontend-current-state/frontend-technical-leakage-review.md`
- `codex-review/phase4-operational-proof/frontend-current-state/frontend-noob-proof-gap-analysis.md`
