export const PHASE_6C_OFFER_DOCUMENT_GENERATION_SEED_ID = 'seed_6c_020_offer_document_generation' as const;
export const PHASE_6C_OFFER_DOCUMENT_GENERATION_COMPONENT_ID = '6C.02' as const;
export const PHASE_6C_OFFER_DOCUMENT_GENERATION_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.offer_document_generation.request_ready' as const;

export type Phase6cOfferDocumentFormat = 'PDF' | 'DOCX';

export interface Phase6cOfferDocumentVariable {
  readonly variable_code: string;
  readonly value: string;
  readonly redacted_in_audit?: boolean;
}

export interface Phase6cOfferDocumentGenerationInput {
  readonly organization_id: string;
  readonly service_manifest_contract_id: string;
  readonly source_record_ref: string;
  readonly applicant_ref: string;
  readonly offer_ref: string;
  readonly template_ref: string;
  readonly template_version: string;
  readonly language_code: string;
  readonly output_format: Phase6cOfferDocumentFormat;
  readonly file_service_ref: string;
  readonly requested_by_user_id: string;
  readonly requested_at: string;
  readonly variables: readonly Phase6cOfferDocumentVariable[];
  readonly control_metadata?: Readonly<Record<string, string>>;
  readonly local_file_write_requested?: boolean;
  readonly direct_file_service_mutation_requested?: boolean;
  readonly non_6a_file_service_requested?: boolean;
  readonly schema_mutation_requested?: boolean;
  readonly phase_6a_mutation_requested?: boolean;
  readonly phase_6b_mutation_requested?: boolean;
  readonly runtime_adapter_requested?: boolean;
  readonly ticket_flag_flip_requested?: boolean;
}

export interface Phase6cOfferDocumentGenerationPayload {
  readonly source_record_ref: string;
  readonly applicant_ref: string;
  readonly offer_ref: string;
  readonly template_ref: string;
  readonly template_version: string;
  readonly output_format: Phase6cOfferDocumentFormat;
  readonly language_code: string;
  readonly variable_codes: readonly string[];
}

export interface Phase6cOfferDocumentGenerationReceipt {
  readonly seed_id: typeof PHASE_6C_OFFER_DOCUMENT_GENERATION_SEED_ID;
  readonly component_id: typeof PHASE_6C_OFFER_DOCUMENT_GENERATION_COMPONENT_ID;
  readonly event_name: typeof PHASE_6C_OFFER_DOCUMENT_GENERATION_EVENT;
  readonly runtime_status: 'OFFER_DOCUMENT_6A_FILE_SERVICE_REQUEST_READY';
  readonly organization_id: string;
  readonly service_manifest_contract_id: string;
  readonly file_service_ref: string;
  readonly file_service_only: true;
  readonly direct_file_mutation_allowed: false;
  readonly local_file_write_allowed: false;
  readonly non_6a_file_service_allowed: false;
  readonly schema_mutation_allowed: false;
  readonly phase_6a_mutation_allowed: false;
  readonly phase_6b_mutation_allowed: false;
  readonly ticket_flag_flip_allowed: false;
  readonly generation_payload: Phase6cOfferDocumentGenerationPayload;
  readonly variable_count: number;
  readonly redacted_variable_count: number;
  readonly evidence_artifacts: readonly string[];
  readonly decision_refs: readonly string[];
  readonly receipt_digest: string;
}
