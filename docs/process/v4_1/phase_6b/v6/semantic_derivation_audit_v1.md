# Phase 6B v6 Semantic Derivation Audit

Status: PHASE_6B_V6_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

All values computed from live v6 JSON. No generator attestation echoed.

## State Summary (computed)

| Metric | v5 | v6 |
|---|---|---|
| Seeds | 102 | 102 |
| manifest_required=true | 84 | 84 |
| manifest_required=false | 18 | 18 |
| foundry_activation=true | 83 | 83 |
| SMC dep count | 84 | 84 |
| manual_review_required seeds | 11 | 21 |

## Seed Type Distribution (computed)

| seed_type | v5 | v6 |
|---|---|---|
| tenant_service | 57 | 57 |
| optional_microservice | 9 | 9 |
| core_microservice | 11 | 11 |
| configuration_extension | 8 | 8 |
| provider_adapter | 7 | 7 |
| evidence_primitive | 5 | 5 |
| audit_log_primitive | 2 | 2 |
| internal_lifecycle_primitive | 3 | 3 |

## ADL Model (all counts computed)

### Seed-level enforcement ADL refs

| ADL | seed count | edge count | grounding |
|---|---|---|---|
| ADL-004 | 6 | 6 | edge-grounded |
| ADL-013 | 2 | 2 | edge-grounded |
| ADL-014 | 1 | 1 | edge-grounded |
| ADL-015 | 2 | 2 | edge-grounded |
| ADL-016 | 2 | 2 | edge-grounded |
| ADL-018 | 1 | 1 | edge-grounded |
| ADL-021 | 1 | 1 | anchor-only (no edge carrier by design) |

### Evidence-only ADL refs (adl_evidence_refs, computed)

| ADL | count |
|---|---|
| ADL-004 | 1 (communication_attempt_evidence) |

### ADL-021 anchor-only check
ADL-021 appears on exactly 1 seed (seed_6b_04_unified_lead_record_authority). PASS.

### ADL self-contained rationale (v6 new field)
Seeds with adl_self_contained_rationale: 8.
All 8 have source_authority_reference. PASS (D2 gate).

## Communication Surface Classification (computed from ESM)

| classification | count |
|---|---|
| send_enforcement_surface | 5 |
| manual_review_surface | 3 |
| non_send_setup_surface | 1 |
| evidence_trace_surface | 1 |

## All Gate Results (computed)

| Check | Method | Result |
|---|---|---|
| G1 zero phase_doc_required | count hard edges with phase_doc_required basis | PASS: 0 |
| G2 billing basis targets billing class | count billing edges targeting non-billing class | PASS: 0 |
| G3 ADL grounding complete | ADLs in edge OR self-contained OR MR-blocked | PASS: 0 orphaned |
| Inverse-manifest gate | count false+SMC seeds | PASS: 0 |
| Manifest↔foundry consistency | count false/true pairs | PASS: 0 |
| ADL-021 anchor-only | count ADL-021 seeds != anchor | PASS: 0 |
| SMC edges carry no behavioral ADLs | count SMC edges with adl_refs | PASS: 0 |
| communication_attempt_evidence uses adl_evidence_refs | field check | PASS |
| Five-way fidelity | SCM/ESM/TDM/DEM/DFM per component | PASS: 15/15 |
| Scope_summary uniqueness | per-seed unique or shared_scope_rationale | PASS: 0 violations |
| Pricing blockers preserved | count pricing MR seeds | PASS: 8 |
| Comm blockers preserved | count comm MR seeds | PASS: 3 |
| 6B.10 api-key blocked | count 6B.10 MR seeds | PASS: 10 |
| ticket/execution flags false | all 102 seeds | PASS |

Result: READY_WITH_MANUAL_REVIEW_BLOCKERS — 21 seeds blocked
