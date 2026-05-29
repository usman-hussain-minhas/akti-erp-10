# P5B-019a Decision Output

## Decision

Use PostgreSQL FTS `tsvector` columns and GIN indexes on the existing committed core workflow tables:

- `WorkflowDefinition`
- `WorkflowInstance`

## Rationale

- Both tables are committed repo-real Prisma models before P5B-019a.
- Both are core platform workflow surfaces, not business modules.
- Both are tenant-scoped through `organization_id`.
- Both already have tenant indexes and can support organization-scoped search filtering.
- This satisfies the Phase 5B schema surface guidance for extending approved existing tables with `tsvector` columns and GIN indexes.

## Non-Selections

- Lead Desk tables were not selected because business-module implementation is out of Phase 5B scope.
- `ModuleRegistryEntry` was not selected because it is global, not tenant-scoped.
- Typesense was not selected because it is deferred unless measured PostgreSQL FTS targets fail.
- pgvector/vector population was not selected because this ticket scopes the PostgreSQL FTS baseline only.

## Migration Strategy

The repo already uses committed Prisma migration SQL for Phase 5B schema tickets. P5B-019a therefore adds a non-destructive migration that:

- adds generated `search_vector` columns to `WorkflowDefinition` and `WorkflowInstance`;
- creates GIN indexes over those generated `tsvector` columns;
- does not drop, truncate, delete, or alter existing data destructively.
