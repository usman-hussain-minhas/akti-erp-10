# Phase 6B v18 Dependency Extraction Audit

Status: `PHASE_6B_V18_V4_LIFECYCLE_DECISIONS_APPLIED_SCHEMA_CONTROL_REQUIRED`

## Current Final State Summary

Dependency edges: 452
Distribution: {"hard_dependency":421,"deferred_with_reason":0,"conditional_dependency":31,"manual_review_required":0}

## Summary

Extraction edges: 452
Extraction edge distribution: hard_dependency=421 / deferred_with_reason=0 / conditional_dependency=31 / manual_review_required=0
Hard basis distribution: `{"activation_lifecycle_required":85,"business_logic_hard_rule":210,"billing_or_evidence_required":113,"adl_hard_rule":13}`

## V4 checks

- Send-surface opt-out edges carry structured ADL refs: PASS (6)
- Demoted opt-out edges represented as conditional: PASS (23)
- Terminal phase_doc_required hard edges: PASS (0)
- Terminal capability_prerequisite hard edges: PASS (0)
- Ticket generation remains forbidden: PASS
