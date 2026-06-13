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
