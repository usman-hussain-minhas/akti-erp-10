import assert from 'node:assert/strict';

import { distributeCommissionPool, type CommissionPoolDistributionInput } from './commission_pool_distribution.service';

const baseInput: CommissionPoolDistributionInput = {
  organization_id: 'org_phase_6c_commission',
  service_manifest_contract_id: 'smc_phase_6c_commission_pool_distribution',
  source_record_ref: 'commission_pool_2026_06',
  pool_ref: 'pool_north_sales_2026_06',
  period_ref: '2026-06',
  currency: 'USD',
  pool_amount: 1000,
  participants: [
    {
      employee_ref: 'employee_sales_001',
      commission_plan_ref: 'pool_plan_north_sales',
      eligibility_weight: 3,
      eligible: true,
      minimum_guarantee_amount: 100,
      evidence_refs: ['crm_quota_evidence_001'],
    },
    {
      employee_ref: 'employee_sales_002',
      commission_plan_ref: 'pool_plan_north_sales',
      eligibility_weight: 2,
      eligible: true,
      maximum_distribution_amount: 300,
      evidence_refs: ['payment_evidence_002'],
    },
    {
      employee_ref: 'employee_sales_003',
      commission_plan_ref: 'pool_plan_north_sales',
      eligibility_weight: 1,
      eligible: false,
      evidence_refs: ['manual_ineligibility_evidence_003'],
    },
  ],
  evaluated_by_user_id: 'user_commission_pool_controller',
  evaluated_at: '2026-06-15T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_047' },
};

const partialReceipt = distributeCommissionPool(baseInput);
assert.equal(partialReceipt.seed_id, 'seed_6c_047_commission_pool_distribution');
assert.equal(partialReceipt.component_id, '6C.04');
assert.equal(partialReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(partialReceipt.model_name, 'Phase6CCommissionPoolDistribution');
assert.equal(partialReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.commission_pool_distribution.evaluated');
assert.equal(partialReceipt.participant_count, 3);
assert.equal(partialReceipt.eligible_participant_count, 2);
assert.equal(partialReceipt.allocated_amount_total, 940);
assert.equal(partialReceipt.undistributed_amount, 60);
assert.equal(partialReceipt.capped_participant_count, 1);
assert.equal(partialReceipt.decision, 'POOL_DISTRIBUTION_PARTIAL');
assert.equal(partialReceipt.distribution_lines[0].allocated_amount, 640);
assert.equal(partialReceipt.distribution_lines[0].outcome, 'ALLOCATED');
assert.equal(partialReceipt.distribution_lines[1].allocated_amount, 300);
assert.equal(partialReceipt.distribution_lines[1].outcome, 'CAPPED');
assert.equal(partialReceipt.distribution_lines[2].allocated_amount, 0);
assert.equal(partialReceipt.distribution_lines[2].outcome, 'INELIGIBLE');
assert.equal(partialReceipt.payroll_mutation_allowed, false);
assert.equal(partialReceipt.payment_mutation_allowed, false);
assert.equal(partialReceipt.crm_mutation_allowed, false);
assert.equal(partialReceipt.provider_specific_adapter_allowed, false);
assert.equal(partialReceipt.schema_mutation_allowed, false);
assert.equal(partialReceipt.phase_6a_mutation_allowed, false);
assert.equal(partialReceipt.phase_6b_mutation_allowed, false);
assert.equal(partialReceipt.runtime_adapter_allowed, false);
assert.equal(partialReceipt.ticket_flag_flip_allowed, false);
assert.deepEqual(partialReceipt.decision_refs, ['6C-HR-OPS-006']);
assert.match(partialReceipt.pool_distribution_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = distributeCommissionPool(baseInput);
assert.equal(repeatedReceipt.pool_distribution_digest, partialReceipt.pool_distribution_digest);

const readyReceipt = distributeCommissionPool({
  ...baseInput,
  participants: baseInput.participants.slice(0, 2).map((participant) => ({ ...participant, maximum_distribution_amount: undefined })),
});
assert.equal(readyReceipt.decision, 'POOL_DISTRIBUTION_READY');
assert.equal(readyReceipt.allocated_amount_total, 1000);
assert.equal(readyReceipt.undistributed_amount, 0);
assert.equal(readyReceipt.distribution_lines[0].allocated_amount, 640);
assert.equal(readyReceipt.distribution_lines[1].allocated_amount, 360);

const reviewReceipt = distributeCommissionPool({
  ...baseInput,
  participants: [
    { ...baseInput.participants[0], minimum_guarantee_amount: 900 },
    { ...baseInput.participants[1], minimum_guarantee_amount: 200 },
  ],
});
assert.equal(reviewReceipt.decision, 'POOL_DISTRIBUTION_REQUIRES_REVIEW');
assert.equal(reviewReceipt.allocated_amount_total, 0);
assert.equal(reviewReceipt.undistributed_amount, 1000);
assert.equal(reviewReceipt.distribution_lines[0].outcome, 'REQUIRES_REVIEW');

const noEligibleReceipt = distributeCommissionPool({
  ...baseInput,
  participants: baseInput.participants.map((participant) => ({ ...participant, eligible: false })),
});
assert.equal(noEligibleReceipt.decision, 'POOL_DISTRIBUTION_REQUIRES_REVIEW');
assert.equal(noEligibleReceipt.eligible_participant_count, 0);

assert.throws(() => distributeCommissionPool({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => distributeCommissionPool({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => distributeCommissionPool({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => distributeCommissionPool({ ...baseInput, pool_ref: '' }), /pool_ref is required/);
assert.throws(() => distributeCommissionPool({ ...baseInput, period_ref: '' }), /period_ref is required/);
assert.throws(() => distributeCommissionPool({ ...baseInput, currency: 'US' }), /currency must be a three-letter ISO currency code/);
assert.throws(() => distributeCommissionPool({ ...baseInput, pool_amount: -1 }), /pool_amount must be a non-negative finite number/);
assert.throws(() => distributeCommissionPool({ ...baseInput, participants: [{ ...baseInput.participants[0], employee_ref: '' }] }), /employee_ref is required/);
assert.throws(() => distributeCommissionPool({ ...baseInput, participants: [{ ...baseInput.participants[0], eligibility_weight: 0 }] }), /eligibility_weight must be a positive finite number/);
assert.throws(() => distributeCommissionPool({ ...baseInput, participants: [{ ...baseInput.participants[0], minimum_guarantee_amount: -1 }] }), /minimum_guarantee_amount must be a non-negative finite number/);
assert.throws(() => distributeCommissionPool({ ...baseInput, participants: [{ ...baseInput.participants[0], minimum_guarantee_amount: 301, maximum_distribution_amount: 300 }] }), /minimum_guarantee_amount must not exceed maximum_distribution_amount/);
assert.throws(() => distributeCommissionPool({ ...baseInput, participants: [{ ...baseInput.participants[0], evidence_refs: [] }] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => distributeCommissionPool({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => distributeCommissionPool({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => distributeCommissionPool({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => distributeCommissionPool({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => distributeCommissionPool({ ...baseInput, crm_mutation_requested: true }), /must not perform CRM mutation/);
assert.throws(() => distributeCommissionPool({ ...baseInput, provider_specific_adapter_requested: true }), /must not perform provider-specific adapter execution/);
assert.throws(() => distributeCommissionPool({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => distributeCommissionPool({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => distributeCommissionPool({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => distributeCommissionPool({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => distributeCommissionPool({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C commission_pool_distribution runtime FFET test passed.');
