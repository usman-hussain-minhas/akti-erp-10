import { createHash } from 'node:crypto';

export const PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_SEED_ID = "seed_6c_007_compensation_metadata_payroll_evidence" as const;
export const PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_COMPONENT_ID = "6C.01" as const;
export const COMPENSATION_METADATA_PAYROLL_EVIDENCE_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.compensation_metadata_payroll_evidence.runtime_evaluated" as const;

export type CompensationPayBasis = 'SALARY' | 'HOURLY' | 'STIPEND' | 'COMMISSION_ELIGIBLE';
export type CompensationEvidenceStatus = 'ACTIVE' | 'SCHEDULED' | 'ENDED';

export type CompensationMetadataRecord = {
  compensation_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  compensation_policy_ref: string;
  pay_basis: CompensationPayBasis;
  amount_minor_units: number;
  currency_code: string;
  effective_from: string;
  effective_to?: string;
};

export type PayrollEvidenceEnvelope = {
  payroll_evidence_ref: string;
  compensation_ref: string;
  employee_record_ref: string;
  evidence_target: 'PHASE_6B_PAYROLL_REFERENCE';
  evidence_mode: 'REFERENCE_ONLY';
  evidence_hash: string;
};

export type CompensationMetadataPayrollEvidenceRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  compensation_records: readonly CompensationMetadataRecord[];
  control_metadata?: Record<string, unknown>;
  payroll_calculation_requested?: boolean;
  payroll_run_generation_requested?: boolean;
  payment_disbursement_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedCompensationMetadataRecord = CompensationMetadataRecord & {
  evidence_status: CompensationEvidenceStatus;
};

export type CompensationMetadataPayrollEvidenceRuntimeReceipt = {
  seed_id: typeof PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_SEED_ID;
  component_id: typeof PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CCompensationMetadataPayrollEvidence";
  event_name: typeof COMPENSATION_METADATA_PAYROLL_EVIDENCE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'COMPENSATION_PAYROLL_EVIDENCE_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  payroll_ownership_allowed: false;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  compensation_records: readonly NormalizedCompensationMetadataRecord[];
  payroll_evidence_envelopes: readonly PayrollEvidenceEnvelope[];
  evidence_counts: {
    total_records: number;
    active_records: number;
    scheduled_records: number;
    ended_records: number;
    payroll_reference_envelopes: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for compensation_metadata_payroll_evidence runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for compensation_metadata_payroll_evidence runtime.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : requireTimestamp(value, field);
}

function requirePayBasis(value: CompensationPayBasis): CompensationPayBasis {
  const allowed = new Set<CompensationPayBasis>(['SALARY', 'HOURLY', 'STIPEND', 'COMMISSION_ELIGIBLE']);
  if (!allowed.has(value)) {
    throw new Error('pay_basis must be supported for compensation_metadata_payroll_evidence runtime.');
  }
  return value;
}

function requireMinorUnits(value: number): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('amount_minor_units must be a non-negative integer for compensation_metadata_payroll_evidence runtime.');
  }
  return value;
}

function requireCurrencyCode(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'currency_code').toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new Error('currency_code must be a three-letter ISO-style code for compensation_metadata_payroll_evidence runtime.');
  }
  return normalized;
}

function assertUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(field + ' must be unique for compensation_metadata_payroll_evidence runtime: ' + value);
    }
    seen.add(value);
  }
}

function evidenceStatus(record: CompensationMetadataRecord, evaluatedAt: string): CompensationEvidenceStatus {
  const evaluatedTime = Date.parse(evaluatedAt);
  const fromTime = Date.parse(record.effective_from);
  const toTime = record.effective_to === undefined ? undefined : Date.parse(record.effective_to);
  if (fromTime > evaluatedTime) {
    return 'SCHEDULED';
  }
  if (toTime !== undefined && toTime < evaluatedTime) {
    return 'ENDED';
  }
  return 'ACTIVE';
}

function sha256(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function payrollEvidenceEnvelope(record: NormalizedCompensationMetadataRecord): PayrollEvidenceEnvelope {
  return {
    payroll_evidence_ref: 'payroll_evidence_' + sha256({
      compensation_ref: record.compensation_ref,
      employee_record_ref: record.employee_record_ref,
      effective_from: record.effective_from,
      evidence_status: record.evidence_status,
    }).slice(0, 24),
    compensation_ref: record.compensation_ref,
    employee_record_ref: record.employee_record_ref,
    evidence_target: 'PHASE_6B_PAYROLL_REFERENCE',
    evidence_mode: 'REFERENCE_ONLY',
    evidence_hash: sha256(record),
  };
}

function digestRuntime(receiptWithoutDigest: Omit<CompensationMetadataPayrollEvidenceRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return sha256(receiptWithoutDigest);
}

export function evaluateCompensationMetadataPayrollEvidenceRuntime(input: CompensationMetadataPayrollEvidenceRuntimeInput): CompensationMetadataPayrollEvidenceRuntimeReceipt {
  if (input.payroll_calculation_requested === true) {
    throw new Error('compensation_metadata_payroll_evidence runtime must not calculate payroll.');
  }
  if (input.payroll_run_generation_requested === true) {
    throw new Error('compensation_metadata_payroll_evidence runtime must not generate payroll runs.');
  }
  if (input.payment_disbursement_requested === true) {
    throw new Error('compensation_metadata_payroll_evidence runtime must not disburse payments.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('compensation_metadata_payroll_evidence runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('compensation_metadata_payroll_evidence runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('compensation_metadata_payroll_evidence runtime must not mutate Phase 6B payroll records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('compensation_metadata_payroll_evidence runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('compensation_metadata_payroll_evidence runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const compensationRecords = input.compensation_records.map((record) => {
    const effectiveFrom = requireTimestamp(record.effective_from, 'compensation_effective_from');
    const effectiveTo = optionalTimestamp(record.effective_to, 'compensation_effective_to');
    if (effectiveTo !== undefined && Date.parse(effectiveTo) < Date.parse(effectiveFrom)) {
      throw new Error('compensation effective_to must not be before effective_from for compensation_metadata_payroll_evidence runtime.');
    }
    const normalizedRecord: CompensationMetadataRecord = {
      compensation_ref: requireNonEmpty(record.compensation_ref, 'compensation_ref'),
      employee_record_ref: requireNonEmpty(record.employee_record_ref, 'employee_record_ref'),
      person_identity_anchor_id: requireNonEmpty(record.person_identity_anchor_id, 'person_identity_anchor_id'),
      compensation_policy_ref: requireNonEmpty(record.compensation_policy_ref, 'compensation_policy_ref'),
      pay_basis: requirePayBasis(record.pay_basis),
      amount_minor_units: requireMinorUnits(record.amount_minor_units),
      currency_code: requireCurrencyCode(record.currency_code),
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
    };
    return {
      ...normalizedRecord,
      evidence_status: evidenceStatus(normalizedRecord, evaluatedAt),
    };
  }).sort((left, right) => left.employee_record_ref.localeCompare(right.employee_record_ref) || left.effective_from.localeCompare(right.effective_from) || left.compensation_ref.localeCompare(right.compensation_ref));
  assertUnique(compensationRecords.map((record) => record.compensation_ref), 'compensation_ref');

  const activeCompensationByEmployee = new Set<string>();
  for (const record of compensationRecords) {
    if (record.evidence_status === 'ACTIVE') {
      if (activeCompensationByEmployee.has(record.employee_record_ref)) {
        throw new Error('employee must not have multiple ACTIVE compensation metadata records for compensation_metadata_payroll_evidence runtime: ' + record.employee_record_ref);
      }
      activeCompensationByEmployee.add(record.employee_record_ref);
    }
  }

  const payrollEvidenceEnvelopes = compensationRecords.map(payrollEvidenceEnvelope);

  const receiptWithoutDigest: Omit<CompensationMetadataPayrollEvidenceRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_SEED_ID,
    component_id: PHASE_6C_COMPENSATION_METADATA_PAYROLL_EVIDENCE_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CCompensationMetadataPayrollEvidence",
    event_name: COMPENSATION_METADATA_PAYROLL_EVIDENCE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'COMPENSATION_PAYROLL_EVIDENCE_VALIDATED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    payroll_ownership_allowed: false,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-HR-EMP-011", "6C-SCHEMA-006", "6C-NON-007", "6C-GLOBAL-018"],
    compensation_records: compensationRecords,
    payroll_evidence_envelopes: payrollEvidenceEnvelopes,
    evidence_counts: {
      total_records: compensationRecords.length,
      active_records: compensationRecords.filter((record) => record.evidence_status === 'ACTIVE').length,
      scheduled_records: compensationRecords.filter((record) => record.evidence_status === 'SCHEDULED').length,
      ended_records: compensationRecords.filter((record) => record.evidence_status === 'ENDED').length,
      payroll_reference_envelopes: payrollEvidenceEnvelopes.length,
    },
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
