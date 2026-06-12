export const PHASE_6C_WIKI_PAGE_VERSIONING_SEED_ID = "seed_6c_075_wiki_page_versioning" as const;
export const PHASE_6C_WIKI_PAGE_VERSIONING_COMPONENT_ID = "6C.06" as const;
export const WIKI_PAGE_VERSIONING_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.wiki_page_versioning.evaluated" as const;

export const wikiPageVersionChangeTypes = ["CREATE", "UPDATE", "PUBLISH", "RESTORE"] as const;
export const wikiPageVersioningDecisions = ["WIKI_VERSION_HISTORY_READY", "WIKI_VERSION_HISTORY_REQUIRES_REVIEW", "WIKI_VERSION_HISTORY_REJECTED"] as const;

export type WikiPageVersionChangeType = (typeof wikiPageVersionChangeTypes)[number];
export type WikiPageVersioningDecision = (typeof wikiPageVersioningDecisions)[number];

export type WikiPageVersionInput = {
  version_number: number;
  title: string;
  content: string;
  author_user_ref: string;
  created_at: string;
  change_type: WikiPageVersionChangeType;
  change_summary?: string;
  published?: boolean;
  restored_from_version_number?: number;
  evidence_refs?: readonly string[];
};

export type WikiPageVersioningInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  page_ref: string;
  current_version_number: number;
  versions: readonly WikiPageVersionInput[];
  restore_candidate_version_number?: number;
  evaluated_by_user_id: string;
  evaluated_at: string;
  persistence_requested?: boolean;
  restore_execution_requested?: boolean;
  realtime_collaboration_requested?: boolean;
  frontend_editor_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedWikiPageVersion = {
  version_number: number;
  title: string;
  content_hash: string;
  author_user_ref: string;
  created_at: string;
  change_type: WikiPageVersionChangeType;
  change_summary: string | null;
  published: boolean;
  restored_from_version_number: number | null;
  evidence_refs: readonly string[];
};

export type WikiPageVersioningReceipt = {
  seed_id: typeof PHASE_6C_WIKI_PAGE_VERSIONING_SEED_ID;
  component_id: typeof PHASE_6C_WIKI_PAGE_VERSIONING_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CWikiPageVersioning";
  event_name: typeof WIKI_PAGE_VERSIONING_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  page_ref: string;
  decision: WikiPageVersioningDecision;
  current_version_number: number;
  normalized_versions: readonly NormalizedWikiPageVersion[];
  restore_candidate_version_number: number | null;
  restore_candidate_available: boolean;
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  persistence_performed: false;
  restore_executed: false;
  realtime_collaboration_enabled: false;
  frontend_editor_published: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  ticket_flags_changed: false;
  wiki_page_versioning_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
