export const PHASE_6C_SPEAKER_HONORARIUM_REF_SEED_ID = "seed_6c_098_speaker_honorarium_ref" as const;
export const PHASE_6C_SPEAKER_HONORARIUM_REF_COMPONENT_ID = "6C.08" as const;
export const SPEAKER_HONORARIUM_REF_SCAFFOLD_EVENT = "phase_6c.events_configuration_and_registration_service.speaker_honorarium_ref.scaffold_control_evaluated" as const;

export type SpeakerHonorariumRefScaffoldInput = {
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

export type SpeakerHonorariumRefScaffoldReceipt = {
  seed_id: typeof PHASE_6C_SPEAKER_HONORARIUM_REF_SEED_ID;
  component_id: typeof PHASE_6C_SPEAKER_HONORARIUM_REF_COMPONENT_ID;
  component_slug: "events_configuration_and_registration_service";
  model_name: "Phase6CSpeakerHonorariumRef";
  event_name: typeof SPEAKER_HONORARIUM_REF_SCAFFOLD_EVENT;
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
