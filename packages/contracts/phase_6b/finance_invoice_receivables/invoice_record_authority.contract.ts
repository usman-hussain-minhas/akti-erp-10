export const PHASE_6B_INVOICE_RECORD_AUTHORITY_SEED_ID = 'seed_6b_09_invoice_record_authority' as const;
export const PHASE_6B_INVOICE_RECORD_AUTHORITY_COMPONENT_ID = '6B.09' as const;

export const INVOICE_RECORD_AUTHORITY_EVENT = 'phase_6b.finance_invoice_receivables.invoice_record.authorized' as const;

export type InvoiceRecordStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED_BEFORE_ISSUE';
export type InvoiceLineType = 'PRODUCT' | 'SERVICE';
export type InvoicePaymentTermBasis = 'DUE_ON_RECEIPT' | 'NET_DAYS';

export type InvoicePaymentTerms = {
  basis: InvoicePaymentTermBasis;
  net_days?: number;
};

export type InvoiceLineInput = {
  invoice_line_id: string;
  line_type: InvoiceLineType;
  product_record_ref: string;
  product_price_history_ref: string;
  pricing_table_effective_date_ref: string;
  description: string;
  quantity_units: number;
  unit_amount_minor: number;
  currency_code: string;
  line_total_minor: number;
};

export type InvoiceRecordAuthorityInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  invoice_id: string;
  invoice_number: string;
  customer_record_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  payment_terms: InvoicePaymentTerms;
  status: InvoiceRecordStatus;
  currency_code: string;
  issued_at?: string;
  invoice_lines: InvoiceLineInput[];
  authorized_by_user_id: string;
  authorized_at: string;
  mutate_issued_invoice_requested?: boolean;
  payment_allocation_requested?: boolean;
  invoice_send_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type InvoiceRecordAuthorityReceipt = {
  seed_id: typeof PHASE_6B_INVOICE_RECORD_AUTHORITY_SEED_ID;
  component_id: typeof PHASE_6B_INVOICE_RECORD_AUTHORITY_COMPONENT_ID;
  event_name: typeof INVOICE_RECORD_AUTHORITY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  invoice_id: string;
  invoice_number: string;
  customer_record_ref: string;
  pipeline_stage_model_ref: string;
  visual_workflow_builder_ref: string;
  payment_terms: InvoicePaymentTerms;
  status: InvoiceRecordStatus;
  currency_code: string;
  issued_at?: string;
  invoice_lines: InvoiceLineInput[];
  line_count: number;
  invoice_total_minor: number;
  immutable_after_issue: boolean;
  post_issue_change_policy: 'CREDIT_OR_DEBIT_NOTE_REQUIRED';
  invoice_record_digest: string;
  mutate_issued_invoice_allowed: false;
  payment_allocation_allowed: false;
  invoice_send_allowed: false;
  irreversible_action_allowed: false;
  authorized_by_user_id: string;
  authorized_at: string;
};
