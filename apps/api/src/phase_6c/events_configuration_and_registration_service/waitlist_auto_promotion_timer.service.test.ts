import assert from 'node:assert/strict';

import { evaluateWaitlistAutoPromotionTimer, type WaitlistAutoPromotionTimerInput } from './waitlist_auto_promotion_timer.service';

const baseInput: WaitlistAutoPromotionTimerInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_waitlist_auto_promotion_timer',
  event_configuration_id: 'event_config_001',
  source_record_ref: 'waitlist_auto_promotion_timer_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T10:15:00.000Z',
  rule: {
    timer_ref: 'waitlist_timer:standard',
    ticket_type_ref: 'ticket_type:standard',
    auto_promotion_enabled: true,
    promotion_delay_minutes: 30,
    promotion_window_minutes: 60,
    max_promotions_per_run: 3,
  },
  candidate: {
    waitlist_entry_ref: 'waitlist_entry:001',
    ticket_type_ref: 'ticket_type:standard',
    entered_waitlist_at: '2026-06-09T09:30:00.000Z',
    priority_rank: 2,
    capacity_available: 2,
  },
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateWaitlistAutoPromotionTimer(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_102_waitlist_auto_promotion_timer');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CWaitlistAutoPromotionTimer');
assert.equal(receipt.timer_ref, 'waitlist_timer:standard');
assert.equal(receipt.waitlist_entry_ref, 'waitlist_entry:001');
assert.equal(receipt.ticket_type_ref, 'ticket_type:standard');
assert.equal(receipt.eligible_at, '2026-06-09T10:00:00.000Z');
assert.equal(receipt.expires_at, '2026-06-09T11:00:00.000Z');
assert.equal(receipt.decision, 'PROMOTION_ELIGIBLE');
assert.equal(receipt.decision_reason, 'candidate is inside promotion timer window with available capacity');
assert.deepEqual(receipt.adl_refs, ['ADL-023']);
assert.equal(receipt.scheduler_job_created, false);
assert.equal(receipt.waitlist_promotion_performed, false);
assert.equal(receipt.ticket_inventory_mutation_performed, false);
assert.equal(receipt.notification_send_performed, false);
assert.equal(receipt.payment_capture_allowed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.frontend_surface_created, false);
assert.match(receipt.waitlist_auto_promotion_timer_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateWaitlistAutoPromotionTimer(baseInput);
assert.equal(repeatedReceipt.waitlist_auto_promotion_timer_runtime_digest, receipt.waitlist_auto_promotion_timer_runtime_digest);

assert.equal(evaluateWaitlistAutoPromotionTimer({ ...baseInput, rule: { ...baseInput.rule, auto_promotion_enabled: false } }).decision, 'TIMER_DISABLED');
assert.equal(evaluateWaitlistAutoPromotionTimer({ ...baseInput, evaluated_at: '2026-06-09T09:50:00.000Z' }).decision, 'TIMER_NOT_DUE');
assert.equal(evaluateWaitlistAutoPromotionTimer({ ...baseInput, evaluated_at: '2026-06-09T11:30:00.000Z' }).decision, 'PROMOTION_WINDOW_EXPIRED');
assert.equal(evaluateWaitlistAutoPromotionTimer({ ...baseInput, candidate: { ...baseInput.candidate, capacity_available: 0 } }).decision, 'PROMOTION_REQUIRES_REVIEW');
assert.equal(evaluateWaitlistAutoPromotionTimer({ ...baseInput, candidate: { ...baseInput.candidate, priority_rank: 4 } }).decision, 'PROMOTION_REQUIRES_REVIEW');
assert.equal(evaluateWaitlistAutoPromotionTimer({ ...baseInput, candidate: { ...baseInput.candidate, ticket_type_ref: 'ticket_type:vip' } }).decision, 'PROMOTION_REQUIRES_REVIEW');

assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, rule: { ...baseInput.rule, promotion_delay_minutes: -1 } }), /promotion_delay_minutes must be a non-negative integer/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, rule: { ...baseInput.rule, promotion_window_minutes: 0 } }), /promotion_window_minutes must be a positive integer/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, rule: { ...baseInput.rule, max_promotions_per_run: 0 } }), /max_promotions_per_run must be a positive integer/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, candidate: { ...baseInput.candidate, priority_rank: 0 } }), /priority_rank must be a positive integer/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, candidate: { ...baseInput.candidate, capacity_available: -1 } }), /capacity_available must be a non-negative integer/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, scheduler_job_requested: true }), /not create scheduler jobs/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, waitlist_promotion_mutation_requested: true }), /must not mutate waitlist promotion state/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, ticket_inventory_mutation_requested: true }), /must not mutate ticket inventory/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, notification_send_requested: true }), /must not send notifications/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, payment_capture_requested: true }), /must not capture payment/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateWaitlistAutoPromotionTimer({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime waitlist_auto_promotion_timer test passed.');
