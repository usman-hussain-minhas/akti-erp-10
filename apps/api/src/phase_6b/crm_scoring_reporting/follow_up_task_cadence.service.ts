export const PHASE_6B_FOLLOW_UP_TASK_CADENCE_SEED_ID = 'seed_6b_08_follow_up_task_cadence' as const;
export const PHASE_6B_FOLLOW_UP_TASK_CADENCE_COMPONENT_ID = '6B.08' as const;

export const FOLLOW_UP_TASK_CADENCE_EVENT = 'phase_6b.crm_scoring_reporting.follow_up_task_cadence.planned' as const;

export type FollowUpTaskCadenceLifecycleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type FollowUpTaskChannel = 'TASK_ONLY' | 'WHATSAPP_TEMPLATE_REMINDER' | 'EMAIL_TASK_REFERENCE';
export type FollowUpTaskPriority = 'LOW' | 'NORMAL' | 'HIGH';

export type FollowUpCadenceStep = {
  step_id: string;
  step_order: number;
  offset_minutes_after_anchor: number;
  task_title: string;
  task_priority: FollowUpTaskPriority;
  channel: FollowUpTaskChannel;
  evidence_label: string;
  active: boolean;
};

export type FollowUpTaskCadenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  cadence_id: string;
  lead_record_ref: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  anchor_at: string;
  lifecycle_status: FollowUpTaskCadenceLifecycleStatus;
  cadence_steps: FollowUpCadenceStep[];
  configured_by_user_id: string;
  configured_at: string;
  scheduler_execution_requested?: boolean;
  communication_send_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PlannedFollowUpTask = {
  task_id: string;
  step_id: string;
  due_at: string;
  task_title: string;
  task_priority: FollowUpTaskPriority;
  channel: FollowUpTaskChannel;
  evidence_label: string;
};

export type FollowUpTaskCadenceReceipt = {
  seed_id: typeof PHASE_6B_FOLLOW_UP_TASK_CADENCE_SEED_ID;
  component_id: typeof PHASE_6B_FOLLOW_UP_TASK_CADENCE_COMPONENT_ID;
  event_name: typeof FOLLOW_UP_TASK_CADENCE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  cadence_id: string;
  lead_record_ref: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  anchor_at: string;
  lifecycle_status: FollowUpTaskCadenceLifecycleStatus;
  planned_tasks: PlannedFollowUpTask[];
  active_step_count: number;
  scheduler_execution_allowed: false;
  communication_send_allowed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};

const LIFECYCLE_STATUSES: readonly FollowUpTaskCadenceLifecycleStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] as const;
const CHANNELS: readonly FollowUpTaskChannel[] = ['TASK_ONLY', 'WHATSAPP_TEMPLATE_REMINDER', 'EMAIL_TASK_REFERENCE'] as const;
const PRIORITIES: readonly FollowUpTaskPriority[] = ['LOW', 'NORMAL', 'HIGH'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for follow up task cadence.`);
  }
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for follow up task cadence.`);
  }
  return normalized;
}

function normalizeLifecycleStatus(value: FollowUpTaskCadenceLifecycleStatus): FollowUpTaskCadenceLifecycleStatus {
  if (!LIFECYCLE_STATUSES.includes(value)) {
    throw new Error('lifecycle_status is not supported for follow up task cadence.');
  }
  return value;
}

function normalizeChannel(value: FollowUpTaskChannel): FollowUpTaskChannel {
  if (!CHANNELS.includes(value)) {
    throw new Error('channel is not supported for follow up task cadence.');
  }
  return value;
}

function normalizePriority(value: FollowUpTaskPriority): FollowUpTaskPriority {
  if (!PRIORITIES.includes(value)) {
    throw new Error('task_priority is not supported for follow up task cadence.');
  }
  return value;
}

function normalizeCadenceStep(step: FollowUpCadenceStep): FollowUpCadenceStep {
  if (!Number.isInteger(step.step_order) || step.step_order < 1) {
    throw new Error('step_order must be a positive integer for follow up task cadence.');
  }
  if (!Number.isInteger(step.offset_minutes_after_anchor) || step.offset_minutes_after_anchor < 0) {
    throw new Error('offset_minutes_after_anchor must be a non-negative integer for follow up task cadence.');
  }
  return {
    step_id: requireNonEmpty(step.step_id, 'cadence_steps.step_id'),
    step_order: step.step_order,
    offset_minutes_after_anchor: step.offset_minutes_after_anchor,
    task_title: requireNonEmpty(step.task_title, 'cadence_steps.task_title'),
    task_priority: normalizePriority(step.task_priority),
    channel: normalizeChannel(step.channel),
    evidence_label: requireNonEmpty(step.evidence_label, 'cadence_steps.evidence_label'),
    active: step.active === true,
  };
}

function normalizeCadenceSteps(steps: FollowUpCadenceStep[]): FollowUpCadenceStep[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('cadence_steps must include at least one step for follow up task cadence.');
  }
  const normalized = steps.map(normalizeCadenceStep).sort((a, b) => a.step_order - b.step_order);
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();
  for (const step of normalized) {
    if (seenIds.has(step.step_id)) {
      throw new Error('cadence_steps must not repeat step_id for follow up task cadence.');
    }
    if (seenOrders.has(step.step_order)) {
      throw new Error('cadence_steps must not repeat step_order for follow up task cadence.');
    }
    seenIds.add(step.step_id);
    seenOrders.add(step.step_order);
  }
  if (!normalized.some((step) => step.active)) {
    throw new Error('cadence_steps must include at least one active step for follow up task cadence.');
  }
  return normalized;
}

function buildTaskId(cadenceId: string, stepId: string): string {
  return `${cadenceId}__${stepId}`;
}

function dueAt(anchorAt: string, offsetMinutes: number): string {
  return new Date(Date.parse(anchorAt) + offsetMinutes * 60_000).toISOString();
}

export function planFollowUpTaskCadence(input: FollowUpTaskCadenceInput): FollowUpTaskCadenceReceipt {
  if (input.scheduler_execution_requested === true) {
    throw new Error('follow up task cadence must not execute a scheduler.');
  }
  if (input.communication_send_requested === true) {
    throw new Error('follow up task cadence must not send communications.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('follow up task cadence must not perform irreversible actions.');
  }

  const cadenceId = requireNonEmpty(input.cadence_id, 'cadence_id');
  const anchorAt = requireTimestamp(input.anchor_at, 'anchor_at');
  const cadenceSteps = normalizeCadenceSteps(input.cadence_steps);
  const activeSteps = cadenceSteps.filter((step) => step.active);
  const plannedTasks = activeSteps.map((step) => ({
    task_id: buildTaskId(cadenceId, step.step_id),
    step_id: step.step_id,
    due_at: dueAt(anchorAt, step.offset_minutes_after_anchor),
    task_title: step.task_title,
    task_priority: step.task_priority,
    channel: step.channel,
    evidence_label: step.evidence_label,
  }));

  return {
    seed_id: PHASE_6B_FOLLOW_UP_TASK_CADENCE_SEED_ID,
    component_id: PHASE_6B_FOLLOW_UP_TASK_CADENCE_COMPONENT_ID,
    event_name: FOLLOW_UP_TASK_CADENCE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    cadence_id: cadenceId,
    lead_record_ref: requireNonEmpty(input.lead_record_ref, 'lead_record_ref'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    whatsapp_template_management_ref: requireNonEmpty(input.whatsapp_template_management_ref, 'whatsapp_template_management_ref'),
    optimization_fact_store_ref: requireNonEmpty(input.optimization_fact_store_ref, 'optimization_fact_store_ref'),
    anchor_at: anchorAt,
    lifecycle_status: normalizeLifecycleStatus(input.lifecycle_status),
    planned_tasks: plannedTasks,
    active_step_count: activeSteps.length,
    scheduler_execution_allowed: false,
    communication_send_allowed: false,
    irreversible_action_allowed: false,
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireTimestamp(input.configured_at, 'configured_at'),
  };
}
