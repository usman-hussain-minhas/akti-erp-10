import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  FoundryService,
  type FoundryEvidencePackageInput,
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

function validEvidencePackageInput(
  service: FoundryService,
  overrides?: Partial<FoundryEvidencePackageInput>,
): FoundryEvidencePackageInput {
  const manifest = validManifest();
  const manifestValidation = service.assertManifestValid(manifest);
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
    lifecycle_action: 'module.install',
    manifest,
    manifest_hash: manifestValidation.manifest_hash ?? '',
    migration_files: [
      {
        kind: 'migration',
        path: 'prisma/migrations/20260529000000_platform_fixture/migration.sql',
        sha256: 'a'.repeat(64),
      },
    ],
    capability_snapshot_before: ['platform.shell.access'],
    capability_snapshot_after: ['platform.fixture.manage', 'platform.shell.access'],
    health_check_results: [
      {
        name: 'foundry.health',
        status: 'passed',
        command: 'pnpm --dir apps/api exec tsx src/foundry/foundry.p5b-011d.test.ts',
        summary: 'Foundry health baseline passed.',
      },
    ],
    smoke_test_results: [
      {
        name: 'foundry.smoke',
        status: 'passed',
        summary: 'Foundry smoke baseline passed.',
      },
    ],
    validation_results: [
      {
        name: 'foundry.validation',
        status: 'passed',
        command: 'pnpm --filter @akti/api typecheck',
        summary: 'Foundry evidence package validation passed.',
      },
    ],
    gatekeeper_decision: {
      decision_id: 'gkd-011d-allow',
      outcome: 'ALLOW',
      decided_by_actor_id: 'platform-operator-011d',
      reason_summary: 'Gatekeeper approved scoped Foundry lifecycle evidence package creation.',
      risk_level: 'high',
    },
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011d/rollback-plan.md',
    installer_actor_id: 'platform-operator-011d',
    organization_id: 'org-p5b-011d',
    correlation_id: 'corr-p5b-011d',
    compatibility_result: compatibilityResult,
    step_timestamps: [
      { step: 'manifest_validated', at: '2026-05-29T00:00:00.000Z' },
      { step: 'gatekeeper_decision_recorded', at: '2026-05-29T00:01:00.000Z' },
    ],
    ...overrides,
  };
}

function testCompleteEvidencePackageIncludesRequiredSectionsAndDeterministicHash() {
  const service = new FoundryService();
  const input = validEvidencePackageInput(service);

  const result = service.buildEvidencePackage(input);
  const repeated = service.buildEvidencePackage(input);

  assert.equal(result.complete, true);
  assert.equal(result.foundry_execution_allowed, true);
  assert.equal(result.gatekeeper_required, true);
  assert.equal(result.audit_outbox_storage_required, true);
  assert.equal(result.artifact_count, 1);
  assert.equal(result.validation_result_count, 3);
  assert.match(result.package_id, /^foundry-evidence-[a-f0-9]{16}$/);
  assert.match(result.package_hash, /^[a-f0-9]{64}$/);
  assert.equal(result.package_hash, repeated.package_hash);
  assert.deepEqual(Object.values(result.required_sections_complete), Array(11).fill(true));
  assert.deepEqual(result.errors, []);
}

function testGatekeeperNonAllowDecisionIsRecordedButBlocksFoundryExecution() {
  const service = new FoundryService();
  const result = service.buildEvidencePackage(
    validEvidencePackageInput(service, {
      gatekeeper_decision: {
        decision_id: 'gkd-011d-stop',
        outcome: 'STOP_FOR_REVIEW',
        decided_by_actor_id: 'platform-operator-011d',
        reason_summary: 'Platform architect review required before lifecycle execution.',
        risk_level: 'critical',
      },
    }),
  );

  assert.equal(result.required_sections_complete.gatekeeper_decision_log, true);
  assert.equal(result.complete, false);
  assert.equal(result.foundry_execution_allowed, false);
  assert.match(result.errors.join('\n'), /requires Gatekeeper ALLOW/);
}

function testRollbackAndValidationFailuresBlockCompletenessAndAssertThrows() {
  const service = new FoundryService();
  const input = validEvidencePackageInput(service, {
    rollback_plan_ref: '',
    validation_results: [
      {
        name: 'foundry.validation',
        status: 'failed',
        summary: 'Validation failed.',
      },
    ],
  });
  const result = service.buildEvidencePackage(input);

  assert.equal(result.required_sections_complete.rollback_plan, false);
  assert.equal(result.required_sections_complete.validation_results, false);
  assert.equal(result.complete, false);
  assert.throws(() => service.assertEvidencePackageComplete(input), BadRequestException);
}

function testMigrationChecksumsAreRequiredWhenMigrationArtifactsAreDeclared() {
  const service = new FoundryService();
  const result = service.buildEvidencePackage(
    validEvidencePackageInput(service, {
      migration_files: [
        {
          kind: 'migration',
          path: 'prisma/migrations/20260529000000_platform_fixture/migration.sql',
          sha256: 'not-a-sha',
        },
      ],
    }),
  );

  assert.equal(result.required_sections_complete.migration_files_with_checksums, false);
  assert.match(result.errors.join('\n'), /must include a SHA-256 checksum/);
}

function testManifestAndCompatibilityMustMatchPackage() {
  const service = new FoundryService();
  const incompatible = service.checkCompatibility({
    manifest: validManifest({ min_platform_version: '9.0.0' }),
    platform_core_version: '1.0.0',
    installed_modules: [],
  });
  const result = service.buildEvidencePackage(
    validEvidencePackageInput(service, {
      manifest: validManifest({ version: '0.2.0' }),
      compatibility_result: incompatible,
    }),
  );

  assert.equal(result.required_sections_complete.module_manifest, false);
  assert.equal(result.required_sections_complete.compatibility_check, false);
  assert.equal(result.complete, false);
}

function run() {
  testCompleteEvidencePackageIncludesRequiredSectionsAndDeterministicHash();
  testGatekeeperNonAllowDecisionIsRecordedButBlocksFoundryExecution();
  testRollbackAndValidationFailuresBlockCompletenessAndAssertThrows();
  testMigrationChecksumsAreRequiredWhenMigrationArtifactsAreDeclared();
  testManifestAndCompatibilityMustMatchPackage();

  console.log('P5B-011d Foundry evidence package builder baseline tests passed.');
}

run();
