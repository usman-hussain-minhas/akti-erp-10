# Phase 6B v5 Semantic Repair Status

Status: PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

This v5 artifact is not ticket-pack ready and does not authorize ticket generation. Pricing manual-review rows and unresolved communication manual-review rows block ticket planning.

## Current Final State Summary

Source components: 15
Sub-surfaces: 102
Seeds: 102
Extraction edges: 450
Extraction edge distribution: hard_dependency=442 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=8
Distribution: {"hard_dependency":442,"deferred_with_reason":0,"conditional_dependency":0,"manual_review_required":8}
Top-level seed dependency references: 442
Root seeds: 0
Current root seeds:
- none

## Seed Type Distribution

| seed_type | Count |
|---|---:|
| audit_log_primitive | 2 |
| configuration_extension | 8 |
| core_microservice | 11 |
| evidence_primitive | 5 |
| internal_lifecycle_primitive | 3 |
| optional_microservice | 9 |
| provider_adapter | 7 |
| tenant_service | 57 |

## Communication Surface Classification

| Classification | Count |
|---|---:|
| evidence_trace_surface | 1 |
| manual_review_surface | 3 |
| non_send_setup_surface | 1 |
| send_enforcement_surface | 5 |

## Gates

| Gate | Result |
|---|---|
| dependencies equal akti_local.dependency_edges seed_id set | PASS |
| communication_attempt_evidence evidence-only ADL model | PASS |
| service_manifest_contract behavioral ADL edges | PASS: count 0 |
| ticket_generation_allowed true rows | PASS: 0 |
| ticket_pack_generation_allowed true rows | PASS: 0 |

## Final Status

PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
