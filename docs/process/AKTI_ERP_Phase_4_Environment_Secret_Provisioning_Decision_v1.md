# AKTI ERP Phase 4 Environment and Secret Provisioning Decision v1

**Status:** ACCEPTED_FOR_PHASE_4_EXECUTION
**Ticket:** P4-002

## Decision

Phase 4 will use non-secret local/demo environment values only. Real `.env` files, local env files, secret-bearing env files, production credential files, and production secrets are forbidden in source and artifacts. `.env.example` may remain a non-secret template.

For controlled local/demo proof, secrets are injected through process environment variables at command time using placeholder test values that are explicitly not production credentials. Logs and artifacts must redact any value that looks like a database URL, token, private key, session value, password, or credential.

## Secret Provisioning Path

- Local/demo: shell environment variables or command-prefix variables with placeholder values.
- Production: separately approved provisioning mechanism; not accessed in Phase 4.
- Audit artifacts: record variable names and validation behavior, not secret values.

## .env.example Handling

`.env.example` is intentionally allowed as a non-secret template. It must not contain real DATABASE_URL, real session secret, production credential, WhatsApp credential, or provider token.

## CORS/Header/Auth/Rate-Limit Handling

- CORS origins must be explicit localhost/demo origins; wildcards are rejected by runtime env validation.
- Security headers remain enabled by default.
- Session secret is required for API runtime but must be placeholder-only for Phase 4 proof.
- Rate-limit config keeps Phase 3 defaults unless later proof explicitly needs a lower test threshold.
- `AKTI_TRUST_PROXY_HEADERS` remains false unless P4-007/P4-015 approve proxy behavior.

## Env Matrix

# P4-002 Environment Matrix

| Variable | Used by | Required local | Required staging/demo | Required production | Secret? | Example allowed in .env.example? | Default safe value | Failure behavior if missing | Validation source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DATABASE_URL | API PrismaService / Prisma CLI | Yes for DB-backed proof | Yes | Yes | Yes in real env | Blank placeholder only | none | PrismaService throws; CLI fails | .env.example, PrismaService |
| PORT | API runtime | No | Yes | Yes | No | Yes | 3001 | defaults to 3001 | runtime-environment.ts |
| AKTI_AUTH_SESSION_SECRET | API auth/session runtime | Yes for API process | Yes | Yes | Yes | Blank placeholder only | none | runtime env rejects missing/placeholder | runtime-environment.ts |
| AKTI_AUTH_SESSION_MAX_AGE_SECONDS | API token verification | No | Yes | Yes | No | Yes | 3600 | invalid value rejected | runtime-environment.ts, request-context.ts |
| AKTI_CORS_ALLOWED_ORIGINS | API CORS | No | Yes | Yes | No | Yes | localhost web origin | wildcard/invalid rejected | runtime-environment.ts |
| AKTI_SECURITY_HEADERS_ENABLED | API middleware | No | Yes | Yes | No | Yes | true | invalid bool rejected | runtime-environment.ts |
| AKTI_RATE_LIMIT_WINDOW_MS | API limiter | No | Yes | Yes | No | Yes | 60000 | invalid value rejected | rate-limit.middleware.ts |
| AKTI_RATE_LIMIT_MAX_REQUESTS | API limiter | No | Yes | Yes | No | Yes | 120 | invalid value rejected | rate-limit.middleware.ts |
| AKTI_TRUST_PROXY_HEADERS | API limiter proxy mode | No | Yes when proxy proof selected | Yes only behind trusted proxy | No | Yes | false | anything except true is fail-safe false | rate-limit.middleware.ts |
| NEXT_PUBLIC_API_BASE_URL | Web setup/Lead Desk API client | No | Yes for browser proof | Yes | No | May be documented, not currently required in .env.example | http://localhost:3001 fallback | web falls back to localhost API | apps/web app code |

## Stop Result

No runtime-required API variable was found missing from `.env.example`. `NEXT_PUBLIC_API_BASE_URL` is a web convenience variable with a localhost fallback and does not require a Phase 4 `.env.example` edit.
