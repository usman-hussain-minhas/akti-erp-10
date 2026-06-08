import { createHash } from 'node:crypto';

export const PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID = 'seed_6b_12_chart_of_accounts' as const;
export const PHASE_6B_CHART_OF_ACCOUNTS_COMPONENT_ID = '6B.12' as const;

export const CHART_OF_ACCOUNTS_EVENT = 'phase_6b.general_ledger_accounting.chart_of_accounts.configured' as const;

export type ChartAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE' | 'TAX';
export type ChartNormalBalance = 'DEBIT' | 'CREDIT';
export type ChartPostingPolicy = 'POSTING_ALLOWED' | 'SUMMARY_ONLY';
export type ChartSourceFinanceEvent = 'invoice.issued' | 'payment.verified' | 'expense.created';

export type ChartAccountInput = {
  account_ref: string;
  account_code: string;
  account_name: string;
  account_type: ChartAccountType;
  normal_balance: ChartNormalBalance;
  posting_policy: ChartPostingPolicy;
  parent_account_ref?: string;
};

export type ChartFinanceEventMappingInput = {
  mapping_ref: string;
  source_event_name: ChartSourceFinanceEvent;
  account_ref: string;
  entry_side: ChartNormalBalance;
  mapping_evidence_ref: string;
};

export type ChartOfAccountsInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID;
  chart_version_ref: string;
  base_currency_code: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  accounts: ChartAccountInput[];
  finance_event_mappings: ChartFinanceEventMappingInput[];
  configured_by_user_id: string;
  configured_at: string;
  journal_posting_requested?: boolean;
  period_close_requested?: boolean;
  tax_report_generation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type ChartOfAccountsReceipt = {
  seed_id: typeof PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID;
  component_id: typeof PHASE_6B_CHART_OF_ACCOUNTS_COMPONENT_ID;
  event_name: typeof CHART_OF_ACCOUNTS_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_chart_of_account_model: 'Phase6BChartOfAccount';
  source_seed_id: typeof PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID;
  chart_version_ref: string;
  base_currency_code: string;
  invoice_record_authority_ref: string;
  payment_allocation_balance_ref: string;
  expense_record_authority_ref: string;
  accounts: ChartAccountInput[];
  finance_event_mappings: ChartFinanceEventMappingInput[];
  account_count: number;
  finance_event_mapping_count: number;
  accounting_periods_protected: true;
  chart_configuration_evidence_ref: string;
  chart_of_accounts_digest: string;
  journal_posting_performed: false;
  period_closed: false;
  tax_report_generated: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};

const ACCOUNT_TYPES: readonly ChartAccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'TAX'] as const;
const NORMAL_BALANCES: readonly ChartNormalBalance[] = ['DEBIT', 'CREDIT'] as const;
const POSTING_POLICIES: readonly ChartPostingPolicy[] = ['POSTING_ALLOWED', 'SUMMARY_ONLY'] as const;
const SOURCE_FINANCE_EVENTS: readonly ChartSourceFinanceEvent[] = ['invoice.issued', 'payment.verified', 'expense.created'] as const;
const ACCOUNT_CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]*$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for chart of accounts.`);
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for chart of accounts.`);
  }
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID) {
    throw new Error('source_seed_id must match seed_6b_12_chart_of_accounts.');
  }
  return PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID;
}

function normalizeCurrency(value: string): string {
  const currency = requireNonEmpty(value, 'base_currency_code').toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) {
    throw new Error('base_currency_code must be a three-letter ISO-style code for chart of accounts.');
  }
  return currency;
}

function requireAccountType(value: ChartAccountType): ChartAccountType {
  if (!ACCOUNT_TYPES.includes(value)) {
    throw new Error('account_type is not supported for chart of accounts.');
  }
  return value;
}

function requireNormalBalance(value: ChartNormalBalance, field: string): ChartNormalBalance {
  if (!NORMAL_BALANCES.includes(value)) {
    throw new Error(`${field} is not supported for chart of accounts.`);
  }
  return value;
}

function requirePostingPolicy(value: ChartPostingPolicy): ChartPostingPolicy {
  if (!POSTING_POLICIES.includes(value)) {
    throw new Error('posting_policy is not supported for chart of accounts.');
  }
  return value;
}

function requireSourceFinanceEvent(value: ChartSourceFinanceEvent): ChartSourceFinanceEvent {
  if (!SOURCE_FINANCE_EVENTS.includes(value)) {
    throw new Error('source_event_name is not supported for chart of accounts.');
  }
  return value;
}

function normalizeAccount(account: ChartAccountInput): ChartAccountInput {
  const accountCode = requireNonEmpty(account.account_code, 'accounts.account_code').toUpperCase();
  if (!ACCOUNT_CODE_PATTERN.test(accountCode)) {
    throw new Error('account_code must use uppercase letters, numbers, dot, underscore, or hyphen for chart of accounts.');
  }
  return {
    account_ref: requireNonEmpty(account.account_ref, 'accounts.account_ref'),
    account_code: accountCode,
    account_name: requireNonEmpty(account.account_name, 'accounts.account_name'),
    account_type: requireAccountType(account.account_type),
    normal_balance: requireNormalBalance(account.normal_balance, 'normal_balance'),
    posting_policy: requirePostingPolicy(account.posting_policy),
    parent_account_ref: optionalNonEmpty(account.parent_account_ref, 'accounts.parent_account_ref'),
  };
}

function normalizeAccounts(accounts: ChartAccountInput[]): ChartAccountInput[] {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error('accounts must include at least one account for chart of accounts.');
  }
  const normalized = accounts.map(normalizeAccount);
  for (const field of ['account_ref', 'account_code'] as const) {
    const values = normalized.map((account) => account[field]);
    if (new Set(values).size !== values.length) {
      throw new Error(`accounts must not repeat ${field} for chart of accounts.`);
    }
  }
  const accountRefs = new Set(normalized.map((account) => account.account_ref));
  for (const account of normalized) {
    if (account.parent_account_ref === account.account_ref) {
      throw new Error('parent_account_ref must not equal account_ref for chart of accounts.');
    }
    if (account.parent_account_ref !== undefined && !accountRefs.has(account.parent_account_ref)) {
      throw new Error('parent_account_ref must reference another account in the same chart of accounts.');
    }
  }
  return normalized;
}

function normalizeMapping(mapping: ChartFinanceEventMappingInput, accountRefs: Set<string>): ChartFinanceEventMappingInput {
  const accountRef = requireNonEmpty(mapping.account_ref, 'finance_event_mappings.account_ref');
  if (!accountRefs.has(accountRef)) {
    throw new Error('finance_event_mappings.account_ref must reference an account in the chart of accounts.');
  }
  return {
    mapping_ref: requireNonEmpty(mapping.mapping_ref, 'finance_event_mappings.mapping_ref'),
    source_event_name: requireSourceFinanceEvent(mapping.source_event_name),
    account_ref: accountRef,
    entry_side: requireNormalBalance(mapping.entry_side, 'entry_side'),
    mapping_evidence_ref: requireNonEmpty(mapping.mapping_evidence_ref, 'finance_event_mappings.mapping_evidence_ref'),
  };
}

function normalizeMappings(mappings: ChartFinanceEventMappingInput[], accounts: ChartAccountInput[]): ChartFinanceEventMappingInput[] {
  if (!Array.isArray(mappings) || mappings.length === 0) {
    throw new Error('finance_event_mappings must include at least one mapping for chart of accounts.');
  }
  const accountRefs = new Set(accounts.map((account) => account.account_ref));
  const normalized = mappings.map((mapping) => normalizeMapping(mapping, accountRefs));
  const mappingRefs = normalized.map((mapping) => mapping.mapping_ref);
  if (new Set(mappingRefs).size !== mappingRefs.length) {
    throw new Error('finance_event_mappings must not repeat mapping_ref for chart of accounts.');
  }
  return normalized;
}

function digestChartOfAccounts(receiptWithoutDigest: Omit<ChartOfAccountsReceipt, 'chart_of_accounts_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function configureChartOfAccounts(input: ChartOfAccountsInput): ChartOfAccountsReceipt {
  if (input.journal_posting_requested === true) {
    throw new Error('chart of accounts must not post journals.');
  }
  if (input.period_close_requested === true) {
    throw new Error('chart of accounts must not close accounting periods.');
  }
  if (input.tax_report_generation_requested === true) {
    throw new Error('chart of accounts must not generate tax reports.');
  }
  if (input.payment_allocation_requested === true) {
    throw new Error('chart of accounts must not perform payment allocation math.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('chart of accounts must not perform irreversible actions.');
  }

  const accounts = normalizeAccounts(input.accounts);
  const financeEventMappings = normalizeMappings(input.finance_event_mappings, accounts);
  const chartVersionRef = requireNonEmpty(input.chart_version_ref, 'chart_version_ref');

  const receiptWithoutDigest: Omit<ChartOfAccountsReceipt, 'chart_of_accounts_digest'> = {
    seed_id: PHASE_6B_CHART_OF_ACCOUNTS_SEED_ID,
    component_id: PHASE_6B_CHART_OF_ACCOUNTS_COMPONENT_ID,
    event_name: CHART_OF_ACCOUNTS_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_chart_of_account_model: 'Phase6BChartOfAccount',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    chart_version_ref: chartVersionRef,
    base_currency_code: normalizeCurrency(input.base_currency_code),
    invoice_record_authority_ref: requireNonEmpty(input.invoice_record_authority_ref, 'invoice_record_authority_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    expense_record_authority_ref: requireNonEmpty(input.expense_record_authority_ref, 'expense_record_authority_ref'),
    accounts,
    finance_event_mappings: financeEventMappings,
    account_count: accounts.length,
    finance_event_mapping_count: financeEventMappings.length,
    accounting_periods_protected: true,
    chart_configuration_evidence_ref: `chart_of_accounts:${chartVersionRef}:configured`,
    journal_posting_performed: false,
    period_closed: false,
    tax_report_generated: false,
    payment_allocation_performed: false,
    irreversible_action_allowed: false,
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireTimestamp(input.configured_at, 'configured_at'),
  };

  return {
    ...receiptWithoutDigest,
    chart_of_accounts_digest: digestChartOfAccounts(receiptWithoutDigest),
  };
}
