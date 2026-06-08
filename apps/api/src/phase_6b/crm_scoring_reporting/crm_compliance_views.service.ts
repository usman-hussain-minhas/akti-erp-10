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

const LIFECYCLE_STATUSES: readonly CrmComplianceViewLifecycleStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'RETIRED'] as const;
const SOURCE_TYPES: readonly CrmComplianceEvidenceSourceType[] = ['REPORT_EVIDENCE', 'TASK_EVIDENCE', 'RECORD_EVIDENCE'] as const;
const AUDIENCES: readonly CrmComplianceViewAudience[] = ['OPERATIONS_REVIEW', 'SUPPORT_AUDIT', 'BILLING_EVIDENCE_REVIEW'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for crm compliance views.`);
  }
  return value.trim();
}

function requireConfiguredAt(value: string): string {
  const normalized = requireNonEmpty(value, 'configured_at');
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp)) {
    throw new Error('configured_at must be a valid ISO-compatible timestamp for crm compliance views.');
  }
  return normalized;
}

function normalizeLifecycleStatus(value: CrmComplianceViewLifecycleStatus): CrmComplianceViewLifecycleStatus {
  if (!LIFECYCLE_STATUSES.includes(value)) {
    throw new Error('lifecycle_status is not supported for crm compliance views.');
  }
  return value;
}

function normalizeSourceType(value: CrmComplianceEvidenceSourceType): CrmComplianceEvidenceSourceType {
  if (!SOURCE_TYPES.includes(value)) {
    throw new Error('source_type is not supported for crm compliance views.');
  }
  return value;
}

function normalizeAudience(value: CrmComplianceViewAudience): CrmComplianceViewAudience {
  if (!AUDIENCES.includes(value)) {
    throw new Error('audience is not supported for crm compliance views.');
  }
  return value;
}

function normalizeStringList(values: string[], field: string, allowEmpty: boolean): string[] {
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0)) {
    throw new Error(`${field} must include at least one value for crm compliance views.`);
  }
  const normalized = values.map((value) => requireNonEmpty(value, field));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${field} must not contain duplicates for crm compliance views.`);
  }
  return normalized;
}

function normalizeEvidenceSource(source: CrmComplianceEvidenceSource): CrmComplianceEvidenceSource {
  return {
    source_id: requireNonEmpty(source.source_id, 'evidence_sources.source_id'),
    source_type: normalizeSourceType(source.source_type),
    evidence_ref: requireNonEmpty(source.evidence_ref, 'evidence_sources.evidence_ref'),
    evidence_label: requireNonEmpty(source.evidence_label, 'evidence_sources.evidence_label'),
  };
}

function normalizeEvidenceSources(sources: CrmComplianceEvidenceSource[]): CrmComplianceEvidenceSource[] {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('evidence_sources must include at least one source for crm compliance views.');
  }
  const normalized = sources.map(normalizeEvidenceSource);
  const ids = normalized.map((source) => source.source_id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('evidence_sources must not repeat source_id for crm compliance views.');
  }
  return normalized;
}

export function registerCrmComplianceView(input: CrmComplianceViewInput): CrmComplianceViewReceipt {
  if (input.data_query_requested === true) {
    throw new Error('crm compliance views must not execute data queries.');
  }
  if (input.export_requested === true) {
    throw new Error('crm compliance views must not export data.');
  }
  if (input.frontend_render_requested === true) {
    throw new Error('crm compliance views must not render frontend views.');
  }
  if (input.irreversible_action_requested === true) {
    throw new Error('crm compliance views must not perform irreversible actions.');
  }

  const visibleFieldRefs = normalizeStringList(input.visible_field_refs, 'visible_field_refs', false);
  const prohibitedFieldRefs = normalizeStringList(input.prohibited_field_refs, 'prohibited_field_refs', true);
  const overlap = visibleFieldRefs.filter((field) => prohibitedFieldRefs.includes(field));
  if (overlap.length > 0) {
    throw new Error('visible_field_refs must not overlap prohibited_field_refs for crm compliance views.');
  }
  const evidenceSources = normalizeEvidenceSources(input.evidence_sources);

  return {
    seed_id: PHASE_6B_CRM_COMPLIANCE_VIEWS_SEED_ID,
    component_id: PHASE_6B_CRM_COMPLIANCE_VIEWS_COMPONENT_ID,
    event_name: CRM_COMPLIANCE_VIEW_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    compliance_view_id: requireNonEmpty(input.compliance_view_id, 'compliance_view_id'),
    view_name: requireNonEmpty(input.view_name, 'view_name'),
    audience: normalizeAudience(input.audience),
    pipeline_stage_model_ref: requireNonEmpty(input.pipeline_stage_model_ref, 'pipeline_stage_model_ref'),
    whatsapp_template_management_ref: requireNonEmpty(input.whatsapp_template_management_ref, 'whatsapp_template_management_ref'),
    optimization_fact_store_ref: requireNonEmpty(input.optimization_fact_store_ref, 'optimization_fact_store_ref'),
    lifecycle_status: normalizeLifecycleStatus(input.lifecycle_status),
    visible_field_refs: visibleFieldRefs,
    prohibited_field_refs: prohibitedFieldRefs,
    evidence_sources: evidenceSources,
    visible_field_count: visibleFieldRefs.length,
    prohibited_field_count: prohibitedFieldRefs.length,
    evidence_source_count: evidenceSources.length,
    data_query_allowed: false,
    export_allowed: false,
    frontend_render_allowed: false,
    irreversible_action_allowed: false,
    configured_by_user_id: requireNonEmpty(input.configured_by_user_id, 'configured_by_user_id'),
    configured_at: requireConfiguredAt(input.configured_at),
  };
}
