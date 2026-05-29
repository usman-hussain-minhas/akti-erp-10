# P5B-010a Decision Output

## Decision

Selected option:

- Extend the existing `ModuleRegistryEntry` model and add a new `ModuleLifecycleEvent` model.

## Reason

`ModuleRegistryEntry` already exists as the global registry entry source for module key, display name, version, status, and manifest hash. It did not need replacement.

The current repo had no durable lifecycle event model for Foundry/module registry lifecycle transitions. Phase 5B v10 names `ModuleLifecycleEvent` as the possible lifecycle audit surface, and later Foundry lifecycle/API tickets depend on durable lifecycle status evidence. A new non-destructive lifecycle event table is therefore needed.

## Exact Schema Choice

- `ModuleRegistryEntry` remains global and keeps `module_key` as primary key.
- Added registry indexes for `version` and `status + version`.
- Added `ModuleLifecycleEvent` with module key, optional tenant/organization context, optional actor context, from/to status, action key, evidence reference, reason, metadata, and created timestamp.
- `ModuleLifecycleEvent.organization_id` is nullable so global lifecycle events remain possible, but tenant-scoped events have an organization field and registry metadata marks the model tenant-scoped/RLS-required.

## Migration Strategy

- Existing repo strategy includes ticket-scoped non-destructive Prisma migrations.
- Generated this migration offline from the previous committed schema to the working schema using Prisma migrate diff.
- Migration file: `prisma/migrations/20260529010000_p5b010a_module_lifecycle_event/migration.sql`
- The migration is additive: create table, create indexes, add foreign keys.

## Registry Drift

- `prisma/entity-registry.metadata.json` was updated with `ModuleLifecycleEvent` metadata.
- `generated/entity-registry.generated.json` was regenerated from Prisma schema plus metadata.
- Registry drift is deterministic and authorized by the P5B-010a ticket-pack control patch.

## Non-Scope Confirmation

- No Phase 5A policy, ADR, standard, checklist, or handoff documents were modified.
- No Foundry lifecycle execution, install flow, API route, business module, marketplace, production adapter, deployment, secret, package, or lockfile work was implemented.
