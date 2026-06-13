# P4-015 App Limiter Preservation Attestation

Status: PASS

## Attestation

The Phase 3 app-level route limiter remains present, configured, and tested after P4-015.

## Evidence

- API bootstrap registration: `apps/api/src/main.ts`.
- Limiter implementation: `apps/api/src/security/rate-limit.middleware.ts`.
- Runtime config bridge: `apps/api/src/security/runtime-environment.ts`.
- Non-secret env template: `.env.example`.
- Security tests: `apps/api/src/security/request-context.test.ts`.
- P4-011 runtime smoke proof: `codex-review/phase4-operational-proof/ticket-artifacts/P4-011/rate-limit-smoke-log.txt`.
- P4-015 validation proof: `route-limiting-validation-log.txt`.

## Protected Behavior

- `x-forwarded-for` is not trusted by default.
- Trusted proxy headers require `AKTI_TRUST_PROXY_HEADERS=true`.
- Invalid trust-proxy config falls back safely.
- Limiter keying uses client plus method, preventing dynamic path/query bucket bypass.
- Requests over threshold return `429`.

## Non-Scope Confirmation

P4-015 did not remove the app limiter, add dependencies, implement infrastructure limiting, access production credentials, or create deployment resources.
