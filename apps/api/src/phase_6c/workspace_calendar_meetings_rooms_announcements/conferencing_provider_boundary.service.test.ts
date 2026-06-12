import assert from 'node:assert/strict';

import { evaluateConferencingProviderBoundary, type ConferencingProviderBoundaryInput } from './conferencing_provider_boundary.service';

const baseInput: ConferencingProviderBoundaryInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_conferencing_provider_boundary',
  boundary_ref: 'conference_boundary_google_meet_001',
  provider: 'GOOGLE_MEET',
  calendar_entry_ref: 'calendar_entry_001',
  meeting_title: 'Customer onboarding review',
  starts_at: '2026-06-22T11:00:00.000Z',
  ends_at: '2026-06-22T11:45:00.000Z',
  timezone: 'Asia/Karachi',
  requested_capabilities: ['VIDEO_MEETING_LINK'],
  credential_reference: 'credential_ref_google_meet_workspace_001',
  evaluated_by_user_id: 'user_calendar_admin',
  evaluated_at: '2026-06-18T13:00:00.000Z',
  metadata: { source: 'phase_6c_conferencing_provider_boundary_test' },
};

const receipt = evaluateConferencingProviderBoundary(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_085_conferencing_provider_boundary');
assert.equal(receipt.component_id, '6C.07');
assert.equal(receipt.component_slug, 'workspace_calendar_meetings_rooms_announcements');
assert.equal(receipt.model_name, 'Phase6CConferencingProviderBoundary');
assert.equal(receipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.conferencing_provider_boundary.runtime_evaluated');
assert.equal(receipt.status, 'BOUNDARY_VALIDATED');
assert.equal(receipt.provider_neutral_only, true);
assert.equal(receipt.adapter_boundary_only, true);
assert.equal(receipt.boundary_envelope.provider, 'GOOGLE_MEET');
assert.deepEqual(receipt.validation_warnings, []);
assert.match(receipt.boundary_envelope.boundary_uid, /^[a-f0-9]{64}$/);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateConferencingProviderBoundary(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.boundary_envelope.boundary_uid, receipt.boundary_envelope.boundary_uid);

const blockedZoomReceipt = evaluateConferencingProviderBoundary({
  ...baseInput,
  provider: 'ZOOM',
  credential_reference: undefined,
  requested_capabilities: ['DIAL_IN', 'RECORDING_POLICY'],
});
assert.equal(blockedZoomReceipt.status, 'BLOCKED_REQUIRES_ADAPTER_IMPLEMENTATION');
assert.deepEqual(blockedZoomReceipt.validation_warnings, [
  'conferencing_boundary_has_no_credential_reference',
  'zoom_recording_policy_requires_future_adapter_review',
  'boundary_does_not_request_video_link_capability',
]);

assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, provider: 'TEAMS' as never }), /provider must be GOOGLE_MEET or ZOOM/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, requested_capabilities: [] }), /at least one requested capability is required/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, requested_capabilities: ['VIDEO_MEETING_LINK', 'VIDEO_MEETING_LINK'] }), /duplicate requested capability/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, requested_capabilities: ['WHITEBOARD' as never] }), /requested_capabilities\[0\] must be VIDEO_MEETING_LINK/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, credential_reference: 'oauth_access_token_secret' }), /opaque reference/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, starts_at: 'not-a-date' }), /starts_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, ends_at: '2026-06-22T10:00:00.000Z' }), /ends_at must not be before starts_at/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, raw_credential_supplied: true }), /raw provider credentials are forbidden/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, provider_sdk_call_requested: true }), /provider SDK calls are forbidden/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, meeting_link_generation_requested: true }), /meeting link generation is outside this FFET/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, dial_in_number_requested: true }), /dial-in number generation is outside this FFET/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, webhook_registration_requested: true }), /provider webhook registration is outside this FFET/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateConferencingProviderBoundary({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime conferencing_provider_boundary test passed.');
