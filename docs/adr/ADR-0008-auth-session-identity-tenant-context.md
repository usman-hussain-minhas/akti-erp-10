# ADR-0008: Auth, Session, Identity, and Tenant Context

## ADR number

ADR-0008

## Title

Auth, Session, Identity, and Tenant Context

## Date

2026-05-25

## Status

Accepted

## Decision

Phase 3 will introduce a trusted request context based on a no-new-dependency signed bearer session envelope.

The API will resolve actor and tenant context from:

```text
Authorization: Bearer <phase3-session-token>
```

The token format is a Phase 3 internal session envelope:

```text
base64url(json_payload).base64url(hmac_sha256(json_payload, AKTI_AUTH_SESSION_SECRET))
```

The payload must include:

```text
actor_user_id
organization_id
issued_at
expires_at
```

The payload may include `session_id` or `auth_level` only if needed for validation and without inventing roles, permissions, business rules, or deployment behavior.

The bearer session identifies an existing `User` in an existing `Organization`. It does not create new roles, permissions, organizations, campuses, groups, or business rules.

## Runtime policy

P3-007A must add the request-context infrastructure:

- parse the bearer session;
- verify the HMAC signature with `AKTI_AUTH_SESSION_SECRET`;
- reject malformed, unsigned, expired, or missing sessions for protected Phase 3 routes;
- expose `{ actor_user_id, organization_id }` as trusted request context;
- fail closed when the session cannot be trusted.

P3-007B must migrate API ingress surfaces from caller-controlled actor headers to the trusted request context in bounded slices.

Route organization context must match the session `organization_id`. Body fields such as `organization_id` or `actor_user_id`, where existing contracts still require them, must match the trusted request context before service work proceeds.

## Legacy header policy

`x-actor-user-id` is legacy/migration-only after P3-007A.

Tests or implementation that currently use `x-actor-user-id` may be updated only when replaced by equivalent or stronger trusted-context coverage.

Removing old header-based tests without equivalent trusted-context tests is forbidden.

## Frontend policy

P3-012 must replace the current mutable frontend operator context with a session-aware operator context.

The frontend must not continue to treat `organizationId` and `actorUserId` stored in `sessionStorage` as trusted identity. If browser storage remains necessary before a production login flow exists, it may store only the Phase 3 bearer session envelope plus decoded display/routing metadata treated as untrusted convenience data.

The API remains the trust boundary.

## Secrets and credentials

This decision does not authorize production credentials or production secret access.

`AKTI_AUTH_SESSION_SECRET` is an environment variable name, not a committed secret. P3-011 must document non-secret templates and validation behavior.

If an implementation path requires an external auth provider, OAuth/OIDC dependency, production credential, or package dependency, the run must stop for explicit approval.

## Alternatives considered

- Continue using `x-actor-user-id` as trusted identity. Rejected because it is caller-controlled.
- Add an external auth/session provider now. Rejected because it requires dependencies, provider setup, and production credential decisions not approved for Phase 3.
- Implement deployment-ready production auth. Rejected because production deployment and production credentials are out of Phase 3 scope.

## Consequences

- Phase 3 can implement concrete trusted request context without adding dependencies.
- Auth/session behavior is stronger than current header trust while remaining inside Phase 3 scope.
- Production auth/session provider selection remains a later deployment/operations decision unless separately approved.
- Frontend work is gated behind this decision and backend request context implementation.

## Affected modules

API request ingress, Access Core, Gatekeeper, Hierarchy, Configuration, Engagement Gateway Lite, Lead Desk, audit/outbox evidence, and Lead Desk frontend operator context.

## Owner

AKTI / Phase 3 run controller.

## Review date

Before Phase 3 closure or before any production auth/session provider decision, whichever comes first.
