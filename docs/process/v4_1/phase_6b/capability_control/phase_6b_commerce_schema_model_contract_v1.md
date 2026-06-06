# Phase 6B Commerce Schema Model Contract v1

Status: `P6B_SCHEMA_001_REVIEW_READY_SCHEMA_BASELINE_INPUT`

Review gate status: `P6B-SCHEMA-001_ACCEPTED_FOR_SCHEMA_CONTROL_REVIEW`

This artifact is the repaired output of `P6B-SCHEMA-001`. It defines a review-ready Phase 6B schema baseline input for later `P6B-SCHEMA-002` implementation review. It does not authorize Prisma edits, migrations, runtime behavior, or Phase 6B capability implementation.

Ticket generation remains forbidden: `false`.
Capability implementation remains authorized: `false`.
Schema implementation remains authorized until human acceptance: `false`.

## Doctrine guardrails

Implementation is not stale by itself. Tickets become stale.
Apply maximum concrete capability within the approved scope of each ticket.

## Repair summary

- Previous contract declared `103` seed coverage but did not map the `103` seed IDs to schema model-decision groups.
- This repair adds explicit `103/103` seed-to-model-decision-group mappings.
- This repair preserves the proposed `47` model names.
- This repair corrects stale per-component seed counts from the live v17 execution seed matrix.
- Existing repo model references such as `LeadRecord` are recorded where the proposed Phase 6B models support, but do not replace, existing repo authority.

## Common model policy

- Every new Phase 6B model is tenant scoped through `organization_id`.
- Every new Phase 6B model must be represented in entity registry metadata.
- Every new Phase 6B model must keep `tenant_scoped=true`, `organization_id_required=true`, `rls_required=true`, and `audit_required=true` in metadata.
- The baseline may create storage scaffolds, but it must not implement pricing engines, payment behavior, communication sending, inventory movement logic, GL posting, payroll calculation, or UI workflows.

## Component model groups

| Component | Name | Prior declared seeds | Live v17 seeds | Proposed models |
| --- | --- | ---: | ---: | --- |
| 6B.01 | Product Catalogue | 6 | 4 | `Phase6BProduct`<br>`Phase6BProductCategory`<br>`Phase6BProductMedia`<br>`Phase6BProductHistory` |
| 6B.02 | Pricing and Package Service | 8 | 12 | `Phase6BProductPriceHistory`<br>`Phase6BPackageDefinition`<br>`Phase6BDiscountRule` |
| 6B.03 | Inventory Stock Control | 6 | 5 | `Phase6BInventoryLocation`<br>`Phase6BStockItem`<br>`Phase6BStockMovement` |
| 6B.04 | CRM Lead Intake | 6 | 19 | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` |
| 6B.05 | CRM Deduplication | 7 | 4 | `Phase6BLeadMatchCandidate`<br>`Phase6BLeadMergeRecord` |
| 6B.06 | CRM Pipeline | 7 | 5 | `Phase6BPipelineStage`<br>`Phase6BPipelineTimelineEntry` |
| 6B.07 | Communication | 10 | 10 | `Phase6BCommunicationTemplate`<br>`Phase6BCommunicationAttempt`<br>`Phase6BCommunicationSequenceEnrollment` |
| 6B.08 | Lead Scoring and Reporting | 6 | 4 | `Phase6BLeadScore`<br>`Phase6BFollowUpTask` |
| 6B.09 | Invoice and Receivables | 8 | 5 | `Phase6BInvoice`<br>`Phase6BInvoiceLine`<br>`Phase6BReceivable`<br>`Phase6BCreditDebitNote` |
| 6B.10 | Payment Collection and Top-Up | 10 | 10 | `Phase6BPayment`<br>`Phase6BPaymentAllocation`<br>`Phase6BReceipt`<br>`Phase6BTopUp`<br>`Phase6BReconciliationCandidate` |
| 6B.11 | Expense, Purchase, and Vendor | 7 | 5 | `Phase6BVendor`<br>`Phase6BExpense`<br>`Phase6BPurchaseOrder`<br>`Phase6BPurchaseReceipt` |
| 6B.12 | General Ledger Accounting | 6 | 6 | `Phase6BChartOfAccount`<br>`Phase6BJournalEntry`<br>`Phase6BJournalEntryLine`<br>`Phase6BAccountingPeriod`<br>`Phase6BTaxMapping` |
| 6B.13 | Banking Reconciliation | 5 | 4 | `Phase6BBankAccount`<br>`Phase6BBankTransaction`<br>`Phase6BReconciliationStatement` |
| 6B.14 | Payroll Foundation | 5 | 5 | `Phase6BPayee`<br>`Phase6BPayrollBatch`<br>`Phase6BPayrollPayout` |
| 6B.15 | Billing UI and Operations | 6 | 5 | `Phase6BBillingOperation`<br>`Phase6BBudgetCap` |

## Seed to model-decision group mapping

| Seed | Component | Seed type | Proposed primary model names | Existing repo model references |
| --- | --- | --- | --- | --- |
| seed_6b_01_product_record_authority | 6B.01 | tenant_service | `Phase6BProduct` | None |
| seed_6b_01_category_taxonomy | 6B.01 | tenant_service | `Phase6BProductCategory` | None |
| seed_6b_01_product_media_history | 6B.01 | internal_lifecycle_primitive | `Phase6BProductMedia`<br>`Phase6BProductHistory` | None |
| seed_6b_01_product_status_archive_policy | 6B.01 | tenant_service | `Phase6BProduct`<br>`Phase6BProductHistory` | None |
| seed_6b_02_fixed_pricing_model | 6B.02 | configuration_extension | `Phase6BProductPriceHistory` | None |
| seed_6b_02_tiered_pricing_model | 6B.02 | configuration_extension | `Phase6BProductPriceHistory` | None |
| seed_6b_02_volume_pricing_model | 6B.02 | configuration_extension | `Phase6BProductPriceHistory` | None |
| seed_6b_02_per_unit_pricing_model | 6B.02 | configuration_extension | `Phase6BProductPriceHistory` | None |
| seed_6b_02_per_hour_pricing_model | 6B.02 | configuration_extension | `Phase6BProductPriceHistory` | None |
| seed_6b_02_per_period_pricing_model | 6B.02 | configuration_extension | `Phase6BProductPriceHistory` | None |
| seed_6b_02_early_bird_pricing_deadline | 6B.02 | configuration_extension | `Phase6BDiscountRule` | None |
| seed_6b_02_scholarship_discount_approval | 6B.02 | core_microservice | `Phase6BDiscountRule` | None |
| seed_6b_02_installment_plan_engine | 6B.02 | core_microservice | `Phase6BPackageDefinition` | None |
| seed_6b_02_bundle_package_composition | 6B.02 | configuration_extension | `Phase6BPackageDefinition` | None |
| seed_6b_02_discount_stacking_engine | 6B.02 | core_microservice | `Phase6BDiscountRule` | None |
| seed_6b_03_stock_level_location_authority | 6B.03 | tenant_service | `Phase6BInventoryLocation`<br>`Phase6BStockItem` | None |
| seed_6b_03_lot_and_serial_tracking | 6B.03 | tenant_service | `Phase6BStockItem` | None |
| seed_6b_03_stock_movement_ledger | 6B.03 | tenant_service | `Phase6BStockMovement` | None |
| seed_6b_03_purchase_stock_evidence | 6B.03 | evidence_primitive | `Phase6BStockMovement` | None |
| seed_6b_03_non_inventory_business_policy | 6B.03 | tenant_service | `Phase6BStockItem` | None |
| seed_6b_04_unified_lead_record_authority | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_meta_lead_forms_connector | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_meta_whatsapp_intake_connector | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_tiktok_lead_gen_connector | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_google_ads_connector | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_google_business_connector | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_facebook_page_forms_connector | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_web_form_intake_connector | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_manual_lead_entry | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_csv_excel_import | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_api_lead_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_referral_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_inbound_whatsapp_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_inbound_sms_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_chatbot_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_live_chat_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_email_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_phone_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_04_walk_in_intake | 6B.04 | tenant_service | `Phase6BLeadSource`<br>`Phase6BLeadEvidence` | `LeadRecord` |
| seed_6b_05_match_candidate_generation | 6B.05 | tenant_service | `Phase6BLeadMatchCandidate` | `LeadRecord` |
| seed_6b_05_merge_decision_record | 6B.05 | tenant_service | `Phase6BLeadMergeRecord` | `LeadRecord` |
| seed_6b_05_identity_resolution_linking | 6B.05 | tenant_service | `Phase6BLeadMatchCandidate`<br>`Phase6BLeadMergeRecord` | `LeadRecord` |
| seed_6b_05_duplicate_evidence_log | 6B.05 | audit_log_primitive | `Phase6BLeadMatchCandidate`<br>`Phase6BLeadMergeRecord` | `LeadRecord` |
| seed_6b_06_pipeline_stage_model | 6B.06 | tenant_service | `Phase6BPipelineStage` | None |
| seed_6b_06_crm_activity_timeline | 6B.06 | tenant_service | `Phase6BPipelineTimelineEntry` | None |
| seed_6b_06_internal_notes_comments | 6B.06 | tenant_service | `Phase6BPipelineTimelineEntry` | None |
| seed_6b_06_stage_history_audit | 6B.06 | audit_log_primitive | `Phase6BPipelineTimelineEntry` | None |
| seed_6b_06_expected_value_pricing_bridge | 6B.06 | tenant_service | `Phase6BPipelineTimelineEntry` | `LeadRecord` |
| seed_6b_07_whatsapp_template_management | 6B.07 | optional_microservice | `Phase6BCommunicationTemplate` | None |
| seed_6b_07_whatsapp_inbound_routing | 6B.07 | optional_microservice | `Phase6BCommunicationAttempt` | None |
| seed_6b_07_whatsapp_outbound_window | 6B.07 | optional_microservice | `Phase6BCommunicationTemplate`<br>`Phase6BCommunicationAttempt` | None |
| seed_6b_07_whatsapp_broadcast_compliance | 6B.07 | optional_microservice | `Phase6BCommunicationTemplate`<br>`Phase6BCommunicationAttempt` | None |
| seed_6b_07_whatsapp_auto_reply_keywords | 6B.07 | optional_microservice | `Phase6BCommunicationTemplate`<br>`Phase6BCommunicationAttempt` | None |
| seed_6b_07_email_connected_inbox | 6B.07 | optional_microservice | `Phase6BCommunicationAttempt` | None |
| seed_6b_07_email_transactional_domain | 6B.07 | optional_microservice | `Phase6BCommunicationTemplate`<br>`Phase6BCommunicationAttempt` | None |
| seed_6b_07_email_sequences | 6B.07 | optional_microservice | `Phase6BCommunicationSequenceEnrollment` | None |
| seed_6b_07_email_shared_inbox | 6B.07 | optional_microservice | `Phase6BCommunicationAttempt` | None |
| seed_6b_07_communication_attempt_evidence | 6B.07 | evidence_primitive | `Phase6BCommunicationAttempt` | None |
| seed_6b_08_lead_scoring_engine | 6B.08 | core_microservice | `Phase6BLeadScore` | None |
| seed_6b_08_follow_up_task_cadence | 6B.08 | tenant_service | `Phase6BFollowUpTask` | None |
| seed_6b_08_crm_reporting_definitions | 6B.08 | tenant_service | `Phase6BLeadScore`<br>`Phase6BFollowUpTask` | None |
| seed_6b_08_crm_compliance_views | 6B.08 | tenant_service | `Phase6BLeadScore`<br>`Phase6BFollowUpTask` | None |
| seed_6b_09_invoice_record_authority | 6B.09 | tenant_service | `Phase6BInvoice`<br>`Phase6BInvoiceLine` | None |
| seed_6b_09_invoice_lifecycle_types | 6B.09 | tenant_service | `Phase6BInvoice`<br>`Phase6BCreditDebitNote` | None |
| seed_6b_09_receivable_balance_computation | 6B.09 | tenant_service | `Phase6BReceivable` | None |
| seed_6b_09_fbr_invoice_format | 6B.09 | tenant_service | `Phase6BInvoice` | None |
| seed_6b_09_aging_and_overdue_management | 6B.09 | tenant_service | `Phase6BReceivable` | None |
| seed_6b_10_jazzcash_gateway | 6B.10 | provider_adapter | `Phase6BPayment`<br>`Phase6BReceipt` | None |
| seed_6b_10_easypaisa_gateway | 6B.10 | provider_adapter | `Phase6BPayment`<br>`Phase6BReceipt` | None |
| seed_6b_10_raast_gateway | 6B.10 | provider_adapter | `Phase6BPayment`<br>`Phase6BReceipt` | None |
| seed_6b_10_quickpay_shadow_account_gateway | 6B.10 | provider_adapter | `Phase6BPayment`<br>`Phase6BReceipt` | None |
| seed_6b_10_stripe_gateway_3ds | 6B.10 | provider_adapter | `Phase6BPayment`<br>`Phase6BReceipt` | None |
| seed_6b_10_wise_gateway | 6B.10 | provider_adapter | `Phase6BPayment`<br>`Phase6BReceipt` | None |
| seed_6b_10_manual_reconciliation_path | 6B.10 | internal_lifecycle_primitive | `Phase6BReconciliationCandidate` | None |
| seed_6b_10_payment_allocation_balance | 6B.10 | core_microservice | `Phase6BPaymentAllocation` | None |
| seed_6b_10_refund_to_original_method | 6B.10 | core_microservice | `Phase6BPayment`<br>`Phase6BPaymentAllocation`<br>`Phase6BReceipt` | None |
| seed_6b_10_top_up_prepaid_credit | 6B.10 | core_microservice | `Phase6BTopUp`<br>`Phase6BPayment`<br>`Phase6BReceipt` | None |
| seed_6b_11_expense_record_authority | 6B.11 | tenant_service | `Phase6BExpense` | None |
| seed_6b_11_expense_approval_workflow | 6B.11 | core_microservice | `Phase6BExpense` | None |
| seed_6b_11_vendor_record_authority | 6B.11 | tenant_service | `Phase6BVendor` | None |
| seed_6b_11_purchase_order_authority | 6B.11 | tenant_service | `Phase6BPurchaseOrder` | None |
| seed_6b_11_three_way_match_evidence | 6B.11 | evidence_primitive | `Phase6BPurchaseOrder`<br>`Phase6BPurchaseReceipt` | None |
| seed_6b_12_chart_of_accounts | 6B.12 | tenant_service | `Phase6BChartOfAccount` | None |
| seed_6b_12_journal_entry_engine | 6B.12 | core_microservice | `Phase6BJournalEntry`<br>`Phase6BJournalEntryLine` | None |
| seed_6b_12_period_close_management | 6B.12 | tenant_service | `Phase6BAccountingPeriod` | None |
| seed_6b_12_tax_mapping_reporting | 6B.12 | tenant_service | `Phase6BTaxMapping` | None |
| seed_6b_12_fx_gain_loss_accounting | 6B.12 | tenant_service | `Phase6BJournalEntry`<br>`Phase6BJournalEntryLine` | None |
| seed_6b_12_financial_reporting_pack | 6B.12 | tenant_service | `Phase6BChartOfAccount`<br>`Phase6BJournalEntry`<br>`Phase6BAccountingPeriod` | None |
| seed_6b_13_bank_statement_import | 6B.13 | provider_adapter | `Phase6BBankAccount`<br>`Phase6BBankTransaction` | None |
| seed_6b_13_reconciliation_matching | 6B.13 | core_microservice | `Phase6BBankTransaction`<br>`Phase6BReconciliationStatement` | None |
| seed_6b_13_reconciliation_exception_queue | 6B.13 | internal_lifecycle_primitive | `Phase6BReconciliationStatement` | None |
| seed_6b_13_banking_evidence_export | 6B.13 | evidence_primitive | `Phase6BBankTransaction`<br>`Phase6BReconciliationStatement` | None |
| seed_6b_14_payroll_tax_slab_calculator | 6B.14 | tenant_service | `Phase6BPayrollBatch` | None |
| seed_6b_14_allowance_deduction_formula | 6B.14 | tenant_service | `Phase6BPayrollBatch` | None |
| seed_6b_14_payroll_run_state_machine | 6B.14 | tenant_service | `Phase6BPayrollBatch` | None |
| seed_6b_14_payroll_disbursement_file_export | 6B.14 | evidence_primitive | `Phase6BPayrollPayout` | None |
| seed_6b_14_hr_event_feed_boundary | 6B.14 | tenant_service | `Phase6BPayee`<br>`Phase6BPayrollBatch` | None |
| seed_6b_15_customer_billing_operations | 6B.15 | tenant_service | `Phase6BBillingOperation` | None |
| seed_6b_15_platform_invoice_generation | 6B.15 | tenant_service | `Phase6BBillingOperation` | None |
| seed_6b_15_billing_proration_engine | 6B.15 | core_microservice | `Phase6BBillingOperation`<br>`Phase6BBudgetCap` | None |
| seed_6b_15_retention_and_dunning_rules | 6B.15 | tenant_service | `Phase6BBillingOperation`<br>`Phase6BBudgetCap` | None |
| seed_6b_15_billing_support_interface | 6B.15 | tenant_service | `Phase6BBillingOperation` | None |
| seed_6b_02_product_price_history_effective_dates | 6B.02 | core_microservice | `Phase6BProductPriceHistory` | None |

## Per-model seed coverage

| Model | Component | Seed count | Seed IDs |
| --- | --- | ---: | --- |
| Phase6BProduct | 6B.01 | 2 | seed_6b_01_product_record_authority<br>seed_6b_01_product_status_archive_policy |
| Phase6BProductCategory | 6B.01 | 1 | seed_6b_01_category_taxonomy |
| Phase6BProductMedia | 6B.01 | 1 | seed_6b_01_product_media_history |
| Phase6BProductHistory | 6B.01 | 2 | seed_6b_01_product_media_history<br>seed_6b_01_product_status_archive_policy |
| Phase6BProductPriceHistory | 6B.02 | 7 | seed_6b_02_fixed_pricing_model<br>seed_6b_02_tiered_pricing_model<br>seed_6b_02_volume_pricing_model<br>seed_6b_02_per_unit_pricing_model<br>seed_6b_02_per_hour_pricing_model<br>seed_6b_02_per_period_pricing_model<br>seed_6b_02_product_price_history_effective_dates |
| Phase6BPackageDefinition | 6B.02 | 2 | seed_6b_02_installment_plan_engine<br>seed_6b_02_bundle_package_composition |
| Phase6BDiscountRule | 6B.02 | 3 | seed_6b_02_early_bird_pricing_deadline<br>seed_6b_02_scholarship_discount_approval<br>seed_6b_02_discount_stacking_engine |
| Phase6BInventoryLocation | 6B.03 | 1 | seed_6b_03_stock_level_location_authority |
| Phase6BStockItem | 6B.03 | 3 | seed_6b_03_stock_level_location_authority<br>seed_6b_03_lot_and_serial_tracking<br>seed_6b_03_non_inventory_business_policy |
| Phase6BStockMovement | 6B.03 | 2 | seed_6b_03_stock_movement_ledger<br>seed_6b_03_purchase_stock_evidence |
| Phase6BLeadSource | 6B.04 | 19 | seed_6b_04_unified_lead_record_authority<br>seed_6b_04_meta_lead_forms_connector<br>seed_6b_04_meta_whatsapp_intake_connector<br>seed_6b_04_tiktok_lead_gen_connector<br>seed_6b_04_google_ads_connector<br>seed_6b_04_google_business_connector<br>seed_6b_04_facebook_page_forms_connector<br>seed_6b_04_web_form_intake_connector<br>seed_6b_04_manual_lead_entry<br>seed_6b_04_csv_excel_import<br>seed_6b_04_api_lead_intake<br>seed_6b_04_referral_intake<br>seed_6b_04_inbound_whatsapp_intake<br>seed_6b_04_inbound_sms_intake<br>seed_6b_04_chatbot_intake<br>seed_6b_04_live_chat_intake<br>seed_6b_04_email_intake<br>seed_6b_04_phone_intake<br>seed_6b_04_walk_in_intake |
| Phase6BLeadEvidence | 6B.04 | 19 | seed_6b_04_unified_lead_record_authority<br>seed_6b_04_meta_lead_forms_connector<br>seed_6b_04_meta_whatsapp_intake_connector<br>seed_6b_04_tiktok_lead_gen_connector<br>seed_6b_04_google_ads_connector<br>seed_6b_04_google_business_connector<br>seed_6b_04_facebook_page_forms_connector<br>seed_6b_04_web_form_intake_connector<br>seed_6b_04_manual_lead_entry<br>seed_6b_04_csv_excel_import<br>seed_6b_04_api_lead_intake<br>seed_6b_04_referral_intake<br>seed_6b_04_inbound_whatsapp_intake<br>seed_6b_04_inbound_sms_intake<br>seed_6b_04_chatbot_intake<br>seed_6b_04_live_chat_intake<br>seed_6b_04_email_intake<br>seed_6b_04_phone_intake<br>seed_6b_04_walk_in_intake |
| Phase6BLeadMatchCandidate | 6B.05 | 3 | seed_6b_05_match_candidate_generation<br>seed_6b_05_identity_resolution_linking<br>seed_6b_05_duplicate_evidence_log |
| Phase6BLeadMergeRecord | 6B.05 | 3 | seed_6b_05_merge_decision_record<br>seed_6b_05_identity_resolution_linking<br>seed_6b_05_duplicate_evidence_log |
| Phase6BPipelineStage | 6B.06 | 1 | seed_6b_06_pipeline_stage_model |
| Phase6BPipelineTimelineEntry | 6B.06 | 4 | seed_6b_06_crm_activity_timeline<br>seed_6b_06_internal_notes_comments<br>seed_6b_06_stage_history_audit<br>seed_6b_06_expected_value_pricing_bridge |
| Phase6BCommunicationTemplate | 6B.07 | 5 | seed_6b_07_whatsapp_template_management<br>seed_6b_07_whatsapp_outbound_window<br>seed_6b_07_whatsapp_broadcast_compliance<br>seed_6b_07_whatsapp_auto_reply_keywords<br>seed_6b_07_email_transactional_domain |
| Phase6BCommunicationAttempt | 6B.07 | 8 | seed_6b_07_whatsapp_inbound_routing<br>seed_6b_07_whatsapp_outbound_window<br>seed_6b_07_whatsapp_broadcast_compliance<br>seed_6b_07_whatsapp_auto_reply_keywords<br>seed_6b_07_email_connected_inbox<br>seed_6b_07_email_transactional_domain<br>seed_6b_07_email_shared_inbox<br>seed_6b_07_communication_attempt_evidence |
| Phase6BCommunicationSequenceEnrollment | 6B.07 | 1 | seed_6b_07_email_sequences |
| Phase6BLeadScore | 6B.08 | 3 | seed_6b_08_lead_scoring_engine<br>seed_6b_08_crm_reporting_definitions<br>seed_6b_08_crm_compliance_views |
| Phase6BFollowUpTask | 6B.08 | 3 | seed_6b_08_follow_up_task_cadence<br>seed_6b_08_crm_reporting_definitions<br>seed_6b_08_crm_compliance_views |
| Phase6BInvoice | 6B.09 | 3 | seed_6b_09_invoice_record_authority<br>seed_6b_09_invoice_lifecycle_types<br>seed_6b_09_fbr_invoice_format |
| Phase6BInvoiceLine | 6B.09 | 1 | seed_6b_09_invoice_record_authority |
| Phase6BReceivable | 6B.09 | 2 | seed_6b_09_receivable_balance_computation<br>seed_6b_09_aging_and_overdue_management |
| Phase6BCreditDebitNote | 6B.09 | 1 | seed_6b_09_invoice_lifecycle_types |
| Phase6BPayment | 6B.10 | 8 | seed_6b_10_jazzcash_gateway<br>seed_6b_10_easypaisa_gateway<br>seed_6b_10_raast_gateway<br>seed_6b_10_quickpay_shadow_account_gateway<br>seed_6b_10_stripe_gateway_3ds<br>seed_6b_10_wise_gateway<br>seed_6b_10_refund_to_original_method<br>seed_6b_10_top_up_prepaid_credit |
| Phase6BPaymentAllocation | 6B.10 | 2 | seed_6b_10_payment_allocation_balance<br>seed_6b_10_refund_to_original_method |
| Phase6BReceipt | 6B.10 | 8 | seed_6b_10_jazzcash_gateway<br>seed_6b_10_easypaisa_gateway<br>seed_6b_10_raast_gateway<br>seed_6b_10_quickpay_shadow_account_gateway<br>seed_6b_10_stripe_gateway_3ds<br>seed_6b_10_wise_gateway<br>seed_6b_10_refund_to_original_method<br>seed_6b_10_top_up_prepaid_credit |
| Phase6BTopUp | 6B.10 | 1 | seed_6b_10_top_up_prepaid_credit |
| Phase6BReconciliationCandidate | 6B.10 | 1 | seed_6b_10_manual_reconciliation_path |
| Phase6BVendor | 6B.11 | 1 | seed_6b_11_vendor_record_authority |
| Phase6BExpense | 6B.11 | 2 | seed_6b_11_expense_record_authority<br>seed_6b_11_expense_approval_workflow |
| Phase6BPurchaseOrder | 6B.11 | 2 | seed_6b_11_purchase_order_authority<br>seed_6b_11_three_way_match_evidence |
| Phase6BPurchaseReceipt | 6B.11 | 1 | seed_6b_11_three_way_match_evidence |
| Phase6BChartOfAccount | 6B.12 | 2 | seed_6b_12_chart_of_accounts<br>seed_6b_12_financial_reporting_pack |
| Phase6BJournalEntry | 6B.12 | 3 | seed_6b_12_journal_entry_engine<br>seed_6b_12_fx_gain_loss_accounting<br>seed_6b_12_financial_reporting_pack |
| Phase6BJournalEntryLine | 6B.12 | 2 | seed_6b_12_journal_entry_engine<br>seed_6b_12_fx_gain_loss_accounting |
| Phase6BAccountingPeriod | 6B.12 | 2 | seed_6b_12_period_close_management<br>seed_6b_12_financial_reporting_pack |
| Phase6BTaxMapping | 6B.12 | 1 | seed_6b_12_tax_mapping_reporting |
| Phase6BBankAccount | 6B.13 | 1 | seed_6b_13_bank_statement_import |
| Phase6BBankTransaction | 6B.13 | 3 | seed_6b_13_bank_statement_import<br>seed_6b_13_reconciliation_matching<br>seed_6b_13_banking_evidence_export |
| Phase6BReconciliationStatement | 6B.13 | 3 | seed_6b_13_reconciliation_matching<br>seed_6b_13_reconciliation_exception_queue<br>seed_6b_13_banking_evidence_export |
| Phase6BPayee | 6B.14 | 1 | seed_6b_14_hr_event_feed_boundary |
| Phase6BPayrollBatch | 6B.14 | 4 | seed_6b_14_payroll_tax_slab_calculator<br>seed_6b_14_allowance_deduction_formula<br>seed_6b_14_payroll_run_state_machine<br>seed_6b_14_hr_event_feed_boundary |
| Phase6BPayrollPayout | 6B.14 | 1 | seed_6b_14_payroll_disbursement_file_export |
| Phase6BBillingOperation | 6B.15 | 5 | seed_6b_15_customer_billing_operations<br>seed_6b_15_platform_invoice_generation<br>seed_6b_15_billing_proration_engine<br>seed_6b_15_retention_and_dunning_rules<br>seed_6b_15_billing_support_interface |
| Phase6BBudgetCap | 6B.15 | 2 | seed_6b_15_billing_proration_engine<br>seed_6b_15_retention_and_dunning_rules |

## Validation expectations

- `P6B-SCHEMA-001` review must verify `seed_to_model_decision_group_mapping_count=103`.
- `P6B-SCHEMA-001` review must verify every v17 execution seed appears exactly once.
- `P6B-SCHEMA-001` review must verify every proposed model has at least one seed coverage row.
- `P6B-SCHEMA-002` must not start until this contract is explicitly accepted by human review.
- `P6B-SCHEMA-002` must add only additive Phase 6B schema baseline models and migration SQL.
- `P6B-SCHEMA-003` must align contracts/manifests/NestJS scaffold metadata without implementing business behavior.
- `P6B-SCHEMA-004` must regenerate v18 from live repo truth and promote only genuinely grounded capability tickets.

## Result

- Component groups: `15`
- Model names: `47`
- Seed coverage mapped: `103/103`
- Capability implementation tickets authorized: `false`
- Ticket generation authorized: `false`
