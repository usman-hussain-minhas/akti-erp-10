# ADR-0004: Prisma-Derived Entity Registry Strategy

## ADR number

ADR-0004

## Title

Prisma-Derived Entity Registry Strategy

## Date

2026-05-22

## Status

Accepted

## Decision

AKTI ERP Entity Registry must be generated, not manually maintained.

`prisma/schema.prisma` remains the structural source of truth for tables/entities. Registry metadata is derived from Prisma plus explicit annotations or companion metadata.

The generated registry is a build/CI artifact, not an edited source of truth. Phase 0, Phase 1, and Phase 2 entities are detailed first; future phase entities remain placeholders until phase-specific planning begins.

The generated registry must support checks for:

- `table_name`
- `owner_module`
- `phase`
- RLS and organization requirements
- indexes
- unique constraints
- events
- retention
- audit
- sensitive data classification

CI must fail when the generated registry is stale, when tenant-scoped tables lack isolation metadata, or when module-owned entities lack `owner_module` / `phase` metadata.

The registry does not replace Prisma, module manifests, contracts, or ADRs. The registry does not become a runtime service in Phase 0. Runtime registry tables, if ever needed, require a later ADR.

## Context

AKTI ERP needs entity metadata for validation, governance, tenant isolation, module ownership, and CI checks. Previous projects drifted when entity lists, RLS lists, indexes, events, and ownership metadata were manually maintained in parallel.

ADR-0001 ranks `prisma/schema.prisma` above generated registry artifacts. `AGENTS.md` requires generated registry checks and forbids manually maintained source-of-truth lists.

## Options considered

- Maintain Entity Registry manually.
- Use Prisma alone with no derived registry artifact.
- Generate Entity Registry from Prisma plus approved metadata.
- Build a runtime Entity Registry service immediately.

## Chosen option

Generate Entity Registry from Prisma plus explicit metadata as a build/CI artifact.

## Consequences

- Entity metadata drift is reduced because registry output is derived and checked.
- Prisma remains structural authority for tables, relationships, migrations, and constraints.
- Registry metadata can support CI checks for tenant isolation, ownership, phase, indexes, unique constraints, events, retention, audit, and sensitivity.
- Future phase entities stay placeholders until planning begins.
- Runtime registry service decisions are deferred to a later ADR.

## Affected modules

Prisma schema, generated entity registry, module manifests, contracts, CI validation, tenant isolation, module ownership, and future database/entity tickets.

## Owner

Usman Minhas / AKTI leadership as interim owner until formally delegated.

## Review date

2026-06-22 or before Phase 1 Build Specification, whichever comes first.
