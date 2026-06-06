# Phase 6B v8 Semantic Repair Manual Decisions

## Current Decision State

No new human approval tokens are present in v8. Conservative blocker handling remains active.

## Required Tokens For Acceptance State

Pricing acceptance requires PRICING_DECISION_ACCEPTED tokens for each pricing split seed and PRICING_ANCHOR_DECISION_ACCEPTED for any fixed-pricing anchor proxy.
Communication acceptance requires COMM_DECISION_ACCEPTED tokens for ambiguous send surfaces.
API-key direction acceptance requires API_KEY_SCOPE_DECISION_ACCEPTED for 6B.10.

## Machine-Readable Registry

manual_blocker_registry_v1.json is authoritative for blocker IDs, blocker counts, required human decisions, and ticket-pack impact.
Blocker registry status: BLOCKERS_PRESENT
Blocker count: 138

## Ticket Boundary

Ticket generation allowed: false
Ticket pack generation allowed: false


## v11 applied decision tokens

The v11 decision-application pass applied all 138 answered blocker decisions from `/Users/usman/Downloads/questions_answered_b6_v3.md`. Ticket generation remains forbidden.

- `PRICING_DECISION_ACCEPTED: seed_6b_02_fixed_pricing_model -> configuration_extension`
- `PRICING_DECISION_ACCEPTED: seed_6b_02_tiered_pricing_model -> configuration_extension`
- `PRICING_DECISION_ACCEPTED: seed_6b_02_volume_pricing_model -> configuration_extension`
- `PRICING_DECISION_ACCEPTED: seed_6b_02_per_unit_pricing_model -> configuration_extension`
- `PRICING_DECISION_ACCEPTED: seed_6b_02_per_hour_pricing_model -> configuration_extension`
- `PRICING_DECISION_ACCEPTED: seed_6b_02_per_period_pricing_model -> configuration_extension`
- `PRICING_DECISION_ACCEPTED: seed_6b_02_early_bird_pricing_deadline -> configuration_extension`
- `PRICING_DECISION_ACCEPTED: seed_6b_02_bundle_package_composition -> configuration_extension`
- `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates`
- `COMM_DECISION_ACCEPTED: seed_6b_07_email_connected_inbox -> non_send_setup_surface`
- `COMM_DECISION_ACCEPTED: seed_6b_07_whatsapp_inbound_routing -> non_send_setup_surface`
- `COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> send_enforcement_surface`
- `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_wise_gateway -> consume_registry`
- `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_easypaisa_gateway -> consume_registry`
- `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_quickpay_shadow_account_gateway -> consume_registry`
- `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_jazzcash_gateway -> consume_registry`
- `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_raast_gateway -> consume_registry`
- `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_top_up_prepaid_credit -> consume_registry`
- `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_refund_to_original_method -> consume_registry`
- `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_stripe_gateway_3ds -> consume_registry`
- `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_manual_reconciliation_path -> no_api_key_dependency`
- `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency`
