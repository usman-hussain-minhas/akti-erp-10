---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v1.0
created: 2026-06-13
last_updated: 2026-06-13
status: active
document_type: final_legacy_name_audit
scope: Stage 0 Wave 5 final legacy-name and active-status audit.
title: Esbla Spark — Stage 0 Wave 5 Final Legacy-Name Audit v1
ratifier: Usman Hussain
---

# Esbla Spark — Stage 0 Wave 5 Final Legacy-Name Audit v1

## Status

`PASS`

This audit proves zero unclassified active legacy-name hits after Stage 0 Wave 5 classification. It does not claim every legacy string has been removed. Remaining active hits are line-level classified in `docs/process/registries/legacy_name_map_v5_0.json` and carry sunset conditions.

## Scan Summary

| Metric | Value |
|---|---:|
| Line-level term hits, excluding self-reference outputs | 29412 |
| Self-reference term hits excluded | 128803 |
| Active classified entries | 9474 |
| Unclassified active hits | 0 |

## Class Summary

| Class | Hits |
|---|---:|
| `ACTIVE_AUDIT_HISTORICAL_EVIDENCE` | 8 |
| `ACTIVE_CLASSIFIED_REVIEW_REMAINDER` | 11 |
| `ACTIVE_CONTRACT_RENAME_REQUIRES_VERSIONED_CHANGE_ANALYSIS` | 1 |
| `ACTIVE_RUNTIME_OR_VALIDATION_RENAME_DEFERRED` | 114 |
| `ACTIVE_TRANSITION` | 109 |
| `DOCS_RENAME_OR_ARCHIVE_TRACKED_REMAINDER` | 9053 |
| `ENV_OR_LOCAL_TOOLING_CONTRACT_DEFERRED` | 26 |
| `HISTORICAL_RECORD` | 19938 |
| `PACKAGE_OR_LOCKFILE_DEFERRED` | 96 |
| `SCHEMA_OR_MIGRATION_DO_NOT_TOUCH` | 2 |
| `TEMPORARILY_ACTIVE_LEGACY_OPERATING_FILE` | 54 |

## Guardrails

- `STAGE0-W3-FFET-002` remains deferred to the Stage 2 versioned contract-change pack.
- Semantic contract, package, env, schema, and runtime compatibility identifiers were not renamed by this audit.
- Historical/archive and audit self-reference hits are not counted as active unclassified hits.
- All execution flags remain false.

## Evidence

- JSON audit artifact: `docs/audits/rename_audits/esbla_stage0_wave5_final_legacy_name_audit_v1.json`
- Line-level active map: `docs/process/registries/legacy_name_map_v5_0.json`

End of audit v1.
