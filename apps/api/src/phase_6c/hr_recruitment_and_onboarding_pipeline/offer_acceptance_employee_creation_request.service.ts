import { createHash } from 'node:crypto';

export const PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_SEED_ID = 'seed_6c_016_offer_acceptance_employee_creation_request' as const;
export const PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_COMPONENT_ID = '6C.02' as const;
export const OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.offer_acceptance_employee_creation_request.recommended' as const;

export type OfferAcceptanceStatus = 'ACCEPTED';
export type EmployeeCreationRequestStatus = 'RECOMMENDED_EXPLICIT_STEP_REQUIRED';

export type EmployeeCreationProfileDraft = {
  legal_name: string;
  work_email: string;
  start_date: string;
  department_ref: string;
  position_ref: string;
  manager_employee_ref?: string;
};

export type OfferAcceptanceEmployeeCreationRequestInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  offer_ref: string;
  offer_acceptance_status: OfferAcceptanceStatus;
  accepted_by_actor_ref: string;
  accepted_at: string;
  employee_creation_requested_by_user_id: string;
  evaluated_at: string;
  profile_draft: EmployeeCreationProfileDraft;
  control_metadata?: Record<string, unknown>;
  auto_employee_creation_requested?: boolean;
  employee_record_mutation_requested?: boolean;
  person_identity_mutation_requested?: boolean;
  access_provisioning_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type EmployeeCreationRecommendationPayload = {
  applicant_ref: string;
  offer_ref: string;
  accepted_by_actor_ref: string;
  accepted_at: string;
  profile_draft: EmployeeCreationProfileDraft;
};

export type OfferAcceptanceEmployeeCreationRequestReceipt = {
  seed_id: typeof PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_SEED_ID;
  component_id: typeof PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6COfferAcceptanceEmployeeCreationRequest';
  event_name: typeof OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: EmployeeCreationRequestStatus;
  acceptance_recommends_employee_creation: true;
  employee_creation_explicit_step_required: true;
  employee_creation_executed: false;
  employee_record_mutation_allowed: false;
  person_identity_mutation_allowed: false;
  access_provisioning_executed: false;
  recommendation_payload: EmployeeCreationRecommendationPayload;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  employee_creation_requested_by_user_id: string;
  evaluated_at: string;
  offer_acceptance_employee_creation_request_evidence_digest: string;
};

type OfferAcceptanceReceiptWithoutDigest = Omit<OfferAcceptanceEmployeeCreationRequestReceipt, 'offer_acceptance_employee_creation_request_evidence_digest'>;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offer_acceptance_employee_creation_request runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offer_acceptance_employee_creation_request runtime.');
  }
  return normalized;
}

function requireDateOnly(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized) || !Number.isFinite(Date.parse(normalized + 'T00:00:00.000Z'))) {
    throw new Error(field + ' must be an ISO date for offer_acceptance_employee_creation_request runtime.');
  }
  return normalized;
}

function requireWorkEmail(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'work_email').toLocaleLowerCase('en-US');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
    throw new Error('work_email must be email-like for offer_acceptance_employee_creation_request runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: OfferAcceptanceEmployeeCreationRequestInput): void {
  if (input.auto_employee_creation_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must recommend employee creation, not auto-create employees.');
  }
  if (input.employee_record_mutation_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must not mutate employee records.');
  }
  if (input.person_identity_mutation_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must not mutate Person/Identity records.');
  }
  if (input.access_provisioning_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must not execute access provisioning.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('offer_acceptance_employee_creation_request runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeProfileDraft(profileDraft: EmployeeCreationProfileDraft): EmployeeCreationProfileDraft {
  const legalName = requireNonEmpty(profileDraft?.legal_name, 'legal_name');
  const workEmail = requireWorkEmail(profileDraft?.work_email);
  const startDate = requireDateOnly(profileDraft?.start_date, 'start_date');
  const departmentRef = requireNonEmpty(profileDraft?.department_ref, 'department_ref');
  const positionRef = requireNonEmpty(profileDraft?.position_ref, 'position_ref');
  const managerEmployeeRef = profileDraft?.manager_employee_ref === undefined ? undefined : requireNonEmpty(profileDraft.manager_employee_ref, 'manager_employee_ref');
  return {
    legal_name: legalName,
    work_email: workEmail,
    start_date: startDate,
    department_ref: departmentRef,
    position_ref: positionRef,
    ...(managerEmployeeRef === undefined ? {} : { manager_employee_ref: managerEmployeeRef }),
  };
}

function digestReceipt(receiptWithoutDigest: OfferAcceptanceReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateOfferAcceptanceEmployeeCreationRequestRuntime(input: OfferAcceptanceEmployeeCreationRequestInput): OfferAcceptanceEmployeeCreationRequestReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const applicantRef = requireNonEmpty(input.applicant_ref, 'applicant_ref');
  const offerRef = requireNonEmpty(input.offer_ref, 'offer_ref');
  if (input.offer_acceptance_status !== 'ACCEPTED') {
    throw new Error('offer_acceptance_status must be ACCEPTED for offer_acceptance_employee_creation_request runtime.');
  }
  const acceptedByActorRef = requireNonEmpty(input.accepted_by_actor_ref, 'accepted_by_actor_ref');
  const acceptedAt = requireTimestamp(input.accepted_at, 'accepted_at');
  const employeeCreationRequestedByUserId = requireNonEmpty(input.employee_creation_requested_by_user_id, 'employee_creation_requested_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const profileDraft = normalizeProfileDraft(input.profile_draft);

  const recommendationPayload: EmployeeCreationRecommendationPayload = {
    applicant_ref: applicantRef,
    offer_ref: offerRef,
    accepted_by_actor_ref: acceptedByActorRef,
    accepted_at: acceptedAt,
    profile_draft: profileDraft,
  };

  const receiptWithoutDigest: OfferAcceptanceReceiptWithoutDigest = {
    seed_id: PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_SEED_ID,
    component_id: PHASE_6C_OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6COfferAcceptanceEmployeeCreationRequest',
    event_name: OFFER_ACCEPTANCE_EMPLOYEE_CREATION_REQUEST_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    runtime_status: 'RECOMMENDED_EXPLICIT_STEP_REQUIRED',
    acceptance_recommends_employee_creation: true,
    employee_creation_explicit_step_required: true,
    employee_creation_executed: false,
    employee_record_mutation_allowed: false,
    person_identity_mutation_allowed: false,
    access_provisioning_executed: false,
    recommendation_payload: recommendationPayload,
    decision_refs: ['6C-RECRUIT-007'],
    evidence_artifacts: [
      'offer_acceptance_employee_creation_request_runtime_receipt',
      'offer_acceptance_employee_creation_request_validation_result',
      'offer_acceptance_employee_creation_request_forbidden_behavior_rejection_evidence',
    ],
    control_metadata: input.control_metadata ?? {},
    employee_creation_requested_by_user_id: employeeCreationRequestedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    offer_acceptance_employee_creation_request_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
