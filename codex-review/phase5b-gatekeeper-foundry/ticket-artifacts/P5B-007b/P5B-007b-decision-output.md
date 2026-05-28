# P5B-007b Decision Output

## Decision

Create `GatekeeperDecisionRecord`.

## Selection Reason

Repo inspection found no existing `GatekeeperDecisionRecord` or equivalent durable Gatekeeper decision table. The current Gatekeeper surface normalizes outcomes in contract/runtime code, but had no durable persistence surface for decision records.

The selected model is additive and non-destructive. It preserves canonical outcomes:

- `ALLOW`
- `DENY`
- `APPROVAL_REQUIRED`
- `STOP_FOR_REVIEW`

## Files Selected

- `prisma/schema.prisma`
- `prisma/entity-registry.metadata.json`
- `generated/entity-registry.generated.json`
- `prisma/migrations/20260529000000_p5b007b_gatekeeper_decision_record/migration.sql`
- `apps/api/src/gatekeeper/gatekeeper-preflight.service.ts`
- `apps/api/src/gatekeeper/gatekeeper.p5b-007b.test.ts`

## Scope Guard

`P5B-007c`, `P5B-007d`, and later Gatekeeper checklist behavior were not implemented in this decision.
