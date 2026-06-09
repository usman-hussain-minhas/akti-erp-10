import { createHash } from 'node:crypto';

export const PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_SEED_ID = 'seed_6c_019_background_check_provider_boundary' as const;
export const PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_COMPONENT_ID = '6C.02' as const;
export const BACKGROUND_CHECK_PROVIDER_BOUNDARY_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.background_check_provider_boundary.validated' as const;

export type BackgroundCheckScope = 'IDENTITY' | 'EMPLOYMENT_HISTORY' | 'EDUCATION' | 'CRIMINAL_RECORD' | 'REFERENCE';
export type BackgroundCheckConsentStatus = 'CONSENT_CAPTURED';
export type BackgroundCheckBoundaryStatus = 'PROVIDER_NEUTRAL_BOUNDARY_READY';

export type BackgroundCheckScopeRequest = {
  scope_code: BackgroundCheckScope;
  reason: string;
  required: boolean;
};

export type BackgroundCheckProviderBoundaryInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  offer_ref?: string;
  provider_boundary_ref: string;
  consent_status: BackgroundCheckConsentStatus;
  consent_evidence_ref: string;
  requested_by_user_id: string;
  evaluated_at: string;
  scopes: readonly BackgroundCheckScopeRequest[];
  control_metadata?: Record<string, unknown>;
  real_provider_requested?: boolean;
  provider_credentials_requested?: boolean;
  adapter_execution_requested?: boolean;
  external_submission_requested?: boolean;
  sensitive_result_storage_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type BackgroundCheckProviderBoundaryPayload = {
  applicant_ref: string;
  offer_ref?: string;
  provider_boundary_ref: string;
  consent_evidence_ref: string;
  scopes: readonly BackgroundCheckScopeRequest[];
};

export type BackgroundCheckProviderBoundaryReceipt = {
  seed_id: typeof PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_SEED_ID;
  component_id: typeof PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CBackgroundCheckProviderBoundary';
  event_name: typeof BACKGROUND_CHECK_PROVIDER_BOUNDARY_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: BackgroundCheckBoundaryStatus;
  provider_neutral_boundary_only: true;
  real_provider_allowed: false;
  provider_credentials_allowed: false;
  adapter_execution_allowed: false;
  external_submission_allowed: false;
  sensitive_result_storage_allowed: false;
  consent_required: true;
  scope_count: number;
  required_scope_count: number;
  boundary_payload: BackgroundCheckProviderBoundaryPayload;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  requested_by_user_id: string;
  evaluated_at: string;
  background_check_provider_boundary_evidence_digest: string;
};

type BackgroundCheckProviderBoundaryReceiptWithoutDigest = Omit<BackgroundCheckProviderBoundaryReceipt, 'background_check_provider_boundary_evidence_digest'>;

const BACKGROUND_CHECK_SCOPES = new Set<BackgroundCheckScope>(['IDENTITY', 'EMPLOYMENT_HISTORY', 'EDUCATION', 'CRIMINAL_RECORD', 'REFERENCE']);
const PROVIDER_BOUNDARY_REF_PREFIX = 'provider_neutral_background_check:';
const CONSENT_EVIDENCE_REF_PREFIX = 'consent_evidence:';

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for background_check_provider_boundary runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for background_check_provider_boundary runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: BackgroundCheckProviderBoundaryInput): void {
  if (input.real_provider_requested === true) {
    throw new Error('background_check_provider_boundary runtime must remain provider-neutral and must not call real background-check providers.');
  }
  if (input.provider_credentials_requested === true) {
    throw new Error('background_check_provider_boundary runtime must not handle provider credentials.');
  }
  if (input.adapter_execution_requested === true) {
    throw new Error('background_check_provider_boundary runtime must not execute provider adapters.');
  }
  if (input.external_submission_requested === true) {
    throw new Error('background_check_provider_boundary runtime must not submit background checks externally.');
  }
  if (input.sensitive_result_storage_requested === true) {
    throw new Error('background_check_provider_boundary runtime must not store sensitive background-check results.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('background_check_provider_boundary runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('background_check_provider_boundary runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('background_check_provider_boundary runtime must not mutate Phase 6B surfaces.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('background_check_provider_boundary runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeScopes(scopes: readonly BackgroundCheckScopeRequest[]): { scopes: BackgroundCheckScopeRequest[]; requiredScopeCount: number } {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    throw new Error('at least one background-check scope is required for background_check_provider_boundary runtime.');
  }
  const seen = new Set<BackgroundCheckScope>();
  let requiredScopeCount = 0;
  const normalized = scopes.map((scope) => {
    if (!BACKGROUND_CHECK_SCOPES.has(scope.scope_code)) {
      throw new Error('scope_code is not supported for background_check_provider_boundary runtime: ' + String(scope.scope_code));
    }
    if (seen.has(scope.scope_code)) {
      throw new Error('scope_code must be unique for background_check_provider_boundary runtime: ' + scope.scope_code);
    }
    seen.add(scope.scope_code);
    const reason = requireNonEmpty(scope.reason, 'scope reason');
    if (typeof scope.required !== 'boolean') {
      throw new Error('scope required flag must be boolean for background_check_provider_boundary runtime: ' + scope.scope_code);
    }
    if (scope.required) {
      requiredScopeCount += 1;
    }
    return { scope_code: scope.scope_code, reason, required: scope.required };
  });
  if (requiredScopeCount === 0) {
    throw new Error('at least one required background-check scope is required for background_check_provider_boundary runtime.');
  }
  return { scopes: normalized, requiredScopeCount };
}

function digestReceipt(receiptWithoutDigest: BackgroundCheckProviderBoundaryReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateBackgroundCheckProviderBoundaryRuntime(input: BackgroundCheckProviderBoundaryInput): BackgroundCheckProviderBoundaryReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const applicantRef = requireNonEmpty(input.applicant_ref, 'applicant_ref');
  const offerRef = input.offer_ref === undefined ? undefined : requireNonEmpty(input.offer_ref, 'offer_ref');
  const providerBoundaryRef = requireNonEmpty(input.provider_boundary_ref, 'provider_boundary_ref');
  if (!providerBoundaryRef.startsWith(PROVIDER_BOUNDARY_REF_PREFIX)) {
    throw new Error('provider_boundary_ref must identify a provider-neutral background-check boundary.');
  }
  if (input.consent_status !== 'CONSENT_CAPTURED') {
    throw new Error('consent_status must be CONSENT_CAPTURED for background_check_provider_boundary runtime.');
  }
  const consentEvidenceRef = requireNonEmpty(input.consent_evidence_ref, 'consent_evidence_ref');
  if (!consentEvidenceRef.startsWith(CONSENT_EVIDENCE_REF_PREFIX)) {
    throw new Error('consent_evidence_ref must identify captured consent evidence for background_check_provider_boundary runtime.');
  }
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const scopeSummary = normalizeScopes(input.scopes);

  const boundaryPayload: BackgroundCheckProviderBoundaryPayload = {
    applicant_ref: applicantRef,
    ...(offerRef === undefined ? {} : { offer_ref: offerRef }),
    provider_boundary_ref: providerBoundaryRef,
    consent_evidence_ref: consentEvidenceRef,
    scopes: scopeSummary.scopes,
  };

  const receiptWithoutDigest: BackgroundCheckProviderBoundaryReceiptWithoutDigest = {
    seed_id: PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_SEED_ID,
    component_id: PHASE_6C_BACKGROUND_CHECK_PROVIDER_BOUNDARY_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6CBackgroundCheckProviderBoundary',
    event_name: BACKGROUND_CHECK_PROVIDER_BOUNDARY_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    runtime_status: 'PROVIDER_NEUTRAL_BOUNDARY_READY',
    provider_neutral_boundary_only: true,
    real_provider_allowed: false,
    provider_credentials_allowed: false,
    adapter_execution_allowed: false,
    external_submission_allowed: false,
    sensitive_result_storage_allowed: false,
    consent_required: true,
    scope_count: scopeSummary.scopes.length,
    required_scope_count: scopeSummary.requiredScopeCount,
    boundary_payload: boundaryPayload,
    decision_refs: ['6C-RECRUIT-011'],
    evidence_artifacts: [
      'background_check_provider_boundary_runtime_receipt',
      'background_check_provider_boundary_validation_result',
      'background_check_provider_boundary_forbidden_behavior_rejection_evidence',
    ],
    control_metadata: input.control_metadata ?? {},
    requested_by_user_id: requestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    background_check_provider_boundary_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
