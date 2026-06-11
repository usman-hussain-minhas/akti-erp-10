import assert from 'node:assert/strict';

import { evaluateOffboardingWorkspaceRemovalStep, type OffboardingWorkspaceRemovalStepInput } from './offboarding_workspace_removal_step.service';

const baseInput: OffboardingWorkspaceRemovalStepInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_offboarding_workspace_removal_step',
  source_record_ref: 'offboarding_workspace_removal_step_record_001',
  offboarding_case_ref: 'offboarding_case_054',
  employee_ref: 'employee_054',
  evaluated_by_user_id: 'hr_ops_user_054',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  tasks: [
    {
      workspace_ref: 'directory_account_employee_054',
      surface: 'DIRECTORY_ACCOUNT',
      action: 'DISABLE_ACCOUNT',
      risk: 'MEDIUM',
      removal_due_at: '2026-06-09T10:00:00.000Z',
      evidence_ready: true,
      evidence_refs: ['evidence_directory_disable_ready'],
    },
    {
      workspace_ref: 'project_workspace_owned_by_employee_054',
      surface: 'PROJECT_WORKSPACE',
      action: 'TRANSFER_OWNERSHIP',
      risk: 'HIGH',
      current_owner_ref: 'employee_054',
      owner_transfer_required: true,
      removal_due_at: '2026-06-09T10:00:00.000Z',
      evidence_ready: true,
      evidence_refs: ['evidence_project_owner_transfer_needed'],
    },
    {
      workspace_ref: 'email_account_employee_054',
      surface: 'EMAIL_ACCOUNT',
      action: 'ARCHIVE_CONTENT',
      risk: 'LOW',
      removal_due_at: '2026-06-09T10:00:00.000Z',
      evidence_ready: false,
      evidence_refs: ['evidence_email_archive_not_ready'],
    },
  ],
};

const receipt = evaluateOffboardingWorkspaceRemovalStep(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_054_offboarding_workspace_removal_step');
assert.equal(receipt.component_id, '6C.04');
assert.equal(receipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(receipt.model_name, 'Phase6COffboardingWorkspaceRemovalStep');
assert.equal(receipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_workspace_removal_step.evaluated');
assert.equal(receipt.task_count, 3);
assert.equal(receipt.ready_count, 1);
assert.equal(receipt.transfer_blocked_count, 1);
assert.equal(receipt.evidence_blocked_count, 1);
assert.equal(receipt.review_required_count, 0);
assert.equal(receipt.overdue_count, 0);
assert.equal(receipt.high_risk_count, 1);
assert.equal(receipt.decision, 'WORKSPACE_REMOVAL_BLOCKED_FOR_TRANSFER');
assert.deepEqual(receipt.adl_refs, ['ADL-001', 'ADL-002']);
assert.deepEqual(receipt.decision_refs, ['6C-HR-OPS-012', '6C-HR-OPS-011', '6C-ADL-002', '6C-ADL-004']);
assert.equal(receipt.access_mutation_performed, false);
assert.equal(receipt.account_disable_performed, false);
assert.equal(receipt.event_dispatch_performed, false);
assert.equal(receipt.dlq_write_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.phase_6a_mutation_performed, false);
assert.equal(receipt.phase_6b_mutation_performed, false);
assert.equal(receipt.runtime_adapter_performed, false);
assert.equal(receipt.ticket_flag_flip_performed, false);
assert.match(receipt.workspace_removal_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOffboardingWorkspaceRemovalStep(baseInput);
assert.equal(repeatedReceipt.workspace_removal_evidence_digest, receipt.workspace_removal_evidence_digest);

const readyReceipt = evaluateOffboardingWorkspaceRemovalStep({
  ...baseInput,
  tasks: [
    {
      workspace_ref: 'vpn_access_employee_054',
      surface: 'VPN_ACCESS',
      action: 'REVOKE_ACCESS',
      risk: 'MEDIUM',
      removal_due_at: '2026-06-09T10:00:00.000Z',
      evidence_ready: true,
      evidence_refs: ['evidence_vpn_revoke_ready'],
    },
    {
      workspace_ref: 'project_workspace_transferred_054',
      surface: 'PROJECT_WORKSPACE',
      action: 'TRANSFER_OWNERSHIP',
      risk: 'HIGH',
      current_owner_ref: 'employee_054',
      target_owner_ref: 'manager_054',
      owner_transfer_required: true,
      removal_due_at: '2026-06-09T10:00:00.000Z',
      evidence_ready: true,
      evidence_refs: ['evidence_project_owner_transfer_ready'],
    },
  ],
});
assert.equal(readyReceipt.decision, 'WORKSPACE_REMOVAL_READY');
assert.equal(readyReceipt.ready_count, 2);

const evidenceReceipt = evaluateOffboardingWorkspaceRemovalStep({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0], evidence_ready: false }],
});
assert.equal(evidenceReceipt.decision, 'WORKSPACE_REMOVAL_BLOCKED_FOR_EVIDENCE');
assert.equal(evidenceReceipt.evidence_blocked_count, 1);

const reviewReceipt = evaluateOffboardingWorkspaceRemovalStep({
  ...baseInput,
  tasks: [
    {
      workspace_ref: 'critical_storage_drive_054',
      surface: 'STORAGE_DRIVE',
      action: 'ARCHIVE_CONTENT',
      risk: 'CRITICAL',
      removal_due_at: '2026-06-01T10:00:00.000Z',
      evidence_ready: true,
      evidence_refs: ['evidence_storage_archive_overdue'],
    },
  ],
});
assert.equal(reviewReceipt.decision, 'WORKSPACE_REMOVAL_REQUIRES_REVIEW');
assert.equal(reviewReceipt.review_required_count, 1);
assert.equal(reviewReceipt.overdue_count, 1);

const legalHoldReceipt = evaluateOffboardingWorkspaceRemovalStep({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0], legal_hold_active: true }],
});
assert.equal(legalHoldReceipt.decision, 'WORKSPACE_REMOVAL_REQUIRES_REVIEW');
assert.equal(legalHoldReceipt.prepared_tasks[0].legal_hold_active, true);

assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, offboarding_case_ref: '' }), /offboarding_case_ref is required/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, tasks: [] }), /tasks must include at least one/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, tasks: [{ ...baseInput.tasks[0], surface: 'BAD' as never }] }), /surface must be a supported/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, tasks: [{ ...baseInput.tasks[0], action: 'BAD' as never }] }), /action must be a supported/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, tasks: [{ ...baseInput.tasks[0], risk: 'BAD' as never }] }), /risk must be LOW/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, tasks: [{ ...baseInput.tasks[1], current_owner_ref: 'other_employee' }] }), /current_owner_ref must match employee_ref/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, tasks: [{ ...baseInput.tasks[0], evidence_refs: [] }] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, access_mutation_requested: true }), /must not perform access mutation/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, account_disable_requested: true }), /must not perform account disable execution/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, dlq_write_requested: true }), /must not perform DLQ write/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateOffboardingWorkspaceRemovalStep({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C offboarding_workspace_removal_step runtime FFET test passed.');
