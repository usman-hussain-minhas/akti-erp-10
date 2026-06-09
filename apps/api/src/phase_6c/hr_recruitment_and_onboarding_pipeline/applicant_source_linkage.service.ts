import { createHash } from 'node:crypto';

export const PHASE_6C_APPLICANT_SOURCE_LINKAGE_SEED_ID = "seed_6c_011_applicant_source_linkage" as const;
export const PHASE_6C_APPLICANT_SOURCE_LINKAGE_COMPONENT_ID = "6C.02" as const;
export const APPLICANT_SOURCE_LINKAGE_EVENT = "phase_6c.hr_recruitment_and_onboarding_pipeline.applicant_source_linkage.runtime_evaluated" as const;

export type ApplicantSourceType = 'DIRECT_HR_FORM' | 'CRM_LEAD';
export type ApplicantSourceLinkageStatus = 'DIRECT_SOURCE_LINKED' | 'CRM_SOURCE_LINKED';

export type ApplicantSourceLinkageRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  applicant_ref: string;
  applicant_person_anchor_ref?: string;
  source_type: ApplicantSourceType;
  direct_hr_form_ref?: string;
  crm_lead_ref?: string;
  crm_pipeline_ref?: string;
  control_metadata?: Record<string, unknown>;
  crm_lead_creation_requested?: boolean;
  crm_lead_mutation_requested?: boolean;
  employee_creation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ApplicantSourceLinkageReceipt = {
  seed_id: typeof PHASE_6C_APPLICANT_SOURCE_LINKAGE_SEED_ID;
  component_id: typeof PHASE_6C_APPLICANT_SOURCE_LINKAGE_COMPONENT_ID;
  component_slug: "hr_recruitment_and_onboarding_pipeline";
  model_name: "Phase6CApplicantSourceLinkage";
  event_name: typeof APPLICANT_SOURCE_LINKAGE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: ApplicantSourceLinkageStatus;
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  crm_dependency_condition: 'lead_sourced_applicant_active' | 'not_applicable';
  crm_mutation_allowed: false;
  employee_creation_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  applicant_ref: string;
  applicant_person_anchor_ref?: string;
  source_type: ApplicantSourceType;
  direct_hr_form_ref?: string;
  crm_lead_ref?: string;
  crm_pipeline_ref?: string;
  linkage_evidence_ref: string;
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for applicant_source_linkage runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for applicant_source_linkage runtime.');
  }
  return normalized;
}

function requireSourceType(value: ApplicantSourceType): ApplicantSourceType {
  if (value !== 'DIRECT_HR_FORM' && value !== 'CRM_LEAD') {
    throw new Error('source_type must be DIRECT_HR_FORM or CRM_LEAD for applicant_source_linkage runtime.');
  }
  return value;
}

function sha256(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function digestRuntime(receiptWithoutDigest: Omit<ApplicantSourceLinkageReceipt, 'runtime_evidence_digest'>): string {
  return sha256(receiptWithoutDigest);
}

export function evaluateApplicantSourceLinkageRuntime(input: ApplicantSourceLinkageRuntimeInput): ApplicantSourceLinkageReceipt {
  if (input.crm_lead_creation_requested === true) {
    throw new Error('applicant_source_linkage runtime must not create CRM leads.');
  }
  if (input.crm_lead_mutation_requested === true) {
    throw new Error('applicant_source_linkage runtime must not mutate CRM leads.');
  }
  if (input.employee_creation_requested === true) {
    throw new Error('applicant_source_linkage runtime must not create employees.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('applicant_source_linkage runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('applicant_source_linkage runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('applicant_source_linkage runtime must not mutate Phase 6B records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('applicant_source_linkage runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('applicant_source_linkage runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const sourceType = requireSourceType(input.source_type);
  const applicantRef = requireNonEmpty(input.applicant_ref, 'applicant_ref');
  const applicantPersonAnchorRef = input.applicant_person_anchor_ref === undefined ? undefined : requireNonEmpty(input.applicant_person_anchor_ref, 'applicant_person_anchor_ref');
  let directHrFormRef: string | undefined;
  let crmLeadRef: string | undefined;
  let crmPipelineRef: string | undefined;
  let runtimeStatus: ApplicantSourceLinkageStatus;
  let crmDependencyCondition: 'lead_sourced_applicant_active' | 'not_applicable';

  if (sourceType === 'DIRECT_HR_FORM') {
    directHrFormRef = requireNonEmpty(input.direct_hr_form_ref, 'direct_hr_form_ref');
    if (input.crm_lead_ref !== undefined || input.crm_pipeline_ref !== undefined) {
      throw new Error('DIRECT_HR_FORM applicant source must not carry CRM references for applicant_source_linkage runtime.');
    }
    runtimeStatus = 'DIRECT_SOURCE_LINKED';
    crmDependencyCondition = 'not_applicable';
  } else {
    crmLeadRef = requireNonEmpty(input.crm_lead_ref, 'crm_lead_ref');
    crmPipelineRef = requireNonEmpty(input.crm_pipeline_ref, 'crm_pipeline_ref');
    if (input.direct_hr_form_ref !== undefined) {
      throw new Error('CRM_LEAD applicant source must not carry direct HR form references for applicant_source_linkage runtime.');
    }
    runtimeStatus = 'CRM_SOURCE_LINKED';
    crmDependencyCondition = 'lead_sourced_applicant_active';
  }

  const linkageEvidencePayload = {
    applicant_ref: applicantRef,
    applicant_person_anchor_ref: applicantPersonAnchorRef,
    source_type: sourceType,
    direct_hr_form_ref: directHrFormRef,
    crm_lead_ref: crmLeadRef,
    crm_pipeline_ref: crmPipelineRef,
    evaluated_at: evaluatedAt,
  };

  const receiptWithoutDigest: Omit<ApplicantSourceLinkageReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_APPLICANT_SOURCE_LINKAGE_SEED_ID,
    component_id: PHASE_6C_APPLICANT_SOURCE_LINKAGE_COMPONENT_ID,
    component_slug: "hr_recruitment_and_onboarding_pipeline",
    model_name: "Phase6CApplicantSourceLinkage",
    event_name: APPLICANT_SOURCE_LINKAGE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: runtimeStatus,
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    crm_dependency_condition: crmDependencyCondition,
    crm_mutation_allowed: false,
    employee_creation_allowed: false,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-RECRUIT-001", "6C-RECRUIT-002", "6C-SCHEMA-006", "6C-NON-007"],
    applicant_ref: applicantRef,
    applicant_person_anchor_ref: applicantPersonAnchorRef,
    source_type: sourceType,
    direct_hr_form_ref: directHrFormRef,
    crm_lead_ref: crmLeadRef,
    crm_pipeline_ref: crmPipelineRef,
    linkage_evidence_ref: 'applicant_source_linkage_' + sha256(linkageEvidencePayload).slice(0, 24),
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
