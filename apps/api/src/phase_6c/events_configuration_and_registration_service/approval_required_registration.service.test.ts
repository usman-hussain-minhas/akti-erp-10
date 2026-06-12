import assert from 'node:assert/strict';

import { evaluateApprovalRequiredRegistration, type ApprovalRequiredRegistrationInput } from './approval_required_registration.service';

const baseInput: ApprovalRequiredRegistrationInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_approval_required_registration',
  event_configuration_id: 'event_config_001',
  registration_ref: 'registration:001',
  attendee_ref: 'attendee:001',
  source_record_ref: 'approval_required_registration_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T10:00:00.000Z',
  submitted_at: '2026-06-09T09:00:00.000Z',
  approval_required: true,
  approval_policy_ref: 'approval_policy:event_registration_001',
  required_approval_count: 2,
  approval_actions: [
    {
      reviewer_ref: 'reviewer:one',
      action: 'APPROVED',
      action_at: '2026-06-09T09:20:00.000Z',
      approval_evidence_ref: 'approval_evidence:one',
    },
    {
      reviewer_ref: 'reviewer:two',
      action: 'APPROVED',
      action_at: '2026-06-09T09:30:00.000Z',
      approval_evidence_ref: 'approval_evidence:two',
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateApprovalRequiredRegistration(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_104_approval_required_registration');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CApprovalRequiredRegistration');
assert.equal(receipt.registration_ref, 'registration:001');
assert.equal(receipt.attendee_ref, 'attendee:001');
assert.equal(receipt.required_approval_count, 2);
assert.equal(receipt.approval_count, 2);
assert.equal(receipt.rejection_count, 0);
assert.deepEqual(receipt.reviewer_refs, ['reviewer:one', 'reviewer:two']);
assert.equal(receipt.decision, 'APPROVED');
assert.equal(receipt.decision_reason, 'required approval count has been satisfied');
assert.equal(receipt.approval_mutation_performed, false);
assert.equal(receipt.registration_creation_performed, false);
assert.equal(receipt.ticket_issue_performed, false);
assert.equal(receipt.notification_send_performed, false);
assert.equal(receipt.payment_capture_allowed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.frontend_surface_created, false);
assert.match(receipt.approval_required_registration_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateApprovalRequiredRegistration(baseInput);
assert.equal(repeatedReceipt.approval_required_registration_runtime_digest, receipt.approval_required_registration_runtime_digest);

assert.equal(evaluateApprovalRequiredRegistration({ ...baseInput, approval_required: false, approval_policy_ref: undefined, required_approval_count: undefined, approval_actions: [] }).decision, 'APPROVAL_NOT_REQUIRED');
assert.equal(evaluateApprovalRequiredRegistration({ ...baseInput, approval_actions: [baseInput.approval_actions![0]] }).decision, 'PENDING_APPROVAL');
assert.equal(evaluateApprovalRequiredRegistration({ ...baseInput, approval_actions: [{ ...baseInput.approval_actions![0], action: 'REJECTED', reason_ref: 'reason:capacity_review' }] }).decision, 'REJECTED');
assert.equal(evaluateApprovalRequiredRegistration({ ...baseInput, approval_policy_ref: undefined }).decision, 'APPROVAL_REQUIRES_REVIEW');
assert.equal(evaluateApprovalRequiredRegistration({ ...baseInput, approval_actions: [{ ...baseInput.approval_actions![0] }, { ...baseInput.approval_actions![1], reviewer_ref: 'reviewer:one' }] }).decision, 'APPROVAL_REQUIRES_REVIEW');

assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, evaluated_at: '2026-06-09T08:00:00.000Z' }), /evaluated_at must not be before submitted_at/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, required_approval_count: 0 }), /required_approval_count must be a positive integer/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, approval_actions: [{ ...baseInput.approval_actions![0], action_at: '2026-06-09T08:00:00.000Z' }] }), /approval action timestamp must not be before submitted_at/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, approval_actions: [{ ...baseInput.approval_actions![0], approval_evidence_ref: '' }] }), /approval_evidence_ref is required/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, approval_mutation_requested: true }), /not mutate approvals/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, registration_creation_requested: true }), /must not create registrations/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, ticket_issue_requested: true }), /must not issue tickets/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, notification_send_requested: true }), /must not send notifications/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, payment_capture_requested: true }), /must not capture payment/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateApprovalRequiredRegistration({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime approval_required_registration test passed.');
