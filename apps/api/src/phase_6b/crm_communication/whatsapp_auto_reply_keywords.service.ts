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

const MATCH_TYPES: readonly WhatsappAutoReplyMatchType[] = ['EXACT', 'CONTAINS', 'STARTS_WITH'] as const;
const OPT_OUT_STATES: readonly WhatsappAutoReplyOptOutState[] = ['NOT_OPTED_OUT', 'OPTED_OUT', 'UNKNOWN_REQUIRES_REVIEW'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for whatsapp auto reply keywords.`);
  }
  return value.trim();
}

function requireEvaluatedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'evaluated_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('evaluated_at must be a valid ISO-compatible timestamp for whatsapp auto reply keywords.');
  }
  return normalized;
}

function normalizeBody(value: string): string {
  return requireNonEmpty(value, 'inbound_message_body').toLowerCase();
}

function normalizeMatchType(value: WhatsappAutoReplyMatchType): WhatsappAutoReplyMatchType {
  if (!MATCH_TYPES.includes(value)) {
    throw new Error('match_type is not supported for whatsapp auto reply keywords.');
  }
  return value;
}

function normalizeOptOutState(value: WhatsappAutoReplyOptOutState): WhatsappAutoReplyOptOutState {
  if (!OPT_OUT_STATES.includes(value)) {
    throw new Error('opt_out_state is not supported for whatsapp auto reply keywords.');
  }
  return value;
}

function requirePriority(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('priority must be a positive integer for whatsapp auto reply keywords.');
  }
  return value;
}

function normalizeRule(rule: WhatsappAutoReplyKeywordRule): WhatsappAutoReplyKeywordRule {
  return {
    keyword_rule_id: requireNonEmpty(rule.keyword_rule_id, 'keyword_rule_id'),
    keyword: requireNonEmpty(rule.keyword, 'keyword').toLowerCase(),
    match_type: normalizeMatchType(rule.match_type),
    response_template_ref: requireNonEmpty(rule.response_template_ref, 'response_template_ref'),
    priority: requirePriority(rule.priority),
    active: rule.active === true,
  };
}

function ruleMatches(rule: WhatsappAutoReplyKeywordRule, body: string): boolean {
  if (!rule.active) return false;
  if (rule.match_type === 'EXACT') return body === rule.keyword;
  if (rule.match_type === 'STARTS_WITH') return body.startsWith(rule.keyword);
  return body.includes(rule.keyword);
}

export function evaluateWhatsappAutoReplyKeywords(input: WhatsappAutoReplyKeywordsInput): WhatsappAutoReplyKeywordsReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('whatsapp auto reply keywords must not send outbound messages.');
  }
  if (input.provider_send_requested === true) {
    throw new Error('whatsapp auto reply keywords must not perform provider sends.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('whatsapp auto reply keywords must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('whatsapp auto reply keywords must not perform irreversible actions.');
  }
  if (!Array.isArray(input.keyword_rules) || input.keyword_rules.length === 0) {
    throw new Error('keyword_rules must contain at least one rule for whatsapp auto reply keywords.');
  }

  const normalizedBody = normalizeBody(input.inbound_message_body);
  const optOutState = normalizeOptOutState(input.opt_out_state);
  const rules = input.keyword_rules.map(normalizeRule).sort((left, right) => left.priority - right.priority || left.keyword_rule_id.localeCompare(right.keyword_rule_id));
  const ruleIds = new Set(rules.map((rule) => rule.keyword_rule_id));
  if (ruleIds.size !== rules.length) {
    throw new Error('keyword_rule_id values must be unique for whatsapp auto reply keywords.');
  }

  const matchedRule = rules.find((rule) => ruleMatches(rule, normalizedBody));
  let candidateStatus: WhatsappAutoReplyCandidateStatus = matchedRule ? 'REPLY_CANDIDATE_READY_FOR_GATEWAY' : 'NO_KEYWORD_MATCH';
  if (optOutState === 'OPTED_OUT') candidateStatus = 'BLOCKED_GLOBAL_OPT_OUT';
  if (optOutState === 'UNKNOWN_REQUIRES_REVIEW') candidateStatus = 'REVIEW_REQUIRED';

  return {
    seed_id: PHASE_6B_WHATSAPP_AUTO_REPLY_KEYWORDS_SEED_ID,
    component_id: PHASE_6B_WHATSAPP_AUTO_REPLY_KEYWORDS_COMPONENT_ID,
    event_name: WHATSAPP_AUTO_REPLY_KEYWORDS_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    auto_reply_evaluation_id: requireNonEmpty(input.auto_reply_evaluation_id, 'auto_reply_evaluation_id'),
    inbound_message_id: requireNonEmpty(input.inbound_message_id, 'inbound_message_id'),
    conversation_ref: requireNonEmpty(input.conversation_ref, 'conversation_ref'),
    lead_record_authority_id: requireNonEmpty(input.lead_record_authority_id, 'lead_record_authority_id'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    normalized_inbound_body: normalizedBody,
    opt_out_state: optOutState,
    global_opt_out_registry_ref: requireNonEmpty(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    outbound_gateway_enforcement_ref: requireNonEmpty(input.outbound_gateway_enforcement_ref, 'outbound_gateway_enforcement_ref'),
    evaluated_at: requireEvaluatedAt(input.evaluated_at),
    evaluated_rule_count: rules.length,
    matched_keyword_rule_id: matchedRule?.keyword_rule_id,
    response_template_ref: matchedRule?.response_template_ref,
    candidate_status: candidateStatus,
    adl_refs: Object.freeze([WHATSAPP_AUTO_REPLY_KEYWORDS_ADL_REF]),
    global_opt_out_required: true,
    outbound_gateway_required: true,
    outbound_send_allowed: false,
    provider_send_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
  };
}
