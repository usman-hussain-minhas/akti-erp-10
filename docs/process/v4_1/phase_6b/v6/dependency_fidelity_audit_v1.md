# Phase 6B v6 Dependency Fidelity Audit (Five-Way)

Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

## Five-Way Fidelity Model (v6 addition)

| Column | Source file | What it records |
|---|---|---|
| 1. SCM | source_coverage_matrix | normalized component-level deps from source doc |
| 2. SDM | semantic_derivation_matrix | classification and ADL decisions |
| 3. ESM | execution_seed_matrix | authoritative seed dependencies |
| 4. TDM | semantic_dependency_target_map | target seed selection per dependency |
| 5. DEM | dependency_extraction_matrix | extraction edges |
| DFM | dependency_fidelity_matrix | this file — cross-fidelity across all five |

DFM now includes TDM fields:
- `semantic_dependency_target_map_targets`: hard target selections per component
- `semantic_dependency_target_map_optional_targets`: manual-review target rows

## Computed Fidelity Results

| Check | Result | Evidence |
|---|---|---|
| DEM hard targets == ESM deps (B2 parity) | PASS | 102/102 seeds, 15/15 components |
| SCM 6B.10 opt-out removed | PASS | absent from normalized_required_dependency_targets |
| SCM 6B.10 api-key removed (pending decision) | PASS | absent from normalized targets |
| TDM fields present in all DFM rows | PASS | 15/15 rows have TDM fields |
| No self-attestation (no seed in own deps) | PASS | 0 self-deps |
| Manual-review edges excluded from hard-dep parity | PASS | 18 MR edges correctly excluded |

## Components with Manual-Review Rows

- 6B.02 (8 pricing seeds): manual_review_required — await PRICING_DECISION_ACCEPTED tokens
- 6B.07 (3 comm seeds): manual_review_required — await COMM_DECISION_ACCEPTED tokens
- 6B.10 (10 seeds): manual_review_required — await 6B10_APIKEY_DECISION_ACCEPTED token

Result: READY_WITH_MANUAL_REVIEW_BLOCKERS
