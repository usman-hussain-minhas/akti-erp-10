# ADR-0007: Phase 3 Security Architecture

## ADR number

ADR-0007

## Title

Phase 3 Security Architecture

## Date

2026-05-25

## Status

Accepted

## Decision

Phase 3 is a hybrid security/auth/tenant hardening phase, leaning toward adding missing security and tenant architecture.

Phase 3 must use the existing Phase 1 and Phase 2 foundations as real but partial foundations:

- service-level organization checks;
- Access Core actor and capability boundaries;
- Gatekeeper fail-closed preflight checks;
- audit and outbox evidence;
- module manifests and generated registry;
- the Phase 2 validation ladder.

Phase 3 must add or complete the missing trust foundations before Phase 4 deployment/staging/visual QA work:

- trusted auth/session and request actor context;
- trusted tenant context propagation;
- tenant isolation enforcement strategy;
- Access Core and Gatekeeper integration with trusted context;
- secrets, environment, headers, and CORS policy;
- runtime route limiting;
- frontend operator-context replacement;
- security and tenant negative validation;
- fresh DB/bootstrap decision or bounded handoff.

Phase 3 implementation must follow these architecture rules:

1. ADRs decide architecture before implementation.
2. Decision/control tickets P3-001 through P3-006 must not modify runtime source, Prisma schema, contracts, generated registry, dependencies, or workflow files unless explicitly reclassified and approved.
3. Implementation tickets must implement the maximum concrete security/auth/tenant capability that is justified by current repo authority and Phase 3 scope.
4. Documentation-only closure is allowed only when the active ticket is explicitly documentation-only or when an approved decision creates a bounded deferral.
5. Phase 4 deployment/staging/visual QA must not start during Phase 3.

## Source-of-truth constraints

The existing source-of-truth hierarchy remains active:

1. `prisma/schema.prisma`
2. `packages/contracts`
3. module manifests
4. generated entity registry
5. `docs/adr`
6. planning/process docs
7. chat history

When implementation reality conflicts with an ADR, the ADR must be reviewed and updated. Chat history must not override repo artifacts.

## Phase 1/2 protections that must not weaken

Phase 3 must preserve:

- Access Core actor/capability boundaries;
- Gatekeeper fail-closed behavior;
- Lead Desk scope enforcement;
- Engagement Gateway mediated WhatsApp boundary;
- audit/outbox evidence;
- cross-org denial behavior.

Tests using `x-actor-user-id` may be updated only when replaced by equivalent or stronger trusted-context coverage.

## Hard boundaries

Phase 3 does not authorize:

- production deployment;
- staging deployment;
- visual QA implementation;
- production WhatsApp credentials;
- real outbound WhatsApp;
- direct Lead Desk-to-Meta/WhatsApp coupling;
- new business modules;
- Foundry/module installer implementation;
- parallel module development;
- platform AI operations;
- destructive migrations;
- committed secrets;
- production credential access;
- new dependencies without explicit approval.

## Required downstream decisions

This ADR gates these Phase 3 decisions:

- ADR-0008 Auth, Session, Identity, and Tenant Context;
- ADR-0009 Tenant Isolation, RLS, and Service Enforcement;
- ADR-0010 Secrets, Environment, Headers, and CORS;
- ADR-0011 Runtime Route Limiting;
- ADR-0012 Fresh DB and Bootstrap.

## Consequences

- Phase 3 can proceed as a full autonomous run only while it obeys the active ticket pack.
- Conditional tickets must re-plan inside the run before implementation.
- A ticket must stop for approval if it requires new dependencies, destructive migrations, production secrets, production credentials, deployment/staging scope, real outbound WhatsApp, or Phase 4 work.
- Phase 4 remains blocked until Phase 3 closure produces execution evidence and a readiness handoff.

## Affected modules

Platform Core, Access Core, Gatekeeper, Audit, Outbox, Module Registry, Configuration, Portal Shell, Engagement Gateway Lite, Lead Desk, and the WhatsApp stub adapter.

## Owner

AKTI / Phase 3 run controller.

## Review date

Before Phase 3 closure or before any Phase 4 planning prompt, whichever comes first.
