export const PHASE_6C_E2E_ENCRYPTION_BOUNDARY_SEED_ID = "seed_6c_069_e2e_encryption_boundary" as const;
export const PHASE_6C_E2E_ENCRYPTION_BOUNDARY_COMPONENT_ID = "6C.05" as const;
export const E2E_ENCRYPTION_BOUNDARY_EVALUATED_EVENT =
  "phase_6c.workspace_messaging_and_collaboration.e2e_encryption_boundary.evaluated" as const;

export type E2eBoundaryMode = "DISABLED" | "OPTIONAL" | "REQUIRED";
export type E2eEnvelopeState = "PLAINTEXT" | "ENCRYPTED";
export type E2eBoundaryDecision = "E2E_BOUNDARY_ACCEPTED" | "E2E_BOUNDARY_REQUIRES_REVIEW" | "E2E_BOUNDARY_REJECTED";

export type E2eBoundaryPolicy = {
  policy_ref: string;
  mode: E2eBoundaryMode;
  accepted_algorithms: string[];
  require_device_key_ref: boolean;
};

export type E2eMessageEnvelope = {
  message_ref: string;
  conversation_ref: string;
  envelope_state: E2eEnvelopeState;
  algorithm?: string;
  sender_device_key_ref?: string;
  recipient_device_key_refs: string[];
  ciphertext_digest?: string;
  plaintext_body?: string;
  boundary_evidence_ref: string;
};

export type E2eEncryptionBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  workspace_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  policy: E2eBoundaryPolicy;
  envelopes: E2eMessageEnvelope[];
  key_generation_requested?: boolean;
  decryption_requested?: boolean;
  encryption_requested?: boolean;
  key_storage_requested?: boolean;
  plaintext_persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  event_dispatch_requested?: boolean;
  frontend_route_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type E2eEnvelopeEvaluation = {
  message_ref: string;
  conversation_ref: string;
  envelope_state: E2eEnvelopeState;
  accepted: boolean;
  algorithm?: string;
  sender_device_key_ref?: string;
  recipient_device_key_count: number;
  ciphertext_digest?: string;
  review_reasons: string[];
  rejection_reasons: string[];
  boundary_evidence_ref: string;
};

export type E2eEncryptionBoundaryReceipt = {
  seed_id: typeof PHASE_6C_E2E_ENCRYPTION_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_E2E_ENCRYPTION_BOUNDARY_COMPONENT_ID;
  event_name: typeof E2E_ENCRYPTION_BOUNDARY_EVALUATED_EVENT;
  organization_id: string;
  source_record_ref: string;
  workspace_ref: string;
  policy_ref: string;
  decision: E2eBoundaryDecision;
  evaluated_envelope_count: number;
  accepted_envelope_count: number;
  review_envelope_count: number;
  rejected_envelope_count: number;
  envelope_evaluations: E2eEnvelopeEvaluation[];
  key_generation_performed: false;
  decryption_performed: false;
  encryption_performed: false;
  key_storage_performed: false;
  plaintext_persistence_performed: false;
  runtime_adapter_performed: false;
  schema_mutation_performed: false;
  phase_6a_mutation_performed: false;
  phase_6b_mutation_performed: false;
  event_dispatch_performed: false;
  frontend_route_performed: false;
  ticket_flag_flip_performed: false;
  decision_refs: readonly ["6C-WORK-MSG-003", "6C-GLOBAL-018"];
  evidence_artifacts: string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  deterministic_digest: string;
};
