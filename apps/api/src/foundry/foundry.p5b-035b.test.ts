import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { FoundryService, type FoundryModuleManifestCandidate } from './foundry.service';

function internalFixtureManifest(overrides?: Partial<FoundryModuleManifestCandidate>): FoundryModuleManifestCandidate {
  return {
    module_key: 'platform.fixture',
    display_name: 'Internal Platform Fixture',
    module_type: 'standard',
    version: '0.1.0',
    owner: 'platform',
    min_platform_version: '0.1.0',
    dependencies: [{ module_key: 'core.access', min_version: '0.1.0' }],
    optional_dependencies: [],
    capabilities: [
      {
        key: 'platform.fixture.read',
        module_key: 'platform.fixture',
        risk_level: 'low',
        requires_reauth: false,
        requires_audit: false,
        gatekeeper_required: false,
      },
      {
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        risk_level: 'high',
        requires_reauth: false,
        requires_audit: true,
        gatekeeper_required: true,
      },
    ],
    permissions: [
      {
        key: 'platform.fixture.read',
        module_key: 'platform.fixture',
        allowed_scope_types: ['organization'],
      },
      {
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        allowed_scope_types: ['organization'],
      },
    ],
    api_routes: [
      {
        method: 'GET',
        path: '/platform/fixture',
        capability_key: 'platform.fixture.read',
      },
      {
        method: 'POST',
        path: '/platform/fixture/actions',
        capability_key: 'platform.fixture.manage',
      },
    ],
    gatekeeper_hooks: [
      {
        key: 'platform.fixture.manage.preflight',
        capability_key: 'platform.fixture.manage',
        required: true,
      },
    ],
    schemas: [{ key: 'platform.fixture.read.output' }, { key: 'platform.fixture.lifecycle.proved.event' }],
    migrations: [{ key: 'platform.fixture.non-destructive-migration-proof' }],
    data_ownership: {
      owner_module_key: 'platform.fixture',
      tenant_scoped: true,
      entity_refs: [],
    },
    ...overrides,
  };
}

function runHarness(overrides?: Partial<FoundryModuleManifestCandidate>) {
  const service = new FoundryService();

  return service.runInternalFixtureLifecycleHarness({
    manifest: internalFixtureManifest(overrides),
    target_version: '0.1.1',
    organization_id: 'org-p5b-035b',
    actor_user_id: 'actor-p5b-035b',
    correlation_id: 'corr-p5b-035b',
  });
}

function testInternalFixtureLifecycleHarnessCoversRequiredFoundryActions() {
  const result = runHarness();

  assert.deepEqual(result.completed_actions, [
    'module.install',
    'module.install.evidence_received',
    'module.enable',
    'module.disable',
    'module.uninstall',
    'module.update',
    'module.rollback_recovery',
  ]);
  assert.equal(result.module_key, 'platform.fixture');
  assert.equal(result.current_version, '0.1.0');
  assert.equal(result.target_version, '0.1.1');
  assert.match(result.manifest_hash, /^[a-f0-9]{64}$/);
  assert.match(result.target_manifest_hash, /^[a-f0-9]{64}$/);
}

function testHarnessRequiresGatekeeperAllowBeforeFoundryExecution() {
  const result = runHarness();
  const executionReceipts = [
    result.install_execution,
    result.enable_receipt,
    result.disable_receipt,
    result.uninstall_receipt,
    result.update_receipt,
    result.rollback_recovery_receipt,
  ];

  for (const receipt of executionReceipts) {
    assert.equal(receipt.gatekeeper_outcome, 'ALLOW');
    assert.equal(receipt.foundry_execution_completed, true);
    assert.equal(receipt.audit.audit_completeness.gatekeeper_outcome_present, true);
    assert.equal(receipt.audit.audit_completeness.event_envelope_compliant, true);
  }

  assert.equal(result.evidence_package.complete, true);
  assert.equal(result.install_evidence_receipt.accepted, true);
  assert.equal(result.boundary.foundry_execution_after_gatekeeper_allow_only, true);
  assert.equal(result.boundary.event_envelopes_compliant, true);
}

function testHarnessPreservesInternalFixtureBoundary() {
  const result = runHarness();

  assert.equal(result.boundary.internal_fixture_only, true);
  assert.equal(result.boundary.business_module, false);
  assert.equal(result.boundary.golden_module, false);
  assert.equal(result.boundary.marketplace_public, false);
  assert.equal(result.boundary.production_adapter_enabled, false);
  assert.equal(result.install_execution.capability_seed.business_capabilities_allowed, false);
  assert.equal(result.enable_receipt.runtime_surface.phase5c_frontend_polish_allowed, false);
}

function testHarnessRejectsOutOfPhaseFixtureScopeAndMissingDependencies() {
  const service = new FoundryService();

  assert.throws(
    () =>
      service.runInternalFixtureLifecycleHarness({
        manifest: internalFixtureManifest({ module_key: 'lead.desk' }),
        target_version: '0.1.1',
        organization_id: 'org-p5b-035b',
        actor_user_id: 'actor-p5b-035b',
        correlation_id: 'corr-p5b-035b',
      }),
    BadRequestException,
  );

  assert.throws(
    () =>
      service.runInternalFixtureLifecycleHarness({
        manifest: internalFixtureManifest(),
        target_version: '0.1.1',
        organization_id: 'org-p5b-035b',
        actor_user_id: 'actor-p5b-035b',
        correlation_id: 'corr-p5b-035b',
        installed_modules: [],
      }),
    BadRequestException,
  );
}

function run() {
  testInternalFixtureLifecycleHarnessCoversRequiredFoundryActions();
  testHarnessRequiresGatekeeperAllowBeforeFoundryExecution();
  testHarnessPreservesInternalFixtureBoundary();
  testHarnessRejectsOutOfPhaseFixtureScopeAndMissingDependencies();

  console.log('P5B-035b internal fixture Foundry lifecycle harness tests passed.');
}

run();
