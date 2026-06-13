# P5B-001b Summary - Trusted Tenant Context Hardening

## Ticket

- Ticket: P5B-001b
- Title: Trusted tenant context hardening
- Type: control_or_evidence
- Tier: 1
- Dependencies verified: P5B-001a committed
- Commit scope: evidence artifacts only

## Exact-File Plan

Files created for this ticket:

- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-001b/P5B-001b-summary.md
- codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-001b/P5B-001b-validation-summary.md

No runtime security code was changed because `files_expected_to_change` grants evidence artifact authority only. The repo already contains a trusted context implementation and tests from prior phases; this ticket records the hardening baseline that Phase 5B tickets must preserve.

## Trusted Context Baseline

| Hardening surface | Current repo behavior | Source |
| --- | --- | --- |
| Session source | Trusted context is resolved from signed bearer session tokens. | `apps/api/src/security/request-context.ts` |
| Required tenant/actor fields | Session payload must include non-empty `organization_id`, `actor_user_id`, `issued_at`, and `expires_at`. | `assertTrustedPayload` |
| Secret handling | Session signing/verification requires `AKTI_AUTH_SESSION_SECRET`; short or missing secrets fail closed. | `requireSecret` |
| Expiry and max-age | Expired, future-issued, malformed, or over-max-age tokens fail closed. | `verifyPhase3SessionToken` |
| Legacy header fallback | Legacy `x-actor-user-id` is not accepted as a session fallback. | `testLegacyActorHeaderIsNotSessionFallback` |
| Route tenant matching | `routeOrganizationId` must match the signed session organization. | `resolveTrustedRequestContext` |
| Body context matching | Caller-supplied body organization/actor fields must match trusted context when checked. | `requireContextBodyMatch` |
| Negative tests | Missing bearer, malformed bearer, tampered token, expired token, tenant mismatch, body mismatch, invalid max age, and short secret are covered. | `apps/api/src/security/request-context.test.ts` |

## Phase 5B Preservation Rule

Future Phase 5B tickets that touch API, service, Gatekeeper, Foundry, workflow, search, reporting, file/document, import/export, communication, scheduler, or AI proxy surfaces must preserve these rules:

- Never derive organization or actor authority from caller-provided body fields alone.
- Never reintroduce legacy actor headers as an auth fallback.
- Never allow route organization and signed session organization to diverge.
- Never soften `UnauthorizedException` or `ForbiddenException` fail-closed behavior for tenant context mismatches.
- Preserve cross-tenant negative tests when adding tenant-scoped behavior.

## Additional Proof Run

The existing targeted security test was run as extra ticket evidence:

```bash
pnpm --dir apps/api exec tsx src/security/request-context.test.ts
```

Result:

```text
request-context tests passed
```

## Non-Scope

This ticket does not:

- Change auth/session architecture.
- Change runtime security code.
- Add a new API route.
- Modify Prisma schema or generated registry files.
- Touch secrets or production credentials.

## Minimum Concrete Requirement

Scoped behavior for trusted tenant context hardening is implemented in exact files and passes repo-real validation by recording the current signed-session tenant context baseline, fail-closed rules, and preservation requirements for later Phase 5B tickets.
