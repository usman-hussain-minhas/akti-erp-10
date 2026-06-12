import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { evaluateWikiRestore, type WikiRestoreInput } from './wiki_restore.service';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

const baseInput: WikiRestoreInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_wiki_restore',
  source_record_ref: 'wiki_restore_record_001',
  page_ref: 'wiki_page_alpha',
  current_version_number: 3,
  target_version_number: 2,
  restore_mode: 'CREATE_NEW_VERSION_FROM_PRIOR',
  restore_reason: 'Customer requested rollback after incorrect publish.',
  requested_by_user_ref: 'user_requester_001',
  reviewer_user_ref: 'user_reviewer_001',
  require_reviewer: true,
  version_snapshots: [
    { version_number: 1, content_hash: hash('v1'), author_user_ref: 'user_author_001', created_at: '2026-06-09T09:00:00.000Z' },
    { version_number: 2, content_hash: hash('v2'), author_user_ref: 'user_author_002', created_at: '2026-06-09T10:00:00.000Z' },
    { version_number: 3, content_hash: hash('v3'), author_user_ref: 'user_author_003', created_at: '2026-06-09T11:00:00.000Z', is_current: true },
  ],
  evidence_refs: ['evidence_restore_request'],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T11:45:00.000Z',
};

const receipt = evaluateWikiRestore(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_076_wiki_restore');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CWikiRestore');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.wiki_restore.evaluated');
assert.equal(receipt.decision, 'WIKI_RESTORE_READY');
assert.equal(receipt.customer_first_restore_policy, 'CREATE_NEW_VERSION_ONLY');
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.restore_executed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.overwrite_current_performed, false);
assert.equal(receipt.history_deletion_performed, false);
assert.equal(receipt.frontend_publication_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.wiki_restore_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateWikiRestore(baseInput);
assert.equal(repeatedReceipt.wiki_restore_evidence_digest, receipt.wiki_restore_evidence_digest);

const missingReviewer = evaluateWikiRestore({ ...baseInput, reviewer_user_ref: undefined });
assert.equal(missingReviewer.decision, 'WIKI_RESTORE_REQUIRES_REVIEW');
assert.deepEqual(missingReviewer.review_reasons, ['reviewer_required_before_restore_execution']);

const targetCurrent = evaluateWikiRestore({ ...baseInput, target_version_number: 3 });
assert.equal(targetCurrent.decision, 'WIKI_RESTORE_REQUIRES_REVIEW');
assert.deepEqual(targetCurrent.review_reasons, ['target_version_is_current_version']);

const invalidReason = evaluateWikiRestore({ ...baseInput, restore_reason: 'too short' });
assert.equal(invalidReason.decision, 'WIKI_RESTORE_REJECTED');
assert.deepEqual(invalidReason.rejection_reasons, ['restore_reason_requires_customer_visible_detail']);

const missingTarget = evaluateWikiRestore({ ...baseInput, target_version_number: 9 });
assert.equal(missingTarget.decision, 'WIKI_RESTORE_REJECTED');
assert.deepEqual(missingTarget.rejection_reasons, ['target_version_is_newer_than_current_version', 'target_version_missing:9']);

assert.throws(() => evaluateWikiRestore({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, version_snapshots: [] }), /version_snapshots must include at least one/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, restore_mode: 'OVERWRITE' as WikiRestoreInput['restore_mode'] }), /restore_mode must be one of/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, overwrite_current_requested: true }), /must not overwrite current content/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, history_deletion_requested: true }), /must not delete version history/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, restore_execution_requested: true }), /must not execute restore/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, persistence_requested: true }), /must not persist database changes/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, frontend_publication_requested: true }), /must not publish frontend routes/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateWikiRestore({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C wiki_restore runtime test passed.');
