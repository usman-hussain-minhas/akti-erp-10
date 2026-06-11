export const PHASE_6C_OUTBOUND_NOTIFICATION_GATEWAY_SEED_ID = "seed_6c_062_outbound_notification_gateway" as const;
export const PHASE_6C_OUTBOUND_NOTIFICATION_GATEWAY_COMPONENT_ID = "6C.05" as const;
export const OUTBOUND_NOTIFICATION_GATEWAY_EVALUATED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.outbound_notification_gateway.evaluated" as const;

export type OutboundNotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP";
export type OutboundNotificationType =
  | "THREAD_MENTION"
  | "DIRECT_MESSAGE"
  | "CHANNEL_ANNOUNCEMENT"
  | "TASK_HANDOFF"
  | "SYSTEM_ALERT";
export type OutboundNotificationUrgency = "LOW" | "NORMAL" | "HIGH";
export type GatewayOptOutStatus = "ALLOWED" | "OPTED_OUT" | "UNKNOWN";
export type OutboundNotificationGatewayDecision =
  | "READY_FOR_GATEWAY"
  | "PARTIALLY_READY_FOR_GATEWAY"
  | "REQUIRES_GATEWAY_REVIEW"
  | "SUPPRESSED_BY_OPT_OUT";

export type OutboundNotificationRecipient = {
  recipient_ref: string;
  person_ref?: string;
  user_ref?: string;
  channels: readonly OutboundNotificationChannel[];
  opt_out_status: GatewayOptOutStatus;
  gateway_policy_evidence_ref?: string;
  locale?: string;
  timezone?: string;
};

export type OutboundNotificationMessage = {
  subject: string;
  body_preview: string;
  deep_link_ref: string;
};

export type OutboundNotificationGatewayInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  notification_ref: string;
  actor_user_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  notification_type: OutboundNotificationType;
  urgency: OutboundNotificationUrgency;
  message: OutboundNotificationMessage;
  recipients: OutboundNotificationRecipient[];
  send_requested?: boolean;
  provider_adapter_requested?: boolean;
  direct_delivery_requested?: boolean;
  gateway_bypass_requested?: boolean;
  opt_out_override_requested?: boolean;
  event_dispatch_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OutboundNotificationGatewayEnvelope = {
  envelope_ref: string;
  recipient_ref: string;
  person_ref?: string;
  user_ref?: string;
  channel: OutboundNotificationChannel;
  notification_type: OutboundNotificationType;
  urgency: OutboundNotificationUrgency;
  subject: string;
  body_preview: string;
  deep_link_ref: string;
  gateway_policy_evidence_ref: string;
  required_gateway_controls: readonly ["global_opt_out_registry", "outbound_gateway_enforcement"];
  adl_refs: readonly ["ADL-004"];
  send_performed: false;
};

export type SuppressedNotificationRecipient = {
  recipient_ref: string;
  reason: "GLOBAL_OPT_OUT" | "MISSING_GATEWAY_POLICY_EVIDENCE" | "NO_CHANNELS";
  channels: readonly OutboundNotificationChannel[];
};

export type OutboundNotificationGatewayReceipt = {
  seed_id: typeof PHASE_6C_OUTBOUND_NOTIFICATION_GATEWAY_SEED_ID;
  component_id: typeof PHASE_6C_OUTBOUND_NOTIFICATION_GATEWAY_COMPONENT_ID;
  event_name: typeof OUTBOUND_NOTIFICATION_GATEWAY_EVALUATED_EVENT;
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  notification_ref: string;
  decision: OutboundNotificationGatewayDecision;
  recipient_count: number;
  envelope_count: number;
  suppressed_count: number;
  review_reasons: string[];
  gateway_envelopes: OutboundNotificationGatewayEnvelope[];
  suppressed_recipients: SuppressedNotificationRecipient[];
  send_performed: false;
  provider_adapter_performed: false;
  direct_delivery_performed: false;
  gateway_bypass_performed: false;
  opt_out_override_performed: false;
  event_dispatch_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-007", "6C-GLOBAL-013", "6C-ADL-008"];
  adl_refs: readonly ["ADL-004"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};
