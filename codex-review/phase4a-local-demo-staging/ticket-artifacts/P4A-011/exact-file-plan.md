# P4A-011 Exact-File Plan

Ticket: P4A-011 - Full Docker Compose resolution

## Files To Change

- `codex-review/phase4a-local-demo-staging/ticket-artifacts/P4A-011/*`
- `codex-review/phase4a-local-demo-staging/phase4a-run-journal.md`

## Files Not Changed

- `docker-compose.local.yml`
- `apps/api/Dockerfile.local`
- `apps/web/Dockerfile.local`
- `apps/**`
- `packages/**`
- `prisma/**`
- `generated/**`
- `package.json`
- `pnpm-lock.yaml`
- deployment/cloud files

## Resolution Strategy

P4A-003 required full Docker Compose API/Web/Postgres mode to be resolved. The current session has Docker CLI and Compose CLI, but the Docker daemon is unavailable. Adding API/Web Dockerfiles without daemon-backed validation would create stale execution risk and would not prove the full Compose path.

P4A-011 therefore resolves full Compose as explicitly deferred with evidence. P4A-010 must document this deferral in the local demo runbook.
