# P3-GATE Validation Summary

Validation commands run:

```bash
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

- Final full validation ladder passed.
- Generated registry had no drift.
- Prisma schema and registry metadata were unchanged.
- Bounded repair attempt 1 removed trailing whitespace from the Phase 3 audit report so `git diff --check` passed.
