# P4A-000 Current Env Inventory

Source inspected: .env.example and runtime env readers.

## Template Variables

- DATABASE_URL
- PORT
- AKTI_AUTH_SESSION_SECRET
- AKTI_AUTH_SESSION_MAX_AGE_SECONDS
- AKTI_CORS_ALLOWED_ORIGINS
- AKTI_SECURITY_HEADERS_ENABLED
- AKTI_RATE_LIMIT_WINDOW_MS
- AKTI_RATE_LIMIT_MAX_REQUESTS
- AKTI_TRUST_PROXY_HEADERS

## Required Runtime Notes

- DATABASE_URL is required by Prisma/API runtime for database access.
- AKTI_AUTH_SESSION_SECRET must be configured outside source control and at least 16 characters.
- PORT defaults to API port 3001 if unset.
- AKTI_CORS_ALLOWED_ORIGINS must list exact origins and must not use wildcard values.
- NEXT_PUBLIC_API_BASE_URL is consumed by the web Lead Desk client and setup page behavior.

No real secrets were read or required for this inventory.
