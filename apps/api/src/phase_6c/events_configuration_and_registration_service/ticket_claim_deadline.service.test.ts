import assert from 'node:assert/strict';

import { evaluateTicketClaimDeadline, type TicketClaimDeadlineInput } from './ticket_claim_deadline.service';

const baseInput: TicketClaimDeadlineInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_ticket_claim_deadline',
  event_configuration_id: 'event_config_001',
  ticket_claim_ref: 'ticket_claim:001',
  ticket_type_ref: 'ticket_type:standard',
  registration_ref: 'registration:001',
  source_record_ref: 'ticket_claim_deadline_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T10:30:00.000Z',
  issued_at: '2026-06-09T09:00:00.000Z',
  claim_opens_at: '2026-06-09T10:00:00.000Z',
  claim_deadline_at: '2026-06-09T11:00:00.000Z',
  grace_minutes: 10,
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateTicketClaimDeadline(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_103_ticket_claim_deadline');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CTicketClaimDeadline');
assert.equal(receipt.claim_opens_at, '2026-06-09T10:00:00.000Z');
assert.equal(receipt.claim_deadline_at, '2026-06-09T11:00:00.000Z');
assert.equal(receipt.effective_deadline_at, '2026-06-09T11:10:00.000Z');
assert.equal(receipt.decision, 'CLAIM_OPEN');
assert.equal(receipt.decision_reason, 'claim window is currently open');
assert.deepEqual(receipt.adl_refs, ['ADL-023']);
assert.equal(receipt.ticket_issue_mutation_performed, false);
assert.equal(receipt.ticket_claim_mutation_performed, false);
assert.equal(receipt.ticket_cancel_mutation_performed, false);
assert.equal(receipt.notification_send_performed, false);
assert.equal(receipt.scheduler_job_created, false);
assert.equal(receipt.payment_capture_allowed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.frontend_surface_created, false);
assert.match(receipt.ticket_claim_deadline_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateTicketClaimDeadline(baseInput);
assert.equal(repeatedReceipt.ticket_claim_deadline_runtime_digest, receipt.ticket_claim_deadline_runtime_digest);

assert.equal(evaluateTicketClaimDeadline({ ...baseInput, evaluated_at: '2026-06-09T09:30:00.000Z' }).decision, 'CLAIM_NOT_YET_OPEN');
assert.equal(evaluateTicketClaimDeadline({ ...baseInput, evaluated_at: '2026-06-09T11:30:00.000Z' }).decision, 'CLAIM_EXPIRED');
assert.equal(evaluateTicketClaimDeadline({ ...baseInput, claimed_at: '2026-06-09T10:15:00.000Z' }).decision, 'CLAIM_CAPTURED');
assert.equal(evaluateTicketClaimDeadline({ ...baseInput, claimed_at: '2026-06-09T09:30:00.000Z' }).decision, 'CLAIM_REQUIRES_REVIEW');
assert.equal(evaluateTicketClaimDeadline({ ...baseInput, claimed_at: '2026-06-09T11:30:00.000Z' }).decision, 'CLAIM_REQUIRES_REVIEW');
assert.equal(evaluateTicketClaimDeadline({ ...baseInput, claim_opens_at: undefined }).claim_opens_at, '2026-06-09T09:00:00.000Z');

assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, claim_opens_at: '2026-06-09T08:00:00.000Z' }), /claim_opens_at must not be before issued_at/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, claim_deadline_at: '2026-06-09T09:30:00.000Z' }), /claim_deadline_at must be after claim_opens_at/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, grace_minutes: -1 }), /grace_minutes must be a non-negative integer/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, ticket_issue_mutation_requested: true }), /must not issue tickets/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, ticket_claim_mutation_requested: true }), /not mutate claims/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, ticket_cancel_mutation_requested: true }), /must not cancel tickets/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, notification_send_requested: true }), /must not send notifications/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, scheduler_job_requested: true }), /must not create scheduler jobs/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, payment_capture_requested: true }), /must not capture payment/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateTicketClaimDeadline({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime ticket_claim_deadline test passed.');
