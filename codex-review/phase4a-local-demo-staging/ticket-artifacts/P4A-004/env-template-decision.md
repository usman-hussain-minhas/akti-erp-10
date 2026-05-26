# P4A-004 Env Template Decision

Status: DECIDED

## Decision

Create both templates:

- .env.local.example for the primary hybrid local runtime.
- .env.demo.example for a demo-like local runtime using the same local-only boundaries.

Both files contain placeholders only. Real .env files remain forbidden and ignored.

## Selection Criteria Result

- No secrets: satisfied; values are local placeholders.
- Exact-file planning: satisfied in exact-file-plan.md.
- Clear local/demo variable mapping: satisfied in env-template-matrix.md.
- No broad runtime env changes: satisfied; no runtime code changed.
