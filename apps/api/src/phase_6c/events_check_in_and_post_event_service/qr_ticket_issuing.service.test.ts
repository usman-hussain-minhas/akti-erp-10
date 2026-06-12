import assert from 'node:assert/strict';

import { evaluateQrTicketIssuing, type QrTicketIssuingInput } from './qr_ticket_issuing.service';

const baseInput: QrTicketIssuingInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_qr_ticket_issuing',
  event_config_ref: 'event_config_annual_summit',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_type_ref: 'ticket_type_paid_standard',
  source_record_ref: 'qr_ticket_issuing_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  registration_state: 'confirmed',
  payment_state: 'paid',
  ticket_status: 'not_issued',
  product_catalogue_anchor_ref: 'product_catalogue_ticket_anchor_001',
  registration_invoice_saga_ref: 'registration_invoice_saga_001',
  person_identity_ref: 'person_identity_attendee_001',
  access_audit_ref: 'access_audit_ticket_issue_001',
  crm_event_ref: 'event_crm_handoff_001',
  valid_from: '2026-07-15T08:00:00.000Z',
  valid_until: '2026-07-15T18:00:00.000Z',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const issueReceipt = evaluateQrTicketIssuing(baseInput);
assert.equal(issueReceipt.seed_id, 'seed_6c_111_qr_ticket_issuing');
assert.equal(issueReceipt.component_id, '6C.09');
assert.equal(issueReceipt.event_name, 'phase_6c.events_check_in_and_post_event_service.qr_ticket_issuing.runtime_evaluated');
assert.equal(issueReceipt.decision, 'ISSUE_QR_TICKET');
assert.equal(issueReceipt.qr_ticket_payload?.qr_payload_version, 'phase_6c_qr_ticket_v1');
assert.match(issueReceipt.qr_ticket_payload?.idempotency_key ?? '', /^[a-f0-9]{64}$/);
assert.match(issueReceipt.qr_ticket_payload?.qr_payload_digest ?? '', /^[a-f0-9]{64}$/);
assert.equal(issueReceipt.dependency_trace.registration_context, '6C.08');
assert.equal(issueReceipt.dependency_trace.registration_invoice_saga_ref, 'registration_invoice_saga_001');
assert.equal(issueReceipt.dependency_trace.person_identity_ref, 'person_identity_attendee_001');
assert.deepEqual(issueReceipt.decision_refs, ['6C-EVENT-CHECK-001', '6C-EVENT-CHECK-014', '6C-EVENT-REG-012', '6C-GLOBAL-018']);
assert.match(issueReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateQrTicketIssuing(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, issueReceipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.qr_ticket_payload?.idempotency_key, issueReceipt.qr_ticket_payload?.idempotency_key);

const awaitRegistrationReceipt = evaluateQrTicketIssuing({ ...baseInput, registration_state: 'pending', payment_state: 'not_required' });
assert.equal(awaitRegistrationReceipt.decision, 'AWAIT_REGISTRATION');
assert.equal(awaitRegistrationReceipt.qr_ticket_payload, null);

const awaitPaymentReceipt = evaluateQrTicketIssuing({ ...baseInput, payment_state: 'pending' });
assert.equal(awaitPaymentReceipt.decision, 'AWAIT_PAYMENT');

const issuedReceipt = evaluateQrTicketIssuing({ ...baseInput, ticket_status: 'issued', ticket_issue_ref: 'ticket_issue_001' });
assert.equal(issuedReceipt.decision, 'TICKET_ALREADY_ISSUED');
assert.equal(issuedReceipt.dependency_trace.ticket_issue_ref, 'ticket_issue_001');

const reviewReceipt = evaluateQrTicketIssuing({ ...baseInput, registration_state: 'cancelled' });
assert.equal(reviewReceipt.decision, 'ISSUE_REQUIRES_REVIEW');

assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, registration_ref: '' }), /registration_ref is required/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, valid_until: baseInput.valid_from }), /valid_until must be after valid_from/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, ticket_issue_ref: '' }), /ticket_issue_ref must be non-empty/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, qr_image_render_requested: true }), /QR image rendering is deferred/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, ticket_delivery_requested: true }), /ticket delivery is outside/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, check_in_mark_requested: true }), /check-in marking belongs/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, payment_capture_requested: true }), /payment capture belongs/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, ticket_persistence_requested: true }), /ticket persistence is outside/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateQrTicketIssuing({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime qr_ticket_issuing test passed.');
