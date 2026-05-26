# P4A-001 Node/pnpm/Corepack Runtime Decision

Status: DECIDED

## Decision

Phase 4A local/demo runtime should standardize on Node 22 LTS with Corepack-managed pnpm@10.12.1.

## Observed Session Runtime

- Node observed in this session: v23.10.0
- pnpm observed in this session: 10.12.1
- Corepack observed in this session: 0.32.0
- packageManager declared by repo: pnpm@10.12.1
- package engines field: not declared

## Rules

- Do not modify package.json or pnpm-lock.yaml in Phase 4A without explicit approval.
- Use Corepack to activate the repository-declared pnpm version.
- Node 22 LTS is the recommended operator/runtime posture for local/demo documentation.
- This current Codex session may continue with the observed Node version only if all validation commands pass; failures attributable to Node version mismatch must stop for approval rather than changing package files casually.

## Selection Criteria Result

- No package or lockfile drift: satisfied.
- Reproducible local setup: satisfied by Corepack + packageManager.
- Compatible with existing scripts: expected; must be proven by later validation tickets.
