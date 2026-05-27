# P5A-008 - Shell Base Capability / Session-Gated Screen Contract ADR

Status: Accepted
Date: 2026-05-28
Ticket: P5A-008 - Shell Base Capability / Session-Gated Screen Contract ADR

## Context

Create the execution-grade Phase 5A ADR decision for Shell Base Capability / Session-Gated Screen Contract ADR without drifting into Phase 5B runtime implementation.

Phase 5A is policy and decision work only. This ADR creates governance authority and Phase 5B implementation input; it does not implement runtime code.

## Decision

Resolve P4B-SCHEMA-001 by adopting platform.shell.access as the base shell capability for authenticated operators, while preserving session-valid/authenticated screen contract evolution as a future-compatible path.

## Options Considered

- Recommended default: platform.shell.access seeded for valid authenticated sessions
- Session-gated/authenticated screen-contract type
- Keep access.policy.manage only as rejected local/demo limitation
- Stop if resolving P4B-SCHEMA-001 requires runtime auth implementation

## Selection Criteria

- Matches the Phase 5 strategic reference and current merged repo state.
- Names the owner, enforcement point, Gatekeeper implication where applicable, and Phase 5B implementation input.
- Does not authorize runtime implementation, Foundry/module installer work, business modules, production auth, deployment, secrets, destructive migrations, or package/dependency changes.
- Preserves the lesson that implementation is not stale by itself; stale, shallow, overlapping, unsafe, or non-predictive tickets are the risk.

## Consequences

- access.policy.manage must not remain the long-term shell gate for normal operators.
- Admin regions, Access management, settings mutations, and advanced diagnostics remain separately gated.
- Phase 5A documents the decision only; screen-contract/runtime changes require later exact-file implementation approval.

## Owner And Enforcement Point

- Owner: Platform Architecture.
- Enforcement point: Gatekeeper preflight, Foundry validation, CI/promotion checks, and Phase 5B implementation review.
- Evidence: ticket artifacts plus downstream implementation validation.

## Phase 5B Implementation Input

- Seed/grant base shell access through auth/access implementation.
- Update screen-contract capability model under approved implementation ticket.
- Gatekeeper verifies shell base capability does not imply admin access.

## Non-Scope

- This is Phase 5A governance output only.
- It does not implement Foundry runtime, module installer runtime, business modules, production auth, scheduler runtime, notification runtime, reporting engine runtime, runtime AI, marketplace, external adapters, deployment, secrets, destructive migrations, Prisma/schema/migrations, generated registry changes, or package/dependency changes.
- Runtime implementation belongs to later approved phases and must be blocked if attempted from this artifact.

## Locked Decisions Preserved

- Reporting uses event-driven read models.
- Event schema uses an always-required envelope, context-required fields, and compliance-class mandatory fields.
- Gatekeeper is judge and policy enforcement only; Foundry is module installer and lifecycle runtime only.
- Gatekeeper outcomes are ALLOW, DENY, APPROVAL_REQUIRED, and STOP_FOR_REVIEW.
- STOP_FOR_REVIEW is immutable below platform architect level.
- Workflow Engine is a core platform service, not a Foundry module.
- Search baseline is PostgreSQL FTS with a pgvector extension path; Typesense is deferred unless measured targets fail.
- Multi-tenancy uses shared DB plus organization_id by default, with a future enterprise isolation path.
- Configurable labels are module defaults plus tenant overrides and are display-only.
- White-labeling is a core architectural constraint; white-label mode is none, partial, or full.
- Golden Module implementation belongs to Phase 6A, not Phase 5A or Phase 5B.
