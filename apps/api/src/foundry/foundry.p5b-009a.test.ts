import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FoundryService, type FoundryModuleScaffoldInput } from './foundry.service';

function validInput(overrides?: Partial<FoundryModuleScaffoldInput>): FoundryModuleScaffoldInput {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    module_type: 'standard',
    version: '0.1.0',
    owner: 'platform',
    min_platform_version: '0.1.0',
    capabilities: ['platform.fixture.manage', 'platform.fixture.view', 'platform.fixture.view'],
    dependencies: ['core.access', 'engagement.gateway', 'core.access'],
    ...overrides,
  };
}

function testScaffoldBuildsDeterministicNonExecutingModuleCandidate() {
  const service = new FoundryService();

  const scaffold = service.scaffoldModule(validInput());
  const repeated = service.scaffoldModule(validInput());

  assert.equal(scaffold.module_key, 'platform.fixture');
  assert.equal(scaffold.lifecycle_status, 'scaffolded');
  assert.equal(scaffold.gatekeeper_preflight_required, true);
  assert.equal(scaffold.foundry_execution_allowed, false);
  assert.deepEqual(scaffold.capabilities, ['platform.fixture.manage', 'platform.fixture.view']);
  assert.deepEqual(scaffold.dependencies, ['core.access', 'engagement.gateway']);
  assert.equal(scaffold.manifest_hash, repeated.manifest_hash);
  assert.match(scaffold.manifest_hash, /^[a-f0-9]{64}$/);
}

function testScaffoldPreservesPhaseBoundaryGuards() {
  const service = new FoundryService();
  const scaffold = service.scaffoldModule(validInput());

  assert.deepEqual(scaffold.non_scope_guards, {
    business_module: false,
    golden_module: false,
    marketplace_public: false,
    production_adapter_enabled: false,
  });
}

function testScaffoldRejectsOutOfPhaseModuleScope() {
  const service = new FoundryService();

  for (const forbidden of [
    { business_module: true },
    { golden_module: true },
    { marketplace_public: true },
    { production_adapter_enabled: true },
  ]) {
    assert.throws(() => service.scaffoldModule(validInput(forbidden)), BadRequestException);
  }
}

function testScaffoldRejectsMalformedKeysAndVersions() {
  const service = new FoundryService();

  assert.throws(() => service.scaffoldModule(validInput({ module_key: 'Invalid Module' })), BadRequestException);
  assert.throws(
    () => service.scaffoldModule(validInput({ capabilities: ['invalid capability'] })),
    BadRequestException,
  );
  assert.throws(() => service.scaffoldModule(validInput({ dependencies: ['invalid'] })), BadRequestException);
  assert.throws(() => service.scaffoldModule(validInput({ version: 'latest' })), BadRequestException);
  assert.throws(() => service.scaffoldModule(validInput({ min_platform_version: 'current' })), BadRequestException);
}

function run() {
  testScaffoldBuildsDeterministicNonExecutingModuleCandidate();
  testScaffoldPreservesPhaseBoundaryGuards();
  testScaffoldRejectsOutOfPhaseModuleScope();
  testScaffoldRejectsMalformedKeysAndVersions();

  console.log('P5B-009a Foundry module scaffold tests passed.');
}

run();
