import assert from 'node:assert/strict';
import { acceptPayrollHrEventFeed, type PayrollHrEventFeedBoundaryInput } from './hr_event_feed_boundary.service';

const baseInput: PayrollHrEventFeedBoundaryInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_finance_payroll_foundation',
  source_seed_id: 'seed_6b_14_hr_event_feed_boundary',
  feed_ref: 'hr_feed_2026_06',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  person_identity_scope_ref: 'person_scope_payroll_2026_06',
  accepted_by_user_id: 'user_payroll_controller_001',
  accepted_at: '2026-06-08T00:00:00.000Z',
  events: [
    { hr_event_ref: 'hr_event_001', event_type: 'PAYEE_CREATED', person_identity_ref: 'person_001', payee_ref: 'payee_001', effective_at: '2026-06-01T00:00:00.000Z', source_evidence_ref: 'hr:payee_001:created' },
    { hr_event_ref: 'hr_event_002', event_type: 'COMPENSATION_CHANGED', person_identity_ref: 'person_001', payee_ref: 'payee_001', effective_at: '2026-06-05T00:00:00.000Z', gross_pay_minor: 300000, base_pay_minor: 200000, currency_code: 'usd', source_evidence_ref: 'hr:payee_001:compensation_changed' },
    { hr_event_ref: 'hr_event_003', event_type: 'PAYEE_INACTIVE', person_identity_ref: 'person_002', payee_ref: 'payee_002', effective_at: '2026-06-06T00:00:00.000Z', source_evidence_ref: 'hr:payee_002:inactive' },
  ],
};

const receipt = acceptPayrollHrEventFeed(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_14_hr_event_feed_boundary');
assert.equal(receipt.component_id, '6B.14');
assert.equal(receipt.event_name, 'phase_6b.finance_payroll.hr_event_feed_accepted');
assert.equal(receipt.phase_6b_payee_model, 'Phase6BPayee');
assert.equal(receipt.source_seed_id, 'seed_6b_14_hr_event_feed_boundary');
assert.equal(receipt.event_count, 3);
assert.equal(receipt.normalized_events[0].boundary_action, 'UPSERT_PAYEE_RECORD');
assert.equal(receipt.normalized_events[1].boundary_action, 'REFRESH_COMPENSATION_INPUT');
assert.equal(receipt.normalized_events[1].currency_code, 'USD');
assert.equal(receipt.normalized_events[2].boundary_action, 'EXCLUDE_FROM_FUTURE_RUNS');
assert.equal(receipt.boundary_evidence_ref, 'hr_event_feed_boundary:hr_feed_2026_06:accepted');
assert.equal(receipt.hr_record_mutated, false);
assert.equal(receipt.payroll_calculated, false);
assert.equal(receipt.payout_created, false);
assert.equal(receipt.disbursement_file_generated, false);
assert.equal(receipt.journal_posted, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.boundary_digest.length, 64);

assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, feed_ref: '' }), /feed_ref is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, person_identity_scope_ref: '' }), /person_identity_scope_ref is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [] }), /events must include at least one event/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[0], hr_event_ref: '' }] }), /events.hr_event_ref is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[0], event_type: 'OTHER' as never }] }), /event_type is not supported/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[0], person_identity_ref: '' }] }), /events.person_identity_ref is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[0], payee_ref: '' }] }), /events.payee_ref is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[0], effective_at: 'not-a-date' }] }), /events.effective_at must be a valid ISO-compatible timestamp/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[1], gross_pay_minor: undefined }] }), /COMPENSATION_CHANGED events require/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[1], base_pay_minor: 999999 }] }), /events.base_pay_minor must not exceed/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[1], currency_code: 'US' }] }), /events.currency_code must be a three-letter/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [{ ...baseInput.events[0], source_evidence_ref: '' }] }), /events.source_evidence_ref is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, events: [baseInput.events[0], baseInput.events[0]] }), /events must not repeat hr_event_ref/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, accepted_by_user_id: '' }), /accepted_by_user_id is required/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, accepted_at: 'not-a-date' }), /accepted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, hr_record_mutation_requested: true }), /must not mutate HR records/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, payroll_calculation_requested: true }), /must not calculate payroll/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, payout_creation_requested: true }), /must not create payroll payouts/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, disbursement_file_requested: true }), /must not generate disbursement files/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => acceptPayrollHrEventFeed({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-098 HR event feed boundary service test passed.');
