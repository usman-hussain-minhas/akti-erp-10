# Phase 6B Semantic Dependency Target Map Audit v1 (v2 Computed)

Status: READY
Version: v2 — computed from live JSON, not echoed from generator

## Methodology

This audit recomputes all checks directly from `semantic_dependency_target_map_v1.json`
and `execution_seed_matrix_v1.json` in v2/. No value is read from the generator's own
attestation fields. Each check below is derived from the actual data.

## Computed Figures

| Metric | Value |
| --- | --- |
| Target map rows | 472 |
| Seeds in ESM | 102 |
| Seeds with seed_type = provider_adapter | 7 |
| Seeds with seed_type = core_microservice | 11 |
| Seeds with seed_type = configuration_extension (v2 new) | 8 |
| manual_review_required rows | 0 |
| provider_adapter selected as default target | 0 |

## Check Results (Computed)

### Fix6a — No provider_adapter as default target when neutral sibling exists

**Method**: For each row where `selected_target_seed_ids` contains a seed whose
`seed_type == "provider_adapter"`, check whether the same source component contains
any non-provider sibling seed. If yes → FAIL.

**Result**: PASS — 0 violations

- In v1: all 25 edges from 6B.11–6B.15 selected `seed_6b_10_jazzcash_gateway` (provider_adapter)
- In v2: all 25 retargeted to `seed_6b_10_payment_allocation_balance` (core_microservice)
- `rejected_first_child_target_if_any` now correctly names `seed_6b_10_jazzcash_gateway`
- `semantic_target_type` set to `provider_neutral_anchor_surface`

### Provider-specific violations remaining

None. All 25 formerly-jazzcash edges now target `seed_6b_10_payment_allocation_balance`.

| Source Component | Source Seeds (count) | Old Target | New Target |
| --- | --- | --- | --- |
| 6B.11 | 5 | seed_6b_10_jazzcash_gateway | seed_6b_10_payment_allocation_balance |
| 6B.12 | 6 | seed_6b_10_jazzcash_gateway | seed_6b_10_payment_allocation_balance |
| 6B.13 | 4 | seed_6b_10_jazzcash_gateway | seed_6b_10_payment_allocation_balance |
| 6B.14 | 5 | seed_6b_10_jazzcash_gateway | seed_6b_10_payment_allocation_balance |
| 6B.15 | 5 | seed_6b_10_jazzcash_gateway | seed_6b_10_payment_allocation_balance |

### Ambiguous targets without manual_review_required

**Method**: Scan all rows where `final_status != "READY"` and `manual_review_required == false`.

**Result**: PASS — 0 such rows

Result: READY
