import assert from 'node:assert/strict';

import {
  FoundryService,
  type FoundryDisableExecutionInput,
  type FoundryEnableExecutionInput,
  type FoundryEvidencePackage,
  type FoundryEvidencePackageInput,
  type FoundryInstallExecutionInput,
  type FoundryInstallExecutionReceipt,
  type FoundryInstallPreflightInput,
  type FoundryModuleManifestCandidate,
  type FoundryRollbackRecoveryInput,
  type FoundryUninstallExecutionInput,
  type FoundryUpdateExecutionInput,
} from './foundry.service';
import type { EventEnvelope } from '../platform-observability/event-outbox.service';

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

function validPreflightInput(overrides?: Partial<FoundryInstallPreflightInput>): FoundryInstallPreflightInput {
  return {
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    active_group_ids: ['group-platform-operators'],
    target_module_key: 'platform.fixture',
    target_module_version: '0.2.0',
    manifest_hash: 'a'.repeat(64),
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/rollback-plan.md',
    evidence_package_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/evidence.md',
    correlation_id: 'corr-p5b-017f',
    module_health: { 'core.access': 'healthy' },
    ...overrides,
  };
}

function validInstallInput(
  service: FoundryService,
  overrides?: Partial<FoundryInstallExecutionInput>,
): FoundryInstallExecutionInput {
  const manifest = validManifest();
  const compatibilityResult = service.checkCompatibility({
    manifest,
    platform_core_version: '1.0.0',
    installed_modules: [{ module_key: 'core.access', version: '0.1.0', status: 'enabled' }],
  });

  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    manifest_hash: service.assertManifestValid(manifest).manifest_hash ?? '',
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_017f',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/evidence.md',
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/rollback-plan.md',
    compatibility_result: compatibilityResult,
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f',
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
    installed_modules: [{ module_key: 'core.access', version: '0.1.0', status: 'enabled' }],
  });

  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
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
      decision_id: 'gkd-017f-allow',
      outcome: 'ALLOW',
      decided_by_actor_id: 'actor-017f',
      reason_summary: 'Gatekeeper allowed Foundry lifecycle action.',
      risk_level: 'high',
    },
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/rollback-plan.md',
    installer_actor_id: 'actor-017f',
    organization_id: 'org-017f',
    correlation_id: 'corr-p5b-017f',
    compatibility_result: compatibilityResult,
    step_timestamps: [{ step: 'install_executed', at: '2026-05-29T00:00:00.000Z' }],
    ...overrides,
  };
}

function validEvidencePackage(service: FoundryService): FoundryEvidencePackage {
  return service.buildEvidencePackage(validEvidenceInput(service));
}

function validEnableInput(overrides?: Partial<FoundryEnableExecutionInput>): FoundryEnableExecutionInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    current_status: 'installed',
    manifest_hash: 'c'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_017f_enable',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/enable-evidence.md',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-enable',
    ...overrides,
  };
}

function validDisableInput(overrides?: Partial<FoundryDisableExecutionInput>): FoundryDisableExecutionInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    manifest_hash: 'd'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_017f_disable',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/disable-evidence.md',
    retention_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/retention-plan.md',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-disable',
    ...overrides,
  };
}

function validUninstallInput(overrides?: Partial<FoundryUninstallExecutionInput>): FoundryUninstallExecutionInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    current_status: 'disabled',
    manifest_hash: 'e'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_017f_uninstall',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/uninstall-evidence.md',
    retention_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/retention-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/rollback-plan.md',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-uninstall',
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
    gatekeeper_decision_token: 'gk_decision_p5b_017f_update',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/update-evidence.md',
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/update-migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/update-rollback-plan.md',
    compatibility_result: compatibilityResult,
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-update',
    ...overrides,
  };
}

function validRollbackInput(overrides?: Partial<FoundryRollbackRecoveryInput>): FoundryRollbackRecoveryInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    current_status: 'rollback_required',
    manifest_hash: '1'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_017f_rollback',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/rollback-evidence.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/rollback-plan.md',
    failure_evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/failure-evidence.md',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-rollback',
    ...overrides,
  };
}

function assertFoundryLifecycleEnvelope(
  envelope: EventEnvelope,
  expected: {
    event_type: string;
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    module_key: string;
    action_key: string;
  },
) {
  assert.equal(envelope.event_type, expected.event_type);
  assert.equal(envelope.producer, 'akti-api');
  assert.equal(envelope.schema_version, '1.0.0');
  assert.equal(envelope.organization_id, expected.organization_id);
  assert.equal(envelope.source_module, 'foundry');
  assert.deepEqual(envelope.subject, {
    entity_type: 'foundry.module',
    entity_id: expected.module_key,
  });
  assert.equal(envelope.payload.module_key, expected.module_key);
  assert.equal(envelope.payload.action_key, expected.action_key);
  assert.equal(envelope.payload.correlation_id, expected.correlation_id);
  assert.equal(envelope.context.actor_user_id, expected.actor_user_id);
  assert.equal(envelope.context.correlation_id, expected.correlation_id);
  assert.equal(envelope.compliance.privacy_class, 'restricted');
  assert.equal(envelope.compliance.retention_class, 'audit');
  assert.equal(envelope.compliance.redaction_policy, 'strict');
  assert.equal(envelope.compliance.audit_required, true);
  assert.equal(envelope.compliance.replay_allowed, false);
  assert.match(envelope.event_id, /^evt_[a-f0-9]{64}$/);
  assert.equal(Number.isNaN(Date.parse(envelope.occurred_at)), false);
}

async function testInstallPreflightAndExecutionEmitCompliantFoundryEnvelopes() {
  const service = new FoundryService();
  const preflight = await service.runInstallPreflight(validPreflightInput());
  const install = service.executeInstall(validInstallInput(service));

  assertFoundryLifecycleEnvelope(preflight.audit.event_envelope, {
    event_type: 'foundry.install.preflight.requested',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f',
    module_key: 'platform.fixture',
    action_key: 'module.install',
  });
  assert.equal(preflight.audit.event_envelope.payload.evidence_package_ref, preflight.audit.evidence_package_ref);

  assertFoundryLifecycleEnvelope(install.audit.event_envelope, {
    event_type: 'foundry.install.executed',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f',
    module_key: 'platform.fixture',
    action_key: 'module.install',
  });
  assert.equal(install.audit.event_envelope.payload.status_from, 'installable');
  assert.equal(install.audit.event_envelope.payload.status_to, 'installed');
  assert.equal(install.audit.event_envelope.payload.evidence_ref, install.evidence.evidence_ref);
}

function testInstallEvidenceReceiptEmitsCompliantFoundryEnvelope() {
  const service = new FoundryService();
  const evidencePackage = validEvidencePackage(service);
  const installExecutionReceipt: FoundryInstallExecutionReceipt = service.executeInstall(
    validInstallInput(service, {
      evidence_ref: evidencePackage.package_id,
    }),
  );

  const receipt = service.receiveInstallEvidence({
    install_execution_receipt: installExecutionReceipt,
    evidence_package: evidencePackage,
    received_by_actor_id: 'actor-017f-receiver',
    organization_id: 'org-017f',
    correlation_id: 'corr-p5b-017f',
    received_at: '2026-05-29T00:01:00.000Z',
  });

  assertFoundryLifecycleEnvelope(receipt.audit.event_envelope, {
    event_type: 'foundry.install.evidence.received',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f-receiver',
    correlation_id: 'corr-p5b-017f',
    module_key: 'platform.fixture',
    action_key: 'module.install',
  });
  assert.equal(receipt.audit.event_envelope.payload.install_execution_id, installExecutionReceipt.execution_id);
  assert.equal(receipt.audit.event_envelope.payload.evidence_package_id, evidencePackage.package_id);
}

function testEnableDisableAndUninstallReceiptsEmitCompliantFoundryEnvelopes() {
  const service = new FoundryService();
  const enable = service.executeEnable(validEnableInput());
  const disable = service.executeDisable(validDisableInput());
  const uninstall = service.executeUninstall(validUninstallInput());

  assertFoundryLifecycleEnvelope(enable.audit.event_envelope, {
    event_type: 'foundry.module.enabled',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-enable',
    module_key: 'platform.fixture',
    action_key: 'module.enable',
  });
  assert.equal(enable.audit.event_envelope.payload.status_to, 'enabled');

  assertFoundryLifecycleEnvelope(disable.audit.event_envelope, {
    event_type: 'foundry.module.disabled',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-disable',
    module_key: 'platform.fixture',
    action_key: 'module.disable',
  });
  assert.equal(disable.audit.event_envelope.payload.status_to, 'disabled');

  assertFoundryLifecycleEnvelope(uninstall.audit.event_envelope, {
    event_type: 'foundry.module.uninstalled',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-uninstall',
    module_key: 'platform.fixture',
    action_key: 'module.uninstall',
  });
  assert.equal(uninstall.audit.event_envelope.payload.status_to, 'uninstalled');
}

function testUpdateAndRollbackReceiptsEmitCompliantFoundryEnvelopesWithoutBusinessScope() {
  const service = new FoundryService();
  const update = service.executeUpdate(validUpdateInput(service));
  const rollback = service.executeRollbackRecovery(validRollbackInput());

  assertFoundryLifecycleEnvelope(update.audit.event_envelope, {
    event_type: 'foundry.module.updated',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-update',
    module_key: 'platform.fixture',
    action_key: 'module.update',
  });
  assert.equal(update.audit.event_envelope.payload.target_version, '0.2.0');

  assertFoundryLifecycleEnvelope(rollback.audit.event_envelope, {
    event_type: 'foundry.module.rollback_recovered',
    organization_id: 'org-017f',
    actor_user_id: 'actor-017f',
    correlation_id: 'corr-p5b-017f-rollback',
    module_key: 'platform.fixture',
    action_key: 'module.rollback_recovery',
  });
  assert.equal(rollback.audit.event_envelope.payload.status_to, 'installed');

  const serializedEnvelopes = JSON.stringify([update.audit.event_envelope, rollback.audit.event_envelope]);
  assert.equal(serializedEnvelopes.includes('golden'), false);
  assert.equal(serializedEnvelopes.includes('business module'), false);
}

async function run() {
  await testInstallPreflightAndExecutionEmitCompliantFoundryEnvelopes();
  testInstallEvidenceReceiptEmitsCompliantFoundryEnvelope();
  testEnableDisableAndUninstallReceiptsEmitCompliantFoundryEnvelopes();
  testUpdateAndRollbackReceiptsEmitCompliantFoundryEnvelopesWithoutBusinessScope();

  console.log('P5B-017f Foundry lifecycle event-envelope retrofit tests passed.');
}

void run();
