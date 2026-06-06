# Phase 6B v9 Dependency Extraction Audit

## Summary

Dependency edges: 450
Distribution: hard_dependency=431 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=19
Hard dependency basis distribution: activation_lifecycle_required=84 / business_logic_hard_rule=147 / billing_or_evidence_required=112 / adl_hard_rule=6 / phase_doc_required=82

## Current Final State Summary

Source components: 15
Sub-surfaces: 102
Seeds: 102
Extraction edges: 450
Extraction edge distribution: hard_dependency=431 / deferred_with_reason=0 / conditional_dependency=0 / manual_review_required=19
Top-level seed dependency references: 431
Root seeds: 0
Current root seeds: none
Hard dependency basis distribution: activation_lifecycle_required=84 / business_logic_hard_rule=147 / billing_or_evidence_required=112 / adl_hard_rule=6 / phase_doc_required=82


## v9 Edge-Basis Re-Derivation

Re-based hard edges: 142
Before distribution: {"activation_lifecycle_required":189,"business_logic_hard_rule":87,"billing_or_evidence_required":112,"adl_hard_rule":43}
After distribution: {"activation_lifecycle_required":84,"phase_doc_required":82,"business_logic_hard_rule":147,"billing_or_evidence_required":112,"adl_hard_rule":6}

- seed_6a_visual_workflow_builder: activation_lifecycle_required -> phase_doc_required = 38
- seed_6a_person_identity_graph: activation_lifecycle_required -> phase_doc_required = 36
- seed_6a_global_opt_out_registry: adl_hard_rule -> business_logic_hard_rule = 29
- seed_6a_access_core_gatekeeper: activation_lifecycle_required -> business_logic_hard_rule = 23
- seed_6a_api_key_scope_registry: adl_hard_rule -> business_logic_hard_rule = 8
- seed_6a_svfs_object_store: activation_lifecycle_required -> phase_doc_required = 4
- seed_6a_base_design_tokens: activation_lifecycle_required -> phase_doc_required = 4

Graph change allowed: false
Manual blocker registry remains unchanged from v8.
Recommended follow-up: harden scripts/quality/check_phase_zero_trust_mechanical_audit.mjs with these computed basis checks outside v9 scope.

## v9 Computed Basis Checks

Empty ADL hard-rule check: PASS, count=0
Target-basis semantic check: PASS, activation_wrong_target=0, governance_wrong_basis=0, billing_wrong_target=0
Structural generic-reason check: REPORT_ONLY, known_stem_matches=8, duplicate_reason_groups_gte3=1

Known-stem edge reason matches: 8
Duplicate reason groups used across 3+ edges: 1
Known-stem sample: [{"dependency_edge_id":"edge_6b_v4_0047_seed_6b_02_scholarship_discount_approval__to__seed_6a_pricing_table_effective_dates","source_seed_id":"seed_6b_02_scholarship_discount_approval","target_seed_id":"seed_6a_pricing_table_effective_dates","basis":"billing_or_evidence_required","reason":"ADL hard-rule dependency: seed_6b_02_scholarship_discount_approval uses seed_6a_pricing_table_effective_dates to enforce ADL-015 through the billing_financial target class."},{"dependency_edge_id":"edge_6b_v4_0051_seed_6b_02_installment_plan_engine__to__seed_6a_pricing_table_effective_dates","source_seed_id":"seed_6b_02_installment_plan_engine","target_seed_id":"seed_6a_pricing_table_effective_dates","basis":"billing_or_evidence_required","reason":"ADL hard-rule dependency: seed_6b_02_installment_plan_engine uses seed_6a_pricing_table_effective_dates to enforce ADL-013 through the billing_financial target class."},{"dependency_edge_id":"edge_6b_v4_0058_seed_6b_02_discount_stacking_engine__to__seed_6a_pricing_table_effective_dates","source_seed_id":"seed_6b_02_discount_stacking_engine","target_seed_id":"seed_6a_pricing_table_effective_dates","basis":"billing_or_evidence_required","reason":"ADL hard-rule dependency: seed_6b_02_discount_stacking_engine uses seed_6a_pricing_table_effective_dates to enforce ADL-015 through the billing_financial target class."},{"dependency_edge_id":"edge_6b_v4_0336_seed_6b_10_payment_allocation_balance__to__seed_6b_09_invoice_record_authority","source_seed_id":"seed_6b_10_payment_allocation_balance","target_seed_id":"seed_6b_09_invoice_record_authority","basis":"billing_or_evidence_required","reason":"ADL hard-rule dependency: seed_6b_10_payment_allocation_balance uses seed_6b_09_invoice_record_authority to enforce ADL-013 through the billing_financial target class."},{"dependency_edge_id":"edge_6b_v4_0340_seed_6b_10_refund_to_original_method__to__seed_6b_09_invoice_record_authority","source_seed_id":"seed_6b_10_refund_to_original_method","target_seed_id":"seed_6b_09_invoice_record_authority","basis":"billing_or_evidence_required","reason":"ADL hard-rule dependency: seed_6b_10_refund_to_original_method uses seed_6b_09_invoice_record_authority to enforce ADL-014 through the billing_financial target class."},{"dependency_edge_id":"edge_6b_v4_0372_seed_6b_12_journal_entry_engine__to__seed_6b_10_payment_allocation_balance","source_seed_id":"seed_6b_12_journal_entry_engine","target_seed_id":"seed_6b_10_payment_allocation_balance","basis":"billing_or_evidence_required","reason":"ADL hard-rule dependency: seed_6b_12_journal_entry_engine uses seed_6b_10_payment_allocation_balance to enforce ADL-016 through the billing_financial target class."},{"dependency_edge_id":"edge_6b_v4_0380_seed_6b_12_tax_mapping_reporting__to__seed_6b_10_payment_allocation_balance","source_seed_id":"seed_6b_12_tax_mapping_reporting","target_seed_id":"seed_6b_10_payment_allocation_balance","basis":"billing_or_evidence_required","reason":"ADL hard-rule dependency: seed_6b_12_tax_mapping_reporting uses seed_6b_10_payment_allocation_balance to enforce ADL-018 through the billing_financial target class."},{"dependency_edge_id":"edge_6b_v4_0384_seed_6b_12_fx_gain_loss_accounting__to__seed_6b_10_payment_allocation_balance","source_seed_id":"seed_6b_12_fx_gain_loss_accounting","target_seed_id":"seed_6b_10_payment_allocation_balance","basis":"billing_or_evidence_required","reason":"ADL hard-rule dependency: seed_6b_12_fx_gain_loss_accounting uses seed_6b_10_payment_allocation_balance to enforce ADL-016 through the billing_financial target class."}]
Duplicate reason sample: [{"count":10,"reason":"v7 unresolved API-key direction: 6B.10 may need API key scope registry consumption or provider credential registration, but source does not prove direction. Manual review required; not a hard dependency."}]

## Ticket Boundary

Ticket generation allowed: false
Ticket pack generation allowed: false
