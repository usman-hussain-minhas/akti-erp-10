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

const OPT_OUT_STATES: readonly WhatsappBroadcastOptOutState[] = ['NOT_OPTED_OUT', 'OPTED_OUT', 'UNKNOWN_REQUIRES_REVIEW'] as const;
const WINDOW_STATES: readonly WhatsappBroadcastWindowState[] = ['ELIGIBLE_WITHIN_WINDOW', 'BLOCKED_WINDOW_EXPIRED', 'REVIEW_REQUIRED'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for whatsapp broadcast compliance.`);
  }
  return value.trim();
}

function requireEvaluatedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'evaluated_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('evaluated_at must be a valid ISO-compatible timestamp for whatsapp broadcast compliance.');
  }
  return normalized;
}

function normalizeOptOutState(value: WhatsappBroadcastOptOutState): WhatsappBroadcastOptOutState {
  if (!OPT_OUT_STATES.includes(value)) {
    throw new Error('opt_out_state is not supported for whatsapp broadcast compliance.');
  }
  return value;
}

function normalizeWindowState(value: WhatsappBroadcastWindowState): WhatsappBroadcastWindowState {
  if (!WINDOW_STATES.includes(value)) {
    throw new Error('outbound_window_state is not supported for whatsapp broadcast compliance.');
  }
  return value;
}

function normalizeRefs(refs: string[], field: string): readonly string[] {
  if (!Array.isArray(refs) || refs.length === 0) {
    throw new Error(`${field} must contain at least one value for whatsapp broadcast compliance.`);
  }
  const normalized = refs.map((ref, index) => requireNonEmpty(ref, `${field}.${index}`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${field} must not contain duplicate values for whatsapp broadcast compliance.`);
  }
  return Object.freeze(normalized);
}

function deriveRecipientStatus(optOutState: WhatsappBroadcastOptOutState, windowState: WhatsappBroadcastWindowState): WhatsappBroadcastRecipientStatus {
  if (optOutState === 'OPTED_OUT') return 'BLOCKED_GLOBAL_OPT_OUT';
  if (optOutState === 'UNKNOWN_REQUIRES_REVIEW' || windowState === 'REVIEW_REQUIRED') return 'REVIEW_REQUIRED';
  if (windowState === 'BLOCKED_WINDOW_EXPIRED') return 'BLOCKED_WINDOW_EXPIRED';
  return 'ELIGIBLE_FOR_GATEWAY';
}

function normalizeRecipient(recipient: WhatsappBroadcastRecipientInput): WhatsappBroadcastRecipientReceipt {
  const optOutState = normalizeOptOutState(recipient.opt_out_state);
  const outboundWindowState = normalizeWindowState(recipient.outbound_window_state);
  return {
    recipient_ref: requireNonEmpty(recipient.recipient_ref, 'recipient_ref'),
    lead_record_authority_id: requireNonEmpty(recipient.lead_record_authority_id, 'lead_record_authority_id'),
    conversation_ref: requireNonEmpty(recipient.conversation_ref, 'conversation_ref'),
    opt_out_state: optOutState,
    outbound_window_state: outboundWindowState,
    compliance_evidence_refs: [...normalizeRefs(recipient.compliance_evidence_refs, 'compliance_evidence_refs')],
    recipient_status: deriveRecipientStatus(optOutState, outboundWindowState),
  };
}

export function evaluateWhatsappBroadcastCompliance(input: WhatsappBroadcastComplianceInput): WhatsappBroadcastComplianceReceipt {
  if (input.broadcast_send_requested === true) {
    throw new Error('whatsapp broadcast compliance must not send broadcasts.');
  }
  if (input.provider_send_requested === true) {
    throw new Error('whatsapp broadcast compliance must not perform provider sends.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('whatsapp broadcast compliance must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('whatsapp broadcast compliance must not perform irreversible actions.');
  }
  if (!Array.isArray(input.recipients) || input.recipients.length === 0) {
    throw new Error('recipients must contain at least one recipient for whatsapp broadcast compliance.');
  }

  const recipients = input.recipients.map(normalizeRecipient);
  const recipientRefs = new Set(recipients.map((recipient) => recipient.recipient_ref));
  if (recipientRefs.size !== recipients.length) {
    throw new Error('recipient_ref values must be unique for whatsapp broadcast compliance.');
  }

  const eligibleRecipientCount = recipients.filter((recipient) => recipient.recipient_status === 'ELIGIBLE_FOR_GATEWAY').length;
  const reviewRequiredCount = recipients.filter((recipient) => recipient.recipient_status === 'REVIEW_REQUIRED').length;
  const blockedRecipientCount = recipients.length - eligibleRecipientCount - reviewRequiredCount;

  return {
    seed_id: PHASE_6B_WHATSAPP_BROADCAST_COMPLIANCE_SEED_ID,
    component_id: PHASE_6B_WHATSAPP_BROADCAST_COMPLIANCE_COMPONENT_ID,
    event_name: WHATSAPP_BROADCAST_COMPLIANCE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    broadcast_compliance_check_id: requireNonEmpty(input.broadcast_compliance_check_id, 'broadcast_compliance_check_id'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    whatsapp_template_ref: requireNonEmpty(input.whatsapp_template_ref, 'whatsapp_template_ref'),
    global_opt_out_registry_ref: requireNonEmpty(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    outbound_gateway_enforcement_ref: requireNonEmpty(input.outbound_gateway_enforcement_ref, 'outbound_gateway_enforcement_ref'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireEvaluatedAt(input.evaluated_at),
    recipient_count: recipients.length,
    eligible_recipient_count: eligibleRecipientCount,
    blocked_recipient_count: blockedRecipientCount,
    review_required_count: reviewRequiredCount,
    recipients: Object.freeze(recipients),
    adl_refs: Object.freeze([WHATSAPP_BROADCAST_COMPLIANCE_ADL_REF]),
    global_opt_out_required: true,
    outbound_gateway_required: true,
    broadcast_send_allowed: false,
    provider_send_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
  };
}
