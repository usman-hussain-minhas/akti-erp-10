import assert from 'node:assert/strict';

import { evaluateTimeLogEvidence, type TimeLogEvidenceInput } from './time_log_evidence.service';

const baseInput: TimeLogEvidenceInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_time_log_evidence',
  source_record_ref: 'time_log_evidence_record_001',
  entries: [
    {
      time_log_ref: 'time_log_001',
      subject_user_ref: 'user_worker_001',
      project_ref: 'project_alpha',
      task_ref: 'task_001',
      work_type: 'TASK_WORK',
      billing_dimension_state: 'BILLING_CANDIDATE',
      billing_dimension_refs: ['dimension_consulting'],
      start_at: '2026-06-09T09:00:00.000Z',
      end_at: '2026-06-09T10:30:00.000Z',
      evidence_refs: ['evidence_timer_entry'],
    },
    {
      time_log_ref: 'time_log_002',
      subject_user_ref: 'user_worker_001',
      project_ref: 'project_alpha',
      work_type: 'MEETING',
      billing_dimension_state: 'NON_BILLABLE',
      start_at: '2026-06-09T11:00:00.000Z',
      end_at: '2026-06-09T11:30:00.000Z',
      evidence_refs: ['evidence_meeting_note'],
    },
  ],
  evaluated_by_user_id: 'user_phase_6c_runtime',
  evaluated_at: '2026-06-09T12:15:00.000Z',
};

const receipt = evaluateTimeLogEvidence(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_078_time_log_evidence');
assert.equal(receipt.component_id, '6C.06');
assert.equal(receipt.component_slug, 'workspace_tasks_projects_documents_and_knowledge');
assert.equal(receipt.model_name, 'Phase6CTimeLogEvidence');
assert.equal(receipt.event_name, 'phase_6c.workspace_tasks_projects_documents_and_knowledge.time_log_evidence.evaluated');
assert.equal(receipt.decision, 'TIME_LOG_EVIDENCE_READY');
assert.equal(receipt.future_billing_evidence_only, true);
assert.equal(receipt.total_duration_minutes, 120);
assert.equal(receipt.billing_candidate_minutes, 90);
assert.deepEqual(receipt.review_reasons, []);
assert.deepEqual(receipt.rejection_reasons, []);
assert.equal(receipt.capability_implementation_allowed, true);
assert.equal(receipt.business_behavior_allowed, true);
assert.equal(receipt.runtime_adapter_allowed, false);
assert.equal(receipt.persistence_performed, false);
assert.equal(receipt.invoice_generated, false);
assert.equal(receipt.payroll_written, false);
assert.equal(receipt.finance_write_performed, false);
assert.equal(receipt.timer_adapter_invoked, false);
assert.equal(receipt.schema_mutation_performed, false);
assert.equal(receipt.cross_phase_write_performed, false);
assert.equal(receipt.frontend_publication_performed, false);
assert.equal(receipt.ticket_flags_changed, false);
assert.match(receipt.time_log_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateTimeLogEvidence(baseInput);
assert.equal(repeatedReceipt.time_log_evidence_digest, receipt.time_log_evidence_digest);

const missingDimension = evaluateTimeLogEvidence({
  ...baseInput,
  entries: [{ ...baseInput.entries[0], billing_dimension_refs: [] }],
});
assert.equal(missingDimension.decision, 'TIME_LOG_EVIDENCE_REQUIRES_REVIEW');
assert.deepEqual(missingDimension.review_reasons, ['billing_candidate_missing_dimension_ref:time_log_001']);

const durationMismatch = evaluateTimeLogEvidence({
  ...baseInput,
  entries: [{ ...baseInput.entries[0], duration_minutes: 120 }],
});
assert.equal(durationMismatch.decision, 'TIME_LOG_EVIDENCE_REQUIRES_REVIEW');
assert.deepEqual(durationMismatch.review_reasons, ['duration_minutes_differs_from_timestamp_delta:time_log_001']);

const invalidDuration = evaluateTimeLogEvidence({
  ...baseInput,
  entries: [{ ...baseInput.entries[0], end_at: '2026-06-09T08:00:00.000Z' }],
});
assert.equal(invalidDuration.decision, 'TIME_LOG_EVIDENCE_REJECTED');
assert.deepEqual(invalidDuration.rejection_reasons, ['duration_minutes_requires_positive_integer:time_log_001', 'time_log_requires_positive_duration:time_log_001']);

assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, entries: [] }), /entries must include at least one/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, entries: [{ ...baseInput.entries[0], work_type: 'UNKNOWN' as TimeLogEvidenceInput['entries'][number]['work_type'] }] }), /work_type must be one of/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, persistence_requested: true }), /must not persist database changes/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, invoice_generation_requested: true }), /must not generate invoices/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, payroll_write_requested: true }), /must not write payroll/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, finance_write_requested: true }), /must not write Finance data/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, timer_adapter_requested: true }), /must not invoke timer adapters/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, schema_mutation_requested: true }), /must not mutate schema/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, cross_phase_write_requested: true }), /must not write cross-phase data/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, frontend_publication_requested: true }), /must not publish frontend routes/);
assert.throws(() => evaluateTimeLogEvidence({ ...baseInput, ticket_flag_flip_requested: true }), /must not change ticket authorization flags/);

console.log('P6C time_log_evidence runtime test passed.');
