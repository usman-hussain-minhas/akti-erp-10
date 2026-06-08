import { createHash } from 'node:crypto';

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

const STATUSES: readonly InvoiceRecordStatus[] = ['DRAFT', 'ISSUED', 'CANCELLED_BEFORE_ISSUE'] as const;
const LINE_TYPES: readonly InvoiceLineType[] = ['PRODUCT', 'SERVICE'] as const;
const TERM_BASES: readonly InvoicePaymentTermBasis[] = ['DUE_ON_RECEIPT', 'NET_DAYS'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for invoice record authority.`);
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for invoice record authority.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for invoice record authority.');
  }
  return currency;
}

function normalizeStatus(value: InvoiceRecordStatus): InvoiceRecordStatus {
  if (!STATUSES.includes(value)) {
    throw new Error('status is not supported for invoice record authority.');
  }
  return value;
}

function normalizeLineType(value: InvoiceLineType): InvoiceLineType {
  if (!LINE_TYPES.includes(value)) {
    throw new Error('line_type is not supported for invoice record authority.');
  }
  return value;
}

function normalizePaymentTerms(terms: InvoicePaymentTerms): InvoicePaymentTerms {
  if (!terms || !TERM_BASES.includes(terms.basis)) {
    throw new Error('payment_terms.basis is not supported for invoice record authority.');
  }
  if (terms.basis === 'DUE_ON_RECEIPT') {
    if (terms.net_days !== undefined) {
      throw new Error('DUE_ON_RECEIPT payment terms must not carry net_days for invoice record authority.');
    }
    return { basis: terms.basis };
  }
  const netDays = terms.net_days;
  if (typeof netDays !== 'number' || !Number.isInteger(netDays) || netDays < 1) {
    throw new Error('NET_DAYS payment terms require positive net_days for invoice record authority.');
  }
  return { basis: terms.basis, net_days: netDays };
}

function normalizeLine(line: InvoiceLineInput, invoiceCurrency: string): InvoiceLineInput {
  const currencyCode = normalizeCurrency(line.currency_code);
  if (currencyCode !== invoiceCurrency) {
    throw new Error('invoice line currency must match invoice currency for invoice record authority.');
  }
  if (!Number.isInteger(line.quantity_units) || line.quantity_units < 1) {
    throw new Error('quantity_units must be a positive integer for invoice record authority.');
  }
  if (!Number.isInteger(line.unit_amount_minor) || line.unit_amount_minor < 0) {
    throw new Error('unit_amount_minor must be a non-negative integer for invoice record authority.');
  }
  const expectedLineTotal = line.quantity_units * line.unit_amount_minor;
  if (line.line_total_minor !== expectedLineTotal) {
    throw new Error('line_total_minor must equal quantity_units times unit_amount_minor for invoice record authority.');
  }
  return {
    invoice_line_id: requireNonEmpty(line.invoice_line_id, 'invoice_lines.invoice_line_id'),
    line_type: normalizeLineType(line.line_type),
    product_record_ref: requireNonEmpty(line.product_record_ref, 'invoice_lines.product_record_ref'),
    product_price_history_ref: requireNonEmpty(line.product_price_history_ref, 'invoice_lines.product_price_history_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(line.pricing_table_effective_date_ref, 'invoice_lines.pricing_table_effective_date_ref'),
    description: requireNonEmpty(line.description, 'invoice_lines.description'),
    quantity_units: line.quantity_units,
    unit_amount_minor: line.unit_amount_minor,
    currency_code: currencyCode,
    line_total_minor: line.line_total_minor,
  };
}

function normalizeLines(lines: InvoiceLineInput[], invoiceCurrency: string): InvoiceLineInput[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('invoice_lines must include at least one line for invoice record authority.');
  }
  const normalized = lines.map((line) => normalizeLine(line, invoiceCurrency));
  const lineIds = normalized.map((line) => line.invoice_line_id);
  if (new Set(lineIds).size !== lineIds.length) {
    throw new Error('invoice_lines must not repeat invoice_line_id for invoice record authority.');
  }
  return normalized;
}

function digestInvoice(receiptWithoutDigest: Omit<InvoiceRecordAuthorityReceipt, 'invoice_record_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function authorizeInvoiceRecord(input: InvoiceRecordAuthorityInput): InvoiceRecordAuthorityReceipt {
  if (input.mutate_issued_invoice_requested === true) {
    throw new Error('issued invoices must not be mutated; use credit or debit note flow.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('invoice record authority must not perform payment allocation math.');
  }
  if (input.invoice_send_requested === true) {
    throw new Error('invoice record authority must not send invoices.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('invoice record authority must not perform irreversible actions.');
  }

  const currencyCode = normalizeCurrency(input.currency_code);
  const status = normalizeStatus(input.status);
  const issuedAt = status === 'ISSUED' ? requireTimestamp(input.issued_at, 'issued_at') : undefined;
  if (status !== 'ISSUED' && input.issued_at !== undefined) {
    throw new Error('issued_at is allowed only when status is ISSUED for invoice record authority.');
  }
  const invoiceLines = normalizeLines(input.invoice_lines, currencyCode);
  const invoiceTotalMinor = invoiceLines.reduce((total, line) => total + line.line_total_minor, 0);

  const receiptWithoutDigest: Omit<InvoiceRecordAuthorityReceipt, 'invoice_record_digest'> = {
    seed_id: PHASE_6B_INVOICE_RECORD_AUTHORITY_SEED_ID,
    component_id: PHASE_6B_INVOICE_RECORD_AUTHORITY_COMPONENT_ID,
    event_name: INVOICE_RECORD_AUTHORITY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    invoice_id: requireNonEmpty(input.invoice_id, 'invoice_id'),
    invoice_number: requireNonEmpty(input.invoice_number, 'invoice_number'),
    customer_record_ref: requireNonEmpty(input.customer_record_ref, 'customer_record_ref'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    payment_terms: normalizePaymentTerms(input.payment_terms),
    status,
    currency_code: currencyCode,
    issued_at: issuedAt,
    invoice_lines: invoiceLines,
    line_count: invoiceLines.length,
    invoice_total_minor: invoiceTotalMinor,
    immutable_after_issue: status === 'ISSUED',
    post_issue_change_policy: 'CREDIT_OR_DEBIT_NOTE_REQUIRED',
    mutate_issued_invoice_allowed: false,
    payment_allocation_allowed: false,
    invoice_send_allowed: false,
    irreversible_action_allowed: false,
    authorized_by_user_id: requireNonEmpty(input.authorized_by_user_id, 'authorized_by_user_id'),
    authorized_at: requireTimestamp(input.authorized_at, 'authorized_at'),
  };

  return {
    ...receiptWithoutDigest,
    invoice_record_digest: digestInvoice(receiptWithoutDigest),
  };
}
