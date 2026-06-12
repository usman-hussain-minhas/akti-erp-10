import assert from 'node:assert/strict';

import { evaluateTenantAuthoredKnowledge, type TenantAuthoredKnowledgeInput } from './tenant_authored_knowledge.service';

const baseInput: TenantAuthoredKnowledgeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_tenant_authored_knowledge',
  page_ref: 'knowledge_page_001',
  page_slug: 'customer-onboarding-playbook',
  title: 'Customer onboarding playbook',
  status: 'PUBLISHED',
  visibility: 'TEAM',
  authored_by_user_id: 'user_workspace_author',
  authored_at: '2026-06-17T11:00:00.000Z',
  version: 3,
  blocks: [
    { block_key: 'heading', type: 'HEADING', order: 1, text: 'Customer onboarding playbook' },
    { block_key: 'intro', type: 'PARAGRAPH', order: 2, text: 'Use this page to coordinate customer onboarding steps.' },
    { block_key: 'checklist', type: 'CHECKLIST', order: 3, text: 'Confirm kickoff, configure workspace, validate handoff.' },
  ],
  tags: ['customer-success', 'onboarding'],
  source_document_refs: ['doc_folder_file_ref:playbook_source'],
  workspace_collaboration_surface_active: true,
  collaboration_context_ref: 'workspace_knowledge_thread_001',
  metadata: { source: 'phase_6c_tenant_authored_knowledge_test' },
};

const receipt = evaluateTenantAuthoredKnowledge(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_081_tenant_authored_knowledge');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CTenantAuthoredKnowledge');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.tenant_authored_knowledge.runtime_evaluated');
assert.equal(receipt.tenant_authored, true);
assert.equal(receipt.page_slug, 'customer-onboarding-playbook');
assert.equal(receipt.block_count, 3);
assert.equal(receipt.tag_count, 2);
assert.equal(receipt.source_document_refs.length, 1);
assert.equal(receipt.word_count, 17);
assert.match(receipt.content_sha256, /^[a-f0-9]{64}$/);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);
assert.deepEqual(receipt.validation_warnings, []);

const repeatedReceipt = evaluateTenantAuthoredKnowledge(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.content_sha256, receipt.content_sha256);

const warningReceipt = evaluateTenantAuthoredKnowledge({
  ...baseInput,
  status: 'PUBLISHED',
  blocks: [{ block_key: 'short', type: 'PARAGRAPH', order: 1, text: 'Short body' }],
  tags: [],
  source_document_refs: [],
});
assert.deepEqual(warningReceipt.validation_warnings, [
  'published_page_has_short_body',
  'page_has_no_source_document_refs',
  'page_has_no_tags',
]);

assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, page_slug: 'Bad Slug' }), /page_slug must be lower-snake-free kebab case/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, version: 0 }), /version must be a positive integer/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, status: 'REVIEW' as never }), /status must be DRAFT, PUBLISHED, or ARCHIVED/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, visibility: 'PUBLIC' as never }), /visibility must be PRIVATE, TEAM, or ORGANIZATION/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, authored_by_user_id: '' }), /authored_by_user_id is required/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, authored_at: 'not-a-date' }), /authored_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, blocks: [] }), /at least one content block is required/);
assert.throws(() => evaluateTenantAuthoredKnowledge({
  ...baseInput,
  blocks: [
    { block_key: 'duplicate', type: 'PARAGRAPH', order: 1, text: 'One' },
    { block_key: 'duplicate', type: 'PARAGRAPH', order: 2, text: 'Two' },
  ],
}), /duplicate block_key/);
assert.throws(() => evaluateTenantAuthoredKnowledge({
  ...baseInput,
  blocks: [{ block_key: 'body', type: 'IMAGE' as never, order: 1, text: 'Image not supported here' }],
}), /type must be HEADING, PARAGRAPH, CHECKLIST, CODE, or QUOTE/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, tags: ['ops', 'ops'] }), /tags contains duplicate value/);
assert.throws(() => evaluateTenantAuthoredKnowledge({
  ...baseInput,
  workspace_collaboration_surface_active: false,
  collaboration_context_ref: 'workspace_knowledge_thread_001',
}), /collaboration_context_ref requires workspace_collaboration_surface_active/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, hardcoded_content_requested: true }), /hardcoded knowledge content is forbidden/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, platform_default_content_requested: true }), /platform default knowledge content is forbidden/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, publish_without_tenant_author_requested: true }), /publishing without a tenant author is forbidden/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, realtime_collaboration_requested: true }), /real-time collaborative editing is deferred/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateTenantAuthoredKnowledge({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime tenant_authored_knowledge test passed.');
