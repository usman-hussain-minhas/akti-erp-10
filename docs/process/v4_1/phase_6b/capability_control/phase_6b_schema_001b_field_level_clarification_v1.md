# Phase 6B Schema 001B Field-Level Clarification v1

Status: `P6B_SCHEMA_001B_FIELD_LEVEL_SCHEMA_DECISION_REQUIRED`

## Summary

`P6B-SCHEMA-002` must not start yet. The accepted `P6B-SCHEMA-001` contract provides the 47 Phase 6B model names, 103 seed mappings, tenant-scoping policy, and registry metadata policy, but it does not define field-level schema shape.

Creating 47 Prisma models now would require choosing between technical scaffold fields, generic JSON placeholders, relation skeletons, or full business persistence fields. That choice is a schema decision, not a deterministic implementation detail.

## What is derivable

- 47 Phase 6B model names.
- 103/103 seed-to-model-decision-group mappings.
- Every new Phase 6B model must be tenant scoped through `organization_id`.
- Every new Phase 6B model must appear in entity registry metadata.
- Capability implementation remains unauthorized.
- Ticket generation remains unauthorized.

## What is not derivable

- Whether technical scaffold tables only are acceptable.
- Whether generic `Json` payload or metadata fields are allowed.
- Whether CRM models must relate to existing `LeadRecord` now.
- Whether finance/payment/accounting models should include relations now.
- Whether the migration baseline should be model existence only, relation skeleton, or full persistence schema.

## Required decision before Prisma implementation

Create or approve `P6B-SCHEMA-001B` as a field-level schema policy before `P6B-SCHEMA-002` modifies:

- `prisma/schema.prisma`
- `prisma/migrations/<phase_6b_schema_baseline>/migration.sql`
- `prisma/entity-registry.metadata.json`
- `generated/entity-registry.generated.json`

## Final status

`PHASE_6B_SCHEMA_CONTROL_STOPPED_FIELD_LEVEL_DECISION_REQUIRED`
