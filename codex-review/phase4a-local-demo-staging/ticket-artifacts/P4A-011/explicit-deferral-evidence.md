# P4A-011 Explicit Deferral Evidence

P4A-011 selected `explicitly defer with evidence`.

## Deferral Reason

The Docker daemon is unavailable in the current execution environment:

```text
Cannot connect to the Docker daemon at unix:///Users/usman/.docker/run/docker.sock. Is the docker daemon running?
```

Docker CLI and Docker Compose CLI are installed, but daemon-backed build/up validation cannot run.

## Current Compose State

`docker-compose.local.yml` config validation passes for the current local Postgres-only Compose file. It does not yet define API/Web services.

## Accepted Phase 4A Runtime Proof Path

Until a later approved full-Compose implementation ticket exists, Phase 4A uses the validated hybrid local runtime:

- `scripts/dev/local-up.sh`
- `scripts/dev/local-down.sh`
- `scripts/dev/local-reset-db.sh`
- `scripts/dev/local-smoke.sh`
- `scripts/dev/local-capture-frontend.sh`

This path is local/demo only and uses committed Prisma migrations through `prisma migrate deploy`; `db push` is not accepted as final proof.

## Non-Scope Confirmation

This deferral does not authorize production launch, production secrets, cloud/VPS deployment, real WhatsApp production behavior, Phase 4B frontend redesign, Phase 5, Foundry, AI runtime, new modules, package/dependency changes, destructive migrations, or unvalidated Dockerfiles.
