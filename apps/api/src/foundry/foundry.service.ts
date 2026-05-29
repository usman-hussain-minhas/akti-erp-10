import { createHash } from 'node:crypto';

import { BadRequestException, Injectable, Optional } from '@nestjs/common';
import type { GatekeeperDecisionResult } from '@akti/contracts/gatekeeper-contract';

import { type GatekeeperPreflightInput, GatekeeperPreflightService } from '../gatekeeper/gatekeeper-preflight.service';
import {
  type EventEnvelope,
  assertComplianceEventContext,
  buildEventEnvelope,
} from '../platform-observability/event-outbox.service';

export type FoundryModuleType = 'core' | 'standard' | 'optional' | 'dedicated';

export type FoundryModuleScaffoldInput = {
  module_key: string;
  display_name: string;
  module_type: FoundryModuleType;
  version: string;
  owner: string;
  min_platform_version: string;
  capabilities?: string[];
  dependencies?: string[];
  business_module?: boolean;
  golden_module?: boolean;
  marketplace_public?: boolean;
  production_adapter_enabled?: boolean;
};

export type FoundryModuleScaffold = {
  module_key: string;
  display_name: string;
  module_type: FoundryModuleType;
  version: string;
  owner: string;
  min_platform_version: string;
  lifecycle_status: 'scaffolded';
  manifest_hash: string;
  gatekeeper_preflight_required: true;
  foundry_execution_allowed: false;
  capabilities: string[];
  dependencies: string[];
  non_scope_guards: {
    business_module: false;
    golden_module: false;
    marketplace_public: false;
    production_adapter_enabled: false;
  };
};

export const FOUNDRY_LIFECYCLE_STATES = [
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
] as const;

export type FoundryLifecycleState = (typeof FOUNDRY_LIFECYCLE_STATES)[number];
export type FoundryGatekeeperTransitionOutcome = 'ALLOW' | 'DENY' | 'APPROVAL_REQUIRED' | 'STOP_FOR_REVIEW';

export type FoundryLifecycleTransitionInput = {
  module_key: string;
  from_state: FoundryLifecycleState;
  to_state: FoundryLifecycleState;
  action_key: string;
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  evidence_ref?: string | null;
};

export type FoundryLifecycleTransitionPlan = {
  module_key: string;
  from_state: FoundryLifecycleState;
  to_state: FoundryLifecycleState;
  action_key: string;
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  allowed: boolean;
  foundry_execution_allowed: boolean;
  gatekeeper_required: true;
  evidence_required: true;
  registry_persistence_required: true;
  errors: string[];
};

export type FoundryEvidenceArtifactKind =
  | 'module_manifest'
  | 'migration'
  | 'capability_snapshot'
  | 'health_check'
  | 'smoke_test'
  | 'gatekeeper_decision'
  | 'rollback_plan'
  | 'validation_result'
  | 'compatibility_check';

export type FoundryEvidenceArtifactInput = {
  kind: FoundryEvidenceArtifactKind;
  path: string;
  sha256: string;
};

export type FoundryEvidenceValidationResult = {
  name: string;
  status: 'passed' | 'failed';
  command?: string;
  summary: string;
};

export type FoundryEvidenceGatekeeperDecision = {
  decision_id: string;
  outcome: FoundryGatekeeperTransitionOutcome;
  decided_by_actor_id: string;
  reason_summary: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
};

export type FoundryEvidenceStepTimestamp = {
  step: string;
  at: string;
};

export type FoundryEvidencePackageInput = {
  module_key: string;
  module_version: string;
  lifecycle_action: string;
  manifest: FoundryModuleManifestCandidate;
  manifest_hash: string;
  migration_files: FoundryEvidenceArtifactInput[];
  capability_snapshot_before: string[];
  capability_snapshot_after: string[];
  health_check_results: FoundryEvidenceValidationResult[];
  smoke_test_results: FoundryEvidenceValidationResult[];
  validation_results: FoundryEvidenceValidationResult[];
  gatekeeper_decision: FoundryEvidenceGatekeeperDecision;
  rollback_plan_ref: string;
  installer_actor_id: string;
  organization_id: string;
  correlation_id: string;
  compatibility_result: FoundryCompatibilityCheckResult;
  step_timestamps: FoundryEvidenceStepTimestamp[];
};

export type FoundryEvidencePackage = {
  package_id: string;
  package_hash: string;
  module_key: string;
  module_version: string;
  lifecycle_action: string;
  manifest_hash: string;
  artifact_count: number;
  validation_result_count: number;
  gatekeeper_decision: FoundryEvidenceGatekeeperDecision;
  rollback_plan_ref: string;
  installer_actor_id: string;
  organization_id: string;
  correlation_id: string;
  compatibility_result_hash: string;
  gatekeeper_required: true;
  audit_outbox_storage_required: true;
  foundry_execution_allowed: boolean;
  complete: boolean;
  required_sections_complete: {
    module_manifest: boolean;
    migration_files_with_checksums: boolean;
    capability_declarations_before_after: boolean;
    health_check_results: boolean;
    smoke_test_results: boolean;
    gatekeeper_decision_log: boolean;
    rollback_plan: boolean;
    installer_actor_identity: boolean;
    step_timestamps: boolean;
    validation_results: boolean;
    compatibility_check: boolean;
  };
  errors: string[];
};

export type FoundryInstallPreflightInput = {
  organization_id: string;
  actor_user_id: string;
  active_group_ids: string[];
  target_module_key: string;
  target_module_version: string;
  manifest_hash: string;
  migration_plan_ref: string;
  rollback_plan_ref: string;
  evidence_package_ref: string;
  correlation_id: string;
  module_health?: GatekeeperPreflightInput['module_health'];
  dependency_health?: GatekeeperPreflightInput['dependency_health'];
  reauth_status?: GatekeeperPreflightInput['reauth_status'];
};

type FoundryLifecycleAuditEnvelope = EventEnvelope;

export type FoundryLifecycleAuditCompleteness = {
  record_key: 'foundry.audit-completeness';
  lifecycle_audit_recorded: true;
  event_envelope_recorded: true;
  event_envelope_compliant: true;
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

export type FoundryInstallPreflightResponse = {
  method: 'POST';
  route: '/platform/foundry/install-preflight';
  action_key: 'module.install';
  target_module: {
    module_key: string;
    version: string;
    manifest_hash: string;
  };
  capability: {
    required: 'access.policy.manage';
    authority_note: 'existing Gatekeeper-supported high-risk platform management capability; no new capability invented in P5B-012a';
  };
  tenant_context: {
    organization_id: string;
    actor_user_id: string;
  };
  gatekeeper: {
    preflight_required: true;
    request: GatekeeperPreflightInput;
    decision: GatekeeperDecisionResult | null;
  };
  audit: {
    event_type: 'foundry.install.preflight.requested';
    evidence_required: true;
    evidence_package_ref: string;
    correlation_id: string;
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  };
  foundry_execution: {
    allowed_after_preflight: boolean;
    executed: false;
    next_step: 'P5B-012b Foundry install execution';
  };
};

export type FoundryInstallExecutionInput = {
  module_key: string;
  module_version: string;
  manifest_hash: string;
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  evidence_ref: string;
  migration_plan_ref: string;
  rollback_plan_ref: string;
  compatibility_result: FoundryCompatibilityCheckResult;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
};

export type FoundryInstallExecutionReceipt = {
  execution_id: string;
  receipt_hash: string;
  module_key: string;
  module_version: string;
  manifest_hash: string;
  action_key: 'module.install';
  status_from: 'installable';
  status_to: 'installed';
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  foundry_execution_completed: true;
  lifecycle_transition: FoundryLifecycleTransitionPlan;
  migration: {
    plan_ref: string;
    transaction_required: true;
    destructive_migration_allowed: false;
  };
  rollback: {
    plan_ref: string;
    required_before_execution: true;
  };
  registry: {
    next_status: 'installed';
    persistence_required: true;
  };
  capability_seed: {
    required_after_install: true;
    business_capabilities_allowed: false;
  };
  evidence: {
    evidence_ref: string;
    receipt_required: true;
    receipt_storage_deferred_to: 'P5B-012c';
  };
  audit: {
    event_type: 'foundry.install.executed';
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  };
};

export type FoundryInstallEvidenceReceiptInput = {
  install_execution_receipt: FoundryInstallExecutionReceipt;
  evidence_package: FoundryEvidencePackage;
  received_by_actor_id: string;
  organization_id: string;
  correlation_id: string;
  received_at: string;
};

export type FoundryInstallEvidenceReceipt = {
  receipt_id: string;
  receipt_hash: string;
  module_key: string;
  module_version: string;
  action_key: 'module.install';
  install_execution_id: string;
  install_execution_hash: string;
  evidence_package_id: string;
  evidence_package_hash: string;
  accepted: true;
  received_by_actor_id: string;
  organization_id: string;
  correlation_id: string;
  received_at: string;
  audit: {
    event_type: 'foundry.install.evidence.received';
    audit_outbox_storage_required: true;
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  };
  registry: {
    installed_status_evidence_required: true;
    next_status: 'installed';
  };
};

export type FoundryEnableExecutionInput = {
  module_key: string;
  module_version: string;
  current_status: 'installed' | 'disabled';
  manifest_hash: string;
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  evidence_ref: string;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
};

export type FoundryEnableExecutionReceipt = {
  execution_id: string;
  receipt_hash: string;
  module_key: string;
  module_version: string;
  manifest_hash: string;
  action_key: 'module.enable';
  status_from: 'installed' | 'disabled';
  status_to: 'enabled';
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  foundry_execution_completed: true;
  lifecycle_transition: FoundryLifecycleTransitionPlan;
  registry: {
    next_status: 'enabled';
    persistence_required: true;
  };
  evidence: {
    evidence_ref: string;
    evidence_required_before_execution: true;
  };
  runtime_surface: {
    module_runtime_enabled: true;
    phase5c_frontend_polish_allowed: false;
  };
  audit: {
    event_type: 'foundry.module.enabled';
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  };
};

export type FoundryDisableExecutionInput = {
  module_key: string;
  module_version: string;
  manifest_hash: string;
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  evidence_ref: string;
  retention_plan_ref: string;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
};

export type FoundryDisableExecutionReceipt = {
  execution_id: string;
  receipt_hash: string;
  module_key: string;
  module_version: string;
  manifest_hash: string;
  action_key: 'module.disable';
  status_from: 'enabled';
  status_to: 'disabled';
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  foundry_execution_completed: true;
  lifecycle_transition: FoundryLifecycleTransitionPlan;
  registry: {
    next_status: 'disabled';
    persistence_required: true;
  };
  data_retention: {
    retention_plan_ref: string;
    tenant_data_retained: true;
  };
  runtime_surface: {
    module_runtime_enabled: false;
    data_deleted: false;
  };
  evidence: {
    evidence_ref: string;
    evidence_required_before_execution: true;
  };
  audit: {
    event_type: 'foundry.module.disabled';
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  };
};

export type FoundryUninstallExecutionInput = {
  module_key: string;
  module_version: string;
  current_status: 'installed' | 'disabled' | 'retiring';
  manifest_hash: string;
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  evidence_ref: string;
  retention_plan_ref: string;
  rollback_plan_ref: string;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
};

export type FoundryUninstallExecutionReceipt = {
  execution_id: string;
  receipt_hash: string;
  module_key: string;
  module_version: string;
  manifest_hash: string;
  action_key: 'module.uninstall';
  status_from: 'installed' | 'disabled' | 'retiring';
  status_to: 'uninstalled';
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  foundry_execution_completed: true;
  lifecycle_transition: FoundryLifecycleTransitionPlan;
  registry: {
    next_status: 'uninstalled';
    persistence_required: true;
  };
  data_retention: {
    retention_plan_ref: string;
    tenant_data_retained: true;
    hard_delete_allowed: false;
  };
  rollback: {
    plan_ref: string;
    required_before_execution: true;
  };
  runtime_surface: {
    module_runtime_enabled: false;
    routes_unpublished_required: true;
  };
  evidence: {
    evidence_ref: string;
    evidence_required_before_execution: true;
  };
  audit: {
    event_type: 'foundry.module.uninstalled';
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  };
};

export type FoundryUpdateExecutionInput = {
  module_key: string;
  current_version: string;
  target_version: string;
  current_manifest_hash: string;
  target_manifest_hash: string;
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  evidence_ref: string;
  migration_plan_ref: string;
  rollback_plan_ref: string;
  compatibility_result: FoundryCompatibilityCheckResult;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
};

export type FoundryUpdateExecutionReceipt = {
  execution_id: string;
  receipt_hash: string;
  module_key: string;
  current_version: string;
  target_version: string;
  action_key: 'module.update';
  status_path: ['enabled', 'update_available', 'updating', 'enabled'];
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  foundry_execution_completed: true;
  lifecycle_transitions: [FoundryLifecycleTransitionPlan, FoundryLifecycleTransitionPlan, FoundryLifecycleTransitionPlan];
  migration: {
    plan_ref: string;
    transaction_required: true;
    destructive_migration_allowed: false;
  };
  rollback: {
    plan_ref: string;
    required_before_execution: true;
    recovery_flow_deferred_to: 'P5B-014b';
  };
  compatibility: {
    checked: true;
    compatible: true;
  };
  registry: {
    next_status: 'enabled';
    update_available_cleared: true;
    persistence_required: true;
  };
  evidence: {
    evidence_ref: string;
    evidence_required_before_execution: true;
  };
  audit: {
    event_type: 'foundry.module.updated';
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  };
};

export type FoundryRollbackRecoveryInput = {
  module_key: string;
  module_version: string;
  current_status: 'updating' | 'rollback_required';
  manifest_hash: string;
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  evidence_ref: string;
  rollback_plan_ref: string;
  failure_evidence_ref: string;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
};

export type FoundryRollbackRecoveryReceipt = {
  execution_id: string;
  receipt_hash: string;
  module_key: string;
  module_version: string;
  manifest_hash: string;
  action_key: 'module.rollback_recovery';
  status_from: 'updating' | 'rollback_required';
  status_to: 'installed';
  gatekeeper_outcome: FoundryGatekeeperTransitionOutcome;
  gatekeeper_decision_token: string;
  foundry_execution_completed: true;
  lifecycle_transitions: FoundryLifecycleTransitionPlan[];
  rollback: {
    plan_ref: string;
    failure_evidence_ref: string;
    recovery_completed: true;
  };
  registry: {
    next_status: 'installed';
    rollback_required_cleared: true;
    persistence_required: true;
  };
  evidence: {
    evidence_ref: string;
    evidence_required_before_execution: true;
  };
  audit: {
    event_type: 'foundry.module.rollback_recovered';
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  };
};

type FoundryCapabilitySpec = {
  key: string;
  module_key: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_reauth: boolean;
  requires_audit: boolean;
  gatekeeper_required: boolean;
};

type FoundryPermissionSpec = {
  key: string;
  module_key: string;
  allowed_scope_types: string[];
};

type FoundryApiRouteSpec = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  capability_key: string;
};

type FoundryGatekeeperHookSpec = {
  key: string;
  capability_key: string;
  required: boolean;
};

type FoundryDependencySpec = {
  module_key: string;
  min_version?: string;
};

type FoundryInstalledModuleForCompatibility = {
  module_key: string;
  version: string;
  status: string;
};

export type FoundryCompatibilityCheckInput = {
  manifest: FoundryModuleManifestCandidate;
  platform_core_version: string;
  installed_modules?: FoundryInstalledModuleForCompatibility[];
};

export type FoundryCompatibilityDependencyResult = {
  module_key: string;
  required_min_version: string | null;
  installed_version: string | null;
  installed_status: string | null;
  compatible: boolean;
  reason: string | null;
};

export type FoundryCompatibilityCheckResult = {
  compatible: boolean;
  module_key: string;
  platform_core_version: string;
  min_platform_version: string;
  errors: string[];
  dependency_results: FoundryCompatibilityDependencyResult[];
};

export type FoundryModuleManifestCandidate = {
  module_key: string;
  display_name: string;
  module_type: FoundryModuleType;
  version: string;
  owner: string;
  min_platform_version: string;
  dependencies: FoundryDependencySpec[];
  optional_dependencies: FoundryDependencySpec[];
  capabilities: FoundryCapabilitySpec[];
  permissions: FoundryPermissionSpec[];
  api_routes: FoundryApiRouteSpec[];
  gatekeeper_hooks: FoundryGatekeeperHookSpec[];
  schemas: Array<{ key: string }>;
  migrations: Array<{ key: string }>;
  data_ownership: {
    owner_module_key: string;
    tenant_scoped: boolean;
    entity_refs: string[];
  };
};

export type FoundryManifestValidationResult = {
  valid: boolean;
  module_key: string | null;
  version: string | null;
  manifest_hash: string | null;
  errors: string[];
};

const MODULE_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)+$/;
const MANIFEST_KEY_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*$/;
const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const API_PATH_PATTERN = /^\/[A-Za-z0-9/_:.-]*$/;
const HEX_SHA256_PATTERN = /^[a-f0-9]{64}$/;
const FOUNDRY_INSTALL_ACTION_KEY = 'module.install';
const FOUNDRY_INSTALL_PREFLIGHT_ROUTE = '/platform/foundry/install-preflight';
const FOUNDRY_INSTALL_PREFLIGHT_CAPABILITY_KEY = 'access.policy.manage';
const FOUNDRY_INSTALL_GATEKEEPER_MODULE_KEY = 'core.access';
const PERMISSION_SCOPE_TYPES = new Set([
  'global',
  'organization',
  'own_unit',
  'child_units',
  'own_record',
  'assigned_records',
]);
const FOUNDRY_LIFECYCLE_STATE_SET = new Set<string>(FOUNDRY_LIFECYCLE_STATES);
const FOUNDRY_LIFECYCLE_TRANSITIONS = [
  { from: 'proposed', to: 'certified', action_key: 'module.certify' },
  { from: 'certified', to: 'installable', action_key: 'module.mark_installable' },
  { from: 'installable', to: 'installed', action_key: 'module.install' },
  { from: 'installed', to: 'enabled', action_key: 'module.enable' },
  { from: 'enabled', to: 'disabled', action_key: 'module.disable' },
  { from: 'disabled', to: 'enabled', action_key: 'module.enable' },
  { from: 'enabled', to: 'update_available', action_key: 'module.mark_update_available' },
  { from: 'update_available', to: 'updating', action_key: 'module.start_update' },
  { from: 'updating', to: 'enabled', action_key: 'module.complete_update' },
  { from: 'updating', to: 'rollback_required', action_key: 'module.require_rollback' },
  { from: 'rollback_required', to: 'installed', action_key: 'module.resolve_rollback' },
  { from: 'installed', to: 'retiring', action_key: 'module.retire' },
  { from: 'enabled', to: 'retiring', action_key: 'module.retire' },
  { from: 'disabled', to: 'retiring', action_key: 'module.retire' },
  { from: 'retiring', to: 'uninstalled', action_key: 'module.uninstall' },
  { from: 'installed', to: 'uninstalled', action_key: 'module.uninstall' },
  { from: 'disabled', to: 'uninstalled', action_key: 'module.uninstall' },
  { from: 'proposed', to: 'blocked', action_key: 'module.block' },
  { from: 'certified', to: 'blocked', action_key: 'module.block' },
  { from: 'installable', to: 'blocked', action_key: 'module.block' },
  { from: 'installed', to: 'blocked', action_key: 'module.block' },
  { from: 'enabled', to: 'blocked', action_key: 'module.block' },
  { from: 'disabled', to: 'blocked', action_key: 'module.block' },
  { from: 'update_available', to: 'blocked', action_key: 'module.block' },
  { from: 'updating', to: 'blocked', action_key: 'module.block' },
  { from: 'rollback_required', to: 'blocked', action_key: 'module.block' },
  { from: 'retiring', to: 'blocked', action_key: 'module.block' },
] as const satisfies ReadonlyArray<{
  from: FoundryLifecycleState;
  to: FoundryLifecycleState;
  action_key: string;
}>;

@Injectable()
export class FoundryService {
  constructor(@Optional() private readonly gatekeeperPreflightService?: GatekeeperPreflightService) {}

  async runInstallPreflight(input: FoundryInstallPreflightInput): Promise<FoundryInstallPreflightResponse> {
    const gatekeeperRequest = this.buildInstallPreflightGatekeeperRequest(input);
    const decision = this.gatekeeperPreflightService
      ? await this.gatekeeperPreflightService.requireAllow(gatekeeperRequest)
      : null;

    return {
      method: 'POST',
      route: FOUNDRY_INSTALL_PREFLIGHT_ROUTE,
      action_key: FOUNDRY_INSTALL_ACTION_KEY,
      target_module: {
        module_key: input.target_module_key,
        version: input.target_module_version,
        manifest_hash: input.manifest_hash,
      },
      capability: {
        required: FOUNDRY_INSTALL_PREFLIGHT_CAPABILITY_KEY,
        authority_note:
          'existing Gatekeeper-supported high-risk platform management capability; no new capability invented in P5B-012a',
      },
      tenant_context: {
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
      },
      gatekeeper: {
        preflight_required: true,
        request: gatekeeperRequest,
        decision,
      },
      audit: {
        event_type: 'foundry.install.preflight.requested',
        evidence_required: true,
        evidence_package_ref: input.evidence_package_ref,
        correlation_id: input.correlation_id,
        ...this.buildLifecycleAuditFields({
          event_type: 'foundry.install.preflight.requested',
          organization_id: input.organization_id,
          actor_user_id: input.actor_user_id,
          correlation_id: input.correlation_id,
          module_key: input.target_module_key,
          action_key: FOUNDRY_INSTALL_ACTION_KEY,
          gatekeeper_outcome: decision?.decision,
          evidence_ref: input.evidence_package_ref,
          lifecycle_transition_count: 0,
          registry_persistence_required: false,
          payload: {
            target_module_version: input.target_module_version,
            manifest_hash: input.manifest_hash,
            evidence_package_ref: input.evidence_package_ref,
          },
        }),
      },
      foundry_execution: {
        allowed_after_preflight: decision?.decision === 'ALLOW',
        executed: false,
        next_step: 'P5B-012b Foundry install execution',
      },
    };
  }

  executeInstall(input: FoundryInstallExecutionInput): FoundryInstallExecutionReceipt {
    this.assertInstallExecutionInput(input);

    const lifecycleTransition = this.assertLifecycleTransition({
      module_key: input.module_key,
      from_state: 'installable',
      to_state: 'installed',
      action_key: FOUNDRY_INSTALL_ACTION_KEY,
      gatekeeper_outcome: input.gatekeeper_outcome,
      evidence_ref: input.evidence_ref,
    });
    const receiptBasis = {
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      action_key: FOUNDRY_INSTALL_ACTION_KEY,
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      evidence_ref: input.evidence_ref,
      migration_plan_ref: input.migration_plan_ref,
      rollback_plan_ref: input.rollback_plan_ref,
      compatibility_result_hash: sha256Hex(stableJsonStringify(input.compatibility_result)),
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      correlation_id: input.correlation_id,
    };
    const receiptHash = sha256Hex(stableJsonStringify(receiptBasis));

    return {
      execution_id: `foundry-install-${receiptHash.slice(0, 16)}`,
      receipt_hash: receiptHash,
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      action_key: FOUNDRY_INSTALL_ACTION_KEY,
      status_from: 'installable',
      status_to: 'installed',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      foundry_execution_completed: true,
      lifecycle_transition: lifecycleTransition,
      migration: {
        plan_ref: input.migration_plan_ref,
        transaction_required: true,
        destructive_migration_allowed: false,
      },
      rollback: {
        plan_ref: input.rollback_plan_ref,
        required_before_execution: true,
      },
      registry: {
        next_status: 'installed',
        persistence_required: true,
      },
      capability_seed: {
        required_after_install: true,
        business_capabilities_allowed: false,
      },
      evidence: {
        evidence_ref: input.evidence_ref,
        receipt_required: true,
        receipt_storage_deferred_to: 'P5B-012c',
      },
      audit: {
        event_type: 'foundry.install.executed',
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        correlation_id: input.correlation_id,
        ...this.buildLifecycleAuditFields({
          event_type: 'foundry.install.executed',
          organization_id: input.organization_id,
          actor_user_id: input.actor_user_id,
          correlation_id: input.correlation_id,
          module_key: input.module_key,
          action_key: FOUNDRY_INSTALL_ACTION_KEY,
          gatekeeper_outcome: input.gatekeeper_outcome,
          evidence_ref: input.evidence_ref,
          lifecycle_transition_count: 1,
          receipt_hash: receiptHash,
          registry_persistence_required: true,
          payload: {
            module_version: input.module_version,
            manifest_hash: input.manifest_hash,
            status_from: 'installable',
            status_to: 'installed',
            evidence_ref: input.evidence_ref,
          },
        }),
      },
    };
  }

  receiveInstallEvidence(input: FoundryInstallEvidenceReceiptInput): FoundryInstallEvidenceReceipt {
    this.assertInstallEvidenceReceiptInput(input);

    const receiptBasis = {
      install_execution_id: input.install_execution_receipt.execution_id,
      install_execution_hash: input.install_execution_receipt.receipt_hash,
      evidence_package_id: input.evidence_package.package_id,
      evidence_package_hash: input.evidence_package.package_hash,
      module_key: input.install_execution_receipt.module_key,
      module_version: input.install_execution_receipt.module_version,
      organization_id: input.organization_id,
      correlation_id: input.correlation_id,
      received_by_actor_id: input.received_by_actor_id,
      received_at: input.received_at,
    };
    const receiptHash = sha256Hex(stableJsonStringify(receiptBasis));

    return {
      receipt_id: `foundry-install-evidence-${receiptHash.slice(0, 16)}`,
      receipt_hash: receiptHash,
      module_key: input.install_execution_receipt.module_key,
      module_version: input.install_execution_receipt.module_version,
      action_key: FOUNDRY_INSTALL_ACTION_KEY,
      install_execution_id: input.install_execution_receipt.execution_id,
      install_execution_hash: input.install_execution_receipt.receipt_hash,
      evidence_package_id: input.evidence_package.package_id,
      evidence_package_hash: input.evidence_package.package_hash,
      accepted: true,
      received_by_actor_id: input.received_by_actor_id,
      organization_id: input.organization_id,
      correlation_id: input.correlation_id,
      received_at: input.received_at,
      audit: {
        event_type: 'foundry.install.evidence.received',
        audit_outbox_storage_required: true,
        ...this.buildLifecycleAuditFields({
          event_type: 'foundry.install.evidence.received',
          organization_id: input.organization_id,
          actor_user_id: input.received_by_actor_id,
          correlation_id: input.correlation_id,
          module_key: input.install_execution_receipt.module_key,
          action_key: FOUNDRY_INSTALL_ACTION_KEY,
          gatekeeper_outcome: input.install_execution_receipt.gatekeeper_outcome,
          evidence_ref: input.evidence_package.package_id,
          lifecycle_transition_count: 1,
          receipt_hash: receiptHash,
          registry_persistence_required: true,
          payload: {
            install_execution_id: input.install_execution_receipt.execution_id,
            evidence_package_id: input.evidence_package.package_id,
            received_at: input.received_at,
          },
        }),
      },
      registry: {
        installed_status_evidence_required: true,
        next_status: 'installed',
      },
    };
  }

  executeEnable(input: FoundryEnableExecutionInput): FoundryEnableExecutionReceipt {
    this.assertEnableExecutionInput(input);

    const lifecycleTransition = this.assertLifecycleTransition({
      module_key: input.module_key,
      from_state: input.current_status,
      to_state: 'enabled',
      action_key: 'module.enable',
      gatekeeper_outcome: input.gatekeeper_outcome,
      evidence_ref: input.evidence_ref,
    });
    const receiptBasis = {
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      status_from: input.current_status,
      status_to: 'enabled',
      action_key: 'module.enable',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      evidence_ref: input.evidence_ref,
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      correlation_id: input.correlation_id,
    };
    const receiptHash = sha256Hex(stableJsonStringify(receiptBasis));

    return {
      execution_id: `foundry-enable-${receiptHash.slice(0, 16)}`,
      receipt_hash: receiptHash,
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      action_key: 'module.enable',
      status_from: input.current_status,
      status_to: 'enabled',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      foundry_execution_completed: true,
      lifecycle_transition: lifecycleTransition,
      registry: {
        next_status: 'enabled',
        persistence_required: true,
      },
      evidence: {
        evidence_ref: input.evidence_ref,
        evidence_required_before_execution: true,
      },
      runtime_surface: {
        module_runtime_enabled: true,
        phase5c_frontend_polish_allowed: false,
      },
      audit: {
        event_type: 'foundry.module.enabled',
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        correlation_id: input.correlation_id,
        ...this.buildLifecycleAuditFields({
          event_type: 'foundry.module.enabled',
          organization_id: input.organization_id,
          actor_user_id: input.actor_user_id,
          correlation_id: input.correlation_id,
          module_key: input.module_key,
          action_key: 'module.enable',
          gatekeeper_outcome: input.gatekeeper_outcome,
          evidence_ref: input.evidence_ref,
          lifecycle_transition_count: 1,
          receipt_hash: receiptHash,
          registry_persistence_required: true,
          payload: {
            module_version: input.module_version,
            manifest_hash: input.manifest_hash,
            status_from: input.current_status,
            status_to: 'enabled',
            evidence_ref: input.evidence_ref,
          },
        }),
      },
    };
  }

  executeDisable(input: FoundryDisableExecutionInput): FoundryDisableExecutionReceipt {
    this.assertDisableExecutionInput(input);

    const lifecycleTransition = this.assertLifecycleTransition({
      module_key: input.module_key,
      from_state: 'enabled',
      to_state: 'disabled',
      action_key: 'module.disable',
      gatekeeper_outcome: input.gatekeeper_outcome,
      evidence_ref: input.evidence_ref,
    });
    const receiptBasis = {
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      action_key: 'module.disable',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      evidence_ref: input.evidence_ref,
      retention_plan_ref: input.retention_plan_ref,
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      correlation_id: input.correlation_id,
    };
    const receiptHash = sha256Hex(stableJsonStringify(receiptBasis));

    return {
      execution_id: `foundry-disable-${receiptHash.slice(0, 16)}`,
      receipt_hash: receiptHash,
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      action_key: 'module.disable',
      status_from: 'enabled',
      status_to: 'disabled',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      foundry_execution_completed: true,
      lifecycle_transition: lifecycleTransition,
      registry: {
        next_status: 'disabled',
        persistence_required: true,
      },
      data_retention: {
        retention_plan_ref: input.retention_plan_ref,
        tenant_data_retained: true,
      },
      runtime_surface: {
        module_runtime_enabled: false,
        data_deleted: false,
      },
      evidence: {
        evidence_ref: input.evidence_ref,
        evidence_required_before_execution: true,
      },
      audit: {
        event_type: 'foundry.module.disabled',
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        correlation_id: input.correlation_id,
        ...this.buildLifecycleAuditFields({
          event_type: 'foundry.module.disabled',
          organization_id: input.organization_id,
          actor_user_id: input.actor_user_id,
          correlation_id: input.correlation_id,
          module_key: input.module_key,
          action_key: 'module.disable',
          gatekeeper_outcome: input.gatekeeper_outcome,
          evidence_ref: input.evidence_ref,
          lifecycle_transition_count: 1,
          receipt_hash: receiptHash,
          registry_persistence_required: true,
          payload: {
            module_version: input.module_version,
            manifest_hash: input.manifest_hash,
            status_from: 'enabled',
            status_to: 'disabled',
            evidence_ref: input.evidence_ref,
            retention_plan_ref: input.retention_plan_ref,
          },
        }),
      },
    };
  }

  executeUninstall(input: FoundryUninstallExecutionInput): FoundryUninstallExecutionReceipt {
    this.assertUninstallExecutionInput(input);

    const lifecycleTransition = this.assertLifecycleTransition({
      module_key: input.module_key,
      from_state: input.current_status,
      to_state: 'uninstalled',
      action_key: 'module.uninstall',
      gatekeeper_outcome: input.gatekeeper_outcome,
      evidence_ref: input.evidence_ref,
    });
    const receiptBasis = {
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      status_from: input.current_status,
      status_to: 'uninstalled',
      action_key: 'module.uninstall',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      evidence_ref: input.evidence_ref,
      retention_plan_ref: input.retention_plan_ref,
      rollback_plan_ref: input.rollback_plan_ref,
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      correlation_id: input.correlation_id,
    };
    const receiptHash = sha256Hex(stableJsonStringify(receiptBasis));

    return {
      execution_id: `foundry-uninstall-${receiptHash.slice(0, 16)}`,
      receipt_hash: receiptHash,
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      action_key: 'module.uninstall',
      status_from: input.current_status,
      status_to: 'uninstalled',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      foundry_execution_completed: true,
      lifecycle_transition: lifecycleTransition,
      registry: {
        next_status: 'uninstalled',
        persistence_required: true,
      },
      data_retention: {
        retention_plan_ref: input.retention_plan_ref,
        tenant_data_retained: true,
        hard_delete_allowed: false,
      },
      rollback: {
        plan_ref: input.rollback_plan_ref,
        required_before_execution: true,
      },
      runtime_surface: {
        module_runtime_enabled: false,
        routes_unpublished_required: true,
      },
      evidence: {
        evidence_ref: input.evidence_ref,
        evidence_required_before_execution: true,
      },
      audit: {
        event_type: 'foundry.module.uninstalled',
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        correlation_id: input.correlation_id,
        ...this.buildLifecycleAuditFields({
          event_type: 'foundry.module.uninstalled',
          organization_id: input.organization_id,
          actor_user_id: input.actor_user_id,
          correlation_id: input.correlation_id,
          module_key: input.module_key,
          action_key: 'module.uninstall',
          gatekeeper_outcome: input.gatekeeper_outcome,
          evidence_ref: input.evidence_ref,
          lifecycle_transition_count: 1,
          receipt_hash: receiptHash,
          registry_persistence_required: true,
          payload: {
            module_version: input.module_version,
            manifest_hash: input.manifest_hash,
            status_from: input.current_status,
            status_to: 'uninstalled',
            evidence_ref: input.evidence_ref,
            retention_plan_ref: input.retention_plan_ref,
            rollback_plan_ref: input.rollback_plan_ref,
          },
        }),
      },
    };
  }

  executeUpdate(input: FoundryUpdateExecutionInput): FoundryUpdateExecutionReceipt {
    this.assertUpdateExecutionInput(input);

    const markUpdateAvailable = this.assertLifecycleTransition({
      module_key: input.module_key,
      from_state: 'enabled',
      to_state: 'update_available',
      action_key: 'module.mark_update_available',
      gatekeeper_outcome: input.gatekeeper_outcome,
      evidence_ref: input.evidence_ref,
    });
    const startUpdate = this.assertLifecycleTransition({
      module_key: input.module_key,
      from_state: 'update_available',
      to_state: 'updating',
      action_key: 'module.start_update',
      gatekeeper_outcome: input.gatekeeper_outcome,
      evidence_ref: input.evidence_ref,
    });
    const completeUpdate = this.assertLifecycleTransition({
      module_key: input.module_key,
      from_state: 'updating',
      to_state: 'enabled',
      action_key: 'module.complete_update',
      gatekeeper_outcome: input.gatekeeper_outcome,
      evidence_ref: input.evidence_ref,
    });
    const receiptBasis = {
      module_key: input.module_key,
      current_version: input.current_version,
      target_version: input.target_version,
      current_manifest_hash: input.current_manifest_hash,
      target_manifest_hash: input.target_manifest_hash,
      action_key: 'module.update',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      evidence_ref: input.evidence_ref,
      migration_plan_ref: input.migration_plan_ref,
      rollback_plan_ref: input.rollback_plan_ref,
      compatibility_result_hash: sha256Hex(stableJsonStringify(input.compatibility_result)),
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      correlation_id: input.correlation_id,
    };
    const receiptHash = sha256Hex(stableJsonStringify(receiptBasis));

    return {
      execution_id: `foundry-update-${receiptHash.slice(0, 16)}`,
      receipt_hash: receiptHash,
      module_key: input.module_key,
      current_version: input.current_version,
      target_version: input.target_version,
      action_key: 'module.update',
      status_path: ['enabled', 'update_available', 'updating', 'enabled'],
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      foundry_execution_completed: true,
      lifecycle_transitions: [markUpdateAvailable, startUpdate, completeUpdate],
      migration: {
        plan_ref: input.migration_plan_ref,
        transaction_required: true,
        destructive_migration_allowed: false,
      },
      rollback: {
        plan_ref: input.rollback_plan_ref,
        required_before_execution: true,
        recovery_flow_deferred_to: 'P5B-014b',
      },
      compatibility: {
        checked: true,
        compatible: true,
      },
      registry: {
        next_status: 'enabled',
        update_available_cleared: true,
        persistence_required: true,
      },
      evidence: {
        evidence_ref: input.evidence_ref,
        evidence_required_before_execution: true,
      },
      audit: {
        event_type: 'foundry.module.updated',
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        correlation_id: input.correlation_id,
        ...this.buildLifecycleAuditFields({
          event_type: 'foundry.module.updated',
          organization_id: input.organization_id,
          actor_user_id: input.actor_user_id,
          correlation_id: input.correlation_id,
          module_key: input.module_key,
          action_key: 'module.update',
          gatekeeper_outcome: input.gatekeeper_outcome,
          evidence_ref: input.evidence_ref,
          lifecycle_transition_count: 3,
          receipt_hash: receiptHash,
          registry_persistence_required: true,
          payload: {
            current_version: input.current_version,
            target_version: input.target_version,
            current_manifest_hash: input.current_manifest_hash,
            target_manifest_hash: input.target_manifest_hash,
            evidence_ref: input.evidence_ref,
            migration_plan_ref: input.migration_plan_ref,
            rollback_plan_ref: input.rollback_plan_ref,
          },
        }),
      },
    };
  }

  executeRollbackRecovery(input: FoundryRollbackRecoveryInput): FoundryRollbackRecoveryReceipt {
    this.assertRollbackRecoveryInput(input);

    const lifecycleTransitions =
      input.current_status === 'updating'
        ? [
            this.assertLifecycleTransition({
              module_key: input.module_key,
              from_state: 'updating',
              to_state: 'rollback_required',
              action_key: 'module.require_rollback',
              gatekeeper_outcome: input.gatekeeper_outcome,
              evidence_ref: input.failure_evidence_ref,
            }),
            this.assertLifecycleTransition({
              module_key: input.module_key,
              from_state: 'rollback_required',
              to_state: 'installed',
              action_key: 'module.resolve_rollback',
              gatekeeper_outcome: input.gatekeeper_outcome,
              evidence_ref: input.evidence_ref,
            }),
          ]
        : [
            this.assertLifecycleTransition({
              module_key: input.module_key,
              from_state: 'rollback_required',
              to_state: 'installed',
              action_key: 'module.resolve_rollback',
              gatekeeper_outcome: input.gatekeeper_outcome,
              evidence_ref: input.evidence_ref,
            }),
          ];
    const receiptBasis = {
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      status_from: input.current_status,
      status_to: 'installed',
      action_key: 'module.rollback_recovery',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      evidence_ref: input.evidence_ref,
      rollback_plan_ref: input.rollback_plan_ref,
      failure_evidence_ref: input.failure_evidence_ref,
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      correlation_id: input.correlation_id,
    };
    const receiptHash = sha256Hex(stableJsonStringify(receiptBasis));

    return {
      execution_id: `foundry-rollback-${receiptHash.slice(0, 16)}`,
      receipt_hash: receiptHash,
      module_key: input.module_key,
      module_version: input.module_version,
      manifest_hash: input.manifest_hash,
      action_key: 'module.rollback_recovery',
      status_from: input.current_status,
      status_to: 'installed',
      gatekeeper_outcome: input.gatekeeper_outcome,
      gatekeeper_decision_token: input.gatekeeper_decision_token,
      foundry_execution_completed: true,
      lifecycle_transitions: lifecycleTransitions,
      rollback: {
        plan_ref: input.rollback_plan_ref,
        failure_evidence_ref: input.failure_evidence_ref,
        recovery_completed: true,
      },
      registry: {
        next_status: 'installed',
        rollback_required_cleared: true,
        persistence_required: true,
      },
      evidence: {
        evidence_ref: input.evidence_ref,
        evidence_required_before_execution: true,
      },
      audit: {
        event_type: 'foundry.module.rollback_recovered',
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        correlation_id: input.correlation_id,
        ...this.buildLifecycleAuditFields({
          event_type: 'foundry.module.rollback_recovered',
          organization_id: input.organization_id,
          actor_user_id: input.actor_user_id,
          correlation_id: input.correlation_id,
          module_key: input.module_key,
          action_key: 'module.rollback_recovery',
          gatekeeper_outcome: input.gatekeeper_outcome,
          evidence_ref: input.evidence_ref,
          lifecycle_transition_count: lifecycleTransitions.length,
          receipt_hash: receiptHash,
          registry_persistence_required: true,
          payload: {
            module_version: input.module_version,
            manifest_hash: input.manifest_hash,
            status_from: input.current_status,
            status_to: 'installed',
            evidence_ref: input.evidence_ref,
            rollback_plan_ref: input.rollback_plan_ref,
            failure_evidence_ref: input.failure_evidence_ref,
          },
        }),
      },
    };
  }

  scaffoldModule(input: FoundryModuleScaffoldInput): FoundryModuleScaffold {
    this.assertScaffoldInput(input);

    const capabilities = [...new Set(input.capabilities ?? [])].sort();
    const dependencies = [...new Set(input.dependencies ?? [])].sort();
    const hashBasis = {
      module_key: input.module_key,
      display_name: input.display_name,
      module_type: input.module_type,
      version: input.version,
      owner: input.owner,
      min_platform_version: input.min_platform_version,
      capabilities,
      dependencies,
    };

    return {
      module_key: input.module_key,
      display_name: input.display_name,
      module_type: input.module_type,
      version: input.version,
      owner: input.owner,
      min_platform_version: input.min_platform_version,
      lifecycle_status: 'scaffolded',
      manifest_hash: sha256Hex(stableJsonStringify(hashBasis)),
      gatekeeper_preflight_required: true,
      foundry_execution_allowed: false,
      capabilities,
      dependencies,
      non_scope_guards: {
        business_module: false,
        golden_module: false,
        marketplace_public: false,
        production_adapter_enabled: false,
      },
    };
  }

  validateManifest(input: FoundryModuleManifestCandidate): FoundryManifestValidationResult {
    const errors: string[] = [];

    this.validateManifestIdentity(input, errors);
    this.validateManifestCollections(input, errors);
    this.validateManifestReferences(input, errors);

    return {
      valid: errors.length === 0,
      module_key: typeof input.module_key === 'string' ? input.module_key : null,
      version: typeof input.version === 'string' ? input.version : null,
      manifest_hash: errors.length === 0 ? sha256Hex(stableJsonStringify(input)) : null,
      errors,
    };
  }

  assertManifestValid(input: FoundryModuleManifestCandidate): FoundryManifestValidationResult {
    const result = this.validateManifest(input);
    if (!result.valid) {
      throw new BadRequestException({
        message: 'Foundry module manifest validation failed',
        errors: result.errors,
      });
    }

    return result;
  }

  checkCompatibility(input: FoundryCompatibilityCheckInput): FoundryCompatibilityCheckResult {
    const errors: string[] = [];
    const installedModules = new Map(
      (input.installed_modules ?? []).map((module) => [module.module_key, module]),
    );

    if (!SEMVER_PATTERN.test(input.platform_core_version)) {
      errors.push('platform_core_version must be semver');
    }
    if (!SEMVER_PATTERN.test(input.manifest.min_platform_version)) {
      errors.push('manifest min_platform_version must be semver');
    }
    if (
      SEMVER_PATTERN.test(input.platform_core_version) &&
      SEMVER_PATTERN.test(input.manifest.min_platform_version) &&
      compareSemver(input.manifest.min_platform_version, input.platform_core_version) > 0
    ) {
      errors.push(
        `module ${input.manifest.module_key} requires platform ${input.manifest.min_platform_version} but current platform is ${input.platform_core_version}`,
      );
    }

    const dependencyResults = input.manifest.dependencies.map((dependency) => {
      const installed = installedModules.get(dependency.module_key);
      if (!installed) {
        return {
          module_key: dependency.module_key,
          required_min_version: dependency.min_version ?? null,
          installed_version: null,
          installed_status: null,
          compatible: false,
          reason: 'required dependency is not installed',
        };
      }

      if (!['installed', 'enabled'].includes(installed.status)) {
        return {
          module_key: dependency.module_key,
          required_min_version: dependency.min_version ?? null,
          installed_version: installed.version,
          installed_status: installed.status,
          compatible: false,
          reason: 'required dependency is not in an installable runtime state',
        };
      }

      if (!SEMVER_PATTERN.test(installed.version)) {
        return {
          module_key: dependency.module_key,
          required_min_version: dependency.min_version ?? null,
          installed_version: installed.version,
          installed_status: installed.status,
          compatible: false,
          reason: 'installed dependency version is not semver',
        };
      }

      if (dependency.min_version && compareSemver(installed.version, dependency.min_version) < 0) {
        return {
          module_key: dependency.module_key,
          required_min_version: dependency.min_version,
          installed_version: installed.version,
          installed_status: installed.status,
          compatible: false,
          reason: 'installed dependency version is below required minimum',
        };
      }

      return {
        module_key: dependency.module_key,
        required_min_version: dependency.min_version ?? null,
        installed_version: installed.version,
        installed_status: installed.status,
        compatible: true,
        reason: null,
      };
    });

    for (const dependencyResult of dependencyResults) {
      if (!dependencyResult.compatible && dependencyResult.reason) {
        errors.push(`dependency ${dependencyResult.module_key}: ${dependencyResult.reason}`);
      }
    }

    return {
      compatible: errors.length === 0,
      module_key: input.manifest.module_key,
      platform_core_version: input.platform_core_version,
      min_platform_version: input.manifest.min_platform_version,
      errors,
      dependency_results: dependencyResults,
    };
  }

  assertCompatibility(input: FoundryCompatibilityCheckInput): FoundryCompatibilityCheckResult {
    const result = this.checkCompatibility(input);
    if (!result.compatible) {
      throw new BadRequestException({
        message: 'Foundry module compatibility check failed',
        errors: result.errors,
        dependency_results: result.dependency_results,
      });
    }

    return result;
  }

  planLifecycleTransition(input: FoundryLifecycleTransitionInput): FoundryLifecycleTransitionPlan {
    const errors: string[] = [];

    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      errors.push('module_key must use module key syntax');
    }
    if (!FOUNDRY_LIFECYCLE_STATE_SET.has(input.from_state)) {
      errors.push(`from_state is not an approved Foundry lifecycle state: ${input.from_state}`);
    }
    if (!FOUNDRY_LIFECYCLE_STATE_SET.has(input.to_state)) {
      errors.push(`to_state is not an approved Foundry lifecycle state: ${input.to_state}`);
    }
    if (input.gatekeeper_outcome !== 'ALLOW') {
      errors.push('Foundry lifecycle transition requires Gatekeeper ALLOW before execution');
    }
    if (!this.hasLifecycleTransition(input.from_state, input.to_state, input.action_key)) {
      errors.push(
        `Foundry lifecycle transition is not allowed: ${input.from_state} -> ${input.to_state} via ${input.action_key}`,
      );
    }
    if (!input.evidence_ref || input.evidence_ref.trim().length === 0) {
      errors.push('Foundry lifecycle transition requires evidence_ref');
    }

    const allowed = errors.length === 0;

    return {
      module_key: input.module_key,
      from_state: input.from_state,
      to_state: input.to_state,
      action_key: input.action_key,
      gatekeeper_outcome: input.gatekeeper_outcome,
      allowed,
      foundry_execution_allowed: allowed,
      gatekeeper_required: true,
      evidence_required: true,
      registry_persistence_required: true,
      errors,
    };
  }

  assertLifecycleTransition(input: FoundryLifecycleTransitionInput): FoundryLifecycleTransitionPlan {
    const plan = this.planLifecycleTransition(input);
    if (!plan.allowed) {
      throw new BadRequestException({
        message: 'Foundry lifecycle transition is not allowed',
        errors: plan.errors,
      });
    }

    return plan;
  }

  buildEvidencePackage(input: FoundryEvidencePackageInput): FoundryEvidencePackage {
    const errors: string[] = [];

    this.validateEvidencePackageIdentity(input, errors);
    this.validateEvidenceArtifacts(input.migration_files, errors);

    const requiredSectionsComplete = {
      module_manifest:
        input.manifest.module_key === input.module_key &&
        input.manifest.version === input.module_version &&
        HEX_SHA256_PATTERN.test(input.manifest_hash),
      migration_files_with_checksums: input.migration_files.every((artifact) => HEX_SHA256_PATTERN.test(artifact.sha256)),
      capability_declarations_before_after:
        input.capability_snapshot_after.length > 0 &&
        input.capability_snapshot_after.every((capability) => MANIFEST_KEY_PATTERN.test(capability)) &&
        input.capability_snapshot_before.every((capability) => MANIFEST_KEY_PATTERN.test(capability)),
      health_check_results: this.validationResultsPassed(input.health_check_results),
      smoke_test_results: this.validationResultsPassed(input.smoke_test_results),
      gatekeeper_decision_log: this.hasGatekeeperDecisionLog(input.gatekeeper_decision),
      rollback_plan: input.rollback_plan_ref.trim().length > 0,
      installer_actor_identity: input.installer_actor_id.trim().length > 0,
      step_timestamps:
        input.step_timestamps.length > 0 &&
        input.step_timestamps.every((timestamp) => timestamp.step.trim().length > 0 && isValidIsoTimestamp(timestamp.at)),
      validation_results: this.validationResultsPassed(input.validation_results),
      compatibility_check: input.compatibility_result.compatible === true,
    };

    for (const [section, complete] of Object.entries(requiredSectionsComplete)) {
      if (!complete) {
        errors.push(`evidence package section is incomplete: ${section}`);
      }
    }

    if (input.gatekeeper_decision.outcome !== 'ALLOW') {
      errors.push('Foundry evidence package requires Gatekeeper ALLOW before lifecycle execution');
    }

    const compatibilityResultHash = sha256Hex(stableJsonStringify(input.compatibility_result));
    const hashBasis = {
      module_key: input.module_key,
      module_version: input.module_version,
      lifecycle_action: input.lifecycle_action,
      manifest_hash: input.manifest_hash,
      migration_files: input.migration_files,
      capability_snapshot_before: [...input.capability_snapshot_before].sort(),
      capability_snapshot_after: [...input.capability_snapshot_after].sort(),
      health_check_results: input.health_check_results,
      smoke_test_results: input.smoke_test_results,
      validation_results: input.validation_results,
      gatekeeper_decision: input.gatekeeper_decision,
      rollback_plan_ref: input.rollback_plan_ref,
      installer_actor_id: input.installer_actor_id,
      organization_id: input.organization_id,
      correlation_id: input.correlation_id,
      compatibility_result_hash: compatibilityResultHash,
      step_timestamps: input.step_timestamps,
    };
    const packageHash = sha256Hex(stableJsonStringify(hashBasis));
    const complete = errors.length === 0;

    return {
      package_id: `foundry-evidence-${packageHash.slice(0, 16)}`,
      package_hash: packageHash,
      module_key: input.module_key,
      module_version: input.module_version,
      lifecycle_action: input.lifecycle_action,
      manifest_hash: input.manifest_hash,
      artifact_count: input.migration_files.length,
      validation_result_count:
        input.health_check_results.length + input.smoke_test_results.length + input.validation_results.length,
      gatekeeper_decision: input.gatekeeper_decision,
      rollback_plan_ref: input.rollback_plan_ref,
      installer_actor_id: input.installer_actor_id,
      organization_id: input.organization_id,
      correlation_id: input.correlation_id,
      compatibility_result_hash: compatibilityResultHash,
      gatekeeper_required: true,
      audit_outbox_storage_required: true,
      foundry_execution_allowed: complete,
      complete,
      required_sections_complete: requiredSectionsComplete,
      errors,
    };
  }

  assertEvidencePackageComplete(input: FoundryEvidencePackageInput): FoundryEvidencePackage {
    const evidencePackage = this.buildEvidencePackage(input);
    if (!evidencePackage.complete) {
      throw new BadRequestException({
        message: 'Foundry evidence package is incomplete',
        errors: evidencePackage.errors,
      });
    }

    return evidencePackage;
  }

  private buildLifecycleAuditFields(input: {
    event_type: string;
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    module_key: string;
    action_key: string;
    gatekeeper_outcome?: string | null;
    evidence_ref?: string | null;
    lifecycle_transition_count: number;
    receipt_hash?: string | null;
    registry_persistence_required: boolean;
    payload: Record<string, unknown>;
  }): {
    event_envelope: FoundryLifecycleAuditEnvelope;
    audit_completeness: FoundryLifecycleAuditCompleteness;
  } {
    const eventEnvelope = this.buildLifecycleEventEnvelope(input);

    return {
      event_envelope: eventEnvelope,
      audit_completeness: {
        record_key: 'foundry.audit-completeness',
        lifecycle_audit_recorded: true,
        event_envelope_recorded: true,
        event_envelope_compliant: true,
        organization_id_present: Boolean(input.organization_id),
        actor_user_id_present: Boolean(input.actor_user_id),
        correlation_id_present: Boolean(input.correlation_id),
        module_key_present: Boolean(input.module_key),
        action_key_present: Boolean(input.action_key),
        gatekeeper_outcome_present: Boolean(input.gatekeeper_outcome),
        evidence_ref_present: Boolean(input.evidence_ref),
        registry_persistence_declared: input.registry_persistence_required,
        lifecycle_transition_count: input.lifecycle_transition_count,
        receipt_hash_present: Boolean(input.receipt_hash),
      },
    };
  }

  private buildLifecycleEventEnvelope(input: {
    event_type: string;
    organization_id: string;
    actor_user_id: string;
    correlation_id: string;
    module_key: string;
    action_key: string;
    payload: Record<string, unknown>;
  }): EventEnvelope {
    const envelope = buildEventEnvelope({
      organization_id: input.organization_id,
      event_type: input.event_type,
      idempotency_key: `${input.event_type}.${input.organization_id}.${input.module_key}.${input.correlation_id}`,
      source_module: 'foundry',
      subject: {
        entity_type: 'foundry.module',
        entity_id: input.module_key,
      },
      payload: {
        module_key: input.module_key,
        action_key: input.action_key,
        correlation_id: input.correlation_id,
        ...input.payload,
      },
      compliance: {
        privacy_class: 'restricted',
        retention_class: 'audit',
        redaction_policy: 'strict',
        audit_required: true,
        replay_allowed: false,
      },
      context: {
        actor_user_id: input.actor_user_id,
        correlation_id: input.correlation_id,
      },
    });

    return assertComplianceEventContext(envelope);
  }

  private buildInstallPreflightGatekeeperRequest(input: FoundryInstallPreflightInput): GatekeeperPreflightInput {
    this.assertInstallPreflightInput(input);

    return {
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      active_group_ids: input.active_group_ids,
      entity_type: 'foundry.module',
      entity_id: input.target_module_key,
      action_key: FOUNDRY_INSTALL_ACTION_KEY,
      capability_key: FOUNDRY_INSTALL_PREFLIGHT_CAPABILITY_KEY,
      module_key: FOUNDRY_INSTALL_GATEKEEPER_MODULE_KEY,
      scope_unit_id: null,
      payload: {
        action_key: FOUNDRY_INSTALL_ACTION_KEY,
        target_module_key: input.target_module_key,
        target_module_version: input.target_module_version,
        manifest_hash: input.manifest_hash,
        migration_plan_ref: input.migration_plan_ref,
        rollback_plan_ref: input.rollback_plan_ref,
        evidence_package_ref: input.evidence_package_ref,
        correlation_id: input.correlation_id,
        risk_surface: 'migration',
        migration_risk: 'non_destructive',
        rollback_risk: 'covered',
        migration_validation_passed: true,
        rollback_validation_passed: true,
        rollback_evidence_present: true,
      },
      module_health: input.module_health,
      dependency_health: input.dependency_health,
      reauth_status: input.reauth_status ?? 'not_required',
    };
  }

  private assertInstallPreflightInput(input: FoundryInstallPreflightInput) {
    if (!MODULE_KEY_PATTERN.test(input.target_module_key)) {
      throw new BadRequestException('Foundry install preflight target_module_key must use module key syntax');
    }
    if (!SEMVER_PATTERN.test(input.target_module_version)) {
      throw new BadRequestException('Foundry install preflight target_module_version must be semver');
    }
    if (!HEX_SHA256_PATTERN.test(input.manifest_hash)) {
      throw new BadRequestException('Foundry install preflight manifest_hash must be a SHA-256 hex digest');
    }
    if (input.organization_id.trim().length === 0 || input.actor_user_id.trim().length === 0) {
      throw new BadRequestException('Foundry install preflight requires trusted tenant and actor context');
    }
    if (input.active_group_ids.length === 0 || input.active_group_ids.some((groupId) => groupId.trim().length === 0)) {
      throw new BadRequestException('Foundry install preflight requires active_group_ids');
    }
    if (input.module_health?.[FOUNDRY_INSTALL_GATEKEEPER_MODULE_KEY] !== 'healthy') {
      throw new BadRequestException('Foundry install preflight requires healthy Access Core module context');
    }
    for (const field of ['migration_plan_ref', 'rollback_plan_ref', 'evidence_package_ref', 'correlation_id'] as const) {
      if (input[field].trim().length === 0) {
        throw new BadRequestException(`Foundry install preflight ${field} is required`);
      }
    }
  }

  private assertInstallExecutionInput(input: FoundryInstallExecutionInput) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      throw new BadRequestException('Foundry install execution module_key must use module key syntax');
    }
    if (!SEMVER_PATTERN.test(input.module_version)) {
      throw new BadRequestException('Foundry install execution module_version must be semver');
    }
    if (!HEX_SHA256_PATTERN.test(input.manifest_hash)) {
      throw new BadRequestException('Foundry install execution manifest_hash must be a SHA-256 hex digest');
    }
    if (input.gatekeeper_outcome !== 'ALLOW') {
      throw new BadRequestException('Foundry install execution requires Gatekeeper ALLOW');
    }
    if (input.compatibility_result.compatible !== true || input.compatibility_result.module_key !== input.module_key) {
      throw new BadRequestException('Foundry install execution requires compatible module result');
    }
    for (const field of [
      'gatekeeper_decision_token',
      'evidence_ref',
      'migration_plan_ref',
      'rollback_plan_ref',
      'organization_id',
      'actor_user_id',
      'correlation_id',
    ] as const) {
      if (input[field].trim().length === 0) {
        throw new BadRequestException(`Foundry install execution ${field} is required`);
      }
    }
  }

  private assertInstallEvidenceReceiptInput(input: FoundryInstallEvidenceReceiptInput) {
    const execution = input.install_execution_receipt;
    const evidence = input.evidence_package;

    if (
      execution.action_key !== FOUNDRY_INSTALL_ACTION_KEY ||
      execution.status_to !== 'installed' ||
      execution.foundry_execution_completed !== true
    ) {
      throw new BadRequestException('Foundry install evidence receipt requires a completed install execution receipt');
    }
    if (evidence.complete !== true || evidence.foundry_execution_allowed !== true) {
      throw new BadRequestException('Foundry install evidence receipt requires a complete evidence package');
    }
    if (evidence.lifecycle_action !== FOUNDRY_INSTALL_ACTION_KEY) {
      throw new BadRequestException('Foundry install evidence receipt requires module.install evidence');
    }
    if (evidence.module_key !== execution.module_key || evidence.module_version !== execution.module_version) {
      throw new BadRequestException('Foundry install evidence receipt module identity mismatch');
    }
    if (evidence.organization_id !== input.organization_id || execution.audit.organization_id !== input.organization_id) {
      throw new BadRequestException('Foundry install evidence receipt organization mismatch');
    }
    if (evidence.correlation_id !== input.correlation_id || execution.audit.correlation_id !== input.correlation_id) {
      throw new BadRequestException('Foundry install evidence receipt correlation mismatch');
    }
    if (input.received_by_actor_id.trim().length === 0) {
      throw new BadRequestException('Foundry install evidence receipt received_by_actor_id is required');
    }
    if (!isValidIsoTimestamp(input.received_at)) {
      throw new BadRequestException('Foundry install evidence receipt received_at must be an ISO timestamp');
    }
  }

  private assertEnableExecutionInput(input: FoundryEnableExecutionInput) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      throw new BadRequestException('Foundry enable execution module_key must use module key syntax');
    }
    if (!SEMVER_PATTERN.test(input.module_version)) {
      throw new BadRequestException('Foundry enable execution module_version must be semver');
    }
    if (!HEX_SHA256_PATTERN.test(input.manifest_hash)) {
      throw new BadRequestException('Foundry enable execution manifest_hash must be a SHA-256 hex digest');
    }
    if (!['installed', 'disabled'].includes(input.current_status)) {
      throw new BadRequestException('Foundry enable execution requires installed or disabled current status');
    }
    if (input.gatekeeper_outcome !== 'ALLOW') {
      throw new BadRequestException('Foundry enable execution requires Gatekeeper ALLOW');
    }
    for (const field of [
      'gatekeeper_decision_token',
      'evidence_ref',
      'organization_id',
      'actor_user_id',
      'correlation_id',
    ] as const) {
      if (input[field].trim().length === 0) {
        throw new BadRequestException(`Foundry enable execution ${field} is required`);
      }
    }
  }

  private assertDisableExecutionInput(input: FoundryDisableExecutionInput) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      throw new BadRequestException('Foundry disable execution module_key must use module key syntax');
    }
    if (!SEMVER_PATTERN.test(input.module_version)) {
      throw new BadRequestException('Foundry disable execution module_version must be semver');
    }
    if (!HEX_SHA256_PATTERN.test(input.manifest_hash)) {
      throw new BadRequestException('Foundry disable execution manifest_hash must be a SHA-256 hex digest');
    }
    if (input.gatekeeper_outcome !== 'ALLOW') {
      throw new BadRequestException('Foundry disable execution requires Gatekeeper ALLOW');
    }
    for (const field of [
      'gatekeeper_decision_token',
      'evidence_ref',
      'retention_plan_ref',
      'organization_id',
      'actor_user_id',
      'correlation_id',
    ] as const) {
      if (input[field].trim().length === 0) {
        throw new BadRequestException(`Foundry disable execution ${field} is required`);
      }
    }
  }

  private assertUninstallExecutionInput(input: FoundryUninstallExecutionInput) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      throw new BadRequestException('Foundry uninstall execution module_key must use module key syntax');
    }
    if (!SEMVER_PATTERN.test(input.module_version)) {
      throw new BadRequestException('Foundry uninstall execution module_version must be semver');
    }
    if (!HEX_SHA256_PATTERN.test(input.manifest_hash)) {
      throw new BadRequestException('Foundry uninstall execution manifest_hash must be a SHA-256 hex digest');
    }
    if (!['installed', 'disabled', 'retiring'].includes(input.current_status)) {
      throw new BadRequestException('Foundry uninstall execution requires installed, disabled, or retiring current status');
    }
    if (input.gatekeeper_outcome !== 'ALLOW') {
      throw new BadRequestException('Foundry uninstall execution requires Gatekeeper ALLOW');
    }
    for (const field of [
      'gatekeeper_decision_token',
      'evidence_ref',
      'retention_plan_ref',
      'rollback_plan_ref',
      'organization_id',
      'actor_user_id',
      'correlation_id',
    ] as const) {
      if (input[field].trim().length === 0) {
        throw new BadRequestException(`Foundry uninstall execution ${field} is required`);
      }
    }
  }

  private assertUpdateExecutionInput(input: FoundryUpdateExecutionInput) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      throw new BadRequestException('Foundry update execution module_key must use module key syntax');
    }
    if (!SEMVER_PATTERN.test(input.current_version) || !SEMVER_PATTERN.test(input.target_version)) {
      throw new BadRequestException('Foundry update execution versions must be semver');
    }
    if (compareSemver(input.target_version, input.current_version) <= 0) {
      throw new BadRequestException('Foundry update execution requires target_version above current_version');
    }
    if (!HEX_SHA256_PATTERN.test(input.current_manifest_hash) || !HEX_SHA256_PATTERN.test(input.target_manifest_hash)) {
      throw new BadRequestException('Foundry update execution manifest hashes must be SHA-256 hex digests');
    }
    if (input.gatekeeper_outcome !== 'ALLOW') {
      throw new BadRequestException('Foundry update execution requires Gatekeeper ALLOW');
    }
    if (input.compatibility_result.compatible !== true || input.compatibility_result.module_key !== input.module_key) {
      throw new BadRequestException('Foundry update execution requires compatible target module result');
    }
    for (const field of [
      'gatekeeper_decision_token',
      'evidence_ref',
      'migration_plan_ref',
      'rollback_plan_ref',
      'organization_id',
      'actor_user_id',
      'correlation_id',
    ] as const) {
      if (input[field].trim().length === 0) {
        throw new BadRequestException(`Foundry update execution ${field} is required`);
      }
    }
  }

  private assertRollbackRecoveryInput(input: FoundryRollbackRecoveryInput) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      throw new BadRequestException('Foundry rollback recovery module_key must use module key syntax');
    }
    if (!SEMVER_PATTERN.test(input.module_version)) {
      throw new BadRequestException('Foundry rollback recovery module_version must be semver');
    }
    if (!['updating', 'rollback_required'].includes(input.current_status)) {
      throw new BadRequestException('Foundry rollback recovery requires updating or rollback_required status');
    }
    if (!HEX_SHA256_PATTERN.test(input.manifest_hash)) {
      throw new BadRequestException('Foundry rollback recovery manifest_hash must be a SHA-256 hex digest');
    }
    if (input.gatekeeper_outcome !== 'ALLOW') {
      throw new BadRequestException('Foundry rollback recovery requires Gatekeeper ALLOW');
    }
    for (const field of [
      'gatekeeper_decision_token',
      'evidence_ref',
      'rollback_plan_ref',
      'failure_evidence_ref',
      'organization_id',
      'actor_user_id',
      'correlation_id',
    ] as const) {
      if (input[field].trim().length === 0) {
        throw new BadRequestException(`Foundry rollback recovery ${field} is required`);
      }
    }
  }

  private assertScaffoldInput(input: FoundryModuleScaffoldInput) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      throw new BadRequestException('Foundry module scaffold requires a valid module_key');
    }

    if (input.display_name.trim().length === 0) {
      throw new BadRequestException('Foundry module scaffold requires a display_name');
    }

    if (!SEMVER_PATTERN.test(input.version) || !SEMVER_PATTERN.test(input.min_platform_version)) {
      throw new BadRequestException('Foundry module scaffold requires semver versions');
    }

    if (input.owner.trim().length === 0) {
      throw new BadRequestException('Foundry module scaffold requires an owner');
    }

    for (const capability of input.capabilities ?? []) {
      if (!MANIFEST_KEY_PATTERN.test(capability)) {
        throw new BadRequestException('Foundry module scaffold capabilities must use manifest keys');
      }
    }

    for (const dependency of input.dependencies ?? []) {
      if (!MODULE_KEY_PATTERN.test(dependency)) {
        throw new BadRequestException('Foundry module scaffold dependencies must use module keys');
      }
    }

    if (
      input.business_module === true ||
      input.golden_module === true ||
      input.marketplace_public === true ||
      input.production_adapter_enabled === true
    ) {
      throw new BadRequestException('Foundry module scaffold cannot authorize out-of-phase module scope');
    }
  }

  private validateManifestIdentity(input: FoundryModuleManifestCandidate, errors: string[]) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      errors.push('module_key must use module key syntax');
    }
    if (input.display_name.trim().length === 0) {
      errors.push('display_name is required');
    }
    if (!['core', 'standard', 'optional', 'dedicated'].includes(input.module_type)) {
      errors.push('module_type is invalid');
    }
    if (!SEMVER_PATTERN.test(input.version)) {
      errors.push('version must be semver');
    }
    if (input.owner.trim().length === 0) {
      errors.push('owner is required');
    }
    if (!SEMVER_PATTERN.test(input.min_platform_version)) {
      errors.push('min_platform_version must be semver');
    }
    if (input.data_ownership.owner_module_key !== input.module_key) {
      errors.push('data_ownership.owner_module_key must match module_key');
    }
  }

  private validateManifestCollections(input: FoundryModuleManifestCandidate, errors: string[]) {
    this.requireUnique(input.capabilities, (item) => item.key, 'capability key', errors);
    this.requireUnique(input.permissions, (item) => item.key, 'permission key', errors);
    this.requireUnique(input.api_routes, (item) => `${item.method} ${item.path}`, 'API route method + path', errors);
    this.requireUnique(input.gatekeeper_hooks, (item) => item.key, 'Gatekeeper hook key', errors);
    this.requireUnique(input.schemas, (item) => item.key, 'schema key', errors);
    this.requireUnique(input.migrations, (item) => item.key, 'migration key', errors);
  }

  private validateManifestReferences(input: FoundryModuleManifestCandidate, errors: string[]) {
    const capabilityKeys = new Set(input.capabilities.map((capability) => capability.key));
    const gatekeeperCapabilityKeys = new Set(input.gatekeeper_hooks.map((hook) => hook.capability_key));

    for (const capability of input.capabilities) {
      if (!MANIFEST_KEY_PATTERN.test(capability.key)) {
        errors.push(`capability ${capability.key} must use manifest key syntax`);
      }
      if (capability.module_key !== input.module_key) {
        errors.push(`capability ${capability.key} module_key must match manifest module_key`);
      }
      if (!this.capabilityBelongsToManifestNamespace(capability.key, input.module_key, input.module_type)) {
        errors.push(`capability ${capability.key} must be namespaced by manifest module_key ${input.module_key}`);
      }
      if (['high', 'critical'].includes(capability.risk_level)) {
        if (!capability.requires_audit) {
          errors.push(`high and critical capability ${capability.key} requires audit`);
        }
        if (!capability.gatekeeper_required) {
          errors.push(`high and critical capability ${capability.key} requires Gatekeeper`);
        }
      }
      if (capability.risk_level === 'critical' && !capability.requires_reauth) {
        errors.push(`critical capability ${capability.key} requires reauth`);
      }
      if (capability.gatekeeper_required && !gatekeeperCapabilityKeys.has(capability.key)) {
        errors.push(`gatekeeper_required capability ${capability.key} must have a Gatekeeper hook`);
      }
    }

    for (const permission of input.permissions) {
      if (!MANIFEST_KEY_PATTERN.test(permission.key)) {
        errors.push(`permission ${permission.key} must use manifest key syntax`);
      }
      if (permission.module_key !== input.module_key) {
        errors.push(`permission ${permission.key} module_key must match manifest module_key`);
      }
      if (permission.allowed_scope_types.length === 0) {
        errors.push(`permission ${permission.key} must declare allowed scope types`);
      }
      for (const scopeType of permission.allowed_scope_types) {
        if (!PERMISSION_SCOPE_TYPES.has(scopeType)) {
          errors.push(`permission ${permission.key} has invalid scope type ${scopeType}`);
        }
      }
    }

    for (const route of input.api_routes) {
      if (!API_PATH_PATTERN.test(route.path)) {
        errors.push(`API route ${route.method} ${route.path} must use an absolute path`);
      }
      if (!capabilityKeys.has(route.capability_key)) {
        errors.push(`API route ${route.method} ${route.path} capability_key must reference local capability`);
      }
    }

    for (const hook of input.gatekeeper_hooks) {
      if (!capabilityKeys.has(hook.capability_key)) {
        errors.push(`Gatekeeper hook ${hook.key} capability_key must reference local capability`);
      }
    }

    for (const dependency of [...input.dependencies, ...input.optional_dependencies]) {
      if (!MODULE_KEY_PATTERN.test(dependency.module_key)) {
        errors.push(`dependency ${dependency.module_key} must use module key syntax`);
      }
      if (dependency.module_key === input.module_key) {
        errors.push('dependencies must not include manifest module_key');
      }
      if (dependency.min_version !== undefined && !SEMVER_PATTERN.test(dependency.min_version)) {
        errors.push(`dependency ${dependency.module_key} min_version must be semver`);
      }
    }
  }

  private capabilityBelongsToManifestNamespace(
    capabilityKey: string,
    moduleKey: string,
    moduleType: FoundryModuleType,
  ): boolean {
    if (capabilityKey.startsWith(`${moduleKey}.`)) {
      return true;
    }

    return moduleType === 'core';
  }

  private requireUnique<T>(
    items: T[],
    getKey: (item: T) => string,
    label: string,
    errors: string[],
  ) {
    const seen = new Set<string>();

    for (const item of items) {
      const key = getKey(item);
      if (seen.has(key)) {
        errors.push(`${label} must be unique: ${key}`);
      }
      seen.add(key);
    }
  }

  private hasLifecycleTransition(
    fromState: FoundryLifecycleState,
    toState: FoundryLifecycleState,
    actionKey: string,
  ) {
    return FOUNDRY_LIFECYCLE_TRANSITIONS.some(
      (transition) =>
        transition.from === fromState &&
        transition.to === toState &&
        transition.action_key === actionKey,
    );
  }

  private validateEvidencePackageIdentity(input: FoundryEvidencePackageInput, errors: string[]) {
    if (!MODULE_KEY_PATTERN.test(input.module_key)) {
      errors.push('module_key must use module key syntax');
    }
    if (!SEMVER_PATTERN.test(input.module_version)) {
      errors.push('module_version must be semver');
    }
    if (input.lifecycle_action.trim().length === 0) {
      errors.push('lifecycle_action is required');
    }
    if (input.manifest.module_key !== input.module_key) {
      errors.push('manifest module_key must match evidence package module_key');
    }
    if (input.manifest.version !== input.module_version) {
      errors.push('manifest version must match evidence package module_version');
    }
    if (!HEX_SHA256_PATTERN.test(input.manifest_hash)) {
      errors.push('manifest_hash must be a SHA-256 hex digest');
    }
    if (!this.hasGatekeeperDecisionLog(input.gatekeeper_decision)) {
      errors.push('gatekeeper_decision must include decision id, actor, outcome, risk, and reason');
    }
    if (input.organization_id.trim().length === 0) {
      errors.push('organization_id is required for tenant-scoped evidence');
    }
    if (input.correlation_id.trim().length === 0) {
      errors.push('correlation_id is required for evidence traceability');
    }
  }

  private validateEvidenceArtifacts(artifacts: FoundryEvidenceArtifactInput[], errors: string[]) {
    for (const artifact of artifacts) {
      if (artifact.path.trim().length === 0) {
        errors.push('evidence artifact path is required');
      }
      if (!HEX_SHA256_PATTERN.test(artifact.sha256)) {
        errors.push(`evidence artifact ${artifact.path} must include a SHA-256 checksum`);
      }
      if (artifact.kind !== 'migration') {
        errors.push(`migration_files can only include migration artifacts: ${artifact.path}`);
      }
    }
  }

  private validationResultsPassed(results: FoundryEvidenceValidationResult[]) {
    return (
      results.length > 0 &&
      results.every(
        (result) =>
          result.name.trim().length > 0 &&
          result.summary.trim().length > 0 &&
          result.status === 'passed',
      )
    );
  }

  private hasGatekeeperDecisionLog(decision: FoundryEvidenceGatekeeperDecision) {
    return (
      decision.decision_id.trim().length > 0 &&
      ['ALLOW', 'DENY', 'APPROVAL_REQUIRED', 'STOP_FOR_REVIEW'].includes(decision.outcome) &&
      decision.decided_by_actor_id.trim().length > 0 &&
      decision.reason_summary.trim().length > 0 &&
      ['low', 'medium', 'high', 'critical'].includes(decision.risk_level)
    );
  }
}

function stableJsonStringify(input: unknown): string {
  return JSON.stringify(canonicalize(input));
}

function canonicalize(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map((item) => canonicalize(item));
  }

  if (typeof input === 'object' && input !== null) {
    return Object.fromEntries(
      Object.keys(input as Record<string, unknown>)
        .sort()
        .map((key) => [key, canonicalize((input as Record<string, unknown>)[key])]),
    );
  }

  return input;
}

function sha256Hex(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

function compareSemver(left: string, right: string) {
  const leftParts = parseSemverCore(left);
  const rightParts = parseSemverCore(right);

  for (let index = 0; index < 3; index += 1) {
    const difference = leftParts[index] - rightParts[index];
    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

function parseSemverCore(version: string): [number, number, number] {
  const [major = '0', minor = '0', patch = '0'] = version.split(/[+-]/)[0].split('.');

  return [Number(major), Number(minor), Number(patch)];
}

function isValidIsoTimestamp(input: string) {
  return input.trim().length > 0 && !Number.isNaN(Date.parse(input));
}
