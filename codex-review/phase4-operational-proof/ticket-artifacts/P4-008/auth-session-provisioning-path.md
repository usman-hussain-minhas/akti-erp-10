# AKTI ERP Phase 4 Auth/session Provisioning Path and Staging-safe Auth Decision v1

**Status:** ACCEPTED_FOR_PHASE_4_EXECUTION
**Ticket:** P4-008

## Decision

Phase 4 browser and smoke proof will use the Phase 3 signed bearer session boundary with a local placeholder `AKTI_AUTH_SESSION_SECRET`. This is staging-safe proof behavior, not a production auth provider. Production auth/session provider selection and credential provisioning remain separately approved production decisions.

## Staging-safe Auth Behavior

- API accepts Phase 3 signed bearer session tokens.
- Tokens must bind actor, organization, issued_at, and expires_at claims according to Phase 3 runtime code.
- Token max age remains enforced by runtime.
- Secret value used in Phase 4 proof is a local placeholder and must not be a production credential.
- Browser/API evidence must not expose token values.

## Production Provider Options

Auth0, Clerk, Supabase Auth, custom OIDC, or another provider may be evaluated later, but Phase 4 does not integrate any provider and does not add dependencies.

## Credentials Not Accessed

No production auth credentials, client secrets, issuer secrets, session signing keys, OAuth client IDs/secrets, or provider dashboards are accessed in Phase 4.

## Dependency Approval Gate

If browser/smoke proof requires a new auth provider SDK, OAuth client, or auth test dependency, stop for explicit approval.

## Phase 3 Boundary Preservation

- Preserve trusted request context.
- Preserve route organization mismatch denial.
- Do not reintroduce caller-controlled `x-actor-user-id` trusted ingress.
- Do not weaken Access Core or Gatekeeper checks.

## Acceptable For Phase 4 Browser Tests

It is acceptable to use a locally generated placeholder bearer session token for seeded/demo data if the token is redacted from logs, DOM dumps, screenshots, and audit packages.

## Production Decision Remaining

Production auth provider, credential provisioning, login UX, identity lifecycle, SSO, MFA, refresh token behavior, and hosted callback URLs remain future production decisions.
