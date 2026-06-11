import assert from 'node:assert/strict';

import { scheduleDeferredCommissionRelease, type CommissionDeferredReleaseInput } from './commission_deferred_release.service';

const baseInput: CommissionDeferredReleaseInput = {
  organization_id: 'org_phase_6c_commission',
  service_manifest_contract_id: 'smc_phase_6c_commission_deferred_release',
  source_record_ref: 'commission_release_batch_2026_06',
  scheduler_run_ref: 'scheduler_run_2026_06_15',
  period_ref: '2026-06',
  currency: 'USD',
  scheduler_run_at: '2026-06-15T09:00:00.000Z',
  release_items: [
    {
      commission_receipt_ref: 'commission_receipt_ready_001',
      employee_ref: 'employee_sales_001',
      commission_plan_ref: 'plan_standard_sales_commission',
      payable_commission_amount: 800,
      currency: 'USD',
      earned_at: '2026-05-31T23:59:59.000Z',
      release_not_before: '2026-06-10T00:00:00.000Z',
      cadence: 'MONTHLY',
      approved_for_release: true,
      evidence_refs: ['crm_closed_won_001', 'payment_collection_001'],
    },
    {
      commission_receipt_ref: 'commission_receipt_future_001',
      employee_ref: 'employee_sales_002',
      commission_plan_ref: 'plan_standard_sales_commission',
      payable_commission_amount: 500,
      earned_at: '2026-06-02T12:00:00.000Z',
      release_not_before: '2026-07-01T00:00:00.000Z',
      cadence: 'HOLD_UNTIL_DATE',
      approved_for_release: true,
      evidence_refs: ['invoice_margin_001'],
    },
    {
      commission_receipt_ref: 'commission_receipt_hold_001',
      employee_ref: 'employee_sales_003',
      commission_plan_ref: 'plan_enterprise_sales_commission',
      payable_commission_amount: 1200,
      earned_at: '2026-06-03T12:00:00.000Z',
      release_not_before: '2026-06-12T00:00:00.000Z',
      cadence: 'MILESTONE',
      approved_for_release: true,
      risk_hold: true,
      hold_reason: 'contract cancellation review pending',
      evidence_refs: ['manual_review_case_001'],
    },
    {
      commission_receipt_ref: 'commission_receipt_unapproved_001',
      employee_ref: 'employee_sales_004',
      commission_plan_ref: 'plan_standard_sales_commission',
      payable_commission_amount: 200,
      earned_at: '2026-06-04T12:00:00.000Z',
      release_not_before: '2026-06-05T00:00:00.000Z',
      cadence: 'IMMEDIATE',
      approved_for_release: false,
      evidence_refs: ['manual_adjustment_rejected_001'],
    },
  ],
  evaluated_by_user_id: 'user_commission_scheduler',
  evaluated_at: '2026-06-15T09:01:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_044' },
};

const receipt = scheduleDeferredCommissionRelease(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_044_commission_deferred_release');
assert.equal(receipt.component_id, '6C.04');
assert.equal(receipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(receipt.model_name, 'Phase6CCommissionDeferredRelease');
assert.equal(receipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.commission_deferred_release.scheduled');
assert.equal(receipt.release_item_count, 4);
assert.equal(receipt.ready_release_count, 1);
assert.equal(receipt.future_release_count, 1);
assert.equal(receipt.held_release_count, 2);
assert.equal(receipt.ready_release_amount, 800);
assert.equal(receipt.future_release_amount, 500);
assert.equal(receipt.held_release_amount, 1400);
assert.equal(receipt.next_release_at, '2026-06-10T00:00:00.000Z');
assert.equal(receipt.decision, 'DEFERRED_RELEASE_PARTIAL_HOLD');
assert.equal(receipt.planned_releases[0].outcome, 'READY_FOR_RELEASE');
assert.equal(receipt.planned_releases[1].outcome, 'SCHEDULED_FOR_FUTURE');
assert.equal(receipt.planned_releases[2].outcome, 'HELD_FOR_REVIEW');
assert.equal(receipt.planned_releases[2].hold_reason, 'contract cancellation review pending');
assert.equal(receipt.payroll_mutation_allowed, false);
assert.equal(receipt.payment_mutation_allowed, false);
assert.equal(receipt.crm_mutation_allowed, false);
assert.equal(receipt.provider_specific_adapter_allowed, false);
assert.equal(receipt.schema_mutation_allowed, false);
assert.equal(receipt.phase_6a_mutation_allowed, false);
assert.equal(receipt.phase_6b_mutation_allowed, false);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.ticket_flag_flip_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-HR-OPS-006']);
assert.match(receipt.release_schedule_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = scheduleDeferredCommissionRelease(baseInput);
assert.equal(repeatedReceipt.release_schedule_digest, receipt.release_schedule_digest);

const readyOnlyReceipt = scheduleDeferredCommissionRelease({
  ...baseInput,
  release_items: baseInput.release_items.slice(0, 2),
});
assert.equal(readyOnlyReceipt.decision, 'DEFERRED_RELEASE_PLAN_READY');
assert.equal(readyOnlyReceipt.held_release_count, 0);
assert.equal(readyOnlyReceipt.ready_release_amount, 800);
assert.equal(readyOnlyReceipt.future_release_amount, 500);

const reviewReceipt = scheduleDeferredCommissionRelease({
  ...baseInput,
  release_items: baseInput.release_items.slice(2),
});
assert.equal(reviewReceipt.decision, 'DEFERRED_RELEASE_REQUIRES_REVIEW');
assert.equal(reviewReceipt.next_release_at, null);
assert.equal(reviewReceipt.held_release_amount, 1400);

assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, scheduler_run_ref: '' }), /scheduler_run_ref is required/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, period_ref: '' }), /period_ref is required/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, currency: 'US' }), /currency must be a three-letter ISO currency code/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, scheduler_run_at: 'not-a-date' }), /scheduler_run_at must be a valid ISO-compatible timestamp/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, release_items: [{ ...baseInput.release_items[0], currency: 'EUR' }] }), /currency must match/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, release_items: [{ ...baseInput.release_items[0], payable_commission_amount: -1 }] }), /payable_commission_amount must be a non-negative finite number/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, release_items: [{ ...baseInput.release_items[0], cadence: 'WEEKLY' as never }] }), /cadence must be a supported release cadence/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, release_items: [{ ...baseInput.release_items[0], evidence_refs: [] }] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, release_items: [{ ...baseInput.release_items[0], release_not_before: 'not-a-date' }] }), /release_not_before must be a valid ISO-compatible timestamp/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, payroll_mutation_requested: true }), /must not perform payroll mutation/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, payment_mutation_requested: true }), /must not perform payment mutation/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, crm_mutation_requested: true }), /must not perform CRM mutation/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, provider_specific_adapter_requested: true }), /must not perform provider-specific adapter execution/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => scheduleDeferredCommissionRelease({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C commission_deferred_release runtime FFET test passed.');
