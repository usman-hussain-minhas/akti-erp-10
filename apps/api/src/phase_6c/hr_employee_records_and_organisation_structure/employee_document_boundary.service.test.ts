import assert from 'node:assert/strict';

import { evaluateEmployeeDocumentBoundaryRuntime, type EmployeeDocumentBoundaryRuntimeInput } from './employee_document_boundary.service';

const digestA = 'a'.repeat(64);
const digestB = 'b'.repeat(64);
const digestC = 'c'.repeat(64);

const baseInput: EmployeeDocumentBoundaryRuntimeInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_employee_document_boundary',
  source_record_ref: 'employee_document_boundary_record_001',
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  documents: [
    {
      document_ref: 'doc_001',
      employee_record_ref: 'employee_001',
      person_identity_anchor_id: 'person_anchor_001',
      file_service_object_ref: 'file_object_contract_001',
      document_type: 'CONTRACT',
      sensitivity: 'CONFIDENTIAL',
      issued_at: '2026-01-01T00:00:00.000Z',
      retention_policy_ref: 'retention_hr_contract',
      evidence_hash: digestA,
    },
    {
      document_ref: 'doc_002',
      employee_record_ref: 'employee_001',
      person_identity_anchor_id: 'person_anchor_001',
      file_service_object_ref: 'file_object_cert_001',
      document_type: 'CERTIFICATION',
      sensitivity: 'STANDARD',
      issued_at: '2025-06-01T00:00:00.000Z',
      expires_at: '2026-06-20T00:00:00.000Z',
      retention_policy_ref: 'retention_hr_certification',
      evidence_hash: digestB,
    },
    {
      document_ref: 'doc_003',
      employee_record_ref: 'employee_002',
      person_identity_anchor_id: 'person_anchor_002',
      file_service_object_ref: 'file_object_visa_001',
      document_type: 'VISA',
      sensitivity: 'RESTRICTED',
      issued_at: '2025-01-01T00:00:00.000Z',
      expires_at: '2026-01-01T00:00:00.000Z',
      retention_policy_ref: 'retention_hr_visa',
      evidence_hash: digestC,
    },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateEmployeeDocumentBoundaryRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_006_employee_document_boundary');
assert.equal(receipt.component_id, '6C.01');
assert.equal(receipt.component_slug, 'hr_employee_records_and_organisation_structure');
assert.equal(receipt.model_name, 'Phase6CEmployeeDocumentBoundary');
assert.equal(receipt.runtime_status, 'EMPLOYEE_DOCUMENT_BOUNDARY_VALIDATED');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.deepEqual(receipt.decision_refs, ['6C-HR-EMP-009', '6C-SCHEMA-006', '6C-NON-007', '6C-GLOBAL-018']);
assert.deepEqual(receipt.document_counts, {
  total_documents: 3,
  confidential_or_restricted: 2,
  expired_documents: 1,
  expiring_soon_documents: 1,
});
assert.equal(receipt.documents.find((document) => document.document_ref === 'doc_001')?.lifecycle_status, 'ACTIVE');
assert.equal(receipt.documents.find((document) => document.document_ref === 'doc_002')?.lifecycle_status, 'EXPIRING_SOON');
assert.equal(receipt.documents.find((document) => document.document_ref === 'doc_003')?.lifecycle_status, 'EXPIRED');
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateEmployeeDocumentBoundaryRuntime(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);

assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, documents: [{ ...baseInput.documents[0]!, document_ref: '' }] }), /document_ref is required/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, documents: [{ ...baseInput.documents[0]!, document_type: 'UNKNOWN' as never }] }), /document_type must be supported/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, documents: [{ ...baseInput.documents[0]!, sensitivity: 'SECRET' as never }] }), /sensitivity must be STANDARD/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, documents: [{ ...baseInput.documents[0]!, file_service_object_ref: 's3://bucket/key' }] }), /opaque 6A file-service reference/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, documents: [{ ...baseInput.documents[0]!, file_service_object_ref: '../unsafe/path' }] }), /opaque 6A file-service reference/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, documents: [{ ...baseInput.documents[0]!, evidence_hash: 'not-a-hash' }] }), /evidence_hash must be a SHA-256/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, documents: [{ ...baseInput.documents[0]!, expires_at: '2025-01-01T00:00:00.000Z' }] }), /expires_at must not be before issued_at/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, documents: [...baseInput.documents, { ...baseInput.documents[0]!, document_ref: 'doc_004' }] }), /file_service_object_ref must be unique/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, raw_file_bytes_requested: true }), /must not handle raw file bytes/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, direct_storage_uri_requested: true }), /must not write direct storage URIs/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A file or identity records/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B finance or billing records/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute external runtime adapters/);
assert.throws(() => evaluateEmployeeDocumentBoundaryRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket authorization flags/);

console.log('P6C runtime employee_document_boundary test passed.');
