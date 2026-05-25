# P4-011 Summary

Ticket: P4-011 - Smoke tests and health checks

Status: COMPLETE

## Exact-File Plan Used

Created P4-011 evidence artifacts under:

`codex-review/phase4-operational-proof/ticket-artifacts/P4-011/`

and appended:

`codex-review/phase4-operational-proof/phase4-run-journal.md`

No runtime source, Prisma schema, existing migration folders, contracts, generated registry, package files, dependency files, deployment implementation files, real env files, production credentials, WhatsApp production behavior, Foundry work, AI runtime, or Phase 5/6 scope were changed.

## Bounded Repair Attempts

- Attempt 1 fixed shell quoting in the local artifact-generation script before accepting smoke results.
- Attempt 2 shortened the local bearer-token lifetime after the verifier correctly rejected a token whose `expires_at - issued_at` interval exceeded the configured max-age boundary by a few milliseconds.

Both repairs were limited to local proof commands and generated artifacts.

## What Was Proven

- API `/health` returned healthy.
- Web root and `/app` served successfully.
- `POST /platform/setup/organization` completed with non-production demo data.
- A local disposable smoke fixture created an operator, group, group membership, and required organization-scoped capability assignments inside the disposable database only.
- Phase 3 bearer-session success returned Lead Desk list data.
- Missing and malformed bearer sessions returned `401`.
- Route organization mismatch returned `403`.
- Lead Desk create, list, and detail routes passed.
- Engagement Gateway health passed and a `whatsapp_stub` request recorded through the mediated stub boundary.
- Audit/outbox evidence existed for setup, Lead Desk, and Engagement Gateway writes.
- CORS allowed the configured local web origin and did not allow an unconfigured origin.
- Security headers were present on the allowed-origin API response.
- Phase 3 in-app route limiting returned `429` after the configured local threshold.
- P4-011 did not invent infrastructure, distributed, or proxy route-limiting assumptions; that posture remains owned by P4-015.
- Proof services stopped cleanly after smoke execution.
- The full validation ladder passed.

## Evidence

Primary evidence:

- `smoke-test-matrix.md`
- `failure-classification.md`
- `bootstrap-and-build-log.txt`
- `service-start-log.txt`
- `setup-organization-smoke-log.txt`
- `smoke-fixture-log.txt`
- `api-health-smoke-log.txt`
- `web-availability-smoke-log.txt`
- `auth-session-smoke-log.txt`
- `tenant-denial-smoke-log.txt`
- `lead-desk-smoke-log.txt`
- `engagement-gateway-stub-smoke-log.txt`
- `audit-outbox-smoke-log.txt`
- `cors-security-header-smoke-log.txt`
- `rate-limit-smoke-log.txt`
- `service-stop-log.txt`
- `P4-011-validation-summary.md`
- `redaction-review.md`

## Conclusion

P4-011 satisfies the Phase 4 smoke-test and health-check requirement for the controlled local staging/demo proof path.
