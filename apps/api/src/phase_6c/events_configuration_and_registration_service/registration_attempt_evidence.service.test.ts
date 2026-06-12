import assert from 'node:assert/strict';

import { evaluateRegistrationAttemptEvidence, type RegistrationAttemptEvidenceInput } from './registration_attempt_evidence.service';

const baseInput: RegistrationAttemptEvidenceInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_registration_attempt_evidence',
  attempt_ref: 'registration_attempt_001',
  event_config_ref: 'event_config_annual_summit',
  attendee_ref: 'attendee_001',
  ticket_type_ref: 'ticket_type_paid_standard',
  source_record_ref: 'registration_attempt_evidence_record_001',
  attempted_at: '2026-06-09T08:59:59.000Z',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  outcome: 'registration_created',
  registration_ref: 'registration_001',
  capacity_snapshot_ref: 'ticket_capacity_snapshot_001',
  product_catalogue_anchor_ref: 'product_catalogue_ticket_anchor_001',
  crm_handoff_ref: 'event_crm_handoff_001',
  workspace_calendar_ref: 'workspace_calendar_event_ref_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const createdReceipt = evaluateRegistrationAttemptEvidence(baseInput);
assert.equal(createdReceipt.seed_id, 'seed_6c_109_registration_attempt_evidence');
assert.equal(createdReceipt.component_id, '6C.08');
assert.equal(createdReceipt.event_name, 'phase_6c.events_configuration_and_registration_service.registration_attempt_evidence.runtime_evaluated');
assert.equal(createdReceipt.outcome, 'registration_created');
assert.equal(createdReceipt.registration_ref, 'registration_001');
assert.equal(createdReceipt.dependency_trace.product_catalogue_anchor_ref, 'product_catalogue_ticket_anchor_001');
assert.equal(createdReceipt.dependency_trace.crm_handoff_ref, 'event_crm_handoff_001');
assert.equal(createdReceipt.dependency_trace.workspace_calendar_ref, 'workspace_calendar_event_ref_001');
assert.deepEqual(createdReceipt.decision_refs, ['6C-EVENT-REG-018', '6C-EVENT-REG-002', '6C-EVENT-REG-003', '6C-EVENT-REG-012', '6C-EVENT-REG-009', 'ADL-001']);
assert.match(createdReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateRegistrationAttemptEvidence(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, createdReceipt.runtime_evidence_digest);

const approvalReceipt = evaluateRegistrationAttemptEvidence({ ...baseInput, outcome: 'approval_pending', registration_ref: undefined, approval_ref: 'approval_001' });
assert.equal(approvalReceipt.approval_ref, 'approval_001');

const paymentReceipt = evaluateRegistrationAttemptEvidence({ ...baseInput, outcome: 'payment_pending', registration_ref: undefined, payment_saga_ref: 'registration_invoice_saga_001' });
assert.equal(paymentReceipt.payment_saga_ref, 'registration_invoice_saga_001');

const waitlistReceipt = evaluateRegistrationAttemptEvidence({ ...baseInput, outcome: 'waitlisted', registration_ref: undefined, waitlist_ref: 'waitlist_entry_001' });
assert.equal(waitlistReceipt.waitlist_ref, 'waitlist_entry_001');

const rejectedReceipt = evaluateRegistrationAttemptEvidence({
  ...baseInput,
  outcome: 'capacity_blocked',
  registration_ref: undefined,
  rejection_code: 'capacity_exhausted',
  rejection_reason: 'Ticket type has no remaining capacity.',
});
assert.equal(rejectedReceipt.rejection_code, 'capacity_exhausted');
assert.equal(rejectedReceipt.rejection_reason, 'Ticket type has no remaining capacity.');

assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, attempt_ref: '' }), /attempt_ref is required/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, attempted_at: 'not-a-date' }), /attempted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, outcome: 'registration_created', registration_ref: undefined }), /registration_ref is required/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, outcome: 'approval_pending', registration_ref: undefined, approval_ref: undefined }), /approval_ref is required/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, outcome: 'payment_pending', registration_ref: undefined, payment_saga_ref: undefined }), /payment_saga_ref is required/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, outcome: 'waitlisted', registration_ref: undefined, waitlist_ref: undefined }), /waitlist_ref is required/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, outcome: 'validation_rejected', registration_ref: undefined, rejection_code: undefined }), /rejection_code is required/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, registration_mutation_requested: true }), /registration mutation is outside/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, payment_capture_requested: true }), /payment capture is Saga-owned/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, waitlist_mutation_requested: true }), /waitlist mutation is outside/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, approval_mutation_requested: true }), /approval mutation is outside/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, evidence_persistence_requested: true }), /persistence is outside/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, event_publish_requested: true }), /event publication is deferred/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateRegistrationAttemptEvidence({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime registration_attempt_evidence test passed.');
