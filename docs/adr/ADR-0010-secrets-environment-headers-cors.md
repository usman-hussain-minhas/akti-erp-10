# ADR-0010: Secrets, Environment, Headers, and CORS

## ADR number

ADR-0010

## Title

Secrets, Environment, Headers, and CORS

## Date

2026-05-25

## Status

Accepted

## Decision

Phase 3 will add non-secret environment templates, runtime environment validation, safe defaults, API security headers, and CORS controls without deployment or production secret work.

P3-011 may implement:

- `.env.example` with variable names only;
- runtime validation for required Phase 3 environment variables;
- safe defaults for local/non-production development;
- manual security headers using existing Nest/Express capability;
- CORS allow-list behavior using existing Nest APIs.

P3-011 must not implement:

- deployment infrastructure;
- production `.env` files;
- production secrets;
- hosting-specific logic;
- new dependencies;
- production credential access.

## Environment variables

Approved non-secret variable names:

```text
DATABASE_URL
PORT
AKTI_AUTH_SESSION_SECRET
AKTI_AUTH_SESSION_MAX_AGE_SECONDS
AKTI_CORS_ALLOWED_ORIGINS
AKTI_SECURITY_HEADERS_ENABLED
AKTI_RATE_LIMIT_WINDOW_MS
AKTI_RATE_LIMIT_MAX_REQUESTS
```

`AKTI_AUTH_SESSION_SECRET` is required for verifying Phase 3 bearer sessions. It must never be committed with a real value.

`AKTI_CORS_ALLOWED_ORIGINS` is a comma-separated allow-list. Wildcard CORS is not the default.

Rate-limit variables are defined here only as non-secret environment policy. Runtime route limiting remains governed by ADR-0011 and P3-010.

## Security headers

P3-011 may add these API response headers without new dependencies:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

Content Security Policy is not required for the API-only Nest runtime in Phase 3 unless an exact-file plan proves it is safe and not deployment-specific.

## CORS policy

The API must not default to open wildcard CORS.

Allowed behavior:

- no CORS when no allowed origins are configured;
- allow configured origins from `AKTI_CORS_ALLOWED_ORIGINS`;
- allow local development origins only when explicitly configured in `.env.example` or test setup;
- reject unknown origins by default.

## Validation expectations

P3-011 must include focused validation for:

- required auth session secret behavior;
- parsing and rejecting invalid numeric env values;
- security header application;
- CORS allow-list behavior where feasible without deployment.

## Consequences

- Phase 3 can implement concrete env/header/CORS controls without deployment work.
- Production secret provisioning remains out of scope.
- If a dependency such as `helmet` or a provider-specific secret manager becomes required, the run must stop for explicit approval.

## Affected modules

API bootstrap, Phase 3 auth/session context, runtime route limiting configuration, and documentation templates.

## Owner

AKTI / Phase 3 run controller.

## Review date

Before Phase 3 closure or before deployment/staging work begins.
