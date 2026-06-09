import assert from 'node:assert/strict';

import { evaluateOfferAcceptanceEmployeeCreationRequestRuntime, type OfferAcceptanceEmployeeCreationRequestInput } from './offer_acceptance_employee_creation_request.service';

const baseInput: OfferAcceptanceEmployeeCreationRequestInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_offer_acceptance_employee_creation_request',
  source_record_ref: 'accepted_offer_001',
  applicant_ref: 'applicant_123',
  offer_ref: 'offer_123',
  offer_acceptance_status: 'ACCEPTED',
  accepted_by_actor_ref: 'applicant_123',
  accepted_at: '2026-06-09T09:00:00.000Z',
  employee_creation_requested_by_user_id: 'user_phase_6c_recruiter',
  evaluated_at: '2026-06-09T09:05:00.000Z',
  profile_draft: {
    legal_name: 'Ayesha Khan',
    work_email: 'Ayesha.Khan@AKTI.example',
    start_date: '2026-07-01',
    department_ref: 'department_engineering',
    position_ref: 'position_senior_engineer',
    manager_employee_ref: 'employee_manager_001',
  },
  control_metadata: { source: 'phase_6c_runtime_ffet' },
};

const receipt = evaluateOfferAcceptanceEmployeeCreationRequestRuntime(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_016_offer_acceptance_employee_creation_request');
assert.equal(receipt.component_id, '6C.02');
assert.equal(receipt.component_slug, 'hr_recruitment_and_onboarding_pipeline');
assert.equal(receipt.model_name, 'Phase6COfferAcceptanceEmployeeCreationRequest');
assert.equal(receipt.event_name, 'phase_6c.hr_recruitment_and_onboarding_pipeline.offer_acceptance_employee_creation_request.recommended');
assert.equal(receipt.runtime_status, 'RECOMMENDED_EXPLICIT_STEP_REQUIRED');
assert.equal(receipt.acceptance_recommends_employee_creation, true);
assert.equal(receipt.employee_creation_explicit_step_required, true);
assert.equal(receipt.employee_creation_executed, false);
assert.equal(receipt.employee_record_mutation_allowed, false);
assert.equal(receipt.person_identity_mutation_allowed, false);
assert.equal(receipt.access_provisioning_executed, false);
assert.equal(receipt.recommendation_payload.profile_draft.work_email, 'ayesha.khan@akti.example');
assert.deepEqual(receipt.decision_refs, ['6C-RECRUIT-007']);
assert.match(receipt.offer_acceptance_employee_creation_request_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateOfferAcceptanceEmployeeCreationRequestRuntime(baseInput);
assert.equal(repeatedReceipt.offer_acceptance_employee_creation_request_evidence_digest, receipt.offer_acceptance_employee_creation_request_evidence_digest);

assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, offer_acceptance_status: 'PENDING' as never }), /must be ACCEPTED/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, accepted_at: 'not-a-date' }), /accepted_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, profile_draft: { ...baseInput.profile_draft, legal_name: '' } }), /legal_name is required/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, profile_draft: { ...baseInput.profile_draft, work_email: 'not-email' } }), /work_email must be email-like/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, profile_draft: { ...baseInput.profile_draft, start_date: '2026/07/01' } }), /start_date must be an ISO date/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, profile_draft: { ...baseInput.profile_draft, department_ref: '' } }), /department_ref is required/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, auto_employee_creation_requested: true }), /not auto-create employees/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, employee_record_mutation_requested: true }), /must not mutate employee records/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, person_identity_mutation_requested: true }), /must not mutate Person\/Identity records/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, access_provisioning_requested: true }), /must not execute access provisioning/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, schema_mutation_requested: true }), /must not mutate Prisma schema/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, phase_6a_mutation_requested: true }), /must not mutate Phase 6A/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, phase_6b_mutation_requested: true }), /must not mutate Phase 6B/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, runtime_adapter_requested: true }), /must not execute runtime adapters/);
assert.throws(() => evaluateOfferAcceptanceEmployeeCreationRequestRuntime({ ...baseInput, ticket_flag_flip_requested: true }), /must not flip ticket or execution authorization flags/);

console.log('P6C runtime offer_acceptance_employee_creation_request test passed.');
