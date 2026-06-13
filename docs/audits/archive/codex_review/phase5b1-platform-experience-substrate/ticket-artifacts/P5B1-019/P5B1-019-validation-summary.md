# P5B1-019 Validation Summary

Ticket: P5B1-019 - Search scope contract limited to WorkflowDefinition and WorkflowInstance

Status: PASS

## Commands Run

- `pnpm --dir apps/api exec tsx src/search/search.p5b1-019.test.ts` - PASS
- `pnpm --filter @akti/api typecheck` - PASS

## Validation Notes

- The baseline target keys are exactly `workflow_definition` and `workflow_instance`.
- The baseline model names are exactly `WorkflowDefinition` and `WorkflowInstance`.
- Out-of-scope target keys for Lead Desk/CRM, files, notifications, and future business modules are rejected.
- The search response preserves tenant and capability filtering and returns no fake results.
