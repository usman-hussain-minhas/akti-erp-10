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

## Decision

Phase 6B v5 is ready only for targeted manual review with blockers. It is not ready for ticket-pack planning, ticket generation, autonomous readiness, predictive stop analysis, or execution.

## Blocking Manual Review Items

Pricing manual-review rows:

- seed_6b_02_fixed_pricing_model
- seed_6b_02_tiered_pricing_model
- seed_6b_02_volume_pricing_model
- seed_6b_02_per_unit_pricing_model
- seed_6b_02_per_hour_pricing_model
- seed_6b_02_per_period_pricing_model
- seed_6b_02_early_bird_pricing_deadline
- seed_6b_02_bundle_package_composition

Communication manual-review rows:

- seed_6b_07_whatsapp_inbound_routing
- seed_6b_07_email_connected_inbox
- seed_6b_07_email_shared_inbox

## ADL Summary

Seed enforcement ADL refs:

| ADL | Count |
|---|---:|
| ADL-004 | 6 |
| ADL-013 | 2 |
| ADL-014 | 1 |
| ADL-015 | 2 |
| ADL-016 | 2 |
| ADL-018 | 1 |
| ADL-021 | 1 |

Seed evidence-only ADL refs:

| ADL | Count |
|---|---:|
| ADL-004 | 1 |

Edge ADL refs:

| ADL | Count |
|---|---:|
| ADL-004 | 6 |
| ADL-021 | 1 |

## Explicit Non-Authorization

- ticket_generation_allowed remains false.
- ticket_pack_generation_allowed remains false.
- No Phase 6C, 6D, 6E, or 6F repair is performed in v5.
- Manual-review blockers must be resolved before ticket planning.

## Final Status

PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
