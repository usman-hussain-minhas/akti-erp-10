export const PHASE_6B_COMMUNICATION_ATTEMPT_EVIDENCE_SEED_ID = 'seed_6b_07_communication_attempt_evidence' as const;
export const PHASE_6B_COMMUNICATION_ATTEMPT_EVIDENCE_COMPONENT_ID = '6B.07' as const;

export const COMMUNICATION_ATTEMPT_EVIDENCE_EVENT = 'phase_6b.crm_communication.communication_attempt_evidence.recorded' as const;

export type CommunicationAttemptChannel = 'EMAIL' | 'WHATSAPP';
export type CommunicationAttemptDirection = 'OUTBOUND' | 'INBOUND';
export type CommunicationAttemptStatus = 'RECORDED' | 'GATEWAY_ACCEPTED' | 'SKIPPED_OPT_OUT' | 'FAILED';
export type CommunicationAttemptBillingClass = 'ZERO_RATED' | 'BILLABLE_MESSAGE_USAGE';

export type CommunicationAttemptEvidenceInput = {
  organization_id: string;
  attempt_evidence_id: string;
  conversation_ref: string;
  pipeline_stage_model_ref: string;
  channel: CommunicationAttemptChannel;
  direction: CommunicationAttemptDirection;
  attempt_status: CommunicationAttemptStatus;
  billing_class: CommunicationAttemptBillingClass;
  billable_unit_count: number;
  message_usage_evidence_ref: string;
  attempted_at: string;
  recorded_by_surface: string;
  global_opt_out_registry_ref?: string;
  send_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type CommunicationAttemptEvidenceReceipt = {
  seed_id: typeof PHASE_6B_COMMUNICATION_ATTEMPT_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6B_COMMUNICATION_ATTEMPT_EVIDENCE_COMPONENT_ID;
  event_name: typeof COMMUNICATION_ATTEMPT_EVIDENCE_EVENT;
  organization_id: string;
  attempt_evidence_id: string;
  conversation_ref: string;
  pipeline_stage_model_ref: string;
  channel: CommunicationAttemptChannel;
  direction: CommunicationAttemptDirection;
  attempt_status: CommunicationAttemptStatus;
  billing_class: CommunicationAttemptBillingClass;
  billable_unit_count: number;
  billable: boolean;
  message_usage_evidence_ref: string;
  attempted_at: string;
  recorded_by_surface: string;
  global_opt_out_registry_ref?: string;
  opt_out_dependency_tier: 'CONDITIONAL_EVIDENCE_REFERENCE';
  evidence_digest: string;
  send_allowed: false;
  provider_callback_processing_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
};
