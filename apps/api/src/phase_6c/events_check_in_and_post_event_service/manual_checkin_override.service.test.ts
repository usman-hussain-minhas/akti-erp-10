import assert from 'node:assert/strict';

import { evaluateManualCheckinOverride, type ManualCheckinOverrideInput } from './manual_checkin_override.service';

const baseInput: ManualCheckinOverrideInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_manual_checkin_override',
  event_ref: 'event_annual_summit',
  session_ref: 'session_keynote',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_ref: 'ticket_001',
  source_record_ref: 'manual_override_case_001',
  override_reason: 'Badge scanner failed at session entrance.',
  approval_status: 'approved',
  approval_ref: 'approval_manual_override_001',
  approved_by_user_id: 'event_manager_001',
  requested_by_user_id: 'checkin_operator_001',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  control_metadata: { channel: 'operator_console' },
};

const approved = evaluateManualCheckinOverride(baseInput);
assert.equal(approved.seed_id, 'seed_6c_116_manual_checkin_override');
assert.equal(approved.component_id, '6C.09');
assert.equal(approved.component_slug, 'events_check_in_and_post_event_service');
assert.equal(approved.model_name, 'Phase6CManualCheckinOverride');
assert.equal(approved.event_name, 'phase_6c.events_check_in_and_post_event_service.manual_checkin_override.runtime_evaluated');
assert.equal(approved.decision, 'MANUAL_OVERRIDE_APPROVED');
assert.equal(approved.manual_override_allowed, true);
assert.equal(approved.approval_required, false);
assert.deepEqual(approved.rejection_reasons, []);
assert.equal(approved.approval_ref, 'approval_manual_override_001');
assert.equal(approved.approved_by_user_id, 'event_manager_001');
assert.deepEqual(approved.decision_refs, ['6C-EVENT-CHECK-006', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012']);
assert.deepEqual(approved.dependency_refs, ['seed_6a_service_manifest_contract', '6C.08']);
assert.match(approved.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeated = evaluateManualCheckinOverride(baseInput);
assert.equal(repeated.runtime_evidence_digest, approved.runtime_evidence_digest);

const pending = evaluateManualCheckinOverride({
  ...baseInput,
  source_record_ref: 'manual_override_case_002',
  approval_status: 'pending',
  approval_ref: undefined,
  approved_by_user_id: undefined,
});
assert.equal(pending.decision, 'MANUAL_OVERRIDE_REQUIRES_APPROVAL');
assert.equal(pending.manual_override_allowed, false);
assert.equal(pending.approval_required, true);

const review = evaluateManualCheckinOverride({
  ...baseInput,
  source_record_ref: 'manual_override_case_003',
  eligibility_status: 'review',
});
assert.equal(review.decision, 'MANUAL_OVERRIDE_REQUIRES_APPROVAL');
assert.equal(review.approval_required, true);

const alreadyCheckedIn = evaluateManualCheckinOverride({
  ...baseInput,
  source_record_ref: 'manual_override_case_004',
  existing_checkin_ref: 'checkin_existing_001',
});
assert.equal(alreadyCheckedIn.decision, 'MANUAL_OVERRIDE_REJECTED_ALREADY_CHECKED_IN');
assert.equal(alreadyCheckedIn.manual_override_allowed, false);
assert.deepEqual(alreadyCheckedIn.rejection_reasons, ['attendee_already_checked_in_for_scope']);

const ineligible = evaluateManualCheckinOverride({
  ...baseInput,
  source_record_ref: 'manual_override_case_005',
  eligibility_status: 'ineligible',
});
assert.equal(ineligible.decision, 'MANUAL_OVERRIDE_REJECTED_INELIGIBLE_CONTEXT');
assert.equal(ineligible.manual_override_allowed, false);
assert.deepEqual(ineligible.rejection_reasons, ['registration_or_ticket_context_ineligible']);

const rejectedApproval = evaluateManualCheckinOverride({
  ...baseInput,
  source_record_ref: 'manual_override_case_006',
  approval_status: 'rejected',
  approval_ref: 'approval_rejected_001',
});
assert.equal(rejectedApproval.decision, 'MANUAL_OVERRIDE_REJECTED_INELIGIBLE_CONTEXT');
assert.equal(rejectedApproval.manual_override_allowed, false);
assert.deepEqual(rejectedApproval.rejection_reasons, ['manual_override_approval_rejected']);

const missingApprover = evaluateManualCheckinOverride({
  ...baseInput,
  source_record_ref: 'manual_override_case_007',
  approved_by_user_id: undefined,
});
assert.equal(missingApprover.decision, 'MANUAL_OVERRIDE_REQUIRES_APPROVAL');
assert.equal(missingApprover.manual_override_allowed, false);
assert.deepEqual(missingApprover.rejection_reasons, ['approval_ref_and_approver_required_when_approved']);

const shortReason = evaluateManualCheckinOverride({
  ...baseInput,
  source_record_ref: 'manual_override_case_008',
  override_reason: 'short',
});
assert.equal(shortReason.decision, 'MANUAL_OVERRIDE_REJECTED_REASON_REQUIRED');
assert.equal(shortReason.manual_override_allowed, false);
assert.deepEqual(shortReason.rejection_reasons, ['override_reason_minimum_length_not_met']);

assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, event_ref: '' }), /event_ref is required/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, override_reason: '' }), /override_reason is required/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, approval_ref: ' ' }), /approval_ref must be non-empty/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, checkin_record_creation_requested: true }), /must not create check-in records/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, ticket_mutation_requested: true }), /must not mutate tickets/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, session_capacity_mutation_requested: true }), /must not mutate session capacity/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, attendance_persistence_requested: true }), /must not persist attendance/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateManualCheckinOverride({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime manual_checkin_override test passed.');
