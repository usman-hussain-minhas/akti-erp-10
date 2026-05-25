# AKTI ERP Phase 4 Operational Runbook v1

**Status:** SKELETON_PENDING_PHASE_4_PROOF
**Created by:** P4-014A

This runbook skeleton is intentionally not a final operational readiness claim. P4-014B must finalize it after proof tickets P4-009 through P4-015 close.

## Ownership Model

- Product/phase owner: Phase 4 execution owner.
- Technical operator: Codex/operator running the controlled local/demo proof.
- Human approval owner: project owner for new dependencies, real secrets, production resources, destructive migrations, or Phase 5/6 scope.

## Incident and Support Outline

- Stop immediately on secret exposure, production credential request, destructive migration request, Phase 5/6 scope, real outbound WhatsApp, or weakened Phase 1/2/3 protection.
- Record blocker in active ticket artifacts and run journal.
- Do not repair outside active ticket scope.

## Environment and Secrets

- Use placeholder local/demo env values only.
- Do not write real `.env` files or production credential files.
- `.env.example` is non-secret template only.
- Redact DATABASE_URL, tokens, session values, private keys, passwords, and credentials from artifacts.

## P4-009 Fresh DB/Bootstrap Placeholder

Pending P4-009 evidence: migration logs, bootstrap logs, setup smoke logs, registry checks, no-manual-hack attestation.

## P4-010 Staging/Deployment Placeholder

Pending P4-010 evidence: build, process startup, env injection, DB connection, API health, web serving, CORS/origin, shutdown/restart.

## P4-011 Smoke/Health Placeholder

Pending P4-011 evidence: smoke-test matrix and command logs for API/web/auth/tenant/Lead Desk/Gateway/CORS/security headers/rate-limit where exposed.

## P4-012 Browser/Visual QA Placeholder

Pending P4-012 evidence: browser behavior logs, screenshot evidence, DOM/token scan, responsive viewport proof, visual checklist.

## P4-013 Backup/Restore/Rollback Placeholder

Pending P4-013 evidence: backup/restore/rollback logs, metadata, validation, redaction review.

## P4-015 Route-Limiting Posture Placeholder

Pending P4-015 evidence: resolution mode, validation/deferral, app limiter preservation.

## Known Deferrals Placeholder

To be finalized by P4-014B and P4-GATE after proof evidence.

## Redaction Rule

Any scan output that appears to contain a real secret, token, credential, database URL, private key, production credential, or session value is a stop condition unless proven to be a placeholder.
