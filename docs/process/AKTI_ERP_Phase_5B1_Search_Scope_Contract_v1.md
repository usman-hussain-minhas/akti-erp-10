# AKTI ERP Phase 5B1 Search Scope Contract v1

Status: PHASE_5B1_SEARCH_SCOPE_CONTRACT

Phase 5B1 search remains limited to the current Phase 5B PostgreSQL FTS workflow baseline. This document is contract/control evidence only; it does not expand search data, create a new provider, or authorize Phase 5C UI implementation.

## Authoritative Search Targets

| target_key | Prisma model | table | owner_module | tenant scoped | capability filter | notes |
| --- | --- | --- | --- | --- | --- | --- |
| `workflow_definition` | `WorkflowDefinition` | `WorkflowDefinition` | `core.workflow` | yes | required | Existing workflow definition search-vector baseline. |
| `workflow_instance` | `WorkflowInstance` | `WorkflowInstance` | `core.workflow` | yes | required | Existing workflow instance search-vector baseline. |

## Required Capability

`platform.search.query` is the search query capability name for this contract. It does not expand searchable data by itself and does not bypass target-level capability filtering.

## Explicit Non-Scope

The following are not searchable in Phase 5B1:

- CRM / Lead Desk records
- files or documents
- notifications
- Admissions, Finance, HR, or other future business modules
- generated fake search results
- cross-tenant records
- records from unauthorized modules or targets

## Runtime Contract

- Search engine: PostgreSQL FTS baseline.
- Search provider: no external search provider.
- Semantic/vector search: deferred.
- Tenant filtering is required for every search plan.
- Capability filtering is required for every search plan.
- Search result fixtures must not use business-module data.
- Expanding search beyond `WorkflowDefinition` and `WorkflowInstance` requires a later approved phase and updated contracts/tests.
