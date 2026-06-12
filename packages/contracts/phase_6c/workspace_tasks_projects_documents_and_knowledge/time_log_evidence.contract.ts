export const PHASE_6C_TIME_LOG_EVIDENCE_SEED_ID = "seed_6c_078_time_log_evidence" as const;
export const PHASE_6C_TIME_LOG_EVIDENCE_COMPONENT_ID = "6C.06" as const;
export const TIME_LOG_EVIDENCE_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.time_log_evidence.evaluated" as const;

export const timeLogWorkTypes = ["PROJECT_WORK", "TASK_WORK", "MEETING", "RESEARCH", "ADMIN"] as const;
export const timeLogBillingDimensionStates = ["NON_BILLABLE", "BILLING_CANDIDATE"] as const;
export const timeLogEvidenceDecisions = ["TIME_LOG_EVIDENCE_READY", "TIME_LOG_EVIDENCE_REQUIRES_REVIEW", "TIME_LOG_EVIDENCE_REJECTED"] as const;

export type TimeLogWorkType = (typeof timeLogWorkTypes)[number];
export type TimeLogBillingDimensionState = (typeof timeLogBillingDimensionStates)[number];
export type TimeLogEvidenceDecision = (typeof timeLogEvidenceDecisions)[number];

export type TimeLogEntryInput = {
  time_log_ref: string;
  subject_user_ref: string;
  project_ref?: string;
  task_ref?: string;
  work_type: TimeLogWorkType;
  billing_dimension_state: TimeLogBillingDimensionState;
  billing_dimension_refs?: readonly string[];
  start_at: string;
  end_at: string;
  duration_minutes?: number;
  evidence_refs?: readonly string[];
};

export type TimeLogEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  entries: readonly TimeLogEntryInput[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  invoice_generation_requested?: boolean;
  payroll_write_requested?: boolean;
  finance_write_requested?: boolean;
  timer_adapter_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedTimeLogEntry = {
  time_log_ref: string;
  subject_user_ref: string;
  project_ref: string | null;
  task_ref: string | null;
  work_type: TimeLogWorkType;
  billing_dimension_state: TimeLogBillingDimensionState;
  billing_dimension_refs: readonly string[];
  start_at: string;
  end_at: string;
  duration_minutes: number;
  evidence_refs: readonly string[];
};

export type TimeLogEvidenceReceipt = {
  seed_id: typeof PHASE_6C_TIME_LOG_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_TIME_LOG_EVIDENCE_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CTimeLogEvidence";
  event_name: typeof TIME_LOG_EVIDENCE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  decision: TimeLogEvidenceDecision;
  normalized_entries: readonly NormalizedTimeLogEntry[];
  total_duration_minutes: number;
  billing_candidate_minutes: number;
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  future_billing_evidence_only: true;
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  invoice_generated: false;
  payroll_written: false;
  finance_write_performed: false;
  timer_adapter_invoked: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  time_log_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
