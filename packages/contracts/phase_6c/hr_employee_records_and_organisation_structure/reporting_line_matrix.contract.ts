export const PHASE_6C_REPORTING_LINE_MATRIX_SEED_ID = "seed_6c_004_reporting_line_matrix" as const;
export const PHASE_6C_REPORTING_LINE_MATRIX_COMPONENT_ID = "6C.01" as const;
export const REPORTING_LINE_MATRIX_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.reporting_line_matrix.runtime_evaluated" as const;

export type ReportingLineType = 'PRIMARY' | 'DOTTED';
export type ReportingLineStatus = 'ACTIVE' | 'SCHEDULED' | 'ENDED';

export type ReportingLineDefinition = {
  line_ref: string;
  employee_record_ref: string;
  manager_employee_record_ref: string;
  line_type: ReportingLineType;
  effective_from: string;
  effective_to?: string;
};

export type ReportingLineMatrixRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  reporting_lines: readonly ReportingLineDefinition[];
  control_metadata?: Record<string, unknown>;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedReportingLine = ReportingLineDefinition & {
  line_status: ReportingLineStatus;
};

export type ReportingLineMatrixRuntimeReceipt = {
  seed_id: typeof PHASE_6C_REPORTING_LINE_MATRIX_SEED_ID;
  component_id: typeof PHASE_6C_REPORTING_LINE_MATRIX_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CReportingLineMatrix";
  event_name: typeof REPORTING_LINE_MATRIX_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'REPORTING_LINE_MATRIX_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  reporting_lines: readonly NormalizedReportingLine[];
  matrix_counts: {
    total_lines: number;
    active_lines: number;
    active_primary_lines: number;
    active_dotted_lines: number;
    employees_with_active_primary_manager: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
