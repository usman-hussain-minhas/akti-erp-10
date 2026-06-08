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
