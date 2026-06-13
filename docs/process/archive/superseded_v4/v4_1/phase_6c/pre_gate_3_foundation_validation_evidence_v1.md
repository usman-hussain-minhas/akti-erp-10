# Pre-6C Foundation Validation Evidence v1

Status: PASS

Repository head at validation time: `918bde9`

Platform: `Darwin 192.168.1.8 23.6.0 Darwin Kernel Version 23.6.0: Thu Dec 19 20:44:50 PST 2024; root:xnu-10063.141.1.703.2~1/RELEASE_X86_64 x86_64`

Commands captured:

- `pnpm contracts:validate`: PASS
- `pnpm --filter @akti/api typecheck`: PASS
- `pnpm --filter @akti/api test`: PASS
- `pnpm exec prisma validate --schema prisma/schema.prisma`: PASS
- `pnpm registry:check`: PASS
- `node scripts/quality/check_lower_snake_case_paths.mjs`: PASS

All authorization flags remain false.

## Raw output

```text

===== pnpm contracts:validate =====

> akti-erp@ contracts:validate /Volumes/UsmanWork/AKTI ERP 10
> pnpm --filter @akti/contracts contracts:validate


> @akti/contracts@0.0.0 contracts:validate /Volumes/UsmanWork/AKTI ERP 10/packages/contracts
> node scripts/validate-contracts.mjs

Validating entity-registry.schema.ts
Validating module-manifest.schema.ts
Validating screen-contract.schema.ts
Validating scripts/validate-access-core-contracts.mjs
Access Core contract validation passed.
Validating scripts/validate-engagement-gateway-lite-contracts.mjs
Engagement Gateway Lite contract validation passed.
Validating scripts/validate-lead-desk-contracts.mjs
Lead Desk contract validation passed.
Validating scripts/validate-module-manifest-contracts.mjs
Validating module manifest access-core.module-manifest.contract.ts
Validating module manifest engagement-gateway-lite.module-manifest.contract.ts
Validating module manifest internal-fixture.module-manifest.contract.ts
Validating module manifest lead-desk-core.module-manifest.contract.ts
Validated 4 module manifest contract file(s).
Validating scripts/validate-screen-contracts.mjs
Phase 1, Phase 2, and Phase 4B screen-contract validation passed.
===== exit : pnpm contracts:validate =====

===== pnpm --filter @akti/api typecheck =====

> @akti/api@0.0.0 typecheck /Volumes/UsmanWork/AKTI ERP 10/apps/api
> pnpm exec tsc --noEmit -p tsconfig.json

===== exit : pnpm --filter @akti/api typecheck =====

===== pnpm --filter @akti/api test =====

> @akti/api@0.0.0 test /Volumes/UsmanWork/AKTI ERP 10/apps/api
> pnpm --filter @akti/contracts build && pnpm exec tsx src/prisma/prisma-import-boundary.test.ts && pnpm exec tsx src/phase1-hardening/phase1-release-blockers.test.ts && pnpm exec tsx src/organization-setup/dto/create-organization-setup.dto.test.ts && pnpm exec tsx src/organization-setup/organization-setup.service.test.ts && pnpm exec tsx src/hierarchy/dto/hierarchy.dto.test.ts && pnpm exec tsx src/hierarchy/hierarchy-closure.service.test.ts && pnpm exec tsx src/hierarchy/hierarchy.controller.test.ts && pnpm exec tsx src/hierarchy/hierarchy.service.test.ts && pnpm exec tsx src/configuration/dto/configuration.dto.test.ts && pnpm exec tsx src/configuration/configuration.controller.test.ts && pnpm exec tsx src/configuration/configuration.service.test.ts && pnpm exec tsx src/platform-observability/audit-log.service.test.ts && pnpm exec tsx src/platform-observability/event-outbox.service.test.ts && pnpm exec tsx src/module-registry/module-registry.service.test.ts && pnpm exec tsx src/access-core/dto/access-core.dto.test.ts && pnpm exec tsx src/security/request-context.test.ts && pnpm exec tsx src/gatekeeper/gatekeeper-preflight.service.test.ts && pnpm exec tsx src/gatekeeper/gatekeeper.p5b-007e.test.ts && pnpm exec tsx src/gatekeeper/gatekeeper.p5b-008f.test.ts && pnpm exec tsx src/gatekeeper/gatekeeper.p5b-008g.test.ts && pnpm exec tsx src/foundry/foundry.p5b-012b.test.ts && pnpm exec tsx src/foundry/foundry.p5b-012c.test.ts && pnpm exec tsx src/foundry/foundry.p5b-013a.test.ts && pnpm exec tsx src/foundry/foundry.p5b-013b.test.ts && pnpm exec tsx src/foundry/foundry.p5b-013c.test.ts && pnpm exec tsx src/foundry/foundry.p5b-014a.test.ts && pnpm exec tsx src/foundry/foundry.p5b-014b.test.ts && pnpm exec tsx src/access-core/access-core.service.test.ts && pnpm exec tsx src/engagement-gateway/engagement-gateway.service.test.ts && (cd ../.. && pnpm exec tsx apps/api/src/lead-desk/lead-desk-scope-model-foundation.test.ts) && pnpm exec tsx src/lead-desk/lead-desk.service.test.ts


> @akti/contracts@0.0.0 build /Volumes/UsmanWork/AKTI ERP 10/packages/contracts
> pnpm exec tsc -p tsconfig.build.json

prisma-import-boundary tests passed
phase1-release-blockers tests passed
create-organization-setup.dto tests passed
organization-setup.service tests passed
hierarchy.dto tests passed
hierarchy-closure.service tests passed
hierarchy.controller tests passed
hierarchy.service tests passed
configuration.dto tests passed
configuration.controller tests passed
configuration.service tests passed
audit-log.service tests passed
event-outbox.service tests passed
module-registry.service tests passed
access-core.dto tests passed
request-context tests passed
gatekeeper-preflight.service tests passed
P5B-007e gatekeeper negative outcome tests passed.
P5B-008f gatekeeper STOP_FOR_REVIEW immutability enforcement tests passed.
P5B-008g gatekeeper STOP_FOR_REVIEW immutability negative tests passed.
P5B-012b Foundry install execution tests passed.
P5B-012c Foundry install evidence receipt tests passed.
P5B-013a Foundry enable flow tests passed.
P5B-013b Foundry disable flow tests passed.
P5B-013c Foundry uninstall flow tests passed.
P5B-014a Foundry update flow tests passed.
P5B-014b Foundry rollback/recovery flow tests passed.
access-core.service tests passed
engagement-gateway.service tests passed
lead-desk-scope-model-foundation tests passed
lead-desk.service tests passed
===== exit : pnpm --filter @akti/api test =====

===== pnpm exec prisma validate --schema prisma/schema.prisma =====
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma/schema.prisma.
The schema at prisma/schema.prisma is valid 🚀
===== exit : pnpm exec prisma validate --schema prisma/schema.prisma =====

===== pnpm registry:check =====

> akti-erp@ registry:check /Volumes/UsmanWork/AKTI ERP 10
> node scripts/registry/check-entity-registry.mjs

Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma/schema.prisma.
The schema at prisma/schema.prisma is valid 🚀
Entity Registry is up to date.
===== exit : pnpm registry:check =====

===== node scripts/quality/check_lower_snake_case_paths.mjs =====
AKTI lower_snake_case path policy check
Total tracked paths: 4072
Violation count: 0
Exception count: 3
Exceptions by category:
- historical_evidence: 3
  - codex-review/apps/training/crm/v0_0_1/index.md (codex-review/**)
  - codex-review/core/v0_0_1/index.md (codex-review/**)
  - codex-review/core/v0_0_2/index.md (codex-review/**)
PASS: no new unapproved hyphenated tracked paths
===== exit : node scripts/quality/check_lower_snake_case_paths.mjs =====

```
