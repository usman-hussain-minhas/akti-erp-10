export const PHASE_6B_WHATSAPP_INBOUND_ROUTING_SEED_ID = 'seed_6b_07_whatsapp_inbound_routing' as const;
export const PHASE_6B_WHATSAPP_INBOUND_ROUTING_COMPONENT_ID = '6B.07' as const;

export const WHATSAPP_INBOUND_ROUTING_EVENT = 'phase_6b.crm_communication.whatsapp_inbound_routing.routed' as const;

export type WhatsappInboundRoutingDecision = 'CREATE_LEAD' | 'ATTACH_TO_EXISTING_LEAD' | 'ROUTE_TO_PIPELINE_STAGE' | 'MANUAL_REVIEW';
export type WhatsappInboundMessageKind = 'TEXT' | 'MEDIA_EVIDENCE' | 'TEMPLATE_REPLY' | 'INTERACTIVE_REPLY' | 'UNKNOWN';

export type WhatsappInboundRoutingInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  inbound_message_id: string;
  channel_account_ref: string;
  sender_contact_ref: string;
  conversation_ref: string;
  lead_record_authority_id: string;
  pipeline_stage_model_ref: string;
  pipeline_stage_key: string;
  message_kind: WhatsappInboundMessageKind;
  normalized_message_body: string;
  received_at: string;
  routing_decision: WhatsappInboundRoutingDecision;
  route_reason: string;
  assigned_work_queue_ref?: string;
  global_opt_out_registry_ref?: string;
  evidence_refs: string[];
  outbound_send_requested?: boolean;
  provider_callback_processing_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type WhatsappInboundRoutingReceipt = {
  seed_id: typeof PHASE_6B_WHATSAPP_INBOUND_ROUTING_SEED_ID;
  component_id: typeof PHASE_6B_WHATSAPP_INBOUND_ROUTING_COMPONENT_ID;
  event_name: typeof WHATSAPP_INBOUND_ROUTING_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  inbound_message_id: string;
  channel_account_ref: string;
  sender_contact_ref: string;
  conversation_ref: string;
  lead_record_authority_id: string;
  pipeline_stage_model_ref: string;
  pipeline_stage_key: string;
  message_kind: WhatsappInboundMessageKind;
  normalized_message_body: string;
  received_at: string;
  routing_decision: WhatsappInboundRoutingDecision;
  route_reason: string;
  assigned_work_queue_ref?: string;
  global_opt_out_registry_ref?: string;
  evidence_refs: readonly string[];
  evidence_count: number;
  opt_out_dependency_tier: 'CONDITIONAL_CAPTURE_REFERENCE';
  inbound_capture_only: true;
  outbound_send_allowed: false;
  provider_callback_processing_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
};
