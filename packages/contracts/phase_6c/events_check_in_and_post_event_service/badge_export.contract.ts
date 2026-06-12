export const PHASE_6C_BADGE_EXPORT_SEED_ID = 'seed_6c_119_badge_export' as const;
export const PHASE_6C_BADGE_EXPORT_COMPONENT_ID = '6C.09' as const;
export const BADGE_EXPORT_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.badge_export.runtime_evaluated' as const;

export type BadgeExportFormat = 'pdf' | 'csv' | 'json';
export type BadgeExportDecision = 'BADGE_EXPORT_READY' | 'BADGE_EXPORT_REQUIRES_REVIEW' | 'BADGE_EXPORT_REJECTED_EMPTY' | 'BADGE_EXPORT_REJECTED_INVALID_LAYOUT';

export type BadgeExportRow = {
  attendee_ref: string;
  registration_ref: string;
  ticket_ref: string;
  display_name: string;
  organization_label?: string;
  role_label?: string;
  qr_ticket_token_ref?: string;
  badge_number?: string;
};

export type BadgeExportInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  requested_by_user_id: string;
  requested_at: string;
  export_format: BadgeExportFormat;
  badge_layout_ref: string;
  rows: readonly BadgeExportRow[];
  include_qr_token_ref?: boolean;
  control_metadata?: Record<string, unknown>;
  file_generation_requested?: boolean;
  file_storage_requested?: boolean;
  qr_token_creation_requested?: boolean;
  ticket_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type BadgeExportRuntimeReceipt = {
  seed_id: typeof PHASE_6C_BADGE_EXPORT_SEED_ID;
  component_id: typeof PHASE_6C_BADGE_EXPORT_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CBadgeExport';
  event_name: typeof BADGE_EXPORT_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  requested_by_user_id: string;
  requested_at: string;
  export_format: BadgeExportFormat;
  badge_layout_ref: string;
  decision: BadgeExportDecision;
  printable_attendee_refs: readonly string[];
  review_attendee_refs: readonly string[];
  row_count: number;
  printable_count: number;
  review_count: number;
  include_qr_token_ref: boolean;
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
