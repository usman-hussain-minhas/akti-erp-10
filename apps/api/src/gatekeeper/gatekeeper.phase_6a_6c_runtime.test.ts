import { strict as assert } from 'node:assert';

import { ForbiddenException, ServiceUnavailableException } from '@nestjs/common';

import { GatekeeperPreflightService, type GatekeeperPreflightInput } from './gatekeeper-preflight.service';

const service = new GatekeeperPreflightService();

function baseInput(overrides: Partial<GatekeeperPreflightInput> = {}): GatekeeperPreflightInput {
  const capabilityKey = overrides.capability_key ?? 'phase6a.tiered-verification';
  const moduleKey =
    overrides.module_key ??
    (capabilityKey.startsWith('phase6a.')
      ? 'phase6a.runtime'
      : capabilityKey.startsWith('phase6b.')
        ? 'phase6b.runtime'
        : 'phase6c.runtime');

  return {
    organization_id: 'org-stage2-gatekeeper',
    actor_user_id: 'user-stage2-gatekeeper',
    active_group_ids: ['group-stage2-runtime-operator'],
    entity_type: 'phase6a.runtime-action',
    entity_id: 'entity-stage2-gatekeeper',
    action_key: 'phase6a.runtime-action.preflight',
    capability_key: capabilityKey,
    module_key: moduleKey,
    scope_unit_id: null,
    payload: {
      action_key: 'phase6a.runtime-action.preflight',
      correlation_id: 'corr-stage2-gatekeeper',
      ...(overrides.payload ?? {}),
    },
    module_health: {
      [moduleKey]: 'healthy',
      ...(overrides.module_health ?? {}),
    },
    dependency_health: {
      'core.access': 'healthy',
      ...(overrides.dependency_health ?? {}),
    },
    reauth_status: overrides.reauth_status ?? 'not_required',
    ...overrides,
  };
}

async function main() {
  const allowDecision = await service.evaluatePreflight(baseInput());
  assert.equal(allowDecision.decision, 'ALLOW');
  assert.equal(allowDecision.capability_key, 'phase6a.tiered-verification');
  assert.equal(allowDecision.organization_id, 'org-stage2-gatekeeper');
  assert.equal(allowDecision.actor_user_id, 'user-stage2-gatekeeper');
  assert.equal(allowDecision.decision_token?.startsWith('gk_'), true);
  assert.equal(allowDecision.reauth_required, false);

  const denyDecision = await service.evaluatePreflight(
    baseInput({
      capability_key: 'phase6b.payout-rails',
      module_key: 'phase6b.runtime',
      entity_type: 'phase6b.payout-action',
      action_key: 'phase6b.payout.preflight',
      payload: { action_key: 'phase6b.payout.preflight' },
      module_health: { 'phase6b.runtime': 'healthy' },
      reauth_status: 'expired',
    }),
  );
  assert.equal(denyDecision.decision, 'DENY');
  assert.equal(denyDecision.reasons[0]?.code, 'gatekeeper.reauth.unsatisfied');
  assert.equal(denyDecision.decision_token, undefined);

  const approvalDecision = await service.evaluatePreflight(
    baseInput({
      capability_key: 'phase6c.structured-agreements',
      module_key: 'phase6c.runtime',
      entity_type: 'phase6c.structured-agreement',
      action_key: 'phase6c.structured-agreement.publish',
      payload: {
        action_key: 'phase6c.structured-agreement.publish',
        migration_risk: 'approval_required',
      },
      module_health: { 'phase6c.runtime': 'healthy' },
    }),
  );
  assert.equal(approvalDecision.decision, 'APPROVAL_REQUIRED');
  assert.equal(approvalDecision.approval_chain_key, 'gatekeeper.migration.approval');
  assert.equal(approvalDecision.missing_evidence.includes('gatekeeper.migration.evidence'), true);

  const stopDecision = await service.evaluatePreflight(
    baseInput({
      capability_key: 'phase6a.foundry-cross-tenant-activation',
      module_key: 'phase6a.runtime',
      entity_type: 'phase6a.cross-tenant-activation',
      action_key: 'phase6a.cross-tenant-activation.override',
      payload: {
        action_key: 'phase6a.cross-tenant-activation.override',
        risk_surface: 'migration',
        tenant_admin_override_requested: true,
      },
      module_health: { 'phase6a.runtime': 'healthy' },
    }),
  );
  assert.equal(stopDecision.decision, 'STOP_FOR_REVIEW');
  assert.equal(stopDecision.approval_chain_key, undefined);
  assert.equal(stopDecision.decision_token, undefined);
  assert.equal(stopDecision.missing_evidence.includes('gatekeeper.platform-architect.review'), true);

  await assert.rejects(
    () =>
      service.requireAllow(
        baseInput({
          capability_key: 'phase6b.payout-rails',
          module_key: 'phase6b.runtime',
          entity_type: 'phase6b.payout-action',
          action_key: 'phase6b.payout.preflight',
          payload: { action_key: 'phase6b.payout.preflight' },
          module_health: { 'phase6b.runtime': 'healthy' },
          reauth_status: 'expired',
        }),
      ),
    ForbiddenException,
  );

  await assert.rejects(
    () =>
      service.requireAllow(
        baseInput({
          capability_key: 'phase6a.foundry-cross-tenant-activation',
          module_key: 'phase6a.runtime',
          entity_type: 'phase6a.cross-tenant-activation',
          action_key: 'phase6a.cross-tenant-activation.override',
        payload: {
          action_key: 'phase6a.cross-tenant-activation.override',
          risk_surface: 'migration',
          tenant_admin_override_requested: true,
        },
          module_health: { 'phase6a.runtime': 'healthy' },
        }),
      ),
    ServiceUnavailableException,
  );

  console.log('Gatekeeper Phase 6A-6C runtime spine checks passed');
}

void main();
