# P4-000 Env Variable Inventory

| Variable | Evidence | Notes |
| --- | --- | --- |
| AKTI_AUTH_SESSION_MAX_AGE_SECONDS | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| AKTI_AUTH_SESSION_SECRET | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| AKTI_CORS_ALLOWED_ORIGINS | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| AKTI_RATE_LIMIT_MAX_REQUESTS | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| AKTI_RATE_LIMIT_WINDOW_MS | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| AKTI_SECURITY_HEADERS_ENABLED | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| AKTI_TRUST_PROXY_HEADERS | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| DATABASE_URL | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| NEXT_PUBLIC_API_BASE_URL | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| NODE_PATH | .env.example or runtime env scan | Classify in P4-002 env matrix. |
| PORT | .env.example or runtime env scan | Classify in P4-002 env matrix. |

## .env.example
```text
# Non-secret local template for AKTI ERP 1.0.
# Do not commit real production values, secrets, or credentials.

DATABASE_URL=
PORT=3001
AKTI_AUTH_SESSION_SECRET=
AKTI_AUTH_SESSION_MAX_AGE_SECONDS=3600
AKTI_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
AKTI_SECURITY_HEADERS_ENABLED=true
AKTI_RATE_LIMIT_WINDOW_MS=60000
AKTI_RATE_LIMIT_MAX_REQUESTS=120
AKTI_TRUST_PROXY_HEADERS=false

```
