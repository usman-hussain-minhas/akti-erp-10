import { createHash } from 'node:crypto';

export const PHASE_6C_APPLICANT_STAGED_DELETION_SEED_ID = 'seed_6c_021_applicant_staged_deletion' as const;
export const PHASE_6C_APPLICANT_STAGED_DELETION_COMPONENT_ID = '6C.02' as const;
export const APPLICANT_STAGED_DELETION_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.applicant_staged_deletion.evaluated' as const;

export type ApplicantDeletionStage =
  | 'ACTIVE'
  | 'SOFT_DELETE_REQUESTED'
  | 'SOFT_DELETED'
  | 'PERMANENT_DELETION_SCHEDULED'
  | 'DELETION_BLOCKED'
  | 'DELETION_CANCELLED';

export type ApplicantDeletionAction =
  | 'REQUEST_SOFT_DELETE'
  | 'CONFIRM_SOFT_DELETE'
  | 'SCHEDULE_PERMANENT_DELETION'
  | 'CANCEL_DELETION';

export type ApplicantDeletionProtectionRef = {
  protection_ref: string;
  reason: string;
  active: boolean;
};

export type ApplicantStagedDeletionInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  requested_action: ApplicantDeletionAction;
  current_stage: ApplicantDeletionStage;
  requested_by_user_id: string;
  requested_at: string;
  retention_policy_ref: string;
  permanent_deletion_not_before?: string;
  crm_lead_ref?: string;
  employee_creation_request_ref?: string;
  protection_refs: readonly ApplicantDeletionProtectionRef[];
  control_metadata?: Record<string, unknown>;
  immediate_deletion_requested?: boolean;
  hard_delete_execution_requested?: boolean;
  direct_crm_mutation_requested?: boolean;
  employee_record_mutation_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type ApplicantStagedDeletionReceipt = {
  seed_id: typeof PHASE_6C_APPLICANT_STAGED_DELETION_SEED_ID;
  component_id: typeof PHASE_6C_APPLICANT_STAGED_DELETION_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6CApplicantStagedDeletion';
  event_name: typeof APPLICANT_STAGED_DELETION_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  runtime_status: 'APPLICANT_STAGED_DELETION_EVALUATED';
  requested_action: ApplicantDeletionAction;
  previous_stage: ApplicantDeletionStage;
  resulting_stage: ApplicantDeletionStage;
  deletion_execution_performed: false;
  immediate_deletion_allowed: false;
  hard_delete_allowed: false;
  direct_crm_mutation_allowed: false;
  employee_record_mutation_allowed: false;
  refs_events_only: true;
  retention_policy_ref: string;
  permanent_deletion_not_before: string | null;
  active_protection_refs: readonly string[];
  inactive_protection_refs: readonly string[];
  blocked: boolean;
  block_reasons: readonly string[];
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  requested_by_user_id: string;
  requested_at: string;
  applicant_staged_deletion_evidence_digest: string;
};

type ReceiptWithoutDigest = Omit<ApplicantStagedDeletionReceipt, 'applicant_staged_deletion_evidence_digest'>;

const DECISION_REFS = ['6C-RECRUIT-013', '6C-RECRUIT-002', '6C-GLOBAL-018'] as const;
const EVIDENCE_ARTIFACTS = [
  'applicant_staged_deletion_runtime_receipt',
  'applicant_staged_deletion_validation_result',
  'applicant_staged_deletion_forbidden_behavior_rejection_evidence',
] as const;
const STAGES = new Set<ApplicantDeletionStage>([
  'ACTIVE',
  'SOFT_DELETE_REQUESTED',
  'SOFT_DELETED',
  'PERMANENT_DELETION_SCHEDULED',
  'DELETION_BLOCKED',
  'DELETION_CANCELLED',
]);
const ACTIONS = new Set<ApplicantDeletionAction>([
  'REQUEST_SOFT_DELETE',
  'CONFIRM_SOFT_DELETE',
  'SCHEDULE_PERMANENT_DELETION',
  'CANCEL_DELETION',
]);

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for applicant_staged_deletion runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for applicant_staged_deletion runtime.');
  }
  return normalized;
}

function rejectForbiddenRequests(input: ApplicantStagedDeletionInput): void {
  if (input.immediate_deletion_requested === true) {
    throw new Error('applicant_staged_deletion runtime must stage deletion, not perform immediate deletion.');
  }
  if (input.hard_delete_execution_requested === true) {
    throw new Error('applicant_staged_deletion runtime must not execute hard deletion.');
  }
  if (input.direct_crm_mutation_requested === true) {
    throw new Error('applicant_staged_deletion runtime must retain CRM references and must not mutate CRM records.');
  }
  if (input.employee_record_mutation_requested === true) {
    throw new Error('applicant_staged_deletion runtime must not mutate employee records.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('applicant_staged_deletion runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('applicant_staged_deletion runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('applicant_staged_deletion runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('applicant_staged_deletion runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('applicant_staged_deletion runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeProtections(protectionRefs: readonly ApplicantDeletionProtectionRef[]): {
  activeProtectionRefs: string[];
  inactiveProtectionRefs: string[];
  blockReasons: string[];
} {
  if (!Array.isArray(protectionRefs)) {
    throw new Error('protection_refs must be provided for applicant_staged_deletion runtime.');
  }

  const seen = new Set<string>();
  const activeProtectionRefs: string[] = [];
  const inactiveProtectionRefs: string[] = [];
  const blockReasons: string[] = [];

  for (const protection of protectionRefs) {
    const protectionRef = requireNonEmpty(protection.protection_ref, 'protection_ref');
    const reason = requireNonEmpty(protection.reason, 'protection reason');
    if (seen.has(protectionRef)) {
      throw new Error('protection_ref must be unique for applicant_staged_deletion runtime: ' + protectionRef);
    }
    if (typeof protection.active !== 'boolean') {
      throw new Error('protection active flag must be boolean for applicant_staged_deletion runtime: ' + protectionRef);
    }
    seen.add(protectionRef);
    if (protection.active) {
      activeProtectionRefs.push(protectionRef);
      blockReasons.push(reason);
    } else {
      inactiveProtectionRefs.push(protectionRef);
    }
  }

  return {
    activeProtectionRefs: activeProtectionRefs.sort(),
    inactiveProtectionRefs: inactiveProtectionRefs.sort(),
    blockReasons: blockReasons.sort(),
  };
}

function computeResultingStage(input: ApplicantStagedDeletionInput, activeProtectionCount: number): ApplicantDeletionStage {
  if (!STAGES.has(input.current_stage)) {
    throw new Error('current_stage is not supported for applicant_staged_deletion runtime: ' + input.current_stage);
  }
  if (!ACTIONS.has(input.requested_action)) {
    throw new Error('requested_action is not supported for applicant_staged_deletion runtime: ' + input.requested_action);
  }

  if (input.requested_action === 'REQUEST_SOFT_DELETE') {
    if (input.current_stage !== 'ACTIVE' && input.current_stage !== 'DELETION_CANCELLED') {
      throw new Error('REQUEST_SOFT_DELETE requires ACTIVE or DELETION_CANCELLED current stage.');
    }
    return activeProtectionCount > 0 ? 'DELETION_BLOCKED' : 'SOFT_DELETE_REQUESTED';
  }
  if (input.requested_action === 'CONFIRM_SOFT_DELETE') {
    if (input.current_stage !== 'SOFT_DELETE_REQUESTED') {
      throw new Error('CONFIRM_SOFT_DELETE requires SOFT_DELETE_REQUESTED current stage.');
    }
    return activeProtectionCount > 0 ? 'DELETION_BLOCKED' : 'SOFT_DELETED';
  }
  if (input.requested_action === 'SCHEDULE_PERMANENT_DELETION') {
    if (input.current_stage !== 'SOFT_DELETED') {
      throw new Error('SCHEDULE_PERMANENT_DELETION requires SOFT_DELETED current stage.');
    }
    if (activeProtectionCount > 0) {
      return 'DELETION_BLOCKED';
    }
    const permanentDeletionNotBefore = requireTimestamp(input.permanent_deletion_not_before, 'permanent_deletion_not_before');
    const requestedAt = requireTimestamp(input.requested_at, 'requested_at');
    if (Date.parse(permanentDeletionNotBefore) <= Date.parse(requestedAt)) {
      throw new Error('permanent_deletion_not_before must be after requested_at for staged deletion scheduling.');
    }
    return 'PERMANENT_DELETION_SCHEDULED';
  }

  if (input.current_stage === 'ACTIVE') {
    throw new Error('CANCEL_DELETION requires an in-progress staged deletion current stage.');
  }
  return 'DELETION_CANCELLED';
}

function digestReceipt(receiptWithoutDigest: ReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateApplicantStagedDeletionRuntime(input: ApplicantStagedDeletionInput): ApplicantStagedDeletionReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const applicantRef = requireNonEmpty(input.applicant_ref, 'applicant_ref');
  const retentionPolicyRef = requireNonEmpty(input.retention_policy_ref, 'retention_policy_ref');
  const requestedByUserId = requireNonEmpty(input.requested_by_user_id, 'requested_by_user_id');
  const requestedAt = requireTimestamp(input.requested_at, 'requested_at');
  if (input.crm_lead_ref !== undefined) {
    requireNonEmpty(input.crm_lead_ref, 'crm_lead_ref');
  }
  if (input.employee_creation_request_ref !== undefined) {
    requireNonEmpty(input.employee_creation_request_ref, 'employee_creation_request_ref');
  }

  const protectionSummary = normalizeProtections(input.protection_refs);
  const resultingStage = computeResultingStage(input, protectionSummary.activeProtectionRefs.length);
  const permanentDeletionNotBefore = input.permanent_deletion_not_before === undefined
    ? null
    : requireTimestamp(input.permanent_deletion_not_before, 'permanent_deletion_not_before');
  const blocked = resultingStage === 'DELETION_BLOCKED';
  const blockReasons = blocked ? protectionSummary.blockReasons : [];

  const receiptWithoutDigest: ReceiptWithoutDigest = {
    seed_id: PHASE_6C_APPLICANT_STAGED_DELETION_SEED_ID,
    component_id: PHASE_6C_APPLICANT_STAGED_DELETION_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6CApplicantStagedDeletion',
    event_name: APPLICANT_STAGED_DELETION_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    applicant_ref: applicantRef,
    runtime_status: 'APPLICANT_STAGED_DELETION_EVALUATED',
    requested_action: input.requested_action,
    previous_stage: input.current_stage,
    resulting_stage: resultingStage,
    deletion_execution_performed: false,
    immediate_deletion_allowed: false,
    hard_delete_allowed: false,
    direct_crm_mutation_allowed: false,
    employee_record_mutation_allowed: false,
    refs_events_only: true,
    retention_policy_ref: retentionPolicyRef,
    permanent_deletion_not_before: permanentDeletionNotBefore,
    active_protection_refs: protectionSummary.activeProtectionRefs,
    inactive_protection_refs: protectionSummary.inactiveProtectionRefs,
    blocked,
    block_reasons: blockReasons,
    decision_refs: DECISION_REFS,
    evidence_artifacts: EVIDENCE_ARTIFACTS,
    control_metadata: input.control_metadata ?? {},
    requested_by_user_id: requestedByUserId,
    requested_at: requestedAt,
  };

  return {
    ...receiptWithoutDigest,
    applicant_staged_deletion_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
