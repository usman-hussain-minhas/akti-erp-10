import { createHash } from 'node:crypto';

export const PHASE_6C_ANNOUNCEMENT_GATEWAY_SEED_ID = 'seed_6c_088_announcement_gateway' as const;
export const PHASE_6C_ANNOUNCEMENT_GATEWAY_COMPONENT_ID = '6C.07' as const;
export const ANNOUNCEMENT_GATEWAY_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.announcement_gateway.runtime_evaluated' as const;

export const ANNOUNCEMENT_GATEWAY_DECISION_REFS = [
  '6C-CAL-006',
  '6C-CAL-007',
  '6C-GLOBAL-013',
  '6C-ADL-008',
  '6C-ADL-009',
  '6C-GLOBAL-018',
] as const;

export const ANNOUNCEMENT_GATEWAY_ADL_REFS = ['ADL-004'] as const;

export type AnnouncementNoticeClass = 'MANDATORY_NOTICE' | 'OPT_OUT_ELIGIBLE_ANNOUNCEMENT' | 'OPT_OUT_ELIGIBLE_REMINDER';
export type AnnouncementDeliveryChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
export type AnnouncementGatewayDecision = 'READY_FOR_GATEWAY' | 'PARTIAL_WITH_BLOCKED_RECIPIENTS' | 'BLOCKED_NO_DELIVERABLE_RECIPIENTS';
export type AnnouncementRecipientBlockReason = 'GLOBAL_OPT_OUT' | 'MISSING_GATEWAY_ADDRESS_REF';
export type AnnouncementIntentOptOutMode = 'GLOBAL_OPT_OUT_APPLIED' | 'MANDATORY_NOTICE_EXEMPTION_APPLIED';

export type AnnouncementAudienceSegment = {
  segment_ref: string;
  segment_kind: 'ROLE' | 'GROUP' | 'LOCATION' | 'EVENT_ATTENDEE' | 'PROJECT_MEMBER' | 'DIRECT_USER_LIST';
};

export type AnnouncementGatewayRecipient = {
  user_id: string;
  gateway_address_ref: string;
  opted_out: boolean;
  channel_preferences?: AnnouncementDeliveryChannel[];
};

export type AnnouncementGatewayInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  announcement_id: string;
  source_record_ref: string;
  requested_by_user_id: string;
  requested_at: string;
  notice_class: AnnouncementNoticeClass;
  title: string;
  body: string;
  channels: AnnouncementDeliveryChannel[];
  audience_segments: AnnouncementAudienceSegment[];
  recipients: AnnouncementGatewayRecipient[];
  gateway_policy_ref: string;
  idempotency_key: string;
  requires_acknowledgement?: boolean;
  direct_provider_send_requested?: boolean;
  gateway_bypass_requested?: boolean;
  opt_out_bypass_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type AnnouncementGatewayDeliveryIntent = {
  intent_id: string;
  user_id: string;
  channel: AnnouncementDeliveryChannel;
  gateway_address_ref: string;
  route: 'COMMUNICATION_GATEWAY';
  adl_refs: typeof ANNOUNCEMENT_GATEWAY_ADL_REFS;
  opt_out_mode: AnnouncementIntentOptOutMode;
  provider_payload_created: false;
};

export type AnnouncementGatewayBlockedRecipient = {
  user_id: string;
  reason: AnnouncementRecipientBlockReason;
  adl_refs: typeof ANNOUNCEMENT_GATEWAY_ADL_REFS;
};

export type AnnouncementGatewayReceipt = {
  seed_id: typeof PHASE_6C_ANNOUNCEMENT_GATEWAY_SEED_ID;
  component_id: typeof PHASE_6C_ANNOUNCEMENT_GATEWAY_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CAnnouncementGateway';
  event_name: typeof ANNOUNCEMENT_GATEWAY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  announcement_id: string;
  source_record_ref: string;
  notice_class: AnnouncementNoticeClass;
  decision: AnnouncementGatewayDecision;
  gateway_route_required: true;
  direct_provider_send_allowed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  mandatory_notice_opt_out_exempt: boolean;
  non_mandatory_opt_out_enforced: boolean;
  delivery_intents: AnnouncementGatewayDeliveryIntent[];
  blocked_recipients: AnnouncementGatewayBlockedRecipient[];
  audience_segments: AnnouncementAudienceSegment[];
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof ANNOUNCEMENT_GATEWAY_DECISION_REFS;
  adl_refs: typeof ANNOUNCEMENT_GATEWAY_ADL_REFS;
  idempotency_key: string;
  gateway_policy_ref: string;
  requested_by_user_id: string;
  requested_at: string;
  runtime_evidence_digest: string;
};

const ALLOWED_CHANNELS = new Set<AnnouncementDeliveryChannel>(['EMAIL', 'SMS', 'PUSH', 'IN_APP']);
const ALLOWED_SEGMENT_KINDS = new Set<AnnouncementAudienceSegment['segment_kind']>([
  'ROLE',
  'GROUP',
  'LOCATION',
  'EVENT_ATTENDEE',
  'PROJECT_MEMBER',
  'DIRECT_USER_LIST',
]);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for announcement gateway evaluation.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for announcement gateway evaluation.');
  }
  return normalized;
}

function uniqueChannels(channels: AnnouncementDeliveryChannel[], field: string): AnnouncementDeliveryChannel[] {
  if (!Array.isArray(channels) || channels.length === 0) {
    throw new Error(field + ' must include at least one Communication Gateway channel.');
  }

  const normalized: AnnouncementDeliveryChannel[] = [];
  const seen = new Set<string>();
  for (const channel of channels) {
    if (!ALLOWED_CHANNELS.has(channel)) {
      throw new Error(field + ' contains unsupported channel ' + String(channel) + '.');
    }
    if (!seen.has(channel)) {
      seen.add(channel);
      normalized.push(channel);
    }
  }
  return normalized;
}

function normalizeAudienceSegments(segments: AnnouncementAudienceSegment[]): AnnouncementAudienceSegment[] {
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error('audience_segments must include at least one source audience segment.');
  }

  const seen = new Set<string>();
  return segments.map((segment) => {
    const normalized = {
      segment_ref: requireNonEmpty(segment.segment_ref, 'audience_segments.segment_ref'),
      segment_kind: segment.segment_kind,
    };
    if (!ALLOWED_SEGMENT_KINDS.has(normalized.segment_kind)) {
      throw new Error('audience_segments.segment_kind contains unsupported segment kind ' + String(normalized.segment_kind) + '.');
    }
    const key = normalized.segment_kind + ':' + normalized.segment_ref;
    if (seen.has(key)) {
      throw new Error('audience_segments must not contain duplicate segment ' + key + '.');
    }
    seen.add(key);
    return normalized;
  });
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

function isMandatoryNotice(noticeClass: AnnouncementNoticeClass): boolean {
  return noticeClass === 'MANDATORY_NOTICE';
}

function selectRecipientChannels(recipient: AnnouncementGatewayRecipient, defaultChannels: AnnouncementDeliveryChannel[]): AnnouncementDeliveryChannel[] {
  if (recipient.channel_preferences === undefined) {
    return defaultChannels;
  }
  return uniqueChannels(recipient.channel_preferences, 'recipients.channel_preferences');
}

export function evaluateAnnouncementGateway(input: AnnouncementGatewayInput): AnnouncementGatewayReceipt {
  if (input.direct_provider_send_requested === true) {
    throw new Error('announcement_gateway must not create direct provider sends; route through Communication Gateway only.');
  }
  if (input.gateway_bypass_requested === true) {
    throw new Error('announcement_gateway must not bypass Communication Gateway enforcement.');
  }
  if (input.opt_out_bypass_requested === true) {
    throw new Error('announcement_gateway must not accept manual opt-out bypass requests; mandatory exemptions are computed from notice class.');
  }
  if (input.persistence_requested === true) {
    throw new Error('announcement_gateway must not persist announcement delivery state inside this FFET.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('announcement_gateway must not execute provider runtime adapters inside this FFET.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const announcementId = requireNonEmpty(input.announcement_id, 'announcement_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const requestedAt = requireTimestamp(input.requested_at, 'requested_at');
  const gatewayPolicyRef = requireNonEmpty(input.gateway_policy_ref, 'gateway_policy_ref');
  const idempotencyKey = requireNonEmpty(input.idempotency_key, 'idempotency_key');
  requireNonEmpty(input.title, 'title');
  requireNonEmpty(input.body, 'body');

  const channels = uniqueChannels(input.channels, 'channels');
  const audienceSegments = normalizeAudienceSegments(input.audience_segments);
  if (!Array.isArray(input.recipients) || input.recipients.length === 0) {
    throw new Error('recipients must include at least one Communication Gateway recipient.');
  }

  const mandatoryNotice = isMandatoryNotice(input.notice_class);
  const deliveryIntents: AnnouncementGatewayDeliveryIntent[] = [];
  const blockedRecipients: AnnouncementGatewayBlockedRecipient[] = [];
  const seenRecipients = new Set<string>();

  for (const recipient of input.recipients) {
    const userId = requireNonEmpty(recipient.user_id, 'recipients.user_id');
    if (seenRecipients.has(userId)) {
      throw new Error('recipients must not contain duplicate user_id ' + userId + '.');
    }
    seenRecipients.add(userId);

    const gatewayAddressRef = typeof recipient.gateway_address_ref === 'string' ? recipient.gateway_address_ref.trim() : '';
    if (gatewayAddressRef.length === 0) {
      blockedRecipients.push({
        user_id: userId,
        reason: 'MISSING_GATEWAY_ADDRESS_REF',
        adl_refs: ANNOUNCEMENT_GATEWAY_ADL_REFS,
      });
      continue;
    }

    if (!mandatoryNotice && recipient.opted_out === true) {
      blockedRecipients.push({
        user_id: userId,
        reason: 'GLOBAL_OPT_OUT',
        adl_refs: ANNOUNCEMENT_GATEWAY_ADL_REFS,
      });
      continue;
    }

    for (const channel of selectRecipientChannels(recipient, channels)) {
      deliveryIntents.push({
        intent_id: digest({ announcementId, channel, gatewayAddressRef, idempotencyKey, userId }),
        user_id: userId,
        channel,
        gateway_address_ref: gatewayAddressRef,
        route: 'COMMUNICATION_GATEWAY',
        adl_refs: ANNOUNCEMENT_GATEWAY_ADL_REFS,
        opt_out_mode: mandatoryNotice ? 'MANDATORY_NOTICE_EXEMPTION_APPLIED' : 'GLOBAL_OPT_OUT_APPLIED',
        provider_payload_created: false,
      });
    }
  }

  const decision: AnnouncementGatewayDecision = deliveryIntents.length === 0
    ? 'BLOCKED_NO_DELIVERABLE_RECIPIENTS'
    : blockedRecipients.length > 0
      ? 'PARTIAL_WITH_BLOCKED_RECIPIENTS'
      : 'READY_FOR_GATEWAY';

  const receiptWithoutDigest: Omit<AnnouncementGatewayReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_ANNOUNCEMENT_GATEWAY_SEED_ID,
    component_id: PHASE_6C_ANNOUNCEMENT_GATEWAY_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CAnnouncementGateway',
    event_name: ANNOUNCEMENT_GATEWAY_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    announcement_id: announcementId,
    source_record_ref: sourceRecordRef,
    notice_class: input.notice_class,
    decision,
    gateway_route_required: true,
    direct_provider_send_allowed: false,
    runtime_adapter_executed: false,
    persistence_executed: false,
    mandatory_notice_opt_out_exempt: mandatoryNotice,
    non_mandatory_opt_out_enforced: !mandatoryNotice,
    delivery_intents: deliveryIntents,
    blocked_recipients: blockedRecipients,
    audience_segments: audienceSegments,
    required_evidence_artifacts: [
      'announcement_gateway_runtime_receipt',
      'global_opt_out_policy_evaluated',
      'communication_gateway_delivery_intent',
    ],
    decision_refs: ANNOUNCEMENT_GATEWAY_DECISION_REFS,
    adl_refs: ANNOUNCEMENT_GATEWAY_ADL_REFS,
    idempotency_key: idempotencyKey,
    gateway_policy_ref: gatewayPolicyRef,
    requested_by_user_id: requestedByUserId,
    requested_at: requestedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digest(receiptWithoutDigest),
  };
}
