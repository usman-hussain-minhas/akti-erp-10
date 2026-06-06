# Phase 6B v5 Semantic Repair Status

Status: PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS

This v5 artifact is not ticket-pack ready and does not authorize ticket generation. Pricing manual-review rows and unresolved communication manual-review rows block ticket planning.

## Semantic Derivation Audit Result

Result: READY_WITH_MANUAL_REVIEW_BLOCKERS

## v5 Checks

| Check | Result |
|---|---|
| communication_surface_classification present for 6B.07 seeds | PASS |
| manual_review_surface implies manual_review_required=true | PASS |
| ADL-004 limited to send-enforcement, evidence-trace, or manual-review semantics | PASS |
| communication_attempt_evidence uses adl_evidence_refs, not enforcement adl_refs | PASS |
| service_manifest_contract edges carry behavioral ADLs | PASS: count 0 |
| pricing blockers remain visible | PASS: 8 rows |
| ticket_pack_generation_allowed | PASS: not authorized |

## Communication Surface Distribution

| Classification | Count |
|---|---:|
| evidence_trace_surface | 1 |
| manual_review_surface | 3 |
| non_send_setup_surface | 1 |
| send_enforcement_surface | 5 |

## Manual Review Rows

Manual review rows total: 11

Communication manual-review rows:

- seed_6b_07_whatsapp_inbound_routing
- seed_6b_07_email_connected_inbox
- seed_6b_07_email_shared_inbox

Pricing manual-review rows:

- seed_6b_02_fixed_pricing_model
- seed_6b_02_tiered_pricing_model
- seed_6b_02_volume_pricing_model
- seed_6b_02_per_unit_pricing_model
- seed_6b_02_per_hour_pricing_model
- seed_6b_02_per_period_pricing_model
- seed_6b_02_early_bird_pricing_deadline
- seed_6b_02_bundle_package_composition

## ADL Model

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

ADL-004 edge carriers:

- seed_6b_07_whatsapp_outbound_window->seed_6a_outbound_gateway_enforcement
- seed_6b_07_whatsapp_broadcast_compliance->seed_6a_outbound_gateway_enforcement
- seed_6b_07_whatsapp_auto_reply_keywords->seed_6a_outbound_gateway_enforcement
- seed_6b_07_email_transactional_domain->seed_6a_outbound_gateway_enforcement
- seed_6b_07_email_sequences->seed_6a_outbound_gateway_enforcement
- seed_6b_07_email_shared_inbox->seed_6a_outbound_gateway_enforcement

## Final Status

PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
