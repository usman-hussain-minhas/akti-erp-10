# AKTI ERP Phase 4 Operational Runbook v1

**Status:** FINAL_PHASE_4_OPERATIONAL_PROOF_RUNBOOK
**Created by:** P4-014A
**Finalized by:** P4-014B

This runbook records Phase 4 controlled staging/demo operational proof. It is not a production launch runbook and must not be used to imply public production readiness, production credential availability, production WhatsApp behavior, Foundry/module installer readiness, platform AI runtime readiness, or Phase 5/6 scope.

## Authority

This runbook is operational evidence and procedure for Phase 4 only. Prisma, contracts, module manifests, generated registry, ADRs, tests, validation evidence, and closure packages remain higher authority. Roadmap files remain strategic reference only.

## Ownership Model

- Product/phase owner: Phase 4 execution owner.
- Technical operator: operator running controlled local/demo proof.
- Human approval owner: project owner for new dependencies, real secrets, production resources, destructive migrations, public launch, or Phase 5/6 scope.

## Operating Boundary

Phase 4 proves controlled local/demo readiness:

- Disposable local PostgreSQL.
- Local API process.
- Local web process.
- Non-secret placeholder env values.
- Synthetic demo data only.
- Artifact evidence with redaction review.

Phase 4 does not include:

- Production launch.
- Shared staging or production databases.
- Real production secrets or credentials.
- Real outbound WhatsApp.
- Provider deployment resources.
- Foundry/module installer implementation.
- Platform AI runtime.
- New business modules.
- Destructive migrations.

## Routine Controlled Demo Procedure

1. Start from the Phase 4 branch at a clean committed HEAD.
2. Use a disposable local PostgreSQL database.
3. Apply committed migrations through `prisma migrate deploy`.
4. Confirm DB-to-schema diff is empty.
5. Start API with non-secret placeholder env values.
6. Start web locally against the local API.
7. Run setup organization with synthetic demo data.
8. Run smoke tests, browser checks, backup/restore/rollback checks, redaction checks, and full validation.
9. Stop all local proof services and confirm proof ports are no longer listening.
10. Commit evidence artifacts only after validation and redaction pass.

## Environment And Secrets

- Use command-injected placeholder env values only.
- Do not write real `.env` files, local env files, secret-bearing env files, or production credential files.
- `.env.example` is a non-secret template only.
- Redact or avoid real values for database URLs, tokens, session values, private keys, passwords, and credentials.
- Any scan output that appears to contain a real secret, token, credential, database URL, private key, production credential, or session value is a stop condition unless proven to be a placeholder.

## Fresh DB And Bootstrap

Evidence source: `codex-review/phase4-operational-proof/ticket-artifacts/P4-009/`

Phase 4 clean database proof requires committed Prisma migrations, not `prisma db push`, as final evidence. P4-009 proved:

- Clean disposable local PostgreSQL bootstrap.
- Committed migration chain via `prisma migrate deploy`.
- Empty DB-to-schema diff.
- Prisma validation/generation.
- Registry generation/check and Phase 2 registry verification.
- API start using non-secret placeholder env values.
- Setup organization smoke.
- Health smoke.
- No manual DB hacks.

If clean migration bootstrap fails in a future run, stop before deployment/staging proof and classify the blocker. Do not claim `db push` fallback as final operational proof.

## Staging/Demo Deployment Proof

Evidence source: `codex-review/phase4-operational-proof/ticket-artifacts/P4-010/`

P4-010 proved the accepted local staging/demo target:

- Disposable local DB/env connectivity.
- API process startup.
- Web process startup.
- Integrated API/web proof.
- Local CORS/origin behavior.
- Shutdown/restart behavior.
- No public deployment or production launch.

If a future proof requires cloud/provider staging, production credentials, DNS, public ingress, or new infrastructure dependencies, stop for explicit approval.

## Smoke And Health Checks

Evidence source: `codex-review/phase4-operational-proof/ticket-artifacts/P4-011/`

P4-011 proved:

- API health.
- Web availability.
- Setup organization.
- Auth/session success and failure.
- Route organization mismatch denial.
- Lead Desk create/list/detail.
- Engagement Gateway mediated `whatsapp_stub` boundary.
- Audit/outbox evidence.
- CORS and security headers.
- Phase 3 app-level route limiting where exposed in the local API path.

Smoke failures should be classified as security, runtime, configuration, evidence, or scope blockers before repair.

## Browser And Visual QA

Evidence source: `codex-review/phase4-operational-proof/ticket-artifacts/P4-012/`

P4-012 proved browser-rendered behavior for:

- Setup organization.
- App shell.
- Lead Desk inbox.
- Lead Desk create.
- Lead Desk detail.
- Lead Desk actions.
- Not-found/error state.
- Desktop and mobile viewport baselines where required.

Screenshots are evidence, not validation by themselves. Browser behavior logs, DOM/token scans, responsive viewport logs, and redaction review are required alongside screenshots.

## Backup, Restore, And Rollback

Evidence source: `codex-review/phase4-operational-proof/ticket-artifacts/P4-013/`

P4-013 proved:

- Disposable local `pg_dump` backup from synthetic demo data.
- Restore into a second disposable database.
- Restore validation with matching organization and migration counts.
- Empty DB-to-schema diff after restore.
- Rollback restore into a third disposable database.
- Application rollback meaning as prior committed branch HEAD or previously validated build artifact.
- Config/env rollback as restoring non-secret command-injected values.
- Migration rollback policy as restore/reset of disposable DBs only.

Phase 4 does not authorize destructive reverse migrations or production data restore drills.

## Route-Limiting Posture

Evidence source: `codex-review/phase4-operational-proof/ticket-artifacts/P4-015/`

P4-015 resolved route limiting as:

- Phase 3 app-level limiter preserved and validated for controlled local/demo proof.
- `x-forwarded-for` not trusted by default.
- Trusted proxy headers allowed only with explicit `AKTI_TRUST_PROXY_HEADERS=true`.
- Dynamic path/query variation does not bypass limiter buckets.
- Distributed/infrastructure/proxy route limiting deferred to a separately approved production deployment decision.

Future infrastructure limiting must complement the Phase 3 app limiter unless a later approved decision changes that posture.

## Incident And Support Flow

Stop immediately and record a blocker if any proof path requires:

- Real production secrets or credentials.
- Production data.
- Public production launch.
- Destructive migrations.
- New dependencies without approval.
- Provider infrastructure outside active ticket scope.
- Real outbound WhatsApp.
- Direct Lead Desk to Meta/WhatsApp coupling.
- Foundry/module installer implementation.
- Platform AI runtime.
- New business modules.
- Weakening Access Core, Gatekeeper, tenant context, audit/outbox, route limiting, CORS/header controls, or cross-org denial behavior.

For validation failures inside active scope:

1. Record the failed command and evidence.
2. Attempt bounded repair only within active ticket scope.
3. Stop after the ticket's bounded repair limit or if repair crosses scope.
4. Commit only after validation and redaction pass.

## Evidence Redaction

Artifacts may include logs, screenshots, setup output, smoke output, backup metadata, restore output, and validation logs. They must not include:

- Real secrets.
- Real credentials.
- Production data.
- Private keys.
- Production database URLs.
- Session values or bearer tokens.
- Real production env files.

Placeholder names, test labels, non-secret env variable names, and localhost ports may appear when classified in redaction reviews.

## Known Deferrals

- Production launch: separately approved production decision.
- Production auth/session provider and credentials: separately approved production decision.
- Production WhatsApp credentials: later approved production/integration decision.
- Real outbound WhatsApp: later approved production/integration decision.
- DB-level RLS and tenant transaction context: later-phase input unless service-level isolation proves insufficient.
- Distributed/infrastructure route limiting: production deployment decision; Phase 3 app limiter remains active.
- Cloud/provider staging: not selected for Phase 4 controlled local/demo proof.
- Foundry/module installer: Phase 5.
- Platform AI runtime: later phase per roadmap v2.

## Closure Standard

Before Phase 4 closure, the run must have:

- Fresh DB/bootstrap evidence.
- Controlled local staging/demo evidence.
- Smoke/health evidence.
- Browser/visual QA evidence.
- Backup/restore/rollback evidence.
- Route-limiting posture evidence.
- Operational runbook evidence.
- Final validation alignment.
- Redaction/no-secret evidence.
- Final external audit package.

If any item is missing, Phase 4 is not ready for closure.
