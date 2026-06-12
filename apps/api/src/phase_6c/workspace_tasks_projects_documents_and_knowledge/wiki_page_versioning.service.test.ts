import assert from 'node:assert/strict';

import { evaluateWikiPageVersioning, type WikiPageVersioningInput } from './wiki_page_versioning.service';

const baseInput: WikiPageVersioningInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_wiki_page_versioning',
  source_record_ref: 'wiki_page_versioning_record_001',
  page_ref: 'wiki_page_alpha',
  current_version_number: 3,
  restore_candidate_version_number: 2,
  versions: [
    {
      version_number: 1,
      title: 'Runbook',
      content: 'Initial runbook content',
      author_user_ref: 'user_author_001',
      created_at: '2026-06-09T09:00:00.000Z',
      change_type: 'CREATE',
      change_summary: 'Initial version',
      evidence_refs: ['evidence_v1'],
    },
    {
      version_number: 2,
      title: 'Runbook',
      content: 'Expanded runbook content',
      author_user_ref: 'user_author_002',
      created_at: '2026-06-09T10:00:00.000Z',
      change_type: 'UPDATE',
      change_summary: 'Expanded operating steps',
      evidence_refs: ['evidence_v2'],
    },
    {
      version_number: 3,
      title: 'Runbook',
      content: 'Published runbook content',
      author_user_ref: 'user_author_003',
      created_at: '2026-06-09T11:00:00.000Z',
      change_type: 'PUBLISH',
      published: true,
      evidence_refs: ['evidence_v3'],
    },
  ],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T11:30:00.000Z',
};

const receipt = evaluateWikiPageVersioning(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_075_wiki_page_versioning');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CWikiPageVersioning');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.wiki_page_versioning.evaluated');
assert.equal(receipt.decision, 'WIKI_VERSION_HISTORY_READY');
assert.equal(receipt.restore_candidate_available, true);
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.normalized_versions.length, 3);
assert.equal(receipt.normalized_versions[0].version_number, 1);
assert.match(receipt.normalized_versions[0].content_hash, /^[a-f0-9]{64}$/);
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.restore_executed, false);
assert.equal(receipt.realtime_collaboration_enabled, false);
assert.equal(receipt.frontend_editor_published, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.wiki_page_versioning_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateWikiPageVersioning(baseInput);
assert.equal(repeatedReceipt.wiki_page_versioning_evidence_digest, receipt.wiki_page_versioning_evidence_digest);

const duplicateVersion = evaluateWikiPageVersioning({
  ...baseInput,
  versions: [baseInput.versions[0], { ...baseInput.versions[0], content: 'Duplicate version content' }],
});
assert.equal(duplicateVersion.decision, 'WIKI_VERSION_HISTORY_REJECTED');
assert.deepEqual(duplicateVersion.rejection_reasons, ['current_version_number_missing:3', 'duplicate_version_number:1', 'restore_candidate_version_missing:2']);

const timestampRegression = evaluateWikiPageVersioning({
  ...baseInput,
  versions: [
    baseInput.versions[0],
    { ...baseInput.versions[1], created_at: '2026-06-08T10:00:00.000Z' },
    baseInput.versions[2],
  ],
});
assert.equal(timestampRegression.decision, 'WIKI_VERSION_HISTORY_REQUIRES_REVIEW');
assert.deepEqual(timestampRegression.review_reasons, ['version_timestamp_regressed:2']);

const restoreMissingSource = evaluateWikiPageVersioning({
  ...baseInput,
  versions: [
    baseInput.versions[0],
    { ...baseInput.versions[1], change_type: 'RESTORE', restored_from_version_number: 9 },
    baseInput.versions[2],
  ],
});
assert.equal(restoreMissingSource.decision, 'WIKI_VERSION_HISTORY_REJECTED');
assert.deepEqual(restoreMissingSource.rejection_reasons, ['restored_from_version_missing:9']);

assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, versions: [] }), /versions must include at least one/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, current_version_number: 0 }), /current_version_number must be a positive integer/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, versions: [{ ...baseInput.versions[0], change_type: 'MERGE' as WikiPageVersioningInput['versions'][number]['change_type'] }] }), /change_type must be one of/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, persistence_requested: true }), /must not persist database changes/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, restore_execution_requested: true }), /must not execute restore/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, realtime_collaboration_requested: true }), /must not enable real-time collaboration/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, frontend_editor_requested: true }), /must not publish frontend editor behavior/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateWikiPageVersioning({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C wiki_page_versioning runtime test passed.');
