export const PHASE_6C_WIKI_RESTORE_SEED_ID = "seed_6c_076_wiki_restore" as const;
export const PHASE_6C_WIKI_RESTORE_COMPONENT_ID = "6C.06" as const;
export const WIKI_RESTORE_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.wiki_restore.evaluated" as const;

export const wikiRestoreModes = ["CREATE_NEW_VERSION_FROM_PRIOR"] as const;
export const wikiRestoreDecisions = ["WIKI_RESTORE_READY", "WIKI_RESTORE_REQUIRES_REVIEW", "WIKI_RESTORE_REJECTED"] as const;

export type WikiRestoreMode = (typeof wikiRestoreModes)[number];
export type WikiRestoreDecision = (typeof wikiRestoreDecisions)[number];

export type WikiRestoreVersionSnapshot = {
  version_number: number;
  content_hash: string;
  author_user_ref: string;
  created_at: string;
  is_current?: boolean;
};

export type WikiRestoreInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  page_ref: string;
  current_version_number: number;
  target_version_number: number;
  restore_mode: WikiRestoreMode;
  restore_reason: string;
  requested_by_user_ref: string;
  reviewer_user_ref?: string;
  require_reviewer?: boolean;
  version_snapshots: readonly WikiRestoreVersionSnapshot[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  overwrite_current_requested?: boolean;
  history_deletion_requested?: boolean;
  restore_execution_requested?: boolean;
  persistence_requested?: boolean;
  frontend_publication_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedWikiRestoreVersionSnapshot = {
  version_number: number;
  content_hash: string;
  author_user_ref: string;
  created_at: string;
  is_current: boolean;
};

export type WikiRestoreReceipt = {
  seed_id: typeof PHASE_6C_WIKI_RESTORE_SEED_ID;
  component_id: typeof PHASE_6C_WIKI_RESTORE_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CWikiRestore";
  event_name: typeof WIKI_RESTORE_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  page_ref: string;
  decision: WikiRestoreDecision;
  current_version_number: number;
  target_version_number: number;
  restore_mode: WikiRestoreMode;
  restore_reason: string;
  requested_by_user_ref: string;
  reviewer_user_ref: string | null;
  normalized_version_snapshots: readonly NormalizedWikiRestoreVersionSnapshot[];
  evidence_artifacts: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  customer_first_restore_policy: "CREATE_NEW_VERSION_ONLY";
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  restore_executed: false;
  persistence_performed: false;
  overwrite_current_performed: false;
  history_deletion_performed: false;
  frontend_publication_performed: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  ticket_flags_changed: false;
  wiki_restore_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
