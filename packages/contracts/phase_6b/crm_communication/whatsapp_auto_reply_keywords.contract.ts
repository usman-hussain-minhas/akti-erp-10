export const PHASE_6B_WHATSAPP_AUTO_REPLY_KEYWORDS_SEED_ID = 'seed_6b_07_whatsapp_auto_reply_keywords' as const;
export const PHASE_6B_WHATSAPP_AUTO_REPLY_KEYWORDS_COMPONENT_ID = '6B.07' as const;

export const WHATSAPP_AUTO_REPLY_KEYWORDS_EVENT = 'phase_6b.crm_communication.whatsapp_auto_reply_keywords.evaluated' as const;
export const WHATSAPP_AUTO_REPLY_KEYWORDS_ADL_REF = 'ADL-004' as const;

export type WhatsappAutoReplyMatchType = 'EXACT' | 'CONTAINS' | 'STARTS_WITH';
export type WhatsappAutoReplyOptOutState = 'NOT_OPTED_OUT' | 'OPTED_OUT' | 'UNKNOWN_REQUIRES_REVIEW';
export type WhatsappAutoReplyCandidateStatus = 'REPLY_CANDIDATE_READY_FOR_GATEWAY' | 'NO_KEYWORD_MATCH' | 'BLOCKED_GLOBAL_OPT_OUT' | 'REVIEW_REQUIRED';

export type WhatsappAutoReplyKeywordRule = {
  keyword_rule_id: string;
  keyword: string;
  match_type: WhatsappAutoReplyMatchType;
  response_template_ref: string;
  priority: number;
  active: boolean;
};

export type WhatsappAutoReplyKeywordsInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  auto_reply_evaluation_id: string;
  inbound_message_id: string;
  conversation_ref: string;
  lead_record_authority_id: string;
  pipeline_stage_model_ref: string;
  inbound_message_body: string;
  opt_out_state: WhatsappAutoReplyOptOutState;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  keyword_rules: WhatsappAutoReplyKeywordRule[];
  evaluated_at: string;
  outbound_send_requested?: boolean;
  provider_send_requested?: boolean;
  credential_material_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type WhatsappAutoReplyKeywordsReceipt = {
  seed_id: typeof PHASE_6B_WHATSAPP_AUTO_REPLY_KEYWORDS_SEED_ID;
  component_id: typeof PHASE_6B_WHATSAPP_AUTO_REPLY_KEYWORDS_COMPONENT_ID;
  event_name: typeof WHATSAPP_AUTO_REPLY_KEYWORDS_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  auto_reply_evaluation_id: string;
  inbound_message_id: string;
  conversation_ref: string;
  lead_record_authority_id: string;
  pipeline_stage_model_ref: string;
  normalized_inbound_body: string;
  opt_out_state: WhatsappAutoReplyOptOutState;
  global_opt_out_registry_ref: string;
  outbound_gateway_enforcement_ref: string;
  evaluated_at: string;
  evaluated_rule_count: number;
  matched_keyword_rule_id?: string;
  response_template_ref?: string;
  candidate_status: WhatsappAutoReplyCandidateStatus;
  adl_refs: readonly [typeof WHATSAPP_AUTO_REPLY_KEYWORDS_ADL_REF];
  global_opt_out_required: true;
  outbound_gateway_required: true;
  outbound_send_allowed: false;
  provider_send_allowed: false;
  credential_material_allowed: false;
  irreversible_action_allowed: false;
};
