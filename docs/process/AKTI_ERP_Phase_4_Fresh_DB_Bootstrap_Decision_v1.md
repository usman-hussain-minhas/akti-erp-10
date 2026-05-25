# AKTI ERP Phase 4 Fresh DB Bootstrap Decision v1

**Status:** ACCEPTED_FOR_PHASE_4_EXECUTION
**Ticket:** P4-004

## Decision

Phase 4 fresh DB proof uses a disposable local PostgreSQL database with no production data and no production credentials. The proof must use existing Prisma migrations, generated Prisma client, and the existing organization setup path. Manual DB hacks are forbidden.

## Clean DB Definition

A clean DB is a newly created disposable PostgreSQL database whose application schema has not been migrated and contains no AKTI ERP application data before the proof starts.

## Allowed Database Type

Local PostgreSQL only. SQLite, production PostgreSQL, cloud managed DBs, shared staging DBs, and production backups are not allowed for this proof.

## Exact Commands For P4-009

Use values under `codex-review/phase4-operational-proof/local-runtime/` and redact URLs in artifacts. Replace the password only with a local placeholder.

```bash
mkdir -p codex-review/phase4-operational-proof/local-runtime
initdb -D codex-review/phase4-operational-proof/local-runtime/pgdata
pg_ctl -D codex-review/phase4-operational-proof/local-runtime/pgdata -l codex-review/phase4-operational-proof/local-runtime/postgres.log -o "-p 55432" start
createdb -h 127.0.0.1 -p 55432 akti_phase4_operational_proof
export DATABASE_URL="postgresql://localhost:55432/akti_phase4_operational_proof"
pnpm exec prisma migrate deploy --schema prisma/schema.prisma
pnpm exec prisma generate --schema prisma/schema.prisma
pnpm --filter @akti/contracts build
PORT=3101 AKTI_AUTH_SESSION_SECRET=phase4-local-placeholder-secret AKTI_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000 DATABASE_URL="$DATABASE_URL" pnpm --filter @akti/api start
curl -sS -X POST http://127.0.0.1:3101/platform/setup/organization -H "Content-Type: application/json" --data "{"slug":"phase4-demo","display_name":"Phase 4 Demo Organization","status":"active","domain":"phase4-demo.example","is_primary":true}"
curl -sS http://127.0.0.1:3101/health
pnpm registry:check
pg_ctl -D codex-review/phase4-operational-proof/local-runtime/pgdata stop
```

## Setup Organization Path

Use `POST /platform/setup/organization` with non-production demo data. The service must create the organization/domain, write outbox evidence, and seed module registry/capabilities through existing code.

## Admin/Operator Bootstrap Strategy

Phase 4 does not invent users, roles, or permissions. Operator/admin access for later auth smoke tests is bounded to existing Phase 3 token/session test helpers and existing seeded Access Core capabilities where available. Any missing real admin bootstrap path is classified as a Phase 5/production readiness input, not silently invented.

## Capability and Module Registry Expectation

`ModuleRegistryService.seedCoreFoundation` must seed Access Core, Engagement Gateway, and Lead Desk manifests/capabilities from existing contracts/manifests. `pnpm registry:check` must still pass.

## Idempotency Expectation

The first setup call succeeds on an empty DB. A repeated setup call should be rejected by existing conflict behavior.

## Rollback/Reset Expectation

Database reset means stopping the local DB process and deleting the disposable local runtime directory. Do not run destructive commands against shared or production databases.

## Manual DB Hack Prohibition

Do not insert/update/delete application rows manually for bootstrap proof. Use migrations and existing setup/service paths only.

## Success Criteria

- Prisma migration deploy completes.
- Prisma generate completes.
- API can start against the clean DB.
- Setup organization route returns created/completed response.
- Module/capability registry checks pass.
- No manual DB hacks, production data, or production credentials are used.
