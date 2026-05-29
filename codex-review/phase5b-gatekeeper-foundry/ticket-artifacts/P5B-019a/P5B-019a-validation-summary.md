# P5B-019a Validation Summary

## Ticket

P5B-019a — PostgreSQL FTS search schema/index baseline

## Exact Files Changed

- `prisma/schema.prisma`
- `generated/entity-registry.generated.json`
- `prisma/migrations/20260529040000_p5b019a_search_fts_baseline/migration.sql`
- `apps/api/src/search/search.service.ts`
- `apps/api/src/search/search.p5b-019a.test.ts`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-019a/P5B-019a-decision-output.md`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-019a/P5B-019a-validation-summary.md`

## Model/Table Decision

The PostgreSQL FTS baseline extends these approved existing tenant-scoped core workflow tables:

- `WorkflowDefinition`
- `WorkflowInstance`

Each table now declares a Prisma `Unsupported("tsvector")?` `search_vector` field. The migration creates stored generated `tsvector` columns and GIN indexes:

- `WorkflowDefinition_search_vector_idx`
- `WorkflowInstance_search_vector_idx`

`ModuleRegistryEntry` was not selected because it is global. Lead Desk tables were not selected because business modules are out of Phase 5B scope. Typesense and vector population remain deferred.

## Migration Strategy

The repo uses committed Prisma migration SQL for Phase 5B schema tickets, so P5B-019a adds `prisma/migrations/20260529040000_p5b019a_search_fts_baseline/migration.sql`.

The migration is additive only:

- adds generated `search_vector` columns;
- adds GIN indexes;
- contains no `DROP`, `TRUNCATE`, `DELETE FROM`, or `DROP COLUMN` operations.

## Registry/Generated Drift

`generated/entity-registry.generated.json` drift is deterministic from the scoped Prisma schema change and was produced by `pnpm registry:generate`.

`prisma/entity-registry.metadata.json` did not change because no new Prisma model was added. The registry generator currently renders Prisma unsupported field types as the string `[object Object]`; P5B-019a records this repo-real generated representation while validating that the `search_vector` fields are present and non-relational.

## Validation Commands

- `pnpm exec prisma validate --schema prisma/schema.prisma` — PASS
- `pnpm exec prisma generate --schema prisma/schema.prisma` — PASS
- `pnpm registry:generate` — PASS
- `pnpm registry:check` — PASS
- `pnpm --dir apps/api exec tsx src/search/search.p5b-019a.test.ts` — PASS
- `pnpm --filter @akti/api typecheck` — PASS
- `pnpm --filter @akti/api test` — PASS
- `git diff --check` — PASS
- destructive migration scan (`DROP`, `TRUNCATE`, `DELETE FROM`, `DROP COLUMN`) — PASS, no matches

## Scope Confirmation

- Phase 5A policy, ADR, standard, checklist, and handoff documents were not modified.
- No package files, lockfiles, deployment files, secrets, Phase 5C frontend work, business modules, Golden Module, marketplace, production adapters, or runtime AI behavior were introduced.
- P5B-019b Search API and P5B-019c tenant isolation/performance proof were not implemented.
