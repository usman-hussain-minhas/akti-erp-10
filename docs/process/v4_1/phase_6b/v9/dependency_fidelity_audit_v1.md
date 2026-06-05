# Phase 6B v8 Dependency Fidelity Audit

## Summary

DFM rows: 15
DFM blocker-aware status distribution: {"RESOLVED_MATCH":4,"MATCH_WITH_MANUAL_BLOCKER":11}
DFM rows with selected_child_target_status=MANUAL_REVIEW_REQUIRED: 11
DFM rows claiming RESOLVED_MATCH with manual child target: 0

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


## Blocker-Aware Fidelity

SCM/TDM/DEM/ESM/DFM consistency is represented with selected child target blocker fields. Rows with required source dependencies and unresolved selected child targets use MATCH_WITH_MANUAL_BLOCKER, not RESOLVED_MATCH.

## Ticket Boundary

Ticket generation allowed: false
Ticket pack generation allowed: false
