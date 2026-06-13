# P5B-035a Internal Minimal Fixture Manifest

## Ticket

- Ticket: P5B-035a
- Title: Internal minimal fixture manifest
- Tier: 5

## Bounded Replan

The ticket was typed as control/evidence and initially listed only a summary artifact, but its title and MCR require a real internal minimal fixture manifest. Under the standing bounded-replan authority for evidence/control tickets with implementation MCRs, this ticket added a narrow contract-level manifest and proof test.

## Exact Files Changed

- `packages/contracts/internal-fixture.module-manifest.contract.ts`
- `packages/contracts/internal-fixture.module-manifest.p5b-035a.test.ts`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-035a/P5B-035a-summary.md`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-035a/P5B-035a-validation-summary.md`

## Manifest Summary

The internal fixture manifest uses the existing `platform.fixture` namespace from Phase 5B Foundry tests. It is a platform-owned, non-business, non-Golden, non-marketplace fixture that depends only on `core.access` and consumes `platform.shell.access`.

The manifest declares:

- low-risk read capability: `platform.fixture.read`
- high-risk governed lifecycle capability: `platform.fixture.manage`
- Gatekeeper hook for `platform.fixture.manage`
- manifest-only non-destructive migration proof entry
- internal fixture setting and shell menu entry
- transactional outbox event declaration for lifecycle proof
- no sensitive data ownership and no dependent-module blocking

## Source Files Inspected

- `docs/process/AKTI_ERP_Phase_5B_Plan_v10.md`
- `docs/process/AKTI_ERP_Phase_5B_Ticket_Pack_v1.json`
- `packages/contracts/module-manifest.schema.ts`
- `packages/contracts/scripts/validate-module-manifest-contracts.mjs`
- `packages/contracts/scripts/validate-contracts.mjs`
- `apps/api/src/foundry/foundry.service.ts`
- `apps/api/src/foundry/foundry.p5b-009b.test.ts`
- `apps/api/src/module-registry/module-registry.p5b-015b.test.ts`
- `apps/api/src/module-registry/module-registry.p5b-015c.test.ts`
- `apps/api/src/module-registry/module-registry.p5b-015d.test.ts`
- `apps/api/src/module-registry/module-registry.p5b-015e.test.ts`

## Boundary Confirmation

- This is an internal fixture manifest only, not a Golden Module.
- No business module, business workflow, marketplace, production adapter, deployment, secret, or runtime AI scope was introduced.
- No Prisma/schema/migration files were modified.
- No generated registry files were modified.
- No package or lockfile files were modified.
- No Phase 5A policy, ADR, standard, checklist, or handoff documents were modified.
