import assert from 'node:assert/strict';

import { evaluateWaitlistRule, type WaitlistRuleInput } from './waitlist_rule.service';

const baseInput: WaitlistRuleInput = {
  organization_id: 'org_phase_6c_events',
  service_manifest_contract_id: 'smc_phase_6c_waitlist_rule',
  event_configuration_id: 'event_config_001',
  source_record_ref: 'waitlist_rule_record_001',
  evaluated_by_user_id: 'user_phase_6c_events',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  product_catalogue_ref: 'product_catalogue:event_ticket_ops_forum',
  waitlist_rules: [
    {
      ticket_type_ref: 'ticket_type:standard',
      product_catalogue_item_ref: 'product_catalogue_item:standard_ticket',
      waitlist_enabled: true,
      max_waitlist_size: 50,
      join_policy: 'AFTER_SELL_OUT',
      ranking_strategy: 'FIFO',
    },
    {
      ticket_type_ref: 'ticket_type:vip',
      product_catalogue_item_ref: 'product_catalogue_item:vip_ticket',
      waitlist_enabled: true,
      max_waitlist_size: 10,
      join_policy: 'OPEN',
      ranking_strategy: 'PRIORITY_SCORE',
      min_priority_score: 80,
    },
  ],
  candidate_request: {
    ticket_type_ref: 'ticket_type:standard',
    requested_quantity: 2,
    current_waitlist_count: 20,
    active_capacity_remaining: 0,
  },
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateWaitlistRule(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_101_waitlist_rule');
assert.equal(receipt.component_id, '6C.08');
assert.equal(receipt.component_slug, 'events_configuration_and_registration_service');
assert.equal(receipt.model_name, 'Phase6CWaitlistRule');
assert.equal(receipt.rule_count, 2);
assert.equal(receipt.requested_ticket_type_ref, 'ticket_type:standard');
assert.equal(receipt.requested_quantity, 2);
assert.equal(receipt.remaining_waitlist_slots, 28);
assert.equal(receipt.decision, 'WAITLIST_ACCEPTED');
assert.equal(receipt.decision_reason, 'candidate satisfies configured waitlist rule');
assert.deepEqual(receipt.adl_refs, ['ADL-023']);
assert.equal(receipt.refs_events_only, true);
assert.equal(receipt.waitlist_entry_mutation_performed, false);
assert.equal(receipt.ticket_inventory_mutation_performed, false);
assert.equal(receipt.auto_promotion_performed, false);
assert.equal(receipt.payment_capture_allowed, false);
assert.equal(receipt.notification_send_performed, false);
assert.equal(receipt.provider_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.frontend_surface_created, false);
assert.match(receipt.waitlist_rule_runtime_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateWaitlistRule(baseInput);
assert.equal(repeatedReceipt.waitlist_rule_runtime_digest, receipt.waitlist_rule_runtime_digest);

assert.equal(evaluateWaitlistRule({ ...baseInput, candidate_request: { ...baseInput.candidate_request!, active_capacity_remaining: 3 } }).decision, 'WAITLIST_NOT_NEEDED');
assert.equal(evaluateWaitlistRule({ ...baseInput, waitlist_rules: [{ ...baseInput.waitlist_rules[0], waitlist_enabled: false }], candidate_request: { ...baseInput.candidate_request! } }).decision, 'WAITLIST_DISABLED');
assert.equal(evaluateWaitlistRule({ ...baseInput, candidate_request: { ...baseInput.candidate_request!, requested_quantity: 40 } }).decision, 'WAITLIST_FULL');
assert.equal(evaluateWaitlistRule({ ...baseInput, waitlist_rules: [{ ...baseInput.waitlist_rules[1] }], candidate_request: { ticket_type_ref: 'ticket_type:vip', requested_quantity: 1, current_waitlist_count: 0, active_capacity_remaining: 0, priority_score: 90 } }).decision, 'WAITLIST_ACCEPTED');
assert.equal(evaluateWaitlistRule({ ...baseInput, waitlist_rules: [{ ...baseInput.waitlist_rules[1] }], candidate_request: { ticket_type_ref: 'ticket_type:vip', requested_quantity: 1, current_waitlist_count: 0, active_capacity_remaining: 0, priority_score: 70 } }).decision, 'WAITLIST_REQUIRES_REVIEW');
assert.equal(evaluateWaitlistRule({ ...baseInput, waitlist_rules: [{ ...baseInput.waitlist_rules[0], join_policy: 'INVITE_ONLY' }], candidate_request: { ...baseInput.candidate_request! } }).decision, 'WAITLIST_REQUIRES_REVIEW');
assert.equal(evaluateWaitlistRule({ ...baseInput, candidate_request: undefined }).decision, 'WAITLIST_REQUIRES_REVIEW');

assert.throws(() => evaluateWaitlistRule({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, waitlist_rules: [] }), /at least one waitlist_rule is required/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, waitlist_rules: [{ ...baseInput.waitlist_rules[0], ticket_type_ref: '' }] }), /ticket_type_ref is required/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, waitlist_rules: [{ ...baseInput.waitlist_rules[0] }, { ...baseInput.waitlist_rules[0] }] }), /ticket_type_ref values must be unique/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, waitlist_rules: [{ ...baseInput.waitlist_rules[0], max_waitlist_size: 0 }] }), /enabled waitlist_rule requires max_waitlist_size/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, waitlist_rules: [{ ...baseInput.waitlist_rules[0], ranking_strategy: 'PRIORITY_SCORE' }] }), /min_priority_score must be a non-negative integer/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, candidate_request: { ticket_type_ref: 'ticket_type:missing', requested_quantity: 1, current_waitlist_count: 0, active_capacity_remaining: 0 } }), /must match a declared waitlist_rule/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, candidate_request: { ...baseInput.candidate_request!, requested_quantity: 0 } }), /requested_quantity must be a positive integer/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, waitlist_entry_mutation_requested: true }), /not mutate waitlist entries/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, ticket_inventory_mutation_requested: true }), /must not mutate ticket inventory/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, auto_promotion_requested: true }), /must not execute auto-promotion/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, payment_capture_requested: true }), /must not capture payment/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, notification_send_requested: true }), /must not send notifications/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, provider_adapter_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, persistence_requested: true }), /must not persist records/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateWaitlistRule({ ...baseInput, frontend_requested: true }), /must not create frontend surfaces/);

console.log('P6C runtime waitlist_rule test passed.');
