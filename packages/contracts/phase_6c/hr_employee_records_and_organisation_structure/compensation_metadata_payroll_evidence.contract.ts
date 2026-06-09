export const PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_SEED_ID = "seed_6c_007_compensation_metadata_payroll_evidence" as const;
export const PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_COMPONENT_ID = "6C.01" as const;
export const COMPENSATION_METADATA_PAYROLL_EVIDENCE_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.compensation_metadata_payroll_evidence.runtime_evaluated" as const;

export type CompensationPayBasis = 'SALARY' | 'HOURLY' | 'STIPEND' | 'COMMISSION_ELIGIBLE';
export type CompensationEvidenceStatus = 'ACTIVE' | 'SCHEDULED' | 'ENDED';

export type CompensationMetadataRecord = {
  compensation_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  compensation_policy_ref: string;
  pay_basis: CompensationPayBasis;
  amount_minor_units: number;
  currency_code: string;
  effective_from: string;
  effective_to?: string;
};

export type PayrollEvidenceEnvelope = {
  payroll_evidence_ref: string;
  compensation_ref: string;
  employee_record_ref: string;
  evidence_target: 'PHASE_6B_PAYROLL_REFERENCE';
  evidence_mode: 'REFERENCE_ONLY';
  evidence_hash: string;
};

export type CompensationMetadataPayrollEvidenceRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  compensation_records: readonly CompensationMetadataRecord[];
  control_metadata?: Record<string, unknown>;
  payroll_calculation_requested?: boolean;
  payroll_run_generation_requested?: boolean;
  payment_disbursement_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedCompensationMetadataRecord = CompensationMetadataRecord & {
  evidence_status: CompensationEvidenceStatus;
};

export type CompensationMetadataPayrollEvidenceRuntimeReceipt = {
  seed_id: typeof PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CCompensationMetadataPayrollEvidence";
  event_name: typeof COMPENSATION_METADATA_PAYROLL_EVIDENCE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'COMPENSATION_PAYROLL_EVIDENCE_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  payroll_ownership_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  compensation_records: readonly NormalizedCompensationMetadataRecord[];
  payroll_evidence_envelopes: readonly PayrollEvidenceEnvelope[];
  evidence_counts: {
    total_records: number;
    active_records: number;
    scheduled_records: number;
    ended_records: number;
    payroll_reference_envelopes: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
