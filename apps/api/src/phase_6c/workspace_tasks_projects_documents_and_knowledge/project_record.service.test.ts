import assert from 'node:assert/strict';

import { evaluateProjectRecord, type ProjectRecordInput } from './project_record.service';

const baseInput: ProjectRecordInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_project_record',
  source_record_ref: 'project_record_record_001',
  project_ref: 'project_alpha',
  name: 'Alpha launch project',
  summary: 'Coordinate workspace launch tasks and project metadata.',
  status: 'ACTIVE',
  priority: 'HIGH',
  visibility: 'TEAM',
  owner_user_ref: 'user_owner_001',
  sponsor_user_ref: 'user_sponsor_001',
  team_refs: ['team_delivery', 'team_ops', 'team_delivery'],
  workspace_ref: 'workspace_delivery',
  start_at: '2026-06-09T09:00:00.000Z',
  target_end_at: '2026-07-09T17:00:00.000Z',
  dependency_refs: ['project_foundation'],
  budget_ref: 'budget_reference_only',
  tags: ['launch', 'operations', 'launch'],
  metadata_entries: [
    { key: 'Risk', value: 'medium', source_ref: 'planning_note_1' },
    { key: 'department', value: 'operations' },
    { key: 'risk', value: 'low', source_ref: 'planning_note_2' },
  ],
  evidence_refs: ['evidence_project_source'],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T10:30:00.000Z',
};

const receipt = evaluateProjectRecord(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_072_project_record');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CProjectRecord');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.project_record.evaluated');
assert.equal(receipt.decision, 'PROJECT_RECORD_READY');
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.deepEqual(receipt.normalized_project.team_refs, ['team_delivery', 'team_ops']);
assert.deepEqual(receipt.normalized_project.tags, ['launch', 'operations']);
assert.deepEqual(receipt.normalized_project.metadata_entries, [
  { key: 'department', value: 'operations', source_ref: null },
  { key: 'risk', value: 'low', source_ref: 'planning_note_2' },
]);
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.dependency_graph_executed, false);
assert.equal(receipt.gantt_view_rendered, false);
assert.equal(receipt.notification_sent, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.frontend_publication_performed, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.project_record_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateProjectRecord(baseInput);
assert.equal(repeatedReceipt.project_record_evidence_digest, receipt.project_record_evidence_digest);

const completedWithoutDate = evaluateProjectRecord({ ...baseInput, status: 'COMPLETED', completed_at: undefined });
assert.equal(completedWithoutDate.decision, 'PROJECT_RECORD_REJECTED');
assert.deepEqual(completedWithoutDate.rejection_reasons, ['completed_project_requires_completed_at']);

const invalidTimeline = evaluateProjectRecord({
  ...baseInput,
  start_at: '2026-07-10T09:00:00.000Z',
  target_end_at: '2026-07-09T17:00:00.000Z',
});
assert.equal(invalidTimeline.decision, 'PROJECT_RECORD_REQUIRES_REVIEW');
assert.deepEqual(invalidTimeline.review_reasons, ['target_end_at_precedes_start_at']);

const selfLinked = evaluateProjectRecord({ ...baseInput, parent_project_ref: 'project_alpha', dependency_refs: ['project_alpha'] });
assert.equal(selfLinked.decision, 'PROJECT_RECORD_REJECTED');
assert.deepEqual(selfLinked.rejection_reasons, ['project_cannot_depend_on_itself', 'project_cannot_parent_itself']);

const workspaceWithoutRef = evaluateProjectRecord({ ...baseInput, visibility: 'WORKSPACE', workspace_ref: undefined });
assert.equal(workspaceWithoutRef.decision, 'PROJECT_RECORD_REQUIRES_REVIEW');
assert.deepEqual(workspaceWithoutRef.review_reasons, ['workspace_visibility_requires_workspace_ref']);

assert.throws(() => evaluateProjectRecord({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, status: 'ARCHIVED' as ProjectRecordInput['status'] }), /status must be one of/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, metadata_entries: [{ key: '', value: 'value' }] }), /metadata_entries key is required/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, persistence_requested: true }), /must not persist database changes/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, dependency_graph_execution_requested: true }), /must not execute dependency graphs/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, gantt_view_requested: true }), /must not render Gantt or frontend views/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, notification_send_requested: true }), /must not send notifications/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, frontend_publication_requested: true }), /must not publish frontend routes/);
assert.throws(() => evaluateProjectRecord({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C project_record runtime test passed.');
