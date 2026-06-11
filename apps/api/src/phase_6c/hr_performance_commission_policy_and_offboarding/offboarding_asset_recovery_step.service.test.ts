import assert from 'node:assert/strict';

import { evaluateOffboardingAssetRecoveryStep, type OffboardingAssetRecoveryStepInput } from './offboarding_asset_recovery_step.service';

const baseInput: OffboardingAssetRecoveryStepInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_offboarding_asset_recovery_step',
  source_record_ref: 'offboarding_asset_recovery_step_record_001',
  offboarding_case_ref: 'offboarding_case_053',
  employee_ref: 'employee_053',
  currency: 'USD',
  evaluated_by_user_id: 'hr_ops_user_053',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  assets: [
    {
      asset_ref: 'asset_laptop_001',
      category: 'DEVICE',
      assigned_to_employee_ref: 'employee_053',
      expected_return_by: '2026-06-01T09:00:00.000Z',
      declared_value: 1500,
      currency: 'USD',
      returned_at: '2026-06-02T10:00:00.000Z',
      recovered_condition: 'GOOD',
      evidence_refs: ['evidence_asset_return_laptop'],
    },
    {
      asset_ref: 'asset_access_card_001',
      category: 'ACCESS_CARD',
      assigned_to_employee_ref: 'employee_053',
      expected_return_by: '2026-06-04T09:00:00.000Z',
      declared_value: 25,
      currency: 'USD',
      returned_at: '2026-06-05T10:00:00.000Z',
      recovered_condition: 'DAMAGED',
      evidence_refs: ['evidence_asset_damage_card'],
    },
    {
      asset_ref: 'asset_vehicle_tag_001',
      category: 'VEHICLE',
      assigned_to_employee_ref: 'employee_053',
      expected_return_by: '2026-06-08T09:00:00.000Z',
      declared_value: 200,
      currency: 'USD',
      recovered_condition: 'NOT_RETURNED',
      evidence_refs: ['evidence_asset_vehicle_pending'],
    },
  ],
};

const receipt = evaluateOffboardingAssetRecoveryStep(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_053_offboarding_asset_recovery_step');
assert.equal(receipt.component_id, '6C.04');
assert.equal(receipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(receipt.model_name, 'Phase6COffboardingAssetRecoveryStep');
assert.equal(receipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_asset_recovery_step.evaluated');
assert.equal(receipt.asset_count, 3);
assert.equal(receipt.returned_count, 1);
assert.equal(receipt.pending_count, 0);
assert.equal(receipt.deduction_required_count, 1);
assert.equal(receipt.review_required_count, 1);
assert.equal(receipt.value_at_risk_total, 225);
assert.equal(receipt.recommended_deduction_total, 25);
assert.equal(receipt.holds_required, true);
assert.equal(receipt.decision, 'ASSET_RECOVERY_REQUIRES_REVIEW');
assert.deepEqual(receipt.adl_refs, ['ADL-001', 'ADL-002']);
assert.deepEqual(receipt.decision_refs, ['6C-HR-OPS-012', '6C-HR-OPS-011', '6C-ADL-002', '6C-ADL-004']);
assert.equal(receipt.payroll_mutation_performed, false);
assert.equal(receipt.payment_mutation_performed, false);
assert.equal(receipt.event_dispatch_performed, false);
assert.equal(receipt.dlq_write_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.phase_6a_mutation_performed, false);
assert.equal(receipt.phase_6b_mutation_performed, false);
assert.equal(receipt.runtime_adapter_performed, false);
assert.equal(receipt.ticket_flag_flip_performed, false);
assert.match(receipt.recovery_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOffboardingAssetRecoveryStep(baseInput);
assert.equal(repeatedReceipt.recovery_evidence_digest, receipt.recovery_evidence_digest);

const clearReceipt = evaluateOffboardingAssetRecoveryStep({
  ...baseInput,
  assets: [
    {
      asset_ref: 'asset_laptop_clear',
      category: 'DEVICE',
      assigned_to_employee_ref: 'employee_053',
      expected_return_by: '2026-06-01T09:00:00.000Z',
      declared_value: 1500,
      currency: 'USD',
      returned_at: '2026-06-02T10:00:00.000Z',
      recovered_condition: 'GOOD',
      evidence_refs: ['evidence_asset_clear'],
    },
  ],
});
assert.equal(clearReceipt.decision, 'ASSET_RECOVERY_CLEAR');
assert.equal(clearReceipt.holds_required, false);
assert.equal(clearReceipt.recommended_deduction_total, 0);

const holdReceipt = evaluateOffboardingAssetRecoveryStep({
  ...baseInput,
  evaluated_at: '2026-06-09T09:00:00.000Z',
  assets: [
    {
      asset_ref: 'asset_future_return',
      category: 'DOCUMENT',
      assigned_to_employee_ref: 'employee_053',
      expected_return_by: '2026-06-20T09:00:00.000Z',
      declared_value: 10,
      currency: 'USD',
      recovered_condition: 'NOT_RETURNED',
      evidence_refs: ['evidence_asset_future_pending'],
    },
  ],
});
assert.equal(holdReceipt.decision, 'ASSET_RECOVERY_HOLD');
assert.equal(holdReceipt.pending_count, 1);
assert.equal(holdReceipt.value_at_risk_total, 10);

const deductionReceipt = evaluateOffboardingAssetRecoveryStep({
  ...baseInput,
  assets: [
    {
      asset_ref: 'asset_lost_phone',
      category: 'DEVICE',
      assigned_to_employee_ref: 'employee_053',
      expected_return_by: '2026-06-01T09:00:00.000Z',
      declared_value: 400,
      currency: 'USD',
      recovered_condition: 'LOST',
      evidence_refs: ['evidence_asset_lost_phone'],
    },
  ],
});
assert.equal(deductionReceipt.decision, 'ASSET_RECOVERY_DEDUCTION_REVIEW');
assert.equal(deductionReceipt.recommended_deduction_total, 400);

assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, offboarding_case_ref: '' }), /offboarding_case_ref is required/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, currency: 'US' }), /currency must be an ISO-4217 currency code/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, assets: [] }), /assets must include at least one/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, assets: [{ ...baseInput.assets[0], category: 'BAD' as never }] }), /category must be a supported/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, assets: [{ ...baseInput.assets[0], assigned_to_employee_ref: 'another_employee' }] }), /assigned_to_employee_ref must match/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, assets: [{ ...baseInput.assets[0], currency: 'EUR' }] }), /currency must match/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, assets: [{ ...baseInput.assets[0], declared_value: -1 }] }), /declared_value must be a non-negative finite number/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, assets: [{ ...baseInput.assets[0], evidence_refs: [] }] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, assets: [{ ...baseInput.assets[0], returned_at: undefined, recovered_condition: 'GOOD' }] }), /returned_at is required/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, assets: [{ ...baseInput.assets[0], recovered_condition: 'NOT_RETURNED' }] }), /cannot be NOT_RETURNED/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, dlq_write_requested: true }), /must not perform DLQ write/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateOffboardingAssetRecoveryStep({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C offboarding_asset_recovery_step runtime FFET test passed.');
