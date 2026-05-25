# ADR-0006: Phase 2 Migration Baseline Policy

## ADR number

ADR-0006

## Title

Phase 2 Migration Baseline Policy

## Date

2026-05-25

## Status

Accepted

## Decision

Phase 2 hardening requires a non-destructive migration baseline policy before any schema-changing ticket executes.

Current repo reality:

- `prisma/schema.prisma` exists and is active.
- `prisma/migrations/` is not present yet.
- No production database migration execution is permitted in this hardening run.

Policy for this run:

1. Schema-changing tickets may update `prisma/schema.prisma`, registry metadata, and generated registry only within ticket scope and only after P2H-001 completion.
2. Destructive migration operations are forbidden.
3. Production database access and execution are forbidden.
4. Migration artifacts in `prisma/migrations/**` are created only when a concrete schema-changing ticket requires them and can do so non-destructively.
5. If a schema change cannot be represented with a non-destructive migration path, the run must stop.
6. Branch merge-readiness requires migration baseline artifacts to exist for all approved schema changes before merge, even if runtime code is complete.

## Context

The hardening control pack requires migration policy resolution in P2H-001 before schema-changing tickets (for example P2H-005, P2H-007, P2H-009, P2H-010). The repository currently has no migration baseline directory, so policy must be explicit before schema work proceeds.

## Options considered

- Create broad baseline migration immediately for all current schema.
- Defer all schema-changing hardening tickets.
- Set a non-destructive migration policy now and allow ticket-scoped non-destructive migration artifacts when needed.

## Chosen option

Set the non-destructive policy now and require ticket-scoped migration artifacts only when needed by concrete schema-changing tickets.

## Consequences

- P2H schema tickets can proceed in order without destructive migration operations.
- Any migration ambiguity at ticket time remains a hard stop.
- Merge-readiness remains blocked until required migration artifacts are present for schema changes introduced in this run.

## Affected modules

Prisma schema, schema-changing hardening tickets, registry generation/check/verify gates, and final hardening closeout.

## Owner

AKTI / hardening run controller

## Review date

Before final hardening merge-readiness decision.
