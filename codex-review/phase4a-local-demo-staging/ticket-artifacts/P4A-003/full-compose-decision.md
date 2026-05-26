# P4A-003 Full Docker Compose API/Web/Postgres Decision Gate

Status: DECIDED

## Decision

Full Docker Compose API/Web/Postgres mode is required for Phase 4A resolution and must be handled by P4A-011.

## Rationale

- Docker and Docker Compose are available in the current environment.
- Phase 4A aims for a noob-proof local/demo run experience, not only an expert hybrid path.
- The ticket pack explicitly requires full Compose to be resolved, not silently dropped.
- This decision does not authorize production deployment, cloud/VPS resources, real secrets, or package/dependency changes.

## P4A-011 Obligation

P4A-011 must either:

1. Add and validate a local-only full Compose API/Web/Postgres mode, or
2. Stop with evidence if full Compose requires unapproved dependency, unsafe scope, production-like credentials, cloud/VPS resources, or destructive changes.

## Boundaries

- Local/demo only.
- No production launch.
- No production secrets.
- No cloud/VPS deployment.
- No Phase 4B frontend redesign.
- No Phase 5, Foundry, module installer, or AI runtime.
