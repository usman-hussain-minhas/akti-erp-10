import assert from 'node:assert/strict';

import { evaluateTaskRecord, type TaskRecordInput } from './task_record.service';

const baseInput: TaskRecordInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_task_record',
  source_record_ref: 'task_record_record_001',
  task_ref: 'task_001',
  title: 'Prepare launch checklist',
  description: 'Coordinate checklist items across the workspace task board.',
  status: 'IN_PROGRESS',
  priority: 'HIGH',
  visibility: 'TEAM',
  owner_user_ref: 'user_owner_001',
  assignee_user_refs: ['user_assignee_002', 'user_assignee_001', 'user_assignee_001'],
  watcher_user_refs: ['user_watcher_001'],
  team_refs: ['team_ops'],
  workspace_ref: 'workspace_ops',
  project_ref: 'project_launch',
  start_at: '2026-06-09T09:00:00.000Z',
  due_at: '2026-06-12T17:00:00.000Z',
  tags: ['launch', 'operations', 'launch'],
  evidence_refs: ['evidence_task_source'],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:30:00.000Z',
};

const receipt = evaluateTaskRecord(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_070_task_record');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CTaskRecord');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.task_record.evaluated');
assert.equal(receipt.decision, 'TASK_RECORD_READY');
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.deepEqual(receipt.normalized_task.assignee_user_refs, ['user_assignee_001', 'user_assignee_002']);
assert.deepEqual(receipt.normalized_task.tags, ['launch', 'operations']);
assert.deepEqual(receipt.evidence_artifacts, ['evidence_task_source']);
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.notification_sent, false);
assert.equal(receipt.workflow_transition_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.frontend_publication_performed, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.task_record_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateTaskRecord(baseInput);
assert.equal(repeatedReceipt.task_record_evidence_digest, receipt.task_record_evidence_digest);

const blockedReceipt = evaluateTaskRecord({ ...baseInput, status: 'BLOCKED', blocked_reason: undefined });
assert.equal(blockedReceipt.decision, 'TASK_RECORD_REQUIRES_REVIEW');
assert.deepEqual(blockedReceipt.review_reasons, ['blocked_task_requires_blocked_reason_before_execution']);

const doneWithoutCompletion = evaluateTaskRecord({ ...baseInput, status: 'DONE', completed_at: undefined });
assert.equal(doneWithoutCompletion.decision, 'TASK_RECORD_REJECTED');
assert.deepEqual(doneWithoutCompletion.rejection_reasons, ['done_task_requires_completed_at']);

const invalidTimeline = evaluateTaskRecord({
  ...baseInput,
  start_at: '2026-06-13T09:00:00.000Z',
  due_at: '2026-06-12T17:00:00.000Z',
});
assert.equal(invalidTimeline.decision, 'TASK_RECORD_REQUIRES_REVIEW');
assert.deepEqual(invalidTimeline.review_reasons, ['due_at_precedes_start_at']);

const selfParent = evaluateTaskRecord({ ...baseInput, parent_task_ref: 'task_001' });
assert.equal(selfParent.decision, 'TASK_RECORD_REJECTED');
assert.deepEqual(selfParent.rejection_reasons, ['task_cannot_parent_itself']);

assert.throws(() => evaluateTaskRecord({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, status: 'ARCHIVED' as TaskRecordInput['status'] }), /status must be one of/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, persistence_requested: true }), /must not persist database changes/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, notification_send_requested: true }), /must not send notifications/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, workflow_transition_requested: true }), /must not execute workflow transitions/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, frontend_publication_requested: true }), /must not publish frontend routes/);
assert.throws(() => evaluateTaskRecord({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C task_record runtime test passed.');
