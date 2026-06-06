# Phase 6B v8 Dependency Extraction Audit

## Summary

Dependency edges: 450
Distribution: hard_dependency=431 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=19
Manual-review row/edge distribution: {"sdm":21,"subsurface":21,"tdm":45,"dem_edges":19,"esm_seeds":21,"esm_local_edges":0,"dfm":11}
Blocker type distribution: {"pricing_classification":24,"communication_send_semantics":10,"api_key_scope_direction":66,"pricing_anchor_selection":10,"target_selection_manual_review":17,"fidelity_blocker":11}
DFM blocker-aware status distribution: {"RESOLVED_MATCH":4,"MATCH_WITH_MANUAL_BLOCKER":11}
Generic edge reason count by edge class: {"adl":0,"billing_evidence":0,"manual_decision":0,"activation_manifest":0,"capability_prerequisite":0,"other":0}
Forbidden generic edge reason count: 0

## Current Final State Summary

Source components: 15
Sub-surfaces: 102
Seeds: 102
Extraction edges: 450
Extraction edge distribution: hard_dependency=431 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=19
Top-level seed dependency references: 431
Root seeds: 0
Current root seeds: none
Manual blocker registry entries: 138
Ticket generation allowed: false
Ticket pack generation allowed: false


## v8 Gate Results

phase_doc_required hard-edge count: 0
manual_decision hard-edge count: 0
Forbidden generic edge reason count: 0
Manual-review dependency edges: 19
ADL/billing/manual/activation generic reason policy: PASS

## Ticket Boundary

Ticket generation allowed: false
Ticket pack generation allowed: false
