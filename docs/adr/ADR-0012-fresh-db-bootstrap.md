# ADR-0012: Fresh DB and Bootstrap

## ADR number

ADR-0012

## Title

Fresh DB and Bootstrap

## Date

2026-05-25

## Status

Accepted

## Decision

Phase 3 will not execute fresh empty-database bootstrap implementation.

Fresh DB/bootstrap remains a bounded Phase 4 deployment-readiness handoff item. Phase 3 closure must record the current migration/bootstrap state, known assumptions, and remaining risk.

## Repo evidence

The current repo has:

- active Prisma schema;
- non-destructive Phase 2 migration artifacts;
- generated registry and metadata alignment;
- validation commands for Prisma validate/generate and registry drift;
- no approved deployment/staging environment;
- no production database access authorization.

The Phase 2 accepted deferrals document assigns fresh empty-database bootstrap baseline to Phase 4 deployment-readiness work.

## Rationale

Fresh DB/bootstrap validation is tightly coupled to deployment/staging readiness, database provisioning, migration execution policy, seed data policy, and environment configuration.

Phase 3 can and must preserve Prisma/schema/registry integrity, but implementing or proving a full empty-database bootstrap would require Phase 4 deployment-readiness scope that is not authorized in this run.

## Phase 3 requirements

Phase 3 must:

- keep Prisma validation passing;
- keep Prisma generate passing;
- keep registry generation/check/verify passing;
- avoid destructive migrations;
- avoid production database access;
- record bootstrap readiness assumptions in P3-GATE.

Phase 3 must not:

- create deployment infrastructure;
- run production migrations;
- access production databases;
- create broad baseline migrations outside ticket scope;
- invent seed data or business setup assumptions.

## P3-GATE handoff

P3-GATE must include a Phase 4 readiness handoff entry for fresh DB/bootstrap covering:

- current migration artifact status;
- validation commands passed;
- known lack of full fresh DB deployment proof;
- exact future decision needed before deployment/staging.

## Consequences

- Phase 3 remains focused on security/auth/tenant hardening.
- Fresh DB/bootstrap is not ignored; it is explicitly bounded for Phase 4.
- Any Phase 3 ticket that unexpectedly requires fresh DB/bootstrap execution must stop.

## Affected modules

Prisma schema, migrations, registry validation, Phase 3 closure, and Phase 4 readiness handoff.

## Owner

AKTI / Phase 3 run controller.

## Review date

At Phase 3 closure and before Phase 4 deployment/staging work begins.
