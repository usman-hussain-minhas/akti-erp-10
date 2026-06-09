export const PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_SEED_ID = "seed_6c_005_employment_contract_record" as const;
export const PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_COMPONENT_ID = "6C.01" as const;
export const EMPLOYMENT_CONTRACT_RECORD_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employment_contract_record.runtime_evaluated" as const;

export type EmploymentContractType = 'PERMANENT' | 'FIXED_TERM' | 'PROBATION' | 'CONSULTANT' | 'INTERN';
export type EmploymentContractStatus = 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'SUPERSEDED';

export type EmploymentContractRecord = {
  contract_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  contract_type: EmploymentContractType;
  version: number;
  effective_from: string;
  effective_to?: string;
  signed_at?: string;
  probation_end_at?: string;
  renewal_notice_days?: number;
  compensation_policy_ref?: string;
  document_evidence_ref: string;
};

export type EmploymentContractRecordRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  contracts: readonly EmploymentContractRecord[];
  control_metadata?: Record<string, unknown>;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedEmploymentContractRecord = EmploymentContractRecord & {
  contract_status: EmploymentContractStatus;
};

export type EmploymentContractRecordRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmploymentContractRecord";
  event_name: typeof EMPLOYMENT_CONTRACT_RECORD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYMENT_CONTRACT_RECORD_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  contracts: readonly NormalizedEmploymentContractRecord[];
  contract_counts: {
    total_contracts: number;
    active_contracts: number;
    scheduled_contracts: number;
    expired_contracts: number;
    signed_contracts: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
