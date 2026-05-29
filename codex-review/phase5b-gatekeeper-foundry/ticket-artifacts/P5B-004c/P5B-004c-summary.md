# P5B-004c Summary

## Objective

Add negative/proof coverage for `platform.shell.access` grant and visibility through the current-user profile surface without implementing frontend shell work or broadening beyond Access Core/current-user proof scope.

## Exact Files Inspected

- `docs/process/AKTI_ERP_Phase_5B_Ticket_Pack_v1.json`
- `docs/adr/ADR-0016-shell-base-capability-or-session-gated-screen.md`
- `apps/api/src/security/current-user.service.ts`
- `apps/api/src/security/current-user.controller.ts`
- `apps/api/src/security/current-user.service.test.ts`
- `apps/api/src/security/current-user.controller.test.ts`
- `apps/api/src/access-core/access-core.p5b-004a.test.ts`
- `apps/api/src/module-registry/module-registry.p5b-004b.test.ts`

## Exact Files Changed

- `apps/api/src/security/current-user.p5b-004c.test.ts`
- `apps/api/src/security/current-user.service.test.ts`
- `apps/api/src/security/current-user.controller.test.ts`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004c/P5B-004c-summary.md`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004c/P5B-004c-validation-summary.md`

## Proof Coverage

- Proves `platform.shell.access` is visible in the current-user profile when explicitly granted through an active same-tenant group.
- Proves `platform.shell.access` does not imply `access.policy.manage`.
- Proves disabled-group and cross-tenant shell grants are not exposed.
- Aligns existing current-user fixtures so `platform.shell.access` is sourced from `core.access`, matching the Access Core seed/manifest authority introduced by `P5B-004a`.

## Non-Scope Confirmations

- No runtime behavior was changed.
- No frontend shell work or Phase 5C work was introduced.
- No Gatekeeper bypass, admin capability, business-module, marketplace, provider, deployment, secret, Prisma, registry, package, or Phase 5A document changes were introduced.

## Validation Results

- `pnpm --dir apps/api exec tsx src/security/current-user.p5b-004c.test.ts` - PASS
- `pnpm --dir apps/api exec tsx src/security/current-user.service.test.ts` - PASS
- `pnpm --dir apps/api exec tsx src/security/current-user.controller.test.ts` - PASS
- `pnpm --filter @akti/api test` - PASS
- `pnpm --filter @akti/api typecheck` - PASS
- `git diff --check` - PASS
- `git status --short --branch` - PASS, with only expected `P5B-004c` files pending before commit
