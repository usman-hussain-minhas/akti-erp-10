export const PHASE_6C_OFFER_DOCUMENT_GENERATION_SEED_ID = "seed_6c_020_offer_document_generation" as const;
export const PHASE_6C_OFFER_DOCUMENT_GENERATION_COMPONENT_ID = "6C.02" as const;
export const OFFER_DOCUMENT_GENERATION_SCAFFOLD_EVENT = "phase_6c.hr_recruitment_and_onboarding_pipeline.offer_document_generation.scaffold_control_evaluated" as const;

export type OfferDocumentGenerationScaffoldInput = {
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

export type OfferDocumentGenerationScaffoldReceipt = {
  seed_id: typeof PHASE_6C_OFFER_DOCUMENT_GENERATION_SEED_ID;
  component_id: typeof PHASE_6C_OFFER_DOCUMENT_GENERATION_COMPONENT_ID;
  component_slug: "hr_recruitment_and_onboarding_pipeline";
  model_name: "Phase6COfferDocumentGeneration";
  event_name: typeof OFFER_DOCUMENT_GENERATION_SCAFFOLD_EVENT;
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
