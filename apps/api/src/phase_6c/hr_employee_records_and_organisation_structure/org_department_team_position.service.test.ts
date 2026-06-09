import assert from 'node:assert/strict';

import { evaluateOrgDepartmentTeamPositionRuntime, type OrgDepartmentTeamPositionRuntimeInput } from './org_department_team_position.service';

const baseInput: OrgDepartmentTeamPositionRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_org_department_team_position',
  source_record_ref: 'org_structure_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  departments: [
    { department_code: 'ENG', department_name: 'Engineering', status: 'ACTIVE' },
    { department_code: 'OPS', department_name: 'Operations', status: 'ACTIVE' },
  ],
  teams: [
    { team_code: 'ENG-PLATFORM', team_name: 'Platform', department_code: 'ENG', status: 'ACTIVE' },
    { team_code: 'OPS-PEOPLE', team_name: 'People Operations', department_code: 'OPS', status: 'ACTIVE' },
  ],
  grades: [
    { grade_code: 'G7', grade_name: 'Senior', rank_order: 7, status: 'ACTIVE' },
    { grade_code: 'G8', grade_name: 'Lead', rank_order: 8, status: 'ACTIVE' },
  ],
  positions: [
    {
      position_code: 'ENG-LEAD',
      position_title: 'Engineering Lead',
      department_code: 'ENG',
      team_code: 'ENG-PLATFORM',
      grade_code: 'G8',
      status: 'ACTIVE',
    },
    {
      position_code: 'ENG-SENIOR',
      position_title: 'Senior Engineer',
      department_code: 'ENG',
      team_code: 'ENG-PLATFORM',
      grade_code: 'G7',
      reports_to_position_code: 'ENG-LEAD',
      status: 'ACTIVE',
    },
  ],
  assignments: [
    {
      assignment_ref: 'assign_001',
      employee_record_ref: 'employee_001',
      person_identity_anchor_id: 'person_anchor_001',
      position_code: 'ENG-SENIOR',
      allocation_percent: 100,
      effective_from: '2026-01-01T00:00:00.000Z',
    },
    {
      assignment_ref: 'assign_002',
      employee_record_ref: 'employee_002',
      person_identity_anchor_id: 'person_anchor_002',
      position_code: 'ENG-LEAD',
      allocation_percent: 50,
      effective_from: '2026-12-01T00:00:00.000Z',
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateOrgDepartmentTeamPositionRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_003_org_department_team_position');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6COrgDepartmentTeamPosition');
assert.equal(receipt.runtime_status, 'ORG_STRUCTURE_VALIDATED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-005', '6C-SCHEMA-006', '6C-NON-007']);
assert.deepEqual(receipt.structure_counts, {
  departments: 2,
  teams: 2,
  grades: 2,
  positions: 2,
  assignments: 2,
  active_assignments: 1,
});
assert.equal(receipt.assignments[0]?.assignment_status, 'ACTIVE');
assert.equal(receipt.assignments[1]?.assignment_status, 'SCHEDULED');
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOrgDepartmentTeamPositionRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, departments: [...baseInput.departments, baseInput.departments[0]!] }), /department_code must be unique/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, teams: [{ ...baseInput.teams[0]!, department_code: 'UNKNOWN' }] }), /team references an unknown department_code/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, positions: [{ ...baseInput.positions[0]!, grade_code: 'UNKNOWN' }] }), /position references an unknown grade_code/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, positions: [{ ...baseInput.positions[0]!, reports_to_position_code: 'ENG-LEAD' }] }), /position must not report to itself/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, assignments: [{ ...baseInput.assignments[0]!, position_code: 'UNKNOWN' }] }), /assignment references an unknown position_code/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, assignments: [{ ...baseInput.assignments[0]!, allocation_percent: 0 }] }), /allocation_percent must be greater than 0/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, assignments: [{ ...baseInput.assignments[0]!, effective_to: '2025-01-01T00:00:00.000Z' }] }), /effective_to must not be before effective_from/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A identity records/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B finance or billing records/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateOrgDepartmentTeamPositionRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime org_department_team_position test passed.');
