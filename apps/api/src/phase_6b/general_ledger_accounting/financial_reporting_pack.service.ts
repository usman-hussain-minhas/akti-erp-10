import { createHash } from 'node:crypto';

export const PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID = 'seed_6b_12_financial_reporting_pack' as const;
export const PHASE_6B_FINANCIAL_REPORTING_PACK_COMPONENT_ID = '6B.12' as const;

export const FINANCIAL_REPORTING_PACK_EVENT = 'phase_6b.general_ledger_accounting.financial_reporting_pack.generated' as const;

export type ReportingAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type TrialBalanceLineInput = {
  account_ref: string;
  account_code: string;
  account_name: string;
  account_type: ReportingAccountType;
  debit_total_minor: number;
  credit_total_minor: number;
  line_evidence_ref: string;
};

export type FinancialReportingPackInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID;
  reporting_pack_ref: string;
  accounting_period_ref: string;
  chart_version_ref: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  report_currency_code: string;
  trial_balance_lines: TrialBalanceLineInput[];
  report_evidence_refs: string[];
  generated_by_user_id: string;
  generated_at: string;
  frontend_screen_requested?: boolean;
  external_publication_requested?: boolean;
  journal_posting_requested?: boolean;
  period_close_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type FinancialReportingPackReceipt = {
  seed_id: typeof PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID;
  component_id: typeof PHASE_6B_FINANCIAL_REPORTING_PACK_COMPONENT_ID;
  event_name: typeof FINANCIAL_REPORTING_PACK_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID;
  reporting_pack_ref: string;
  accounting_period_ref: string;
  chart_version_ref: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  report_currency_code: string;
  trial_balance_lines: TrialBalanceLineInput[];
  trial_balance_line_count: number;
  asset_total_minor: number;
  liability_total_minor: number;
  equity_total_minor: number;
  revenue_total_minor: number;
  expense_total_minor: number;
  net_income_minor: number;
  balance_sheet_check_minor: 0;
  trial_balance_balanced: true;
  report_evidence_refs: string[];
  report_evidence_count: number;
  financial_reporting_pack_generated: true;
  frontend_screen_created: false;
  external_publication_performed: false;
  journal_posting_performed: false;
  period_closed: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  reporting_pack_evidence_ref: string;
  reporting_pack_digest: string;
  generated_by_user_id: string;
  generated_at: string;
};

const ACCOUNT_TYPES: readonly ReportingAccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const ACCOUNT_CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]*$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for financial reporting pack.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for financial reporting pack.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_12_financial_reporting_pack.');
  }
  return PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'report_currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('report_currency_code must be a three-letter ISO-style code for financial reporting pack.');
  }
  return currency;
}

function requireAccountType(value: ReportingAccountType): ReportingAccountType {
  if (!ACCOUNT_TYPES.includes(value)) {
    throw new Error('account_type is not supported for financial reporting pack.');
  }
  return value;
}

function requireNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer for financial reporting pack.`);
  }
  return value;
}

function normalizeTrialBalanceLine(line: TrialBalanceLineInput): TrialBalanceLineInput {
  const accountCode = requireNonEmpty(line.account_code, 'trial_balance_lines.account_code').toUpperCase();
  if (!ACCOUNT_CODE_PATTERN.test(accountCode)) {
    throw new Error('trial_balance_lines.account_code must use uppercase letters, numbers, dot, underscore, or hyphen.');
  }
  return {
    account_ref: requireNonEmpty(line.account_ref, 'trial_balance_lines.account_ref'),
    account_code: accountCode,
    account_name: requireNonEmpty(line.account_name, 'trial_balance_lines.account_name'),
    account_type: requireAccountType(line.account_type),
    debit_total_minor: requireNonNegativeInteger(line.debit_total_minor, 'trial_balance_lines.debit_total_minor'),
    credit_total_minor: requireNonNegativeInteger(line.credit_total_minor, 'trial_balance_lines.credit_total_minor'),
    line_evidence_ref: requireNonEmpty(line.line_evidence_ref, 'trial_balance_lines.line_evidence_ref'),
  };
}

function normalizeTrialBalanceLines(lines: TrialBalanceLineInput[]): TrialBalanceLineInput[] {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error('trial_balance_lines must include at least one line for financial reporting pack.');
  }
  const normalized = lines.map(normalizeTrialBalanceLine);
  const refs = normalized.map((line) => line.account_ref);
  if (new Set(refs).size !== refs.length) {
    throw new Error('trial_balance_lines must not repeat account_ref.');
  }
  return normalized;
}

function normalizeEvidenceRefs(value: string[]): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('report_evidence_refs must include at least one evidence reference for financial reporting pack.');
  }
  const refs = value.map((ref, index) => requireNonEmpty(ref, `report_evidence_refs[${index}]`));
  if (new Set(refs).size !== refs.length) {
    throw new Error('report_evidence_refs must not contain duplicates.');
  }
  return refs;
}

function netByType(lines: TrialBalanceLineInput[], type: ReportingAccountType): number {
  return lines
    .filter((line) => line.account_type === type)
    .reduce((total, line) => {
      if (type === 'ASSET' || type === 'EXPENSE') return total + line.debit_total_minor - line.credit_total_minor;
      return total + line.credit_total_minor - line.debit_total_minor;
    }, 0);
}

function digestReportingPack(receiptWithoutDigest: Omit<FinancialReportingPackReceipt, 'reporting_pack_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function generateFinancialReportingPack(input: FinancialReportingPackInput): FinancialReportingPackReceipt {
  if (input.frontend_screen_requested === true) {
    throw new Error('financial reporting pack must not create frontend screens.');
  }
  if (input.external_publication_requested === true) {
    throw new Error('financial reporting pack must not publish reports externally.');
  }
  if (input.journal_posting_requested === true) {
    throw new Error('financial reporting pack must not post journals.');
  }
  if (input.period_close_requested === true) {
    throw new Error('financial reporting pack must not close periods.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('financial reporting pack must not perform payment allocation math.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('financial reporting pack must not perform irreversible actions.');
  }

  const trialBalanceLines = normalizeTrialBalanceLines(input.trial_balance_lines);
  const reportEvidenceRefs = normalizeEvidenceRefs(input.report_evidence_refs);
  const assetTotalMinor = netByType(trialBalanceLines, 'ASSET');
  const liabilityTotalMinor = netByType(trialBalanceLines, 'LIABILITY');
  const equityTotalMinor = netByType(trialBalanceLines, 'EQUITY');
  const revenueTotalMinor = netByType(trialBalanceLines, 'REVENUE');
  const expenseTotalMinor = netByType(trialBalanceLines, 'EXPENSE');
  const netIncomeMinor = revenueTotalMinor - expenseTotalMinor;
  const balanceSheetCheckMinor = assetTotalMinor - (liabilityTotalMinor + equityTotalMinor + netIncomeMinor);
  if (balanceSheetCheckMinor !== 0) {
    throw new Error('financial reporting pack requires a balanced balance sheet equation.');
  }
  const reportingPackRef = requireNonEmpty(input.reporting_pack_ref, 'reporting_pack_ref');

  const receiptWithoutDigest: Omit<FinancialReportingPackReceipt, 'reporting_pack_digest'> = {
    seed_id: PHASE_6B_FINANCIAL_REPORTING_PACK_SEED_ID,
    component_id: PHASE_6B_FINANCIAL_REPORTING_PACK_COMPONENT_ID,
    event_name: FINANCIAL_REPORTING_PACK_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_seed_id: requireSourceSeed(input.source_seed_id),
    reporting_pack_ref: reportingPackRef,
    accounting_period_ref: requireNonEmpty(input.accounting_period_ref, 'accounting_period_ref'),
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    invoice_record_authority_ref: requireNonEmpty(input.invoice_record_authority_ref, 'invoice_record_authority_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    expense_record_authority_ref: requireNonEmpty(input.expense_record_authority_ref, 'expense_record_authority_ref'),
    report_currency_code: normalizeCurrency(input.report_currency_code),
    trial_balance_lines: trialBalanceLines,
    trial_balance_line_count: trialBalanceLines.length,
    asset_total_minor: assetTotalMinor,
    liability_total_minor: liabilityTotalMinor,
    equity_total_minor: equityTotalMinor,
    revenue_total_minor: revenueTotalMinor,
    expense_total_minor: expenseTotalMinor,
    net_income_minor: netIncomeMinor,
    balance_sheet_check_minor: 0,
    trial_balance_balanced: true,
    report_evidence_refs: reportEvidenceRefs,
    report_evidence_count: reportEvidenceRefs.length,
    financial_reporting_pack_generated: true,
    frontend_screen_created: false,
    external_publication_performed: false,
    journal_posting_performed: false,
    period_closed: false,
    payment_allocation_performed: false,
    irreversible_action_allowed: false,
    reporting_pack_evidence_ref: `financial_reporting_pack:${reportingPackRef}:generated`,
    generated_by_user_id: requireNonEmpty(input.generated_by_user_id, 'generated_by_user_id'),
    generated_at: requireTimestamp(input.generated_at, 'generated_at'),
  };

  return {
    ...receiptWithoutDigest,
    reporting_pack_digest: digestReportingPack(receiptWithoutDigest),
  };
}
