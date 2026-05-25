# AKTI ERP Project Source Files Cleanup Guide v1

## Purpose

This guide explains how to refresh ChatGPT Project Source Files after the Phase 1 + Phase 2 merge. The observed source-file list came from ChatGPT Project Source Files screenshots and is external context, not repo authority.

Codex cannot delete ChatGPT Project Source Files. The user should manually archive or remove stale items after uploading the new canonical post-Phase-2 package.

## Warning

Do not keep old Phase 0/1 flat files active beside the post-Phase-2 canonical package. Stale source files can conflict with current repo authority and cause incorrect future planning.

## Observed Files And Classification

| Observed Source File | Classification | Replacement |
| --- | --- | --- |
| `AKTI_ERP_Phase_2_Hardening_Ticket_Pack_v1.json` | archive/remove after new package upload | `docs__process__AKTI_ERP_Phase_2_Hardening_Ticket_Pack_v1.json` |
| `AKTI_ERP_Phase_2_Hardening_Audit_Report_v1_1.md` | archive/remove after new package upload | `docs__process__AKTI_ERP_Phase_2_Hardening_Audit_Report_v1.md` |
| `AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json` | archive/remove after new package upload | `docs__process__AKTI_ERP_Phase_2_Autonomous_Codex_Execution_Pack_v1.json` |
| `AKTI_ERP_Phase_2_Autonomous_Branch_Trial_Plan_v1.json` | archive/remove after new package upload | `docs__process__AKTI_ERP_Phase_2_Autonomous_Branch_Trial_Plan_v1.json` |
| `AKTI_ERP_Phase_2_Autonomous_Runbook_v1.md` | replace with current runbook package | `docs__process__AKTI_ERP_Autonomous_Runbook_v2.md` plus historical v1 file |
| `PLANS.md` | replace with new flattened current file | `PLANS.md` |
| `akti-erp-phase-1.zip` | superseded by current source ZIP | `AKTI_ERP_Post_Phase_2_ChatGPT_Source_Files_v1.zip` |
| `AKTI_ERP_Phase_1_Audit_Hardening_Record_v1_1.json` | historical archive only | `docs__process__AKTI_ERP_Phase_1_2_Closure_Summary_v1.md` |
| `phase-1-external-audit.zip` | superseded by current source ZIP | `AKTI_ERP_Post_Phase_2_ChatGPT_Source_Files_v1.zip` |
| `docs__specs__phase-1-build-specification.md` | replace with new flattened current file | same flattened filename |
| `scripts__registry__generate-entity-registry.mjs` | replace with new flattened current file | same flattened filename |
| `pnpm-lock.yaml` | replace with new flattened current file | same flattened filename |
| `packages__contracts__approval-engine-contract.ts` | replace with new flattened current file | same flattened filename |
| `docs__adr__ADR-0002-codex-operating-doctrine.md` | replace with new flattened current file | same flattened filename |
| `packages__contracts__scripts__validate-contracts.mjs` | replace with new flattened current file | same flattened filename |
| `generated__entity-registry.generated.json` | replace with new flattened current file | same flattened filename |
| `scripts__registry__check-entity-registry.mjs` | replace with new flattened current file | same flattened filename |
| `packages__contracts__module-manifest.schema.ts` | replace with new flattened current file | same flattened filename |
| `packages__contracts__screen-contract.schema.ts` | replace with new flattened current file | same flattened filename |
| `pnpm-workspace.yaml` | replace with new flattened current file | same flattened filename |
| `docs__adr__ADR-0004-prisma-derived-entity-registry.md` | replace with new flattened current file | same flattened filename |
| `README_FILE_MAPPING.md` | replace with new mapping file | `README_FILE_MAPPING.md` |
| `packages__contracts__package.json` | replace with new flattened current file | same flattened filename |
| `AGENTS.md` | replace with new flattened current file | `AGENTS.md` |
| `packages__contracts__entity-registry.schema.ts` | replace with new flattened current file | same flattened filename |
| `docs__doctrine__AKTI_ERP_Failure_Prevention_Codex_Operating_Doctrine_v1.json` | replace with new flattened current file | same flattened filename |
| `package.json` | replace with new flattened current file | same flattened filename |
| `packages__contracts__tsconfig.json` | replace with new flattened current file | same flattened filename |
| `packages__contracts__gatekeeper-contract.ts` | replace with new flattened current file | same flattened filename |
| `prisma__entity-registry.metadata.json` | replace with new flattened current file | same flattened filename |
| `docs__adr__ADR-0001-architecture-governance.md` | replace with new flattened current file | same flattened filename |
| `docs__adr__ADR-0003-whatsapp-protected-timeline.md` | replace with new flattened current file | same flattened filename |
| `prisma__schema.prisma` | replace with new flattened current file | same flattened filename |

## Manual Cleanup Steps

1. Upload the new post-Phase-2 source package.
2. Upload or keep the new mapping and manifest files.
3. Archive or remove old Phase 0/1 ZIPs and stale individual flat files.
4. Keep historical Phase 2 docs only as archive/context, not active execution contracts.
5. Use the current post-Phase-2 source package as the canonical ChatGPT project context.
