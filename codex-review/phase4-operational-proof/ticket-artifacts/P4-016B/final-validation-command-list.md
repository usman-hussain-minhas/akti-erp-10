# P4-016B Final Validation Command List

Status: READY_FOR_P4_GATE

The final Phase 4 validation ladder preserves the existing repository validation gate and adds Phase 4 evidence checks through ticket artifacts rather than weakening CI.

## Full Repository Validation Ladder

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

## Phase 4 Evidence Validation Categories

- Fresh DB/bootstrap proof: P4-009.
- Controlled local staging/demo proof: P4-010.
- Smoke/health proof: P4-011.
- Browser-rendered frontend and visual QA proof: P4-012.
- Backup/restore/rollback proof: P4-013.
- Route-limiting posture proof: P4-015.
- Final operational runbook evidence: P4-014B.

## P4-GATE Requirement

P4-GATE must rerun the full repository validation ladder before final packaging.
