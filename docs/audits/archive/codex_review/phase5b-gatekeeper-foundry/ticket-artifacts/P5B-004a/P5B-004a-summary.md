# P5B-004a Summary

## Finding Accepted

`P5B-004a` was listed as evidence/control-scoped in the ticket pack, but its title, objective, and MCR require real implementation of the `platform.shell.access` capability seed. Evidence-only output would not satisfy the ticket because evidence does not replace working behavior.

## Bounded Replan Authority

`conditional_replan_required` is `true` for this ticket. The bounded replan stayed inside `P5B-004a` scope: define and prove the `platform.shell.access` seed without implementing `P5B-004b` seed-boundary runtime generalization or `P5B-004c` grant/visibility coverage.

## Source Files Inspected

- `docs/adr/ADR-0016-shell-base-capability-or-session-gated-screen.md`
- `docs/process/AKTI_ERP_Phase_5B_Plan_v10.md`
- `docs/process/AKTI_ERP_Phase_5B_Ticket_Pack_v1.json`
- `packages/contracts/access-core.module-manifest.contract.ts`
- `packages/contracts/access-core-capability-seed.contract.ts`
- `packages/contracts/module-manifest.schema.ts`
- `packages/contracts/scripts/validate-access-core-contracts.mjs`
- `apps/api/src/module-registry/module-registry.service.ts`
- `apps/api/src/access-core/access-core.service.ts`
- `apps/api/src/access-core/access-core.service.test.ts`
- `apps/api/src/security/current-user.service.test.ts`
- `apps/api/src/security/current-user.controller.test.ts`

## Exact Implementation Files Selected

- `packages/contracts/access-core.module-manifest.contract.ts`
- `packages/contracts/access-core-capability-seed.contract.ts`
- `packages/contracts/scripts/validate-access-core-contracts.mjs`

The Access Core manifest and capability seed contract are the current declaration/seed source of truth. The Access Core contract validator was updated as the same-source proof surface because ADR-0016 intentionally introduces `platform.shell.access` as the approved non-`access.*` Access Core shell capability.

## Exact Test File Selected

- `apps/api/src/access-core/access-core.p5b-004a.test.ts`

## Implementation Summary

- Added `platform.shell.access` to the Access Core module manifest.
- Added `platform.shell.access` to the Access Core capability seed definitions.
- Kept `platform.shell.access` distinct from `access.policy.manage`.
- Kept `access.policy.manage` present and unchanged as the high-risk Gatekeeper/audit-protected policy-management capability.
- Added validator checks proving `platform.shell.access` is low-risk, permission-gated, organization-scoped, non-admin, not Gatekeeper-required, and not approval-chain-required.
- Added a ticket-stamped proof test for the manifest/seed shape.

## Prior-Ticket Fixture Repair Summary

Before this ticket could be committed, the broad API validation exposed a prior-ticket fixture defect in the `P5B-003b/P5B-003c` current-user cluster: `apps/api/src/security/current-user.service.test.ts` and `apps/api/src/security/current-user.controller.test.ts` used forbidden hardcoded `main-campus` / `Main Campus` fixture terms. Those were replaced with neutral `primary-unit` / `Primary Unit` values and amended into `P5B-003c` before resuming this ticket. The repair did not touch runtime code.

## Scoped Validation Results

- `pnpm contracts:validate` - PASS
- `pnpm --filter @akti/contracts build` - PASS
- `pnpm --dir apps/api exec tsx src/access-core/access-core.p5b-004a.test.ts` - PASS
- `git diff --check` - PASS
- `git status --short --branch` - PASS, with only expected `P5B-004a` files pending before commit

## Full API Validation Blocker

`pnpm --filter @akti/api test` is known to fail after `P5B-004a` and before `P5B-004b` because `apps/api/src/module-registry/module-registry.service.ts` still enforces the pre-ADR-0016 Access Core seed boundary of exactly one seed: `access.policy.manage`.

This temporary blocker is owned by `P5B-004b - Access Core seed-boundary generalization for platform.shell.access`. `P5B-004b` must run immediately next and must close the full API validation blocker before `P5B-004c` or any later ticket starts.

## Adjacent Ticket Inspection

- `P5B-004b` was inspected and not implemented inside this ticket. It owns the module-registry seed-boundary generalization.
- `P5B-004c` was inspected and not implemented inside this ticket. It owns the later shell grant/visibility proof surface.

## Boundary Confirmations

- Phase 5A policy, ADR, standard, checklist, and handoff documents were not modified.
- Prisma schema and migrations were not modified.
- Generated registry files were not modified.
- Package and lockfile files were not modified.
- `platform.shell.access` is not an admin capability.
- `platform.shell.access` is not a Gatekeeper management capability.
- `platform.shell.access` is not a bypass capability.
