import { createHash } from 'node:crypto';

export const PHASE_6C_PROJECT_TEMPLATE_SEED_ID = 'seed_6c_080_project_template' as const;
export const PHASE_6C_PROJECT_TEMPLATE_COMPONENT_ID = '6C.06' as const;
export const PROJECT_TEMPLATE_RUNTIME_EVENT = 'phase_6c.workspace_tasks_projects_documents_and_knowledge.project_template.runtime_evaluated' as const;

type ProjectTemplateStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
type ProjectTemplateVisibility = 'PRIVATE' | 'TEAM' | 'ORGANIZATION';
type ProjectTemplateVariableType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT';

type ProjectTemplateVariableDefinition = {
  key: string;
  label: string;
  type: ProjectTemplateVariableType;
  required?: boolean;
  options?: readonly string[];
  default_value?: string | number | boolean;
};

type ProjectTemplatePhaseBlueprint = {
  phase_key: string;
  name: string;
  order: number;
};

type ProjectTemplateTaskBlueprint = {
  task_key: string;
  title: string;
  phase_key?: string;
  order: number;
  estimated_minutes?: number;
  depends_on_task_keys?: readonly string[];
  assignee_role_ref?: string;
  required_variable_keys?: readonly string[];
};

export type ProjectTemplateInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  template_ref: string;
  template_name: string;
  version: number;
  status: ProjectTemplateStatus;
  visibility: ProjectTemplateVisibility;
  authored_by_user_id: string;
  authored_at: string;
  phases: readonly ProjectTemplatePhaseBlueprint[];
  task_blueprints: readonly ProjectTemplateTaskBlueprint[];
  variable_definitions?: readonly ProjectTemplateVariableDefinition[];
  source_project_ref?: string;
  workspace_collaboration_surface_active?: boolean;
  collaboration_context_ref?: string;
  metadata?: Record<string, unknown>;
  hardcoded_template_requested?: boolean;
  platform_default_template_requested?: boolean;
  project_creation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_route_requested?: boolean;
  authorization_flag_change_requested?: boolean;
};

type ProjectTemplateTaskPreview = {
  task_key: string;
  title: string;
  phase_key?: string;
  order: number;
  estimated_minutes: number;
  depends_on_task_keys: readonly string[];
  assignee_role_ref?: string;
  required_variable_keys: readonly string[];
};

export type ProjectTemplateReceipt = {
  seed_id: typeof PHASE_6C_PROJECT_TEMPLATE_SEED_ID;
  component_id: typeof PHASE_6C_PROJECT_TEMPLATE_COMPONENT_ID;
  component_slug: 'workspace_tasks_projects_documents_and_knowledge';
  model_name: 'Phase6CProjectTemplate';
  event_name: typeof PROJECT_TEMPLATE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  template_ref: string;
  template_name: string;
  version: number;
  status: ProjectTemplateStatus;
  visibility: ProjectTemplateVisibility;
  authored_by_user_id: string;
  authored_at: string;
  tenant_authored: true;
  source_project_ref?: string;
  workspace_collaboration_surface_active: boolean;
  collaboration_context_ref?: string;
  phase_count: number;
  task_count: number;
  variable_count: number;
  estimated_total_minutes: number;
  phases: readonly ProjectTemplatePhaseBlueprint[];
  task_preview: readonly ProjectTemplateTaskPreview[];
  variable_definitions: readonly ProjectTemplateVariableDefinition[];
  validation_warnings: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};

const ALLOWED_STATUSES = new Set<ProjectTemplateStatus>(['DRAFT', 'ACTIVE', 'ARCHIVED']);
const ALLOWED_VISIBILITIES = new Set<ProjectTemplateVisibility>(['PRIVATE', 'TEAM', 'ORGANIZATION']);
const ALLOWED_VARIABLE_TYPES = new Set<ProjectTemplateVariableType>(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for project_template runtime evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestampMs = Date.parse(normalized);
  if (!Number.isFinite(timestampMs)) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for project_template runtime evaluation.');
  }
  return new Date(timestampMs).toISOString();
}

function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for project_template runtime evaluation.');
  }
  return value;
}

function rejectForbiddenRequests(input: ProjectTemplateInput): readonly string[] {
  const rejected: string[] = [];
  const forbiddenFlags: Array<[keyof ProjectTemplateInput, string]> = [
    ['hardcoded_template_requested', 'hardcoded project templates are forbidden; templates must be tenant-authored'],
    ['platform_default_template_requested', 'platform default project templates are forbidden without a tenant-authored source'],
    ['project_creation_requested', 'project creation execution is outside this FFET'],
    ['persistence_requested', 'persistence is deferred until runtime wiring is authorized'],
    ['runtime_adapter_requested', 'runtime adapter execution is outside this FFET'],
    ['cross_phase_write_requested', 'cross-phase writes are forbidden; refs/events only'],
    ['frontend_route_requested', 'frontend route publication is outside this FFET'],
    ['authorization_flag_change_requested', 'authorization flag changes are human-gated and forbidden here'],
  ];

  for (const [field, reason] of forbiddenFlags) {
    if (input[field] === true) {
      rejected.push(reason);
    }
  }

  return rejected;
}

function normalizePhases(phases: readonly ProjectTemplatePhaseBlueprint[]): readonly ProjectTemplatePhaseBlueprint[] {
  if (!Array.isArray(phases) || phases.length === 0) {
    throw new Error('at least one phase is required for project_template runtime evaluation.');
  }
  const seenKeys = new Set<string>();
  const seenOrders = new Set<number>();
  return phases.map((phase, index) => {
    const phase_key = requireNonEmpty(phase.phase_key, 'phases[' + index + '].phase_key');
    if (seenKeys.has(phase_key)) {
      throw new Error('duplicate phase_key is not allowed for project_template: ' + phase_key);
    }
    seenKeys.add(phase_key);
    const order = requirePositiveInteger(phase.order, 'phases[' + index + '].order');
    if (seenOrders.has(order)) {
      throw new Error('duplicate phase order is not allowed for project_template: ' + order);
    }
    seenOrders.add(order);
    return {
      phase_key,
      name: requireNonEmpty(phase.name, 'phases[' + index + '].name'),
      order,
    };
  }).sort((a, b) => a.order - b.order);
}

function normalizeVariables(variables: readonly ProjectTemplateVariableDefinition[]): readonly ProjectTemplateVariableDefinition[] {
  const seen = new Set<string>();
  return variables.map((variable, index) => {
    const key = requireNonEmpty(variable.key, 'variable_definitions[' + index + '].key');
    if (seen.has(key)) {
      throw new Error('duplicate variable key is not allowed for project_template: ' + key);
    }
    seen.add(key);
    if (!ALLOWED_VARIABLE_TYPES.has(variable.type)) {
      throw new Error('variable_definitions[' + index + '].type must be TEXT, NUMBER, DATE, BOOLEAN, or SELECT.');
    }
    const normalized: ProjectTemplateVariableDefinition = {
      key,
      label: requireNonEmpty(variable.label, 'variable_definitions[' + index + '].label'),
      type: variable.type,
      required: variable.required === true,
    };
    if (variable.type === 'SELECT') {
      const options = [...(variable.options ?? [])].map((option, optionIndex) => requireNonEmpty(option, 'variable_definitions[' + index + '].options[' + optionIndex + ']'));
      if (options.length === 0) {
        throw new Error('SELECT variable requires at least one option for project_template: ' + key);
      }
      return { ...normalized, options, ...(variable.default_value === undefined ? {} : { default_value: String(variable.default_value) }) };
    }
    if (variable.options !== undefined && variable.options.length > 0) {
      throw new Error('only SELECT variables may define options for project_template: ' + key);
    }
    return variable.default_value === undefined ? normalized : { ...normalized, default_value: variable.default_value };
  });
}

function assertNoTaskCycles(tasks: readonly ProjectTemplateTaskPreview[]): void {
  const byKey = new Map(tasks.map((task) => [task.task_key, task]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(taskKey: string, path: readonly string[]): void {
    if (visited.has(taskKey)) {
      return;
    }
    if (visiting.has(taskKey)) {
      throw new Error('project_template task dependency cycle detected: ' + [...path, taskKey].join(' -> '));
    }
    visiting.add(taskKey);
    const task = byKey.get(taskKey);
    for (const dep of task?.depends_on_task_keys ?? []) {
      visit(dep, [...path, taskKey]);
    }
    visiting.delete(taskKey);
    visited.add(taskKey);
  }

  for (const task of tasks) {
    visit(task.task_key, []);
  }
}

function normalizeTasks(input: {
  tasks: readonly ProjectTemplateTaskBlueprint[];
  phases: readonly ProjectTemplatePhaseBlueprint[];
  variables: readonly ProjectTemplateVariableDefinition[];
}): readonly ProjectTemplateTaskPreview[] {
  if (!Array.isArray(input.tasks) || input.tasks.length === 0) {
    throw new Error('at least one task blueprint is required for project_template runtime evaluation.');
  }
  const phaseKeys = new Set(input.phases.map((phase) => phase.phase_key));
  const variableKeys = new Set(input.variables.map((variable) => variable.key));
  const taskKeys = new Set<string>();
  const seenOrders = new Set<number>();

  const tasks = input.tasks.map<ProjectTemplateTaskPreview>((task, index) => {
    const task_key = requireNonEmpty(task.task_key, 'task_blueprints[' + index + '].task_key');
    if (taskKeys.has(task_key)) {
      throw new Error('duplicate task_key is not allowed for project_template: ' + task_key);
    }
    taskKeys.add(task_key);
    const order = requirePositiveInteger(task.order, 'task_blueprints[' + index + '].order');
    if (seenOrders.has(order)) {
      throw new Error('duplicate task order is not allowed for project_template: ' + order);
    }
    seenOrders.add(order);
    const phase_key = task.phase_key === undefined ? undefined : requireNonEmpty(task.phase_key, 'task_blueprints[' + index + '].phase_key');
    if (phase_key !== undefined && !phaseKeys.has(phase_key)) {
      throw new Error('task_blueprints[' + index + '].phase_key does not match a template phase: ' + phase_key);
    }
    const estimated_minutes = task.estimated_minutes === undefined ? 0 : requirePositiveInteger(task.estimated_minutes, 'task_blueprints[' + index + '].estimated_minutes');
    const depends_on_task_keys = [...(task.depends_on_task_keys ?? [])].map((dep, depIndex) => requireNonEmpty(dep, 'task_blueprints[' + index + '].depends_on_task_keys[' + depIndex + ']'));
    const required_variable_keys = [...(task.required_variable_keys ?? [])].map((key, keyIndex) => requireNonEmpty(key, 'task_blueprints[' + index + '].required_variable_keys[' + keyIndex + ']'));
    for (const key of required_variable_keys) {
      if (!variableKeys.has(key)) {
        throw new Error('task_blueprints[' + index + '].required_variable_keys references an unknown variable: ' + key);
      }
    }
    return {
      task_key,
      title: requireNonEmpty(task.title, 'task_blueprints[' + index + '].title'),
      ...(phase_key === undefined ? {} : { phase_key }),
      order,
      estimated_minutes,
      depends_on_task_keys,
      ...(task.assignee_role_ref === undefined ? {} : { assignee_role_ref: requireNonEmpty(task.assignee_role_ref, 'task_blueprints[' + index + '].assignee_role_ref') }),
      required_variable_keys,
    };
  });

  for (const task of tasks) {
    for (const dependencyKey of task.depends_on_task_keys) {
      if (!taskKeys.has(dependencyKey)) {
        throw new Error('task dependency references unknown task_key for project_template: ' + dependencyKey);
      }
      if (dependencyKey === task.task_key) {
        throw new Error('task may not depend on itself for project_template: ' + task.task_key);
      }
    }
  }

  assertNoTaskCycles(tasks);
  return tasks.sort((a, b) => a.order - b.order);
}

function buildValidationWarnings(input: {
  status: ProjectTemplateStatus;
  taskCount: number;
  variableCount: number;
  estimatedTotalMinutes: number;
}): readonly string[] {
  const warnings: string[] = [];
  if (input.status === 'ACTIVE' && input.taskCount === 0) {
    warnings.push('active_template_has_no_tasks');
  }
  if (input.variableCount === 0) {
    warnings.push('template_has_no_variables');
  }
  if (input.estimatedTotalMinutes === 0) {
    warnings.push('template_has_no_estimated_minutes');
  }
  return warnings;
}

function digestRuntime(receiptWithoutDigest: Omit<ProjectTemplateReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateProjectTemplate(input: ProjectTemplateInput): ProjectTemplateReceipt {
  const forbiddenBehaviorRejections = rejectForbiddenRequests(input);
  if (forbiddenBehaviorRejections.length > 0) {
    throw new Error('project_template rejected forbidden behavior: ' + forbiddenBehaviorRejections.join('; '));
  }

  if (!ALLOWED_STATUSES.has(input.status)) {
    throw new Error('status must be DRAFT, ACTIVE, or ARCHIVED for project_template runtime evaluation.');
  }
  if (!ALLOWED_VISIBILITIES.has(input.visibility)) {
    throw new Error('visibility must be PRIVATE, TEAM, or ORGANIZATION for project_template runtime evaluation.');
  }

  const organization_id = requireNonEmpty(input.organization_id, 'organization_id');
  const service_manifest_contract_id = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const template_ref = requireNonEmpty(input.template_ref, 'template_ref');
  const template_name = requireNonEmpty(input.template_name, 'template_name');
  const version = requirePositiveInteger(input.version, 'version');
  const authored_by_user_id = requireNonEmpty(input.authored_by_user_id, 'authored_by_user_id');
  const authored_at = requireTimestamp(input.authored_at, 'authored_at');
  const phases = normalizePhases(input.phases);
  const variable_definitions = normalizeVariables(input.variable_definitions ?? []);
  const task_preview = normalizeTasks({ tasks: input.task_blueprints, phases, variables: variable_definitions });
  const estimated_total_minutes = task_preview.reduce((sum, task) => sum + task.estimated_minutes, 0);
  const workspace_collaboration_surface_active = input.workspace_collaboration_surface_active === true;
  const collaboration_context_ref = input.collaboration_context_ref === undefined
    ? undefined
    : requireNonEmpty(input.collaboration_context_ref, 'collaboration_context_ref');
  if (collaboration_context_ref !== undefined && !workspace_collaboration_surface_active) {
    throw new Error('collaboration_context_ref requires workspace_collaboration_surface_active for project_template.');
  }

  const receiptWithoutDigest: Omit<ProjectTemplateReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_PROJECT_TEMPLATE_SEED_ID,
    component_id: PHASE_6C_PROJECT_TEMPLATE_COMPONENT_ID,
    component_slug: 'workspace_tasks_projects_documents_and_knowledge',
    model_name: 'Phase6CProjectTemplate',
    event_name: PROJECT_TEMPLATE_RUNTIME_EVENT,
    organization_id,
    service_manifest_contract_id,
    template_ref,
    template_name,
    version,
    status: input.status,
    visibility: input.visibility,
    authored_by_user_id,
    authored_at,
    tenant_authored: true,
    ...(input.source_project_ref === undefined ? {} : { source_project_ref: requireNonEmpty(input.source_project_ref, 'source_project_ref') }),
    workspace_collaboration_surface_active,
    ...(collaboration_context_ref === undefined ? {} : { collaboration_context_ref }),
    phase_count: phases.length,
    task_count: task_preview.length,
    variable_count: variable_definitions.length,
    estimated_total_minutes,
    phases,
    task_preview,
    variable_definitions,
    validation_warnings: buildValidationWarnings({ status: input.status, taskCount: task_preview.length, variableCount: variable_definitions.length, estimatedTotalMinutes: estimated_total_minutes }),
    forbidden_behavior_rejections: [],
    metadata: input.metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
