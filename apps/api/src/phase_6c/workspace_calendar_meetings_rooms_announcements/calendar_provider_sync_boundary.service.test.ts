import assert from 'node:assert/strict';

import { evaluateCalendarProviderSyncBoundary, type CalendarProviderSyncBoundaryInput } from './calendar_provider_sync_boundary.service';

const baseInput: CalendarProviderSyncBoundaryInput = {
  organization_id: 'org_phase_6c_runtime',
  service_manifest_contract_id: 'smc_phase_6c_calendar_provider_sync_boundary',
  boundary_ref: 'calendar_boundary_google_export_001',
  provider: 'GOOGLE_CALENDAR',
  direction: 'EXPORT_TO_PROVIDER',
  requested_scopes: ['WRITE_CALENDAR_EVENTS'],
  provider_neutral_calendar_entry_ref: 'calendar_entry_001',
  credential_reference: 'credential_ref_calendar_google_workspace_001',
  evaluated_by_user_id: 'user_calendar_admin',
  evaluated_at: '2026-06-18T12:00:00.000Z',
  metadata: { source: 'phase_6c_calendar_provider_sync_boundary_test' },
};

const receipt = evaluateCalendarProviderSyncBoundary(baseInput);
assert.equal(receipt.seed_id, 'seed_6c_084_calendar_provider_sync_boundary');
assert.equal(receipt.component_id, '6C.07');
assert.equal(receipt.component_slug, 'workspace_calendar_meetings_rooms_announcements');
assert.equal(receipt.model_name, 'Phase6CCalendarProviderSyncBoundary');
assert.equal(receipt.event_name, 'phase_6c.workspace_calendar_meetings_rooms_announcements.calendar_provider_sync_boundary.runtime_evaluated');
assert.equal(receipt.status, 'BOUNDARY_VALIDATED');
assert.equal(receipt.provider_neutral_only, true);
assert.equal(receipt.adapter_boundary_only, true);
assert.equal(receipt.boundary_envelope.provider, 'GOOGLE_CALENDAR');
assert.equal(receipt.boundary_envelope.adapter_boundary_only, true);
assert.deepEqual(receipt.validation_warnings, []);
assert.match(receipt.boundary_envelope.boundary_uid, /^[a-f0-9]{64}$/);
assert.match(receipt.runtime_evidence_digest, /^[a-f0-9]{64}$/);

const repeatedReceipt = evaluateCalendarProviderSyncBoundary(baseInput);
assert.equal(repeatedReceipt.runtime_evidence_digest, receipt.runtime_evidence_digest);
assert.equal(repeatedReceipt.boundary_envelope.boundary_uid, receipt.boundary_envelope.boundary_uid);

const importBoundaryReceipt = evaluateCalendarProviderSyncBoundary({
  ...baseInput,
  provider: 'OUTLOOK_CALENDAR',
  direction: 'IMPORT_FROM_PROVIDER',
  requested_scopes: ['READ_CALENDAR_METADATA'],
  credential_reference: undefined,
});
assert.equal(importBoundaryReceipt.status, 'BOUNDARY_VALIDATED');
assert.equal(importBoundaryReceipt.boundary_envelope.provider, 'OUTLOOK_CALENDAR');

const blockedBoundaryReceipt = evaluateCalendarProviderSyncBoundary({
  ...baseInput,
  direction: 'BIDIRECTIONAL_PROPOSED',
  requested_scopes: ['READ_WRITE_CALENDAR_EVENTS'],
  credential_reference: undefined,
});
assert.equal(blockedBoundaryReceipt.status, 'BLOCKED_REQUIRES_ADAPTER_IMPLEMENTATION');
assert.deepEqual(blockedBoundaryReceipt.validation_warnings, [
  'export_boundary_has_no_credential_reference',
  'read_write_scope_requires_future_adapter_review',
  'bidirectional_sync_requires_future_adapter_approval',
]);

assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, provider: 'APPLE_CALENDAR' as never }), /provider must be GOOGLE_CALENDAR or OUTLOOK_CALENDAR/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, direction: 'PUSH' as never }), /direction must be EXPORT_TO_PROVIDER, IMPORT_FROM_PROVIDER, or BIDIRECTIONAL_PROPOSED/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, requested_scopes: [] }), /at least one requested scope is required/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, requested_scopes: ['WRITE_CALENDAR_EVENTS', 'WRITE_CALENDAR_EVENTS'] }), /duplicate requested scope/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, requested_scopes: ['DELETE_CALENDAR_EVENTS' as never] }), /requested_scopes\[0\] must be READ_CALENDAR_METADATA/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, credential_reference: 'oauth_access_token_secret' }), /opaque reference/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, raw_credential_supplied: true }), /raw provider credentials are forbidden/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, provider_sdk_call_requested: true }), /provider SDK calls are forbidden/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, sync_execution_requested: true }), /sync execution is outside this FFET/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, webhook_registration_requested: true }), /provider webhook registration is outside this FFET/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, cross_phase_write_requested: true }), /cross-phase writes are forbidden/);
assert.throws(() => evaluateCalendarProviderSyncBoundary({ ...baseInput, authorization_flag_change_requested: true }), /authorization flag changes are human-gated/);

console.log('P6C runtime calendar_provider_sync_boundary test passed.');
