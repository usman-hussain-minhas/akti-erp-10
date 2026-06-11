import assert from 'node:assert/strict';

import { evaluateCommissionTierAccelerator, type CommissionTierAcceleratorInput } from './commission_tier_accelerator.service';

const baseInput: CommissionTierAcceleratorInput = {
  organization_id: 'org_phase_6c_commission',
  service_manifest_contract_id: 'smc_phase_6c_commission_tier_accelerator',
  source_record_ref: 'commission_tier_run_2026_06',
  employee_ref: 'employee_sales_001',
  commission_plan_ref: 'plan_standard_sales_commission',
  period_ref: '2026-06',
  currency: 'USD',
  attainment_amount: 125000,
  base_commission_amount: 5000,
  evidence_refs: ['crm_revenue_evidence_001', 'payment_collection_evidence_001'],
  tier_definitions: [
    {
      tier_id: 'tier_bronze',
      tier_label: 'Bronze Accelerator',
      threshold_amount: 50000,
      accelerator_rate_percent: 5,
      active: true,
    },
    {
      tier_id: 'tier_silver',
      tier_label: 'Silver Accelerator',
      threshold_amount: 100000,
      accelerator_rate_percent: 12,
      max_accelerator_amount: 550,
      active: true,
    },
    {
      tier_id: 'tier_gold_inactive',
      tier_label: 'Gold Accelerator',
      threshold_amount: 120000,
      accelerator_rate_percent: 20,
      active: false,
    },
  ],
  evaluated_by_user_id: 'user_commission_controller',
  evaluated_at: '2026-06-15T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_046' },
};

const cappedReceipt = evaluateCommissionTierAccelerator(baseInput);
assert.equal(cappedReceipt.seed_id, 'seed_6c_046_commission_tier_accelerator');
assert.equal(cappedReceipt.component_id, '6C.04');
assert.equal(cappedReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(cappedReceipt.model_name, 'Phase6CCommissionTierAccelerator');
assert.equal(cappedReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.commission_tier_accelerator.evaluated');
assert.equal(cappedReceipt.selected_tier_id, 'tier_silver');
assert.equal(cappedReceipt.selected_tier_label, 'Silver Accelerator');
assert.equal(cappedReceipt.selected_tier_threshold_amount, 100000);
assert.equal(cappedReceipt.accelerator_rate_percent, 12);
assert.equal(cappedReceipt.gross_accelerator_amount, 600);
assert.equal(cappedReceipt.capped_adjustment_amount, 50);
assert.equal(cappedReceipt.payable_accelerator_amount, 550);
assert.equal(cappedReceipt.total_commission_with_accelerator, 5550);
assert.equal(cappedReceipt.qualified_tier_count, 2);
assert.equal(cappedReceipt.decision, 'TIER_ACCELERATOR_CAPPED');
assert.deepEqual(cappedReceipt.source_evidence_refs, ['crm_revenue_evidence_001', 'payment_collection_evidence_001']);
assert.equal(cappedReceipt.payroll_mutation_allowed, false);
assert.equal(cappedReceipt.payment_mutation_allowed, false);
assert.equal(cappedReceipt.crm_mutation_allowed, false);
assert.equal(cappedReceipt.provider_specific_adapter_allowed, false);
assert.equal(cappedReceipt.schema_mutation_allowed, false);
assert.equal(cappedReceipt.phase_6a_mutation_allowed, false);
assert.equal(cappedReceipt.phase_6b_mutation_allowed, false);
assert.equal(cappedReceipt.runtime_adapter_allowed, false);
assert.equal(cappedReceipt.ticket_flag_flip_allowed, false);
assert.deepEqual(cappedReceipt.decision_refs, ['6C-HR-OPS-006']);
assert.match(cappedReceipt.tier_accelerator_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateCommissionTierAccelerator(baseInput);
assert.equal(repeatedReceipt.tier_accelerator_digest, cappedReceipt.tier_accelerator_digest);

const qualifiedReceipt = evaluateCommissionTierAccelerator({
  ...baseInput,
  base_commission_amount: 1000,
  tier_definitions: baseInput.tier_definitions.map((tier) => ({ ...tier, max_accelerator_amount: undefined })),
});
assert.equal(qualifiedReceipt.decision, 'TIER_ACCELERATOR_QUALIFIED');
assert.equal(qualifiedReceipt.payable_accelerator_amount, 120);

const notQualifiedReceipt = evaluateCommissionTierAccelerator({
  ...baseInput,
  attainment_amount: 25000,
});
assert.equal(notQualifiedReceipt.selected_tier_id, null);
assert.equal(notQualifiedReceipt.payable_accelerator_amount, 0);
assert.equal(notQualifiedReceipt.decision, 'TIER_ACCELERATOR_NOT_QUALIFIED');

const reviewReceipt = evaluateCommissionTierAccelerator({
  ...baseInput,
  tier_definitions: baseInput.tier_definitions.map((tier) => ({ ...tier, active: false })),
});
assert.equal(reviewReceipt.decision, 'TIER_ACCELERATOR_REQUIRES_REVIEW');
assert.equal(reviewReceipt.qualified_tier_count, 0);

assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, commission_plan_ref: '' }), /commission_plan_ref is required/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, period_ref: '' }), /period_ref is required/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, currency: 'US' }), /currency must be a three-letter ISO currency code/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, attainment_amount: -1 }), /attainment_amount must be a non-negative finite number/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, base_commission_amount: -1 }), /base_commission_amount must be a non-negative finite number/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, evidence_refs: [] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, tier_definitions: [{ ...baseInput.tier_definitions[0], tier_id: '' }] }), /tier_id is required/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, tier_definitions: [{ ...baseInput.tier_definitions[0], threshold_amount: -1 }] }), /threshold_amount must be a non-negative finite number/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, tier_definitions: [{ ...baseInput.tier_definitions[0], accelerator_rate_percent: 101 }] }), /accelerator_rate_percent must be between 0 and 100/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, tier_definitions: [{ ...baseInput.tier_definitions[0], max_accelerator_amount: -1 }] }), /max_accelerator_amount must be a non-negative finite number/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, tier_definitions: [baseInput.tier_definitions[0], baseInput.tier_definitions[0]] }), /tier_id must be unique/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, crm_mutation_requested: true }), /must not perform CRM mutation/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, provider_specific_adapter_requested: true }), /must not perform provider-specific adapter execution/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateCommissionTierAccelerator({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C commission_tier_accelerator runtime FFET test passed.');
