import { createHash } from 'node:crypto';

export const PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_SEED_ID = 'seed_6c_095_announcement_ack_evidence' as const;
export const PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_COMPONENT_ID = '6C.07' as const;
export const ANNOUNCEMENT_ACK_EVIDENCE_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.announcement_ack_evidence.runtime_evaluated' as const;

export const ANNOUNCEMENT_ACK_EVIDENCE_DECISION_REFS = ['6C-CAL-014', '6C-GLOBAL-013', '6C-ADL-008', '6C-GLOBAL-018'] as const;
export const ANNOUNCEMENT_ACK_EVIDENCE_ADL_REFS = ['ADL-004'] as const;

export type AnnouncementAckStatus = 'ACKNOWLEDGED' | 'PENDING' | 'NOT_REQUIRED' | 'DECLINED';
export type AnnouncementAckMethod = 'USER_ACTION' | 'ADMIN_RECORDED' | 'SYSTEM_IMPORTED';
export type AnnouncementAckDecision = 'ACK_EVIDENCE_READY' | 'ACK_PENDING' | 'ACK_NOT_REQUIRED' | 'ACK_DECLINED_RECORDED';

export type AnnouncementAckEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  announcement_id: string;
  delivery_intent_id: string;
  recipient_user_id: string;
  source_record_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  acknowledgement_required: boolean;
  acknowledgement_status: AnnouncementAckStatus;
  acknowledgement_method?: AnnouncementAckMethod;
  acknowledged_at?: string;
  source_ack_ref?: string;
  gateway_policy_ref: string;
  provider_callback_requested?: boolean;
  gateway_send_requested?: boolean;
  acknowledgement_mutation_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type AnnouncementAckEvidenceEntry = {
  evidence_id: string;
  acknowledgement_status: AnnouncementAckStatus;
  acknowledgement_method: AnnouncementAckMethod | null;
  acknowledged_at: string | null;
  source_ack_ref: string | null;
  workspace_evidence_mode: 'EVENT_REFERENCE_ONLY';
};

export type AnnouncementAckEvidenceReceipt = {
  seed_id: typeof PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CAnnouncementAckEvidence';
  event_name: typeof ANNOUNCEMENT_ACK_EVIDENCE_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  announcement_id: string;
  delivery_intent_id: string;
  recipient_user_id: string;
  source_record_ref: string;
  decision: AnnouncementAckDecision;
  ack_evidence: AnnouncementAckEvidenceEntry;
  gateway_route_required: true;
  refs_events_only: true;
  provider_callback_executed: false;
  gateway_send_executed: false;
  acknowledgement_mutation_executed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof ANNOUNCEMENT_ACK_EVIDENCE_DECISION_REFS;
  adl_refs: typeof ANNOUNCEMENT_ACK_EVIDENCE_ADL_REFS;
  gateway_policy_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

const STATUSES = new Set<AnnouncementAckStatus>(['ACKNOWLEDGED', 'PENDING', 'NOT_REQUIRED', 'DECLINED']);
const METHODS = new Set<AnnouncementAckMethod>(['USER_ACTION', 'ADMIN_RECORDED', 'SYSTEM_IMPORTED']);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for announcement acknowledgement evidence evaluation.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  return normalized.length === 0 ? null : normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for announcement acknowledgement evidence evaluation.');
  }
  return normalized;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((item) => stableStringify(item)).join(',') + ']';
  }
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => JSON.stringify(key) + ':' + stableStringify(nested))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function decisionFor(required: boolean, status: AnnouncementAckStatus): AnnouncementAckDecision {
  if (!required && status === 'NOT_REQUIRED') {
    return 'ACK_NOT_REQUIRED';
  }
  if (status === 'ACKNOWLEDGED') {
    return 'ACK_EVIDENCE_READY';
  }
  if (status === 'DECLINED') {
    return 'ACK_DECLINED_RECORDED';
  }
  return 'ACK_PENDING';
}

export function evaluateAnnouncementAckEvidence(input: AnnouncementAckEvidenceInput): AnnouncementAckEvidenceReceipt {
  if (input.provider_callback_requested === true) {
    throw new Error('announcement_ack_evidence must not execute provider callbacks inside this FFET.');
  }
  if (input.gateway_send_requested === true) {
    throw new Error('announcement_ack_evidence must not send through the gateway inside this FFET.');
  }
  if (input.acknowledgement_mutation_requested === true) {
    throw new Error('announcement_ack_evidence must not mutate acknowledgement state inside this FFET.');
  }
  if (input.persistence_requested === true) {
    throw new Error('announcement_ack_evidence must not persist acknowledgement evidence inside this FFET.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('announcement_ack_evidence must not execute runtime adapters inside this FFET.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const announcementId = requireNonEmpty(input.announcement_id, 'announcement_id');
  const deliveryIntentId = requireNonEmpty(input.delivery_intent_id, 'delivery_intent_id');
  const recipientUserId = requireNonEmpty(input.recipient_user_id, 'recipient_user_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const gatewayPolicyRef = requireNonEmpty(input.gateway_policy_ref, 'gateway_policy_ref');

  if (!STATUSES.has(input.acknowledgement_status)) {
    throw new Error('acknowledgement_status contains unsupported value ' + String(input.acknowledgement_status) + '.');
  }
  const method = input.acknowledgement_method === undefined ? null : input.acknowledgement_method;
  if (method !== null && !METHODS.has(method)) {
    throw new Error('acknowledgement_method contains unsupported value ' + String(method) + '.');
  }
  const acknowledgedAt = input.acknowledged_at === undefined ? null : requireTimestamp(input.acknowledged_at, 'acknowledged_at');
  const sourceAckRef = optionalNonEmpty(input.source_ack_ref);

  if (input.acknowledgement_status === 'ACKNOWLEDGED' && (method === null || acknowledgedAt === null || sourceAckRef === null)) {
    throw new Error('ACKNOWLEDGED evidence requires acknowledgement_method, acknowledged_at, and source_ack_ref.');
  }
  if (input.acknowledgement_status === 'PENDING' && !input.acknowledgement_required) {
    throw new Error('PENDING acknowledgement is valid only when acknowledgement_required is true.');
  }
  if (input.acknowledgement_status === 'NOT_REQUIRED' && input.acknowledgement_required) {
    throw new Error('NOT_REQUIRED acknowledgement is invalid when acknowledgement_required is true.');
  }

  const ackEvidence: AnnouncementAckEvidenceEntry = {
    evidence_id: digest({ acknowledgementStatus: input.acknowledgement_status, announcementId, deliveryIntentId, recipientUserId, sourceAckRef }),
    acknowledgement_status: input.acknowledgement_status,
    acknowledgement_method: method,
    acknowledged_at: acknowledgedAt,
    source_ack_ref: sourceAckRef,
    workspace_evidence_mode: 'EVENT_REFERENCE_ONLY',
  };

  const receiptWithoutDigest: Omit<AnnouncementAckEvidenceReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_ANNOUNCEMENT_ACK_EVIDENCE_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CAnnouncementAckEvidence',
    event_name: ANNOUNCEMENT_ACK_EVIDENCE_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    announcement_id: announcementId,
    delivery_intent_id: deliveryIntentId,
    recipient_user_id: recipientUserId,
    source_record_ref: sourceRecordRef,
    decision: decisionFor(input.acknowledgement_required, input.acknowledgement_status),
    ack_evidence: ackEvidence,
    gateway_route_required: true,
    refs_events_only: true,
    provider_callback_executed: false,
    gateway_send_executed: false,
    acknowledgement_mutation_executed: false,
    runtime_adapter_executed: false,
    persistence_executed: false,
    required_evidence_artifacts: [
      'announcement_ack_evidence_runtime_receipt',
      'acknowledgement_status_evidence',
      'communication_gateway_delivery_trace',
    ],
    decision_refs: ANNOUNCEMENT_ACK_EVIDENCE_DECISION_REFS,
    adl_refs: ANNOUNCEMENT_ACK_EVIDENCE_ADL_REFS,
    gateway_policy_ref: gatewayPolicyRef,
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digest(receiptWithoutDigest),
  };
}
