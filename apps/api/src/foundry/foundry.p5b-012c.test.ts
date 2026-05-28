import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import {
  FoundryService,
  type FoundryEvidencePackage,
  type FoundryEvidencePackageInput,
  type FoundryInstallExecutionReceipt,
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

function validEvidenceInput(
  service: FoundryService,
  overrides?: Partial<FoundryEvidencePackageInput>,
): FoundryEvidencePackageInput {
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
    lifecycle_action: 'module.install',
    manifest,
    manifest_hash: service.assertManifestValid(manifest).manifest_hash ?? '',
    migration_files: [
      {
        kind: 'migration',
        path: 'prisma/migrations/20260529000000_platform_fixture/migration.sql',
        sha256: 'b'.repeat(64),
      },
    ],
    capability_snapshot_before: ['platform.shell.access'],
    capability_snapshot_after: ['platform.fixture.manage', 'platform.shell.access'],
    health_check_results: [{ name: 'health', status: 'passed', summary: 'healthy' }],
    smoke_test_results: [{ name: 'smoke', status: 'passed', summary: 'smoke passed' }],
    validation_results: [{ name: 'validation', status: 'passed', summary: 'validation passed' }],
    gatekeeper_decision: {
      decision_id: 'gkd-012c-allow',
      outcome: 'ALLOW',
      decided_by_actor_id: 'actor-012c',
      reason_summary: 'Gatekeeper allowed install execution.',
      risk_level: 'high',
    },
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012c/rollback-plan.md',
    installer_actor_id: 'actor-012c',
    organization_id: 'org-012c',
    correlation_id: 'corr-p5b-012c',
    compatibility_result: compatibilityResult,
    step_timestamps: [{ step: 'install_executed', at: '2026-05-29T00:00:00.000Z' }],
    ...overrides,
  };
}

function validEvidencePackage(service: FoundryService): FoundryEvidencePackage {
  return service.buildEvidencePackage(validEvidenceInput(service));
}

function validInstallExecutionReceipt(
  service: FoundryService,
  evidencePackage: FoundryEvidencePackage,
): FoundryInstallExecutionReceipt {
  const manifest = validManifest();
  const compatibilityResult = service.checkCompatibility({
    manifest,
    platform_core_version: '1.0.0',
    installed_modules: [{ module_key: 'core.access', version: '0.1.0', status: 'enabled' }],
  });

  return service.executeInstall({
    module_key: 'platform.fixture',
    module_version: '0.1.0',
    manifest_hash: service.assertManifestValid(manifest).manifest_hash ?? '',
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_012c',
    evidence_ref: evidencePackage.package_id,
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012c/migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012c/rollback-plan.md',
    compatibility_result: compatibilityResult,
    organization_id: 'org-012c',
    actor_user_id: 'actor-012c',
    correlation_id: 'corr-p5b-012c',
  });
}

function testInstallEvidenceReceiptLinksExecutionAndEvidencePackage() {
  const service = new FoundryService();
  const evidencePackage = validEvidencePackage(service);
  const executionReceipt = validInstallExecutionReceipt(service, evidencePackage);

  const receipt = service.receiveInstallEvidence({
    install_execution_receipt: executionReceipt,
    evidence_package: evidencePackage,
    received_by_actor_id: 'actor-012c',
    organization_id: 'org-012c',
    correlation_id: 'corr-p5b-012c',
    received_at: '2026-05-29T00:01:00.000Z',
  });
  const repeated = service.receiveInstallEvidence({
    install_execution_receipt: executionReceipt,
    evidence_package: evidencePackage,
    received_by_actor_id: 'actor-012c',
    organization_id: 'org-012c',
    correlation_id: 'corr-p5b-012c',
    received_at: '2026-05-29T00:01:00.000Z',
  });

  assert.equal(receipt.accepted, true);
  assert.equal(receipt.action_key, 'module.install');
  assert.equal(receipt.module_key, 'platform.fixture');
  assert.equal(receipt.install_execution_id, executionReceipt.execution_id);
  assert.equal(receipt.evidence_package_id, evidencePackage.package_id);
  assert.equal(receipt.audit.event_type, 'foundry.install.evidence.received');
  assert.equal(receipt.audit.audit_outbox_storage_required, true);
  assert.equal(receipt.registry.next_status, 'installed');
  assert.equal(receipt.registry.installed_status_evidence_required, true);
  assert.match(receipt.receipt_id, /^foundry-install-evidence-[a-f0-9]{16}$/);
  assert.match(receipt.receipt_hash, /^[a-f0-9]{64}$/);
  assert.equal(receipt.receipt_hash, repeated.receipt_hash);
}

function testInstallEvidenceReceiptRejectsIncompleteEvidencePackage() {
  const service = new FoundryService();
  const incompleteEvidence = service.buildEvidencePackage(
    validEvidenceInput(service, {
      validation_results: [{ name: 'validation', status: 'failed', summary: 'failed' }],
    }),
  );
  const executionReceipt = validInstallExecutionReceipt(service, validEvidencePackage(service));

  assert.throws(
    () =>
      service.receiveInstallEvidence({
        install_execution_receipt: executionReceipt,
        evidence_package: incompleteEvidence,
        received_by_actor_id: 'actor-012c',
        organization_id: 'org-012c',
        correlation_id: 'corr-p5b-012c',
        received_at: '2026-05-29T00:01:00.000Z',
      }),
    BadRequestException,
  );
}

function testInstallEvidenceReceiptRejectsMismatchedIdentity() {
  const service = new FoundryService();
  const evidencePackage = validEvidencePackage(service);
  const executionReceipt = validInstallExecutionReceipt(service, evidencePackage);

  assert.throws(
    () =>
      service.receiveInstallEvidence({
        install_execution_receipt: executionReceipt,
        evidence_package: { ...evidencePackage, module_key: 'platform.other' },
        received_by_actor_id: 'actor-012c',
        organization_id: 'org-012c',
        correlation_id: 'corr-p5b-012c',
        received_at: '2026-05-29T00:01:00.000Z',
      }),
    BadRequestException,
  );
}

function testInstallEvidenceReceiptRejectsBadReceiverContext() {
  const service = new FoundryService();
  const evidencePackage = validEvidencePackage(service);
  const executionReceipt = validInstallExecutionReceipt(service, evidencePackage);

  assert.throws(
    () =>
      service.receiveInstallEvidence({
        install_execution_receipt: executionReceipt,
        evidence_package: evidencePackage,
        received_by_actor_id: '',
        organization_id: 'org-012c',
        correlation_id: 'corr-p5b-012c',
        received_at: '2026-05-29T00:01:00.000Z',
      }),
    BadRequestException,
  );
  assert.throws(
    () =>
      service.receiveInstallEvidence({
        install_execution_receipt: executionReceipt,
        evidence_package: evidencePackage,
        received_by_actor_id: 'actor-012c',
        organization_id: 'org-012c',
        correlation_id: 'corr-p5b-012c',
        received_at: 'not-a-date',
      }),
    BadRequestException,
  );
}

function run() {
  testInstallEvidenceReceiptLinksExecutionAndEvidencePackage();
  testInstallEvidenceReceiptRejectsIncompleteEvidencePackage();
  testInstallEvidenceReceiptRejectsMismatchedIdentity();
  testInstallEvidenceReceiptRejectsBadReceiverContext();

  console.log('P5B-012c Foundry install evidence receipt tests passed.');
}

run();
