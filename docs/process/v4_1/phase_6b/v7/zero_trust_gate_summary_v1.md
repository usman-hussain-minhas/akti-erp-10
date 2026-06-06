# Phase 6B v7 Semantic Repair Status

Status: PHASE_6B_V7_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

This v7 artifact is not ticket-pack ready and does not authorize ticket generation. Manual-review blockers remain until explicitly accepted.

## Current Final State Summary

Source components: 15
Sub-surfaces: 102
Seeds: 102
Extraction edges: 450
Extraction edge distribution: hard_dependency=431 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=19
Distribution: {"hard_dependency":431,"deferred_with_reason":0,"conditional_dependency":0,"manual_review_required":19}
Top-level seed dependency references: 431
Root seeds: 0
Current root seeds:
- none

## Gate Metrics

| Metric | Count |
|---|---:|
| manifest_required true | 84 |
| manifest_required false | 18 |
| foundry_activation_required true | 83 |
| foundry_activation_required false | 19 |
| service_manifest dependency count | 84 |
| manual_review_required seed count | 21 |
| pricing blocker count | 8 |
| communication blocker count | 3 |
| 6B.10 API-key blocker count | 10 |
| hard_dependency phase_doc_required | 0 |
| hard_dependency manual_decision | 0 |

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

## Edge Basis Distribution

| Basis | Count |
|---|---:|
| activation_lifecycle_required | 189 |
| adl_hard_rule | 43 |
| billing_or_evidence_required | 112 |
| business_logic_hard_rule | 87 |
| manual_decision | 19 |

## Target Semantic Class Distribution

| target_semantic_class | Count |
|---|---:|
| activation_manifest | 84 |
| api_security | 18 |
| audit_evidence | 20 |
| billing_financial | 92 |
| capability_ordering | 87 |
| communication_governance | 35 |
| identity_access | 60 |
| manual_review | 8 |
| platform_lifecycle | 46 |

## ADL Grounding Distribution

| adl_grounding_mode | Count |
|---|---:|
| edge_grounded | 12 |
| manual_review | 3 |

## Final Status

PHASE_6B_V7_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
