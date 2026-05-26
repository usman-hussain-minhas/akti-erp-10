# P4A-011 Full Docker Compose Resolution

Status: EXPLICITLY_DEFERRED_WITH_EVIDENCE

## Decision

Full Docker Compose API/Web/Postgres mode is explicitly deferred for this Phase 4A run.

Hybrid local mode remains the validated local/demo runtime path:

- local/demo PostgreSQL with Docker Compose when daemon is available, otherwise disposable local PostgreSQL fallback;
- local API startup through `scripts/dev/local-up.sh`;
- local Web startup through `scripts/dev/local-up.sh`;
- local smoke through `scripts/dev/local-smoke.sh`;
- browser/screenshot support through `scripts/dev/local-capture-frontend.sh`.

## Evidence Basis

- P4A-003 required full Compose to be resolved and not silently dropped.
- P4A-006 proved the hybrid local runtime path using committed Prisma migrations and local API/Web startup.
- P4A-008 proved one-command smoke for API health, Web root, setup/bootstrap, local CORS, and security headers.
- P4A-009 proved browser URL and screenshot capture support.
- Current Docker CLI and Docker Compose CLI are present, but the Docker daemon is unavailable:
  - `docker-version-log.txt`
  - `docker-compose-version-log.txt`
  - `docker-info-log.txt`
- The existing `docker-compose.local.yml` currently defines local Postgres only:
  - `compose-config-log.txt`

## Why Not Implement Full API/Web Compose Here

Implementing full API/Web Compose would require adding local API/Web Dockerfiles and extending Compose behavior. Because the daemon is unavailable, those files could not be built, run, smoke-tested, or browser-tested in this ticket. Committing unvalidated Dockerfiles would create stale-ticket risk and would weaken the Phase 4A proof standard.

## Follow-Up Requirement

A later approved ticket may implement full Compose API/Web/Postgres mode when Docker daemon-backed validation is available. That future ticket must prove:

- `docker compose -f docker-compose.local.yml config` passes;
- API/Web/Postgres services build and start;
- committed Prisma migrations run with `prisma migrate deploy`;
- `bash scripts/dev/local-smoke.sh` passes against Compose mode;
- browser inspection and screenshot capture work against the Compose Web URL;
- no package/lockfile drift, production secrets, cloud/VPS deployment, Phase 4B redesign, Phase 5, Foundry, or AI runtime scope is introduced.
