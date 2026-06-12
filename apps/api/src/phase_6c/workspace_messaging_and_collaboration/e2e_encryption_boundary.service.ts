import { createHash } from "crypto";

type E2eBoundaryMode = "DISABLED" | "OPTIONAL" | "REQUIRED";
type E2eEnvelopeState = "PLAINTEXT" | "ENCRYPTED";
type E2eBoundaryDecision = "E2E_BOUNDARY_ACCEPTED" | "E2E_BOUNDARY_REQUIRES_REVIEW" | "E2E_BOUNDARY_REJECTED";

type E2eBoundaryPolicy = {
  policy_ref: string;
  mode: E2eBoundaryMode;
  accepted_algorithms: string[];
  require_device_key_ref: boolean;
};

type E2eMessageEnvelope = {
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

type E2eEnvelopeEvaluation = {
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
  seed_id: "seed_6c_069_e2e_encryption_boundary";
  component_id: "6C.05";
  event_name: "phase_6c.workspace_messaging_and_collaboration.e2e_encryption_boundary.evaluated";
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

const SEED_ID = "seed_6c_069_e2e_encryption_boundary" as const;
const COMPONENT_ID = "6C.05" as const;
const EVENT_NAME = "phase_6c.workspace_messaging_and_collaboration.e2e_encryption_boundary.evaluated" as const;
const DECISION_REFS = ["6C-WORK-MSG-003", "6C-GLOBAL-018"] as const;
const MODES = new Set<E2eBoundaryMode>(["DISABLED", "OPTIONAL", "REQUIRED"]);
const STATES = new Set<E2eEnvelopeState>(["PLAINTEXT", "ENCRYPTED"]);
const HEX_256 = /^[a-f0-9]{64}$/i;

export function evaluateE2eEncryptionBoundary(input: E2eEncryptionBoundaryInput): E2eEncryptionBoundaryReceipt {
  assertNoForbiddenRuntimeRequest(input);
  validateInput(input);

  const policy = normalizePolicy(input.policy);
  const evaluations = input.envelopes
    .map((envelope) => evaluateEnvelope(policy, envelope))
    .sort((a, b) => a.message_ref.localeCompare(b.message_ref));
  const rejectedCount = evaluations.filter((evaluation) => evaluation.rejection_reasons.length > 0).length;
  const reviewCount = evaluations.filter(
    (evaluation) => evaluation.rejection_reasons.length === 0 && evaluation.review_reasons.length > 0,
  ).length;
  const acceptedCount = evaluations.filter((evaluation) => evaluation.accepted).length;
  const decision = decide(acceptedCount, reviewCount, rejectedCount);
  const evidenceArtifacts = [
    `${SEED_ID}:workspace:${input.workspace_ref.trim()}`,
    `${SEED_ID}:policy:${policy.policy_ref}`,
    `${SEED_ID}:accepted:${acceptedCount}`,
    `${SEED_ID}:review:${reviewCount}`,
    `${SEED_ID}:rejected:${rejectedCount}`,
    ...evaluations.map((evaluation) => `${SEED_ID}:message:${evaluation.message_ref}:${evaluation.envelope_state}`),
  ];
  const digestPayload = {
    organization_id: input.organization_id.trim(),
    workspace_ref: input.workspace_ref.trim(),
    policy,
    decision,
    evaluations,
  };

  return {
    seed_id: SEED_ID,
    component_id: COMPONENT_ID,
    event_name: EVENT_NAME,
    organization_id: input.organization_id.trim(),
    source_record_ref: input.source_record_ref.trim(),
    workspace_ref: input.workspace_ref.trim(),
    policy_ref: policy.policy_ref,
    decision,
    evaluated_envelope_count: evaluations.length,
    accepted_envelope_count: acceptedCount,
    review_envelope_count: reviewCount,
    rejected_envelope_count: rejectedCount,
    envelope_evaluations: evaluations,
    key_generation_performed: false,
    decryption_performed: false,
    encryption_performed: false,
    key_storage_performed: false,
    plaintext_persistence_performed: false,
    runtime_adapter_performed: false,
    schema_mutation_performed: false,
    phase_6a_mutation_performed: false,
    phase_6b_mutation_performed: false,
    event_dispatch_performed: false,
    frontend_route_performed: false,
    ticket_flag_flip_performed: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: dedupeStrings(evidenceArtifacts),
    evaluated_by_user_id: input.evaluated_by_user_id.trim(),
    evaluated_at: new Date(input.evaluated_at).toISOString(),
    deterministic_digest: digest(digestPayload),
  };
}

function evaluateEnvelope(policy: E2eBoundaryPolicy, envelope: E2eMessageEnvelope): E2eEnvelopeEvaluation {
  validateEnvelope(envelope);
  const reviewReasons: string[] = [];
  const rejectionReasons: string[] = [];
  const recipientKeys = dedupeStrings(envelope.recipient_device_key_refs);
  const algorithm = envelope.algorithm?.trim();
  const ciphertextDigest = envelope.ciphertext_digest?.trim().toLowerCase();

  if (policy.mode === "DISABLED" && envelope.envelope_state === "ENCRYPTED") {
    reviewReasons.push("encrypted_envelope_present_while_boundary_disabled");
  }
  if (policy.mode === "REQUIRED" && envelope.envelope_state !== "ENCRYPTED") {
    rejectionReasons.push("encrypted_envelope_required_by_policy");
  }
  if (envelope.plaintext_body !== undefined && envelope.plaintext_body.trim().length > 0) {
    rejectionReasons.push("plaintext_body_present_at_e2e_boundary");
  }
  if (envelope.envelope_state === "ENCRYPTED") {
    if (!algorithm) {
      rejectionReasons.push("encrypted_envelope_missing_algorithm");
    } else if (!policy.accepted_algorithms.includes(algorithm)) {
      reviewReasons.push("algorithm_not_in_policy_allowlist");
    }
    if (!ciphertextDigest || !HEX_256.test(ciphertextDigest)) {
      rejectionReasons.push("encrypted_envelope_missing_ciphertext_digest");
    }
    if (policy.require_device_key_ref && !envelope.sender_device_key_ref?.trim()) {
      rejectionReasons.push("sender_device_key_ref_required_by_policy");
    }
    if (policy.require_device_key_ref && recipientKeys.length === 0) {
      rejectionReasons.push("recipient_device_key_refs_required_by_policy");
    }
  }

  return {
    message_ref: envelope.message_ref.trim(),
    conversation_ref: envelope.conversation_ref.trim(),
    envelope_state: envelope.envelope_state,
    accepted: rejectionReasons.length === 0 && reviewReasons.length === 0,
    algorithm,
    sender_device_key_ref: envelope.sender_device_key_ref?.trim(),
    recipient_device_key_count: recipientKeys.length,
    ciphertext_digest: ciphertextDigest,
    review_reasons: reviewReasons.sort(),
    rejection_reasons: rejectionReasons.sort(),
    boundary_evidence_ref: envelope.boundary_evidence_ref.trim(),
  };
}

function decide(acceptedCount: number, reviewCount: number, rejectedCount: number): E2eBoundaryDecision {
  if (rejectedCount > 0) {
    return "E2E_BOUNDARY_REJECTED";
  }
  if (reviewCount > 0 || acceptedCount === 0) {
    return "E2E_BOUNDARY_REQUIRES_REVIEW";
  }
  return "E2E_BOUNDARY_ACCEPTED";
}

function validateInput(input: E2eEncryptionBoundaryInput): void {
  const requiredFields: Array<keyof E2eEncryptionBoundaryInput> = [
    "organization_id",
    "service_manifest_contract_id",
    "source_record_ref",
    "workspace_ref",
    "evaluated_by_user_id",
    "evaluated_at",
  ];
  for (const field of requiredFields) {
    assertNonEmptyString(input[field], field);
  }
  if (Number.isNaN(Date.parse(input.evaluated_at))) {
    throw new Error("evaluated_at must be an ISO-compatible timestamp");
  }
  validatePolicy(input.policy);
  if (!Array.isArray(input.envelopes) || input.envelopes.length === 0) {
    throw new Error("envelopes must contain at least one message envelope");
  }
}

function validatePolicy(policy: E2eBoundaryPolicy): void {
  assertNonEmptyString(policy?.policy_ref, "policy.policy_ref");
  if (!MODES.has(policy.mode)) {
    throw new Error("policy.mode is not supported");
  }
  validateStringArray(policy.accepted_algorithms, "policy.accepted_algorithms");
  if (typeof policy.require_device_key_ref !== "boolean") {
    throw new Error("policy.require_device_key_ref must be boolean");
  }
}

function validateEnvelope(envelope: E2eMessageEnvelope): void {
  assertNonEmptyString(envelope.message_ref, "envelope.message_ref");
  assertNonEmptyString(envelope.conversation_ref, "envelope.conversation_ref");
  if (!STATES.has(envelope.envelope_state)) {
    throw new Error("envelope.envelope_state is not supported");
  }
  validateStringArray(envelope.recipient_device_key_refs, "envelope.recipient_device_key_refs");
  assertNonEmptyString(envelope.boundary_evidence_ref, "envelope.boundary_evidence_ref");
}

function normalizePolicy(policy: E2eBoundaryPolicy): E2eBoundaryPolicy {
  return {
    policy_ref: policy.policy_ref.trim(),
    mode: policy.mode,
    accepted_algorithms: dedupeStrings(policy.accepted_algorithms),
    require_device_key_ref: policy.require_device_key_ref,
  };
}

function assertNoForbiddenRuntimeRequest(input: E2eEncryptionBoundaryInput): void {
  const forbidden: Array<[keyof E2eEncryptionBoundaryInput, string]> = [
    ["key_generation_requested", "key generation is outside this FFET"],
    ["decryption_requested", "decryption is outside this FFET"],
    ["encryption_requested", "payload encryption is outside this FFET"],
    ["key_storage_requested", "key storage is outside this FFET"],
    ["plaintext_persistence_requested", "plaintext persistence is outside this FFET"],
    ["runtime_adapter_requested", "runtime adapter execution is outside this FFET"],
    ["schema_mutation_requested", "schema mutation is outside this FFET"],
    ["phase_6a_mutation_requested", "Phase 6A mutation is outside this FFET"],
    ["phase_6b_mutation_requested", "Phase 6B mutation is outside this FFET"],
    ["event_dispatch_requested", "event dispatch is outside this FFET"],
    ["frontend_route_requested", "frontend routing is outside this FFET"],
    ["ticket_flag_flip_requested", "ticket/execution flag mutation is forbidden"],
  ];
  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function validateStringArray(values: unknown, field: string): asserts values is string[] {
  if (!Array.isArray(values)) {
    throw new Error(`${field} must be an array`);
  }
  for (const value of values) {
    assertNonEmptyString(value, `${field}[]`);
  }
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`);
  }
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort();
}

function digest(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
