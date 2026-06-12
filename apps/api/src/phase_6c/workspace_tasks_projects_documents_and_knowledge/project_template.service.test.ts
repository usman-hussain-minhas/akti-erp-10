import assert from 'node:assert/strict';

import { evaluateProjectTemplate, type ProjectTemplateInput } from './project_template.service';

const baseInput: ProjectTemplateInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_project_template',
  template_ref: 'template_customer_onboarding',
  template_name: 'Customer onboarding project',
  version: 2,
  status: 'ACTIVE',
  visibility: 'TEAM',
  authored_by_user_id: 'user_workspace_admin',
  authored_at: '2026-06-16T10:00:00.000Z',
  phases: [
    { phase_key: 'kickoff', name: 'Kickoff', order: 1 },
    { phase_key: 'delivery', name: 'Delivery', order: 2 },
  ],
  variable_definitions: [
    { key: 'customer_name', label: 'Customer name', type: 'TEXT', required: true },
    { key: 'go_live_date', label: 'Go-live date', type: 'DATE', required: true },
    { key: 'tier', label: 'Tier', type: 'SELECT', options: ['standard', 'premium'], default_value: 'standard' },
  ],
  task_blueprints: [
    {
      task_key: 'collect_requirements',
      title: 'Collect requirements',
      phase_key: 'kickoff',
      order: 1,
      estimated_minutes: 90,
      required_variable_keys: ['customer_name'],
    },
    {
      task_key: 'configure_workspace',
      title: 'Configure workspace',
      phase_key: 'delivery',
      order: 2,
      estimated_minutes: 120,
      depends_on_task_keys: ['collect_requirements'],
      required_variable_keys: ['go_live_date', 'tier'],
      assignee_role_ref: 'implementation_manager',
    },
  ],
  workspace_collaboration_surface_active: true,
  collaboration_context_ref: 'workspace_project_template_thread',
  source_project_ref: 'project_existing_customer_001',
  metadata: { source: 'phase_6c_project_template_test' },
};

const receipt = evaluateProjectTemplate(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_080_project_template');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CProjectTemplate');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.project_template.runtime_evaluated');
assert.equal(receipt.tenant_authored, true);
assert.equal(receipt.phase_count, 2);
assert.equal(receipt.task_count, 2);
assert.equal(receipt.variable_count, 3);
assert.equal(receipt.estimated_total_minutes, 210);
assert.equal(receipt.task_preview[0]?.task_key, 'collect_requirements');
assert.deepEqual(receipt.task_preview[1]?.depends_on_task_keys, ['collect_requirements']);
assert.equal(receipt.task_preview[1]?.assignee_role_ref, 'implementation_manager');
assert.deepEqual(receipt.validation_warnings, []);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateProjectTemplate(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

const warningReceipt = evaluateProjectTemplate({
  ...baseInput,
  variable_definitions: [],
  task_blueprints: [{ task_key: 'simple_task', title: 'Simple task', phase_key: 'kickoff', order: 1 }],
});
assert.deepEqual(warningReceipt.validation_warnings, ['template_has_no_variables', 'template_has_no_estimated_minutes']);

assert.throws(() => evaluateProjectTemplate({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, template_name: '' }), /template_name is required/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, version: 0 }), /version must be a positive integer/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, status: 'PUBLISHED' as never }), /status must be DRAFT, ACTIVE, or ARCHIVED/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, visibility: 'PUBLIC' as never }), /visibility must be PRIVATE, TEAM, or ORGANIZATION/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, authored_at: 'not-a-date' }), /authored_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, phases: [] }), /at least one phase is required/);
assert.throws(() => evaluateProjectTemplate({
  ...baseInput,
  phases: [
    { phase_key: 'duplicate', name: 'One', order: 1 },
    { phase_key: 'duplicate', name: 'Two', order: 2 },
  ],
}), /duplicate phase_key/);
assert.throws(() => evaluateProjectTemplate({
  ...baseInput,
  task_blueprints: [{ task_key: 'task_one', title: 'Task one', phase_key: 'missing', order: 1 }],
}), /phase_key does not match a template phase/);
assert.throws(() => evaluateProjectTemplate({
  ...baseInput,
  task_blueprints: [
    { task_key: 'task_one', title: 'Task one', phase_key: 'kickoff', order: 1, depends_on_task_keys: ['missing_task'] },
  ],
}), /references unknown task_key/);
assert.throws(() => evaluateProjectTemplate({
  ...baseInput,
  task_blueprints: [
    { task_key: 'task_one', title: 'Task one', phase_key: 'kickoff', order: 1, depends_on_task_keys: ['task_two'] },
    { task_key: 'task_two', title: 'Task two', phase_key: 'delivery', order: 2, depends_on_task_keys: ['task_one'] },
  ],
}), /task dependency cycle detected/);
assert.throws(() => evaluateProjectTemplate({
  ...baseInput,
  variable_definitions: [{ key: 'tier', label: 'Tier', type: 'SELECT' }],
}), /SELECT variable requires at least one option/);
assert.throws(() => evaluateProjectTemplate({
  ...baseInput,
  task_blueprints: [{ task_key: 'task_one', title: 'Task one', phase_key: 'kickoff', order: 1, required_variable_keys: ['unknown_variable'] }],
}), /references an unknown variable/);
assert.throws(() => evaluateProjectTemplate({
  ...baseInput,
  workspace_collaboration_surface_active: false,
  collaboration_context_ref: 'workspace_project_template_thread',
}), /collaboration_context_ref requires workspace_collaboration_surface_active/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, hardcoded_template_requested: true }), /hardcoded project templates are forbidden/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, platform_default_template_requested: true }), /platform default project templates are forbidden/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, project_creation_requested: true }), /project creation execution is outside this FFET/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateProjectTemplate({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime project_template test passed.');
