export const PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_SEED_ID = 'seed_6c_089_mandatory_notice_classification' as const;
export const PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_COMPONENT_ID = '6C.07' as const;
export const MANDATORY_NOTICE_CLASSIFICATION_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.mandatory_notice_classification.runtime_evaluated' as const;

export const MANDATORY_NOTICE_CLASSIFICATION_DECISION_REFS = [
  '6C-CAL-007',
  '6C-CAL-006',
  '6C-GLOBAL-013',
  '6C-ADL-008',
  '6C-ADL-009',
] as const;

export const MANDATORY_NOTICE_CLASSIFICATION_ADL_REFS = ['ADL-004'] as const;

export type NoticePurpose = 'MANDATORY_COMPLIANCE' | 'MANDATORY_OPERATIONAL' | 'GENERAL_ANNOUNCEMENT' | 'REMINDER' | 'PROMOTIONAL';
export type MandatoryNoticeBasis = 'LEGAL_REQUIREMENT' | 'SECURITY_OR_SAFETY' | 'SERVICE_OPERATION_REQUIRED' | 'POLICY_ACKNOWLEDGEMENT_REQUIRED';
export type MandatoryNoticeClassification = 'MANDATORY_NOTICE' | 'OPT_OUT_ELIGIBLE_ANNOUNCEMENT' | 'OPT_OUT_ELIGIBLE_REMINDER' | 'REQUIRES_MANUAL_REVIEW';
export type MandatoryNoticeReviewReason = 'MISSING_MANDATORY_BASIS' | 'MISSING_SOURCE_AUTHORITY' | 'CONFLICTING_PURPOSE_AND_BASIS';

export type MandatoryNoticeClassificationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  notice_id: string;
  source_record_ref: string;
  requested_by_user_id: string;
  requested_at: string;
  notice_purpose: NoticePurpose;
  title: string;
  body: string;
  tenant_marked_mandatory?: boolean;
  mandatory_basis?: MandatoryNoticeBasis;
  mandatory_source_authority_ref?: string;
  requires_acknowledgement?: boolean;
  direct_provider_send_requested?: boolean;
  gateway_bypass_requested?: boolean;
  opt_out_bypass_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type MandatoryNoticeClassificationReceipt = {
  seed_id: typeof PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_SEED_ID;
  component_id: typeof PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CMandatoryNoticeClassification';
  event_name: typeof MANDATORY_NOTICE_CLASSIFICATION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  notice_id: string;
  source_record_ref: string;
  notice_purpose: NoticePurpose;
  classification: MandatoryNoticeClassification;
  manual_review_reasons: MandatoryNoticeReviewReason[];
  gateway_route_required: true;
  mandatory_notice_opt_out_exempt: boolean;
  opt_out_enforcement_required: boolean;
  direct_provider_send_allowed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  classification_basis: MandatoryNoticeBasis | null;
  mandatory_source_authority_ref: string | null;
  classification_reasons: string[];
  required_downstream_surface: 'COMMUNICATION_GATEWAY';
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof MANDATORY_NOTICE_CLASSIFICATION_DECISION_REFS;
  adl_refs: typeof MANDATORY_NOTICE_CLASSIFICATION_ADL_REFS;
  requested_by_user_id: string;
  requested_at: string;
  runtime_evidence_digest: string;
};
