import assert from 'node:assert/strict';
import {
  evaluateAgingAndOverdueManagement,
  type AgingAndOverdueManagementInput,
} from './aging_and_overdue_management.service';

const baseInput: AgingAndOverdueManagementInput = {
  organization_id: 'org_akti_demo',
  service_manifest_contract_id: 'smc_finance_invoice_receivables',
  product_record_authority_ref: 'product_record_authority_001',
  product_price_history_ref: 'product_price_history_001',
  pricing_table_effective_date_ref: 'pricing_table_effective_date_001',
  pipeline_stage_model_ref: 'pipeline_stage_model_001',
  visual_workflow_builder_ref: 'visual_workflow_builder_001',
  as_of: '2026-07-15T00:00:00.000Z',
  managed_by_user_id: 'user_finance_owner_001',
  aging_policy: [
    {
      bucket_id: 'current',
      label: 'Current',
      min_days_past_due: 0,
      max_days_past_due: 0,
      pipeline_stage_model_ref: 'pipeline_current',
      visual_workflow_builder_ref: 'workflow_current',
      requires_manual_review: false,
    },
    {
      bucket_id: 'one_to_thirty',
      label: '1-30 days',
      min_days_past_due: 1,
      max_days_past_due: 30,
      pipeline_stage_model_ref: 'pipeline_soft_overdue',
      visual_workflow_builder_ref: 'workflow_soft_overdue',
      requires_manual_review: false,
    },
    {
      bucket_id: 'thirty_one_plus',
      label: '31+ days',
      min_days_past_due: 31,
      pipeline_stage_model_ref: 'pipeline_manual_review',
      visual_workflow_builder_ref: 'workflow_manual_review',
      requires_manual_review: true,
    },
  ],
  receivables: [
    {
      receivable_id: 'receivable_current',
      invoice_record_ref: 'invoice_current',
      currency_code: 'usd',
      receivable_balance_minor: 12000,
      due_at: '2026-07-20T00:00:00.000Z',
      issued_at: '2026-07-01T00:00:00.000Z',
      customer_account_ref: 'customer_001',
      payment_terms_ref: 'terms_net_20',
      credit_note_total_minor: 0,
      debit_note_total_minor: 0,
      applied_payment_total_minor: 0,
    },
    {
      receivable_id: 'receivable_overdue',
      invoice_record_ref: 'invoice_overdue',
      currency_code: 'PKR',
      receivable_balance_minor: 26000,
      due_at: '2026-06-10T00:00:00.000Z',
      issued_at: '2026-05-15T00:00:00.000Z',
      customer_account_ref: 'customer_002',
      payment_terms_ref: 'terms_net_25',
      credit_note_total_minor: 1000,
      debit_note_total_minor: 2000,
      applied_payment_total_minor: 5000,
    },
    {
      receivable_id: 'receivable_settled',
      invoice_record_ref: 'invoice_settled',
      currency_code: 'USD',
      receivable_balance_minor: 0,
      due_at: '2026-06-01T00:00:00.000Z',
      issued_at: '2026-05-01T00:00:00.000Z',
      customer_account_ref: 'customer_003',
      payment_terms_ref: 'terms_due_on_receipt',
      credit_note_total_minor: 500,
      debit_note_total_minor: 0,
      applied_payment_total_minor: 15000,
    },
  ],
};

const receipt = evaluateAgingAndOverdueManagement(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_09_aging_and_overdue_management');
assert.equal(receipt.component_id, '6B.09');
assert.equal(receipt.event_name, 'phase_6b.finance_invoice_receivables.aging_overdue.evaluated');
assert.equal(receipt.total_receivable_count, 3);
assert.equal(receipt.current_receivable_count, 1);
assert.equal(receipt.overdue_receivable_count, 1);
assert.equal(receipt.settled_receivable_count, 1);
assert.deepEqual(receipt.total_open_balance_minor_by_currency, { USD: 12000, PKR: 26000 });
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.communication_send_performed, false);
assert.equal(receipt.provider_callback_processing_allowed, false);
assert.equal(receipt.irreversible_action_allowed, false);

const current = receipt.evaluations.find((evaluation) => evaluation.receivable_id === 'receivable_current');
assert.ok(current);
assert.equal(current.status, 'CURRENT');
assert.equal(current.days_past_due, 0);
assert.equal(current.aging_bucket_id, 'current');
assert.equal(current.disposition, 'NO_ACTION');
assert.equal(current.currency_code, 'USD');

const overdue = receipt.evaluations.find((evaluation) => evaluation.receivable_id === 'receivable_overdue');
assert.ok(overdue);
assert.equal(overdue.status, 'OVERDUE');
assert.equal(overdue.days_past_due, 35);
assert.equal(overdue.aging_bucket_id, 'thirty_one_plus');
assert.equal(overdue.pipeline_stage_model_ref, 'pipeline_manual_review');
assert.equal(overdue.visual_workflow_builder_ref, 'workflow_manual_review');
assert.equal(overdue.disposition, 'MANUAL_REVIEW');
assert.equal(overdue.credit_note_total_minor, 1000);
assert.equal(overdue.debit_note_total_minor, 2000);
assert.equal(overdue.applied_payment_total_minor, 5000);

const settled = receipt.evaluations.find((evaluation) => evaluation.receivable_id === 'receivable_settled');
assert.ok(settled);
assert.equal(settled.status, 'SETTLED');
assert.equal(settled.days_past_due, 0);
assert.equal(settled.disposition, 'NO_ACTION');

const workflowEscalation = evaluateAgingAndOverdueManagement({
  ...baseInput,
  receivables: [
    {
      ...baseInput.receivables[0],
      receivable_id: 'receivable_escalation',
      due_at: '2026-07-01T00:00:00.000Z',
      receivable_balance_minor: 9000,
    },
  ],
});
assert.equal(workflowEscalation.evaluations[0].aging_bucket_id, 'one_to_thirty');
assert.equal(workflowEscalation.evaluations[0].disposition, 'WORKFLOW_ESCALATION');

assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, product_record_authority_ref: '' }), /product_record_authority_ref is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, product_price_history_ref: '' }), /product_price_history_ref is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, pricing_table_effective_date_ref: '' }), /pricing_table_effective_date_ref is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, pipeline_stage_model_ref: '' }), /pipeline_stage_model_ref is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, visual_workflow_builder_ref: '' }), /visual_workflow_builder_ref is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, managed_by_user_id: '' }), /managed_by_user_id is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, as_of: 'not-a-date' }), /as_of must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, aging_policy: [] }), /aging_policy must include at least one bucket/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, aging_policy: [{ ...baseInput.aging_policy[0], min_days_past_due: -1 }] }), /min_days_past_due must be a non-negative integer/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, aging_policy: [{ ...baseInput.aging_policy[0], max_days_past_due: -1 }] }), /max_days_past_due must be greater than or equal/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, aging_policy: [{ ...baseInput.aging_policy[0], bucket_id: '' }] }), /aging_policy.bucket_id is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, aging_policy: [baseInput.aging_policy[0], baseInput.aging_policy[0]] }), /bucket_id values must be unique/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: undefined as never }), /receivables must be an array/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], receivable_id: '' }] }), /receivable_id is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], invoice_record_ref: '' }] }), /invoice_record_ref is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], customer_account_ref: '' }] }), /customer_account_ref is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], payment_terms_ref: '' }] }), /payment_terms_ref is required/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], currency_code: 'US' }] }), /currency_code must be a three-letter/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], receivable_balance_minor: -1 }] }), /receivable_balance_minor must be a non-negative integer/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], credit_note_total_minor: -1 }] }), /credit_note_total_minor must be a non-negative integer/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], debit_note_total_minor: -1 }] }), /debit_note_total_minor must be a non-negative integer/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], applied_payment_total_minor: -1 }] }), /applied_payment_total_minor must be a non-negative integer/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], issued_at: 'not-a-date' }] }), /issued_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], due_at: 'not-a-date' }] }), /due_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, receivables: [{ ...baseInput.receivables[0], due_at: '2026-06-01T00:00:00.000Z', issued_at: '2026-06-02T00:00:00.000Z' }] }), /due_at must not be earlier than issued_at/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, aging_policy: [baseInput.aging_policy[0]], receivables: [{ ...baseInput.receivables[1], due_at: '2026-06-10T00:00:00.000Z' }] }), /aging_policy does not cover 35 days past due/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, communication_send_requested: true }), /must not send communications/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, provider_callback_requested: true }), /must not process provider callbacks/);
assert.throws(() => evaluateAgingAndOverdueManagement({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-068 aging and overdue management service test passed.');
