# ADR-0011: Runtime Route Limiting

## ADR number

ADR-0011

## Title

Runtime Route Limiting

## Date

2026-05-25

## Status

Accepted

## Decision

Phase 3 will implement a no-new-dependency in-app API route limiter.

P3-010 must re-plan as runtime implementation and test work. It must not become docs-only handoff.

The route limiter must:

- use existing Node/Nest runtime capabilities only;
- avoid new package dependencies;
- apply before protected API handlers;
- fail closed when a client exceeds the configured request count within a configured window;
- return a `429` response with bounded retry information;
- be configurable through non-secret environment variables governed by ADR-0010;
- include negative tests.

## Configuration

Approved non-secret variables:

```text
AKTI_RATE_LIMIT_WINDOW_MS
AKTI_RATE_LIMIT_MAX_REQUESTS
```

P3-010 may use safe local defaults if variables are absent or invalid, but invalid configured values must be detected by validation logic.

## Scope limits

P3-010 must not implement:

- deployment infrastructure;
- edge/CDN/WAF limiting;
- hosting-specific logic;
- production operations configuration;
- new dependencies;
- secrets or production credentials.

## Rationale

Runtime route limiting was an accepted Phase 2 deferral assigned to Phase 3 security hardening. The repo has a small Nest API surface and no route-limiting dependency. A no-new-dependency in-memory limiter provides concrete Phase 3 protection while avoiding dependency approval and deployment work.

This limiter is not a complete distributed production abuse-control system. Phase 4 deployment/staging can later decide whether infrastructure-level controls are required.

## P3-010 requirements

P3-010 must:

- re-plan after this ADR;
- add runtime limiter implementation;
- add focused limiter tests;
- ensure no deployment/staging work is introduced;
- stop if a dependency or infrastructure limiter becomes necessary.

## Consequences

- Phase 3 implements concrete route limiting.
- CI/security-gate alignment in P3-014 must include the limiter tests through existing validation.
- If Phase 4 later adds infrastructure-level controls, they must complement, not silently remove, this Phase 3 runtime behavior unless a later decision approves it.

## Affected modules

API bootstrap, Phase 3 security validation, and Phase 4 readiness handoff.

## Owner

AKTI / Phase 3 run controller.

## Review date

Before Phase 3 closure or before deployment/staging infrastructure work begins.
