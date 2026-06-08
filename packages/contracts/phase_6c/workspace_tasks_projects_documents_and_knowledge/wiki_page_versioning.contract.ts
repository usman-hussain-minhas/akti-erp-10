export const PHASE_6C_WIKI_PAGE_VERSIONING_SEED_ID = "seed_6c_075_wiki_page_versioning" as const;
export const PHASE_6C_WIKI_PAGE_VERSIONING_COMPONENT_ID = "6C.06" as const;
export const WIKI_PAGE_VERSIONING_SCAFFOLD_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.wiki_page_versioning.scaffold_control_evaluated" as const;

export type WikiPageVersioningScaffoldInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  capability_execution_requested?: boolean;
  business_behavior_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type WikiPageVersioningScaffoldReceipt = {
  seed_id: typeof PHASE_6C_WIKI_PAGE_VERSIONING_SEED_ID;
  component_id: typeof PHASE_6C_WIKI_PAGE_VERSIONING_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CWikiPageVersioning";
  event_name: typeof WIKI_PAGE_VERSIONING_SCAFFOLD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  scaffold_status: 'SCAFFOLD_CONTROL_ONLY';
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  scaffold_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
