export type Phase6BPlatformInvoiceLineKind = 'subscription' | 'usage' | 'adjustment' | 'tax';

export type Phase6BPlatformInvoiceLineInput = {
  line_id: string;
  service_ref: string;
  pricing_ref: string;
  usage_evidence_ref: string;
  description: string;
  kind: Phase6BPlatformInvoiceLineKind;
  quantity: number;
  unit_amount_minor: number;
  tax_rate_bps?: number;
  discount_amount_minor?: number;
};

export type Phase6BPlatformInvoiceGenerationInput = {
  organization_id: string;
  invoice_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  pricing_table_ref: string;
  payment_allocation_ref?: string;
  chart_version_ref: string;
  currency: string;
  issue_date: string;
  due_date: string;
  lines: Phase6BPlatformInvoiceLineInput[];
  requested_forbidden_action?:
    | 'collect_payment'
    | 'send_invoice'
    | 'post_journal'
    | 'run_dunning'
    | 'mutate_final_invoice'
    | 'irreversible_action';
};

export type Phase6BPlatformInvoiceLineOutput = Phase6BPlatformInvoiceLineInput & {
  gross_amount_minor: number;
  net_amount_minor: number;
  tax_amount_minor: number;
  total_amount_minor: number;
};

export type Phase6BPlatformInvoiceGenerationResult = {
  organization_id: string;
  invoice_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  pricing_table_ref: string;
  payment_allocation_ref?: string;
  chart_version_ref: string;
  currency: string;
  issue_date: string;
  due_date: string;
  status: 'generated_immutable_snapshot';
  subtotal_minor: number;
  discount_total_minor: number;
  tax_total_minor: number;
  grand_total_minor: number;
  line_count: number;
  lines: Phase6BPlatformInvoiceLineOutput[];
  immutable_snapshot: {
    invoice_ref: string;
    pricing_table_ref: string;
    usage_evidence_refs: string[];
    generated_at: string;
    snapshot_digest: string;
  };
  evidence: {
    seed_id: 'seed_6b_15_platform_invoice_generation';
    source_models: ['Phase6BPlatformInvoice', 'Phase6BPlatformInvoiceLine', 'Phase6BBillingOperation'];
    forbidden_behaviors_rejected: string[];
  };
};
