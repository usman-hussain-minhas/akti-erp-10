# Phase 6B v3 Semantic Derivation Audit v1

Status: READY

## Current Final State Summary

Source components: 15
Sub-surfaces: 102
Seeds: 102
Dependency edges: 451
Extraction edges: 451
Extraction edge distribution: hard_dependency=443 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=8
Top-level seed dependency references: 443
Root seeds: 0
Current root seeds: []

## v3 Semantic Checks

manifest_required true=84, false=18
foundry_activation_required true=83, false=19
service_manifest_contract dependency count=84
pricing manual_review_required rows=8
ADL-021 model: anchor-only on seed_6b_04_unified_lead_record_authority
ADL-004 model: outbound gateway dependency on seed_6a_outbound_gateway_enforcement
Semantic derivation to subsurface/seed parity: PASS
Pricing human-confirmation contradiction: RESOLVED_WITH_MANUAL_REVIEW_REQUIRED

Result: READY
