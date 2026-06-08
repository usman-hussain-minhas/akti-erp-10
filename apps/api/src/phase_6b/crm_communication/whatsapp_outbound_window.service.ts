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

const OPT_OUT_STATES: readonly WhatsappOptOutState[] = ['NOT_OPTED_OUT', 'OPTED_OUT', 'UNKNOWN_REQUIRES_REVIEW'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for whatsapp outbound window.`);
  }
  return value.trim();
}

function parseTimestamp(value: string, field: string): { normalized: string; epochMs: number } {
  const normalized = requireNonEmpty(value, field);
  const epochMs = Date.parse(normalized);
  if (!Number.isFinite(epochMs)) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for whatsapp outbound window.`);
  }
  return { normalized, epochMs };
}

function requireWindowMinutes(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error('configured_window_minutes must be a positive integer for whatsapp outbound window.');
  }
  return value;
}

function normalizeOptOutState(value: WhatsappOptOutState): WhatsappOptOutState {
  if (!OPT_OUT_STATES.includes(value)) {
    throw new Error('opt_out_state is not supported for whatsapp outbound window.');
  }
  return value;
}

function deriveStatus(optOutState: WhatsappOptOutState, candidateSendEpochMs: number, windowExpiresEpochMs: number): WhatsappOutboundWindowStatus {
  if (optOutState === 'OPTED_OUT') return 'BLOCKED_GLOBAL_OPT_OUT';
  if (optOutState === 'UNKNOWN_REQUIRES_REVIEW') return 'REVIEW_REQUIRED';
  return candidateSendEpochMs <= windowExpiresEpochMs ? 'ELIGIBLE_WITHIN_WINDOW' : 'BLOCKED_WINDOW_EXPIRED';
}

export function evaluateWhatsappOutboundWindow(input: WhatsappOutboundWindowInput): WhatsappOutboundWindowReceipt {
  if (input.outbound_send_requested === true) {
    throw new Error('whatsapp outbound window must not send outbound messages.');
  }
  if (input.provider_send_requested === true) {
    throw new Error('whatsapp outbound window must not perform provider sends.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('whatsapp outbound window must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('whatsapp outbound window must not perform irreversible actions.');
  }

  const lastInbound = parseTimestamp(input.last_inbound_at, 'last_inbound_at');
  const candidateSend = parseTimestamp(input.candidate_send_at, 'candidate_send_at');
  const configuredWindowMinutes = requireWindowMinutes(input.configured_window_minutes);
  const windowExpiresEpochMs = lastInbound.epochMs + configuredWindowMinutes * 60 * 1000;
  const optOutState = normalizeOptOutState(input.opt_out_state);

  return {
    seed_id: PHASE_6B_WHATSAPP_OUTBOUND_WINDOW_SEED_ID,
    component_id: PHASE_6B_WHATSAPP_OUTBOUND_WINDOW_COMPONENT_ID,
    event_name: WHATSAPP_OUTBOUND_WINDOW_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    outbound_window_check_id: requireNonEmpty(input.outbound_window_check_id, 'outbound_window_check_id'),
    lead_record_authority_id: requireNonEmpty(input.lead_record_authority_id, 'lead_record_authority_id'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    conversation_ref: requireNonEmpty(input.conversation_ref, 'conversation_ref'),
    whatsapp_template_ref: requireNonEmpty(input.whatsapp_template_ref, 'whatsapp_template_ref'),
    global_opt_out_registry_ref: requireNonEmpty(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    outbound_gateway_enforcement_ref: requireNonEmpty(input.outbound_gateway_enforcement_ref, 'outbound_gateway_enforcement_ref'),
    last_inbound_at: lastInbound.normalized,
    candidate_send_at: candidateSend.normalized,
    configured_window_minutes: configuredWindowMinutes,
    window_expires_at: new Date(windowExpiresEpochMs).toISOString(),
    opt_out_state: optOutState,
    window_status: deriveStatus(optOutState, candidateSend.epochMs, windowExpiresEpochMs),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    adl_refs: Object.freeze([WHATSAPP_OUTBOUND_WINDOW_ADL_REF]),
    global_opt_out_required: true,
    outbound_gateway_required: true,
    outbound_send_allowed: false,
    provider_send_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
  };
}
