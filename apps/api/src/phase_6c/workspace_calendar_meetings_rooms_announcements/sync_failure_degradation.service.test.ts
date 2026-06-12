import assert from 'node:assert/strict';

import { evaluateSyncFailureDegradation, type SyncFailureDegradationInput } from './sync_failure_degradation.service';

const baseInput: SyncFailureDegradationInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_sync_failure_degradation',
  sync_job_ref: 'calendar_sync_job_001',
  source_record_ref: 'sync_failure_source_record_001',
  requested_by_user_id: 'user_calendar_admin',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  sync_surface: 'CALENDAR_PROVIDER',
  failure_class: 'NETWORK_TIMEOUT',
  failure_message_ref: 'failure_message_ref_001',
  attempt_count: 1,
  max_retry_attempts: 3,
  last_successful_sync_at: '2026-06-09T08:00:00.000Z',
  provider_correlation_id: 'provider_correlation_001',
};

const retryReceipt = evaluateSyncFailureDegradation(baseInput);
assert.equal(retryReceipt.seed_id, 'seed_6c_094_sync_failure_degradation');
assert.equal(retryReceipt.component_id, '6C.07');
assert.equal(retryReceipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.sync_failure_degradation.runtime_evaluated');
assert.equal(retryReceipt.decision, 'RETRY_WITH_BACKOFF');
assert.equal(retryReceipt.next_retry_after_seconds, 120);
assert.equal(retryReceipt.fallback_surface, 'LOCAL_CALENDAR_READMODEL');
assert.equal(retryReceipt.provider_retry_executed, false);
assert.equal(retryReceipt.provider_mutation_executed, false);
assert.equal(retryReceipt.credential_access_executed, false);
assert.equal(retryReceipt.runtime_adapter_executed, false);
assert.equal(retryReceipt.persistence_executed, false);
assert.deepEqual(retryReceipt.decision_refs, ['6C-CAL-012']);
assert.match(retryReceipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateSyncFailureDegradation(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, retryReceipt.runtime_evidence_digest);

const exhaustedReceipt = evaluateSyncFailureDegradation({
  ...baseInput,
  attempt_count: 3,
  max_retry_attempts: 3,
});
assert.equal(exhaustedReceipt.decision, 'DEGRADED_LOCAL_ONLY');
assert.equal(exhaustedReceipt.manual_review_reason, 'retry_budget_exhausted');

const authReceipt = evaluateSyncFailureDegradation({
  ...baseInput,
  failure_class: 'AUTH_EXPIRED',
});
assert.equal(authReceipt.decision, 'DEGRADED_LOCAL_ONLY');
assert.equal(authReceipt.manual_review_reason, 'provider_authentication_refresh_required');

const conflictReceipt = evaluateSyncFailureDegradation({
  ...baseInput,
  failure_class: 'CONFLICT_DETECTED',
});
assert.equal(conflictReceipt.decision, 'MANUAL_REVIEW_REQUIRED');
assert.equal(conflictReceipt.manual_review_reason, 'calendar_conflict_requires_review');

const validationReceipt = evaluateSyncFailureDegradation({
  ...baseInput,
  failure_class: 'VALIDATION_REJECTED',
});
assert.equal(validationReceipt.decision, 'BLOCK_UNSAFE_SYNC');
assert.equal(validationReceipt.manual_review_reason, 'provider_payload_validation_rejected');

assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, sync_surface: 'UNKNOWN' as never }), /unsupported value UNKNOWN/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, failure_class: 'BROKEN' as never }), /unsupported value BROKEN/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, attempt_count: -1 }), /attempt_count must be a non-negative integer/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, attempt_count: 1, max_retry_attempts: 0 }), /attempt_count must be 0 when max_retry_attempts is 0/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, provider_retry_execution_requested: true }), /must not execute provider retries/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, provider_mutation_requested: true }), /must not mutate provider state/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, credential_access_requested: true }), /must not access provider credentials/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, persistence_requested: true }), /must not persist sync degradation state/);
assert.throws(() => evaluateSyncFailureDegradation({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);

console.log('P6C runtime sync_failure_degradation test passed.');
