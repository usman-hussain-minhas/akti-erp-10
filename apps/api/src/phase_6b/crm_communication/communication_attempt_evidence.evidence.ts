import { createHash } from 'node:crypto';

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

const CHANNELS: readonly CommunicationAttemptChannel[] = ['EMAIL', 'WHATSAPP'] as const;
const DIRECTIONS: readonly CommunicationAttemptDirection[] = ['OUTBOUND', 'INBOUND'] as const;
const STATUSES: readonly CommunicationAttemptStatus[] = ['RECORDED', 'GATEWAY_ACCEPTED', 'SKIPPED_OPT_OUT', 'FAILED'] as const;
const BILLING_CLASSES: readonly CommunicationAttemptBillingClass[] = ['ZERO_RATED', 'BILLABLE_MESSAGE_USAGE'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for communication attempt evidence.`);
  }
  return value.trim();
}

function normalizeOptional(value: string | undefined, field: string): string | undefined {
  if (value === undefined) return undefined;
  return requireNonEmpty(value, field);
}

function requireAttemptedAt(value: string): string {
  const normalized = requireNonEmpty(value, 'attempted_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('attempted_at must be a valid ISO-compatible timestamp for communication attempt evidence.');
  }
  return normalized;
}

function normalizeChannel(value: CommunicationAttemptChannel): CommunicationAttemptChannel {
  if (!CHANNELS.includes(value)) {
    throw new Error('channel is not supported for communication attempt evidence.');
  }
  return value;
}

function normalizeDirection(value: CommunicationAttemptDirection): CommunicationAttemptDirection {
  if (!DIRECTIONS.includes(value)) {
    throw new Error('direction is not supported for communication attempt evidence.');
  }
  return value;
}

function normalizeStatus(value: CommunicationAttemptStatus): CommunicationAttemptStatus {
  if (!STATUSES.includes(value)) {
    throw new Error('attempt_status is not supported for communication attempt evidence.');
  }
  return value;
}

function normalizeBillingClass(value: CommunicationAttemptBillingClass): CommunicationAttemptBillingClass {
  if (!BILLING_CLASSES.includes(value)) {
    throw new Error('billing_class is not supported for communication attempt evidence.');
  }
  return value;
}

function normalizeBillableUnitCount(value: number, billingClass: CommunicationAttemptBillingClass): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('billable_unit_count must be a non-negative integer for communication attempt evidence.');
  }
  if (billingClass === 'ZERO_RATED' && value !== 0) {
    throw new Error('ZERO_RATED communication attempt evidence must have zero billable units.');
  }
  if (billingClass === 'BILLABLE_MESSAGE_USAGE' && value < 1) {
    throw new Error('BILLABLE_MESSAGE_USAGE communication attempt evidence must have at least one billable unit.');
  }
  return value;
}

function digestEvidence(receiptWithoutDigest: Omit<CommunicationAttemptEvidenceReceipt, 'evidence_digest'>): string {
  const stablePayload = JSON.stringify(receiptWithoutDigest, Object.keys(receiptWithoutDigest).sort());
  return createHash('sha256').update(stablePayload).digest('hex');
}

export function recordCommunicationAttemptEvidence(input: CommunicationAttemptEvidenceInput): CommunicationAttemptEvidenceReceipt {
  if (input.send_requested === true) {
    throw new Error('communication attempt evidence must not send messages.');
  }
  if (input.provider_callback_processing_requested === true) {
    throw new Error('communication attempt evidence must not process provider callbacks.');
  }
  if (input.credential_material_requested === true) {
    throw new Error('communication attempt evidence must not handle credential material.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('communication attempt evidence must not perform irreversible actions.');
  }

  const billingClass = normalizeBillingClass(input.billing_class);
  const billableUnitCount = normalizeBillableUnitCount(input.billable_unit_count, billingClass);

  const receiptWithoutDigest: Omit<CommunicationAttemptEvidenceReceipt, 'evidence_digest'> = {
    seed_id: PHASE_6B_COMMUNICATION_ATTEMPT_EVIDENCE_SEED_ID,
    component_id: PHASE_6B_COMMUNICATION_ATTEMPT_EVIDENCE_COMPONENT_ID,
    event_name: COMMUNICATION_ATTEMPT_EVIDENCE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    attempt_evidence_id: requireNonEmpty(input.attempt_evidence_id, 'attempt_evidence_id'),
    conversation_ref: requireNonEmpty(input.conversation_ref, 'conversation_ref'),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    channel: normalizeChannel(input.channel),
    direction: normalizeDirection(input.direction),
    attempt_status: normalizeStatus(input.attempt_status),
    billing_class: billingClass,
    billable_unit_count: billableUnitCount,
    billable: billingClass === 'BILLABLE_MESSAGE_USAGE',
    message_usage_evidence_ref: requireNonEmpty(input.message_usage_evidence_ref, 'message_usage_evidence_ref'),
    attempted_at: requireAttemptedAt(input.attempted_at),
    recorded_by_surface: requireNonEmpty(input.recorded_by_surface, 'recorded_by_surface'),
    global_opt_out_registry_ref: normalizeOptional(input.global_opt_out_registry_ref, 'global_opt_out_registry_ref'),
    opt_out_dependency_tier: 'CONDITIONAL_EVIDENCE_REFERENCE',
    send_allowed: false,
    provider_callback_processing_allowed: false,
    credential_material_allowed: false,
    irreversible_action_allowed: false,
  };

  return {
    ...receiptWithoutDigest,
    evidence_digest: digestEvidence(receiptWithoutDigest),
  };
}
