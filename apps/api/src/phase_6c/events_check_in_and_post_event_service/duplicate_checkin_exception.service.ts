import { createHash } from 'node:crypto';

export const PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_SEED_ID = "seed_6c_117_duplicate_checkin_exception" as const;
export const PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_COMPONENT_ID = "6C.09" as const;
export const DUPLICATE_CHECKIN_EXCEPTION_SCAFFOLD_EVENT = "phase_6c.events_check_in_and_post_event_service.duplicate_checkin_exception.scaffold_control_evaluated" as const;

export type DuplicateCheckinExceptionScaffoldInput = {
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

export type DuplicateCheckinExceptionScaffoldReceipt = {
  seed_id: typeof PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_SEED_ID;
  component_id: typeof PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CDuplicateCheckinException";
  event_name: typeof DUPLICATE_CHECKIN_EXCEPTION_SCAFFOLD_EVENT;
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
    throw new Error(field + ' is required for duplicate_checkin_exception scaffold control.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for duplicate_checkin_exception scaffold control.');
  }
  return normalized;
}

function digestScaffold(receiptWithoutDigest: Omit<DuplicateCheckinExceptionScaffoldReceipt, 'scaffold_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateDuplicateCheckinExceptionScaffold(input: DuplicateCheckinExceptionScaffoldInput): DuplicateCheckinExceptionScaffoldReceipt {
  if (input.capability_execution_requested === true) {
    throw new Error('duplicate_checkin_exception scaffold control must not execute capability behavior.');
  }
  if (input.business_behavior_requested === true) {
    throw new Error('duplicate_checkin_exception scaffold control must not execute business behavior.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('duplicate_checkin_exception scaffold control must not execute runtime adapter behavior.');
  }

  const receiptWithoutDigest: Omit<DuplicateCheckinExceptionScaffoldReceipt, 'scaffold_evidence_digest'> = {
    seed_id: PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_SEED_ID,
    component_id: PHASE_6C_DUPLICATE_CHECKIN_EXCEPTION_COMPONENT_ID,
    component_slug: "events_check_in_and_post_event_service",
    model_name: "Phase6CDuplicateCheckinException",
    event_name: DUPLICATE_CHECKIN_EXCEPTION_SCAFFOLD_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    scaffold_status: 'SCAFFOLD_CONTROL_ONLY',
    capability_implementation_allowed: false,
    business_behavior_allowed: false,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-EVENT-CHECK-007"],
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    scaffold_evidence_digest: digestScaffold(receiptWithoutDigest),
  };
}
