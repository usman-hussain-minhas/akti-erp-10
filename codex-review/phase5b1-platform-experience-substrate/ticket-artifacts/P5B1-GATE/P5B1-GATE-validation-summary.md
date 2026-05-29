# P5B1-GATE Validation Summary

Ticket: P5B1-GATE — Final audit, validation ladder, audit report completion, and handoff closure

## Commands

| Command | Result |
| --- | --- |
| `pnpm contracts:validate` | PASS |
| `pnpm exec prisma validate --schema prisma/schema.prisma` | PASS |
| `pnpm exec prisma generate --schema prisma/schema.prisma` | PASS |
| `pnpm registry:generate` | PASS |
| `pnpm registry:check` | PASS |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS after bounded final-gate repair |
| `pnpm build` | PASS |
| `git diff --exit-code -- prisma/schema.prisma` | PASS |
| `git diff --exit-code -- generated/entity-registry.generated.json` | PASS |
| `git diff --exit-code -- prisma/entity-registry.metadata.json` | PASS |
| `git diff --check` | PASS |
| `git status --short --branch` | PASS; expected final-gate files and the bounded repair were pending commit. |

## Bounded Repair Validation

- Initial failure: `pnpm test` stopped at `module-registry.service.test.ts` because the runtime Access Core seed-boundary allowlist rejected the already-approved `platform.data.controls.view` seed.
- Repair: added `platform.data.controls.view` to `ACCESS_CORE_APPROVED_SEED_CAPABILITY_KEYS`.
- Targeted repair validation: `pnpm --dir apps/api exec tsx src/module-registry/module-registry.service.test.ts` - PASS.
- Full validation after repair: PASS.
