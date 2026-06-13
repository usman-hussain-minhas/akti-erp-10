# P4-015 Route-Limiting Resolution

Status: COMPLETE

## App-Level Limiting

The Phase 3 in-app limiter remains the active runtime limiter for Phase 4 controlled local/demo proof.

Evidence:

- `apps/api/src/main.ts` still registers `createRateLimitMiddleware(runtimeEnvironment.rateLimit)`.
- `apps/api/src/security/rate-limit.middleware.ts` still implements the no-new-dependency in-memory limiter.
- `.env.example` documents `AKTI_RATE_LIMIT_WINDOW_MS`, `AKTI_RATE_LIMIT_MAX_REQUESTS`, and `AKTI_TRUST_PROXY_HEADERS=false`.
- `apps/api/src/security/request-context.test.ts` still covers spoofed `x-forwarded-for`, explicit trusted proxy mode, invalid trust-proxy config fallback, dynamic route variation, query variation, and `429` threshold behavior.
- P4-011 smoke evidence proves the app-level limiter returned `429` in the local API path.

## Infrastructure/Distributed/Proxy Limiting

P4-015 owns the Phase 4 infrastructure/distributed/proxy route-limiting posture. For Phase 4, this posture is:

- Not implemented in runtime code.
- Not configured through provider infrastructure.
- Not required for controlled local/demo proof.
- Bounded as a production deployment decision because no proxy/CDN/WAF/provider topology exists in Phase 4.

## Proxy Header Trust

`AKTI_TRUST_PROXY_HEADERS` remains explicit opt-in only. The default `.env.example` value is `false`, and the app limiter uses `request.ip` unless this value is exactly `true`.

## Validation

P4-015 ran:

- Source inspection for limiter registration and trust-proxy config.
- `pnpm --filter @akti/api exec tsx src/security/request-context.test.ts`.
- The full Phase 4 validation ladder.

All validation passed.

## Conclusion

The Phase 3 app limiter is preserved and sufficient for controlled local/demo Phase 4 proof. Distributed/infrastructure limiting is an accepted, explicit production deployment input, not a Phase 4 blocker.
