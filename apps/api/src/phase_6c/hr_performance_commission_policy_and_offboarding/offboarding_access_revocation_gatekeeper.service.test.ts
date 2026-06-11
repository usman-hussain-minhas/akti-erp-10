import assert from 'node:assert/strict';

import { evaluateOffboardingAccessRevocationGatekeeper, type OffboardingAccessRevocationGatekeeperInput } from './offboarding_access_revocation_gatekeeper.service';

const baseInput: OffboardingAccessRevocationGatekeeperInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_offboarding_access_revocation_gatekeeper',
  source_record_ref: 'offboarding_access_revocation_gatekeeper_record_001',
  offboarding_case_ref: 'offboarding_case_055',
  employee_ref: 'employee_055',
  evaluated_by_user_id: 'hr_ops_user_055',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  revocations: [
    {
      access_ref: 'role_crm_viewer_employee_055',
      surface: 'APPLICATION_ROLE',
      action: 'REVOKE_ROLE',
      risk: 'LOW',
      requested_effective_at: '2026-06-09T10:00:00.000Z',
      evidence_ready: true,
      evidence_refs: ['evidence_role_revocation_ready'],
      revocation_reason: 'Employee offboarding case requires role revocation.',
    },
    {
      access_ref: 'data_group_payroll_employee_055',
      surface: 'DATA_GROUP',
      action: 'REMOVE_GROUP_MEMBERSHIP',
      risk: 'HIGH',
      requested_effective_at: '2026-06-09T10:00:00.000Z',
      evidence_ready: true,
      sensitive_data_access: true,
      active_session_count: 2,
      evidence_refs: ['evidence_sensitive_group_revocation'],
      revocation_reason: 'Sensitive group membership must be removed after approval.',
    },
    {
      access_ref: 'privileged_admin_employee_055',
      surface: 'PRIVILEGED_ADMIN',
      action: 'SUSPEND_ACCOUNT',
      risk: 'CRITICAL',
      requested_effective_at: '2026-06-09T10:00:00.000Z',
      evidence_ready: true,
      privileged_access: true,
      evidence_refs: ['evidence_privileged_revocation'],
      revocation_reason: 'Privileged account must stop for review without approval evidence.',
    },
  ],
};

const receipt = evaluateOffboardingAccessRevocationGatekeeper(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_055_offboarding_access_revocation_gatekeeper');
assert.equal(receipt.component_id, '6C.04');
assert.equal(receipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(receipt.model_name, 'Phase6COffboardingAccessRevocationGatekeeper');
assert.equal(receipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.offboarding_access_revocation_gatekeeper.evaluated');
assert.equal(receipt.revocation_count, 3);
assert.equal(receipt.allow_count, 1);
assert.equal(receipt.approval_required_count, 1);
assert.equal(receipt.stop_for_review_count, 1);
assert.equal(receipt.deny_count, 0);
assert.equal(receipt.privileged_count, 1);
assert.equal(receipt.active_session_total, 2);
assert.deepEqual(receipt.adl_refs, ['ADL-001', 'ADL-002']);
assert.deepEqual(receipt.decision_refs, ['6C-HR-OPS-013', '6C-HR-OPS-011', '6C-ADL-002', '6C-ADL-004']);
assert.equal(receipt.gatekeeper_mutation_performed, false);
assert.equal(receipt.access_mutation_performed, false);
assert.equal(receipt.account_disable_performed, false);
assert.equal(receipt.event_dispatch_performed, false);
assert.equal(receipt.dlq_write_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.phase_6a_mutation_performed, false);
assert.equal(receipt.phase_6b_mutation_performed, false);
assert.equal(receipt.runtime_adapter_performed, false);
assert.equal(receipt.ticket_flag_flip_performed, false);
assert.match(receipt.gatekeeper_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOffboardingAccessRevocationGatekeeper(baseInput);
assert.equal(repeatedReceipt.gatekeeper_evidence_digest, receipt.gatekeeper_evidence_digest);

const approvedHighRisk = evaluateOffboardingAccessRevocationGatekeeper({
  ...baseInput,
  revocations: [
    {
      ...baseInput.revocations[1],
      approval_ref: 'approval_sensitive_revocation_001',
    },
  ],
});
assert.equal(approvedHighRisk.allow_count, 1);
assert.equal(approvedHighRisk.approval_required_count, 0);

const evidenceMissing = evaluateOffboardingAccessRevocationGatekeeper({
  ...baseInput,
  revocations: [{ ...baseInput.revocations[0], evidence_ready: false }],
});
assert.equal(evidenceMissing.approval_required_count, 1);
assert.equal(evidenceMissing.decisions[0].outcome, 'APPROVAL_REQUIRED');

const breakGlass = evaluateOffboardingAccessRevocationGatekeeper({
  ...baseInput,
  revocations: [{ ...baseInput.revocations[0], break_glass_active: true }],
});
assert.equal(breakGlass.stop_for_review_count, 1);
assert.equal(breakGlass.decisions[0].outcome, 'STOP_FOR_REVIEW');

assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, offboarding_case_ref: '' }), /offboarding_case_ref is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, employee_ref: '' }), /employee_ref is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, revocations: [] }), /revocations must include at least one/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, revocations: [{ ...baseInput.revocations[0], surface: 'BAD' as never }] }), /surface must be a supported/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, revocations: [{ ...baseInput.revocations[0], action: 'BAD' as never }] }), /action must be a supported/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, revocations: [{ ...baseInput.revocations[0], risk: 'BAD' as never }] }), /risk must be LOW/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, revocations: [{ ...baseInput.revocations[0], active_session_count: -1 }] }), /active_session_count must be a non-negative integer/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, revocations: [{ ...baseInput.revocations[0], evidence_refs: [] }] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, revocations: [{ ...baseInput.revocations[0], revocation_reason: '' }] }), /revocation_reason is required/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, gatekeeper_mutation_requested: true }), /must not perform Gatekeeper mutation/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, access_mutation_requested: true }), /must not perform access mutation/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, account_disable_requested: true }), /must not perform account disable execution/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, event_dispatch_requested: true }), /must not perform event dispatch/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, dlq_write_requested: true }), /must not perform DLQ write/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluateOffboardingAccessRevocationGatekeeper({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C offboarding_access_revocation_gatekeeper runtime FFET test passed.');
