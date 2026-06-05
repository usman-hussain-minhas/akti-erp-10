# Phase 6B v11 Human Decision Answer Register

Status: `PHASE_6B_V11_DECISIONS_APPLIED_READY_FOR_TICKET_PACK_PLANNING_REVIEW`

Source answer file: `/Users/usman/Downloads/questions_answered_b6_v3.md`

Coverage: `138/138` v10 blockers answered.

Raw uploaded line references are evidence only; v11 operational authority uses section-level source rules from `0_business_logic.md` and `6b_commerce_core.md`.

| # | Blocker ID | Type | Affected seed | Decision | Token |
| --- | --- | --- | --- | --- | --- |
| 1 | `blk_v8_sdm_0001` | `pricing_classification` | `seed_6b_02_fixed_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_fixed_pricing_model -> configuration_extension` |
| 2 | `blk_v8_sdm_0002` | `pricing_classification` | `seed_6b_02_tiered_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_tiered_pricing_model -> configuration_extension` |
| 3 | `blk_v8_sdm_0003` | `pricing_classification` | `seed_6b_02_volume_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_volume_pricing_model -> configuration_extension` |
| 4 | `blk_v8_sdm_0004` | `pricing_classification` | `seed_6b_02_per_unit_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_unit_pricing_model -> configuration_extension` |
| 5 | `blk_v8_sdm_0005` | `pricing_classification` | `seed_6b_02_per_hour_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_hour_pricing_model -> configuration_extension` |
| 6 | `blk_v8_sdm_0006` | `pricing_classification` | `seed_6b_02_per_period_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_period_pricing_model -> configuration_extension` |
| 7 | `blk_v8_sdm_0007` | `pricing_classification` | `seed_6b_02_early_bird_pricing_deadline` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_early_bird_pricing_deadline -> configuration_extension` |
| 8 | `blk_v8_sdm_0008` | `pricing_classification` | `seed_6b_02_bundle_package_composition` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_bundle_package_composition -> configuration_extension` |
| 9 | `blk_v8_sdm_0009` | `communication_send_semantics` | `seed_6b_07_whatsapp_inbound_routing` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_whatsapp_inbound_routing -> non_send_setup_surface` |
| 10 | `blk_v8_sdm_0010` | `communication_send_semantics` | `seed_6b_07_email_connected_inbox` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_email_connected_inbox -> non_send_setup_surface` |
| 11 | `blk_v8_sdm_0011` | `communication_send_semantics` | `seed_6b_07_email_shared_inbox` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> send_enforcement_surface` |
| 12 | `blk_v8_sdm_0012` | `api_key_scope_direction` | `seed_6b_10_jazzcash_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_jazzcash_gateway -> consume_registry` |
| 13 | `blk_v8_sdm_0013` | `api_key_scope_direction` | `seed_6b_10_easypaisa_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_easypaisa_gateway -> consume_registry` |
| 14 | `blk_v8_sdm_0014` | `api_key_scope_direction` | `seed_6b_10_raast_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_raast_gateway -> consume_registry` |
| 15 | `blk_v8_sdm_0015` | `api_key_scope_direction` | `seed_6b_10_quickpay_shadow_account_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_quickpay_shadow_account_gateway -> consume_registry` |
| 16 | `blk_v8_sdm_0016` | `api_key_scope_direction` | `seed_6b_10_stripe_gateway_3ds` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_stripe_gateway_3ds -> consume_registry` |
| 17 | `blk_v8_sdm_0017` | `api_key_scope_direction` | `seed_6b_10_wise_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_wise_gateway -> consume_registry` |
| 18 | `blk_v8_sdm_0018` | `api_key_scope_direction` | `seed_6b_10_manual_reconciliation_path` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_manual_reconciliation_path -> no_api_key_dependency` |
| 19 | `blk_v8_sdm_0019` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 20 | `blk_v8_sdm_0020` | `api_key_scope_direction` | `seed_6b_10_refund_to_original_method` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_refund_to_original_method -> consume_registry` |
| 21 | `blk_v8_sdm_0021` | `api_key_scope_direction` | `seed_6b_10_top_up_prepaid_credit` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_top_up_prepaid_credit -> consume_registry` |
| 22 | `blk_v8_subsurface_0022` | `pricing_classification` | `seed_6b_02_fixed_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_fixed_pricing_model -> configuration_extension` |
| 23 | `blk_v8_subsurface_0023` | `pricing_classification` | `seed_6b_02_tiered_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_tiered_pricing_model -> configuration_extension` |
| 24 | `blk_v8_subsurface_0024` | `pricing_classification` | `seed_6b_02_volume_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_volume_pricing_model -> configuration_extension` |
| 25 | `blk_v8_subsurface_0025` | `pricing_classification` | `seed_6b_02_per_unit_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_unit_pricing_model -> configuration_extension` |
| 26 | `blk_v8_subsurface_0026` | `pricing_classification` | `seed_6b_02_per_hour_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_hour_pricing_model -> configuration_extension` |
| 27 | `blk_v8_subsurface_0027` | `pricing_classification` | `seed_6b_02_per_period_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_period_pricing_model -> configuration_extension` |
| 28 | `blk_v8_subsurface_0028` | `pricing_classification` | `seed_6b_02_early_bird_pricing_deadline` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_early_bird_pricing_deadline -> configuration_extension` |
| 29 | `blk_v8_subsurface_0029` | `pricing_classification` | `seed_6b_02_bundle_package_composition` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_bundle_package_composition -> configuration_extension` |
| 30 | `blk_v8_subsurface_0030` | `communication_send_semantics` | `seed_6b_07_whatsapp_inbound_routing` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_whatsapp_inbound_routing -> non_send_setup_surface` |
| 31 | `blk_v8_subsurface_0031` | `communication_send_semantics` | `seed_6b_07_email_connected_inbox` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_email_connected_inbox -> non_send_setup_surface` |
| 32 | `blk_v8_subsurface_0032` | `communication_send_semantics` | `seed_6b_07_email_shared_inbox` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> send_enforcement_surface` |
| 33 | `blk_v8_subsurface_0033` | `api_key_scope_direction` | `seed_6b_10_jazzcash_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_jazzcash_gateway -> consume_registry` |
| 34 | `blk_v8_subsurface_0034` | `api_key_scope_direction` | `seed_6b_10_easypaisa_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_easypaisa_gateway -> consume_registry` |
| 35 | `blk_v8_subsurface_0035` | `api_key_scope_direction` | `seed_6b_10_raast_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_raast_gateway -> consume_registry` |
| 36 | `blk_v8_subsurface_0036` | `api_key_scope_direction` | `seed_6b_10_quickpay_shadow_account_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_quickpay_shadow_account_gateway -> consume_registry` |
| 37 | `blk_v8_subsurface_0037` | `api_key_scope_direction` | `seed_6b_10_stripe_gateway_3ds` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_stripe_gateway_3ds -> consume_registry` |
| 38 | `blk_v8_subsurface_0038` | `api_key_scope_direction` | `seed_6b_10_wise_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_wise_gateway -> consume_registry` |
| 39 | `blk_v8_subsurface_0039` | `api_key_scope_direction` | `seed_6b_10_manual_reconciliation_path` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_manual_reconciliation_path -> no_api_key_dependency` |
| 40 | `blk_v8_subsurface_0040` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 41 | `blk_v8_subsurface_0041` | `api_key_scope_direction` | `seed_6b_10_refund_to_original_method` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_refund_to_original_method -> consume_registry` |
| 42 | `blk_v8_subsurface_0042` | `api_key_scope_direction` | `seed_6b_10_top_up_prepaid_credit` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_top_up_prepaid_credit -> consume_registry` |
| 43 | `blk_v8_tdm_0043` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 44 | `blk_v8_tdm_0044` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 45 | `blk_v8_tdm_0045` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 46 | `blk_v8_tdm_0046` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 47 | `blk_v8_tdm_0047` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 48 | `blk_v8_tdm_0048` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 49 | `blk_v8_tdm_0049` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 50 | `blk_v8_tdm_0050` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 51 | `blk_v8_tdm_0051` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 52 | `blk_v8_tdm_0052` | `pricing_anchor_selection` | `seed_6b_02_fixed_pricing_model` | `ACCEPT_STRUCTURAL_ADD` | `PRICING_ANCHOR_DECISION_ACCEPTED: 6B.02 -> seed_6b_02_product_price_history_effective_dates` |
| 53 | `blk_v8_tdm_0053` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 54 | `blk_v8_tdm_0054` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 55 | `blk_v8_tdm_0055` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 56 | `blk_v8_tdm_0056` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 57 | `blk_v8_tdm_0057` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 58 | `blk_v8_tdm_0058` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 59 | `blk_v8_tdm_0059` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 60 | `blk_v8_tdm_0060` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 61 | `blk_v8_tdm_0061` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 62 | `blk_v8_tdm_0062` | `target_selection_manual_review` | `seed_6a_api_key_scope_registry` | `ACCEPT_CANONICAL_ANCHOR` | `API_KEY_SCOPE_TARGET_DECISION_ACCEPTED: seed_6a_api_key_scope_registry consumed only by provider/processing 6B.10 surfaces` |
| 63 | `blk_v8_tdm_0063` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 64 | `blk_v8_tdm_0064` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 65 | `blk_v8_tdm_0065` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 66 | `blk_v8_tdm_0066` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 67 | `blk_v8_tdm_0067` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 68 | `blk_v8_tdm_0068` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 69 | `blk_v8_tdm_0069` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 70 | `blk_v8_tdm_0070` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 71 | `blk_v8_tdm_0071` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 72 | `blk_v8_tdm_0072` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 73 | `blk_v8_tdm_0073` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 74 | `blk_v8_tdm_0074` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 75 | `blk_v8_tdm_0075` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 76 | `blk_v8_tdm_0076` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 77 | `blk_v8_tdm_0077` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 78 | `blk_v8_tdm_0078` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 79 | `blk_v8_tdm_0079` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 80 | `blk_v8_tdm_0080` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 81 | `blk_v8_tdm_0081` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 82 | `blk_v8_tdm_0082` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 83 | `blk_v8_tdm_0083` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 84 | `blk_v8_tdm_0084` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 85 | `blk_v8_tdm_0085` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 86 | `blk_v8_tdm_0086` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 87 | `blk_v8_tdm_0087` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 88 | `blk_v8_dem_0088` | `communication_send_semantics` | `seed_6b_07_email_shared_inbox` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> send_enforcement_surface` |
| 89 | `blk_v8_dem_0089` | `api_key_scope_direction` | `seed_6b_10_jazzcash_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_jazzcash_gateway -> consume_registry` |
| 90 | `blk_v8_dem_0090` | `api_key_scope_direction` | `seed_6b_10_easypaisa_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_easypaisa_gateway -> consume_registry` |
| 91 | `blk_v8_dem_0091` | `api_key_scope_direction` | `seed_6b_10_raast_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_raast_gateway -> consume_registry` |
| 92 | `blk_v8_dem_0092` | `api_key_scope_direction` | `seed_6b_10_quickpay_shadow_account_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_quickpay_shadow_account_gateway -> consume_registry` |
| 93 | `blk_v8_dem_0093` | `api_key_scope_direction` | `seed_6b_10_stripe_gateway_3ds` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_stripe_gateway_3ds -> consume_registry` |
| 94 | `blk_v8_dem_0094` | `api_key_scope_direction` | `seed_6b_10_wise_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_wise_gateway -> consume_registry` |
| 95 | `blk_v8_dem_0095` | `api_key_scope_direction` | `seed_6b_10_manual_reconciliation_path` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_manual_reconciliation_path -> no_api_key_dependency` |
| 96 | `blk_v8_dem_0096` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 97 | `blk_v8_dem_0097` | `api_key_scope_direction` | `seed_6b_10_refund_to_original_method` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_refund_to_original_method -> consume_registry` |
| 98 | `blk_v8_dem_0098` | `api_key_scope_direction` | `seed_6b_10_top_up_prepaid_credit` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_top_up_prepaid_credit -> consume_registry` |
| 99 | `blk_v8_dem_0099` | `target_selection_manual_review` | `seed_6b_03_stock_level_location_authority` | `ACCEPT` | `MANUAL_TARGET_SELECTION_DECISION_ACCEPTED: seed_6b_03_stock_level_location_authority -> canonical_inventory_anchor` |
| 100 | `blk_v8_dem_0100` | `target_selection_manual_review` | `seed_6b_06_pipeline_stage_model` | `ACCEPT` | `MANUAL_TARGET_SELECTION_DECISION_ACCEPTED: seed_6b_06_pipeline_stage_model -> canonical_crm_pipeline_anchor` |
| 101 | `blk_v8_dem_0101` | `target_selection_manual_review` | `seed_6b_07_whatsapp_template_management` | `ACCEPT_CANONICAL_ANCHOR` | `MANUAL_TARGET_SELECTION_DECISION_ACCEPTED: 6B.07 -> communication_attempt_evidence (evidence) / specific send surfaces (send)` |
| 102 | `blk_v8_dem_0102` | `target_selection_manual_review` | `seed_6b_09_invoice_record_authority` | `ACCEPT` | `MANUAL_TARGET_SELECTION_DECISION_ACCEPTED: seed_6b_09_invoice_record_authority -> canonical_invoice_receivables_anchor` |
| 103 | `blk_v8_dem_0103` | `api_key_scope_direction` | `seed_6b_10_jazzcash_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_jazzcash_gateway -> consume_registry` |
| 104 | `blk_v8_dem_0104` | `target_selection_manual_review` | `seed_6b_11_expense_record_authority` | `ACCEPT` | `MANUAL_TARGET_SELECTION_DECISION_ACCEPTED: seed_6b_11_expense_record_authority -> canonical_expense_purchase_vendor_anchor` |
| 105 | `blk_v8_dem_0105` | `target_selection_manual_review` | `seed_6b_12_chart_of_accounts` | `ACCEPT_CANONICAL_ANCHOR` | `MANUAL_TARGET_SELECTION_DECISION_ACCEPTED: 6B.12 -> seed_6b_12_journal_entry_engine (GL posting); chart_of_accounts stays internal` |
| 106 | `blk_v8_dem_0106` | `target_selection_manual_review` | `seed_6b_13_bank_statement_import` | `ACCEPT_CANONICAL_ANCHOR` | `MANUAL_TARGET_SELECTION_DECISION_ACCEPTED: 6B.13 -> seed_6b_13_reconciliation_matching (banking anchor); bank_statement_import stays import subflow` |
| 107 | `blk_v8_esm_seed_0107` | `pricing_classification` | `seed_6b_02_fixed_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_fixed_pricing_model -> configuration_extension` |
| 108 | `blk_v8_esm_seed_0108` | `pricing_classification` | `seed_6b_02_tiered_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_tiered_pricing_model -> configuration_extension` |
| 109 | `blk_v8_esm_seed_0109` | `pricing_classification` | `seed_6b_02_volume_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_volume_pricing_model -> configuration_extension` |
| 110 | `blk_v8_esm_seed_0110` | `pricing_classification` | `seed_6b_02_per_unit_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_unit_pricing_model -> configuration_extension` |
| 111 | `blk_v8_esm_seed_0111` | `pricing_classification` | `seed_6b_02_per_hour_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_hour_pricing_model -> configuration_extension` |
| 112 | `blk_v8_esm_seed_0112` | `pricing_classification` | `seed_6b_02_per_period_pricing_model` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_per_period_pricing_model -> configuration_extension` |
| 113 | `blk_v8_esm_seed_0113` | `pricing_classification` | `seed_6b_02_early_bird_pricing_deadline` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_early_bird_pricing_deadline -> configuration_extension` |
| 114 | `blk_v8_esm_seed_0114` | `pricing_classification` | `seed_6b_02_bundle_package_composition` | `ACCEPT` | `PRICING_DECISION_ACCEPTED: seed_6b_02_bundle_package_composition -> configuration_extension` |
| 115 | `blk_v8_esm_seed_0115` | `communication_send_semantics` | `seed_6b_07_whatsapp_inbound_routing` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_whatsapp_inbound_routing -> non_send_setup_surface` |
| 116 | `blk_v8_esm_seed_0116` | `communication_send_semantics` | `seed_6b_07_email_connected_inbox` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_email_connected_inbox -> non_send_setup_surface` |
| 117 | `blk_v8_esm_seed_0117` | `communication_send_semantics` | `seed_6b_07_email_shared_inbox` | `ACCEPT` | `COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> send_enforcement_surface` |
| 118 | `blk_v8_esm_seed_0118` | `api_key_scope_direction` | `seed_6b_10_jazzcash_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_jazzcash_gateway -> consume_registry` |
| 119 | `blk_v8_esm_seed_0119` | `api_key_scope_direction` | `seed_6b_10_easypaisa_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_easypaisa_gateway -> consume_registry` |
| 120 | `blk_v8_esm_seed_0120` | `api_key_scope_direction` | `seed_6b_10_raast_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_raast_gateway -> consume_registry` |
| 121 | `blk_v8_esm_seed_0121` | `api_key_scope_direction` | `seed_6b_10_quickpay_shadow_account_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_quickpay_shadow_account_gateway -> consume_registry` |
| 122 | `blk_v8_esm_seed_0122` | `api_key_scope_direction` | `seed_6b_10_stripe_gateway_3ds` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_stripe_gateway_3ds -> consume_registry` |
| 123 | `blk_v8_esm_seed_0123` | `api_key_scope_direction` | `seed_6b_10_wise_gateway` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_wise_gateway -> consume_registry` |
| 124 | `blk_v8_esm_seed_0124` | `api_key_scope_direction` | `seed_6b_10_manual_reconciliation_path` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_manual_reconciliation_path -> no_api_key_dependency` |
| 125 | `blk_v8_esm_seed_0125` | `api_key_scope_direction` | `seed_6b_10_payment_allocation_balance` | `REJECT_API_KEY_DEPENDENCY` | `API_KEY_SCOPE_DECISION_REJECTED: seed_6b_10_payment_allocation_balance -> no_api_key_dependency` |
| 126 | `blk_v8_esm_seed_0126` | `api_key_scope_direction` | `seed_6b_10_refund_to_original_method` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_refund_to_original_method -> consume_registry` |
| 127 | `blk_v8_esm_seed_0127` | `api_key_scope_direction` | `seed_6b_10_top_up_prepaid_credit` | `ACCEPT` | `API_KEY_SCOPE_DECISION_ACCEPTED: seed_6b_10_top_up_prepaid_credit -> consume_registry` |
| 128 | `blk_v8_dfm_0128` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 129 | `blk_v8_dfm_0129` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 130 | `blk_v8_dfm_0130` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 131 | `blk_v8_dfm_0131` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 132 | `blk_v8_dfm_0132` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 133 | `blk_v8_dfm_0133` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 134 | `blk_v8_dfm_0134` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 135 | `blk_v8_dfm_0135` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 136 | `blk_v8_dfm_0136` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 137 | `blk_v8_dfm_0137` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
| 138 | `blk_v8_dfm_0138` | `fidelity_blocker` | `none` | `ACCEPT` | `FIDELITY_DECISION_ACCEPTED: set DFM row to RESOLVED_MATCH after the referenced source-grounded decisions are applied` |
