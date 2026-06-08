export const phase6BPlatformInvoiceGenerationModuleManifest = {
  seed_id: 'seed_6b_15_platform_invoice_generation',
  component_id: '6B.15',
  capability_surface: 'platform_invoice_generation',
  source_system: 'phase_6b_v21_ffet',
  activation_lifecycle_required: true,
  tenant_service: true,
  owned_data: [
    'Phase6BPlatformInvoice',
    'Phase6BPlatformInvoiceLine',
    'Phase6BBillingOperation',
  ],
  required_refs: [
    'organization_id',
    'customer_ref',
    'billing_account_ref',
    'pricing_table_ref',
    'usage_evidence_ref',
    'chart_version_ref',
  ],
  forbidden_behaviors: [
    'payment_collection',
    'invoice_delivery',
    'journal_posting',
    'dunning_execution',
    'mutation_of_final_invoice_snapshot',
    'irreversible_customer_action',
  ],
} as const;
