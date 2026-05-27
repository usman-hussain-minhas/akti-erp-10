# P5A-009a - Module Registry Frontend API Boundary

Status: Accepted
Date: 2026-05-28
Ticket: P5A-009a - Module Registry Frontend API Boundary

## Context

Create the execution-grade Phase 5A ADR decision for Module Registry Frontend API Boundary without drifting into Phase 5B runtime implementation.

Phase 5A is policy and decision work only. This ADR creates governance authority and Phase 5B implementation input; it does not implement runtime code.

## Decision

Module registry frontend API is a read-oriented boundary for approved module metadata, navigation surfaces, capability-aware visibility, lifecycle state, and version/compatibility information.

## Options Considered

- Formalize GET /platform/modules and related read APIs
- Use generated registry directly as frontend source
- Defer API boundary with explicit Phase 5B blocker
- Stop if runtime endpoint implementation is requested

## Selection Criteria

- Matches the Phase 5 strategic reference and current merged repo state.
- Names the owner, enforcement point, Gatekeeper implication where applicable, and Phase 5B implementation input.
- Does not authorize runtime implementation, Foundry/module installer work, business modules, production auth, deployment, secrets, destructive migrations, or package/dependency changes.
- Preserves the lesson that implementation is not stale by itself; stale, shallow, overlapping, unsafe, or non-predictive tickets are the risk.

## Consequences

- Frontend consumes registry API, not raw manifests or database internals.
- Registry API must not expose secrets, raw policy internals, or unauthorized module surfaces.
- Mutations belong to Foundry/Gatekeeper flows, not registry read API.

## Owner And Enforcement Point

- Owner: Platform Architecture.
- Enforcement point: Gatekeeper preflight, Foundry validation, CI/promotion checks, and Phase 5B implementation review.
- Evidence: ticket artifacts plus downstream implementation validation.

## Phase 5B Implementation Input

- Define and implement registry endpoint after policy approval.
- Gatekeeper validates registry-affecting changes.
- Frontend shell consumes approved registry response.

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
