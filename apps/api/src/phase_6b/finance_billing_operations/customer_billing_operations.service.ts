import { createHash } from 'node:crypto';

export const PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID = 'seed_6b_15_customer_billing_operations' as const;
export const PHASE_6B_FINANCE_BILLING_OPERATIONS_COMPONENT_ID = '6B.15' as const;
export const CUSTOMER_BILLING_OPERATIONS_EVENT = 'phase_6b.finance_billing.customer_operations_summarized' as const;

export type BillingServiceSpendInput = { service_ref: string; pricing_table_ref: string; optimization_fact_ref: string; usage_evidence_ref: string; spend_minor: number; currency_code: string };
export type BillingBudgetCapInput = { budget_cap_ref: string; service_ref: string; cap_amount_minor: number; current_spend_minor: number; currency_code: string };
export type CustomerBillingOperationsInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID;
  billing_operations_ref: string;
  customer_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  billing_period_start_at: string;
  billing_period_end_at: string;
  base_currency_code: string;
  service_spend: BillingServiceSpendInput[];
  budget_caps: BillingBudgetCapInput[];
  requested_by_user_id: string;
  requested_at: string;
  invoice_generation_requested?: boolean;
  proration_requested?: boolean;
  dunning_requested?: boolean;
  payment_collection_requested?: boolean;
  journal_posting_requested?: boolean;
  irreversible_action_requested?: boolean;
};
export type CustomerBillingOperationsReceipt = {
  seed_id: typeof PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_BILLING_OPERATIONS_COMPONENT_ID;
  event_name: typeof CUSTOMER_BILLING_OPERATIONS_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_billing_operation_model: 'Phase6BBillingOperation';
  phase_6b_budget_cap_model: 'Phase6BBudgetCap';
  source_seed_id: typeof PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID;
  billing_operations_ref: string;
  customer_account_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  billing_period_start_at: string;
  billing_period_end_at: string;
  base_currency_code: string;
  service_count: number;
  budget_cap_count: number;
  total_spend_minor: number;
  budget_cap_breach_count: number;
  budget_cap_warning_count: number;
  operation_evidence_ref: string;
  operation_digest: string;
  invoice_generated: false;
  proration_performed: false;
  dunning_performed: false;
  payment_collected: false;
  journal_posted: false;
  irreversible_action_allowed: false;
  requested_by_user_id: string;
  requested_at: string;
};

const CURRENCY_PATTERN = /^[A-Z]{3}$/;
function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${field} is required for customer billing operations.`);
  return value.trim();
}
function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) throw new Error(`${field} must be a valid ISO-compatible timestamp for customer billing operations.`);
  return normalized;
}
function requireSourceSeed(value: string): typeof PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID) throw new Error('source_seed_id must match seed_6b_15_customer_billing_operations.');
  return PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID;
}
function normalizeCurrency(value: string, field: string): string {
  const currency = requireNonEmpty(value, field).toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) throw new Error(`${field} must be a three-letter ISO-style code for customer billing operations.`);
  return currency;
}
function requireNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer for customer billing operations.`);
  return value;
}
function normalizeSpend(row: BillingServiceSpendInput, expectedCurrency: string): BillingServiceSpendInput {
  const currency = normalizeCurrency(row.currency_code, 'service_spend.currency_code');
  if (currency !== expectedCurrency) throw new Error('service_spend.currency_code must match base_currency_code for customer billing operations.');
  return {
    service_ref: requireNonEmpty(row.service_ref, 'service_spend.service_ref'),
    pricing_table_ref: requireNonEmpty(row.pricing_table_ref, 'service_spend.pricing_table_ref'),
    optimization_fact_ref: requireNonEmpty(row.optimization_fact_ref, 'service_spend.optimization_fact_ref'),
    usage_evidence_ref: requireNonEmpty(row.usage_evidence_ref, 'service_spend.usage_evidence_ref'),
    spend_minor: requireNonNegativeInteger(row.spend_minor, 'service_spend.spend_minor'),
    currency_code: currency,
  };
}
function normalizeServiceSpend(rows: BillingServiceSpendInput[], expectedCurrency: string): BillingServiceSpendInput[] {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('service_spend must include at least one service for customer billing operations.');
  const normalized = rows.map((row) => normalizeSpend(row, expectedCurrency));
  const serviceRefs = normalized.map((row) => row.service_ref);
  if (new Set(serviceRefs).size !== serviceRefs.length) throw new Error('service_spend must not repeat service_ref for customer billing operations.');
  return normalized;
}
function normalizeBudgetCap(row: BillingBudgetCapInput, expectedCurrency: string, serviceRefs: Set<string>): BillingBudgetCapInput {
  const currency = normalizeCurrency(row.currency_code, 'budget_caps.currency_code');
  if (currency !== expectedCurrency) throw new Error('budget_caps.currency_code must match base_currency_code for customer billing operations.');
  const serviceRef = requireNonEmpty(row.service_ref, 'budget_caps.service_ref');
  if (!serviceRefs.has(serviceRef)) throw new Error('budget_caps.service_ref must reference service_spend for customer billing operations.');
  return {
    budget_cap_ref: requireNonEmpty(row.budget_cap_ref, 'budget_caps.budget_cap_ref'),
    service_ref: serviceRef,
    cap_amount_minor: requireNonNegativeInteger(row.cap_amount_minor, 'budget_caps.cap_amount_minor'),
    current_spend_minor: requireNonNegativeInteger(row.current_spend_minor, 'budget_caps.current_spend_minor'),
    currency_code: currency,
  };
}
function normalizeBudgetCaps(rows: BillingBudgetCapInput[], expectedCurrency: string, serviceRefs: Set<string>): BillingBudgetCapInput[] {
  const normalized = (rows ?? []).map((row) => normalizeBudgetCap(row, expectedCurrency, serviceRefs));
  const refs = normalized.map((row) => row.budget_cap_ref);
  if (new Set(refs).size !== refs.length) throw new Error('budget_caps must not repeat budget_cap_ref for customer billing operations.');
  return normalized;
}
function digestOperations(receiptWithoutDigest: Omit<CustomerBillingOperationsReceipt, 'operation_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}
export function summarizeCustomerBillingOperations(input: CustomerBillingOperationsInput): CustomerBillingOperationsReceipt {
  if (input.invoice_generation_requested === true) throw new Error('customer billing operations must not generate invoices.');
  if (input.proration_requested === true) throw new Error('customer billing operations must not calculate proration.');
  if (input.dunning_requested === true) throw new Error('customer billing operations must not perform dunning actions.');
  if (input.payment_collection_requested === true) throw new Error('customer billing operations must not collect payments.');
  if (input.journal_posting_requested === true) throw new Error('customer billing operations must not post journals.');
  if (input.irreversible_action_requested === true) throw new Error('customer billing operations must not perform irreversible actions.');
  const start = requireTimestamp(input.billing_period_start_at, 'billing_period_start_at');
  const end = requireTimestamp(input.billing_period_end_at, 'billing_period_end_at');
  if (Date.parse(end) < Date.parse(start)) throw new Error('billing_period_end_at must not be earlier than billing_period_start_at.');
  const currency = normalizeCurrency(input.base_currency_code, 'base_currency_code');
  const serviceSpend = normalizeServiceSpend(input.service_spend, currency);
  const budgetCaps = normalizeBudgetCaps(input.budget_caps, currency, new Set(serviceSpend.map((row) => row.service_ref)));
  const receiptWithoutDigest: Omit<CustomerBillingOperationsReceipt, 'operation_digest'> = {
    seed_id: PHASE_6B_CUSTOMER_BILLING_OPERATIONS_SEED_ID,
    component_id: PHASE_6B_FINANCE_BILLING_OPERATIONS_COMPONENT_ID,
    event_name: CUSTOMER_BILLING_OPERATIONS_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_billing_operation_model: 'Phase6BBillingOperation',
    phase_6b_budget_cap_model: 'Phase6BBudgetCap',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    billing_operations_ref: requireNonEmpty(input.billing_operations_ref, 'billing_operations_ref'),
    customer_account_ref: requireNonEmpty(input.customer_account_ref, 'customer_account_ref'),
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    billing_period_start_at: start,
    billing_period_end_at: end,
    base_currency_code: currency,
    service_count: serviceSpend.length,
    budget_cap_count: budgetCaps.length,
    total_spend_minor: serviceSpend.reduce((total, row) => total + row.spend_minor, 0),
    budget_cap_breach_count: budgetCaps.filter((cap) => cap.current_spend_minor > cap.cap_amount_minor).length,
    budget_cap_warning_count: budgetCaps.filter((cap) => cap.current_spend_minor <= cap.cap_amount_minor && cap.current_spend_minor >= Math.floor(cap.cap_amount_minor * 0.8)).length,
    operation_evidence_ref: `customer_billing_operations:${input.billing_operations_ref}:summarized`,
    invoice_generated: false,
    proration_performed: false,
    dunning_performed: false,
    payment_collected: false,
    journal_posted: false,
    irreversible_action_allowed: false,
    requested_by_user_id: requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id'),
    requested_at: requireTimestamp(input.requested_at, 'requested_at'),
  };
  return { ...receiptWithoutDigest, operation_digest: digestOperations(receiptWithoutDigest) };
}
