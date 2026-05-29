import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  FoundryService,
  type FoundryModuleManifestCandidate,
  type FoundryUpdateExecutionInput,
} from './foundry.service';

function validManifest(overrides?: Partial<FoundryModuleManifestCandidate>): FoundryModuleManifestCandidate {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    module_type: 'standard',
    version: '0.2.0',
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

function validUpdateInput(
  service: FoundryService,
  overrides?: Partial<FoundryUpdateExecutionInput>,
): FoundryUpdateExecutionInput {
  const manifest = validManifest();
  const compatibilityResult = service.checkCompatibility({
    manifest,
    platform_core_version: '1.0.0',
    installed_modules: [{ module_key: 'core.access', version: '0.1.0', status: 'enabled' }],
  });

  return {
    module_key: 'platform.fixture',
    current_version: '0.1.0',
    target_version: '0.2.0',
    current_manifest_hash: 'f'.repeat(64),
    target_manifest_hash: service.assertManifestValid(manifest).manifest_hash ?? '',
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_014a',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-014a/evidence.md',
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-014a/migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-014a/rollback-plan.md',
    compatibility_result: compatibilityResult,
    organization_id: 'org-014a',
    actor_user_id: 'actor-014a',
    correlation_id: 'corr-p5b-014a',
    ...overrides,
  };
}

function testUpdateProducesDeterministicReceiptWithLifecyclePath() {
  const service = new FoundryService();
  const input = validUpdateInput(service);

  const receipt = service.executeUpdate(input);
  const repeated = service.executeUpdate(input);

  assert.equal(receipt.action_key, 'module.update');
  assert.deepEqual(receipt.status_path, ['enabled', 'update_available', 'updating', 'enabled']);
  assert.equal(receipt.foundry_execution_completed, true);
  assert.equal(receipt.lifecycle_transitions.length, 3);
  assert.deepEqual(
    receipt.lifecycle_transitions.map((transition) => transition.action_key),
    ['module.mark_update_available', 'module.start_update', 'module.complete_update'],
  );
  assert.equal(receipt.migration.transaction_required, true);
  assert.equal(receipt.migration.destructive_migration_allowed, false);
  assert.equal(receipt.rollback.required_before_execution, true);
  assert.equal(receipt.rollback.recovery_flow_deferred_to, 'P5B-014b');
  assert.equal(receipt.compatibility.compatible, true);
  assert.equal(receipt.registry.next_status, 'enabled');
  assert.equal(receipt.registry.update_available_cleared, true);
  assert.equal(receipt.evidence.evidence_required_before_execution, true);
  assert.match(receipt.execution_id, /^foundry-update-[a-f0-9]{16}$/);
  assert.match(receipt.receipt_hash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.receipt_hash, repeated.receipt_hash);
}

function testUpdateRequiresGatekeeperAllowCompatibilityAndRollbackPlan() {
  const service = new FoundryService();
  const incompatible = service.checkCompatibility({
    manifest: validManifest({ min_platform_version: '9.0.0' }),
    platform_core_version: '1.0.0',
    installed_modules: [],
  });

  assert.throws(
    () => service.executeUpdate(validUpdateInput(service, { gatekeeper_outcome: 'APPROVAL_REQUIRED' })),
    BadRequestException,
  );
  assert.throws(
    () => service.executeUpdate(validUpdateInput(service, { compatibility_result: incompatible })),
    BadRequestException,
  );
  assert.throws(() => service.executeUpdate(validUpdateInput(service, { rollback_plan_ref: '' })), BadRequestException);
}

function testUpdateRejectsDowngradeAndMalformedInput() {
  const service = new FoundryService();

  assert.throws(
    () => service.executeUpdate(validUpdateInput(service, { target_version: '0.1.0' })),
    BadRequestException,
  );
  assert.throws(() => service.executeUpdate(validUpdateInput(service, { module_key: 'invalid' })), BadRequestException);
  assert.throws(
    () => service.executeUpdate(validUpdateInput(service, { target_manifest_hash: 'not-a-sha' })),
    BadRequestException,
  );
}

function run() {
  testUpdateProducesDeterministicReceiptWithLifecyclePath();
  testUpdateRequiresGatekeeperAllowCompatibilityAndRollbackPlan();
  testUpdateRejectsDowngradeAndMalformedInput();

  console.log('P5B-014a Foundry update flow tests passed.');
}

run();
