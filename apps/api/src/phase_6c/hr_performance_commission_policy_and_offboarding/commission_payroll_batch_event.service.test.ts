import assert from 'node:assert/strict';

import { prepareCommissionPayrollBatchEvent, type CommissionPayrollBatchEventInput } from './commission_payroll_batch_event.service';

const baseInput: CommissionPayrollBatchEventInput = {
  organization_id: 'org_phase_6c_commission',
  service_manifest_contract_id: 'smc_phase_6c_commission_payroll_batch_event',
  source_record_ref: 'commission_payroll_batch_source_2026_06',
  payroll_batch_ref: 'payroll_batch_2026_06_commissions',
  payroll_period_ref: 'payroll_period_2026_06',
  currency: 'USD',
  event_sequence: 7,
  commission_lines: [
    {
      commission_receipt_ref: 'commission_receipt_001',
      employee_ref: 'employee_sales_001',
      commission_plan_ref: 'plan_standard_sales_commission',
      payable_commission_amount: 800,
      approved_for_payroll: true,
      payroll_input_code: 'COMMISSION_EARNING',
      evidence_refs: ['commission_calc_001', 'commission_release_001'],
    },
    {
      commission_receipt_ref: 'commission_reversal_001',
      employee_ref: 'employee_sales_002',
      commission_plan_ref: 'plan_standard_sales_commission',
      payable_commission_amount: 100,
      approved_for_payroll: true,
      payroll_input_code: 'COMMISSION_REVERSAL',
      evidence_refs: ['clawback_reversal_001'],
    },
    {
      commission_receipt_ref: 'commission_review_001',
      employee_ref: 'employee_sales_003',
      commission_plan_ref: 'plan_enterprise_sales_commission',
      payable_commission_amount: 200,
      approved_for_payroll: false,
      payroll_input_code: 'COMMISSION_ADJUSTMENT',
      review_note: 'manager approval pending',
      evidence_refs: ['manual_review_001'],
    },
  ],
  evaluated_by_user_id: 'user_commission_payroll_event',
  evaluated_at: '2026-06-15T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_048' },
};

const partialReceipt = prepareCommissionPayrollBatchEvent(baseInput);
assert.equal(partialReceipt.seed_id, 'seed_6c_048_commission_payroll_batch_event');
assert.equal(partialReceipt.component_id, '6C.04');
assert.equal(partialReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(partialReceipt.model_name, 'Phase6CCommissionPayrollBatchEvent');
assert.equal(partialReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.commission_payroll_batch_event.prepared');
assert.equal(partialReceipt.approved_line_count, 2);
assert.equal(partialReceipt.review_line_count, 1);
assert.equal(partialReceipt.approved_payroll_amount_total, 900);
assert.equal(partialReceipt.decision, 'PAYROLL_BATCH_EVENT_PARTIAL_REVIEW');
assert.notEqual(partialReceipt.event_payload, null);
assert.equal(partialReceipt.event_payload?.event_name, 'phase_6c.commission.payroll_batch.approved');
assert.equal(partialReceipt.event_payload?.line_count, 2);
assert.equal(partialReceipt.event_payload?.total_payroll_amount, 900);
assert.equal(partialReceipt.event_payload?.lines[0].payroll_input_code, 'COMMISSION_EARNING');
assert.equal(partialReceipt.event_payload?.lines[1].payroll_input_code, 'COMMISSION_REVERSAL');
assert.equal(partialReceipt.payroll_mutation_allowed, false);
assert.equal(partialReceipt.payment_mutation_allowed, false);
assert.equal(partialReceipt.crm_mutation_allowed, false);
assert.equal(partialReceipt.event_dispatch_allowed, false);
assert.equal(partialReceipt.provider_specific_adapter_allowed, false);
assert.equal(partialReceipt.schema_mutation_allowed, false);
assert.equal(partialReceipt.phase_6a_mutation_allowed, false);
assert.equal(partialReceipt.phase_6b_mutation_allowed, false);
assert.equal(partialReceipt.runtime_adapter_allowed, false);
assert.equal(partialReceipt.ticket_flag_flip_allowed, false);
assert.deepEqual(partialReceipt.decision_refs, ['6C-HR-OPS-007']);
assert.match(partialReceipt.payroll_batch_event_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = prepareCommissionPayrollBatchEvent(baseInput);
assert.equal(repeatedReceipt.payroll_batch_event_digest, partialReceipt.payroll_batch_event_digest);
assert.equal(repeatedReceipt.event_payload?.event_id, partialReceipt.event_payload?.event_id);

const readyReceipt = prepareCommissionPayrollBatchEvent({
  ...baseInput,
  commission_lines: baseInput.commission_lines.slice(0, 2),
});
assert.equal(readyReceipt.decision, 'PAYROLL_BATCH_EVENT_READY');
assert.equal(readyReceipt.review_line_count, 0);
assert.equal(readyReceipt.event_payload?.line_count, 2);

const reviewReceipt = prepareCommissionPayrollBatchEvent({
  ...baseInput,
  commission_lines: baseInput.commission_lines.map((line) => ({ ...line, approved_for_payroll: false })),
});
assert.equal(reviewReceipt.decision, 'PAYROLL_BATCH_EVENT_REQUIRES_REVIEW');
assert.equal(reviewReceipt.approved_line_count, 0);
assert.equal(reviewReceipt.event_payload, null);

assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, payroll_batch_ref: '' }), /payroll_batch_ref is required/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, payroll_period_ref: '' }), /payroll_period_ref is required/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, currency: 'US' }), /currency must be a three-letter ISO currency code/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, event_sequence: 0 }), /event_sequence must be a positive integer/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, commission_lines: [{ ...baseInput.commission_lines[0], currency: 'EUR' }] }), /currency must match/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, commission_lines: [{ ...baseInput.commission_lines[0], payable_commission_amount: -1 }] }), /payable_commission_amount must be a non-negative finite number/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, commission_lines: [{ ...baseInput.commission_lines[0], payroll_input_code: 'BONUS' as never }] }), /payroll_input_code must be a supported payroll input code/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, commission_lines: [{ ...baseInput.commission_lines[0], evidence_refs: [] }] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, crm_mutation_requested: true }), /must not perform CRM mutation/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, provider_specific_adapter_requested: true }), /must not perform provider-specific adapter execution/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => prepareCommissionPayrollBatchEvent({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C commission_payroll_batch_event runtime FFET test passed.');
