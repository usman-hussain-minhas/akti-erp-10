# P5B-024a Decision Output

## Decision

Use stateless import/export validation and do not change `prisma/schema.prisma`.

## Reason

Phase 5B Plan v10 marks `ImportJob` as `new if persistence required`. Exact-file planning found no committed repo source requiring durable import job persistence for the P5B-024a baseline. The Phase 5A policy requires import declarations, tenant boundary, audit, safety, and Gatekeeper validation, which can be satisfied by a stateless validation service in this ticket.

## Guardrails

- No `ImportJob` Prisma model was created.
- No registry metadata/generated registry change was required.
- No migration was created.
- Future persistence remains a stop-and-replan condition if a later approved ticket requires durable import jobs.
