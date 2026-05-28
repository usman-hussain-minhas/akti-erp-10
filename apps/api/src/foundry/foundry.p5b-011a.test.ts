import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  FOUNDRY_LIFECYCLE_STATES,
  FoundryService,
  type FoundryLifecycleState,
} from './foundry.service';

function testPolicyLifecycleStatesAreDeclared() {
  assert.deepEqual([...FOUNDRY_LIFECYCLE_STATES], [
    'proposed',
    'certified',
    'installable',
    'installed',
    'enabled',
    'disabled',
    'update_available',
    'updating',
    'rollback_required',
    'retiring',
    'uninstalled',
    'blocked',
  ]);
}

function testPrimaryLifecycleChainRequiresGatekeeperAllowAndEvidence() {
  const service = new FoundryService();
  const chain: Array<[FoundryLifecycleState, FoundryLifecycleState, string]> = [
    ['proposed', 'certified', 'module.certify'],
    ['certified', 'installable', 'module.mark_installable'],
    ['installable', 'installed', 'module.install'],
    ['installed', 'enabled', 'module.enable'],
  ];

  for (const [fromState, toState, actionKey] of chain) {
    const plan = service.planLifecycleTransition({
      module_key: 'platform.fixture',
      from_state: fromState,
      to_state: toState,
      action_key: actionKey,
      gatekeeper_outcome: 'ALLOW',
      evidence_ref: `codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/${actionKey}.md`,
    });

    assert.equal(plan.allowed, true);
    assert.equal(plan.foundry_execution_allowed, true);
    assert.equal(plan.gatekeeper_required, true);
    assert.equal(plan.evidence_required, true);
    assert.equal(plan.registry_persistence_required, true);
    assert.deepEqual(plan.errors, []);
  }
}

function testEnabledAndInstalledRemainDistinctStates() {
  const service = new FoundryService();

  const installedToEnabled = service.planLifecycleTransition({
    module_key: 'platform.fixture',
    from_state: 'installed',
    to_state: 'enabled',
    action_key: 'module.enable',
    gatekeeper_outcome: 'ALLOW',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/enable.md',
  });
  const enabledToDisabled = service.planLifecycleTransition({
    module_key: 'platform.fixture',
    from_state: 'enabled',
    to_state: 'disabled',
    action_key: 'module.disable',
    gatekeeper_outcome: 'ALLOW',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/disable.md',
  });
  const disabledToEnabled = service.planLifecycleTransition({
    module_key: 'platform.fixture',
    from_state: 'disabled',
    to_state: 'enabled',
    action_key: 'module.enable',
    gatekeeper_outcome: 'ALLOW',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/reenable.md',
  });

  assert.equal(installedToEnabled.allowed, true);
  assert.equal(enabledToDisabled.allowed, true);
  assert.equal(disabledToEnabled.allowed, true);
  assert.equal(installedToEnabled.from_state, 'installed');
  assert.equal(installedToEnabled.to_state, 'enabled');
}

function testRollbackAndUninstallStatesAreRepresentedWithoutExecutingActions() {
  const service = new FoundryService();

  const rollbackRequired = service.planLifecycleTransition({
    module_key: 'platform.fixture',
    from_state: 'updating',
    to_state: 'rollback_required',
    action_key: 'module.require_rollback',
    gatekeeper_outcome: 'ALLOW',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/rollback.md',
  });
  const retiring = service.planLifecycleTransition({
    module_key: 'platform.fixture',
    from_state: 'enabled',
    to_state: 'retiring',
    action_key: 'module.retire',
    gatekeeper_outcome: 'ALLOW',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/retire.md',
  });
  const uninstalled = service.planLifecycleTransition({
    module_key: 'platform.fixture',
    from_state: 'retiring',
    to_state: 'uninstalled',
    action_key: 'module.uninstall',
    gatekeeper_outcome: 'ALLOW',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/uninstall.md',
  });

  assert.equal(rollbackRequired.allowed, true);
  assert.equal(retiring.allowed, true);
  assert.equal(uninstalled.allowed, true);
}

function testLifecycleTransitionFailsClosedWithoutGatekeeperAllow() {
  const service = new FoundryService();

  const plan = service.planLifecycleTransition({
    module_key: 'platform.fixture',
    from_state: 'installed',
    to_state: 'enabled',
    action_key: 'module.enable',
    gatekeeper_outcome: 'APPROVAL_REQUIRED',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/approval.md',
  });

  assert.equal(plan.allowed, false);
  assert.equal(plan.foundry_execution_allowed, false);
  assert.match(plan.errors.join('\n'), /Gatekeeper ALLOW/);
  assert.throws(
    () =>
      service.assertLifecycleTransition({
        module_key: 'platform.fixture',
        from_state: 'installed',
        to_state: 'enabled',
        action_key: 'module.enable',
        gatekeeper_outcome: 'DENY',
        evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/deny.md',
      }),
    BadRequestException,
  );
}

function run() {
  testPolicyLifecycleStatesAreDeclared();
  testPrimaryLifecycleChainRequiresGatekeeperAllowAndEvidence();
  testEnabledAndInstalledRemainDistinctStates();
  testRollbackAndUninstallStatesAreRepresentedWithoutExecutingActions();
  testLifecycleTransitionFailsClosedWithoutGatekeeperAllow();

  console.log('P5B-011a Foundry lifecycle state machine tests passed.');
}

run();
