# AKTI ERP Phase 2 Screen Lifecycle Policy

## Purpose
Define lifecycle semantics for Phase 2 screen contracts and enforce runtime parity between contracts, implemented routes, and test coverage.

## Lifecycle States
- `planned`: approved contract exists; route may be pending implementation.
- `active`: route is implemented, build-valid, and covered by Lead Desk frontend tests.
- `deprecated`: route exists for backward compatibility and should not be expanded.
- `disabled`: contract retained for governance history; route must not be active in navigation.

## Activation Requirements
A Phase 2 screen contract may be marked `active` only when all conditions are true:
- The contract route maps to an implemented `apps/web/app/lead-desk/**/page.tsx` route.
- Lead Desk frontend tests exist in `apps/web/test/lead-desk-screens.test.mjs`.
- Contract validation passes through `pnpm contracts:validate`.
- No actor identity leakage through URL query parameters.

## Route/Contract Parity Rule
- Every implemented Lead Desk route must have a matching Phase 2 screen contract route.
- Contract validators must fail if an implemented route has no contract.

## Scope Guardrails
- This policy does not authorize production auth/session changes.
- This policy does not authorize non-Lead Desk frontend scope expansion.
