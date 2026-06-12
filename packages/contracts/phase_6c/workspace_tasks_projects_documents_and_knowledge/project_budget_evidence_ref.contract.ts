export const PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_SEED_ID = "seed_6c_074_project_budget_evidence_ref" as const;
export const PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_COMPONENT_ID = "6C.06" as const;
export const PROJECT_BUDGET_EVIDENCE_REF_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.project_budget_evidence_ref.evaluated" as const;

export const projectBudgetEvidenceTypes = ["BUDGET_RECORD", "BUDGET_LINE", "SPEND_EVIDENCE", "APPROVAL_EVIDENCE"] as const;
export const projectBudgetEvidenceDecisions = ["PROJECT_BUDGET_EVIDENCE_READY", "PROJECT_BUDGET_EVIDENCE_REQUIRES_REVIEW", "PROJECT_BUDGET_EVIDENCE_REJECTED"] as const;

export type ProjectBudgetEvidenceType = (typeof projectBudgetEvidenceTypes)[number];
export type ProjectBudgetEvidenceDecision = (typeof projectBudgetEvidenceDecisions)[number];

export type ProjectBudgetEvidenceRefInput = {
  evidence_ref: string;
  finance_source_ref: string;
  evidence_type: ProjectBudgetEvidenceType;
  amount_minor_units?: number;
  currency_code?: string;
  captured_at?: string;
  read_model_version?: string;
};

export type ProjectBudgetEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  project_ref: string;
  budget_context_ref: string;
  evidence_refs: readonly ProjectBudgetEvidenceRefInput[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  finance_write_requested?: boolean;
  budget_allocation_requested?: boolean;
  payment_posting_requested?: boolean;
  reconciliation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedProjectBudgetEvidenceRef = {
  evidence_ref: string;
  finance_source_ref: string;
  evidence_type: ProjectBudgetEvidenceType;
  amount_minor_units: number | null;
  currency_code: string | null;
  captured_at: string | null;
  read_model_version: string | null;
};

export type ProjectBudgetEvidenceReceipt = {
  seed_id: typeof PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_SEED_ID;
  component_id: typeof PHASE_6C_PROJECT_BUDGET_EVIDENCE_REF_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CProjectBudgetEvidenceRef";
  event_name: typeof PROJECT_BUDGET_EVIDENCE_REF_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  project_ref: string;
  budget_context_ref: string;
  decision: ProjectBudgetEvidenceDecision;
  normalized_evidence_refs: readonly NormalizedProjectBudgetEvidenceRef[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  read_only_finance_reference: true;
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  finance_write_performed: false;
  budget_allocation_performed: false;
  payment_posting_performed: false;
  reconciliation_performed: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  project_budget_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
