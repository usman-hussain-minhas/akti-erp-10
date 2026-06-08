import assert from 'node:assert/strict';
import { summarizeCustomerBillingOperations, type CustomerBillingOperationsInput } from './customer_billing_operations.service';

const baseInput: CustomerBillingOperationsInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_finance_billing_operations',
  source_seed_id: 'seed_6b_15_customer_billing_operations',
  billing_operations_ref: 'billing_ops_2026_06',
  customer_account_ref: 'customer_account_001',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  billing_period_start_at: '2026-06-01T00:00:00.000Z',
  billing_period_end_at: '2026-06-30T23:59:59.000Z',
  base_currency_code: 'usd',
  requested_by_user_id: 'user_billing_ops_001',
  requested_at: '2026-06-08T00:00:00.000Z',
  service_spend: [
    { service_ref: 'svc_foundry', pricing_table_ref: 'pricing_2026_v1', optimization_fact_ref: 'fact_foundry_usage', usage_evidence_ref: 'usage:foundry:2026_06', spend_minor: 100000, currency_code: 'USD' },
    { service_ref: 'svc_billing', pricing_table_ref: 'pricing_2026_v1', optimization_fact_ref: 'fact_billing_usage', usage_evidence_ref: 'usage:billing:2026_06', spend_minor: 85000, currency_code: 'usd' },
  ],
  budget_caps: [
    { budget_cap_ref: 'cap_foundry', service_ref: 'svc_foundry', cap_amount_minor: 120000, current_spend_minor: 100000, currency_code: 'USD' },
    { budget_cap_ref: 'cap_billing', service_ref: 'svc_billing', cap_amount_minor: 80000, current_spend_minor: 85000, currency_code: 'USD' },
  ],
};

const receipt = summarizeCustomerBillingOperations(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_15_customer_billing_operations');
assert.equal(receipt.component_id, '6B.15');
assert.equal(receipt.event_name, 'phase_6b.finance_billing.customer_operations_summarized');
assert.equal(receipt.phase_6b_billing_operation_model, 'Phase6BBillingOperation');
assert.equal(receipt.phase_6b_budget_cap_model, 'Phase6BBudgetCap');
assert.equal(receipt.source_seed_id, 'seed_6b_15_customer_billing_operations');
assert.equal(receipt.base_currency_code, 'USD');
assert.equal(receipt.service_count, 2);
assert.equal(receipt.budget_cap_count, 2);
assert.equal(receipt.total_spend_minor, 185000);
assert.equal(receipt.budget_cap_breach_count, 1);
assert.equal(receipt.budget_cap_warning_count, 1);
assert.equal(receipt.operation_evidence_ref, 'customer_billing_operations:billing_ops_2026_06:summarized');
assert.equal(receipt.invoice_generated, false);
assert.equal(receipt.proration_performed, false);
assert.equal(receipt.dunning_performed, false);
assert.equal(receipt.payment_collected, false);
assert.equal(receipt.journal_posted, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.operation_digest.length, 64);

assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, billing_operations_ref: '' }), /billing_operations_ref is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, customer_account_ref: '' }), /customer_account_ref is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, billing_period_start_at: 'not-a-date' }), /billing_period_start_at must be a valid ISO-compatible timestamp/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, billing_period_end_at: '2026-05-31T00:00:00.000Z' }), /billing_period_end_at must not be earlier/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, base_currency_code: 'US' }), /base_currency_code must be a three-letter/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, service_spend: [] }), /service_spend must include at least one service/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, service_spend: [{ ...baseInput.service_spend[0], service_ref: '' }] }), /service_spend.service_ref is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, service_spend: [{ ...baseInput.service_spend[0], pricing_table_ref: '' }] }), /service_spend.pricing_table_ref is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, service_spend: [{ ...baseInput.service_spend[0], spend_minor: -1 }] }), /service_spend.spend_minor must be a non-negative integer/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, service_spend: [baseInput.service_spend[0], baseInput.service_spend[0]] }), /service_spend must not repeat service_ref/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, budget_caps: [{ ...baseInput.budget_caps[0], service_ref: 'missing_service' }] }), /budget_caps.service_ref must reference/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, budget_caps: [baseInput.budget_caps[0], baseInput.budget_caps[0]] }), /budget_caps must not repeat budget_cap_ref/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, requested_by_user_id: '' }), /requested_by_user_id is required/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, requested_at: 'not-a-date' }), /requested_at must be a valid ISO-compatible timestamp/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, invoice_generation_requested: true }), /must not generate invoices/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, proration_requested: true }), /must not calculate proration/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, dunning_requested: true }), /must not perform dunning actions/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, payment_collection_requested: true }), /must not collect payments/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => summarizeCustomerBillingOperations({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-099 customer billing operations service test passed.');
