# P3-008 Validation Summary

Validation commands run:

```bash
pnpm --filter @akti/api test
pnpm contracts:validate
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm exec prisma generate --schema prisma/schema.prisma
pnpm registry:generate
git diff --exit-code -- generated/entity-registry.generated.json
pnpm registry:check
pnpm registry:verify:phase2
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff -- prisma/schema.prisma
git diff -- prisma/entity-registry.metadata.json
git diff --check
git status --short --branch
```

Result:

- All validation commands passed after one bounded repair.
- Repair attempt 1 corrected an Access Core static evidence snippet to match the repo's actual organization-scoped delete pattern.
- Generated registry had no drift.
- Prisma schema and registry metadata were unchanged.
- P3-008 stayed on the ADR-0009 service-level enforcement path and did not introduce DB RLS artifacts.
