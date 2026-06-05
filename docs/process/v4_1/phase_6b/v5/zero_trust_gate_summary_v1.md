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

## Zero-Trust Gate Summary

Result: PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

## Communication Surface Classification

| Classification | Count |
|---|---:|
| evidence_trace_surface | 1 |
| manual_review_surface | 3 |
| non_send_setup_surface | 1 |
| send_enforcement_surface | 5 |

## Gate Decisions

| Gate | Result |
|---|---|
| mechanical consistency expected | PASS_PENDING_DIRECT_AUDIT |
| semantic ADL-004 precision | PASS_WITH_MANUAL_REVIEW_BLOCKERS |
| ticket generation authorization | BLOCKED |
| ticket-pack planning authorization | BLOCKED |

## Blockers

- seed_6b_02_fixed_pricing_model
- seed_6b_02_tiered_pricing_model
- seed_6b_02_volume_pricing_model
- seed_6b_02_per_unit_pricing_model
- seed_6b_02_per_hour_pricing_model
- seed_6b_02_per_period_pricing_model
- seed_6b_02_early_bird_pricing_deadline
- seed_6b_02_bundle_package_composition
- seed_6b_07_whatsapp_inbound_routing
- seed_6b_07_email_connected_inbox
- seed_6b_07_email_shared_inbox

## Final Status

PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
