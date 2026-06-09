import { createHash } from 'node:crypto';

export const PHASE_6C_ORG_DEPARTMENT_TEAM_POSITION_SEED_ID = "seed_6c_003_org_department_team_position" as const;
export const PHASE_6C_ORG_DEPARTMENT_TEAM_POSITION_COMPONENT_ID = "6C.01" as const;
export const ORG_DEPARTMENT_TEAM_POSITION_EVENT = "phase_6c.hr_employee_records_and_organisation_structure.org_department_team_position.runtime_evaluated" as const;

export type OrgUnitStatus = 'ACTIVE' | 'INACTIVE';
export type AssignmentStatus = 'ACTIVE' | 'SCHEDULED' | 'ENDED';

export type OrgDepartmentDefinition = {
  department_code: string;
  department_name: string;
  status: OrgUnitStatus;
};

export type OrgTeamDefinition = {
  team_code: string;
  team_name: string;
  department_code: string;
  status: OrgUnitStatus;
};

export type OrgGradeDefinition = {
  grade_code: string;
  grade_name: string;
  rank_order: number;
  status: OrgUnitStatus;
};

export type OrgPositionDefinition = {
  position_code: string;
  position_title: string;
  department_code: string;
  team_code?: string;
  grade_code: string;
  reports_to_position_code?: string;
  status: OrgUnitStatus;
};

export type OrgPositionAssignment = {
  assignment_ref: string;
  employee_record_ref: string;
  person_identity_anchor_id: string;
  position_code: string;
  allocation_percent: number;
  effective_from: string;
  effective_to?: string;
};

export type OrgDepartmentTeamPositionRuntimeInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  departments: readonly OrgDepartmentDefinition[];
  teams: readonly OrgTeamDefinition[];
  grades: readonly OrgGradeDefinition[];
  positions: readonly OrgPositionDefinition[];
  assignments: readonly OrgPositionAssignment[];
  control_metadata?: Record<string, unknown>;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type NormalizedOrgPositionAssignment = OrgPositionAssignment & {
  assignment_status: AssignmentStatus;
};

export type OrgDepartmentTeamPositionRuntimeReceipt = {
  seed_id: typeof PHASE_6C_ORG_DEPARTMENT_TEAM_POSITION_SEED_ID;
  component_id: typeof PHASE_6C_ORG_DEPARTMENT_TEAM_POSITION_COMPONENT_ID;
  component_slug: "hr_employee_records_and_organisation_structure";
  model_name: "Phase6COrgDepartmentTeamPosition";
  event_name: typeof ORG_DEPARTMENT_TEAM_POSITION_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  runtime_status: 'ORG_STRUCTURE_VALIDATED';
  capability_implementation_allowed: true;
  business_behavior_allowed: true;
  runtime_adapter_allowed: false;
  decision_refs: readonly string[];
  departments: readonly OrgDepartmentDefinition[];
  teams: readonly OrgTeamDefinition[];
  grades: readonly OrgGradeDefinition[];
  positions: readonly OrgPositionDefinition[];
  assignments: readonly NormalizedOrgPositionAssignment[];
  structure_counts: {
    departments: number;
    teams: number;
    grades: number;
    positions: number;
    assignments: number;
    active_assignments: number;
  };
  control_metadata: Record<string, unknown>;
  runtime_evidence_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for org_department_team_position runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for org_department_team_position runtime.');
  }
  return normalized;
}

function assertStatus(value: OrgUnitStatus, field: string): OrgUnitStatus {
  if (value !== 'ACTIVE' && value !== 'INACTIVE') {
    throw new Error(field + ' must be ACTIVE or INACTIVE for org_department_team_position runtime.');
  }
  return value;
}

function assertUnique(values: readonly string[], field: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(field + ' must be unique for org_department_team_position runtime: ' + value);
    }
    seen.add(value);
  }
}

function requirePositiveInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(field + ' must be a positive integer for org_department_team_position runtime.');
  }
  return value;
}

function requireAllocationPercent(value: number): number {
  if (!Number.isFinite(value) || value <= 0 || value > 100) {
    throw new Error('allocation_percent must be greater than 0 and no more than 100 for org_department_team_position runtime.');
  }
  return value;
}

function byCode<T>(field: keyof T): (left: T, right: T) => number {
  return (left, right) => String(left[field]).localeCompare(String(right[field]));
}

function assignmentStatus(assignment: OrgPositionAssignment, evaluatedAt: string): AssignmentStatus {
  const evaluatedTime = Date.parse(evaluatedAt);
  const fromTime = Date.parse(assignment.effective_from);
  const toTime = assignment.effective_to === undefined ? undefined : Date.parse(assignment.effective_to);
  if (fromTime > evaluatedTime) {
    return 'SCHEDULED';
  }
  if (toTime !== undefined && toTime < evaluatedTime) {
    return 'ENDED';
  }
  return 'ACTIVE';
}

function digestRuntime(receiptWithoutDigest: Omit<OrgDepartmentTeamPositionRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateOrgDepartmentTeamPositionRuntime(input: OrgDepartmentTeamPositionRuntimeInput): OrgDepartmentTeamPositionRuntimeReceipt {
  if (input.schema_mutation_requested === true) {
    throw new Error('org_department_team_position runtime must not mutate Prisma schema.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('org_department_team_position runtime must not mutate Phase 6A identity records.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('org_department_team_position runtime must not mutate Phase 6B finance or billing records.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('org_department_team_position runtime must not execute external runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('org_department_team_position runtime must not flip ticket authorization flags.');
  }

  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const departments = input.departments.map((department) => ({
    department_code: requireNonEmpty(department.department_code, 'department_code'),
    department_name: requireNonEmpty(department.department_name, 'department_name'),
    status: assertStatus(department.status, 'department_status'),
  })).sort(byCode<OrgDepartmentDefinition>('department_code'));
  assertUnique(departments.map((department) => department.department_code), 'department_code');
  const departmentCodes = new Set(departments.map((department) => department.department_code));

  const teams = input.teams.map((team) => {
    const departmentCode = requireNonEmpty(team.department_code, 'team_department_code');
    if (!departmentCodes.has(departmentCode)) {
      throw new Error('team references an unknown department_code for org_department_team_position runtime: ' + departmentCode);
    }
    return {
      team_code: requireNonEmpty(team.team_code, 'team_code'),
      team_name: requireNonEmpty(team.team_name, 'team_name'),
      department_code: departmentCode,
      status: assertStatus(team.status, 'team_status'),
    };
  }).sort(byCode<OrgTeamDefinition>('team_code'));
  assertUnique(teams.map((team) => team.team_code), 'team_code');
  const teamCodes = new Set(teams.map((team) => team.team_code));

  const grades = input.grades.map((grade) => ({
    grade_code: requireNonEmpty(grade.grade_code, 'grade_code'),
    grade_name: requireNonEmpty(grade.grade_name, 'grade_name'),
    rank_order: requirePositiveInteger(grade.rank_order, 'grade_rank_order'),
    status: assertStatus(grade.status, 'grade_status'),
  })).sort((left, right) => left.rank_order - right.rank_order || left.grade_code.localeCompare(right.grade_code));
  assertUnique(grades.map((grade) => grade.grade_code), 'grade_code');
  const gradeCodes = new Set(grades.map((grade) => grade.grade_code));

  const positions = input.positions.map((position) => {
    const departmentCode = requireNonEmpty(position.department_code, 'position_department_code');
    const teamCode = position.team_code === undefined ? undefined : requireNonEmpty(position.team_code, 'position_team_code');
    const gradeCode = requireNonEmpty(position.grade_code, 'position_grade_code');
    if (!departmentCodes.has(departmentCode)) {
      throw new Error('position references an unknown department_code for org_department_team_position runtime: ' + departmentCode);
    }
    if (teamCode !== undefined && !teamCodes.has(teamCode)) {
      throw new Error('position references an unknown team_code for org_department_team_position runtime: ' + teamCode);
    }
    if (!gradeCodes.has(gradeCode)) {
      throw new Error('position references an unknown grade_code for org_department_team_position runtime: ' + gradeCode);
    }
    return {
      position_code: requireNonEmpty(position.position_code, 'position_code'),
      position_title: requireNonEmpty(position.position_title, 'position_title'),
      department_code: departmentCode,
      team_code: teamCode,
      grade_code: gradeCode,
      reports_to_position_code: position.reports_to_position_code === undefined ? undefined : requireNonEmpty(position.reports_to_position_code, 'reports_to_position_code'),
      status: assertStatus(position.status, 'position_status'),
    };
  }).sort(byCode<OrgPositionDefinition>('position_code'));
  assertUnique(positions.map((position) => position.position_code), 'position_code');
  const positionCodes = new Set(positions.map((position) => position.position_code));
  for (const position of positions) {
    if (position.reports_to_position_code !== undefined && !positionCodes.has(position.reports_to_position_code)) {
      throw new Error('position reports_to_position_code must reference an existing position for org_department_team_position runtime: ' + position.reports_to_position_code);
    }
    if (position.reports_to_position_code === position.position_code) {
      throw new Error('position must not report to itself for org_department_team_position runtime: ' + position.position_code);
    }
  }

  const assignments = input.assignments.map((assignment) => {
    const positionCode = requireNonEmpty(assignment.position_code, 'assignment_position_code');
    if (!positionCodes.has(positionCode)) {
      throw new Error('assignment references an unknown position_code for org_department_team_position runtime: ' + positionCode);
    }
    const effectiveFrom = requireTimestamp(assignment.effective_from, 'assignment_effective_from');
    const effectiveTo = assignment.effective_to === undefined ? undefined : requireTimestamp(assignment.effective_to, 'assignment_effective_to');
    if (effectiveTo !== undefined && Date.parse(effectiveTo) < Date.parse(effectiveFrom)) {
      throw new Error('assignment effective_to must not be before effective_from for org_department_team_position runtime.');
    }
    const normalizedAssignment: OrgPositionAssignment = {
      assignment_ref: requireNonEmpty(assignment.assignment_ref, 'assignment_ref'),
      employee_record_ref: requireNonEmpty(assignment.employee_record_ref, 'employee_record_ref'),
      person_identity_anchor_id: requireNonEmpty(assignment.person_identity_anchor_id, 'person_identity_anchor_id'),
      position_code: positionCode,
      allocation_percent: requireAllocationPercent(assignment.allocation_percent),
      effective_from: effectiveFrom,
      effective_to: effectiveTo,
    };
    return {
      ...normalizedAssignment,
      assignment_status: assignmentStatus(normalizedAssignment, evaluatedAt),
    };
  }).sort(byCode<NormalizedOrgPositionAssignment>('assignment_ref'));
  assertUnique(assignments.map((assignment) => assignment.assignment_ref), 'assignment_ref');

  const receiptWithoutDigest: Omit<OrgDepartmentTeamPositionRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_ORG_DEPARTMENT_TEAM_POSITION_SEED_ID,
    component_id: PHASE_6C_ORG_DEPARTMENT_TEAM_POSITION_COMPONENT_ID,
    component_slug: "hr_employee_records_and_organisation_structure",
    model_name: "Phase6COrgDepartmentTeamPosition",
    event_name: ORG_DEPARTMENT_TEAM_POSITION_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    source_record_ref: requireNonEmpty(input.source_record_ref, 'source_record_ref'),
    runtime_status: 'ORG_STRUCTURE_VALIDATED',
    capability_implementation_allowed: true,
    business_behavior_allowed: true,
    runtime_adapter_allowed: false,
    decision_refs: ["6C-HR-EMP-005", "6C-SCHEMA-006", "6C-NON-007"],
    departments,
    teams,
    grades,
    positions,
    assignments,
    structure_counts: {
      departments: departments.length,
      teams: teams.length,
      grades: grades.length,
      positions: positions.length,
      assignments: assignments.length,
      active_assignments: assignments.filter((assignment) => assignment.assignment_status === 'ACTIVE').length,
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
