export const PHASE_6C_DOCUMENT_FOLDER_FILE_REF_SEED_ID = "seed_6c_077_document_folder_file_ref" as const;
export const PHASE_6C_DOCUMENT_FOLDER_FILE_REF_COMPONENT_ID = "6C.06" as const;
export const DOCUMENT_FOLDER_FILE_REF_SCAFFOLD_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.document_folder_file_ref.scaffold_control_evaluated" as const;

export type DocumentFolderFileRefScaffoldInput = {
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

export type DocumentFolderFileRefScaffoldReceipt = {
  seed_id: typeof PHASE_6C_DOCUMENT_FOLDER_FILE_REF_SEED_ID;
  component_id: typeof PHASE_6C_DOCUMENT_FOLDER_FILE_REF_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CDocumentFolderFileRef";
  event_name: typeof DOCUMENT_FOLDER_FILE_REF_SCAFFOLD_EVENT;
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
