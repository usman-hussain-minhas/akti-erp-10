import { createHash } from 'node:crypto';

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

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for speaker_honorarium_ref scaffold control.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for speaker_honorarium_ref scaffold control.');
  }
  return normalized;
}

function digestScaffold(receiptWithoutDigest: Omit<SpeakerHonorariumRefScaffoldReceipt, 'scaffold_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateSpeakerHonorariumRefScaffold(input: SpeakerHonorariumRefScaffoldInput): SpeakerHonorariumRefScaffoldReceipt {
  if (input.capability_execution_requested === true) {
    throw new Error('speaker_honorarium_ref scaffold control must not execute capability behavior.');
  }
  if (input.business_behavior_requested === true) {
    throw new Error('speaker_honorarium_ref scaffold control must not execute business behavior.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('speaker_honorarium_ref scaffold control must not execute runtime adapter behavior.');
  }

  const receiptWithoutDigest: Omit<SpeakerHonorariumRefScaffoldReceipt, 'scaffold_evidence_digest'> = {
    seed_id: PHASE_6C_SPEAKER_HONORARIUM_REF_SEED_ID,
    component_id: PHASE_6C_SPEAKER_HONORARIUM_REF_COMPONENT_ID,
    component_slug: "events_configuration_and_registration_service",
    model_name: "Phase6CSpeakerHonorariumRef",
    event_name: SPEAKER_HONORARIUM_REF_SCAFFOLD_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    scaffold_status: 'SCAFFOLD_CONTROL_ONLY',
    capability_implementation_allowed: false,
    business_behavior_allowed: false,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-EVENT-REG-010"],
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    scaffold_evidence_digest: digestScaffold(receiptWithoutDigest),
  };
}
