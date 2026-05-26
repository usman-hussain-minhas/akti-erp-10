# P4A-004 Env Template Matrix

| Variable | Used by | Required for local | Required for demo | Secret? | Template value policy |
| --- | --- | --- | --- | --- | --- |
| DATABASE_URL | Prisma/API | yes | yes | no | Non-secret placeholder only |
| PORT | API runtime | yes | yes | no | Non-secret placeholder only |
| AKTI_AUTH_SESSION_SECRET | API runtime | yes | yes | placeholder-sensitive | Non-secret placeholder only |
| AKTI_AUTH_SESSION_MAX_AGE_SECONDS | API runtime | yes | yes | no | Non-secret placeholder only |
| AKTI_CORS_ALLOWED_ORIGINS | API runtime | yes | yes | no | Non-secret placeholder only |
| AKTI_SECURITY_HEADERS_ENABLED | API runtime | yes | yes | no | Non-secret placeholder only |
| AKTI_RATE_LIMIT_WINDOW_MS | API runtime | yes | yes | no | Non-secret placeholder only |
| AKTI_RATE_LIMIT_MAX_REQUESTS | API runtime | yes | yes | no | Non-secret placeholder only |
| AKTI_TRUST_PROXY_HEADERS | API runtime | yes | yes | no | Non-secret placeholder only |
| NEXT_PUBLIC_API_BASE_URL | Web frontend | yes | yes | no | Non-secret placeholder only |

AKTI_AUTH_SESSION_SECRET is represented only by non-production placeholders. Operators must provide real local-only values outside source control if needed.
