import assert from 'node:assert/strict';

import { evaluateProjectDependencyEngine, type ProjectDependencyEngineInput } from './project_dependency_engine.service';

const baseInput: ProjectDependencyEngineInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_project_dependency_engine',
  source_record_ref: 'project_dependency_engine_record_001',
  graph_ref: 'project_dependency_graph_alpha',
  nodes: [
    { project_ref: 'foundation', label: 'Foundation' },
    { project_ref: 'delivery', label: 'Delivery' },
    { project_ref: 'launch', label: 'Launch' },
  ],
  dependencies: [
    {
      dependency_ref: 'dep_foundation_delivery',
      source_project_ref: 'foundation',
      target_project_ref: 'delivery',
      dependency_type: 'FINISH_TO_START',
      lag_days: 1,
      is_blocking: true,
    },
    {
      dependency_ref: 'dep_delivery_launch',
      source_project_ref: 'delivery',
      target_project_ref: 'launch',
      dependency_type: 'BLOCKS',
      lag_days: 0,
      is_blocking: true,
    },
  ],
  evidence_refs: ['evidence_dependency_source'],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T11:00:00.000Z',
};

const receipt = evaluateProjectDependencyEngine(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_073_project_dependency_engine');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CProjectDependencyEngine');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.project_dependency_engine.evaluated');
assert.equal(receipt.decision, 'PROJECT_DEPENDENCY_GRAPH_READY');
assert.deepEqual(receipt.topological_order, ['foundation', 'delivery', 'launch']);
assert.deepEqual(receipt.dependency_depth_by_project, { delivery: 1, foundation: 0, launch: 2 });
assert.deepEqual(receipt.cycle_paths, []);
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.gantt_view_rendered, false);
assert.equal(receipt.frontend_publication_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.notification_sent, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.project_dependency_engine_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateProjectDependencyEngine(baseInput);
assert.equal(repeatedReceipt.project_dependency_engine_evidence_digest, receipt.project_dependency_engine_evidence_digest);

const cycleReceipt = evaluateProjectDependencyEngine({
  ...baseInput,
  dependencies: [
    ...baseInput.dependencies,
    {
      dependency_ref: 'dep_launch_foundation',
      source_project_ref: 'launch',
      target_project_ref: 'foundation',
      dependency_type: 'BLOCKS',
    },
  ],
});
assert.equal(cycleReceipt.decision, 'PROJECT_DEPENDENCY_GRAPH_REJECTED');
assert.deepEqual(cycleReceipt.cycle_paths, ['delivery->launch->foundation->delivery']);
assert.deepEqual(cycleReceipt.rejection_reasons, ['dependency_graph_contains_cycle']);

const missingTarget = evaluateProjectDependencyEngine({
  ...baseInput,
  dependencies: [{ ...baseInput.dependencies[0], target_project_ref: 'missing_project' }],
});
assert.equal(missingTarget.decision, 'PROJECT_DEPENDENCY_GRAPH_REJECTED');
assert.deepEqual(missingTarget.rejection_reasons, ['dependency_target_missing:missing_project']);

const selfDependency = evaluateProjectDependencyEngine({
  ...baseInput,
  dependencies: [{ ...baseInput.dependencies[0], source_project_ref: 'foundation', target_project_ref: 'foundation' }],
});
assert.equal(selfDependency.decision, 'PROJECT_DEPENDENCY_GRAPH_REJECTED');
assert.deepEqual(selfDependency.rejection_reasons, ['dependency_cannot_target_itself:foundation']);

const duplicateEdge = evaluateProjectDependencyEngine({
  ...baseInput,
  dependencies: [baseInput.dependencies[0], { ...baseInput.dependencies[0], dependency_ref: 'dep_duplicate' }],
});
assert.equal(duplicateEdge.decision, 'PROJECT_DEPENDENCY_GRAPH_REQUIRES_REVIEW');
assert.deepEqual(duplicateEdge.review_reasons, ['duplicate_dependency_edge:foundation->delivery']);

assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, nodes: [] }), /nodes must include at least one project/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, dependencies: [{ ...baseInput.dependencies[0], dependency_type: 'LINKS' as ProjectDependencyEngineInput['dependencies'][number]['dependency_type'] }] }), /dependency_type must be one of/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, persistence_requested: true }), /must not persist database changes/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, gantt_view_requested: true }), /must not render Gantt or frontend views/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, frontend_publication_requested: true }), /must not publish frontend routes/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, notification_send_requested: true }), /must not send notifications/);
assert.throws(() => evaluateProjectDependencyEngine({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C project_dependency_engine runtime test passed.');
