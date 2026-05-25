# P4-016A Pre-implementation Validation Strategy

Before each proof ticket, use exact-file planning and run ticket-specific commands. After implementation/proof tickets, run the full applicable validation ladder.

## Full ladder

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
