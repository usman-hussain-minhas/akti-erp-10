# P3-007B Summary - API Surface Migration to Trusted Context

## Objective

Migrate the bounded API ingress surface from caller-controlled `x-actor-user-id` headers to the trusted request context created in P3-007A.

## Exact-File Plan

- `apps/api/src/access-core/access-core.controller.ts`
- `apps/api/src/configuration/configuration.controller.ts`
- `apps/api/src/engagement-gateway/engagement-gateway.controller.ts`
- `apps/api/src/hierarchy/hierarchy.controller.ts`
- `apps/api/src/lead-desk/lead-desk.controller.ts`
- `apps/api/src/configuration/configuration.controller.test.ts`
- `apps/api/src/hierarchy/hierarchy.controller.test.ts`
- `apps/api/src/phase1-hardening/phase1-release-blockers.test.ts`
- `codex-review/phase3-security-auth-tenant/phase3-run-journal.md`
- `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-007B/P3-007B-summary.md`
- `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-007B/P3-007B-validation-summary.md`
- `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-007B/P3-007B-changed-files.zip`

## Outcome

- Replaced controller ingress reads of `@Headers('x-actor-user-id')` with signed bearer trusted context resolution.
- Bound trusted request context to each route `organization_id` before forwarding the actor id into existing services.
- Updated existing controller tests to use signed trusted-context headers.
- Replaced the old Phase 1 static `x-actor-user-id` controller guard with stronger trusted-context ingress checks.

## Scope Boundaries

- Service method signatures were not broadly rewritten.
- No frontend, Prisma, contracts, generated registry, dependencies, workflows, deployment files, production credentials, or secrets changed.
- P3-007B remained one bounded API-ingress slice; no unrelated service migration was required.
