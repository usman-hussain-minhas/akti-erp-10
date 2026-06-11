import assert from 'node:assert/strict';

import { evaluatePolicyVersionLibrary, type PolicyVersionLibraryInput } from './policy_version_library.service';

const baseInput: PolicyVersionLibraryInput = {
  organization_id: 'org_phase_6c_policy',
  service_manifest_contract_id: 'smc_phase_6c_policy_version_library',
  source_record_ref: 'policy_library_snapshot_2026_06',
  library_ref: 'hr_policy_library_global',
  requested_policy_keys: ['commission_policy', 'offboarding_policy'],
  effective_at: '2026-06-15T00:00:00.000Z',
  policy_versions: [
    {
      policy_key: 'commission_policy',
      policy_title: 'Commission Policy',
      category: 'COMMISSION_POLICY',
      version: 'v1',
      status: 'SUPERSEDED',
      effective_from: '2025-01-01T00:00:00.000Z',
      effective_to: '2026-01-01T00:00:00.000Z',
      policy_hash: 'hash_commission_policy_v1',
      evidence_refs: ['policy_board_approval_v1'],
    },
    {
      policy_key: 'commission_policy',
      policy_title: 'Commission Policy',
      category: 'COMMISSION_POLICY',
      version: 'v2',
      status: 'ACTIVE',
      effective_from: '2026-01-01T00:00:00.000Z',
      supersedes_version: 'v1',
      policy_hash: 'hash_commission_policy_v2',
      evidence_refs: ['policy_board_approval_v2'],
    },
    {
      policy_key: 'offboarding_policy',
      policy_title: 'Offboarding Policy',
      category: 'OFFBOARDING_POLICY',
      version: 'v1',
      status: 'ACTIVE',
      effective_from: '2026-04-01T00:00:00.000Z',
      policy_hash: 'hash_offboarding_policy_v1',
      evidence_refs: ['offboarding_policy_approval_v1'],
    },
  ],
  evaluated_by_user_id: 'user_policy_controller',
  evaluated_at: '2026-06-15T09:00:00.000Z',
  control_metadata: { source: 'phase_6c_ffet_049' },
};

const readyReceipt = evaluatePolicyVersionLibrary(baseInput);
assert.equal(readyReceipt.seed_id, 'seed_6c_049_policy_version_library');
assert.equal(readyReceipt.component_id, '6C.04');
assert.equal(readyReceipt.component_slug, 'hr_performance_commission_policy_and_offboarding');
assert.equal(readyReceipt.model_name, 'Phase6CPolicyVersionLibrary');
assert.equal(readyReceipt.event_name, 'phase_6c.hr_performance_commission_policy_and_offboarding.policy_version_library.evaluated');
assert.equal(readyReceipt.requested_policy_count, 2);
assert.equal(readyReceipt.selected_policy_count, 2);
assert.equal(readyReceipt.missing_policy_count, 0);
assert.equal(readyReceipt.conflict_policy_count, 0);
assert.equal(readyReceipt.decision, 'POLICY_VERSION_LIBRARY_READY');
assert.equal(readyReceipt.selections[0].selected_version, 'v2');
assert.equal(readyReceipt.selections[0].selected_policy_hash, 'hash_commission_policy_v2');
assert.equal(readyReceipt.selections[1].selected_version, 'v1');
assert.equal(readyReceipt.policy_mutation_allowed, false);
assert.equal(readyReceipt.schema_mutation_allowed, false);
assert.equal(readyReceipt.phase_6a_mutation_allowed, false);
assert.equal(readyReceipt.phase_6b_mutation_allowed, false);
assert.equal(readyReceipt.runtime_adapter_allowed, false);
assert.equal(readyReceipt.ticket_flag_flip_allowed, false);
assert.deepEqual(readyReceipt.decision_refs, ['6C-HR-OPS-009']);
assert.match(readyReceipt.policy_library_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluatePolicyVersionLibrary(baseInput);
assert.equal(repeatedReceipt.policy_library_digest, readyReceipt.policy_library_digest);

const partialReceipt = evaluatePolicyVersionLibrary({
  ...baseInput,
  requested_policy_keys: ['commission_policy', 'missing_policy'],
});
assert.equal(partialReceipt.decision, 'POLICY_VERSION_LIBRARY_PARTIAL');
assert.equal(partialReceipt.selected_policy_count, 1);
assert.equal(partialReceipt.missing_policy_count, 1);

const conflictReceipt = evaluatePolicyVersionLibrary({
  ...baseInput,
  policy_versions: [
    ...baseInput.policy_versions,
    {
      policy_key: 'commission_policy',
      policy_title: 'Commission Policy',
      category: 'COMMISSION_POLICY',
      version: 'v3-conflict',
      status: 'ACTIVE',
      effective_from: '2026-05-01T00:00:00.000Z',
      policy_hash: 'hash_commission_policy_v3_conflict',
      evidence_refs: ['policy_conflict_evidence'],
    },
  ],
});
assert.equal(conflictReceipt.decision, 'POLICY_VERSION_LIBRARY_REQUIRES_REVIEW');
assert.equal(conflictReceipt.conflict_policy_count, 1);
assert.deepEqual(conflictReceipt.selections[0].conflict_versions, ['v2', 'v3-conflict']);

assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, source_record_ref: '' }), /source_record_ref is required/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, library_ref: '' }), /library_ref is required/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, effective_at: 'not-a-date' }), /effective_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, requested_policy_keys: [] }), /requested_policy_keys must contain at least one policy key/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, policy_versions: [{ ...baseInput.policy_versions[0], category: 'OTHER' as never }] }), /category must be a supported policy category/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, policy_versions: [{ ...baseInput.policy_versions[0], status: 'ARCHIVED' as never }] }), /status must be a supported policy status/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, policy_versions: [{ ...baseInput.policy_versions[0], effective_to: '2024-01-01T00:00:00.000Z' }] }), /effective_to must be after effective_from/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, policy_versions: [baseInput.policy_versions[1], baseInput.policy_versions[1]] }), /version must be unique per policy_key/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, policy_versions: [{ ...baseInput.policy_versions[0], evidence_refs: [] }] }), /evidence_refs must contain at least one evidence reference/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, policy_mutation_requested: true }), /must not perform policy mutation/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, schema_mutation_requested: true }), /must not perform schema mutation/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, phase_6a_mutation_requested: true }), /must not perform Phase 6A mutation/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, phase_6b_mutation_requested: true }), /must not perform Phase 6B mutation/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, runtime_adapter_requested: true }), /must not perform runtime adapter execution/);
assert.throws(() => evaluatePolicyVersionLibrary({ ...baseInput, ticket_flag_flip_requested: true }), /must not perform ticket flag flip/);

console.log('P6C policy_version_library runtime FFET test passed.');
