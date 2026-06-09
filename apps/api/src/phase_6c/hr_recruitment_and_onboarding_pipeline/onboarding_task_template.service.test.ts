import assert from 'node:assert/strict';

import { evaluateOnboardingTaskTemplateRuntime, type OnboardingTaskTemplateInput } from './onboarding_task_template.service';

const baseInput: OnboardingTaskTemplateInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_onboarding_task_template',
  source_record_ref: 'onboarding_template_001',
  template_ref: 'onboarding_template:engineering:v1',
  template_label: 'Engineering onboarding',
  template_version: '2026.06.09',
  employment_type: 'full_time',
  department_ref: 'department_engineering',
  configured_by_user_id: 'user_phase_6c_recruiter',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  tasks: [
    {
      task_code: 'collect_documents',
      title: 'Collect identity and employment documents',
      task_type: 'DOCUMENT',
      order: 1,
      due_anchor: 'ACCEPTANCE_DATE',
      due_offset_days: 2,
      assignee_role_ref: 'role:hr_coordinator',
      required: true,
      evidence_required: true,
    },
    {
      task_code: 'prepare_workspace',
      title: 'Prepare workspace account request',
      task_type: 'ACCESS',
      order: 2,
      due_anchor: 'START_DATE',
      due_offset_days: -3,
      assignee_role_ref: 'role:it_admin',
      required: true,
      evidence_required: true,
      depends_on_task_codes: ['collect_documents'],
    },
    {
      task_code: 'schedule_welcome_meeting',
      title: 'Schedule welcome meeting',
      task_type: 'MEETING',
      order: 3,
      due_anchor: 'START_DATE',
      due_offset_days: 0,
      assignee_role_ref: 'role:manager',
      required: false,
      evidence_required: false,
      depends_on_task_codes: ['prepare_workspace'],
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateOnboardingTaskTemplateRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_017_onboarding_task_template');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6COnboardingTaskTemplate');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.onboarding_task_template.validated');
assert.equal(receipt.runtime_status, 'ONBOARDING_TASK_TEMPLATE_READY');
assert.equal(receipt.configurable_templates_required, true);
assert.equal(receipt.hardcoded_template_allowed, false);
assert.equal(receipt.task_instantiation_executed, false);
assert.equal(receipt.workspace_task_mutation_allowed, false);
assert.equal(receipt.task_count, 3);
assert.equal(receipt.required_task_count, 2);
assert.equal(receipt.evidence_required_task_count, 2);
assert.equal(receipt.normalized_tasks[0]?.task_code, 'collect_documents');
assert.equal(receipt.normalized_tasks[2]?.depends_on_task_codes[0], 'prepare_workspace');
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-008']);
assert.match(receipt.onboarding_task_template_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOnboardingTaskTemplateRuntime(baseInput);
assert.equal(repeatedReceipt.onboarding_task_template_evidence_digest, receipt.onboarding_task_template_evidence_digest);

assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, template_ref: 'template:wrong' }), /must identify a configurable onboarding template/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, tasks: [] }), /at least one configurable onboarding task/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [baseInput.tasks[0]!, { ...baseInput.tasks[1]!, task_code: baseInput.tasks[0]!.task_code }],
}), /task_code must be unique/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0]!, task_type: 'CEREMONY' as never }],
}), /task_type is not supported/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0]!, order: 0 }],
}), /task order must be a positive integer/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0]!, due_anchor: 'BIRTHDAY' as never }],
}), /due_anchor is not supported/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0]!, due_offset_days: 1.5 }],
}), /due_offset_days must be an integer/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0]!, required: false, evidence_required: false }],
}), /at least one required task/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0]!, evidence_required: false }],
}), /at least one evidence-required task/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0]!, depends_on_task_codes: ['missing_task'] }],
}), /must reference an existing task/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [{ ...baseInput.tasks[0]!, depends_on_task_codes: ['collect_documents'] }],
}), /must not depend on itself/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({
  ...baseInput,
  tasks: [
    { ...baseInput.tasks[0]!, depends_on_task_codes: ['prepare_workspace'] },
    baseInput.tasks[1]!,
  ],
}), /dependency must have a lower order/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, hardcoded_template_requested: true }), /not hardcoded onboarding tasks/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, task_instantiation_requested: true }), /must validate templates, not instantiate tasks/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, workspace_task_mutation_requested: true }), /must not mutate Workspace task records/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateOnboardingTaskTemplateRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime onboarding_task_template test passed.');
