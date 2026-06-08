import { createHash } from 'node:crypto';

export const PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID = 'seed_6b_14_payroll_disbursement_file_export' as const;
export const PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID = '6B.14' as const;
export const PAYROLL_DISBURSEMENT_FILE_EXPORT_EVENT = 'phase_6b.finance_payroll.disbursement_file_exported' as const;

export type PayrollDisbursementExportFormat = 'CSV' | 'BANK_STANDARD_TEXT';
export type PayrollDisbursementLineInput = {
  payout_ref: string;
  payee_ref: string;
  person_identity_ref: string;
  beneficiary_label: string;
  amount_minor: number;
  currency_code: string;
  payment_allocation_balance_ref: string;
  chart_account_ref: string;
  payout_evidence_ref: string;
};
export type PayrollDisbursementFileExportInput = {
  organization_id: string;
  source_seed_id: typeof PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID;
  export_ref: string;
  payroll_batch_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  base_currency_code: string;
  export_format: PayrollDisbursementExportFormat;
  lines: PayrollDisbursementLineInput[];
  exported_by_user_id: string;
  exported_at: string;
  bank_transmission_requested?: boolean;
  payout_creation_requested?: boolean;
  credential_handling_requested?: boolean;
  journal_posting_requested?: boolean;
  hr_record_mutation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};
export type PayrollDisbursementFileExportReceipt = {
  seed_id: typeof PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID;
  event_name: typeof PAYROLL_DISBURSEMENT_FILE_EXPORT_EVENT;
  organization_id: string;
  source_seed_id: typeof PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID;
  payroll_batch_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  base_currency_code: string;
  export_ref: string;
  export_format: PayrollDisbursementExportFormat;
  line_count: number;
  total_amount_minor: number;
  file_payload: string;
  file_evidence_ref: string;
  file_digest: string;
  bank_transmission_performed: false;
  payout_created: false;
  credential_handling_performed: false;
  journal_posted: false;
  hr_record_mutated: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  exported_by_user_id: string;
  exported_at: string;
};

const FORMATS: readonly PayrollDisbursementExportFormat[] = ['CSV', 'BANK_STANDARD_TEXT'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${field} is required for payroll disbursement file export.`);
  return value.trim();
}
function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) throw new Error(`${field} must be a valid ISO-compatible timestamp for payroll disbursement file export.`);
  return normalized;
}
function requireSourceSeed(value: string): typeof PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID) throw new Error('source_seed_id must match seed_6b_14_payroll_disbursement_file_export.');
  return PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID;
}
function normalizeCurrency(value: string, field: string): string {
  const currency = requireNonEmpty(value, field).toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) throw new Error(`${field} must be a three-letter ISO-style code for payroll disbursement file export.`);
  return currency;
}
function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${field} must be a positive integer for payroll disbursement file export.`);
  return value;
}
function requireFormat(value: PayrollDisbursementExportFormat): PayrollDisbursementExportFormat {
  if (!FORMATS.includes(value)) throw new Error('export_format is not supported for payroll disbursement file export.');
  return value;
}
function sanitizePayloadValue(value: string): string {
  return requireNonEmpty(value, 'payload value').replace(/[\n\r,|]/g, ' ').trim();
}
function normalizeLine(line: PayrollDisbursementLineInput, expectedCurrency: string, expectedAllocationBalanceRef: string): PayrollDisbursementLineInput {
  const currency = normalizeCurrency(line.currency_code, 'lines.currency_code');
  if (currency !== expectedCurrency) throw new Error('lines.currency_code must match base_currency_code for payroll disbursement file export.');
  const allocationRef = requireNonEmpty(line.payment_allocation_balance_ref, 'lines.payment_allocation_balance_ref');
  if (allocationRef !== expectedAllocationBalanceRef) throw new Error('lines.payment_allocation_balance_ref must match payment_allocation_balance_ref for payroll disbursement file export.');
  return {
    payout_ref: requireNonEmpty(line.payout_ref, 'lines.payout_ref'),
    payee_ref: requireNonEmpty(line.payee_ref, 'lines.payee_ref'),
    person_identity_ref: requireNonEmpty(line.person_identity_ref, 'lines.person_identity_ref'),
    beneficiary_label: requireNonEmpty(line.beneficiary_label, 'lines.beneficiary_label'),
    amount_minor: requirePositiveInteger(line.amount_minor, 'lines.amount_minor'),
    currency_code: currency,
    payment_allocation_balance_ref: allocationRef,
    chart_account_ref: requireNonEmpty(line.chart_account_ref, 'lines.chart_account_ref'),
    payout_evidence_ref: requireNonEmpty(line.payout_evidence_ref, 'lines.payout_evidence_ref'),
  };
}
function normalizeLines(lines: PayrollDisbursementLineInput[], expectedCurrency: string, expectedAllocationBalanceRef: string): PayrollDisbursementLineInput[] {
  if (!Array.isArray(lines) || lines.length === 0) throw new Error('lines must include at least one payout line for payroll disbursement file export.');
  const normalized = lines.map((line) => normalizeLine(line, expectedCurrency, expectedAllocationBalanceRef));
  const payoutRefs = normalized.map((line) => line.payout_ref);
  if (new Set(payoutRefs).size !== payoutRefs.length) throw new Error('lines must not repeat payout_ref for payroll disbursement file export.');
  return normalized.sort((left, right) => left.payout_ref.localeCompare(right.payout_ref));
}
function buildPayload(format: PayrollDisbursementExportFormat, lines: PayrollDisbursementLineInput[]): string {
  const rows = lines.map((line) => [line.payout_ref, line.payee_ref, line.person_identity_ref, line.beneficiary_label, String(line.amount_minor), line.currency_code, line.chart_account_ref, line.payout_evidence_ref].map(sanitizePayloadValue));
  if (format === 'CSV') return [['payout_ref', 'payee_ref', 'person_identity_ref', 'beneficiary_label', 'amount_minor', 'currency_code', 'chart_account_ref', 'payout_evidence_ref'], ...rows].map((row) => row.join(',')).join('\n');
  return rows.map((row) => row.join('|')).join('\n');
}
function digestExport(receiptWithoutDigest: Omit<PayrollDisbursementFileExportReceipt, 'file_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function exportPayrollDisbursementFile(input: PayrollDisbursementFileExportInput): PayrollDisbursementFileExportReceipt {
  if (input.bank_transmission_requested === true) throw new Error('payroll disbursement file export must not transmit to banks.');
  if (input.payout_creation_requested === true) throw new Error('payroll disbursement file export must not create payroll payouts.');
  if (input.credential_handling_requested === true) throw new Error('payroll disbursement file export must not handle credentials.');
  if (input.journal_posting_requested === true) throw new Error('payroll disbursement file export must not post journals.');
  if (input.hr_record_mutation_requested === true) throw new Error('payroll disbursement file export must not mutate HR records.');
  if (input.payment_allocation_requested === true) throw new Error('payroll disbursement file export must not perform payment allocation math.');
  if (input.irreversible_action_requested === true) throw new Error('payroll disbursement file export must not perform irreversible actions.');

  const exportRef = requireNonEmpty(input.export_ref, 'export_ref');
  const baseCurrencyCode = normalizeCurrency(input.base_currency_code, 'base_currency_code');
  const allocationRef = requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref');
  const format = requireFormat(input.export_format);
  const lines = normalizeLines(input.lines, baseCurrencyCode, allocationRef);
  const filePayload = buildPayload(format, lines);

  const receiptWithoutDigest: Omit<PayrollDisbursementFileExportReceipt, 'file_digest'> = {
    seed_id: PHASE_6B_PAYROLL_DISBURSEMENT_FILE_EXPORT_SEED_ID,
    component_id: PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID,
    event_name: PAYROLL_DISBURSEMENT_FILE_EXPORT_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    source_seed_id: requireSourceSeed(input.source_seed_id),
    payroll_batch_ref: requireNonEmpty(input.payroll_batch_ref, 'payroll_batch_ref'),
    payment_allocation_balance_ref: allocationRef,
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    base_currency_code: baseCurrencyCode,
    export_ref: exportRef,
    export_format: format,
    line_count: lines.length,
    total_amount_minor: lines.reduce((total, line) => total + line.amount_minor, 0),
    file_payload: filePayload,
    file_evidence_ref: `payroll_disbursement_file_export:${exportRef}:generated`,
    bank_transmission_performed: false,
    payout_created: false,
    credential_handling_performed: false,
    journal_posted: false,
    hr_record_mutated: false,
    payment_allocation_performed: false,
    irreversible_action_allowed: false,
    exported_by_user_id: requireNonEmpty(input.exported_by_user_id, 'exported_by_user_id'),
    exported_at: requireTimestamp(input.exported_at, 'exported_at'),
  };
  return { ...receiptWithoutDigest, file_digest: digestExport(receiptWithoutDigest) };
}
