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
