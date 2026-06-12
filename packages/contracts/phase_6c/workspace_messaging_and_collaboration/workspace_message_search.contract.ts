export const PHASE_6C_WORKSPACE_MESSAGE_SEARCH_SEED_ID = "seed_6c_067_workspace_message_search" as const;
export const PHASE_6C_WORKSPACE_MESSAGE_SEARCH_COMPONENT_ID = "6C.05" as const;
export const WORKSPACE_MESSAGE_SEARCH_EVALUATED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.workspace_message_search.evaluated" as const;

export type WorkspaceMessageSearchDecision = "SEARCH_READY" | "SEARCH_NO_MATCHES" | "SEARCH_REQUIRES_REVIEW";

export type WorkspaceMessageSearchFilters = {
  channel_refs?: string[];
  author_user_refs?: string[];
  created_from?: string;
  created_to?: string;
  include_file_refs: boolean;
};

export type WorkspaceMessageSearchRecord = {
  message_ref: string;
  conversation_ref: string;
  channel_ref: string;
  author_user_ref: string;
  body_text: string;
  created_at: string;
  edited_at?: string;
  file_refs: string[];
  search_layer_evidence_ref: string;
};

export type WorkspaceMessageSearchInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  query_ref: string;
  query_text: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  access_filter_ref: string;
  allowed_channel_refs: string[];
  filters: WorkspaceMessageSearchFilters;
  records: WorkspaceMessageSearchRecord[];
  external_search_runtime_requested?: boolean;
  search_index_mutation_requested?: boolean;
  file_layer_mutation_requested?: boolean;
  direct_cross_module_query_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type WorkspaceMessageSearchResult = {
  message_ref: string;
  conversation_ref: string;
  channel_ref: string;
  author_user_ref: string;
  score: number;
  matched_terms: string[];
  snippet: string;
  file_refs: string[];
  search_layer_evidence_ref: string;
};

export type WorkspaceMessageSearchReceipt = {
  seed_id: typeof PHASE_6C_WORKSPACE_MESSAGE_SEARCH_SEED_ID;
  component_id: typeof PHASE_6C_WORKSPACE_MESSAGE_SEARCH_COMPONENT_ID;
  event_name: typeof WORKSPACE_MESSAGE_SEARCH_EVALUATED_EVENT;
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  query_ref: string;
  decision: WorkspaceMessageSearchDecision;
  normalized_terms: string[];
  scanned_record_count: number;
  accessible_record_count: number;
  result_count: number;
  results: WorkspaceMessageSearchResult[];
  review_reasons: string[];
  external_search_runtime_performed: false;
  search_index_mutation_performed: false;
  file_layer_mutation_performed: false;
  direct_cross_module_query_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  event_dispatch_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-013", "6C-GLOBAL-018"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};
