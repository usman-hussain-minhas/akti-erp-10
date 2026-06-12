import assert from 'node:assert/strict';

import { evaluateTaskStatusConfig, type TaskStatusConfigInput } from './task_status_config.service';

const baseStatuses: TaskStatusConfigInput['statuses'] = [
  {
    status_key: 'open',
    label: 'Open',
    category: 'ENTRY',
    sort_order: 10,
    is_enabled: true,
    is_default: true,
    hard_anchor: 'OPEN',
    allowed_next_status_keys: ['in_progress', 'blocked'],
  },
  {
    status_key: 'in_progress',
    label: 'In progress',
    category: 'ACTIVE',
    sort_order: 20,
    is_enabled: true,
    hard_anchor: 'IN_PROGRESS',
    allowed_next_status_keys: ['blocked', 'done'],
  },
  {
    status_key: 'blocked',
    label: 'Blocked',
    category: 'BLOCKED',
    sort_order: 30,
    is_enabled: true,
    requires_reason: true,
    allowed_next_status_keys: ['in_progress'],
  },
  {
    status_key: 'done',
    label: 'Done',
    category: 'TERMINAL',
    sort_order: 40,
    is_enabled: true,
    hard_anchor: 'DONE',
  },
];

const baseInput: TaskStatusConfigInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_task_status_config',
  source_record_ref: 'task_status_config_record_001',
  config_ref: 'task_status_config_default',
  allow_custom_status_labels: true,
  statuses: baseStatuses,
  evidence_refs: ['evidence_status_config_source'],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T10:00:00.000Z',
};

const receipt = evaluateTaskStatusConfig(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_071_task_status_config');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CTaskStatusConfig');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.task_status_config.evaluated');
assert.equal(receipt.decision, 'TASK_STATUS_CONFIG_READY');
assert.deepEqual(receipt.required_hard_anchors, ['DONE', 'IN_PROGRESS', 'OPEN']);
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.normalized_statuses.length, 4);
assert.equal(receipt.normalized_statuses[0].status_key, 'open');
assert.equal(receipt.normalized_statuses[0].is_default, true);
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.workflow_transition_performed, false);
assert.equal(receipt.notification_sent, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.frontend_publication_performed, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.task_status_config_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateTaskStatusConfig(baseInput);
assert.equal(repeatedReceipt.task_status_config_evidence_digest, receipt.task_status_config_evidence_digest);

const missingAnchor = evaluateTaskStatusConfig({
  ...baseInput,
  statuses: baseStatuses.filter((status) => status.hard_anchor !== 'DONE'),
});
assert.equal(missingAnchor.decision, 'TASK_STATUS_CONFIG_REJECTED');
assert.deepEqual(missingAnchor.rejection_reasons, ['missing_hard_anchor:DONE', 'transition_target_missing:in_progress->done']);

const disabledAnchor = evaluateTaskStatusConfig({
  ...baseInput,
  statuses: baseStatuses.map((status) => status.hard_anchor === 'OPEN' ? { ...status, is_enabled: false } : status),
});
assert.equal(disabledAnchor.decision, 'TASK_STATUS_CONFIG_REJECTED');
assert.deepEqual(disabledAnchor.rejection_reasons, ['default_status_must_be_enabled', 'hard_anchor_status_cannot_be_disabled:OPEN']);

const invalidTransition = evaluateTaskStatusConfig({
  ...baseInput,
  statuses: baseStatuses.map((status) => status.status_key === 'open' ? { ...status, allowed_next_status_keys: ['missing'] } : status),
});
assert.equal(invalidTransition.decision, 'TASK_STATUS_CONFIG_REJECTED');
assert.deepEqual(invalidTransition.rejection_reasons, ['transition_target_missing:open->missing']);

const terminalWithOutgoing = evaluateTaskStatusConfig({
  ...baseInput,
  statuses: baseStatuses.map((status) => status.status_key === 'done' ? { ...status, allowed_next_status_keys: ['open'] } : status),
});
assert.equal(terminalWithOutgoing.decision, 'TASK_STATUS_CONFIG_REQUIRES_REVIEW');
assert.deepEqual(terminalWithOutgoing.review_reasons, ['terminal_status_has_outgoing_transitions:done']);

assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, statuses: [] }), /statuses must include at least/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, statuses: [{ ...baseStatuses[0], category: 'LATER' as TaskStatusConfigInput['statuses'][number]['category'] }] }), /category must be one of/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, persistence_requested: true }), /must not persist database changes/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, workflow_transition_requested: true }), /must not execute workflow transitions/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, notification_send_requested: true }), /must not send notifications/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, frontend_publication_requested: true }), /must not publish frontend routes/);
assert.throws(() => evaluateTaskStatusConfig({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C task_status_config runtime test passed.');
