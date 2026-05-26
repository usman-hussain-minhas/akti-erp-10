# P4A-005 Local DB Reset and Migration Proof Contract

Status: DECIDED

## Decision

Phase 4A local DB reset uses a local/demo PostgreSQL container with disposable database state. The reset proof path is:

1. Stop local API/Web processes if running.
2. Stop local/demo PostgreSQL container.
3. Remove only the Phase 4A local/demo database volume.
4. Start the local/demo PostgreSQL container.
5. Run pnpm exec prisma migrate deploy --schema prisma/schema.prisma --config prisma.config.ts.
6. Run DB-to-schema diff validation.

## Selected Reset Strategy

Primary: container volume reset through docker compose local/demo project naming.

Fallback: disposable local PostgreSQL database recreate is allowed only if Docker fails and the exact-file plan proves it is local-only and does not touch persistent/staging/production data.

## Safety Rules

- Never use production, staging, shared, or persistent DATABASE_URL values.
- Reset commands must target the Phase 4A local/demo database name only.
- Reset commands must show the target database URL host/port/database before destructive local reset.
- Real .env files must not be sourced.
- db push is not final proof.

## Success Criteria

- Clean local database migrates through committed Prisma migrations.
- prisma migrate diff from datasource to schema is empty.
- No manual DB hacks are used.
- No Prisma schema or migration edits are required.
