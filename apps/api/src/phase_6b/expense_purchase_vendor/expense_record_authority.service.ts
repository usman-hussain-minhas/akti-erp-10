import { createHash } from 'node:crypto';

export const PHASE_6B_EXPENSE_RECORD_AUTHORITY_SEED_ID = 'seed_6b_11_expense_record_authority' as const;
export const PHASE_6B_EXPENSE_RECORD_AUTHORITY_COMPONENT_ID = '6B.11' as const;

export const EXPENSE_RECORD_AUTHORITY_EVENT = 'phase_6b.expense_purchase_vendor.expense_record.authorized' as const;

export type ExpenseRecordStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'VOID_BEFORE_APPROVAL';
export type ExpenseLineType = 'PURCHASE' | 'REIMBURSEMENT' | 'FEE' | 'TAX';

export type ExpenseLineInput = {
  expense_line_ref: string;
  line_type: ExpenseLineType;
  description: string;
  quantity_units: number;
  unit_amount_minor: number;
  line_total_minor: number;
  currency_code: string;
  receipt_evidence_ref?: string;
};

export type ExpenseRecordAuthorityInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  expense_record_ref: string;
  expense_number: string;
  vendor_record_ref: string;
  requester_person_ref: string;
  payment_allocation_balance_ref: string;
  visual_workflow_builder_ref: string;
  approval_workflow_ref: string;
  pricing_table_effective_date_ref: string;
  status: ExpenseRecordStatus;
  currency_code: string;
  incurred_at: string;
  submitted_at?: string;
  approved_by_person_ref?: string;
  approved_at?: string;
  rejection_reason?: string;
  expense_lines: ExpenseLineInput[];
  authorized_by_user_id: string;
  authorized_at: string;
  payment_allocation_requested?: boolean;
  vendor_payment_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  gl_posting_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ExpenseRecordAuthorityReceipt = {
  seed_id: typeof PHASE_6B_EXPENSE_RECORD_AUTHORITY_SEED_ID;
  component_id: typeof PHASE_6B_EXPENSE_RECORD_AUTHORITY_COMPONENT_ID;
  event_name: typeof EXPENSE_RECORD_AUTHORITY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  expense_record_ref: string;
  expense_number: string;
  vendor_record_ref: string;
  requester_person_ref: string;
  payment_allocation_balance_ref: string;
  visual_workflow_builder_ref: string;
  approval_workflow_ref: string;
  pricing_table_effective_date_ref: string;
  status: ExpenseRecordStatus;
  currency_code: string;
  incurred_at: string;
  submitted_at?: string;
  approved_by_person_ref?: string;
  approved_at?: string;
  rejection_reason?: string;
  expense_lines: ExpenseLineInput[];
  line_count: number;
  expense_total_minor: number;
  approval_capability_gated: true;
  expense_record_digest: string;
  payment_allocation_performed: false;
  vendor_payment_performed: false;
  provider_callback_processed: false;
  gl_posting_performed: false;
  irreversible_action_allowed: false;
  authorized_by_user_id: string;
  authorized_at: string;
};

const STATUSES: readonly ExpenseRecordStatus[] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'VOID_BEFORE_APPROVAL'] as const;
const LINE_TYPES: readonly ExpenseLineType[] = ['PURCHASE', 'REIMBURSEMENT', 'FEE', 'TAX'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for expense record authority.`);
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for expense record authority.`);
  }
  return normalized;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('currency_code must be a three-letter ISO-style code for expense record authority.');
  }
  return currency;
}

function requireStatus(value: ExpenseRecordStatus): ExpenseRecordStatus {
  if (!STATUSES.includes(value)) {
    throw new Error('status is not supported for expense record authority.');
  }
  return value;
}

function requireLineType(value: ExpenseLineType): ExpenseLineType {
  if (!LINE_TYPES.includes(value)) {
    throw new Error('line_type is not supported for expense record authority.');
  }
  return value;
}

function normalizeLine(line: ExpenseLineInput, expenseCurrency: string): ExpenseLineInput {
  const quantityUnits = line.quantity_units;
  const unitAmountMinor = line.unit_amount_minor;
  if (!Number.isInteger(quantityUnits) || quantityUnits < 1) {
    throw new Error('quantity_units must be a positive integer for expense record authority.');
  }
  if (!Number.isInteger(unitAmountMinor) || unitAmountMinor < 0) {
    throw new Error('unit_amount_minor must be a non-negative integer for expense record authority.');
  }
  if (line.line_total_minor !== quantityUnits * unitAmountMinor) {
    throw new Error('line_total_minor must equal quantity_units times unit_amount_minor for expense record authority.');
  }
  const currencyCode = normalizeCurrency(line.currency_code);
  if (currencyCode !== expenseCurrency) {
    throw new Error('expense line currency must match expense currency for expense record authority.');
  }
  return {
    expense_line_ref: requireNonEmpty(line.expense_line_ref, 'expense_lines.expense_line_ref'),
    line_type: requireLineType(line.line_type),
    description: requireNonEmpty(line.description, 'expense_lines.description'),
    quantity_units: quantityUnits,
    unit_amount_minor: unitAmountMinor,
    line_total_minor: line.line_total_minor,
    currency_code: currencyCode,
    receipt_evidence_ref: optionalNonEmpty(line.receipt_evidence_ref, 'expense_lines.receipt_evidence_ref'),
  };
}

function normalizeLines(lines: ExpenseLineInput[], expenseCurrency: string): ExpenseLineInput[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('expense_lines must include at least one line for expense record authority.');
  }
  const normalized = lines.map((line) => normalizeLine(line, expenseCurrency));
  const refs = normalized.map((line) => line.expense_line_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('expense_lines must not repeat expense_line_ref for expense record authority.');
  }
  return normalized;
}

function enforceStatusFields(input: ExpenseRecordAuthorityInput, status: ExpenseRecordStatus): {
  submitted_at?: string;
  approved_by_person_ref?: string;
  approved_at?: string;
  rejection_reason?: string;
} {
  const submittedAt = input.submitted_at === undefined ? undefined : requireTimestamp(input.submitted_at, 'submitted_at');
  const approvedAt = input.approved_at === undefined ? undefined : requireTimestamp(input.approved_at, 'approved_at');
  const approvedBy = optionalNonEmpty(input.approved_by_person_ref, 'approved_by_person_ref');
  const rejectionReason = optionalNonEmpty(input.rejection_reason, 'rejection_reason');
  if ((status === 'SUBMITTED' || status === 'APPROVED' || status === 'REJECTED') && submittedAt === undefined) {
    throw new Error('submitted_at is required for submitted, approved, or rejected expenses.');
  }
  if (status === 'APPROVED' && (approvedBy === undefined || approvedAt === undefined)) {
    throw new Error('approved expenses require approved_by_person_ref and approved_at.');
  }
  if (status !== 'APPROVED' && (approvedBy !== undefined || approvedAt !== undefined)) {
    throw new Error('approval fields are allowed only when status is APPROVED.');
  }
  if (status === 'REJECTED' && rejectionReason === undefined) {
    throw new Error('rejected expenses require rejection_reason.');
  }
  if (status !== 'REJECTED' && rejectionReason !== undefined) {
    throw new Error('rejection_reason is allowed only when status is REJECTED.');
  }
  return { submitted_at: submittedAt, approved_by_person_ref: approvedBy, approved_at: approvedAt, rejection_reason: rejectionReason };
}

function digestExpense(receiptWithoutDigest: Omit<ExpenseRecordAuthorityReceipt, 'expense_record_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function authorizeExpenseRecord(input: ExpenseRecordAuthorityInput): ExpenseRecordAuthorityReceipt {
  if (input.payment_allocation_requested === true) {
    throw new Error('expense record authority must not perform payment allocation math.');
  }
  if (input.vendor_payment_requested === true) {
    throw new Error('expense record authority must not execute vendor payments.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('expense record authority must not process provider callbacks.');
  }
  if (input.gl_posting_requested === true) {
    throw new Error('expense record authority must not post to general ledger.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('expense record authority must not perform irreversible actions.');
  }

  const currencyCode = normalizeCurrency(input.currency_code);
  const status = requireStatus(input.status);
  const statusFields = enforceStatusFields(input, status);
  const expenseLines = normalizeLines(input.expense_lines, currencyCode);
  const expenseTotalMinor = expenseLines.reduce((total, line) => total + line.line_total_minor, 0);

  const receiptWithoutDigest: Omit<ExpenseRecordAuthorityReceipt, 'expense_record_digest'> = {
    seed_id: PHASE_6B_EXPENSE_RECORD_AUTHORITY_SEED_ID,
    component_id: PHASE_6B_EXPENSE_RECORD_AUTHORITY_COMPONENT_ID,
    event_name: EXPENSE_RECORD_AUTHORITY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    expense_record_ref: requireNonEmpty(input.expense_record_ref, 'expense_record_ref'),
    expense_number: requireNonEmpty(input.expense_number, 'expense_number'),
    vendor_record_ref: requireNonEmpty(input.vendor_record_ref, 'vendor_record_ref'),
    requester_person_ref: requireNonEmpty(input.requester_person_ref, 'requester_person_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    visual_workflow_builder_ref: requireNonEmpty(input.visual_workflow_builder_ref, 'visual_workflow_builder_ref'),
    approval_workflow_ref: requireNonEmpty(input.approval_workflow_ref, 'approval_workflow_ref'),
    pricing_table_effective_date_ref: requireNonEmpty(input.pricing_table_effective_date_ref, 'pricing_table_effective_date_ref'),
    status,
    currency_code: currencyCode,
    incurred_at: requireTimestamp(input.incurred_at, 'incurred_at'),
    submitted_at: statusFields.submitted_at,
    approved_by_person_ref: statusFields.approved_by_person_ref,
    approved_at: statusFields.approved_at,
    rejection_reason: statusFields.rejection_reason,
    expense_lines: expenseLines,
    line_count: expenseLines.length,
    expense_total_minor: expenseTotalMinor,
    approval_capability_gated: true,
    payment_allocation_performed: false,
    vendor_payment_performed: false,
    provider_callback_processed: false,
    gl_posting_performed: false,
    irreversible_action_allowed: false,
    authorized_by_user_id: requireNonEmpty(input.authorized_by_user_id, 'authorized_by_user_id'),
    authorized_at: requireTimestamp(input.authorized_at, 'authorized_at'),
  };

  return {
    ...receiptWithoutDigest,
    expense_record_digest: digestExpense(receiptWithoutDigest),
  };
}
