# P5A-007 - Platform Versioning Baseline and Repo-Readable Artifact Decision

Status: Accepted
Date: 2026-05-28
Ticket: P5A-007 - Platform Versioning Baseline and Repo-Readable Artifact Decision

## Context

Create the execution-grade Phase 5A ADR decision for Platform Versioning Baseline and Repo-Readable Artifact Decision without drifting into Phase 5B runtime implementation.

Phase 5A is policy and decision work only. This ADR creates governance authority and Phase 5B implementation input; it does not implement runtime code.

## Decision

Create repo-readable platform version metadata as governance source using platform.version.json and ADR-0017; default platform_core_version is 1.0.0 for the Phase 5A policy baseline.

## Options Considered

- Create platform.version.json at repo root
- Create VERSION at repo root
- Defer artifact with explicit Phase 5B blocker
- Stop if package.json versioning is requested

## Selection Criteria

- Matches the Phase 5 strategic reference and current merged repo state.
- Names the owner, enforcement point, Gatekeeper implication where applicable, and Phase 5B implementation input.
- Does not authorize runtime implementation, Foundry/module installer work, business modules, production auth, deployment, secrets, destructive migrations, or package/dependency changes.
- Preserves the lesson that implementation is not stale by itself; stale, shallow, overlapping, unsafe, or non-predictive tickets are the risk.

## Consequences

- The version artifact is governance metadata, not runtime Foundry implementation.
- Version updates require owner, reason, compatibility note, and evidence.
- Phase 5B consumes this artifact for compatibility checks but must not infer runtime behavior not declared here.

## Owner And Enforcement Point

- Owner: Platform Architecture.
- Enforcement point: Gatekeeper preflight, Foundry validation, CI/promotion checks, and Phase 5B implementation review.
- Evidence: ticket artifacts plus downstream implementation validation.

## Phase 5B Implementation Input

- Foundry reads platform compatibility requirement from manifests and version metadata.
- Gatekeeper checks version compatibility declarations.
- Release evidence includes platform version.

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
