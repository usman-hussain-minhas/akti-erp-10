import assert from 'node:assert/strict';

import { evaluateApplicantStagedDeletionRuntime, type ApplicantStagedDeletionInput } from './applicant_staged_deletion.service';

const baseInput: ApplicantStagedDeletionInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_applicant_staged_deletion',
  source_record_ref: 'applicant_staged_deletion_record_001',
  applicant_ref: 'applicant:person_001',
  requested_action: 'REQUEST_SOFT_DELETE',
  current_stage: 'ACTIVE',
  requested_by_user_id: 'user_phase_6c_recruiter',
  requested_at: '2026-06-09T09:00:00.000Z',
  retention_policy_ref: 'retention_policy:applicant_default',
  crm_lead_ref: 'crm_lead:lead_001',
  protection_refs: [
    { protection_ref: 'protection:expired_offer', reason: 'offer is no longer active', active: false },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateApplicantStagedDeletionRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_021_applicant_staged_deletion');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CApplicantStagedDeletion');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.applicant_staged_deletion.evaluated');
assert.equal(receipt.runtime_status, 'APPLICANT_STAGED_DELETION_EVALUATED');
assert.equal(receipt.previous_stage, 'ACTIVE');
assert.equal(receipt.resulting_stage, 'SOFT_DELETE_REQUESTED');
assert.equal(receipt.deletion_execution_performed, false);
assert.equal(receipt.immediate_deletion_allowed, false);
assert.equal(receipt.hard_delete_allowed, false);
assert.equal(receipt.direct_crm_mutation_allowed, false);
assert.equal(receipt.employee_record_mutation_allowed, false);
assert.equal(receipt.refs_events_only, true);
assert.equal(receipt.blocked, false);
assert.deepEqual(receipt.active_protection_refs, []);
assert.deepEqual(receipt.inactive_protection_refs, ['protection:expired_offer']);
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-013', '6C-RECRUIT-002', '6C-GLOBAL-018']);
assert.deepEqual(receipt.evidence_artifacts, [
  'applicant_staged_deletion_runtime_receipt',
  'applicant_staged_deletion_validation_result',
  'applicant_staged_deletion_forbidden_behavior_rejection_evidence',
]);
assert.match(receipt.applicant_staged_deletion_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateApplicantStagedDeletionRuntime(baseInput);
assert.equal(repeatedReceipt.applicant_staged_deletion_evidence_digest, receipt.applicant_staged_deletion_evidence_digest);

const blockedReceipt = evaluateApplicantStagedDeletionRuntime({
  ...baseInput,
  requested_action: 'CONFIRM_SOFT_DELETE',
  current_stage: 'SOFT_DELETE_REQUESTED',
  protection_refs: [
    { protection_ref: 'protection:active_background_check', reason: 'background check is still active', active: true },
  ],
});
assert.equal(blockedReceipt.resulting_stage, 'DELETION_BLOCKED');
assert.equal(blockedReceipt.blocked, true);
assert.deepEqual(blockedReceipt.active_protection_refs, ['protection:active_background_check']);
assert.deepEqual(blockedReceipt.block_reasons, ['background check is still active']);

const scheduledReceipt = evaluateApplicantStagedDeletionRuntime({
  ...baseInput,
  requested_action: 'SCHEDULE_PERMANENT_DELETION',
  current_stage: 'SOFT_DELETED',
  permanent_deletion_not_before: '2026-07-09T09:00:00.000Z',
  protection_refs: [],
});
assert.equal(scheduledReceipt.resulting_stage, 'PERMANENT_DELETION_SCHEDULED');
assert.equal(scheduledReceipt.permanent_deletion_not_before, '2026-07-09T09:00:00.000Z');
assert.equal(scheduledReceipt.deletion_execution_performed, false);

const cancelledReceipt = evaluateApplicantStagedDeletionRuntime({
  ...baseInput,
  requested_action: 'CANCEL_DELETION',
  current_stage: 'PERMANENT_DELETION_SCHEDULED',
  permanent_deletion_not_before: '2026-07-09T09:00:00.000Z',
});
assert.equal(cancelledReceipt.resulting_stage, 'DELETION_CANCELLED');

assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, requested_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, requested_action: 'PURGE_NOW' as never }), /requested_action is not supported/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, current_stage: 'PURGED' as never }), /current_stage is not supported/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, requested_action: 'CONFIRM_SOFT_DELETE' }), /requires SOFT_DELETE_REQUESTED/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({
  ...baseInput,
  requested_action: 'SCHEDULE_PERMANENT_DELETION',
  current_stage: 'SOFT_DELETED',
}), /permanent_deletion_not_before is required/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({
  ...baseInput,
  requested_action: 'SCHEDULE_PERMANENT_DELETION',
  current_stage: 'SOFT_DELETED',
  permanent_deletion_not_before: '2026-06-01T09:00:00.000Z',
}), /must be after requested_at/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({
  ...baseInput,
  protection_refs: [
    { protection_ref: 'protection:one', reason: 'one', active: true },
    { protection_ref: 'protection:one', reason: 'duplicate', active: false },
  ],
}), /protection_ref must be unique/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, immediate_deletion_requested: true }), /not perform immediate deletion/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, hard_delete_execution_requested: true }), /must not execute hard deletion/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, direct_crm_mutation_requested: true }), /must not mutate CRM records/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, employee_record_mutation_requested: true }), /must not mutate employee records/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateApplicantStagedDeletionRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime applicant_staged_deletion test passed.');
