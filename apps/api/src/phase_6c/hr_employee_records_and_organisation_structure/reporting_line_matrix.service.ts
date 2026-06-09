import { createHash } from 'node:crypto';

export const PHASE_6C_REPORTING_LINE_MATRIX_SEED_ID = "seed_6c_004_reporting_line_matrix" as const;
export const PHASE_6C_REPORTING_LINE_MATRIX_COMPONENT_ID = "6C.01" as const;
export const REPORTING_LINE_MATRIX_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.reporting_line_matrix.runtime_evaluated" as const;

export type ReportingLineType = 'PRIMARY' | 'DOTTED';
export type ReportingLineStatus = 'ACTIVE' | 'SCHEDULED' | 'ENDED';

export type ReportingLineDefinition = {
  line_ref: string;
  employee_record_ref: string;
  manager_employee_record_ref: string;
  line_type: ReportingLineType;
  effective_from: string;
  effective_to?: string;
};

export type ReportingLineMatrixRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  reporting_lines: readonly ReportingLineDefinition[];
  control_metadata?: Record<string, unknown>;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedReportingLine = ReportingLineDefinition & {
  line_status: ReportingLineStatus;
};

export type ReportingLineMatrixRuntimeReceipt = {
  seed_id: typeof PHASE_6C_REPORTING_LINE_MATRIX_SEED_ID;
  component_id: typeof PHASE_6C_REPORTING_LINE_MATRIX_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6CReportingLineMatrix";
  event_name: typeof REPORTING_LINE_MATRIX_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'REPORTING_LINE_MATRIX_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  reporting_lines: readonly NormalizedReportingLine[];
  matrix_counts: {
    total_lines: number;
    active_lines: number;
    active_primary_lines: number;
    active_dotted_lines: number;
    employees_with_active_primary_manager: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for reporting_line_matrix runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for reporting_line_matrix runtime.');
  }
  return normalized;
}

function requireLineType(value: ReportingLineType): ReportingLineType {
  if (value !== 'PRIMARY' && value !== 'DOTTED') {
    throw new Error('line_type must be PRIMARY or DOTTED for reporting_line_matrix runtime.');
  }
  return value;
}

function lineStatus(line: ReportingLineDefinition, evaluatedAt: string): ReportingLineStatus {
  const evaluatedTime = Date.parse(evaluatedAt);
  const fromTime = Date.parse(line.effective_from);
  const toTime = line.effective_to === undefined ? undefined : Date.parse(line.effective_to);
  if (fromTime > evaluatedTime) {
    return 'SCHEDULED';
  }
  if (toTime !== undefined && toTime < evaluatedTime) {
    return 'ENDED';
  }
  return 'ACTIVE';
}

function assertUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(field + ' must be unique for reporting_line_matrix runtime: ' + value);
    }
    seen.add(value);
  }
}

function assertNoPrimaryCycle(activePrimaryLines: readonly NormalizedReportingLine[]): void {
  const managerByEmployee = new Map<string, string>();
  for (const line of activePrimaryLines) {
    managerByEmployee.set(line.employee_record_ref, line.manager_employee_record_ref);
  }
  for (const employee of managerByEmployee.keys()) {
    const visited = new Set<string>();
    let cursor: string | undefined = employee;
    while (cursor !== undefined) {
      if (visited.has(cursor)) {
        throw new Error('active PRIMARY reporting lines must not create a management cycle for reporting_line_matrix runtime.');
      }
      visited.add(cursor);
      cursor = managerByEmployee.get(cursor);
    }
  }
}

function digestRuntime(receiptWithoutDigest: Omit<ReportingLineMatrixRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateReportingLineMatrixRuntime(input: ReportingLineMatrixRuntimeInput): ReportingLineMatrixRuntimeReceipt {
  if (input.schema_mutation_requested === true) {
    throw new Error('reporting_line_matrix runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('reporting_line_matrix runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('reporting_line_matrix runtime must not mutate Phase 6B finance or billing records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('reporting_line_matrix runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('reporting_line_matrix runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const reportingLines = input.reporting_lines.map((line) => {
    const effectiveFrom = requireTimestamp(line.effective_from, 'line_effective_from');
    const effectiveTo = line.effective_to === undefined ? undefined : requireTimestamp(line.effective_to, 'line_effective_to');
    if (effectiveTo !== undefined && Date.parse(effectiveTo) < Date.parse(effectiveFrom)) {
      throw new Error('line effective_to must not be before effective_from for reporting_line_matrix runtime.');
    }
    const normalizedLine: ReportingLineDefinition = {
      line_ref: requireNonEmpty(line.line_ref, 'line_ref'),
      employee_record_ref: requireNonEmpty(line.employee_record_ref, 'employee_record_ref'),
      manager_employee_record_ref: requireNonEmpty(line.manager_employee_record_ref, 'manager_employee_record_ref'),
      line_type: requireLineType(line.line_type),
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
    };
    if (normalizedLine.employee_record_ref === normalizedLine.manager_employee_record_ref) {
      throw new Error('employee must not report to self for reporting_line_matrix runtime.');
    }
    return {
      ...normalizedLine,
      line_status: lineStatus(normalizedLine, evaluatedAt),
    };
  }).sort((left, right) => left.employee_record_ref.localeCompare(right.employee_record_ref) || left.line_type.localeCompare(right.line_type) || left.line_ref.localeCompare(right.line_ref));
  assertUnique(reportingLines.map((line) => line.line_ref), 'line_ref');

  const activePrimaryLines = reportingLines.filter((line) => line.line_status === 'ACTIVE' && line.line_type === 'PRIMARY');
  const primaryEmployees = activePrimaryLines.map((line) => line.employee_record_ref);
  assertUnique(primaryEmployees, 'active PRIMARY employee_record_ref');
  assertNoPrimaryCycle(activePrimaryLines);

  const receiptWithoutDigest: Omit<ReportingLineMatrixRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_REPORTING_LINE_MATRIX_SEED_ID,
    component_id: PHASE_6C_REPORTING_LINE_MATRIX_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6CReportingLineMatrix",
    event_name: REPORTING_LINE_MATRIX_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'REPORTING_LINE_MATRIX_VALIDATED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-HR-EMP-006", "6C-SCHEMA-006", "6C-NON-007"],
    reporting_lines: reportingLines,
    matrix_counts: {
      total_lines: reportingLines.length,
      active_lines: reportingLines.filter((line) => line.line_status === 'ACTIVE').length,
      active_primary_lines: activePrimaryLines.length,
      active_dotted_lines: reportingLines.filter((line) => line.line_status === 'ACTIVE' && line.line_type === 'DOTTED').length,
      employees_with_active_primary_manager: new Set(primaryEmployees).size,
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
