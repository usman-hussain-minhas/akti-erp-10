import assert from 'node:assert/strict';

import { evaluateTaskReminderGateway, type TaskReminderGatewayInput } from './task_reminder_gateway.service';

const baseInput: TaskReminderGatewayInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_task_reminder_gateway',
  reminder_ref: 'reminder_task_001',
  task_ref: 'task_001',
  task_title: 'Prepare board packet',
  due_at: '2026-06-15T12:00:00.000Z',
  reminder_at: '2026-06-15T09:00:00.000Z',
  evaluated_at: '2026-06-15T09:05:00.000Z',
  requested_by_user_id: 'user_task_owner',
  priority: 'HIGH',
  recipients: [
    { recipient_ref: 'person_001', channel: 'EMAIL', opt_out_state: 'OPTED_IN', gateway_recipient_ref: 'gw_person_001_email' },
    { recipient_ref: 'person_002', channel: 'SMS', opt_out_state: 'OPTED_OUT', gateway_recipient_ref: 'gw_person_002_sms' },
    { recipient_ref: 'person_003', channel: 'PUSH', opt_out_state: 'UNKNOWN', gateway_recipient_ref: 'gw_person_003_push' },
  ],
  message: {
    subject: 'Task reminder: Prepare board packet',
    body: 'Your task is due today at noon.',
    action_url: '/workspace/tasks/task_001',
  },
  gateway_policy: {
    outbound_gateway_enforcement_ref: 'seed_6a_outbound_gateway_enforcement',
    global_opt_out_registry_ref: 'seed_6a_global_opt_out_registry',
    adl_ref: 'ADL-004',
  },
  workspace_collaboration_surface_active: true,
  collaboration_context_ref: 'workspace_thread_001',
  evidence_refs: ['task_record:task_001', 'due_date_source:calendar_001'],
  metadata: { source: 'phase_6c_task_reminder_gateway_test' },
};

const receipt = evaluateTaskReminderGateway(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_079_task_reminder_gateway');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CTaskReminderGateway');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.task_reminder_gateway.runtime_evaluated');
assert.equal(receipt.status, 'GATEWAY_READY');
assert.equal(receipt.gateway_policy.adl_ref, 'ADL-004');
assert.equal(receipt.gateway_policy.allow_unknown_opt_out_state, false);
assert.equal(receipt.ready_intent_count, 1);
assert.equal(receipt.blocked_intent_count, 2);
assert.equal(receipt.deferred_intent_count, 0);
assert.equal(receipt.intents[0]?.status, 'READY_FOR_GATEWAY');
assert.match(receipt.intents[0]?.gateway_envelope_ref ?? '', /^[a-f0-9]{24}$/);
assert.equal(receipt.intents[1]?.status, 'BLOCKED_BY_OPT_OUT');
assert.equal(receipt.intents[1]?.block_reason, 'GLOBAL_OPT_OUT');
assert.equal(receipt.intents[2]?.status, 'BLOCKED_BY_OPT_OUT');
assert.equal(receipt.intents[2]?.block_reason, 'UNKNOWN_OPT_OUT_STATE');
assert.match(receipt.idempotency_key, /^[a-f0-9]{64}$/);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);
assert.deepEqual(receipt.evidence_refs, ['task_record:task_001', 'due_date_source:calendar_001']);

const repeatedReceipt = evaluateTaskReminderGateway(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.idempotency_key, receipt.idempotency_key);

const unknownAllowedReceipt = evaluateTaskReminderGateway({
  ...baseInput,
  gateway_policy: { ...baseInput.gateway_policy, allow_unknown_opt_out_state: true },
});
assert.equal(unknownAllowedReceipt.ready_intent_count, 2);
assert.equal(unknownAllowedReceipt.blocked_intent_count, 1);

const deferredReceipt = evaluateTaskReminderGateway({
  ...baseInput,
  evaluated_at: '2026-06-15T08:59:00.000Z',
});
assert.equal(deferredReceipt.status, 'DEFERRED_NOT_YET_DUE');
assert.equal(deferredReceipt.deferred_intent_count, 3);
assert.equal(deferredReceipt.intents.every((intent) => intent.block_reason === 'NOT_YET_DUE'), true);

assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, reminder_ref: '' }), /reminder_ref is required/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, due_at: 'not-a-date' }), /due_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, reminder_at: '2026-06-15T13:00:00.000Z' }), /reminder_at must not be after due_at/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, priority: 'URGENT' as never }), /priority must be LOW, NORMAL, or HIGH/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, recipients: [] }), /at least one recipient is required/);
assert.throws(() => evaluateTaskReminderGateway({
  ...baseInput,
  recipients: [
    { recipient_ref: 'person_001', channel: 'EMAIL', opt_out_state: 'OPTED_IN' },
    { recipient_ref: 'person_001', channel: 'EMAIL', opt_out_state: 'OPTED_IN' },
  ],
}), /duplicate recipient\/channel pair/);
assert.throws(() => evaluateTaskReminderGateway({
  ...baseInput,
  gateway_policy: { ...baseInput.gateway_policy, adl_ref: 'ADL-001' as never },
}), /ADL-004 gateway enforcement/);
assert.throws(() => evaluateTaskReminderGateway({
  ...baseInput,
  workspace_collaboration_surface_active: false,
  collaboration_context_ref: 'workspace_thread_001',
}), /collaboration_context_ref requires workspace_collaboration_surface_active/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, direct_provider_send_requested: true }), /direct provider send is forbidden/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, gateway_bypass_requested: true }), /gateway bypass is forbidden/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, opt_out_bypass_requested: true }), /opt-out bypass is forbidden/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, persistence_requested: true }), /persistence is deferred/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateTaskReminderGateway({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime task_reminder_gateway test passed.');
