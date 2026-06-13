# Phase 6B v17 Schema-Control Ticket Pack v1

Status: `PHASE_6B_SCHEMA_CONTROL_TICKETS_READY_FOR_FINAL_REVIEW`

Implementation is not stale by itself. Tickets become stale.
Apply maximum concrete capability within the approved scope of each ticket.

## Summary

- Tickets: 4
- Executable-review-ready schema/control tickets: 1
- Blocked schema/control tickets: 3
- Executable capability tickets: 0
- Ticket generation allowed: false
- Execution authorized: false

## Tickets

### P6B-SCHEMA-001 - Create Phase 6B commerce schema model contract for final approval

- Status: `EXECUTABLE_REVIEW_READY`
- Dependencies: None
- MCR: The named schema model contract artifact maps 103/103 Phase 6B seeds to explicit schema model-decision groups and `pnpm exec prisma validate --schema prisma/schema.prisma` plus `pnpm registry:check` still pass without schema edits.

### P6B-SCHEMA-002 - Implement approved Phase 6B Prisma schema baseline and registry metadata

- Status: `BLOCKED_PENDING_P6B_SCHEMA_001_APPROVAL`
- Dependencies: P6B-SCHEMA-001
- MCR: After P6B-SCHEMA-001 approval, `pnpm exec prisma validate --schema prisma/schema.prisma` and `pnpm registry:check` pass with the approved Phase 6B schema baseline represented in Prisma and registry artifacts.

### P6B-SCHEMA-003 - Regenerate Phase 6B contract and NestJS runtime ownership from approved schema baseline

- Status: `BLOCKED_PENDING_P6B_SCHEMA_002`
- Dependencies: P6B-SCHEMA-002
- MCR: After P6B-SCHEMA-002 lands, `pnpm contracts:validate`, `pnpm --filter @akti/api test:phase-6b-scaffold`, and `pnpm --filter @akti/api typecheck` pass with schema-aligned Phase 6B scaffold metadata.

### P6B-SCHEMA-004 - Regenerate Phase 6B capability implementation tickets after schema baseline

- Status: `BLOCKED_PENDING_P6B_SCHEMA_003`
- Dependencies: P6B-SCHEMA-003
- MCR: The regenerated post-schema ticket pack maps 103/103 seeds and passes stale-ticket prevention, exact-file ownership, dependency graph, and mechanical audit gates while keeping execution authorization false.
