export const PHASE_6C_MODERATION_REPORTING_SEED_ID = "seed_6c_068_moderation_reporting" as const;
export const PHASE_6C_MODERATION_REPORTING_COMPONENT_ID = "6C.05" as const;
export const MODERATION_REPORTING_EVALUATED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.moderation_reporting.evaluated" as const;

export type ModerationReportCategory =
  | "HARASSMENT"
  | "SPAM"
  | "SENSITIVE_DATA"
  | "POLICY_VIOLATION"
  | "OTHER";
export type ModerationReportSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ModerationReportDecision =
  | "MODERATION_REPORT_ACCEPTED"
  | "MODERATION_REPORT_ESCALATED"
  | "MODERATION_REPORT_REQUIRES_REVIEW"
  | "MODERATION_REPORT_REJECTED";

export type ModerationReportPolicy = {
  policy_ref: string;
  auto_escalate_severities: readonly ModerationReportSeverity[];
  require_reporter_evidence: boolean;
  allow_self_report: boolean;
  duplicate_window_minutes: number;
};

export type ModerationReportInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  report_ref: string;
  reported_message_ref: string;
  reporter_user_ref: string;
  reported_actor_user_ref: string;
  category: ModerationReportCategory;
  severity: ModerationReportSeverity;
  reason: string;
  evidence_refs: string[];
  reported_at: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  policy: ModerationReportPolicy;
  prior_report_refs?: string[];
  content_removal_requested?: boolean;
  account_action_requested?: boolean;
  notification_send_requested?: boolean;
  gatekeeper_bypass_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ModerationReportReceipt = {
  seed_id: typeof PHASE_6C_MODERATION_REPORTING_SEED_ID;
  component_id: typeof PHASE_6C_MODERATION_REPORTING_COMPONENT_ID;
  event_name: typeof MODERATION_REPORTING_EVALUATED_EVENT;
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  report_ref: string;
  reported_message_ref: string;
  decision: ModerationReportDecision;
  category: ModerationReportCategory;
  severity: ModerationReportSeverity;
  escalation_required: boolean;
  duplicate_risk: boolean;
  review_reasons: string[];
  rejection_reasons: string[];
  normalized_evidence_refs: string[];
  content_removal_performed: false;
  account_action_performed: false;
  notification_send_performed: false;
  gatekeeper_bypass_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  event_dispatch_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-014", "6C-GLOBAL-018"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};
