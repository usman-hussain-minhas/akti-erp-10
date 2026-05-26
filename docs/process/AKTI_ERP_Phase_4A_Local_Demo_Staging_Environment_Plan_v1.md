# AKTI ERP Phase 4A Local Demo / Staging Environment Plan v1

**Status:** CONTROL_PLAN_NOT_EXECUTED
**Phase:** Phase 4A - Local Demo / Staging Environment Stabilization
**Authority:** Planning/control document only

## Authority

This plan does not authorize implementation by itself. The Phase 4A ticket pack governs execution once approved.

Repo source of truth remains Prisma schema and migrations, contracts, module manifests, generated registry, ADRs, tests, validation evidence, and closure packages. Roadmap documents are strategic references only.

## Purpose

Phase 4A creates a stable repeatable local/demo environment where AKTI ERP can be run, reset, smoke-tested, opened in a browser, and inspected by humans and Codex.

Phase 4A is not production launch.

## Phase 4 Inputs

Phase 4 proved:

- Clean database bootstrap through committed Prisma migrations.
- Controlled local API/web/Postgres proof.
- Smoke checks and browser-rendered frontend evidence.
- Backup/restore/rollback proof.
- Redaction/no-secret evidence.
- Final Phase 4 audit and external package.

Phase 4A must preserve the clean DB lesson:

- Use committed Prisma migrations.
- Use `prisma migrate deploy` for proof.
- Do not use `prisma db push` as final proof.

## Scope

Phase 4A should produce:

- Few-command startup for local/demo runtime.
- One-command shutdown.
- One-command reset.
- One-command smoke test.
- Clear browser URL for app inspection.
- Clear failure messages.
- Non-secret `.env.local.example` and/or `.env.demo.example`.
- Local/demo Postgres path.
- API local/demo service path.
- Web local/demo service path.
- Clean DB migration/bootstrap path.
- Codex browser testing support.
- Screenshot/evidence capture path.
- Local demo runbook.
- Final Phase 4A external audit package.

## Environment Model

Hybrid local mode may be the first implementation path:

- Docker Compose or equivalent starts local/demo Postgres.
- Host Node/pnpm runs Prisma, API, web, smoke, and screenshot scripts.

Hybrid mode must not become the final ambition by default. Phase 4A must include a decision gate for full Docker Compose API/Web/Postgres demo mode and classify it as:

- Required.
- Approval-gated.
- Explicitly deferred with evidence.

## Node And Package Runtime

Phase 4A must inspect and document:

- Root `packageManager`.
- Existing package engines, if any.
- Current pnpm lockfile constraints.
- Whether Corepack is available.

Default recommendation:

- Node 22 LTS.
- Corepack-managed `pnpm@10.12.1`.
- No casual `package.json`, `pnpm-lock.yaml`, or dependency changes.

Any dependency or lockfile change requires explicit approval.

## Browser And Screenshot Evidence

Phase 4A should use current frontend evidence as input:

- `AKTI_ERP_Phase_4_Frontend_Current_State_Evidence_1c37e0a.zip`
- `frontend-current-state-manifest.md`
- `frontend-route-inventory.md`
- `frontend-noob-proof-gap-analysis.md`
- `frontend-technical-leakage-review.md`
- `frontend-usability-observations.md`

Phase 4A should create a repeatable screenshot-capture path. Screenshot/log evidence must be redacted:

- No secrets in logs.
- No credentials in screenshots.
- No production data.
- No token/session leakage.
- Local/demo placeholders must be clearly classified.

Phase 4A does not redesign the frontend. UI/operator redesign belongs to Phase 4B.

## Non-Scope

Phase 4A must not include:

- Production launch.
- Production VPS/cloud deployment unless separately approved.
- Production secrets or credential access.
- Real WhatsApp production behavior.
- New business modules.
- Foundry/module installer implementation.
- Platform AI runtime.
- Frontend redesign beyond what is necessary to run and inspect the app.
- Phase 4B implementation.
- Phase 5/6 work.
- Destructive migrations.
- `prisma db push` as final proof.

## Runtime Consistency Chains

Phase 4A must preserve these chains:

- Node/pnpm -> Corepack -> install/build commands -> local scripts.
- Env templates -> runtime config -> API/web startup -> smoke tests.
- Local Postgres -> committed migrations -> setup organization -> health/smoke checks.
- API URL -> web `NEXT_PUBLIC_API_BASE_URL` -> browser routes -> screenshot evidence.
- Logs/screenshots -> redaction scan -> evidence package.
- Full Docker Compose decision -> P4A-011 resolution -> runbook/closure evidence.

## Validation Expectations

Phase 4A validation should include:

- `pnpm install --frozen-lockfile` if install verification is needed.
- `pnpm exec prisma migrate deploy --schema prisma/schema.prisma --config prisma.config.ts`.
- `pnpm exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script --exit-code --config prisma.config.ts`.
- `pnpm exec prisma validate --schema prisma/schema.prisma`.
- `pnpm exec prisma generate --schema prisma/schema.prisma`.
- `pnpm registry:generate`.
- `git diff --exit-code -- generated/entity-registry.generated.json`.
- `pnpm registry:check`.
- `pnpm registry:verify:phase2`.
- API `/health`.
- `POST /platform/setup/organization`.
- Web root and `/app` availability.
- Browser/screenshot capture against local demo URL.
- Redaction/no-secret scans.
- Full validation ladder before closure.

## Stop Conditions

Stop Phase 4A execution if:

- A production secret, production credential, production env file, or production database is required.
- Cloud/VPS resource creation is required without explicit approval.
- A dependency or lockfile change is required without approval.
- Prisma schema or migration changes are required without approval.
- `prisma db push` is needed as final proof.
- Runtime app behavior changes exceed local/demo run support.
- Browser tooling requires a new dependency without approval.
- Any script risks deleting non-demo data.
- Phase 4B, Phase 5, Foundry, AI runtime, or new module scope appears.
