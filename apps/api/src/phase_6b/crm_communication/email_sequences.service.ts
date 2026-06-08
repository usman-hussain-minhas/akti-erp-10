export const PHASE_6B_EMAIL_SEQUENCES_SEED_ID = 'seed_6b_07_email_sequences' as const;
export const PHASE_6B_EMAIL_SEQUENCES_COMPONENT_ID = '6B.07' as const;

export const EMAIL_SEQUENCE_EVENT = 'phase_6b.crm_communication.email_sequence.configured' as const;

export type EmailSequenceLifecycleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type EmailSequenceEnrollmentPolicy = 'MANUAL_APPROVAL' | 'PIPELINE_STAGE_ENTRY' | 'SEGMENT_MEMBERSHIP';

export type EmailSequenceStep = {
  step_id: string;
  step_order: number;
  subject_template_ref: string;
  body_template_ref: string;
  delay_minutes_after_previous_step: number;
  evidence_label: string;
  active: boolean;
};

export type EmailSequenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  email_sequence_id: string;
  sequence_name: string;
  pipeline_stage_model_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  enrollment_policy: EmailSequenceEnrollmentPolicy;
  lifecycle_status: EmailSequenceLifecycleStatus;
  steps: EmailSequenceStep[];
  configured_by_user_id: string;
  configured_at: string;
  immediate_send_requested?: boolean;
  provider_callback_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type EmailSequenceReceipt = {
  seed_id: typeof PHASE_6B_EMAIL_SEQUENCES_SEED_ID;
  component_id: typeof PHASE_6B_EMAIL_SEQUENCES_COMPONENT_ID;
  event_name: typeof EMAIL_SEQUENCE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  email_sequence_id: string;
  sequence_name: string;
  pipeline_stage_model_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  enrollment_policy: EmailSequenceEnrollmentPolicy;
  lifecycle_status: EmailSequenceLifecycleStatus;
  steps: EmailSequenceStep[];
  step_count: number;
  active_step_count: number;
  total_delay_minutes: number;
  opt_out_adl_ref: 'ADL-004';
  outbound_gateway_adl_ref: 'ADL-004';
  immediate_send_allowed: false;
  provider_callback_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};

const LIFECYCLE_STATUSES: readonly EmailSequenceLifecycleStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] as const;
const ENROLLMENT_POLICIES: readonly EmailSequenceEnrollmentPolicy[] = ['MANUAL_APPROVAL', 'PIPELINE_STAGE_ENTRY', 'SEGMENT_MEMBERSHIP'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for email sequences.`);
  }
  return value.trim();
}

function requireConfiguredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'configured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('configured_at must be a valid ISO-compatible timestamp for email sequences.');
  }
  return normalized;
}

function normalizeLifecycleStatus(value: EmailSequenceLifecycleStatus): EmailSequenceLifecycleStatus {
  if (!LIFECYCLE_STATUSES.includes(value)) {
    throw new Error('lifecycle_status is not supported for email sequences.');
  }
  return value;
}

function normalizeEnrollmentPolicy(value: EmailSequenceEnrollmentPolicy): EmailSequenceEnrollmentPolicy {
  if (!ENROLLMENT_POLICIES.includes(value)) {
    throw new Error('enrollment_policy is not supported for email sequences.');
  }
  return value;
}

function normalizeStep(step: EmailSequenceStep): EmailSequenceStep {
  if (!Number.isInteger(step.step_order) || step.step_order < 1) {
    throw new Error('step_order must be a positive integer for email sequences.');
  }
  if (!Number.isFinite(step.delay_minutes_after_previous_step) || step.delay_minutes_after_previous_step < 0) {
    throw new Error('delay_minutes_after_previous_step must be non-negative for email sequences.');
  }
  return {
    step_id: requireNonEmpty(step.step_id, 'steps.step_id'),
    step_order: step.step_order,
    subject_template_ref: requireNonEmpty(step.subject_template_ref, 'steps.subject_template_ref'),
    body_template_ref: requireNonEmpty(step.body_template_ref, 'steps.body_template_ref'),
    delay_minutes_after_previous_step: step.delay_minutes_after_previous_step,
    evidence_label: requireNonEmpty(step.evidence_label, 'steps.evidence_label'),
    active: step.active === true,
  };
}

function normalizeSteps(steps: EmailSequenceStep[]): EmailSequenceStep[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error('steps must include at least one email sequence step.');
  }

  const normalized = steps.map(normalizeStep).sort((a, b) => a.step_order - b.step_order);
  const seenIds = new Set<string>();
  const seenOrders = new Set<number>();
  for (const step of normalized) {
    if (seenIds.has(step.step_id)) {
      throw new Error('steps must not repeat step_id for email sequences.');
    }
    if (seenOrders.has(step.step_order)) {
      throw new Error('steps must not repeat step_order for email sequences.');
    }
    seenIds.add(step.step_id);
    seenOrders.add(step.step_order);
  }

  if (!normalized.some((step) => step.active)) {
    throw new Error('steps must include at least one active step for email sequences.');
  }

  return normalized;
}

export function configureEmailSequence(input: EmailSequenceInput): EmailSequenceReceipt {
  if (input.immediate_send_requested === true) {
    throw new Error('email sequences must not send email immediately.');
  }
  if (input.provider_callback_requested === true) {
    throw new Error('email sequences must not process provider callbacks.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('email sequences must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('email sequences must not perform irreversible actions.');
  }

  const steps = normalizeSteps(input.steps);

  return {
    seed_id: PHASE_6B_EMAIL_SEQUENCES_SEED_ID,
    component_id: PHASE_6B_EMAIL_SEQUENCES_COMPONENT_ID,
    event_name: EMAIL_SEQUENCE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    email_sequence_id: requireNonEmpty(input.email_sequence_id, 'email_sequence_id'),
    sequence_name: requireNonEmpty(input.sequence_name, 'sequence_name'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    global_opt_out_registry_ref: requireNonEmpty(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    outbound_gateway_enforcement_ref: requireNonEmpty(input.outbound_gateway_enforcement_ref, 'outbound_gateway_enforcement_ref'),
    enrollment_policy: normalizeEnrollmentPolicy(input.enrollment_policy),
    lifecycle_status: normalizeLifecycleStatus(input.lifecycle_status),
    steps,
    step_count: steps.length,
    active_step_count: steps.filter((step) => step.active).length,
    total_delay_minutes: steps.reduce((total, step) => total + step.delay_minutes_after_previous_step, 0),
    opt_out_adl_ref: 'ADL-004',
    outbound_gateway_adl_ref: 'ADL-004',
    immediate_send_allowed: false,
    provider_callback_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireConfiguredAt(input.configured_at),
  };
}
