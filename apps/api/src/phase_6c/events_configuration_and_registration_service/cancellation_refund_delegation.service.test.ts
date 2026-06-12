import assert from 'node:assert/strict';

import { evaluateCancellationRefundDelegation, type CancellationRefundDelegationInput } from './cancellation_refund_delegation.service';

const baseInput: CancellationRefundDelegationInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_cancellation_refund_delegation',
  event_config_ref: 'event_config_annual_summit',
  registration_ref: 'registration_001',
  attendee_ref: 'attendee_001',
  ticket_type_ref: 'ticket_type_paid_standard',
  source_record_ref: 'cancellation_refund_delegation_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  cancellation_state: 'approved',
  cancellation_requested_at: '2026-06-09T08:45:00.000Z',
  paid_registration: true,
  refund_eligible: true,
  cancellation_reason: 'attendee_requested_cancellation',
  product_catalogue_anchor_ref: 'product_catalogue_ticket_anchor_001',
  invoice_ref: 'invoice_001',
  payment_ref: 'payment_001',
  ticket_issue_ref: 'ticket_issue_001',
  registration_invoice_saga_ref: 'registration_invoice_saga_001',
  crm_handoff_ref: 'event_crm_handoff_001',
  workspace_calendar_ref: 'workspace_calendar_event_ref_001',
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const delegateReceipt = evaluateCancellationRefundDelegation(baseInput);
assert.equal(delegateReceipt.seed_id, 'seed_6c_110_cancellation_refund_delegation');
assert.equal(delegateReceipt.component_id, '6C.08');
assert.equal(delegateReceipt.event_name, 'phase_6c.events_configuration_and_registration_service.cancellation_refund_delegation.runtime_evaluated');
assert.equal(delegateReceipt.decision, 'DELEGATE_REFUND');
assert.equal(delegateReceipt.dependency_trace.product_catalogue_anchor_ref, 'product_catalogue_ticket_anchor_001');
assert.equal(delegateReceipt.dependency_trace.payment_ref, 'payment_001');
assert.equal(delegateReceipt.dependency_trace.registration_invoice_saga_ref, 'registration_invoice_saga_001');
assert.deepEqual(delegateReceipt.adl_refs, ['ADL-001']);
assert.match(delegateReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateCancellationRefundDelegation(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, delegateReceipt.runtime_evidence_digest);

const awaitRefundReceipt = evaluateCancellationRefundDelegation({ ...baseInput, cancellation_state: 'refund_delegated', refund_request_ref: 'refund_request_001', finance_delegation_ref: 'finance_refund_delegation_001' });
assert.equal(awaitRefundReceipt.decision, 'AWAIT_REFUND');

const completeReceipt = evaluateCancellationRefundDelegation({ ...baseInput, cancellation_state: 'refund_completed', refund_request_ref: 'refund_request_001', refund_ref: 'refund_001' });
assert.equal(completeReceipt.decision, 'CANCELLATION_COMPLETE');

const noRefundReceipt = evaluateCancellationRefundDelegation({
  ...baseInput,
  paid_registration: false,
  refund_eligible: false,
  cancellation_state: 'cancelled',
  product_catalogue_anchor_ref: undefined,
  invoice_ref: undefined,
  payment_ref: undefined,
});
assert.equal(noRefundReceipt.decision, 'CANCEL_WITHOUT_REFUND');

const rejectedReceipt = evaluateCancellationRefundDelegation({ ...baseInput, cancellation_state: 'rejected', refund_eligible: false });
assert.equal(rejectedReceipt.decision, 'CANCELLATION_REJECTED');

const failedReceipt = evaluateCancellationRefundDelegation({ ...baseInput, cancellation_state: 'refund_failed', failure_reason: 'refund_provider_declined' });
assert.equal(failedReceipt.decision, 'DELEGATE_REFUND');
assert.equal(failedReceipt.failure_reason, 'refund_provider_declined');

assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, cancellation_reason: '' }), /cancellation_reason is required/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, paid_registration: true, product_catalogue_anchor_ref: undefined }), /product_catalogue_anchor_ref is required/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, evaluated_at: '2026-06-09T08:00:00.000Z' }), /evaluated_at must be on or after cancellation_requested_at/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, refund_ref: '' }), /refund_ref must be non-empty/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, direct_refund_execution_requested: true }), /refund execution is delegated/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, payment_mutation_requested: true }), /payment mutation is outside/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, invoice_mutation_requested: true }), /invoice mutation is outside/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, ticket_reissue_requested: true }), /ticket reissue is outside/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, provider_sync_requested: true }), /provider sync is not authorized/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, persistence_requested: true }), /persistence is outside/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, schema_mutation_requested: true }), /schema mutation is forbidden/);
assert.throws(() => evaluateCancellationRefundDelegation({ ...baseInput, frontend_requested: true }), /frontend creation is outside/);

console.log('P6C runtime cancellation_refund_delegation test passed.');
