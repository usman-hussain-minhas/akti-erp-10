export const PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_SEED_ID = 'seed_6c_122_post_event_resource_file_ref' as const;
export const PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_COMPONENT_ID = '6C.09' as const;
export const POST_EVENT_RESOURCE_FILE_REF_RUNTIME_EVENT = 'phase_6c.events_check_in_and_post_event_service.post_event_resource_file_ref.runtime_evaluated' as const;

export type PostEventResourceVisibility = 'attendees_only' | 'registrants' | 'public_link';
export type PostEventResourceDecision = 'RESOURCE_FILE_REFS_READY' | 'RESOURCE_FILE_REFS_REQUIRE_REVIEW' | 'RESOURCE_FILE_REFS_REJECTED_EMPTY' | 'RESOURCE_FILE_REFS_REJECTED_WINDOW_CLOSED';

export type PostEventResourceFileRef = {
  file_ref: string;
  title: string;
  content_type: string;
  checksum_digest?: string;
  visibility: PostEventResourceVisibility;
  available_from?: string;
  available_until?: string;
};

export type PostEventResourceFileRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  resources: readonly PostEventResourceFileRef[];
  control_metadata?: Record<string, unknown>;
  file_upload_requested?: boolean;
  file_storage_requested?: boolean;
  file_mutation_requested?: boolean;
  public_url_generation_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type PostEventResourceFileRefRuntimeReceipt = {
  seed_id: typeof PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_SEED_ID;
  component_id: typeof PHASE_6C_POST_EVENT_RESOURCE_FILE_REF_COMPONENT_ID;
  component_slug: 'events_check_in_and_post_event_service';
  model_name: 'Phase6CPostEventResourceFileRef';
  event_name: typeof POST_EVENT_RESOURCE_FILE_REF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_ref: string;
  source_record_ref: string;
  decision: PostEventResourceDecision;
  ready_file_refs: readonly string[];
  review_file_refs: readonly string[];
  resource_count: number;
  rejection_reasons: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
};
