import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  FoundryService,
  type FoundryInstallExecutionInput,
  type FoundryModuleManifestCandidate,
} from './foundry.service';

function validManifest(overrides?: Partial<FoundryModuleManifestCandidate>): FoundryModuleManifestCandidate {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    module_type: 'standard',
    version: '0.1.0',
    owner: 'platform',
    min_platform_version: '0.1.0',
    dependencies: [{ module_key: 'core.access', min_version: '0.1.0' }],
    optional_dependencies: [],
    capabilities: [
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
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        allowed_scope_types: ['organization'],
      },
    ],
    api_routes: [
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
    schemas: [{ key: 'platform.fixture.schema' }],
    migrations: [{ key: 'platform.fixture.migration' }],
    data_ownership: {
      owner_module_key: 'platform.fixture',
      tenant_scoped: true,
      entity_refs: ['platform.fixture.record'],
    },
    ...overrides,
  };
}

function validExecutionInput(
  service: FoundryService,
  overrides?: Partial<FoundryInstallExecutionInput>,
): FoundryInstallExecutionInput {
  const manifest = validManifest();
  const compatibilityResult = service.checkCompatibility({
    manifest,
    platform_core_version: '1.0.0',
    installed_modules: [
      {
        module_key: 'core.access',
        version: '0.1.0',
        status: 'enabled',
      },
    ],
  });

  return {
    module_key: 'platform.fixture',
    module_version: '0.1.0',
    manifest_hash: service.assertManifestValid(manifest).manifest_hash ?? '',
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_012b',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012b/evidence.md',
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012b/migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012b/rollback-plan.md',
    compatibility_result: compatibilityResult,
    organization_id: 'org-012b',
    actor_user_id: 'actor-012b',
    correlation_id: 'corr-p5b-012b',
    ...overrides,
  };
}

function testInstallExecutionProducesDeterministicInstalledReceipt() {
  const service = new FoundryService();
  const input = validExecutionInput(service);

  const receipt = service.executeInstall(input);
  const repeated = service.executeInstall(input);

  assert.equal(receipt.action_key, 'module.install');
  assert.equal(receipt.status_from, 'installable');
  assert.equal(receipt.status_to, 'installed');
  assert.equal(receipt.foundry_execution_completed, true);
  assert.equal(receipt.lifecycle_transition.allowed, true);
  assert.equal(receipt.migration.transaction_required, true);
  assert.equal(receipt.migration.destructive_migration_allowed, false);
  assert.equal(receipt.rollback.required_before_execution, true);
  assert.equal(receipt.registry.next_status, 'installed');
  assert.equal(receipt.registry.persistence_required, true);
  assert.equal(receipt.capability_seed.required_after_install, true);
  assert.equal(receipt.capability_seed.business_capabilities_allowed, false);
  assert.equal(receipt.evidence.receipt_required, true);
  assert.equal(receipt.evidence.receipt_storage_deferred_to, 'P5B-012c');
  assert.equal(receipt.audit.event_type, 'foundry.install.executed');
  assert.match(receipt.execution_id, /^foundry-install-[a-f0-9]{16}$/);
  assert.match(receipt.receipt_hash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.receipt_hash, repeated.receipt_hash);
}

function testInstallExecutionRequiresGatekeeperAllow() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeInstall(validExecutionInput(service, { gatekeeper_outcome: 'STOP_FOR_REVIEW' })),
    BadRequestException,
  );
}

function testInstallExecutionRequiresEvidenceMigrationAndRollbackRefs() {
  const service = new FoundryService();

  for (const missing of [
    { evidence_ref: '' },
    { migration_plan_ref: '' },
    { rollback_plan_ref: '' },
    { gatekeeper_decision_token: '' },
  ]) {
    assert.throws(
      () => service.executeInstall(validExecutionInput(service, missing)),
      BadRequestException,
    );
  }
}

function testInstallExecutionRequiresCompatibleModuleResult() {
  const service = new FoundryService();
  const incompatible = service.checkCompatibility({
    manifest: validManifest({ min_platform_version: '9.0.0' }),
    platform_core_version: '1.0.0',
    installed_modules: [],
  });

  assert.throws(
    () => service.executeInstall(validExecutionInput(service, { compatibility_result: incompatible })),
    BadRequestException,
  );
}

function testInstallExecutionRejectsMalformedModuleOrManifestInputs() {
  const service = new FoundryService();

  assert.throws(() => service.executeInstall(validExecutionInput(service, { module_key: 'invalid' })), BadRequestException);
  assert.throws(
    () => service.executeInstall(validExecutionInput(service, { module_version: 'latest' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeInstall(validExecutionInput(service, { manifest_hash: 'not-a-sha' })),
    BadRequestException,
  );
}

function run() {
  testInstallExecutionProducesDeterministicInstalledReceipt();
  testInstallExecutionRequiresGatekeeperAllow();
  testInstallExecutionRequiresEvidenceMigrationAndRollbackRefs();
  testInstallExecutionRequiresCompatibleModuleResult();
  testInstallExecutionRejectsMalformedModuleOrManifestInputs();

  console.log('P5B-012b Foundry install execution tests passed.');
}

run();
