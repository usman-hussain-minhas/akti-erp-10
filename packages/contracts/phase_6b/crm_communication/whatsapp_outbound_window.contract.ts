export const PHASE_6B_WHATSAPP_OUTBOUND_WINDOW_SEED_ID = 'seed_6b_07_whatsapp_outbound_window' as const;
export const PHASE_6B_WHATSAPP_OUTBOUND_WINDOW_COMPONENT_ID = '6B.07' as const;

export const WHATSAPP_OUTBOUND_WINDOW_EVENT = 'phase_6b.crm_communication.whatsapp_outbound_window.evaluated' as const;
export const WHATSAPP_OUTBOUND_WINDOW_ADL_REF = 'ADL-004' as const;

export type WhatsappOptOutState = 'NOT_OPTED_OUT' | 'OPTED_OUT' | 'UNKNOWN_REQUIRES_REVIEW';
export type WhatsappOutboundWindowStatus = 'ELIGIBLE_WITHIN_WINDOW' | 'BLOCKED_WINDOW_EXPIRED' | 'BLOCKED_GLOBAL_OPT_OUT' | 'REVIEW_REQUIRED';

export type WhatsappOutboundWindowInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  outbound_window_check_id: string;
  lead_record_authority_id: string;
  pipeline_stage_model_ref: string;
  conversation_ref: string;
  whatsapp_template_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  last_inbound_at: string;
  candidate_send_at: string;
  configured_window_minutes: number;
  opt_out_state: WhatsappOptOutState;
  evaluated_by_user_id: string;
  outbound_send_requested?: boolean;
  provider_send_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type WhatsappOutboundWindowReceipt = {
  seed_id: typeof PHASE_6B_WHATSAPP_OUTBOUND_WINDOW_SEED_ID;
  component_id: typeof PHASE_6B_WHATSAPP_OUTBOUND_WINDOW_COMPONENT_ID;
  event_name: typeof WHATSAPP_OUTBOUND_WINDOW_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  outbound_window_check_id: string;
  lead_record_authority_id: string;
  pipeline_stage_model_ref: string;
  conversation_ref: string;
  whatsapp_template_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  last_inbound_at: string;
  candidate_send_at: string;
  configured_window_minutes: number;
  window_expires_at: string;
  opt_out_state: WhatsappOptOutState;
  window_status: WhatsappOutboundWindowStatus;
  evaluated_by_user_id: string;
  adl_refs: readonly [typeof WHATSAPP_OUTBOUND_WINDOW_ADL_REF];
  global_opt_out_required: true;
  outbound_gateway_required: true;
  outbound_send_allowed: false;
  provider_send_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
};
