import { createHash } from 'node:crypto';

export const PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_SEED_ID = 'seed_6c_089_mandatory_notice_classification' as const;
export const PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_COMPONENT_ID = '6C.07' as const;
export const MANDATORY_NOTICE_CLASSIFICATION_RUNTIME_EVENT = 'phase_6c.workspace_calendar_meetings_rooms_announcements.mandatory_notice_classification.runtime_evaluated' as const;

export const MANDATORY_NOTICE_CLASSIFICATION_DECISION_REFS = [
  '6C-CAL-007',
  '6C-CAL-006',
  '6C-GLOBAL-013',
  '6C-ADL-008',
  '6C-ADL-009',
] as const;

export const MANDATORY_NOTICE_CLASSIFICATION_ADL_REFS = ['ADL-004'] as const;

export type NoticePurpose = 'MANDATORY_COMPLIANCE' | 'MANDATORY_OPERATIONAL' | 'GENERAL_ANNOUNCEMENT' | 'REMINDER' | 'PROMOTIONAL';
export type MandatoryNoticeBasis = 'LEGAL_REQUIREMENT' | 'SECURITY_OR_SAFETY' | 'SERVICE_OPERATION_REQUIRED' | 'POLICY_ACKNOWLEDGEMENT_REQUIRED';
export type MandatoryNoticeClassification = 'MANDATORY_NOTICE' | 'OPT_OUT_ELIGIBLE_ANNOUNCEMENT' | 'OPT_OUT_ELIGIBLE_REMINDER' | 'REQUIRES_MANUAL_REVIEW';
export type MandatoryNoticeReviewReason = 'MISSING_MANDATORY_BASIS' | 'MISSING_SOURCE_AUTHORITY' | 'CONFLICTING_PURPOSE_AND_BASIS';

export type MandatoryNoticeClassificationInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  notice_id: string;
  source_record_ref: string;
  requested_by_user_id: string;
  requested_at: string;
  notice_purpose: NoticePurpose;
  title: string;
  body: string;
  tenant_marked_mandatory?: boolean;
  mandatory_basis?: MandatoryNoticeBasis;
  mandatory_source_authority_ref?: string;
  requires_acknowledgement?: boolean;
  direct_provider_send_requested?: boolean;
  gateway_bypass_requested?: boolean;
  opt_out_bypass_requested?: boolean;
  persistence_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type MandatoryNoticeClassificationReceipt = {
  seed_id: typeof PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_SEED_ID;
  component_id: typeof PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_COMPONENT_ID;
  component_slug: 'workspace_calendar_meetings_rooms_announcements';
  model_name: 'Phase6CMandatoryNoticeClassification';
  event_name: typeof MANDATORY_NOTICE_CLASSIFICATION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  notice_id: string;
  source_record_ref: string;
  notice_purpose: NoticePurpose;
  classification: MandatoryNoticeClassification;
  manual_review_reasons: MandatoryNoticeReviewReason[];
  gateway_route_required: true;
  mandatory_notice_opt_out_exempt: boolean;
  opt_out_enforcement_required: boolean;
  direct_provider_send_allowed: false;
  runtime_adapter_executed: false;
  persistence_executed: false;
  classification_basis: MandatoryNoticeBasis | null;
  mandatory_source_authority_ref: string | null;
  classification_reasons: string[];
  required_downstream_surface: 'COMMUNICATION_GATEWAY';
  required_evidence_artifacts: readonly string[];
  decision_refs: typeof MANDATORY_NOTICE_CLASSIFICATION_DECISION_REFS;
  adl_refs: typeof MANDATORY_NOTICE_CLASSIFICATION_ADL_REFS;
  requested_by_user_id: string;
  requested_at: string;
  runtime_evidence_digest: string;
};

const MANDATORY_PURPOSES = new Set<NoticePurpose>(['MANDATORY_COMPLIANCE', 'MANDATORY_OPERATIONAL']);
const OPT_OUT_PURPOSES = new Set<NoticePurpose>(['GENERAL_ANNOUNCEMENT', 'REMINDER', 'PROMOTIONAL']);
const MANDATORY_BASES = new Set<MandatoryNoticeBasis>([
  'LEGAL_REQUIREMENT',
  'SECURITY_OR_SAFETY',
  'SERVICE_OPERATION_REQUIRED',
  'POLICY_ACKNOWLEDGEMENT_REQUIRED',
]);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for mandatory notice classification.');
  }
  return value.trim();
}

function optionalTrim(value: string | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for mandatory notice classification.');
  }
  return normalized;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return '[' + value.map((item) => stableStringify(item)).join(',') + ']';
  }
  if (value && typeof value === 'object') {
    return '{' + Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => JSON.stringify(key) + ':' + stableStringify(nested))
      .join(',') + '}';
  }
  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function validateBasis(basis: MandatoryNoticeBasis | undefined): MandatoryNoticeBasis | null {
  if (basis === undefined) {
    return null;
  }
  if (!MANDATORY_BASES.has(basis)) {
    throw new Error('mandatory_basis contains unsupported value ' + String(basis) + '.');
  }
  return basis;
}

export function classifyMandatoryNotice(input: MandatoryNoticeClassificationInput): MandatoryNoticeClassificationReceipt {
  if (input.direct_provider_send_requested === true) {
    throw new Error('mandatory_notice_classification must not create direct provider sends.');
  }
  if (input.gateway_bypass_requested === true) {
    throw new Error('mandatory_notice_classification must not bypass Communication Gateway routing.');
  }
  if (input.opt_out_bypass_requested === true) {
    throw new Error('mandatory_notice_classification must not accept manual opt-out bypass requests.');
  }
  if (input.persistence_requested === true) {
    throw new Error('mandatory_notice_classification must not persist classification state inside this FFET.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('mandatory_notice_classification must not execute runtime adapters inside this FFET.');
  }

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const noticeId = requireNonEmpty(input.notice_id, 'notice_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const requestedAt = requireTimestamp(input.requested_at, 'requested_at');
  requireNonEmpty(input.title, 'title');
  requireNonEmpty(input.body, 'body');

  if (!MANDATORY_PURPOSES.has(input.notice_purpose) && !OPT_OUT_PURPOSES.has(input.notice_purpose)) {
    throw new Error('notice_purpose contains unsupported value ' + String(input.notice_purpose) + '.');
  }

  const mandatoryBasis = validateBasis(input.mandatory_basis);
  const sourceAuthorityRef = optionalTrim(input.mandatory_source_authority_ref);
  const manualReviewReasons: MandatoryNoticeReviewReason[] = [];
  const classificationReasons: string[] = [];
  const mandatoryPurpose = MANDATORY_PURPOSES.has(input.notice_purpose) || input.tenant_marked_mandatory === true;
  const optOutPurpose = OPT_OUT_PURPOSES.has(input.notice_purpose);

  if (mandatoryPurpose && mandatoryBasis === null) {
    manualReviewReasons.push('MISSING_MANDATORY_BASIS');
  }
  if (mandatoryPurpose && sourceAuthorityRef === null) {
    manualReviewReasons.push('MISSING_SOURCE_AUTHORITY');
  }
  if (optOutPurpose && mandatoryBasis !== null) {
    manualReviewReasons.push('CONFLICTING_PURPOSE_AND_BASIS');
  }

  let classification: MandatoryNoticeClassification;
  if (manualReviewReasons.length > 0) {
    classification = 'REQUIRES_MANUAL_REVIEW';
    classificationReasons.push('Mandatory opt-out exemption requires a cited mandatory basis and source authority before gateway delivery.');
  } else if (mandatoryPurpose) {
    classification = 'MANDATORY_NOTICE';
    classificationReasons.push('Notice is mandatory because the source supplied a mandatory purpose, basis, and authority reference.');
  } else if (input.notice_purpose === 'REMINDER') {
    classification = 'OPT_OUT_ELIGIBLE_REMINDER';
    classificationReasons.push('Reminder notices remain opt-out eligible and must be enforced by the Communication Gateway.');
  } else {
    classification = 'OPT_OUT_ELIGIBLE_ANNOUNCEMENT';
    classificationReasons.push('Announcement is not supported by a mandatory basis, so global opt-out enforcement remains required.');
  }

  const mandatoryNotice = classification === 'MANDATORY_NOTICE';
  const receiptWithoutDigest: Omit<MandatoryNoticeClassificationReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_SEED_ID,
    component_id: PHASE_6C_MANDATORY_NOTICE_CLASSIFICATION_COMPONENT_ID,
    component_slug: 'workspace_calendar_meetings_rooms_announcements',
    model_name: 'Phase6CMandatoryNoticeClassification',
    event_name: MANDATORY_NOTICE_CLASSIFICATION_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    notice_id: noticeId,
    source_record_ref: sourceRecordRef,
    notice_purpose: input.notice_purpose,
    classification,
    manual_review_reasons: manualReviewReasons,
    gateway_route_required: true,
    mandatory_notice_opt_out_exempt: mandatoryNotice,
    opt_out_enforcement_required: !mandatoryNotice,
    direct_provider_send_allowed: false,
    runtime_adapter_executed: false,
    persistence_executed: false,
    classification_basis: mandatoryBasis,
    mandatory_source_authority_ref: sourceAuthorityRef,
    classification_reasons: classificationReasons,
    required_downstream_surface: 'COMMUNICATION_GATEWAY',
    required_evidence_artifacts: [
      'mandatory_notice_classification_runtime_receipt',
      'mandatory_basis_source_authority_evidence',
      'communication_gateway_routing_requirement',
    ],
    decision_refs: MANDATORY_NOTICE_CLASSIFICATION_DECISION_REFS,
    adl_refs: MANDATORY_NOTICE_CLASSIFICATION_ADL_REFS,
    requested_by_user_id: requestedByUserId,
    requested_at: requestedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digest(receiptWithoutDigest),
  };
}
