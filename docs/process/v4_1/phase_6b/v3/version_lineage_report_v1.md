# Phase 6B v3 Version Lineage Report v1

Status: READY

## v1

v1 source: root Phase 6B artifacts copied into docs/process/v4_1/phase_6b/v1/.
v1 purpose: original PR #47 generated Phase 6B lifecycle docs.
v1 failure pattern: mechanically green but semantically unsafe for ticket-pack planning.
v1 archive byte-comparison result: PASS (19 files).

## v2

v2 source: first semantic repair attempt preserved at docs/process/v4_1/phase_6b/v2/.
v2 purpose: semantic repair attempt.
v2 failure pattern: partial propagation / cross-artifact drift. Verified failures: pricing manifest drift=8, local dependency mismatch=61, ADL-021 direct edge count=29, pricing contradiction=true, report drift=true.
v2 before/after unchanged checksum result: PASS (19 files).

## v3

v3 source: copied from v2 before patch; copy byte-comparison result: PASS.
v3 purpose: fix v2 propagation and parity failures without overwriting failed versions.

## v3 Fixes Applied

- Corrected semantic/catalog/seed manifest, Foundry activation, traceability target, seed type, ADL, and manual-review parity.
- Regenerated seed-local dependency_edges from final seed dependencies.
- Removed stale service manifest, API key scope, global opt-out, and JazzCash local edges through dependency parity regeneration.
- Added outbound gateway local/extraction parity for ADL-004 outbound communication seeds.
- Enforced ADL-021 anchor-only model on seed_6b_04_unified_lead_record_authority.
- Resolved pricing human-confirmation contradiction by setting pricing rows manual_review_required=true.
- Rebuilt dependency extraction from final seed dependencies plus non-hard optional/manual-review edges.
- Rebuilt dependency fidelity as four-way comparison with no self-attestation.
- Recomputed v3 reports from live v3 JSON.

## Files Changed in v3

All v3 lifecycle files were copied from v2; v3 JSON/report files were patched in place and this lineage report was added. v1 and v2 were not edited after preservation.

## Validation Result

Validation commands run and passed:

- JSON parse for every v3 JSON artifact.
- Custom v3 semantic parity and preservation validation.
- Direct reusable mechanical audit against docs/process/v4_1/phase_6b/v3 with Phase 6A external context: PASS, Categories A-E PASS.
- node scripts/quality/check_lower_snake_case_paths.mjs: PASS.
- git diff --check and git diff --cached --check: PASS.
- git status --short --branch: PASS with staged changes limited to v1/v2/v3.
- git diff --name-only REPAIR_START_SHA...HEAD: to be reported after checkpoint commit using REPAIR_START_SHA.

Current generated v3 state is safe for manual review after final git/path checks complete.

## Manual Review Safety

v3 is safe for manual review only; it does not authorize ticket packs, predictive stop analysis, autonomous readiness, execution prompts, or execution.

## Future Version Rule

If v3 fails, create v4 by copying v3 and patching only v4. If v4 fails, create v5, and so on. Never overwrite failed versions.
