import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  FoundryService,
  type FoundryLifecycleTransitionInput,
} from './foundry.service';

function validTransition(overrides?: Partial<FoundryLifecycleTransitionInput>): FoundryLifecycleTransitionInput {
  return {
    module_key: 'platform.fixture',
    from_state: 'installed',
    to_state: 'enabled',
    action_key: 'module.enable',
    gatekeeper_outcome: 'ALLOW',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011b/evidence.md',
    ...overrides,
  };
}

function expectBlocked(input: FoundryLifecycleTransitionInput, expected: RegExp[]) {
  const service = new FoundryService();
  const plan = service.planLifecycleTransition(input);
  const text = plan.errors.join('\n');

  assert.equal(plan.allowed, false);
  assert.equal(plan.foundry_execution_allowed, false);

  for (const pattern of expected) {
    assert.match(text, pattern);
  }

  assert.throws(() => service.assertLifecycleTransition(input), BadRequestException);
}

function testSkippedLifecycleStatesAreBlocked() {
  expectBlocked(
    validTransition({
      from_state: 'proposed',
      to_state: 'enabled',
      action_key: 'module.enable',
    }),
    [/not allowed: proposed -> enabled/],
  );
}

function testWrongActionForValidStatesIsBlocked() {
  expectBlocked(
    validTransition({
      from_state: 'installed',
      to_state: 'enabled',
      action_key: 'module.disable',
    }),
    [/not allowed: installed -> enabled via module\.disable/],
  );
}

function testMissingEvidenceIsBlocked() {
  expectBlocked(
    validTransition({
      evidence_ref: '',
    }),
    [/requires evidence_ref/],
  );
}

function testNonAllowGatekeeperOutcomesBlockFoundryExecution() {
  for (const outcome of ['DENY', 'APPROVAL_REQUIRED', 'STOP_FOR_REVIEW'] as const) {
    expectBlocked(
      validTransition({
        gatekeeper_outcome: outcome,
      }),
      [/requires Gatekeeper ALLOW/],
    );
  }
}

function testTerminalAndBlockedStatesDoNotAdvance() {
  expectBlocked(
    validTransition({
      from_state: 'uninstalled',
      to_state: 'enabled',
      action_key: 'module.enable',
    }),
    [/not allowed: uninstalled -> enabled/],
  );
  expectBlocked(
    validTransition({
      from_state: 'blocked',
      to_state: 'enabled',
      action_key: 'module.enable',
    }),
    [/not allowed: blocked -> enabled/],
  );
}

function testInvalidModuleKeyIsBlocked() {
  expectBlocked(
    validTransition({
      module_key: 'invalid',
    }),
    [/module_key must use module key syntax/],
  );
}

function run() {
  testSkippedLifecycleStatesAreBlocked();
  testWrongActionForValidStatesIsBlocked();
  testMissingEvidenceIsBlocked();
  testNonAllowGatekeeperOutcomesBlockFoundryExecution();
  testTerminalAndBlockedStatesDoNotAdvance();
  testInvalidModuleKeyIsBlocked();

  console.log('P5B-011b Foundry lifecycle invalid-transition tests passed.');
}

run();
