# Phase 6B v4 Version Lineage Report v1

Status: READY

## Lineage

v1: original root Phase 6B archive. Purpose: preserve original PR #47 generated Phase 6B lifecycle artifacts. Failure pattern: mechanically green but semantically unsafe.

v2: first semantic repair attempt. Failure pattern: cross-artifact drift.

v3: parity repair attempt. Failure pattern: optional micro-service misclassification, ADL over-propagation to generic service_manifest_contract edges, and stale v2 identity text in current-state files.

v4: copied from v3, then patched only under docs/process/v4_1/phase_6b/v4/. Purpose: repair optional micro-service classification, ADL edge precision, report identity, and root cleanup safety.

## Root Cleanup Result

Root Phase 6B .json/.md files were byte-identical to v1 before deletion. Reference-integrity scan found zero active docs/process references to root Phase 6B artifact paths. Duplicate root artifact files were removed; v1 remains the authoritative preserved original archive.

## v4 Fixes

- Reclassified 6B.07 WhatsApp/email channel seeds to optional_microservice.
- Removed behavioral ADLs from service_manifest_contract edges.
- Preserved seed-level ADL ownership and kept edge-level ADLs only on ADL-specific enforcement edges.
- Preserved ADL-021 anchor-only model.
- Preserved ADL-004 outbound gateway dependency model.
- Updated current-state report identity to v4.
- Recomputed summaries from live v4 JSON.

## Validation Result

Validation commands run and passed:

- JSON parse for every v4 JSON artifact: PASS.
- Custom v4 semantic, ADL, root cleanup, and parity validation: PASS.
- Direct reusable mechanical audit against docs/process/v4_1/phase_6b/v4 with Phase 6A external context: PASS, Categories A-E PASS.
- node scripts/quality/check_lower_snake_case_paths.mjs: PASS.
- git diff --check: PASS.
- git status --short --branch: PASS with allowed root duplicate deletions and v4 additions only; v3.zip remains untracked and uncommitted.
- git diff --name-only REPAIR_START_SHA...HEAD: pending after checkpoint commit.

Current generated v4 state is safe for manual review after final git/path checks complete.

## Manual Review Safety

v4 is safe for manual review only. It does not authorize ticket packs or execution.

## Future Version Rule

If v4 fails, create v5 by copying v4 and patching only v5. Never overwrite failed versions.
