export const PHASE_6B_WHATSAPP_BROADCAST_COMPLIANCE_SEED_ID = 'seed_6b_07_whatsapp_broadcast_compliance' as const;
export const PHASE_6B_WHATSAPP_BROADCAST_COMPLIANCE_COMPONENT_ID = '6B.07' as const;

export const WHATSAPP_BROADCAST_COMPLIANCE_EVENT = 'phase_6b.crm_communication.whatsapp_broadcast_compliance.evaluated' as const;
export const WHATSAPP_BROADCAST_COMPLIANCE_ADL_REF = 'ADL-004' as const;

export type WhatsappBroadcastOptOutState = 'NOT_OPTED_OUT' | 'OPTED_OUT' | 'UNKNOWN_REQUIRES_REVIEW';
export type WhatsappBroadcastWindowState = 'ELIGIBLE_WITHIN_WINDOW' | 'BLOCKED_WINDOW_EXPIRED' | 'REVIEW_REQUIRED';
export type WhatsappBroadcastRecipientStatus = 'ELIGIBLE_FOR_GATEWAY' | 'BLOCKED_GLOBAL_OPT_OUT' | 'BLOCKED_WINDOW_EXPIRED' | 'REVIEW_REQUIRED';

export type WhatsappBroadcastRecipientInput = {
  recipient_ref: string;
  lead_record_authority_id: string;
  conversation_ref: string;
  opt_out_state: WhatsappBroadcastOptOutState;
  outbound_window_state: WhatsappBroadcastWindowState;
  compliance_evidence_refs: string[];
};

export type WhatsappBroadcastRecipientReceipt = WhatsappBroadcastRecipientInput & {
  recipient_status: WhatsappBroadcastRecipientStatus;
};

export type WhatsappBroadcastComplianceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  broadcast_compliance_check_id: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  recipients: WhatsappBroadcastRecipientInput[];
  broadcast_send_requested?: boolean;
  provider_send_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type WhatsappBroadcastComplianceReceipt = {
  seed_id: typeof PHASE_6B_WHATSAPP_BROADCAST_COMPLIANCE_SEED_ID;
  component_id: typeof PHASE_6B_WHATSAPP_BROADCAST_COMPLIANCE_COMPONENT_ID;
  event_name: typeof WHATSAPP_BROADCAST_COMPLIANCE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  broadcast_compliance_check_id: string;
  pipeline_stage_model_ref: string;
  whatsapp_template_ref: string;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  recipient_count: number;
  eligible_recipient_count: number;
  blocked_recipient_count: number;
  review_required_count: number;
  recipients: readonly WhatsappBroadcastRecipientReceipt[];
  adl_refs: readonly [typeof WHATSAPP_BROADCAST_COMPLIANCE_ADL_REF];
  global_opt_out_required: true;
  outbound_gateway_required: true;
  broadcast_send_allowed: false;
  provider_send_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
};
