# P4A-006 Approved Repair Continuation Exact File Plan

Current web dev script from apps/web/package.json: dev = next dev
Failed local-up command: pnpm --filter @akti/web dev -- --hostname 127.0.0.1 --port "$WEB_PORT"
Corrected command to test: pnpm --filter @akti/web exec next dev --hostname 127.0.0.1 --port "$WEB_PORT"

Exact files to change:
- scripts/dev/local-up.sh
- codex-review/phase4a-local-demo-staging/ticket-artifacts/P4A-006/*
- codex-review/phase4a-local-demo-staging/phase4a-run-journal.md

This stays inside P4A-006 because it only repairs local/demo web startup support in the Phase 4A startup script.
