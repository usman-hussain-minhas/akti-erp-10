import assert from 'node:assert/strict';

import { evaluateBackgroundCheckProviderBoundaryRuntime, type BackgroundCheckProviderBoundaryInput } from './background_check_provider_boundary.service';

const baseInput: BackgroundCheckProviderBoundaryInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_background_check_provider_boundary',
  source_record_ref: 'background_check_boundary_001',
  applicant_ref: 'applicant_123',
  offer_ref: 'offer_123',
  provider_boundary_ref: 'provider_neutral_background_check:default:v1',
  consent_status: 'CONSENT_CAPTURED',
  consent_evidence_ref: 'consent_evidence:applicant_123:bg_check:v1',
  requested_by_user_id: 'user_phase_6c_recruiter',
  evaluated_at: '2026-06-09T09:00:00.000Z',
  scopes: [
    { scope_code: 'IDENTITY', reason: 'verify applicant identity', required: true },
    { scope_code: 'EMPLOYMENT_HISTORY', reason: 'verify employment history', required: false },
  ],
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateBackgroundCheckProviderBoundaryRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_019_background_check_provider_boundary');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6CBackgroundCheckProviderBoundary');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.background_check_provider_boundary.validated');
assert.equal(receipt.runtime_status, 'PROVIDER_NEUTRAL_BOUNDARY_READY');
assert.equal(receipt.provider_neutral_boundary_only, true);
assert.equal(receipt.real_provider_allowed, false);
assert.equal(receipt.provider_credentials_allowed, false);
assert.equal(receipt.adapter_execution_allowed, false);
assert.equal(receipt.external_submission_allowed, false);
assert.equal(receipt.sensitive_result_storage_allowed, false);
assert.equal(receipt.consent_required, true);
assert.equal(receipt.scope_count, 2);
assert.equal(receipt.required_scope_count, 1);
assert.equal(receipt.boundary_payload.provider_boundary_ref, 'provider_neutral_background_check:default:v1');
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-011']);
assert.match(receipt.background_check_provider_boundary_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateBackgroundCheckProviderBoundaryRuntime(baseInput);
assert.equal(repeatedReceipt.background_check_provider_boundary_evidence_digest, receipt.background_check_provider_boundary_evidence_digest);

assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, provider_boundary_ref: 'provider:real_vendor' }), /provider-neutral background-check boundary/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, consent_status: 'NOT_CAPTURED' as never }), /must be CONSENT_CAPTURED/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, consent_evidence_ref: 'consent:wrong' }), /captured consent evidence/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, evaluated_at: 'not-a-date' }), /valid ISO-compatible timestamp/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, scopes: [] }), /at least one background-check scope/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({
  ...baseInput,
  scopes: [{ ...baseInput.scopes[0]!, scope_code: 'DRUG_TEST' as never }],
}), /scope_code is not supported/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({
  ...baseInput,
  scopes: [baseInput.scopes[0]!, { ...baseInput.scopes[1]!, scope_code: baseInput.scopes[0]!.scope_code }],
}), /scope_code must be unique/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({
  ...baseInput,
  scopes: [{ ...baseInput.scopes[0]!, required: false }],
}), /at least one required background-check scope/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, real_provider_requested: true }), /must remain provider-neutral/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, provider_credentials_requested: true }), /must not handle provider credentials/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, adapter_execution_requested: true }), /must not execute provider adapters/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, external_submission_requested: true }), /must not submit background checks externally/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, sensitive_result_storage_requested: true }), /must not store sensitive background-check results/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateBackgroundCheckProviderBoundaryRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime background_check_provider_boundary test passed.');
