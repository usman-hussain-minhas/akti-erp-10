import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { evaluateDocumentFolderFileRef, type DocumentFolderFileRefInput } from './document_folder_file_ref.service';

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

const baseInput: DocumentFolderFileRefInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_document_folder_file_ref',
  source_record_ref: 'document_folder_file_ref_record_001',
  workspace_ref: 'workspace_docs',
  project_ref: 'project_alpha',
  folders: [
    { folder_ref: 'folder_root', label: 'Root' },
    { folder_ref: 'folder_specs', label: 'Specifications', parent_folder_ref: 'folder_root' },
  ],
  files: [
    {
      file_ref: 'file_spec_001',
      file_service_ref: '6a_file_service_ref_001',
      folder_ref: 'folder_specs',
      display_name: 'Specification.pdf',
      mime_type: 'application/pdf',
      size_bytes: 2048,
      checksum_sha256: hash('specification'),
      source: '6A_FILE_SERVICE',
    },
  ],
  evidence_refs: ['evidence_document_ref_source'],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T12:00:00.000Z',
};

const receipt = evaluateDocumentFolderFileRef(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_077_document_folder_file_ref');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CDocumentFolderFileRef');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.document_folder_file_ref.evaluated');
assert.equal(receipt.decision, 'DOCUMENT_REFS_READY');
assert.equal(receipt.file_service_boundary, '6A_FILE_SERVICE_ONLY');
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.normalized_folders.length, 2);
assert.equal(receipt.normalized_files[0].source, '6A_FILE_SERVICE');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.file_upload_performed, false);
assert.equal(receipt.file_binary_read_performed, false);
assert.equal(receipt.storage_mutation_performed, false);
assert.equal(receipt.external_provider_called, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.frontend_publication_performed, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.document_folder_file_ref_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateDocumentFolderFileRef(baseInput);
assert.equal(repeatedReceipt.document_folder_file_ref_evidence_digest, receipt.document_folder_file_ref_evidence_digest);

const missingFolder = evaluateDocumentFolderFileRef({
  ...baseInput,
  files: [{ ...baseInput.files[0], folder_ref: 'missing_folder' }],
});
assert.equal(missingFolder.decision, 'DOCUMENT_REFS_REJECTED');
assert.deepEqual(missingFolder.rejection_reasons, ['file_folder_missing:file_spec_001->missing_folder']);

const folderCycle = evaluateDocumentFolderFileRef({
  ...baseInput,
  folders: [
    { folder_ref: 'folder_a', label: 'A', parent_folder_ref: 'folder_b' },
    { folder_ref: 'folder_b', label: 'B', parent_folder_ref: 'folder_a' },
  ],
  files: [{ ...baseInput.files[0], folder_ref: 'folder_a' }],
});
assert.equal(folderCycle.decision, 'DOCUMENT_REFS_REJECTED');
assert.deepEqual(folderCycle.rejection_reasons, ['folder_cycle_detected:folder_a->folder_b->folder_a']);

const weakMetadata = evaluateDocumentFolderFileRef({
  ...baseInput,
  files: [{ ...baseInput.files[0], mime_type: 'pdf', checksum_sha256: 'not-sha' }],
});
assert.equal(weakMetadata.decision, 'DOCUMENT_REFS_REQUIRES_REVIEW');
assert.deepEqual(weakMetadata.review_reasons, ['checksum_sha256_not_canonical:file_spec_001', 'mime_type_not_structured:file_spec_001']);

assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, folders: [] }), /folders must include at least one/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, files: [] }), /files must include at least one/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, files: [{ ...baseInput.files[0], source: 'DIRECT_STORAGE' as DocumentFolderFileRefInput['files'][number]['source'] }] }), /source must be one of/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, file_upload_requested: true }), /must not upload files/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, file_binary_read_requested: true }), /must not read file binaries/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, storage_mutation_requested: true }), /must not mutate storage/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, external_provider_requested: true }), /must not call external providers/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, frontend_publication_requested: true }), /must not publish frontend routes/);
assert.throws(() => evaluateDocumentFolderFileRef({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C document_folder_file_ref runtime test passed.');
