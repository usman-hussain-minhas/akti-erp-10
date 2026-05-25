# P3-012 Summary - Frontend Auth and Operator Context Replacement

## Objective

Replace the Lead Desk frontend's caller-controlled operator context with the Phase 3 bearer session context path.

## Exact-File Plan

- `apps/web/app/lead-desk/operator-context.ts`
- `apps/web/app/lead-desk/api-client.ts`
- `apps/web/app/lead-desk/inbox/page.tsx`
- `apps/web/app/lead-desk/create/page.tsx`
- `apps/web/app/lead-desk/leads/[leadId]/page.tsx`
- `apps/web/app/lead-desk/leads/[leadId]/actions/page.tsx`
- `apps/web/test/lead-desk-screens.test.mjs`
- `codex-review/phase3-security-auth-tenant/phase3-run-journal.md`
- `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-012/P3-012-summary.md`
- `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-012/P3-012-validation-summary.md`
- `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-012/P3-012-changed-files.zip`

## Outcome

- Replaced session storage shape with a Phase 3 bearer session token plus decoded organization/actor metadata for routing and request bodies.
- Removed frontend `x-actor-user-id` behavior.
- Updated Lead Desk API calls to send `Authorization: Bearer <sessionToken>`.
- Updated Lead Desk screens to ask for a Phase 3 session token instead of organization and actor IDs.
- Strengthened frontend tests to require bearer authorization and forbid caller-controlled actor headers.

## Scope Boundaries

- No production login, production session credentials, deployment work, browser-rendered visual QA, new dependencies, Prisma, generated registry, contracts, or API runtime changes were introduced.
- The decoded frontend organization/actor values remain convenience metadata; the API trusted context remains the enforcement boundary.
