# Phase 6B v6 Semantic Dependency Target Map Audit

Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

All checks computed from live v6 JSON.

## Computed Figures

| Metric | v5 | v6 |
|---|---|---|
| Total TDM rows | 472 | 472 |
| READY rows | 462 | 452 |
| MANUAL_REVIEW_REQUIRED rows | 10 | 20 |
| provider_adapter as default target | 0 | 0 |
| jazzcash_gateway in any selected target | 0 | 0 |

## Gate Results (computed)

| Check | Method | Result |
|---|---|---|
| No provider_adapter as default target | scan selected_target_seed_ids; cross-ref seed_type | PASS: 0 |
| No jazzcash_gateway in any target | scan all selected_target_seed_ids | PASS: 0 |
| 6B.10 api-key rows marked manual_review | count 6B.10 api-key TDM rows with MR flag | PASS: 10 |
| TDM included in DFM five-way fidelity | DFM has semantic_dependency_target_map_targets | PASS |
| All READY rows have final_status=READY | count | PASS: 452 |
| All MR rows have manual_review_reason | count | PASS: 20 |

Result: READY_WITH_MANUAL_REVIEW_BLOCKERS
