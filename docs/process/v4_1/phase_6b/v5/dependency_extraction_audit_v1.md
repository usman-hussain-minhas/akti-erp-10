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

## Summary

Dependency edges: 450
Distribution: hard_dependency=442 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=8

## ADL-004 Edge Carriers

- seed_6b_07_whatsapp_outbound_window->seed_6a_outbound_gateway_enforcement
- seed_6b_07_whatsapp_broadcast_compliance->seed_6a_outbound_gateway_enforcement
- seed_6b_07_whatsapp_auto_reply_keywords->seed_6a_outbound_gateway_enforcement
- seed_6b_07_email_transactional_domain->seed_6a_outbound_gateway_enforcement
- seed_6b_07_email_sequences->seed_6a_outbound_gateway_enforcement
- seed_6b_07_email_shared_inbox->seed_6a_outbound_gateway_enforcement

## Gates

| Gate | Result |
|---|---|
| service_manifest_contract edges carry no behavioral ADLs | PASS: count 0 |
| non-send setup surface does not carry ADL-004 enforcement edge | PASS |
| ambiguous communication surfaces are blockers, not ticket-ready seeds | PASS |
| dependency extraction and seed dependencies align | PASS |

## Final Status

PHASE_6B_V5_READY_FOR_TARGETED_MANUAL_REVIEW_WITH_BLOCKERS
