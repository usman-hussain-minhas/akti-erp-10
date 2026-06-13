# P4-000 Source Refresh Verification

- Source refresh manifest path: codex-review/post-phase-3-source-refresh/source-refresh-manifest.md
- Exists: true
- Checksums path: codex-review/post-phase-3-source-refresh/source-refresh-checksums.sha256
- Exists: true

## Manifest excerpt
```text
# AKTI ERP Post-Phase-3 Source Refresh Manifest

Generated: 2026-05-25T17:43:07.023Z

Branch: `main`

Final HEAD: `78b2fff6ba2fe8154f49e3b6768d5a8d2eeeb6fc`

Latest commit: `78b2fff Merge pull request #4 from usman-hussain-minhas/docs/roadmap-v2-ai-native-sequencing`

Source package: `AKTI_ERP_Post_Phase_3_ChatGPT_Source_Files_v1.zip`

Package file count: 158

Package size: 379051 bytes

## Inclusion Status

- Phase 3 merge included: yes (`5f388ca93bdc87bdbbff229a53300ef1554e8157`)
- Phase 3 micro-hardening included: yes (`8e64f2d4862197d9ecf854420d753c05f3866640`)
- PR #4 Roadmap v2 merge included: yes (`78b2fff6ba2fe8154f49e3b6768d5a8d2eeeb6fc`)
- Roadmap v2 included in ZIP: yes
- Latest PLANS.md included in ZIP: yes
- Completed Phase 3 audit report included in ZIP: yes
- Phase 4 readiness handoff included in ZIP: yes

## Validation Summary

The following validation commands passed before package generation:

- `pnpm contracts:validate`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm exec prisma generate --schema prisma/schema.prisma`
- `pnpm registry:generate`
- `git diff --exit-code -- generated/entity-registry.generated.json`
- `pnpm registry:check`
- `pnpm registry:verify:phase2`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `git diff -- prisma/schema.prisma`
- `git diff -- prisma/entity-registry.metadata.json`
- `git diff --check`
- `git status --short --branch`

No Prisma schema drift, registry metadata drift, or generated registry drift was present before packaging.

## Exclusion Verification Summary

The source package was generated from `git ls-files` at committed HEAD and copied through `git show HEAD:<path>`. The package excludes `.git`, `node_modules`, `dist`, `.next`, `.turbo`, `coverage`, `codex-review`, `audits`, real/local/secret-bearing env files, production credential files, `secrets`, generated Prisma client output, local caches, and `.DS_Store`.

`.env.example` is intentionally included as a non-secret template.

Excluded tracked files by package rule: `codex-review/phase3-security-auth-tenant/phase3-run-journal.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-000/P3-000-changed-files.zip`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-000/P3-000-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-000/P3-000-validation-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-001/P3-001-changed-files.zip`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-001/P3-001-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-001/P3-001-validation-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-002/P3-002-changed-files.zip`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-002/P3-002-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-002/P3-002-validation-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-003/P3-003-changed-files.zip`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-003/P3-003-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-003/P3-003-validation-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-004/P3-004-changed-files.zip`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-004/P3-004-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-004/P3-004-validation-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-005/P3-005-changed-files.zip`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-005/P3-005-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-005/P3-005-validation-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-006/P3-006-changed-files.zip`, `codex-review/phase3-security-auth-tenant/ticket-artifacts/P3-006/P3-006-summary.md`, `codex-review/phase3-security-auth-tenant/ticket-art
```
