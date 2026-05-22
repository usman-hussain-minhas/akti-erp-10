# ADR-0002: Failure Prevention and Codex Operating Doctrine

## ADR number

ADR-0002

## Title

Failure Prevention and Codex Operating Doctrine

## Date

2026-05-22

## Status

Accepted

## Decision

Codex must work from `AGENTS.md`, accepted ADRs, contracts, schemas, manifests, and inspected repo files. Codex is an implementation agent, repo inspector, plan generator, small-ticket developer, test runner, and diff reviewer. Codex is not the architecture authority, business logic inventor, uncontrolled frontend designer, or production release approver.

Codex must use Plan Mode first for multi-step work and for schema, auth, permission, RLS, payment, certification, WhatsApp, frontend screen, and module-boundary tasks. Implementation is allowed only from an approved plan, except for tiny typo fixes or single-file text edits with no architecture impact.

Delivery must be ticket-sized: one ticket, one bounded outcome. Evidence, reports, peer review, and architecture documents do not replace working validated software.

## Context

The doctrine identifies repeated failure patterns: architecture documents became the deliverable, broad blueprints drifted, manual lists became inconsistent, frontend work was built from imagination, and urgent WhatsApp/Lead Desk business relief was delayed behind foundation work.

AKTI ERP must prevent those failures by forcing planning discipline, source-of-truth hierarchy, small tickets, validation, review, and delivery-first behavior.

## Options considered

- Let Codex build from broad prompts and chat context.
- Use documentation and evidence reports as the primary completion signal.
- Require Plan Mode, approved tickets, validation, compact completion notes, and repo-backed decisions.

## Chosen option

Require the Codex operating model from the doctrine and `AGENTS.md`.

## Consequences

- Codex must inspect relevant files before planning or implementation.
- Codex must not invent architecture, roles, permissions, module boundaries, business rules, or frontend UX.
- Frontend screens require screen contracts before implementation.
- High-risk actions require explicit approval, including dependency additions, broad Prisma changes, auth/session changes, RLS weakening, Gatekeeper changes, destructive migrations, large rewrites, and production-secret access.
- Validation must be run narrowly after changes and reported honestly. Missing scripts or scaffolds must be reported, not invented as side effects.
- Reviews must check scope creep, security, RLS and organization isolation, permission checks, Gatekeeper usage, hardcoded tenant assumptions, frontend usability, schema drift, test coverage, CI, and migration safety.
- Phase 0 must produce enforceable repo artifacts, not another broad blueprint.

## Affected modules

All Codex-driven AKTI ERP planning, implementation, review, validation, frontend, backend, data, contract, and module-boundary work.

## Owner

Usman Minhas / AKTI leadership as interim owner until formally delegated.

## Review date

2026-06-22 or before Phase 1 Build Specification, whichever comes first.
