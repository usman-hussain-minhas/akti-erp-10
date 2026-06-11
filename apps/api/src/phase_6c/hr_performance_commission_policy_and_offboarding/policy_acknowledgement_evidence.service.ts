import { createHash } from 'node:crypto';

export const PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_SEED_ID = "seed_6c_050_policy_acknowledgement_evidence" as const;
export const PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_COMPONENT_ID = "6C.04" as const;
export const POLICY_ACKNOWLEDGEMENT_EVIDENCE_RECORDED_EVENT = "phase_6c.hr_performance_commission_policy_and_offboarding.policy_acknowledgement_evidence.recorded" as const;

export type PolicyAcknowledgementChannel =
  | "WEB_PORTAL"
  | "MOBILE_APP"
  | "IMPORTED_SIGNED_DOCUMENT"
  | "ADMIN_RECORDED_ATTESTATION";

export type PolicyAcknowledgementEvidenceDecision =
  | "ACKNOWLEDGEMENT_EVIDENCE_ACCEPTED"
  | "ACKNOWLEDGEMENT_EVIDENCE_REQUIRES_REVIEW";

export type PolicyAcknowledgementEvidenceInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  acknowledgement_ref: string;
  employee_ref: string;
  policy_key: string;
  policy_version: string;
  policy_hash: string;
  acknowledgement_channel: PolicyAcknowledgementChannel;
  acknowledged_at: string;
  statement_text_hash: string;
  evidence_refs: readonly string[];
  signer_ip_hash?: string;
  user_agent_hash?: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  control_metadata?: Record<string, unknown>;
  policy_mutation_requested?: boolean;
  acknowledgement_overwrite_requested?: boolean;
  acknowledgement_delete_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type PolicyAcknowledgementEvidenceReceipt = {
  seed_id: typeof PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_COMPONENT_ID;
  component_slug: "hr_performance_commission_policy_and_offboarding";
  model_name: "Phase6CPolicyAcknowledgementEvidence";
  event_name: typeof POLICY_ACKNOWLEDGEMENT_EVIDENCE_RECORDED_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  acknowledgement_ref: string;
  employee_ref: string;
  policy_key: string;
  policy_version: string;
  policy_hash: string;
  acknowledgement_channel: PolicyAcknowledgementChannel;
  acknowledged_at: string;
  statement_text_hash: string;
  canonical_payload_hash: string;
  decision: PolicyAcknowledgementEvidenceDecision;
  evidence_refs: readonly string[];
  signer_ip_hash: string | null;
  user_agent_hash: string | null;
  policy_mutation_allowed: false;
  acknowledgement_overwrite_allowed: false;
  acknowledgement_delete_allowed: false;
  schema_mutation_allowed: false;
  phase_6a_mutation_allowed: false;
  phase_6b_mutation_allowed: false;
  runtime_adapter_allowed: false;
  ticket_flag_flip_allowed: false;
  decision_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  evidence_artifacts: readonly string[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  acknowledgement_evidence_digest: string;
};

type ReceiptWithoutDigest = Omit<PolicyAcknowledgementEvidenceReceipt, 'acknowledgement_evidence_digest'>;

const DECISION_REFS = ["6C-HR-OPS-010"] as const;
const EVIDENCE_ARTIFACTS = [
  "policy_acknowledgement_evidence_runtime_receipt",
  "canonical_acknowledgement_payload_hash",
  "immutable_acknowledgement_digest",
] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for policy_acknowledgement_evidence.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for policy_acknowledgement_evidence.');
  }
  return normalized;
}

function requireChannel(value: PolicyAcknowledgementChannel | undefined, field: string): PolicyAcknowledgementChannel {
  if (
    value !== "WEB_PORTAL" &&
    value !== "MOBILE_APP" &&
    value !== "IMPORTED_SIGNED_DOCUMENT" &&
    value !== "ADMIN_RECORDED_ATTESTATION"
  ) {
    throw new Error(field + ' must be a supported acknowledgement channel for policy_acknowledgement_evidence.');
  }
  return value;
}

function rejectForbiddenMutation(input: PolicyAcknowledgementEvidenceInput): void {
  const forbiddenRequests: Array<[keyof PolicyAcknowledgementEvidenceInput, string]> = [
    ['policy_mutation_requested', 'policy mutation'],
    ['acknowledgement_overwrite_requested', 'acknowledgement overwrite'],
    ['acknowledgement_delete_requested', 'acknowledgement delete'],
    ['schema_mutation_requested', 'schema mutation'],
    ['phase_6a_mutation_requested', 'Phase 6A mutation'],
    ['phase_6b_mutation_requested', 'Phase 6B mutation'],
    ['runtime_adapter_requested', 'runtime adapter execution'],
    ['ticket_flag_flip_requested', 'ticket flag flip'],
  ];

  for (const [field, label] of forbiddenRequests) {
    if (input[field] === true) {
      throw new Error('policy_acknowledgement_evidence must not perform ' + label + '.');
    }
  }
}

function digest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function recordPolicyAcknowledgementEvidence(input: PolicyAcknowledgementEvidenceInput): PolicyAcknowledgementEvidenceReceipt {
  rejectForbiddenMutation(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const acknowledgementRef = requireNonEmpty(input.acknowledgement_ref, 'acknowledgement_ref');
  const employeeRef = requireNonEmpty(input.employee_ref, 'employee_ref');
  const policyKey = requireNonEmpty(input.policy_key, 'policy_key');
  const policyVersion = requireNonEmpty(input.policy_version, 'policy_version');
  const policyHash = requireNonEmpty(input.policy_hash, 'policy_hash');
  const acknowledgementChannel = requireChannel(input.acknowledgement_channel, 'acknowledgement_channel');
  const acknowledgedAt = requireTimestamp(input.acknowledged_at, 'acknowledged_at');
  const statementTextHash = requireNonEmpty(input.statement_text_hash, 'statement_text_hash');
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const signerIpHash = input.signer_ip_hash === undefined ? null : requireNonEmpty(input.signer_ip_hash, 'signer_ip_hash');
  const userAgentHash = input.user_agent_hash === undefined ? null : requireNonEmpty(input.user_agent_hash, 'user_agent_hash');

  if (Date.parse(acknowledgedAt) > Date.parse(evaluatedAt)) {
    throw new Error('acknowledged_at must not be after evaluated_at for policy_acknowledgement_evidence.');
  }
  if (!Array.isArray(input.evidence_refs) || input.evidence_refs.length === 0) {
    throw new Error('evidence_refs must contain at least one evidence reference for policy_acknowledgement_evidence.');
  }
  const evidenceRefs = input.evidence_refs.map((ref: string, index: number) => requireNonEmpty(ref, 'evidence_refs[' + index + ']'));
  const canonicalPayload = {
    organization_id: organizationId,
    acknowledgement_ref: acknowledgementRef,
    employee_ref: employeeRef,
    policy_key: policyKey,
    policy_version: policyVersion,
    policy_hash: policyHash,
    acknowledgement_channel: acknowledgementChannel,
    acknowledged_at: acknowledgedAt,
    statement_text_hash: statementTextHash,
    evidence_refs: evidenceRefs,
    signer_ip_hash: signerIpHash,
    user_agent_hash: userAgentHash,
  };
  const canonicalPayloadHash = digest(canonicalPayload);
  const decision: PolicyAcknowledgementEvidenceDecision = signerIpHash === null && userAgentHash === null
    ? "ACKNOWLEDGEMENT_EVIDENCE_REQUIRES_REVIEW"
    : "ACKNOWLEDGEMENT_EVIDENCE_ACCEPTED";

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_POLICY_ACKNOWLEDGEMENT_EVIDENCE_COMPONENT_ID,
    component_slug: "hr_performance_commission_policy_and_offboarding",
    model_name: "Phase6CPolicyAcknowledgementEvidence",
    event_name: POLICY_ACKNOWLEDGEMENT_EVIDENCE_RECORDED_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    acknowledgement_ref: acknowledgementRef,
    employee_ref: employeeRef,
    policy_key: policyKey,
    policy_version: policyVersion,
    policy_hash: policyHash,
    acknowledgement_channel: acknowledgementChannel,
    acknowledged_at: acknowledgedAt,
    statement_text_hash: statementTextHash,
    canonical_payload_hash: canonicalPayloadHash,
    decision,
    evidence_refs: evidenceRefs,
    signer_ip_hash: signerIpHash,
    user_agent_hash: userAgentHash,
    policy_mutation_allowed: false,
    acknowledgement_overwrite_allowed: false,
    acknowledgement_delete_allowed: false,
    schema_mutation_allowed: false,
    phase_6a_mutation_allowed: false,
    phase_6b_mutation_allowed: false,
    runtime_adapter_allowed: false,
    ticket_flag_flip_allowed: false,
    decision_refs: DECISION_REFS,
    control_metadata: input.control_metadata ?? {},
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    acknowledgement_evidence_digest: digest(receiptWithoutDigest),
  };
}
