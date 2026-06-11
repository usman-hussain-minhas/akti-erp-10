import assert from 'node:assert/strict';

import { evaluateOffboardingPayrollClosureStep, type OffboardingPayrollClosureStepInput } from './offboarding_payroll_closure_step.service';

const baseInput: OffboardingPayrollClosureStepInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_offboarding_payroll_closure_step',
  source_record_ref: 'offboarding_payroll_closure_step_record_001',
  offboarding_case_ref: 'offboarding_case_056',
  employee_ref: 'employee_056',
  payroll_period_ref: 'payroll_period_2026_06',
  currency: 'USD',
  closure_effective_at: '2026-06-30T23:59:59.000Z',
  evaluated_by_user_id: 'hr_ops_user_056',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  settlement_ready: true,
  asset_recovery_closed: true,
  access_revocation_review_closed: true,
  payroll_period_locked: false,
  approval_required: true,
  approval_ref: 'approval_payroll_closure_056',
  settlement_receipt_ref: 'settlement_receipt_056',
  asset_recovery_receipt_ref: 'asset_recovery_receipt_056',
  access_revocation_receipt_ref: 'access_revocation_receipt_056',
  money_components: [
    {
      component_ref: 'final_salary_056',
      component_type: 'FINAL_SALARY',
      amount: 3000,
      currency: 'USD',
      evidence_refs: ['evidence_final_salary'],
    },
    {
      component_ref: 'leave_encashment_056',
      component_type: 'LEAVE_ENCASHMENT',
      amount: 600,
      currency: 'USD',
      evidence_refs: ['evidence_leave_encashment'],
    },
    {
      component_ref: 'asset_deduction_056',
      component_type: 'ASSET_DEDUCTION',
      amount: 250,
      currency: 'USD',
      evidence_refs: ['evidence_asset_deduction'],
    },
    {
      component_ref: 'tax_withholding_056',
      component_type: 'TAX_WITHHOLDING',
      amount: 350,
      currency: 'USD',
      evidence_refs: ['evidence_tax_withholding'],
    },
  ],
  evidence_refs: ['evidence_payroll_closure_ready'],
};

const receipt = evaluateOffboardingPayrollClosureStep(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_056_offboarding_payroll_closure_step');
assert.equal(receipt.component_id, '6C.04');
assert.equal(receipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(receipt.model_name, 'Phase6COffboardingPayrollClosureStep');
assert.equal(receipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_payroll_closure_step.evaluated');
assert.equal(receipt.decision, 'PAYROLL_CLOSURE_READY');
assert.deepEqual(receipt.blockers, []);
assert.equal(receipt.component_count, 4);
assert.equal(receipt.gross_earning_total, 3600);
assert.equal(receipt.deduction_total, 600);
assert.equal(receipt.hold_total, 0);
assert.equal(receipt.net_closure_amount, 3000);
assert.equal(receipt.settlement_receipt_ref, 'settlement_receipt_056');
assert.equal(receipt.asset_recovery_receipt_ref, 'asset_recovery_receipt_056');
assert.equal(receipt.access_revocation_receipt_ref, 'access_revocation_receipt_056');
assert.deepEqual(receipt.adl_refs, ['ADL-001', 'ADL-002']);
assert.deepEqual(receipt.decision_refs, ['6C-HR-OPS-012', '6C-HR-OPS-011', '6C-ADL-002', '6C-ADL-004', '6C-GLOBAL-018']);
assert.equal(receipt.payroll_mutation_performed, false);
assert.equal(receipt.payment_mutation_performed, false);
assert.equal(receipt.event_dispatch_performed, false);
assert.equal(receipt.dlq_write_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.phase_6a_mutation_performed, false);
assert.equal(receipt.phase_6b_mutation_performed, false);
assert.equal(receipt.runtime_adapter_performed, false);
assert.equal(receipt.ticket_flag_flip_performed, false);
assert.match(receipt.payroll_closure_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOffboardingPayrollClosureStep(baseInput);
assert.equal(repeatedReceipt.payroll_closure_evidence_digest, receipt.payroll_closure_evidence_digest);

const blockedReceipt = evaluateOffboardingPayrollClosureStep({
  ...baseInput,
  settlement_ready: false,
  asset_recovery_closed: false,
  access_revocation_review_closed: false,
  approval_ref: undefined,
});
assert.equal(blockedReceipt.decision, 'PAYROLL_CLOSURE_BLOCKED');
assert.deepEqual(blockedReceipt.blockers, [
  'SETTLEMENT_NOT_READY',
  'ASSET_RECOVERY_OPEN',
  'ACCESS_REVOCATION_REVIEW_OPEN',
  'APPROVAL_MISSING',
]);

const reviewReceipt = evaluateOffboardingPayrollClosureStep({
  ...baseInput,
  payroll_period_locked: true,
});
assert.equal(reviewReceipt.decision, 'PAYROLL_CLOSURE_REQUIRES_REVIEW');
assert.deepEqual(reviewReceipt.blockers, ['PAYROLL_PERIOD_LOCKED']);

const negativeNetReceipt = evaluateOffboardingPayrollClosureStep({
  ...baseInput,
  money_components: [
    {
      component_ref: 'final_salary_small_056',
      component_type: 'FINAL_SALARY',
      amount: 100,
      currency: 'USD',
      evidence_refs: ['evidence_final_salary_small'],
    },
    {
      component_ref: 'asset_deduction_large_056',
      component_type: 'ASSET_DEDUCTION',
      amount: 500,
      currency: 'USD',
      evidence_refs: ['evidence_large_asset_deduction'],
    },
  ],
});
assert.equal(negativeNetReceipt.decision, 'PAYROLL_CLOSURE_REQUIRES_REVIEW');
assert.equal(negativeNetReceipt.net_closure_amount, -400);

assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, offboarding_case_ref: '' }), /offboarding_case_ref is required/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, payroll_period_ref: '' }), /payroll_period_ref is required/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, currency: 'US' }), /currency must be an ISO-4217 currency code/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, closure_effective_at: 'not-a-date' }), /closure_effective_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, money_components: [] }), /money_components must include at least one/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, money_components: [{ ...baseInput.money_components[0], component_type: 'BAD' as never }] }), /component_type must be a supported/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, money_components: [{ ...baseInput.money_components[0], currency: 'EUR' }] }), /currency must match closure currency/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, money_components: [{ ...baseInput.money_components[0], amount: Number.NaN }] }), /amount must be a finite number/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, money_components: [{ ...baseInput.money_components[0], evidence_refs: [] }] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, evidence_refs: [] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, dlq_write_requested: true }), /must not perform DLQ write/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateOffboardingPayrollClosureStep({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C offboarding_payroll_closure_step runtime FFET test passed.');
