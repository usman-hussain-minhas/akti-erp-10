import { createHash } from 'node:crypto';

export const PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_SEED_ID = "seed_6c_005_employment_contract_record" as const;
export const PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_COMPONENT_ID = "6C.01" as const;
export const EMPLOYMENT_CONTRACT_RECORD_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employment_contract_record.runtime_evaluated" as const;

export type EmploymentContractType = 'PERMANENT' | 'FIXED_TERM' | 'PROBATION' | 'CONSULTANT' | 'INTERN';
export type EmploymentContractStatus = 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'SUPERSEDED';

export type EmploymentContractRecord = {
  contract_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  contract_type: EmploymentContractType;
  version: number;
  effective_from: string;
  effective_to?: string;
  signed_at?: string;
  probation_end_at?: string;
  renewal_notice_days?: number;
  compensation_policy_ref?: string;
  document_evidence_ref: string;
};

export type EmploymentContractRecordRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  contracts: readonly EmploymentContractRecord[];
  control_metadata?: Record<string, unknown>;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedEmploymentContractRecord = EmploymentContractRecord & {
  contract_status: EmploymentContractStatus;
};

export type EmploymentContractRecordRuntimeReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmploymentContractRecord";
  event_name: typeof EMPLOYMENT_CONTRACT_RECORD_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'EMPLOYMENT_CONTRACT_RECORD_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  contracts: readonly NormalizedEmploymentContractRecord[];
  contract_counts: {
    total_contracts: number;
    active_contracts: number;
    scheduled_contracts: number;
    expired_contracts: number;
    signed_contracts: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for employment_contract_record runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for employment_contract_record runtime.');
  }
  return normalized;
}

function optionalTimestamp(value: string | undefined, field: string): string | undefined {
  return value === undefined ? undefined : requireTimestamp(value, field);
}

function requireContractType(value: EmploymentContractType): EmploymentContractType {
  const allowed = new Set<EmploymentContractType>(['PERMANENT', 'FIXED_TERM', 'PROBATION', 'CONSULTANT', 'INTERN']);
  if (!allowed.has(value)) {
    throw new Error('contract_type must be a supported employment contract type for employment_contract_record runtime.');
  }
  return value;
}

function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for employment_contract_record runtime.');
  }
  return value;
}

function optionalNonNegativeInteger(value: number | undefined, field: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(field + ' must be a non-negative integer for employment_contract_record runtime.');
  }
  return value;
}

function contractStatus(contract: EmploymentContractRecord, evaluatedAt: string): EmploymentContractStatus {
  if (contract.signed_at === undefined) {
    return 'DRAFT';
  }
  const evaluatedTime = Date.parse(evaluatedAt);
  const fromTime = Date.parse(contract.effective_from);
  const toTime = contract.effective_to === undefined ? undefined : Date.parse(contract.effective_to);
  if (fromTime > evaluatedTime) {
    return 'SCHEDULED';
  }
  if (toTime !== undefined && toTime < evaluatedTime) {
    return 'EXPIRED';
  }
  return 'ACTIVE';
}

function assertUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(field + ' must be unique for employment_contract_record runtime: ' + value);
    }
    seen.add(value);
  }
}

function digestRuntime(receiptWithoutDigest: Omit<EmploymentContractRecordRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateEmploymentContractRecordRuntime(input: EmploymentContractRecordRuntimeInput): EmploymentContractRecordRuntimeReceipt {
  if (input.schema_mutation_requested === true) {
    throw new Error('employment_contract_record runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('employment_contract_record runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('employment_contract_record runtime must not mutate Phase 6B finance or billing records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('employment_contract_record runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('employment_contract_record runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const contracts = input.contracts.map((contract) => {
    const effectiveFrom = requireTimestamp(contract.effective_from, 'contract_effective_from');
    const effectiveTo = optionalTimestamp(contract.effective_to, 'contract_effective_to');
    const signedAt = optionalTimestamp(contract.signed_at, 'contract_signed_at');
    const probationEndAt = optionalTimestamp(contract.probation_end_at, 'contract_probation_end_at');
    if (effectiveTo !== undefined && Date.parse(effectiveTo) < Date.parse(effectiveFrom)) {
      throw new Error('contract effective_to must not be before effective_from for employment_contract_record runtime.');
    }
    if (signedAt !== undefined && Date.parse(signedAt) > Date.parse(effectiveFrom)) {
      throw new Error('contract signed_at must not be after effective_from for employment_contract_record runtime.');
    }
    if (probationEndAt !== undefined && Date.parse(probationEndAt) < Date.parse(effectiveFrom)) {
      throw new Error('contract probation_end_at must not be before effective_from for employment_contract_record runtime.');
    }

    const normalizedContract: EmploymentContractRecord = {
      contract_ref: requireNonEmpty(contract.contract_ref, 'contract_ref'),
      employee_record_ref: requireNonEmpty(contract.employee_record_ref, 'employee_record_ref'),
      person_identity_anchor_id: requireNonEmpty(contract.person_identity_anchor_id, 'person_identity_anchor_id'),
      contract_type: requireContractType(contract.contract_type),
      version: requirePositiveInteger(contract.version, 'contract_version'),
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
      signed_at: signedAt,
      probation_end_at: probationEndAt,
      renewal_notice_days: optionalNonNegativeInteger(contract.renewal_notice_days, 'renewal_notice_days'),
      compensation_policy_ref: contract.compensation_policy_ref === undefined ? undefined : requireNonEmpty(contract.compensation_policy_ref, 'compensation_policy_ref'),
      document_evidence_ref: requireNonEmpty(contract.document_evidence_ref, 'document_evidence_ref'),
    };
    if (normalizedContract.contract_type === 'FIXED_TERM' && normalizedContract.effective_to === undefined) {
      throw new Error('FIXED_TERM contracts require effective_to for employment_contract_record runtime.');
    }
    if (normalizedContract.contract_type === 'PROBATION' && normalizedContract.probation_end_at === undefined) {
      throw new Error('PROBATION contracts require probation_end_at for employment_contract_record runtime.');
    }
    return {
      ...normalizedContract,
      contract_status: contractStatus(normalizedContract, evaluatedAt),
    };
  }).sort((left, right) => left.employee_record_ref.localeCompare(right.employee_record_ref) || left.version - right.version || left.contract_ref.localeCompare(right.contract_ref));
  assertUnique(contracts.map((contract) => contract.contract_ref), 'contract_ref');

  const activeByEmployee = new Map<string, string>();
  for (const contract of contracts) {
    if (contract.contract_status === 'ACTIVE') {
      const existing = activeByEmployee.get(contract.employee_record_ref);
      if (existing !== undefined) {
        throw new Error('employee must not have multiple ACTIVE contracts for employment_contract_record runtime: ' + contract.employee_record_ref);
      }
      activeByEmployee.set(contract.employee_record_ref, contract.contract_ref);
    }
  }

  const receiptWithoutDigest: Omit<EmploymentContractRecordRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_SEED_ID,
    component_id: PHASE_6C_EMPLOYMENT_CONTRACT_RECORD_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CEmploymentContractRecord",
    event_name: EMPLOYMENT_CONTRACT_RECORD_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'EMPLOYMENT_CONTRACT_RECORD_VALIDATED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-HR-EMP-007", "6C-SCHEMA-006", "6C-NON-007"],
    contracts,
    contract_counts: {
      total_contracts: contracts.length,
      active_contracts: contracts.filter((contract) => contract.contract_status === 'ACTIVE').length,
      scheduled_contracts: contracts.filter((contract) => contract.contract_status === 'SCHEDULED').length,
      expired_contracts: contracts.filter((contract) => contract.contract_status === 'EXPIRED').length,
      signed_contracts: contracts.filter((contract) => contract.signed_at !== undefined).length,
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
