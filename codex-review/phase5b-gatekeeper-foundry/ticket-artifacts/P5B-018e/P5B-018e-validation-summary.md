# P5B-018e Workflow Service API Baseline

## Scope

- Ticket: P5B-018e — Workflow service API baseline.
- Implemented only the workflow API baseline for `POST /platform/workflows` and `GET /platform/workflows/:id`.
- Did not implement later workflow tickets, business workflow modules, Phase 5C frontend work, or production provider behavior.
- Did not modify Phase 5A policy, ADR, standard, checklist, or handoff documents.

## Files Inspected

- `docs/process/AKTI_ERP_Phase_5B_Ticket_Pack_v1.json`
- `docs/process/AKTI_ERP_Phase_5B_Plan_v10.md`
- `apps/api/src/workflow/workflow.service.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/security/request-context.ts`
- `apps/api/src/foundry/foundry.controller.p5b-012a.test.ts`
- `apps/api/src/workflow/workflow.p5b-018a.test.ts`
- `apps/api/src/workflow/workflow.p5b-018c.test.ts`
- `apps/api/src/workflow/workflow.p5b-018d.test.ts`

## Files Changed

- `apps/api/src/workflow/workflow.service.ts`
- `apps/api/src/workflow/workflow.controller.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/workflow/workflow.controller.p5b-018e.test.ts`
- `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-018e/P5B-018e-validation-summary.md`

## API Baseline

- `POST /platform/workflows`
  - Capability: `platform.workflow.manage`.
  - Tenant context source: trusted bearer session context from `resolveTrustedRequestContext`.
  - Gatekeeper behavior: API response declares required preflight and blocks `DENY` / `STOP_FOR_REVIEW` through existing workflow fail-closed execution behavior.
  - Audit behavior: returns a compliance-class workflow audit event envelope from the workflow service.
- `GET /platform/workflows/:id`
  - Capability: `platform.workflow.read`.
  - Tenant context source: trusted bearer session context.
  - Audit behavior: returns read audit metadata for workflow instance access.

Gatekeeper policy internals were not modified in this ticket because `apps/api/src/gatekeeper/gatekeeper-preflight.service.ts` is not owned by P5B-018e. This ticket records the API capability and Gatekeeper requirement without broadening Gatekeeper policy scope.

## Validation

- `pnpm --dir apps/api exec tsx src/workflow/workflow.controller.p5b-018e.test.ts` — PASS
- `pnpm --filter @akti/api typecheck` — PASS
- `git diff --check` — PASS
- `git status --short --branch` — PASS with expected uncommitted P5B-018e files before commit

## Acceptance Notes

- Positive tests prove route metadata, trusted tenant/actor context, capability keys, API response shapes, and audit envelope/read-audit behavior.
- Negative tests prove invalid bodies, mismatched tenant/actor context, unauthenticated requests, and Gatekeeper `DENY` / `STOP_FOR_REVIEW` fail closed.
- App module registration for `WorkflowController` and `WorkflowService` is covered by the ticket-stamped test.
