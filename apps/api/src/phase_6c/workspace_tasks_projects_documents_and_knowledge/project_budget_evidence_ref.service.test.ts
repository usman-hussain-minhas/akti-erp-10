import assert from 'node:assert/strict';

import { evaluateProjectBudgetEvidenceRef, type ProjectBudgetEvidenceInput } from './project_budget_evidence_ref.service';

const baseInput: ProjectBudgetEvidenceInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_project_budget_evidence_ref',
  source_record_ref: 'project_budget_evidence_ref_record_001',
  project_ref: 'project_alpha',
  budget_context_ref: 'budget_context_alpha',
  evidence_refs: [
    {
      evidence_ref: 'budget_line_002',
      finance_source_ref: 'phase6b_finance_budget_line_002',
      evidence_type: 'BUDGET_LINE',
      amount_minor_units: 250000,
      currency_code: 'usd',
      captured_at: '2026-06-09T11:00:00.000Z',
      read_model_version: 'finance-read-v1',
    },
    {
      evidence_ref: 'budget_approval_001',
      finance_source_ref: 'phase6b_finance_approval_001',
      evidence_type: 'APPROVAL_EVIDENCE',
      captured_at: '2026-06-09T11:05:00.000Z',
      read_model_version: 'finance-read-v1',
    },
  ],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T11:30:00.000Z',
};

const receipt = evaluateProjectBudgetEvidenceRef(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_074_project_budget_evidence_ref');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CProjectBudgetEvidenceRef');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.project_budget_evidence_ref.evaluated');
assert.equal(receipt.decision, 'PROJECT_BUDGET_EVIDENCE_READY');
assert.equal(receipt.read_only_finance_reference, true);
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.normalized_evidence_refs[1].currency_code, 'USD');
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.finance_write_performed, false);
assert.equal(receipt.budget_allocation_performed, false);
assert.equal(receipt.payment_posting_performed, false);
assert.equal(receipt.reconciliation_performed, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.frontend_publication_performed, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.project_budget_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateProjectBudgetEvidenceRef(baseInput);
assert.equal(repeatedReceipt.project_budget_evidence_digest, receipt.project_budget_evidence_digest);

const missingVersion = evaluateProjectBudgetEvidenceRef({
  ...baseInput,
  evidence_refs: [{ ...baseInput.evidence_refs[0], read_model_version: undefined }],
});
assert.equal(missingVersion.decision, 'PROJECT_BUDGET_EVIDENCE_REQUIRES_REVIEW');
assert.deepEqual(missingVersion.review_reasons, ['read_model_version_missing:budget_line_002']);

const amountWithoutCurrency = evaluateProjectBudgetEvidenceRef({
  ...baseInput,
  evidence_refs: [{ ...baseInput.evidence_refs[0], currency_code: undefined }],
});
assert.equal(amountWithoutCurrency.decision, 'PROJECT_BUDGET_EVIDENCE_REJECTED');
assert.deepEqual(amountWithoutCurrency.rejection_reasons, ['amount_requires_currency_code:budget_line_002']);

const duplicateEvidence = evaluateProjectBudgetEvidenceRef({
  ...baseInput,
  evidence_refs: [baseInput.evidence_refs[0], { ...baseInput.evidence_refs[0], finance_source_ref: 'phase6b_finance_budget_line_003' }],
});
assert.equal(duplicateEvidence.decision, 'PROJECT_BUDGET_EVIDENCE_REJECTED');
assert.deepEqual(duplicateEvidence.rejection_reasons, ['duplicate_evidence_ref:budget_line_002']);

assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, evidence_refs: [] }), /evidence_refs must include at least one/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, evidence_refs: [{ ...baseInput.evidence_refs[0], evidence_type: 'WRITE' as ProjectBudgetEvidenceInput['evidence_refs'][number]['evidence_type'] }] }), /evidence_type must be one of/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, finance_write_requested: true }), /must not write to Phase 6B Finance/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, budget_allocation_requested: true }), /must not allocate budget/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, payment_posting_requested: true }), /must not post payments/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, reconciliation_requested: true }), /must not execute reconciliation/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, frontend_publication_requested: true }), /must not publish frontend routes/);
assert.throws(() => evaluateProjectBudgetEvidenceRef({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C project_budget_evidence_ref runtime test passed.');
