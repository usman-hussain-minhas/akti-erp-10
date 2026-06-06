# Phase 6B v11 Dependency Extraction Audit

Status: `PHASE_6B_V11_DECISIONS_APPLIED_READY_FOR_TICKET_PACK_PLANNING_REVIEW`

## Current Final State Summary

Source components: 15
Sub-surfaces: 103
Seeds: 103
Extraction edges: 452
Extraction edge distribution: hard_dependency=444 / deferred_with_reason=0 / conditional_dependency=8 / manual_review_required=0
Distribution: {"hard_dependency":444,"deferred_with_reason":0,"conditional_dependency":8,"manual_review_required":0}
Hard dependency basis distribution: {'activation_lifecycle_required': 85, 'adl_hard_rule': 7, 'billing_or_evidence_required': 113, 'business_logic_hard_rule': 239}
Top-level seed dependency references: 444
Root seeds: 0
Root seed list:


## v11 Computed Basis Gates

- Empty ADL hard-rule check: PASS; count=0
- Phase-doc final basis check: PASS; hard_dependency_basis=phase_doc_required count=0
- API-key wrong-basis check: PASS; bad_api_key_basis_count=0
- Manual-review edge count: PASS; manual_review_required edges=0

## Summary

Dependency edges: 452
Distribution: {"hard_dependency":444,"deferred_with_reason":0,"conditional_dependency":8,"manual_review_required":0}

V11 applies the answered decision register, adds the canonical pricing authority, removes direct API-key edges from allocation/manual reconciliation, promotes accepted provider API-key edges, and removes `phase_doc_required` from final hard-edge basis values.
