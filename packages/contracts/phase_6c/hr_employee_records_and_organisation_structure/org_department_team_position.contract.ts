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
