import assert from 'node:assert/strict';

import { evaluateRegistrationInvoiceSaga, type RegistrationInvoiceSagaInput } from './registration_invoice_saga.service';

const baseInput: RegistrationInvoiceSagaInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_registration_invoice_saga',
  event_config_ref: 'event_config_annual_summit',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_type_ref: 'ticket_type_paid_standard',
  source_record_ref: 'registration_invoice_saga_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  paid_registration: true,
  saga_stage: 'payment_confirmed',
  product_catalogue_anchor_ref: 'product_catalogue_ticket_anchor_001',
  invoice_ref: 'invoice_001',
  payment_ref: 'payment_001',
  outbox_message_ref: 'outbox_message_registration_invoice_saga_001',
  crm_handoff_ref: 'event_crm_handoff_001',
  workspace_calendar_ref: 'workspace_calendar_event_ref_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const issueTicketReceipt = evaluateRegistrationInvoiceSaga(baseInput);
assert.equal(issueTicketReceipt.seed_id, 'seed_6c_108_registration_invoice_saga');
assert.equal(issueTicketReceipt.component_id, '6C.08');
assert.equal(issueTicketReceipt.event_name, 'phase_6c.events_configuration_and_registration_service.registration_invoice_saga.runtime_evaluated');
assert.equal(issueTicketReceipt.decision, 'ISSUE_TICKET');
assert.deepEqual(issueTicketReceipt.adl_refs, ['ADL-001', 'ADL-002']);
assert.equal(issueTicketReceipt.dependency_trace.product_catalogue_anchor_ref, 'product_catalogue_ticket_anchor_001');
assert.equal(issueTicketReceipt.dependency_trace.invoice_ref, 'invoice_001');
assert.equal(issueTicketReceipt.dependency_trace.payment_ref, 'payment_001');
assert.equal(issueTicketReceipt.saga_steps.find((step) => step.step_name === 'ticket')?.status, 'pending');
assert.match(issueTicketReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateRegistrationInvoiceSaga(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, issueTicketReceipt.runtime_evidence_digest);

const requestInvoiceReceipt = evaluateRegistrationInvoiceSaga({
  ...baseInput,
  saga_stage: 'registration_accepted',
  invoice_ref: undefined,
  payment_ref: undefined,
});
assert.equal(requestInvoiceReceipt.decision, 'REQUEST_INVOICE');
assert.equal(requestInvoiceReceipt.saga_steps.find((step) => step.step_name === 'invoice')?.status, 'pending');

const awaitInvoiceReceipt = evaluateRegistrationInvoiceSaga({
  ...baseInput,
  saga_stage: 'invoice_requested',
  invoice_ref: undefined,
  payment_ref: undefined,
});
assert.equal(awaitInvoiceReceipt.decision, 'AWAIT_INVOICE');

const awaitPaymentReceipt = evaluateRegistrationInvoiceSaga({ ...baseInput, saga_stage: 'invoice_issued', payment_ref: undefined });
assert.equal(awaitPaymentReceipt.decision, 'AWAIT_PAYMENT');

const completeReceipt = evaluateRegistrationInvoiceSaga({ ...baseInput, saga_stage: 'ticket_issued', ticket_issue_ref: 'ticket_issue_001' });
assert.equal(completeReceipt.decision, 'SAGA_COMPLETE');
assert.equal(completeReceipt.saga_steps.find((step) => step.step_name === 'ticket')?.status, 'satisfied');

const freeRegistrationReceipt = evaluateRegistrationInvoiceSaga({
  ...baseInput,
  paid_registration: false,
  saga_stage: 'registration_accepted',
  product_catalogue_anchor_ref: undefined,
  invoice_ref: undefined,
  payment_ref: undefined,
});
assert.equal(freeRegistrationReceipt.decision, 'ISSUE_TICKET');
assert.equal(freeRegistrationReceipt.saga_steps.find((step) => step.step_name === 'invoice')?.status, 'not_applicable');

const compensationReceipt = evaluateRegistrationInvoiceSaga({
  ...baseInput,
  saga_stage: 'failed',
  failure_reason: 'payment_declined_after_invoice_request',
  payment_ref: undefined,
  dlq_recovery_ref: 'dlq_registration_invoice_saga_001',
});
assert.equal(compensationReceipt.decision, 'COMPENSATION_REQUIRED');
assert.equal(compensationReceipt.failure_reason, 'payment_declined_after_invoice_request');
assert.equal(compensationReceipt.saga_steps.find((step) => step.step_name === 'compensation')?.status, 'pending');

assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, paid_registration: true, product_catalogue_anchor_ref: undefined }), /product_catalogue_anchor_ref is required/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, saga_stage: 'failed', failure_reason: undefined }), /failure_reason is required/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, invoice_ref: '' }), /invoice_ref must be non-empty/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, two_phase_commit_requested: true }), /ADL-001 forbids two-phase commit/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, direct_invoice_mutation_requested: true }), /invoice mutation belongs/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, direct_payment_capture_requested: true }), /payment capture belongs/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, direct_ticket_issue_requested: true }), /ticket issue mutation is outside/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, outbox_dispatch_requested: true }), /outbox dispatch is deferred/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, dlq_replay_requested: true }), /DLQ replay is deferred/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, persistence_requested: true }), /persistence is outside/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateRegistrationInvoiceSaga({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime registration_invoice_saga test passed.');
