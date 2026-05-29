import assert from 'node:assert/strict';

import {
  FoundryService,
  type FoundryDisableExecutionInput,
  type FoundryEnableExecutionInput,
  type FoundryEvidencePackage,
  type FoundryEvidencePackageInput,
  type FoundryInstallEvidenceReceiptInput,
  type FoundryInstallExecutionInput,
  type FoundryModuleManifestCandidate,
  type FoundryRollbackRecoveryInput,
  type FoundryUninstallExecutionInput,
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

function validInstallInput(service: FoundryService, overrides?: Partial<FoundryInstallExecutionInput>) {
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
    gatekeeper_decision_token: 'gk_decision_p5b_030b_install',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/install-evidence.md',
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/rollback-plan.md',
    compatibility_result: compatibilityResult,
    organization_id: 'org-030b',
    actor_user_id: 'actor-030b',
    correlation_id: 'corr-p5b-030b-install',
    ...overrides,
  } satisfies FoundryInstallExecutionInput;
}

function validEvidencePackage(service: FoundryService, correlationId: string): FoundryEvidencePackage {
  const manifest = validManifest();
  const compatibilityResult = service.checkCompatibility({
    manifest,
    platform_core_version: '1.0.0',
    installed_modules: [{ module_key: 'core.access', version: '0.1.0', status: 'enabled' }],
  });
  const input: FoundryEvidencePackageInput = {
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
      decision_id: 'gkd-030b-allow',
      outcome: 'ALLOW',
      decided_by_actor_id: 'actor-030b',
      reason_summary: 'Gatekeeper allowed Foundry lifecycle audit completeness test.',
      risk_level: 'high',
    },
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/rollback-plan.md',
    installer_actor_id: 'actor-030b',
    organization_id: 'org-030b',
    correlation_id: correlationId,
    compatibility_result: compatibilityResult,
    step_timestamps: [{ step: 'install_executed', at: '2026-05-29T00:00:00.000Z' }],
  };

  return service.buildEvidencePackage(input);
}

function validEnableInput(overrides?: Partial<FoundryEnableExecutionInput>): FoundryEnableExecutionInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    current_status: 'installed',
    manifest_hash: 'c'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_030b_enable',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/enable-evidence.md',
    organization_id: 'org-030b',
    actor_user_id: 'actor-030b',
    correlation_id: 'corr-p5b-030b-enable',
    ...overrides,
  };
}

function validDisableInput(overrides?: Partial<FoundryDisableExecutionInput>): FoundryDisableExecutionInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    manifest_hash: 'd'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_030b_disable',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/disable-evidence.md',
    retention_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/retention-plan.md',
    organization_id: 'org-030b',
    actor_user_id: 'actor-030b',
    correlation_id: 'corr-p5b-030b-disable',
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
    gatekeeper_decision_token: 'gk_decision_p5b_030b_uninstall',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/uninstall-evidence.md',
    retention_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/retention-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/rollback-plan.md',
    organization_id: 'org-030b',
    actor_user_id: 'actor-030b',
    correlation_id: 'corr-p5b-030b-uninstall',
    ...overrides,
  };
}

function validUpdateInput(service: FoundryService, overrides?: Partial<FoundryUpdateExecutionInput>) {
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
    gatekeeper_decision_token: 'gk_decision_p5b_030b_update',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/update-evidence.md',
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/update-migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/update-rollback-plan.md',
    compatibility_result: compatibilityResult,
    organization_id: 'org-030b',
    actor_user_id: 'actor-030b',
    correlation_id: 'corr-p5b-030b-update',
    ...overrides,
  } satisfies FoundryUpdateExecutionInput;
}

function validRollbackInput(overrides?: Partial<FoundryRollbackRecoveryInput>): FoundryRollbackRecoveryInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.1.0',
    current_status: 'rollback_required',
    manifest_hash: '1'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_030b_rollback',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/rollback-evidence.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/rollback-plan.md',
    failure_evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/failure-evidence.md',
    organization_id: 'org-030b',
    actor_user_id: 'actor-030b',
    correlation_id: 'corr-p5b-030b-rollback',
    ...overrides,
  };
}

function assertAuditComplete(
  audit: {
    event_type: string;
    event_envelope: { event_type: string; source_module: string; compliance: { audit_required: boolean } };
    audit_completeness: {
      record_key: string;
      lifecycle_audit_recorded: boolean;
      event_envelope_recorded: boolean;
      event_envelope_compliant: boolean;
      organization_id_present: boolean;
      actor_user_id_present: boolean;
      correlation_id_present: boolean;
      module_key_present: boolean;
      action_key_present: boolean;
      gatekeeper_outcome_present: boolean;
      evidence_ref_present: boolean;
      registry_persistence_declared: boolean;
      lifecycle_transition_count: number;
      receipt_hash_present: boolean;
    };
  },
  expectedTransitionCount: number,
) {
  assert.equal(audit.event_envelope.event_type, audit.event_type);
  assert.equal(audit.event_envelope.source_module, 'foundry');
  assert.equal(audit.event_envelope.compliance.audit_required, true);
  assert.equal(audit.audit_completeness.record_key, 'foundry.audit-completeness');
  assert.equal(audit.audit_completeness.lifecycle_audit_recorded, true);
  assert.equal(audit.audit_completeness.event_envelope_recorded, true);
  assert.equal(audit.audit_completeness.event_envelope_compliant, true);
  assert.equal(audit.audit_completeness.organization_id_present, true);
  assert.equal(audit.audit_completeness.actor_user_id_present, true);
  assert.equal(audit.audit_completeness.correlation_id_present, true);
  assert.equal(audit.audit_completeness.module_key_present, true);
  assert.equal(audit.audit_completeness.action_key_present, true);
  assert.equal(audit.audit_completeness.gatekeeper_outcome_present, true);
  assert.equal(audit.audit_completeness.evidence_ref_present, true);
  assert.equal(audit.audit_completeness.registry_persistence_declared, true);
  assert.equal(audit.audit_completeness.lifecycle_transition_count, expectedTransitionCount);
  assert.equal(audit.audit_completeness.receipt_hash_present, true);
}

function testLifecycleReceiptsIncludeAuditCompleteness() {
  const service = new FoundryService();

  assertAuditComplete(service.executeInstall(validInstallInput(service)).audit, 1);
  assertAuditComplete(service.executeEnable(validEnableInput()).audit, 1);
  assertAuditComplete(service.executeDisable(validDisableInput()).audit, 1);
  assertAuditComplete(service.executeUninstall(validUninstallInput()).audit, 1);
  assertAuditComplete(service.executeUpdate(validUpdateInput(service)).audit, 3);
  assertAuditComplete(service.executeRollbackRecovery(validRollbackInput({ current_status: 'updating' })).audit, 2);
}

function testInstallEvidenceReceiptIncludesAuditCompleteness() {
  const service = new FoundryService();
  const installReceipt = service.executeInstall(validInstallInput(service));
  const evidencePackage = validEvidencePackage(service, installReceipt.audit.correlation_id);
  const input: FoundryInstallEvidenceReceiptInput = {
    install_execution_receipt: installReceipt,
    evidence_package: evidencePackage,
    received_by_actor_id: 'actor-030b',
    organization_id: 'org-030b',
    correlation_id: installReceipt.audit.correlation_id,
    received_at: '2026-05-29T00:00:00.000Z',
  };

  const receipt = service.receiveInstallEvidence(input);

  assert.equal(receipt.audit.audit_outbox_storage_required, true);
  assertAuditComplete(receipt.audit, 1);
}

function run() {
  testLifecycleReceiptsIncludeAuditCompleteness();
  testInstallEvidenceReceiptIncludesAuditCompleteness();

  console.log('P5B-030b Foundry audit completeness tests passed.');
}

run();
