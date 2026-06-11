import assert from 'node:assert/strict';

import { coordinateOffboardingSaga, type OffboardingSagaInput } from './offboarding_saga.service';

const baseInput: OffboardingSagaInput = {
  organization_id: 'org_phase_6c_offboarding',
  service_manifest_contract_id: 'smc_phase_6c_offboarding_saga',
  source_record_ref: 'offboarding_case_001',
  saga_ref: 'offboarding_saga_employee_001',
  employee_ref: 'employee_departing_001',
  initiated_by_user_id: 'user_hr_admin',
  initiated_at: '2026-06-15T08:00:00.000Z',
  steps: [
    {
      step_id: 'policy_ack_review',
      order: 1,
      kind: 'POLICY_ACK_REVIEW',
      status: 'COMPLETED',
      idempotency_key: 'offboarding_saga_employee_001_policy_ack_review',
      max_retries: 3,
      retry_count: 0,
      evidence_refs: ['policy_ack_evidence_001'],
    },
    {
      step_id: 'access_revoke',
      order: 2,
      kind: 'ACCESS_REVOKE',
      status: 'FAILED',
      idempotency_key: 'offboarding_saga_employee_001_access_revoke',
      max_retries: 3,
      retry_count: 1,
      compensation_action: 'restore_last_known_access_state_until_retry',
      failure_reason: 'access provider timeout',
      evidence_refs: ['access_revoke_attempt_001'],
    },
    {
      step_id: 'asset_recovery',
      order: 3,
      kind: 'ASSET_RECOVERY',
      status: 'PENDING',
      idempotency_key: 'offboarding_saga_employee_001_asset_recovery',
      max_retries: 3,
      retry_count: 0,
      evidence_refs: ['asset_inventory_snapshot_001'],
    },
  ],
  evaluated_by_user_id: 'user_hr_admin',
  evaluated_at: '2026-06-15T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_051' },
};

const compensationReceipt = coordinateOffboardingSaga(baseInput);
assert.equal(compensationReceipt.seed_id, 'seed_6c_051_offboarding_saga');
assert.equal(compensationReceipt.component_id, '6C.04');
assert.equal(compensationReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(compensationReceipt.model_name, 'Phase6COffboardingSaga');
assert.equal(compensationReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_saga.evaluated');
assert.equal(compensationReceipt.step_count, 3);
assert.equal(compensationReceipt.completed_step_count, 1);
assert.equal(compensationReceipt.pending_step_count, 1);
assert.equal(compensationReceipt.failed_step_count, 1);
assert.equal(compensationReceipt.next_step_id, 'asset_recovery');
assert.equal(compensationReceipt.compensation_plan.length, 1);
assert.equal(compensationReceipt.compensation_plan[0].step_id, 'access_revoke');
assert.equal(compensationReceipt.dlq_routes.length, 0);
assert.equal(compensationReceipt.decision, 'OFFBOARDING_SAGA_COMPENSATION_REQUIRED');
assert.equal(compensationReceipt.two_phase_commit_allowed, false);
assert.equal(compensationReceipt.external_deprovisioning_allowed, false);
assert.equal(compensationReceipt.payroll_mutation_allowed, false);
assert.equal(compensationReceipt.access_mutation_allowed, false);
assert.equal(compensationReceipt.event_dispatch_allowed, false);
assert.equal(compensationReceipt.dlq_write_allowed, false);
assert.equal(compensationReceipt.schema_mutation_allowed, false);
assert.equal(compensationReceipt.phase_6a_mutation_allowed, false);
assert.equal(compensationReceipt.phase_6b_mutation_allowed, false);
assert.equal(compensationReceipt.runtime_adapter_allowed, false);
assert.equal(compensationReceipt.ticket_flag_flip_allowed, false);
assert.deepEqual(compensationReceipt.adl_refs, ['ADL-001', 'ADL-002']);
assert.deepEqual(compensationReceipt.decision_refs, ['6C-HR-OPS-011', '6C-ADL-002', '6C-ADL-004']);
assert.match(compensationReceipt.offboarding_saga_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = coordinateOffboardingSaga(baseInput);
assert.equal(repeatedReceipt.offboarding_saga_digest, compensationReceipt.offboarding_saga_digest);

const dlqReceipt = coordinateOffboardingSaga({
  ...baseInput,
  steps: [{ ...baseInput.steps[1], retry_count: 3 }],
});
assert.equal(dlqReceipt.decision, 'OFFBOARDING_SAGA_DLQ_ROUTED');
assert.equal(dlqReceipt.dlq_routes.length, 1);
assert.equal(dlqReceipt.compensation_plan.length, 0);

const completeReceipt = coordinateOffboardingSaga({
  ...baseInput,
  steps: baseInput.steps.map((step) => ({ ...step, status: 'COMPLETED' })),
});
assert.equal(completeReceipt.decision, 'OFFBOARDING_SAGA_COMPLETE');
assert.equal(completeReceipt.next_step_id, null);

const progressReceipt = coordinateOffboardingSaga({
  ...baseInput,
  steps: baseInput.steps.filter((step) => step.status !== 'FAILED'),
});
assert.equal(progressReceipt.decision, 'OFFBOARDING_SAGA_IN_PROGRESS');
assert.equal(progressReceipt.next_step_id, 'asset_recovery');

assert.throws(() => coordinateOffboardingSaga({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, saga_ref: '' }), /saga_ref is required/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, initiated_by_user_id: '' }), /initiated_by_user_id is required/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, initiated_at: 'not-a-date' }), /initiated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, steps: [] }), /steps must contain at least one step/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, steps: [baseInput.steps[0], baseInput.steps[0]] }), /step_id must be unique/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, steps: [{ ...baseInput.steps[0], kind: 'UNKNOWN' as never }] }), /kind must be a supported step kind/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, steps: [{ ...baseInput.steps[0], status: 'UNKNOWN' as never }] }), /status must be a supported step status/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, steps: [{ ...baseInput.steps[0], retry_count: 4, max_retries: 3 }] }), /retry_count must not exceed max_retries/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, steps: [{ ...baseInput.steps[0], evidence_refs: [] }] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, two_phase_commit_requested: true }), /must not perform two-phase commit/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, external_deprovisioning_requested: true }), /must not perform external deprovisioning execution/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, access_mutation_requested: true }), /must not perform access mutation/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, dlq_write_requested: true }), /must not perform DLQ write/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => coordinateOffboardingSaga({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C offboarding_saga runtime FFET test passed.');
