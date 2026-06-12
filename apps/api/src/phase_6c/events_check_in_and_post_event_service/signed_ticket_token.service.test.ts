import assert from 'node:assert/strict';

import { evaluateSignedTicketToken, type SignedTicketTokenInput } from './signed_ticket_token.service';

const baseInput: SignedTicketTokenInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_signed_ticket_token',
  event_config_ref: 'event_config_annual_summit',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_type_ref: 'ticket_type_paid_standard',
  qr_payload_digest: 'a'.repeat(64),
  source_record_ref: 'signed_ticket_token_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  signing_key_ref: 'phase6c_ticket_signing_key_v1',
  signing_key_material: 'local-test-signing-material-not-production',
  issued_at: '2026-06-09T09:00:00.000Z',
  not_before: '2026-06-09T09:00:00.000Z',
  expires_at: '2026-07-15T18:00:00.000Z',
  issuer: 'phase_6c.events_check_in_and_post_event_service',
  audience: 'phase_6c.ticket_check_in',
  ticket_issue_ref: 'ticket_issue_001',
  person_identity_ref: 'person_identity_attendee_001',
  access_audit_ref: 'access_audit_ticket_token_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateSignedTicketToken(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_112_signed_ticket_token');
assert.equal(receipt.component_id, '6C.09');
assert.equal(receipt.event_name, 'phase_6c.events_check_in_and_post_event_service.signed_ticket_token.runtime_evaluated');
assert.equal(receipt.algorithm, 'HS256');
assert.equal(receipt.verification_result, 'SIGNATURE_VALID');
assert.equal(receipt.signing_key_ref, 'phase6c_ticket_signing_key_v1');
assert.equal(receipt.token.split('.').length, 3);
assert.match(receipt.token_header_digest, /^[a-f0-9]{64}$/);
assert.match(receipt.token_payload_digest, /^[a-f0-9]{64}$/);
assert.match(receipt.token_signature_digest, /^[a-f0-9]{64}$/);
assert.equal(receipt.dependency_trace.qr_ticket_issuing_seed, 'seed_6c_111_qr_ticket_issuing');
assert.equal(receipt.dependency_trace.registration_context, '6C.08');
assert.deepEqual(receipt.decision_refs, ['6C-EVENT-CHECK-002', '6C-EVENT-CHECK-014', '6C-GLOBAL-018']);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateSignedTicketToken(baseInput);
assert.equal(repeatedReceipt.token, receipt.token);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

const laterReceipt = evaluateSignedTicketToken({ ...baseInput, issued_at: '2026-06-09T09:01:00.000Z', not_before: '2026-06-09T09:01:00.000Z' });
assert.notEqual(laterReceipt.token, receipt.token);

assert.throws(() => evaluateSignedTicketToken({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, signing_key_material: '' }), /signing_key_material is required/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, issued_at: 'not-a-date' }), /issued_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, not_before: '2026-06-09T08:59:00.000Z' }), /not_before must be on or after issued_at/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, expires_at: baseInput.not_before }), /expires_at must be after not_before/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, ticket_issue_ref: '' }), /ticket_issue_ref must be non-empty/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, production_secret_lookup_requested: true }), /production secret lookup is outside/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, token_persistence_requested: true }), /token persistence is outside/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, token_delivery_requested: true }), /token delivery is outside/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, check_in_validation_requested: true }), /check-in validation belongs/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateSignedTicketToken({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime signed_ticket_token test passed.');
