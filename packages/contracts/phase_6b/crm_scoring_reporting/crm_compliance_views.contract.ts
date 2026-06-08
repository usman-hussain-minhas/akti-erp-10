export const PHASE_6B_CRM_COMPLIANCE_VIEWS_SEED_ID = 'seed_6b_08_crm_compliance_views' as const;
export const PHASE_6B_CRM_COMPLIANCE_VIEWS_COMPONENT_ID = '6B.08' as const;

export const CRM_COMPLIANCE_VIEW_EVENT = 'phase_6b.crm_scoring_reporting.crm_compliance_view.registered' as const;

export type CrmComplianceViewLifecycleStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'RETIRED';
export type CrmComplianceEvidenceSourceType = 'REPORT_EVIDENCE' | 'TASK_EVIDENCE' | 'RECORD_EVIDENCE';
export type CrmComplianceViewAudience = 'OPERATIONS_REVIEW' | 'SUPPORT_AUDIT' | 'BILLING_EVIDENCE_REVIEW';

export type CrmComplianceEvidenceSource = {
  source_id: string;
  source_type: CrmComplianceEvidenceSourceType;
  evidence_ref: string;
  evidence_label: string;
};

export type CrmComplianceViewInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  compliance_view_id: string;
  view_name: string;
  audience: CrmComplianceViewAudience;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  lifecycle_status: CrmComplianceViewLifecycleStatus;
  visible_field_refs: string[];
  prohibited_field_refs: string[];
  evidence_sources: CrmComplianceEvidenceSource[];
  configured_by_user_id: string;
  configured_at: string;
  data_query_requested?: boolean;
  export_requested?: boolean;
  frontend_render_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type CrmComplianceViewReceipt = {
  seed_id: typeof PHASE_6B_CRM_COMPLIANCE_VIEWS_SEED_ID;
  component_id: typeof PHASE_6B_CRM_COMPLIANCE_VIEWS_COMPONENT_ID;
  event_name: typeof CRM_COMPLIANCE_VIEW_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  compliance_view_id: string;
  view_name: string;
  audience: CrmComplianceViewAudience;
  pipeline_stage_model_ref: string;
  whatsapp_template_management_ref: string;
  optimization_fact_store_ref: string;
  lifecycle_status: CrmComplianceViewLifecycleStatus;
  visible_field_refs: string[];
  prohibited_field_refs: string[];
  evidence_sources: CrmComplianceEvidenceSource[];
  visible_field_count: number;
  prohibited_field_count: number;
  evidence_source_count: number;
  data_query_allowed: false;
  export_allowed: false;
  frontend_render_allowed: false;
  irreversible_action_allowed: false;
  configured_by_user_id: string;
  configured_at: string;
};
