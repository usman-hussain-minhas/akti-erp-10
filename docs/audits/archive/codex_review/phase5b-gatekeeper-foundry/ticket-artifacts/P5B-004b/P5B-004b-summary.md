# P5B-004b Summary

## Objective

Generalize the Access Core capability seed boundary so `platform.shell.access` can coexist with `access.policy.manage` as an approved Access Core seed while preserving strict rejection of unauthorized seed shapes.

## Exact Files Inspected

- `apps/api/src/module-registry/module-registry.service.ts`
- `apps/api/src/module-registry/module-registry.service.test.ts`
- `apps/api/src/access-core/access-core.p5b-004a.test.ts`
- `packages/contracts/access-core-capability-seed.contract.ts`
- `packages/contracts/access-core.module-manifest.contract.ts`
- `docs/process/AKTI_ERP_Phase_5B_Ticket_Pack_v1.json`
- `docs/adr/ADR-0016-shell-base-capability-or-session-gated-screen.md`

## Exact Files Changed

- `apps/api/src/module-registry/module-registry.service.ts`
- `apps/api/src/module-registry/module-registry.service.test.ts`
- `apps/api/src/module-registry/module-registry.p5b-004b.test.ts`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004b/P5B-004b-summary.md`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004b/P5B-004b-validation-summary.md`

## Boundary Behavior Before

`ModuleRegistryService.seedCoreFoundation()` rejected any Access Core capability seed set that did not contain exactly one seed, `access.policy.manage`. After `P5B-004a`, this made the full API validation fail because `platform.shell.access` became the second approved Access Core seed.

## Boundary Behavior After

The module-registry seed boundary now accepts exactly this approved seed set:

- `access.policy.manage`
- `platform.shell.access`

The boundary still rejects:

- unknown seed capability keys;
- duplicate seed keys;
- malformed seed records with missing/empty key or module data;
- missing approved seeds;
- seeds outside the `core.access` module boundary.

## Validation Results

- `pnpm --dir apps/api exec tsx src/module-registry/module-registry.p5b-004b.test.ts` - PASS
- `pnpm --dir apps/api exec tsx src/module-registry/module-registry.service.test.ts` - PASS
- `pnpm --filter @akti/api test` - PASS
- `pnpm --filter @akti/api typecheck` - PASS
- `git diff --check` - PASS
- `git status --short --branch` - PASS, with only expected `P5B-004b` files pending before commit

## Blocker Closure

The temporary full-API validation blocker documented in `P5B-004a` is closed. `pnpm --filter @akti/api test` now passes after the seed-boundary generalization.

## Boundary Confirmations

- Phase 5A policy, ADR, standard, checklist, and handoff documents were not modified.
- Prisma schema and migrations were not modified.
- Generated registry files were not modified.
- Package and lockfile files were not modified.
- No business-module, Phase 5C, Golden Module, marketplace, deployment, secret, real provider, or runtime AI scope was introduced.
- `platform.shell.access` remains a shell access capability only; it does not grant `access.policy.manage`, Gatekeeper management, admin behavior, or bypass behavior.
