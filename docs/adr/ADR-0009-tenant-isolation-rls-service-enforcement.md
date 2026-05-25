# ADR-0009: Tenant Isolation, RLS, and Service Enforcement

## ADR number

ADR-0009

## Title

Tenant Isolation, RLS, and Service Enforcement

## Date

2026-05-25

## Status

Accepted

## Decision

Phase 3 will implement service-level tenant isolation enforcement and negative tests as the concrete tenant isolation path for this run.

Database RLS remains an architecture requirement for tenant-scoped data, but Phase 3 will not implement DB RLS policies in Prisma migrations during this run.

P3-008 must therefore re-plan as a service-level enforcement hardening ticket. It must not force DB RLS, Prisma schema changes, or migration work.

## Repo evidence

The current repo already has partial tenant-isolation foundations:

- tenant-scoped Prisma models include `organization_id`;
- tenant-scoped registry metadata uses `tenant_scoped`, `organization_id_required`, and `rls_required`;
- Access Core, Hierarchy, Configuration, Engagement Gateway, Lead Desk, Audit, and Outbox code paths use organization-scoped service checks;
- Phase 1 and Phase 2 tests include same-org and cross-org denial coverage.

The current repo does not yet have:

- DB-level `CREATE POLICY` or `ENABLE ROW LEVEL SECURITY` migration artifacts;
- a per-request Prisma transaction tenant context strategy;
- a reliable `SET LOCAL` / `current_setting` chain tied to trusted auth context across all Prisma reads and writes.

## Rationale

Implementing DB RLS safely requires both policies and runtime tenant session variables. Adding policies without a complete request-to-transaction tenant setting would risk breaking legitimate Phase 1/2 behavior or creating decorative policy artifacts that are not exercised by runtime code.

The maximum concrete Phase 3 capability that is safely justified now is:

- trusted auth/tenant context at API ingress;
- service-level tenant checks using the trusted context;
- cross-tenant negative tests;
- validation that tenant-scoped metadata and registry drift checks remain intact.

## P3-008 requirements

P3-008 must:

- re-plan after this ADR;
- avoid Prisma schema/migration changes;
- preserve registry metadata;
- harden service-level organization checks where exact-file planning finds gaps;
- add or strengthen cross-tenant negative tests;
- stop if implementation requires DB RLS, destructive migration, new dependencies, or production database access.

## Future DB RLS trigger

DB RLS may be re-opened only after a later approved decision defines:

- the database session variable strategy;
- how Prisma requests enter tenant-scoped transactions;
- how background jobs and outbox workers set tenant context;
- migration safety for existing tenant-scoped tables;
- validation against a fresh database/bootstrap path.

This future work must not be hidden inside Phase 3 implementation tickets unless a later explicit approval reclassifies scope.

## Consequences

- Phase 3 improves concrete tenant isolation without creating unsafe or untested RLS migrations.
- P3-008 remains implementation work, not documentation-only, because service-level enforcement and cross-tenant tests must be strengthened.
- Phase 3 closure must record DB RLS as a bounded remaining risk/deferral.

## Affected modules

Prisma metadata, Access Core, Hierarchy, Configuration, Engagement Gateway Lite, Lead Desk, Audit, Outbox, Gatekeeper, and Phase 3 validation.

## Owner

AKTI / Phase 3 run controller.

## Review date

Before Phase 3 closure and before any DB RLS policy implementation.
