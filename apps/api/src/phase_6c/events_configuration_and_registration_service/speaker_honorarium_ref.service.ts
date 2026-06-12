import { createHash } from 'node:crypto';

export const PHASE_6C_SPEAKER_HONORARIUM_REF_SEED_ID = 'seed_6c_098_speaker_honorarium_ref' as const;
export const PHASE_6C_SPEAKER_HONORARIUM_REF_COMPONENT_ID = '6C.08' as const;
export const SPEAKER_HONORARIUM_REF_RUNTIME_EVENT = 'phase_6c.events_configuration_and_registration_service.speaker_honorarium_ref.runtime_evaluated' as const;

export type SpeakerHonorariumLinkMode = 'PERSON_REF' | 'EXTERNAL_SPEAKER_REF';
export type SpeakerHonorariumDecision = 'SPEAKER_REF_READY' | 'HONORARIUM_REF_READY' | 'HONORARIUM_REQUIRES_APPROVAL_EVIDENCE';

export type SpeakerHonorariumTerms = {
  enabled: boolean;
  honorarium_ref?: string;
  amount_minor_units?: number;
  currency?: string;
  approval_evidence_ref?: string;
  finance_evidence_ref?: string;
  payment_evidence_ref?: string;
};

export type SpeakerHonorariumRefInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  speaker_ref_record_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  speaker_display_name: string;
  person_ref?: string;
  external_speaker_ref?: string;
  session_refs: readonly string[];
  contract_ref?: string;
  honorarium_terms: SpeakerHonorariumTerms;
  control_metadata?: Record<string, unknown>;
  person_identity_write_requested?: boolean;
  finance_invoice_write_requested?: boolean;
  payment_capture_requested?: boolean;
  payroll_write_requested?: boolean;
  provider_adapter_requested?: boolean;
  persistence_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type SpeakerHonorariumRefRuntimeReceipt = {
  seed_id: typeof PHASE_6C_SPEAKER_HONORARIUM_REF_SEED_ID;
  component_id: typeof PHASE_6C_SPEAKER_HONORARIUM_REF_COMPONENT_ID;
  component_slug: 'events_configuration_and_registration_service';
  model_name: 'Phase6CSpeakerHonorariumRef';
  event_name: typeof SPEAKER_HONORARIUM_REF_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  event_configuration_id: string;
  speaker_ref_record_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  speaker_display_name: string;
  speaker_link_mode: SpeakerHonorariumLinkMode;
  person_ref?: string;
  external_speaker_ref?: string;
  session_count: number;
  session_refs: readonly string[];
  contract_ref?: string;
  honorarium_enabled: boolean;
  honorarium_ref?: string;
  amount_minor_units?: number;
  currency?: string;
  approval_evidence_ref?: string;
  finance_evidence_ref?: string;
  payment_evidence_ref?: string;
  decision: SpeakerHonorariumDecision;
  refs_events_only: true;
  direct_person_identity_write_allowed: false;
  direct_finance_write_allowed: false;
  direct_payment_capture_allowed: false;
  provider_adapter_allowed: false;
  persistence_performed: false;
  schema_mutation_performed: false;
  frontend_surface_created: false;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  speaker_honorarium_ref_runtime_digest: string;
};

const DECISION_REFS = ['6C-EVENT-REG-010', '6C-EVENT-REG-003', '6C-GLOBAL-018'] as const;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for speaker_honorarium_ref runtime evaluation.');
  }
  return value.trim();
}

function optionalNonEmpty(value: string | undefined, field: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return requireNonEmpty(value, field);
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for speaker_honorarium_ref runtime evaluation.');
  }
  return normalized;
}

function requireNonNegativeInteger(value: number | undefined, field: string): number {
  if (!Number.isInteger(value) || value === undefined || value < 0) {
    throw new Error(field + ' must be a non-negative integer for speaker_honorarium_ref runtime evaluation.');
  }
  return value;
}

function normalizeCurrency(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'honorarium_terms.currency').toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('honorarium_terms.currency must be a 3-letter ISO-style currency code.');
  }
  return normalized;
}

function assertForbidden(input: SpeakerHonorariumRefInput): void {
  const forbidden: Array<[keyof SpeakerHonorariumRefInput, string]> = [
    ['person_identity_write_requested', 'speaker_honorarium_ref must reference Person or external speaker identity, not write identity data.'],
    ['finance_invoice_write_requested', 'speaker_honorarium_ref must reference Finance evidence, not write invoices.'],
    ['payment_capture_requested', 'speaker_honorarium_ref must not capture payment.'],
    ['payroll_write_requested', 'speaker_honorarium_ref must not write payroll.'],
    ['provider_adapter_requested', 'speaker_honorarium_ref must not execute provider adapters.'],
    ['persistence_requested', 'speaker_honorarium_ref FFET must not persist records.'],
    ['schema_mutation_requested', 'speaker_honorarium_ref FFET must not mutate schema.'],
    ['frontend_requested', 'speaker_honorarium_ref FFET must not create frontend surfaces.'],
  ];

  for (const [field, message] of forbidden) {
    if (input[field] === true) {
      throw new Error(message);
    }
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function digestRuntime(receiptWithoutDigest: Omit<SpeakerHonorariumRefRuntimeReceipt, 'speaker_honorarium_ref_runtime_digest'>): string {
  return createHash('sha256').update(JSON.stringify(canonicalize(receiptWithoutDigest))).digest('hex');
}

function resolveSpeakerIdentity(input: SpeakerHonorariumRefInput): { mode: SpeakerHonorariumLinkMode; personRef?: string; externalSpeakerRef?: string } {
  const personRef = optionalNonEmpty(input.person_ref, 'person_ref');
  const externalSpeakerRef = optionalNonEmpty(input.external_speaker_ref, 'external_speaker_ref');
  if (personRef && externalSpeakerRef) {
    throw new Error('speaker_honorarium_ref must use either person_ref or external_speaker_ref, not both.');
  }
  if (!personRef && !externalSpeakerRef) {
    throw new Error('speaker_honorarium_ref requires person_ref or external_speaker_ref.');
  }
  return personRef ? { mode: 'PERSON_REF', personRef } : { mode: 'EXTERNAL_SPEAKER_REF', externalSpeakerRef };
}

function normalizeSessionRefs(sessionRefs: readonly string[]): readonly string[] {
  if (!Array.isArray(sessionRefs) || sessionRefs.length === 0) {
    throw new Error('at least one session_ref is required for speaker_honorarium_ref runtime evaluation.');
  }
  const normalized = sessionRefs.map((sessionRef, index) => requireNonEmpty(sessionRef, 'session_refs[' + index + ']'));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('session_refs must not contain duplicates.');
  }
  return normalized;
}

function normalizeHonorariumTerms(terms: SpeakerHonorariumTerms): {
  honorariumEnabled: boolean;
  honorariumRef?: string;
  amountMinorUnits?: number;
  currency?: string;
  approvalEvidenceRef?: string;
  financeEvidenceRef?: string;
  paymentEvidenceRef?: string;
  decision: SpeakerHonorariumDecision;
} {
  if (terms.enabled === false) {
    if (terms.honorarium_ref || terms.amount_minor_units !== undefined || terms.currency || terms.approval_evidence_ref || terms.finance_evidence_ref || terms.payment_evidence_ref) {
      throw new Error('disabled honorarium_terms must not carry honorarium/payment evidence fields.');
    }
    return { honorariumEnabled: false, decision: 'SPEAKER_REF_READY' };
  }

  const amountMinorUnits = requireNonNegativeInteger(terms.amount_minor_units, 'honorarium_terms.amount_minor_units');
  const approvalEvidenceRef = optionalNonEmpty(terms.approval_evidence_ref, 'honorarium_terms.approval_evidence_ref');
  return {
    honorariumEnabled: true,
    honorariumRef: requireNonEmpty(terms.honorarium_ref, 'honorarium_terms.honorarium_ref'),
    amountMinorUnits,
    currency: normalizeCurrency(terms.currency),
    approvalEvidenceRef,
    financeEvidenceRef: optionalNonEmpty(terms.finance_evidence_ref, 'honorarium_terms.finance_evidence_ref'),
    paymentEvidenceRef: optionalNonEmpty(terms.payment_evidence_ref, 'honorarium_terms.payment_evidence_ref'),
    decision: amountMinorUnits > 0 && !approvalEvidenceRef ? 'HONORARIUM_REQUIRES_APPROVAL_EVIDENCE' : 'HONORARIUM_REF_READY',
  };
}

export function evaluateSpeakerHonorariumRef(input: SpeakerHonorariumRefInput): SpeakerHonorariumRefRuntimeReceipt {
  assertForbidden(input);
  const speakerIdentity = resolveSpeakerIdentity(input);
  const sessionRefs = normalizeSessionRefs(input.session_refs);
  const honorarium = normalizeHonorariumTerms(input.honorarium_terms);

  const receiptWithoutDigest: Omit<SpeakerHonorariumRefRuntimeReceipt, 'speaker_honorarium_ref_runtime_digest'> = {
    seed_id: PHASE_6C_SPEAKER_HONORARIUM_REF_SEED_ID,
    component_id: PHASE_6C_SPEAKER_HONORARIUM_REF_COMPONENT_ID,
    component_slug: 'events_configuration_and_registration_service',
    model_name: 'Phase6CSpeakerHonorariumRef',
    event_name: SPEAKER_HONORARIUM_REF_RUNTIME_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    event_configuration_id: requireNonEmpty(input.event_configuration_id, 'event_configuration_id'),
    speaker_ref_record_id: requireNonEmpty(input.speaker_ref_record_id, 'speaker_ref_record_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    speaker_display_name: requireNonEmpty(input.speaker_display_name, 'speaker_display_name'),
    speaker_link_mode: speakerIdentity.mode,
    person_ref: speakerIdentity.personRef,
    external_speaker_ref: speakerIdentity.externalSpeakerRef,
    session_count: sessionRefs.length,
    session_refs: sessionRefs,
    contract_ref: optionalNonEmpty(input.contract_ref, 'contract_ref'),
    honorarium_enabled: honorarium.honorariumEnabled,
    honorarium_ref: honorarium.honorariumRef,
    amount_minor_units: honorarium.amountMinorUnits,
    currency: honorarium.currency,
    approval_evidence_ref: honorarium.approvalEvidenceRef,
    finance_evidence_ref: honorarium.financeEvidenceRef,
    payment_evidence_ref: honorarium.paymentEvidenceRef,
    decision: honorarium.decision,
    refs_events_only: true,
    direct_person_identity_write_allowed: false,
    direct_finance_write_allowed: false,
    direct_payment_capture_allowed: false,
    provider_adapter_allowed: false,
    persistence_performed: false,
    schema_mutation_performed: false,
    frontend_surface_created: false,
    decision_refs: DECISION_REFS,
    evidence_artifacts: ['speaker_honorarium_ref_runtime_receipt', 'speaker_honorarium_ref_validation_result', 'speaker_honorarium_ref_forbidden_behavior_rejection_evidence'],
    control_metadata: input.control_metadata ?? {},
  };

  return {
    ...receiptWithoutDigest,
    speaker_honorarium_ref_runtime_digest: digestRuntime(receiptWithoutDigest),
  };
}
