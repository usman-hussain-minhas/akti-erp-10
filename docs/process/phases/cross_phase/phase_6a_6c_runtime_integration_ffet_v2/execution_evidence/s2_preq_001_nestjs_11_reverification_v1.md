---
document_id: s2_preq_001_nestjs_11_reverification_v1
title: S2-PREQ-001 NestJS 11 Reverification Evidence
status: executed_evidence
version: 1.0.0
created: 2026-06-13
updated: 2026-06-13
owner: Usman Hussain
classification: internal_controlled
source_of_truth: false
metadata_standard: esbla_file_metadata_standard_v1
---
# S2-PREQ-001 NestJS 11 Reverification Evidence

Status: `PASS`

Verdict: `satisfied_for_stage2_runtime_wiring_start`

## Package metadata

- `@nestjs/common`: `^11.1.26`
- `@nestjs/core`: `^11.1.26`
- `@nestjs/platform-express`: `^11.1.26`
- Package SHA256: `0958c60296a43a34c6e05c72a2f8256611f19d09649fc54f73d0238fd9bb4c4e`

## Validation commands

- `node -e "const p=require('./apps/api/package.json'); for (const k of ['@nestjs/common','@nestjs/core','@nestjs/platform-express']) { if (!String(p.dependencies[k]||'').startsWith('^11.')) throw new Error(k+' is not NestJS 11'); }"`: exit `0`
- `pnpm install --frozen-lockfile`: exit `0`
- `pnpm contracts:validate`: exit `0`
- `pnpm --filter @akti/api typecheck`: exit `0`
- `pnpm --filter @akti/api test`: exit `0`
- `pnpm --filter @akti/web typecheck`: exit `0`
- `pnpm --filter @akti/web test`: exit `0`
- `pnpm exec prisma validate --schema prisma/schema.prisma`: exit `0`
- `pnpm registry:check`: exit `0`
- `node scripts/quality/check_lower_snake_case_paths.mjs`: exit `0`
- `git diff --check`: exit `0`

## Self-heal

Self-heal attempts used: `1`

Initial shell recorder used invalid parameter expansion while validation commands were passing; the same ladder was rerun with a Node recorder before committing this evidence.

## Scope confirmation

- Runtime files changed: `false`
- Package files changed: `false`
- Lockfile changed: `false`
- Schema or migration changed: `false`
- Frontend files changed: `false`
