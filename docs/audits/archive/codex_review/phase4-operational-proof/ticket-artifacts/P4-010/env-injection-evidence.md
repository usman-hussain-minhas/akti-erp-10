# P4-010 Env Injection Evidence

Scope: controlled local disposable staging/demo proof only.

Non-secret placeholder values used:

- DATABASE_URL: disposable local PostgreSQL URL, redacted in logs.
- PORT: 3101 for API.
- AKTI_AUTH_SESSION_SECRET: local placeholder value only.
- AKTI_CORS_ALLOWED_ORIGINS: http://localhost:3000,http://127.0.0.1:3000.
- NEXT_PUBLIC_API_BASE_URL: http://127.0.0.1:3101 for web build/start proof.

No real .env files, local env files, production credential files, deployment secrets, or production data were used.
