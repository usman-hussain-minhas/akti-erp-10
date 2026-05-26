# P4A-002 Local Environment Architecture Decision

Status: DECIDED

## Decision

Phase 4A will use both modes with hybrid first:

1. Primary implementation path: hybrid local runtime.
   - PostgreSQL runs through local/demo Docker Compose.
   - API and Web run through local pnpm commands.
   - This gives fast feedback, simple debugging, and clear browser inspection.
2. Required later resolution: full Docker Compose API/Web/Postgres posture.
   - P4A-003 decides required/approval-gated/deferred posture.
   - P4A-011 resolves it with proof or evidence-backed deferral.

## Why

Hybrid local first is the fastest safe path to a noob-proof local run loop while preserving the Phase 4A requirement that full Compose must not silently disappear.

## Boundaries

- No production launch.
- No cloud/VPS resource creation.
- No production secrets.
- No Phase 4B frontend redesign.
- No package or dependency changes.

## Selected Service Model

- PostgreSQL: local/demo container on 127.0.0.1:55432.
- API: local pnpm process on 127.0.0.1:3101.
- Web: local pnpm/Next process on 127.0.0.1:3003.
- Browser URL: http://127.0.0.1:3003.
- API URL consumed by web: http://127.0.0.1:3101.

## Re-plan Trigger

If Docker is unavailable, P4A-006 must stop or use the ticket-approved local PostgreSQL fallback only if exact-file planning proves it remains local/disposable and safe.
