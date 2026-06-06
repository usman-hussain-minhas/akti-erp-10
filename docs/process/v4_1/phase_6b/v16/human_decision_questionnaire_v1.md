# Phase 6B v10 Human Decision Questionnaire

Status: PHASE_6B_V10_TICKETABILITY_READY_FOR_HUMAN_DECISION_REVIEW

This is not a ticket pack. It converts the v9 blocker registry into reviewable human decisions.

Blocker count: 138
Question count: 138

## Blocker Type Distribution

- pricing_classification: 24
- communication_send_semantics: 10
- api_key_scope_direction: 66
- pricing_anchor_selection: 10
- target_selection_manual_review: 17
- fidelity_blocker: 11

## Doctrine Guardrails

- Implementation is not stale by itself. Tickets become stale.
- Apply maximum concrete capability within the approved scope of each ticket.

## Questions

### hdq_6b_v10_0001

- blocker_id: blk_v8_sdm_0001
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_fixed_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0002

- blocker_id: blk_v8_sdm_0002
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_tiered_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_tiered_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0003

- blocker_id: blk_v8_sdm_0003
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_volume_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_volume_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0004

- blocker_id: blk_v8_sdm_0004
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_unit_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_unit_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0005

- blocker_id: blk_v8_sdm_0005
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_hour_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_hour_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0006

- blocker_id: blk_v8_sdm_0006
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_period_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_period_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0007

- blocker_id: blk_v8_sdm_0007
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_early_bird_pricing_deadline
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_early_bird_pricing_deadline -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0008

- blocker_id: blk_v8_sdm_0008
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_bundle_package_composition
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_bundle_package_composition -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0009

- blocker_id: blk_v8_sdm_0009
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_whatsapp_inbound_routing
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Communication surface may involve outbound replies/operator sends, but the source does not prove that this child seed itself owns send enforcement. Manual review is required before ticket planning.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_whatsapp_inbound_routing -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0010

- blocker_id: blk_v8_sdm_0010
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_email_connected_inbox
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Communication surface may involve outbound replies/operator sends, but the source does not prove that this child seed itself owns send enforcement. Manual review is required before ticket planning.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_email_connected_inbox -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0011

- blocker_id: blk_v8_sdm_0011
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_email_shared_inbox
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: email_shared_inbox outbound send-enforcement role remains unresolved in v7; outbound gateway edge is manual-review, not hard dependency.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0012

- blocker_id: blk_v8_sdm_0012
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_jazzcash_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0013

- blocker_id: blk_v8_sdm_0013
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_easypaisa_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0014

- blocker_id: blk_v8_sdm_0014
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_raast_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0015

- blocker_id: blk_v8_sdm_0015
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_quickpay_shadow_account_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0016

- blocker_id: blk_v8_sdm_0016
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_stripe_gateway_3ds
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0017

- blocker_id: blk_v8_sdm_0017
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_wise_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0018

- blocker_id: blk_v8_sdm_0018
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_manual_reconciliation_path
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0019

- blocker_id: blk_v8_sdm_0019
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0020

- blocker_id: blk_v8_sdm_0020
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_refund_to_original_method
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0021

- blocker_id: blk_v8_sdm_0021
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_top_up_prepaid_credit
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0022

- blocker_id: blk_v8_subsurface_0022
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_fixed_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0023

- blocker_id: blk_v8_subsurface_0023
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_tiered_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_tiered_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0024

- blocker_id: blk_v8_subsurface_0024
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_volume_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_volume_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0025

- blocker_id: blk_v8_subsurface_0025
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_unit_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_unit_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0026

- blocker_id: blk_v8_subsurface_0026
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_hour_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_hour_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0027

- blocker_id: blk_v8_subsurface_0027
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_period_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_period_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0028

- blocker_id: blk_v8_subsurface_0028
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_early_bird_pricing_deadline
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_early_bird_pricing_deadline -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0029

- blocker_id: blk_v8_subsurface_0029
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_bundle_package_composition
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_bundle_package_composition -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0030

- blocker_id: blk_v8_subsurface_0030
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_whatsapp_inbound_routing
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Communication surface may involve outbound replies/operator sends, but the source does not prove that this child seed itself owns send enforcement. Manual review is required before ticket planning.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_whatsapp_inbound_routing -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0031

- blocker_id: blk_v8_subsurface_0031
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_email_connected_inbox
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Communication surface may involve outbound replies/operator sends, but the source does not prove that this child seed itself owns send enforcement. Manual review is required before ticket planning.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_email_connected_inbox -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0032

- blocker_id: blk_v8_subsurface_0032
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_email_shared_inbox
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: email_shared_inbox outbound send-enforcement role remains unresolved in v7; outbound gateway edge is manual-review, not hard dependency.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0033

- blocker_id: blk_v8_subsurface_0033
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_jazzcash_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0034

- blocker_id: blk_v8_subsurface_0034
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_easypaisa_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0035

- blocker_id: blk_v8_subsurface_0035
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_raast_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0036

- blocker_id: blk_v8_subsurface_0036
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_quickpay_shadow_account_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0037

- blocker_id: blk_v8_subsurface_0037
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_stripe_gateway_3ds
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0038

- blocker_id: blk_v8_subsurface_0038
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_wise_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0039

- blocker_id: blk_v8_subsurface_0039
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_manual_reconciliation_path
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0040

- blocker_id: blk_v8_subsurface_0040
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0041

- blocker_id: blk_v8_subsurface_0041
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_refund_to_original_method
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0042

- blocker_id: blk_v8_subsurface_0042
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_top_up_prepaid_credit
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0043

- blocker_id: blk_v8_tdm_0043
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.03 Inventory and Stock Movement Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0044

- blocker_id: blk_v8_tdm_0044
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.03 Inventory and Stock Movement Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0045

- blocker_id: blk_v8_tdm_0045
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.03 Inventory and Stock Movement Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0046

- blocker_id: blk_v8_tdm_0046
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.03 Inventory and Stock Movement Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0047

- blocker_id: blk_v8_tdm_0047
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.03 Inventory and Stock Movement Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0048

- blocker_id: blk_v8_tdm_0048
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.09 Finance Invoice and Receivables Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0049

- blocker_id: blk_v8_tdm_0049
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.09 Finance Invoice and Receivables Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0050

- blocker_id: blk_v8_tdm_0050
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.09 Finance Invoice and Receivables Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0051

- blocker_id: blk_v8_tdm_0051
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.09 Finance Invoice and Receivables Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0052

- blocker_id: blk_v8_tdm_0052
- blocker_type: pricing_anchor_selection
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.09 Finance Invoice and Receivables Service
- required_human_decision: Selected target seed_6b_02_fixed_pricing_model may be acting as an implicit proxy for the general 6B.02 pricing capability. v8 requires PRICING_ANCHOR_DECISION_ACCEPTED, another source-grounded anchor, or continued manual review.
- allowed_decision_tokens: PRICING_ANCHOR_DECISION_ACCEPTED
- current_conservative_handling: Treat selected pricing child target as unresolved; do not use fixed_pricing_model as implicit anchor.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0053

- blocker_id: blk_v8_tdm_0053
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0054

- blocker_id: blk_v8_tdm_0054
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0055

- blocker_id: blk_v8_tdm_0055
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0056

- blocker_id: blk_v8_tdm_0056
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0057

- blocker_id: blk_v8_tdm_0057
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0058

- blocker_id: blk_v8_tdm_0058
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0059

- blocker_id: blk_v8_tdm_0059
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0060

- blocker_id: blk_v8_tdm_0060
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0061

- blocker_id: blk_v8_tdm_0061
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0062

- blocker_id: blk_v8_tdm_0062
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6a_api_key_scope_registry
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Target selection is manual-review required and cannot be reported as READY without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0063

- blocker_id: blk_v8_tdm_0063
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.11 Expense, Purchase, and Vendor Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0064

- blocker_id: blk_v8_tdm_0064
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.11 Expense, Purchase, and Vendor Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0065

- blocker_id: blk_v8_tdm_0065
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.11 Expense, Purchase, and Vendor Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0066

- blocker_id: blk_v8_tdm_0066
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.11 Expense, Purchase, and Vendor Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0067

- blocker_id: blk_v8_tdm_0067
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.11 Expense, Purchase, and Vendor Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0068

- blocker_id: blk_v8_tdm_0068
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.12 General Ledger and Accounting Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0069

- blocker_id: blk_v8_tdm_0069
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.12 General Ledger and Accounting Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0070

- blocker_id: blk_v8_tdm_0070
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.12 General Ledger and Accounting Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0071

- blocker_id: blk_v8_tdm_0071
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.12 General Ledger and Accounting Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0072

- blocker_id: blk_v8_tdm_0072
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.12 General Ledger and Accounting Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0073

- blocker_id: blk_v8_tdm_0073
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.12 General Ledger and Accounting Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0074

- blocker_id: blk_v8_tdm_0074
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.13 Banking and Reconciliation Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0075

- blocker_id: blk_v8_tdm_0075
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.13 Banking and Reconciliation Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0076

- blocker_id: blk_v8_tdm_0076
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.13 Banking and Reconciliation Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0077

- blocker_id: blk_v8_tdm_0077
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.13 Banking and Reconciliation Service
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0078

- blocker_id: blk_v8_tdm_0078
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.14 Finance Payroll Foundation
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0079

- blocker_id: blk_v8_tdm_0079
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.14 Finance Payroll Foundation
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0080

- blocker_id: blk_v8_tdm_0080
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.14 Finance Payroll Foundation
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0081

- blocker_id: blk_v8_tdm_0081
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.14 Finance Payroll Foundation
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0082

- blocker_id: blk_v8_tdm_0082
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.14 Finance Payroll Foundation
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0083

- blocker_id: blk_v8_tdm_0083
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.15 Finance Platform Billing UI and Customer Billing Operations
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0084

- blocker_id: blk_v8_tdm_0084
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.15 Finance Platform Billing UI and Customer Billing Operations
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0085

- blocker_id: blk_v8_tdm_0085
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.15 Finance Platform Billing UI and Customer Billing Operations
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0086

- blocker_id: blk_v8_tdm_0086
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.15 Finance Platform Billing UI and Customer Billing Operations
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0087

- blocker_id: blk_v8_tdm_0087
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.15 Finance Platform Billing UI and Customer Billing Operations
- required_human_decision: Selected child target seed_6b_10_payment_allocation_balance is manual-review blocked, so the dependency cannot be treated as fully resolved.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0088

- blocker_id: blk_v8_dem_0088
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_email_shared_inbox
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0089

- blocker_id: blk_v8_dem_0089
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_jazzcash_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0090

- blocker_id: blk_v8_dem_0090
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_easypaisa_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0091

- blocker_id: blk_v8_dem_0091
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_raast_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0092

- blocker_id: blk_v8_dem_0092
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_quickpay_shadow_account_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0093

- blocker_id: blk_v8_dem_0093
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_stripe_gateway_3ds
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0094

- blocker_id: blk_v8_dem_0094
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_wise_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0095

- blocker_id: blk_v8_dem_0095
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_manual_reconciliation_path
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0096

- blocker_id: blk_v8_dem_0096
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0097

- blocker_id: blk_v8_dem_0097
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_refund_to_original_method
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0098

- blocker_id: blk_v8_dem_0098
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_top_up_prepaid_credit
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0099

- blocker_id: blk_v8_dem_0099
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6b_03_stock_level_location_authority
- affected_component: 6B.03 Inventory and Stock Movement Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0100

- blocker_id: blk_v8_dem_0100
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6b_06_pipeline_stage_model
- affected_component: 6B.06 CRM Pipeline and Timeline Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0101

- blocker_id: blk_v8_dem_0101
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6b_07_whatsapp_template_management
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0102

- blocker_id: blk_v8_dem_0102
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6b_09_invoice_record_authority
- affected_component: 6B.09 Finance Invoice and Receivables Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0103

- blocker_id: blk_v8_dem_0103
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_jazzcash_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0104

- blocker_id: blk_v8_dem_0104
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6b_11_expense_record_authority
- affected_component: 6B.11 Expense, Purchase, and Vendor Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0105

- blocker_id: blk_v8_dem_0105
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6b_12_chart_of_accounts
- affected_component: 6B.12 General Ledger and Accounting Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0106

- blocker_id: blk_v8_dem_0106
- blocker_type: target_selection_manual_review
- affected_seed_id: seed_6b_13_bank_statement_import
- affected_component: 6B.13 Banking and Reconciliation Service
- required_human_decision: Dependency edge remains manual-review required and cannot be promoted to a resolved hard dependency without an accepted decision token.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Keep target-selection row manual-review blocked.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0107

- blocker_id: blk_v8_esm_seed_0107
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_fixed_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_fixed_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0108

- blocker_id: blk_v8_esm_seed_0108
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_tiered_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_tiered_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0109

- blocker_id: blk_v8_esm_seed_0109
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_volume_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_volume_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0110

- blocker_id: blk_v8_esm_seed_0110
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_unit_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_unit_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0111

- blocker_id: blk_v8_esm_seed_0111
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_hour_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_hour_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0112

- blocker_id: blk_v8_esm_seed_0112
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_per_period_pricing_model
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_per_period_pricing_model -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0113

- blocker_id: blk_v8_esm_seed_0113
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_early_bird_pricing_deadline
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_early_bird_pricing_deadline -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0114

- blocker_id: blk_v8_esm_seed_0114
- blocker_type: pricing_classification
- affected_seed_id: seed_6b_02_bundle_package_composition
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Pricing model family reclassification requires explicit human confirmation before ticket-pack planning; v3 keeps the non-manifest configuration-extension model but does not mark it final for execution.
- allowed_decision_tokens: PRICING_DECISION_ACCEPTED: seed_6b_02_bundle_package_composition -> configuration_extension
- current_conservative_handling: Keep pricing split surface manual-review blocked and not ticket-pack ready.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0115

- blocker_id: blk_v8_esm_seed_0115
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_whatsapp_inbound_routing
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Communication surface may involve outbound replies/operator sends, but the source does not prove that this child seed itself owns send enforcement. Manual review is required before ticket planning.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_whatsapp_inbound_routing -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0116

- blocker_id: blk_v8_esm_seed_0116
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_email_connected_inbox
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Communication surface may involve outbound replies/operator sends, but the source does not prove that this child seed itself owns send enforcement. Manual review is required before ticket planning.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_email_connected_inbox -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0117

- blocker_id: blk_v8_esm_seed_0117
- blocker_type: communication_send_semantics
- affected_seed_id: seed_6b_07_email_shared_inbox
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: email_shared_inbox outbound send-enforcement role remains unresolved in v7; outbound gateway edge is manual-review, not hard dependency.
- allowed_decision_tokens: COMM_DECISION_ACCEPTED: seed_6b_07_email_shared_inbox -> source_grounded_send_semantics
- current_conservative_handling: Keep communication send semantics manual-review blocked and do not authorize ticket planning.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0118

- blocker_id: blk_v8_esm_seed_0118
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_jazzcash_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0119

- blocker_id: blk_v8_esm_seed_0119
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_easypaisa_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0120

- blocker_id: blk_v8_esm_seed_0120
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_raast_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0121

- blocker_id: blk_v8_esm_seed_0121
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_quickpay_shadow_account_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0122

- blocker_id: blk_v8_esm_seed_0122
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_stripe_gateway_3ds
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0123

- blocker_id: blk_v8_esm_seed_0123
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_wise_gateway
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0124

- blocker_id: blk_v8_esm_seed_0124
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_manual_reconciliation_path
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0125

- blocker_id: blk_v8_esm_seed_0125
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_payment_allocation_balance
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0126

- blocker_id: blk_v8_esm_seed_0126
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_refund_to_original_method
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0127

- blocker_id: blk_v8_esm_seed_0127
- blocker_type: api_key_scope_direction
- affected_seed_id: seed_6b_10_top_up_prepaid_credit
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: 6B.10 API-key scope direction remains unresolved in v7; no consume-registry decision token is present. Ticket planning is blocked for this seed.
- allowed_decision_tokens: API_KEY_SCOPE_DECISION_ACCEPTED: 6B.10 -> consume_registry|publish_register_only|unresolved_manual_review
- current_conservative_handling: Keep API-key scope direction unresolved as manual review; no hard consume dependency is inferred.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0128

- blocker_id: blk_v8_dfm_0128
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.02 Product Pricing and Package Service
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0129

- blocker_id: blk_v8_dfm_0129
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.03 Inventory and Stock Movement Service
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0130

- blocker_id: blk_v8_dfm_0130
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.06 CRM Pipeline and Timeline Service
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0131

- blocker_id: blk_v8_dfm_0131
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.07 CRM Communication Engines
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0132

- blocker_id: blk_v8_dfm_0132
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.09 Finance Invoice and Receivables Service
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0133

- blocker_id: blk_v8_dfm_0133
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.10 Payment, Collection, and Top-Up Service
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0134

- blocker_id: blk_v8_dfm_0134
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.11 Expense, Purchase, and Vendor Service
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0135

- blocker_id: blk_v8_dfm_0135
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.12 General Ledger and Accounting Service
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0136

- blocker_id: blk_v8_dfm_0136
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.13 Banking and Reconciliation Service
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0137

- blocker_id: blk_v8_dfm_0137
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.14 Finance Payroll Foundation
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED

### hdq_6b_v10_0138

- blocker_id: blk_v8_dfm_0138
- blocker_type: fidelity_blocker
- affected_seed_id: none
- affected_component: 6B.15 Finance Platform Billing UI and Customer Billing Operations
- required_human_decision: Review blocker-aware fidelity state and resolve selected manual-review child targets before acceptance or ticket planning.
- allowed_decision_tokens: MANUAL_TARGET_SELECTION_DECISION_ACCEPTED
- current_conservative_handling: Represent fidelity as blocker-aware rather than fully resolved.
- ticket_pack_impact: ticket_pack_generation_allowed=false; ticket_generation_allowed=false until this blocker is resolved after manual review.
- final_status: MANUAL_REVIEW_REQUIRED
