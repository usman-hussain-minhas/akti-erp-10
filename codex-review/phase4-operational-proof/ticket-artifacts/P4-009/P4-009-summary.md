# P4-009 Summary

Ticket: P4-009 - Fresh DB/bootstrap implementation proof

Status: STOPPED_WITH_FINDINGS

## Exact-File Plan Used

Changed only P4-009 evidence artifacts under:

`codex-review/phase4-operational-proof/ticket-artifacts/P4-009/`

No runtime source, Prisma schema, migrations, contracts, generated registry, package files, deployment files, staging resources, real env files, production credentials, WhatsApp behavior, Foundry work, AI runtime, or Phase 5/6 scope were changed.

## What Was Proven

- A disposable local PostgreSQL cluster can be initialized.
- The existing Prisma client can be generated.
- The API can build successfully.
- The current Prisma schema can be materialized into a clean disposable database with `prisma db push --url` as a bounded local/demo fallback.
- The existing API can start against that clean disposable database.
- `POST /platform/setup/organization` succeeds with non-production demo data.
- `GET /health` returns healthy after setup.
- `pnpm registry:check` passes after setup.
- No manual database hacks were used.

## Finding

The formal P4-004 migration command does not bootstrap a fresh empty PostgreSQL database from the checked-in migration set. `pnpm exec prisma migrate deploy --schema prisma/schema.prisma --config /tmp/p4_prisma.config.ts` fails on the first checked-in migration because the migration expects `EventOutbox` to already exist.

This indicates the migration history is additive and lacks a complete baseline migration for existing structural tables. Repairing that would require Prisma migration work outside the approved P4-009 artifact-only proof scope.

## Stop Reason

P4-009 requires command-level clean DB bootstrap evidence or a classified blocker that stops execution. After three bounded repair attempts, the migration bootstrap blocker remained. The controlled local/demo runtime fallback proof succeeded, but the migration deploy success criterion did not.

## Classification

- failure_classification: validation_blocker / evidence_blocker
- detailed classification: migration issue / accepted deferral candidate

See `blocker-classification.md`.

## Next Required Action

Do not continue to P4-010 until the Phase 4 owner decides whether to:

1. approve a scoped baseline migration/config repair ticket;
2. revise the Phase 4 fresh DB proof standard to accept `db push` for local/demo only; or
3. explicitly defer production-grade empty-database migration bootstrap with closure risk accepted.
