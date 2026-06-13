# P4A-000 Current Command Inventory

## Root Scripts

- contracts:validate: pnpm --filter @akti/contracts contracts:validate
- registry:generate: node scripts/registry/generate-entity-registry.mjs
- registry:check: node scripts/registry/check-entity-registry.mjs
- registry:verify:phase1: node scripts/registry/verify-phase1-registry.mjs
- registry:verify:phase2: node scripts/registry/verify-phase2-registry.mjs
- lint: pnpm --filter @akti/api lint && pnpm --filter @akti/web lint
- typecheck: pnpm --filter @akti/api typecheck && pnpm --filter @akti/web typecheck
- test: pnpm --filter @akti/api test && pnpm --filter @akti/web test
- build: pnpm --filter @akti/api build && pnpm --filter @akti/web build

## API Scripts

- start: node dist/main.js
- start:dev: pnpm exec tsx watch src/main.ts
- build: pnpm --filter @akti/contracts build && pnpm exec tsc -p tsconfig.build.json
- lint: pnpm exec tsc --noEmit -p tsconfig.json
- typecheck: pnpm exec tsc --noEmit -p tsconfig.json
- test: pnpm --filter @akti/contracts build && pnpm exec tsx src/prisma/prisma-import-boundary.test.ts && pnpm exec tsx src/phase1-hardening/phase1-release-blockers.test.ts && pnpm exec tsx src/organization-setup/dto/create-organization-setup.dto.test.ts && pnpm exec tsx src/organization-setup/organization-setup.service.test.ts && pnpm exec tsx src/hierarchy/dto/hierarchy.dto.test.ts && pnpm exec tsx src/hierarchy/hierarchy-closure.service.test.ts && pnpm exec tsx src/hierarchy/hierarchy.controller.test.ts && pnpm exec tsx src/hierarchy/hierarchy.service.test.ts && pnpm exec tsx src/configuration/dto/configuration.dto.test.ts && pnpm exec tsx src/configuration/configuration.controller.test.ts && pnpm exec tsx src/configuration/configuration.service.test.ts && pnpm exec tsx src/platform-observability/audit-log.service.test.ts && pnpm exec tsx src/platform-observability/event-outbox.service.test.ts && pnpm exec tsx src/module-registry/module-registry.service.test.ts && pnpm exec tsx src/access-core/dto/access-core.dto.test.ts && pnpm exec tsx src/security/request-context.test.ts && pnpm exec tsx src/gatekeeper/gatekeeper-preflight.service.test.ts && pnpm exec tsx src/access-core/access-core.service.test.ts && pnpm exec tsx src/engagement-gateway/engagement-gateway.service.test.ts && (cd ../.. && pnpm exec tsx apps/api/src/lead-desk/lead-desk-scope-model-foundation.test.ts) && pnpm exec tsx src/lead-desk/lead-desk.service.test.ts

## Web Scripts

- dev: next dev
- build: next build
- start: next start
- lint: pnpm exec tsc --noEmit -p tsconfig.json
- typecheck: pnpm exec tsc --noEmit -p tsconfig.json
- test: node --test test/*.test.mjs

## Standard Validation Ladder

- pnpm contracts:validate
- pnpm exec prisma validate --schema prisma/schema.prisma
- pnpm exec prisma generate --schema prisma/schema.prisma
- pnpm registry:generate
- git diff --exit-code -- generated/entity-registry.generated.json
- pnpm registry:check
- pnpm registry:verify:phase2
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build
