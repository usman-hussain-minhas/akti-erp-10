# P5B-005a Decision Output

## Decision

Reuse existing Prisma models for the Phase 5B tenant configuration schema/model baseline.

## Selected Models

- `OrganizationSetting` for tenant-scoped configuration values.
- `OrganizationDomain` for tenant-scoped domain identity.

## Rejected Model

- `PlatformTenantConfig`

## Rationale

The current Prisma schema already has the exact persistence surfaces required for the Phase 5B baseline:

- `OrganizationSetting` includes `organization_id`, `key`, `value_json`, `updated_at`, `@@unique([organization_id, key])`, and `@@index([organization_id])`.
- `OrganizationDomain` includes `organization_id`, `domain`, `is_primary`, `verified_at`, `domain @unique`, `@@unique([organization_id, domain])`, `@@index([organization_id])`, and `@@index([domain])`.

Creating `PlatformTenantConfig` would duplicate existing tenant-scoped configuration and domain identity surfaces, increase registry drift risk, and overlap later service tickets.

## Schema Result

No Prisma schema change was required. Prisma validation, Prisma generate, registry generate, and registry check passed with the existing schema.

## Guardrails

- No Phase 5A policy, ADR, standard, checklist, or handoff document was modified.
- No generated registry file was changed.
- No package or lockfile was changed.
- No Phase 5C, Golden Module, business module, marketplace, provider, deployment, secret, or runtime AI scope was introduced.
