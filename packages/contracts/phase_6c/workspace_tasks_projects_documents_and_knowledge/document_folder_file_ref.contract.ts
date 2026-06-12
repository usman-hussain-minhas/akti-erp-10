export const PHASE_6C_DOCUMENT_FOLDER_FILE_REF_SEED_ID = "seed_6c_077_document_folder_file_ref" as const;
export const PHASE_6C_DOCUMENT_FOLDER_FILE_REF_COMPONENT_ID = "6C.06" as const;
export const DOCUMENT_FOLDER_FILE_REF_EVALUATED_EVENT = "phase_6c.workspace_tasks_projects_documents_and_knowledge.document_folder_file_ref.evaluated" as const;

export const documentRefSources = ["6A_FILE_SERVICE"] as const;
export const documentFolderFileRefDecisions = ["DOCUMENT_REFS_READY", "DOCUMENT_REFS_REQUIRES_REVIEW", "DOCUMENT_REFS_REJECTED"] as const;

export type DocumentRefSource = (typeof documentRefSources)[number];
export type DocumentFolderFileRefDecision = (typeof documentFolderFileRefDecisions)[number];

export type DocumentFolderRefInput = {
  folder_ref: string;
  label: string;
  parent_folder_ref?: string;
};

export type DocumentFileRefInput = {
  file_ref: string;
  file_service_ref: string;
  folder_ref: string;
  display_name: string;
  mime_type: string;
  size_bytes?: number;
  checksum_sha256?: string;
  source: DocumentRefSource;
};

export type DocumentFolderFileRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref?: string;
  project_ref?: string;
  folders: readonly DocumentFolderRefInput[];
  files: readonly DocumentFileRefInput[];
  evidence_refs?: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  file_upload_requested?: boolean;
  file_binary_read_requested?: boolean;
  storage_mutation_requested?: boolean;
  external_provider_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  cross_phase_write_requested?: boolean;
  frontend_publication_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedDocumentFolderRef = {
  folder_ref: string;
  label: string;
  parent_folder_ref: string | null;
};

export type NormalizedDocumentFileRef = {
  file_ref: string;
  file_service_ref: string;
  folder_ref: string;
  display_name: string;
  mime_type: string;
  size_bytes: number | null;
  checksum_sha256: string | null;
  source: DocumentRefSource;
};

export type DocumentFolderFileRefReceipt = {
  seed_id: typeof PHASE_6C_DOCUMENT_FOLDER_FILE_REF_SEED_ID;
  component_id: typeof PHASE_6C_DOCUMENT_FOLDER_FILE_REF_COMPONENT_ID;
  component_slug: "workspace_tasks_projects_documents_and_knowledge";
  model_name: "Phase6CDocumentFolderFileRef";
  event_name: typeof DOCUMENT_FOLDER_FILE_REF_EVALUATED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string | null;
  project_ref: string | null;
  decision: DocumentFolderFileRefDecision;
  normalized_folders: readonly NormalizedDocumentFolderRef[];
  normalized_files: readonly NormalizedDocumentFileRef[];
  evidence_artifacts: readonly string[];
  review_reasons: readonly string[];
  rejection_reasons: readonly string[];
  decision_refs: readonly string[];
  file_service_boundary: "6A_FILE_SERVICE_ONLY";
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  file_upload_performed: false;
  file_binary_read_performed: false;
  storage_mutation_performed: false;
  external_provider_called: false;
  schema_mutation_performed: false;
  cross_phase_write_performed: false;
  frontend_publication_performed: false;
  ticket_flags_changed: false;
  document_folder_file_ref_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};
