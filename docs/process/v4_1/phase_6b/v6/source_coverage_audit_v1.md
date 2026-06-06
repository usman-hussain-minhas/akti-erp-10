# Phase 6B v6 Source Coverage Audit

Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

## Coverage Summary

Source components: 15 | Seeds: 102

## v6 SCM Changes (computed)

| Component | Change | Reason |
|---|---|---|
| 6B.10 | Removed seed_6a_global_opt_out_registry from normalized targets | Payment processing does not require marketing opt-out enforcement |
| 6B.10 | Removed seed_6a_api_key_scope_registry from normalized targets | API key direction unresolved; pending 6B10_APIKEY_DECISION_ACCEPTED token |

Both changes accompanied by v6_normalization_note field on the SCM row.

## Gate Results

| Gate | Result |
|---|---|
| SCM 6B.10 opt-out removed | PASS |
| SCM 6B.10 api-key removed pending decision | PASS |
| SCM/ESM five-way consistency | PASS: 15/15 components |

Result: READY_WITH_MANUAL_REVIEW_BLOCKERS
