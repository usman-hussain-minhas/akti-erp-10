# AKTI ERP Phase 4 Staging Target and Deployment Method Decision v1

**Status:** ACCEPTED_FOR_PHASE_4_EXECUTION
**Ticket:** P4-003

## Decision

Phase 4 will use a disposable local staging/demo target. The deployment proof is local process/build proof, not production launch and not cloud/provider staging.

## Option Matrix

| Option | Requirements | Secrets needed | New dependencies | Cost | Operational realism | Validation confidence | Risks | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Local disposable staging/demo | Local PostgreSQL, API process, web process, existing scripts | Placeholder local env only | None | None | Medium | High for build/start/smoke/browser proof | Less infra-realistic than cloud | Accepted |
| Containerized demo staging | Docker/container definitions | Placeholder local env | Possible tool/config work | Low | Medium/high | Medium | Adds deployment implementation not yet present | Rejected for Phase 4 unless later approved |
| Cloud staging | Provider account, managed DB, hosted web/API | Real provider credentials | Provider config/deployment work | Variable | High | High | Production-adjacent secrets/resources | Rejected without separate approval |

## Minimum Deployment Proof

- `pnpm build` succeeds.
- API process starts with non-secret local/demo env.
- Web process starts or static Next build/start proof succeeds.
- API reaches disposable DB when DB-backed routes are tested.
- `/health` responds from API.
- Web root or app route responds.
- CORS allows the local web origin and rejects unsupported origins where testable.
- Shutdown/restart logs exist.

## Build Artifact Strategy

Use existing repo build outputs only: API `dist/`, web `.next/`, and generated Prisma client. These are ignored artifacts and are not committed.

## API/Web Process Model

- API: `pnpm --filter @akti/api build`, then `pnpm --filter @akti/api start` with placeholder env.
- Web: `pnpm --filter @akti/web build`, then `pnpm --filter @akti/web start` with localhost API base URL if needed.

## Database Target

Use a disposable local PostgreSQL database or cluster for proof. Do not use production, shared staging, or real data.

## CORS/Origin Expectation

Allowed origin for local proof is `http://localhost:3000` and optionally `http://127.0.0.1:3000`. Wildcards remain forbidden.

## Port/Domain Expectation

- API default: `localhost:3001`.
- Web default: `localhost:3000`.
- No public domain, DNS, CDN, or provider endpoint is created.

## Rollback Expectation

Rollback means stopping local processes, reverting to a prior git commit/build artifact, restoring the disposable DB snapshot where applicable, and restoring previous non-secret env values.

## Logging Expectation

Logs must be captured to ticket artifacts and redacted. They must not include real secrets, production data, database URLs, tokens, or session values.

## Stop Conditions

Stop if the selected proof path requires production infrastructure, real credentials, new dependencies, provider deployment work, or any Phase 5/6 scope.
