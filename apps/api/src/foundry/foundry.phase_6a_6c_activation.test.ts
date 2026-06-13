import { strict as assert } from 'node:assert';

import { BadRequestException } from '@nestjs/common';

import { FoundryService } from './foundry.service';

const service = new FoundryService();

const activeDecision = service.evaluatePhase6A6CRuntimeActivation({
  organization_id: 'org_stage2_activation_active',
  requested_capability_surface: 'phase_6a.tiered_verification',
  active_capability_surfaces: [
    'phase_6a.tiered_verification',
    'phase_6a.evidence_ledger_hardening',
    'phase_6b.billing_honesty_surfaces',
  ],
});

assert.equal(activeDecision.activation_authority, 'foundry_runtime_authority');
assert.equal(activeDecision.trusted_foundry_snapshot_required, true);
assert.equal(activeDecision.caller_controlled_activation_allowed, false);
assert.equal(activeDecision.requested_capability_surface, 'phase_6a.tiered_verification');
assert.equal(activeDecision.phase, 'phase_6a');
assert.equal(activeDecision.active, true);
assert.equal(activeDecision.allowed, true);
assert.equal(activeDecision.business_logic_execution_allowed, true);
assert.equal(activeDecision.unavailable_response, null);
assert.equal(activeDecision.http_status_when_inactive, null);
assert.equal(activeDecision.reason, 'capability_surface_active_in_foundry_snapshot');
assert.equal(activeDecision.stage_2_runtime_boundary.audit_evidence_required, true);

const inactiveDecision = service.evaluatePhase6A6CRuntimeActivation({
  organization_id: 'org_stage2_activation_inactive',
  requested_capability_surface: 'phase_6b.marketplace_transaction_infrastructure',
  active_capability_surfaces: ['phase_6b.billing_honesty_surfaces'],
});

assert.equal(inactiveDecision.activation_authority, 'foundry_runtime_authority');
assert.equal(inactiveDecision.requested_capability_surface, 'phase_6b.marketplace_transaction_infrastructure');
assert.equal(inactiveDecision.phase, 'phase_6b');
assert.equal(inactiveDecision.active, false);
assert.equal(inactiveDecision.allowed, false);
assert.equal(inactiveDecision.business_logic_execution_allowed, false);
assert.equal(inactiveDecision.unavailable_response, 'not_found');
assert.equal(inactiveDecision.http_status_when_inactive, 404);
assert.equal(inactiveDecision.reason, 'capability_surface_inactive_in_foundry_snapshot');
assert.match(inactiveDecision.decision_hash, /^[a-f0-9]{64}$/);
assert.match(inactiveDecision.decision_id, /^foundry_phase_6a_6c_activation_[a-f0-9]{16}$/);

const duplicateSurfaceDecision = service.evaluatePhase6A6CRuntimeActivation({
  organization_id: 'org_stage2_activation_deduped',
  requested_capability_surface: 'phase_6c.structured_agreements',
  active_capability_surfaces: ['phase_6c.structured_agreements', 'phase_6c.structured_agreements'],
});

assert.equal(duplicateSurfaceDecision.active_capability_surface_count, 1);
assert.equal(duplicateSurfaceDecision.allowed, true);

assert.throws(
  () =>
    service.evaluatePhase6A6CRuntimeActivation({
      organization_id: 'org_stage2_activation_unknown_requested',
      requested_capability_surface: 'phase_6d.not_authorized',
      active_capability_surfaces: [],
    }),
  BadRequestException,
);

assert.throws(
  () =>
    service.evaluatePhase6A6CRuntimeActivation({
      organization_id: 'org_stage2_activation_unknown_active',
      requested_capability_surface: 'phase_6a.person_graph_multi_participant',
      active_capability_surfaces: ['phase_6a.person_graph_multi_participant', 'phase_6b.unknown_surface'],
    }),
  BadRequestException,
);

assert.throws(
  () =>
    service.evaluatePhase6A6CRuntimeActivation({
      organization_id: '',
      requested_capability_surface: 'phase_6a.person_graph_multi_participant',
      active_capability_surfaces: [],
    }),
  BadRequestException,
);

console.log('Foundry Phase 6A-6C runtime activation authority checks passed');
