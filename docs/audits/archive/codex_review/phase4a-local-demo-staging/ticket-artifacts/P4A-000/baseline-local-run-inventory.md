# P4A-000 Baseline Local Run Inventory

Status: COMPLETE

Branch: phase4a/local-demo-staging
Base HEAD: 6240aee8f46a12c9dc07cf3b4feeb53cf958dda9

## Current Runtime Shape

- Package manager: pnpm@10.12.1
- API package: @akti/api
- API start command: pnpm --filter @akti/api start:dev for local development; pnpm --filter @akti/api start after build.
- Web package: @akti/web
- Web start command: pnpm --filter @akti/web dev for local development; pnpm --filter @akti/web start after build.
- Database: PostgreSQL through DATABASE_URL.
- Prisma proof path: committed migrations through prisma migrate deploy; db push is not accepted as Phase 4A proof.

## Implemented Frontend Routes

- /app (apps/web/app/app/page.tsx)
- /lead-desk/create (apps/web/app/lead-desk/create/page.tsx)
- /lead-desk/inbox (apps/web/app/lead-desk/inbox/page.tsx)
- /lead-desk/leads/:leadId/actions (apps/web/app/lead-desk/leads/[leadId]/actions/page.tsx)
- /lead-desk/leads/:leadId (apps/web/app/lead-desk/leads/[leadId]/page.tsx)
- / (apps/web/app/page.tsx)
- /setup/organization (apps/web/app/setup/organization/page.tsx)

## Phase 4 Inputs

Phase 4 proved clean DB/bootstrap, local API/web smoke, browser-rendered evidence, screenshot redaction, backup/restore/rollback, and closure packaging. Phase 4A uses that evidence to stabilize repeatable local/demo operation.
