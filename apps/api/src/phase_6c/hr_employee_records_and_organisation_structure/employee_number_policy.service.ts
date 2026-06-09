import { createHash } from 'node:crypto';

export const PHASE_6C_EMPLOYEE_NUMBER_POLICY_SEED_ID = "seed_6c_002_employee_number_policy" as const;
export const PHASE_6C_EMPLOYEE_NUMBER_POLICY_COMPONENT_ID = "6C.01" as const;
export const EMPLOYEE_NUMBER_POLICY_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.employee_number_policy.evaluated" as const;

export type EmployeeDisplayNumberPolicyConfig = {
  prefix: string;
  sequence_value: number;
  padding_width: number;
  separator?: string;
  suffix?: string;
};

export type EmployeeNumberPolicyInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  stable_employee_uuid: string;
  employee_person_extension_ref: string;
  policy_config: EmployeeDisplayNumberPolicyConfig;
  evaluated_by_user_id: string;
  evaluated_at: string;
  source_record_ref?: string;
  control_metadata?: Record<string, unknown>;
  hardcoded_display_number_requested?: boolean;
  schema_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
};

export type EmployeeNumberPolicyReceipt = {
  seed_id: typeof PHASE_6C_EMPLOYEE_NUMBER_POLICY_SEED_ID;
  component_id: typeof PHASE_6C_EMPLOYEE_NUMBER_POLICY_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CEmployeeNumberPolicy";
  event_name: typeof EMPLOYEE_NUMBER_POLICY_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  stable_employee_uuid: string;
  employee_person_extension_ref: string;
  display_employee_number: string;
  policy_config: Required<EmployeeDisplayNumberPolicyConfig>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  source_record_ref: string;
  decision_refs: readonly string[];
  dependency_refs: readonly string[];
  control_metadata: Record<string, unknown>;
  runtime_status: 'EMPLOYEE_NUMBER_POLICY_EVALUATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  employee_number_policy_evidence_digest: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required for employee_number_policy runtime behavior.`);
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(`${field} must be a valid ISO-compatible timestamp for employee_number_policy runtime behavior.`);
  }
  return normalized;
}

function requireStableUuid(value: string | undefined): string {
  const normalized = requireNonEmpty(value, 'stable_employee_uuid').toLowerCase();
  if (!UUID_PATTERN.test(normalized)) {
    throw new Error('stable_employee_uuid must be a stable UUID for employee_number_policy runtime behavior.');
  }
  return normalized;
}

function requirePolicyConfig(config: EmployeeDisplayNumberPolicyConfig | undefined): Required<EmployeeDisplayNumberPolicyConfig> {
  if (!config) {
    throw new Error('policy_config is required for employee_number_policy runtime behavior.');
  }
  const sequenceValue = config.sequence_value;
  const paddingWidth = config.padding_width;
  if (!Number.isInteger(sequenceValue) || sequenceValue < 0) {
    throw new Error('policy_config.sequence_value must be a non-negative integer for employee_number_policy runtime behavior.');
  }
  if (!Number.isInteger(paddingWidth) || paddingWidth < 1 || paddingWidth > 24) {
    throw new Error('policy_config.padding_width must be an integer between 1 and 24 for employee_number_policy runtime behavior.');
  }
  return {
    prefix: requireNonEmpty(config.prefix, 'policy_config.prefix'),
    sequence_value: sequenceValue,
    padding_width: paddingWidth,
    separator: config.separator === undefined ? '-' : config.separator,
    suffix: config.suffix === undefined ? '' : config.suffix.trim(),
  };
}

function stableMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!metadata) return {};
  return Object.fromEntries(Object.entries(metadata).sort(([left], [right]) => left.localeCompare(right)));
}

function formatDisplayNumber(config: Required<EmployeeDisplayNumberPolicyConfig>): string {
  const sequence = String(config.sequence_value).padStart(config.padding_width, '0');
  const body = `${config.prefix}${config.separator}${sequence}`;
  return config.suffix.length > 0 ? `${body}${config.separator}${config.suffix}` : body;
}

function digestReceipt(receiptWithoutDigest: Omit<EmployeeNumberPolicyReceipt, 'employee_number_policy_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateEmployeeNumberPolicy(input: EmployeeNumberPolicyInput): EmployeeNumberPolicyReceipt {
  if (input.hardcoded_display_number_requested === true) {
    throw new Error('employee_number_policy must derive display numbers from configurable policy, not hardcoded values.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('employee_number_policy must not mutate Prisma schema or migrations.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('employee_number_policy must not execute external runtime adapters.');
  }

  const stableEmployeeUuid = requireStableUuid(input.stable_employee_uuid);
  const employeePersonExtensionRef = requireNonEmpty(input.employee_person_extension_ref, 'employee_person_extension_ref');
  const policyConfig = requirePolicyConfig(input.policy_config);
  const receiptWithoutDigest: Omit<EmployeeNumberPolicyReceipt, 'employee_number_policy_evidence_digest'> = {
    seed_id: PHASE_6C_EMPLOYEE_NUMBER_POLICY_SEED_ID,
    component_id: PHASE_6C_EMPLOYEE_NUMBER_POLICY_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CEmployeeNumberPolicy",
    event_name: EMPLOYEE_NUMBER_POLICY_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    stable_employee_uuid: stableEmployeeUuid,
    employee_person_extension_ref: employeePersonExtensionRef,
    display_employee_number: formatDisplayNumber(policyConfig),
    policy_config: policyConfig,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
    source_record_ref: input.source_record_ref?.trim() || employeePersonExtensionRef,
    decision_refs: ["6C-HR-EMP-001"],
    dependency_refs: ["seed_6a_service_manifest_contract", "seed_6c_001_employee_person_extension"],
    control_metadata: stableMetadata(input.control_metadata),
    runtime_status: 'EMPLOYEE_NUMBER_POLICY_EVALUATED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
  };

  return {
    ...receiptWithoutDigest,
    employee_number_policy_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
