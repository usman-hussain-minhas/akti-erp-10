import { BadRequestException, Injectable } from '@nestjs/common';

import {
  type EventEnvelope,
  assertComplianceEventContext,
  buildEventEnvelope,
} from '../platform-observability/event-outbox.service';

const WORKFLOW_KEY_PATTERN = /^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9_-]*)+$/;
const WORKFLOW_VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const WORKFLOW_STATE_KEY_PATTERN = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*$/;
const FORBIDDEN_GATEKEEPER_OUTCOME_KEYS = new Set([
  'ALLOW',
  'DENY',
  'APPROVAL_REQUIRED',
  'STOP_FOR_REVIEW',
  'allow',
  'deny',
  'approval_required',
  'stop_for_review',
]);

export type WorkflowTenantScope = 'global' | 'organization';
export type WorkflowStateKind = 'start' | 'intermediate' | 'terminal';
export type WorkflowGuardType = 'gatekeeper' | 'capability' | 'evidence' | 'timeout' | 'condition';

export type WorkflowStateDefinition = {
  state_key: string;
  kind: WorkflowStateKind;
  label: string;
};

export type WorkflowTransitionDefinition = {
  transition_key: string;
  from_state: string;
  to_state: string;
  action_key: string;
  guard_keys: string[];
  approval_key?: string | null;
  emitted_event_types: string[];
};

export type WorkflowGuardDefinition = {
  guard_key: string;
  type: WorkflowGuardType;
  description: string;
};

export type WorkflowApprovalDefinition = {
  approval_key: string;
  approval_chain_key: string;
  evidence_required: boolean;
  timeout_seconds?: number | null;
};

export type WorkflowAuditHookDefinition = {
  hook_key: string;
  event_type: string;
  action_key: string;
  audit_required: true;
};

export type WorkflowDeprecationPolicy = {
  deprecated: boolean;
  replacement_workflow_key?: string | null;
  rollback_supported: boolean;
};

export type WorkflowProcessDefinition = {
  workflow_key: string;
  version: string;
  owner: string;
  tenant_scope: WorkflowTenantScope;
  capability_requirements: string[];
  states: WorkflowStateDefinition[];
  transitions: WorkflowTransitionDefinition[];
  guards: WorkflowGuardDefinition[];
  approvals: WorkflowApprovalDefinition[];
  emitted_events: string[];
  audit_hooks: WorkflowAuditHookDefinition[];
  error_behavior: 'fail_closed';
  compatibility: {
    min_platform_version: string;
  };
  evidence_requirements: string[];
  deprecation_policy: WorkflowDeprecationPolicy;
};

export type WorkflowDefinitionValidationResult = {
  valid: boolean;
  workflow_key: string | null;
  version: string | null;
  tenant_scope: WorkflowTenantScope | null;
  core_service: true;
  foundry_module: false;
  errors: string[];
};

export type WorkflowPersistenceModelBaseline = {
  owner_module: 'core.workflow';
  models: ['WorkflowDefinition', 'WorkflowInstance', 'WorkflowStepInstance'];
  tenant_scoped: true;
  organization_id_required: true;
  definition_unique_by: ['organization_id', 'workflow_key', 'version'];
  instance_links_definition: true;
  step_links_instance: true;
  gatekeeper_outcome_supported_on_steps: true;
};

export type WorkflowApprovalFlowExecutionInput = {
  definition: WorkflowProcessDefinition;
  organization_id: string;
  actor_user_id: string;
  subject_type: string;
  subject_id: string | null;
  current_state: string;
  transition_key: string;
  gatekeeper_outcome: 'ALLOW' | 'DENY' | 'APPROVAL_REQUIRED' | 'STOP_FOR_REVIEW';
  approval_decision?: 'approved' | 'rejected' | null;
  evidence_keys_present: string[];
  correlation_id: string;
};

export type WorkflowApprovalFlowExecutionResult = {
  workflow_key: string;
  version: string;
  organization_id: string;
  actor_user_id: string;
  subject_type: string;
  subject_id: string | null;
  transition_key: string;
  from_state: string;
  to_state: string;
  status: 'approval_pending' | 'transitioned';
  gatekeeper_outcome: 'ALLOW' | 'APPROVAL_REQUIRED';
  approval_key: string;
  approval_chain_key: string;
  approval_decision: 'approved' | null;
  required_evidence: string[];
  evidence_keys_present: string[];
  audit_required: true;
  event_type: string;
  correlation_id: string;
};

export type WorkflowStartApiInput = WorkflowApprovalFlowExecutionInput;

export type WorkflowStartApiResponse = {
  method: 'POST';
  route: '/platform/workflows';
  capability: {
    required: 'platform.workflow.manage';
  };
  tenant_context: {
    organization_id: string;
    actor_user_id: string;
  };
  gatekeeper: {
    preflight_required: true;
    capability_key: 'platform.workflow.manage';
    outcome: WorkflowApprovalFlowExecutionInput['gatekeeper_outcome'];
    execution_blocked_on_stop_or_deny: true;
  };
  workflow: WorkflowApprovalFlowExecutionResult;
  audit: {
    event_type: string;
    event_envelope: EventEnvelope;
  };
};

export type WorkflowQueryApiInput = {
  organization_id: string;
  actor_user_id: string;
  workflow_id: string;
};

export type WorkflowQueryApiResponse = {
  method: 'GET';
  route: '/platform/workflows/:id';
  capability: {
    required: 'platform.workflow.read';
  };
  tenant_context: {
    organization_id: string;
    actor_user_id: string;
  };
  workflow: {
    workflow_id: string;
    persistence_model: 'WorkflowInstance';
    read_model_required: true;
  };
  audit: {
    event_type: 'workflow.instance.read';
    audit_required: true;
  };
};

@Injectable()
export class WorkflowService {
  workflowPersistenceModelBaseline(): WorkflowPersistenceModelBaseline {
    return {
      owner_module: 'core.workflow',
      models: ['WorkflowDefinition', 'WorkflowInstance', 'WorkflowStepInstance'],
      tenant_scoped: true,
      organization_id_required: true,
      definition_unique_by: ['organization_id', 'workflow_key', 'version'],
      instance_links_definition: true,
      step_links_instance: true,
      gatekeeper_outcome_supported_on_steps: true,
    };
  }

  validateProcessDefinition(input: unknown): WorkflowDefinitionValidationResult {
    const errors: string[] = [];
    const definition = isRecord(input) ? input : null;

    if (!definition) {
      return this.result(null, null, null, ['workflow definition must be an object']);
    }

    this.rejectGatekeeperOutcomeRedefinition(definition, errors);

    const workflowKey = this.stringField(definition, 'workflow_key', errors);
    const version = this.stringField(definition, 'version', errors);
    const owner = this.stringField(definition, 'owner', errors);
    const tenantScope = this.tenantScope(definition, errors);
    const errorBehavior = this.stringField(definition, 'error_behavior', errors);
    const compatibility = this.recordField(definition, 'compatibility', errors);
    const deprecationPolicy = this.recordField(definition, 'deprecation_policy', errors);

    if (workflowKey && !WORKFLOW_KEY_PATTERN.test(workflowKey)) {
      errors.push('workflow_key must use module.process key syntax');
    }
    if (version && !WORKFLOW_VERSION_PATTERN.test(version)) {
      errors.push('version must use semver syntax');
    }
    if (owner && owner === 'foundry') {
      errors.push('workflow owner must be a core platform or module owner, not Foundry itself');
    }
    if (errorBehavior && errorBehavior !== 'fail_closed') {
      errors.push('workflow error_behavior must fail closed');
    }

    if (compatibility) {
      const minPlatformVersion = this.stringField(compatibility, 'min_platform_version', errors);
      if (minPlatformVersion && !WORKFLOW_VERSION_PATTERN.test(minPlatformVersion)) {
        errors.push('compatibility.min_platform_version must use semver syntax');
      }
    }

    if (deprecationPolicy) {
      if (typeof deprecationPolicy.deprecated !== 'boolean') {
        errors.push('deprecation_policy.deprecated must be boolean');
      }
      if (typeof deprecationPolicy.rollback_supported !== 'boolean') {
        errors.push('deprecation_policy.rollback_supported must be boolean');
      }
    }

    const states = this.stateDefinitions(definition, errors);
    const guards = this.guardDefinitions(definition, errors);
    const approvals = this.approvalDefinitions(definition, errors);
    const transitions = this.transitionDefinitions(definition, states, guards, approvals, errors);
    const emittedEvents = this.stringArrayField(definition, 'emitted_events', errors);
    const auditHooks = this.auditHookDefinitions(definition, errors);
    const capabilities = this.stringArrayField(definition, 'capability_requirements', errors);
    const evidenceRequirements = this.stringArrayField(definition, 'evidence_requirements', errors);

    if (states.length > 0) {
      const startCount = states.filter((state) => state.kind === 'start').length;
      const terminalCount = states.filter((state) => state.kind === 'terminal').length;
      if (startCount !== 1) {
        errors.push('workflow definition must have exactly one start state');
      }
      if (terminalCount < 1) {
        errors.push('workflow definition must have at least one terminal state');
      }
    }
    if (transitions.length === 0) {
      errors.push('workflow definition must include at least one transition');
    }
    if (emittedEvents.length === 0) {
      errors.push('workflow definition must declare emitted_events');
    }
    if (auditHooks.length === 0) {
      errors.push('workflow definition must declare audit_hooks');
    }
    if (capabilities.length === 0) {
      errors.push('workflow definition must declare capability_requirements');
    }
    if (evidenceRequirements.length === 0) {
      errors.push('workflow definition must declare evidence_requirements');
    }

    return this.result(workflowKey, version, tenantScope, errors);
  }

  assertProcessDefinitionValid(input: unknown): WorkflowProcessDefinition {
    const result = this.validateProcessDefinition(input);
    if (!result.valid) {
      throw new BadRequestException(`Workflow process definition is invalid: ${result.errors.join('; ')}`);
    }

    return input as WorkflowProcessDefinition;
  }

  executeApprovalFlow(input: WorkflowApprovalFlowExecutionInput): WorkflowApprovalFlowExecutionResult {
    const definition = this.assertProcessDefinitionValid(input.definition);
    this.assertNonEmpty(input.organization_id, 'workflow execution organization_id is required');
    this.assertNonEmpty(input.actor_user_id, 'workflow execution actor_user_id is required');
    this.assertNonEmpty(input.subject_type, 'workflow execution subject_type is required');
    this.assertNonEmpty(input.transition_key, 'workflow execution transition_key is required');
    this.assertNonEmpty(input.current_state, 'workflow execution current_state is required');
    this.assertNonEmpty(input.correlation_id, 'workflow execution correlation_id is required');

    const transition = definition.transitions.find((item) => item.transition_key === input.transition_key);
    if (!transition) {
      throw new BadRequestException('Workflow transition is not declared by the process definition');
    }
    if (transition.from_state !== input.current_state) {
      throw new BadRequestException('Workflow transition does not start from the current state');
    }
    if (!transition.approval_key) {
      throw new BadRequestException('Workflow approval flow execution requires an approval transition');
    }

    const approval = definition.approvals.find((item) => item.approval_key === transition.approval_key);
    if (!approval) {
      throw new BadRequestException('Workflow approval transition references missing approval configuration');
    }

    if (input.gatekeeper_outcome === 'STOP_FOR_REVIEW') {
      throw new BadRequestException('Workflow execution cannot bypass Gatekeeper STOP_FOR_REVIEW');
    }
    if (input.gatekeeper_outcome === 'DENY') {
      throw new BadRequestException('Workflow execution cannot continue after Gatekeeper DENY');
    }

    const requiredEvidence = approval.evidence_required ? definition.evidence_requirements : [];
    const missingEvidence = requiredEvidence.filter((evidenceKey) => !input.evidence_keys_present.includes(evidenceKey));
    if (missingEvidence.length > 0) {
      throw new BadRequestException(`Workflow approval flow is missing evidence: ${missingEvidence.join(', ')}`);
    }

    if (input.approval_decision === 'rejected') {
      throw new BadRequestException('Workflow approval flow rejected the transition');
    }

    const approvalDecision = input.approval_decision ?? null;
    if (input.gatekeeper_outcome === 'APPROVAL_REQUIRED' && approvalDecision !== 'approved') {
      return {
        workflow_key: definition.workflow_key,
        version: definition.version,
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
        subject_type: input.subject_type,
        subject_id: input.subject_id,
        transition_key: transition.transition_key,
        from_state: transition.from_state,
        to_state: transition.from_state,
        status: 'approval_pending',
        gatekeeper_outcome: 'APPROVAL_REQUIRED',
        approval_key: approval.approval_key,
        approval_chain_key: approval.approval_chain_key,
        approval_decision: null,
        required_evidence: requiredEvidence,
        evidence_keys_present: input.evidence_keys_present,
        audit_required: true,
        event_type: transition.emitted_event_types[0],
        correlation_id: input.correlation_id,
      };
    }

    return {
      workflow_key: definition.workflow_key,
      version: definition.version,
      organization_id: input.organization_id,
      actor_user_id: input.actor_user_id,
      subject_type: input.subject_type,
      subject_id: input.subject_id,
      transition_key: transition.transition_key,
      from_state: transition.from_state,
      to_state: transition.to_state,
      status: 'transitioned',
      gatekeeper_outcome: input.gatekeeper_outcome,
      approval_key: approval.approval_key,
      approval_chain_key: approval.approval_chain_key,
      approval_decision: approvalDecision === 'approved' ? 'approved' : null,
      required_evidence: requiredEvidence,
      evidence_keys_present: input.evidence_keys_present,
      audit_required: true,
      event_type: transition.emitted_event_types[0],
      correlation_id: input.correlation_id,
    };
  }

  startWorkflow(input: WorkflowStartApiInput): WorkflowStartApiResponse {
    const workflow = this.executeApprovalFlow(input);

    return {
      method: 'POST',
      route: '/platform/workflows',
      capability: {
        required: 'platform.workflow.manage',
      },
      tenant_context: {
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
      },
      gatekeeper: {
        preflight_required: true,
        capability_key: 'platform.workflow.manage',
        outcome: input.gatekeeper_outcome,
        execution_blocked_on_stop_or_deny: true,
      },
      workflow,
      audit: {
        event_type: workflow.event_type,
        event_envelope: this.buildWorkflowAuditEvent(workflow),
      },
    };
  }

  getWorkflow(input: WorkflowQueryApiInput): WorkflowQueryApiResponse {
    this.assertNonEmpty(input.organization_id, 'workflow query organization_id is required');
    this.assertNonEmpty(input.actor_user_id, 'workflow query actor_user_id is required');
    this.assertNonEmpty(input.workflow_id, 'workflow query workflow_id is required');

    return {
      method: 'GET',
      route: '/platform/workflows/:id',
      capability: {
        required: 'platform.workflow.read',
      },
      tenant_context: {
        organization_id: input.organization_id,
        actor_user_id: input.actor_user_id,
      },
      workflow: {
        workflow_id: input.workflow_id,
        persistence_model: 'WorkflowInstance',
        read_model_required: true,
      },
      audit: {
        event_type: 'workflow.instance.read',
        audit_required: true,
      },
    };
  }

  buildWorkflowAuditEvent(result: WorkflowApprovalFlowExecutionResult): EventEnvelope {
    return assertComplianceEventContext(
      buildEventEnvelope({
        organization_id: result.organization_id,
        event_type: result.event_type,
        idempotency_key: `${result.event_type}.${result.organization_id}.${result.workflow_key}.${result.correlation_id}`,
        source_module: 'workflow.engine',
        subject: {
          entity_type: 'workflow.process',
          entity_id: result.subject_id ?? result.workflow_key,
        },
        payload: {
          workflow_key: result.workflow_key,
          version: result.version,
          transition_key: result.transition_key,
          from_state: result.from_state,
          to_state: result.to_state,
          status: result.status,
          gatekeeper_outcome: result.gatekeeper_outcome,
          approval_key: result.approval_key,
          approval_chain_key: result.approval_chain_key,
          approval_decision: result.approval_decision,
          required_evidence: result.required_evidence,
          evidence_keys_present: result.evidence_keys_present,
          correlation_id: result.correlation_id,
        },
        compliance: {
          privacy_class: 'restricted',
          retention_class: 'audit',
          redaction_policy: 'strict',
          audit_required: true,
          replay_allowed: false,
        },
        context: {
          actor_user_id: result.actor_user_id,
          correlation_id: result.correlation_id,
          workflow_key: result.workflow_key,
        },
      }),
    );
  }

  private result(
    workflowKey: string | null,
    version: string | null,
    tenantScope: WorkflowTenantScope | null,
    errors: string[],
  ): WorkflowDefinitionValidationResult {
    return {
      valid: errors.length === 0,
      workflow_key: workflowKey,
      version,
      tenant_scope: tenantScope,
      core_service: true,
      foundry_module: false,
      errors,
    };
  }

  private stateDefinitions(definition: Record<string, unknown>, errors: string[]): WorkflowStateDefinition[] {
    const states = this.recordArrayField(definition, 'states', errors);
    const seen = new Set<string>();
    const parsed: WorkflowStateDefinition[] = [];

    for (const state of states) {
      const stateKey = this.stringField(state, 'state_key', errors);
      const kind = this.stringField(state, 'kind', errors);
      const label = this.stringField(state, 'label', errors);
      if (stateKey && !WORKFLOW_STATE_KEY_PATTERN.test(stateKey)) {
        errors.push(`state ${stateKey} must use workflow state key syntax`);
      }
      if (stateKey && seen.has(stateKey)) {
        errors.push(`state ${stateKey} is duplicated`);
      }
      if (kind && !['start', 'intermediate', 'terminal'].includes(kind)) {
        errors.push(`state ${stateKey ?? '<unknown>'} has invalid kind`);
      }
      if (stateKey && kind && label && ['start', 'intermediate', 'terminal'].includes(kind)) {
        parsed.push({ state_key: stateKey, kind: kind as WorkflowStateKind, label });
        seen.add(stateKey);
      }
    }

    return parsed;
  }

  private guardDefinitions(definition: Record<string, unknown>, errors: string[]): WorkflowGuardDefinition[] {
    const guards = this.recordArrayField(definition, 'guards', errors);
    const seen = new Set<string>();
    const parsed: WorkflowGuardDefinition[] = [];

    for (const guard of guards) {
      const guardKey = this.stringField(guard, 'guard_key', errors);
      const type = this.stringField(guard, 'type', errors);
      const description = this.stringField(guard, 'description', errors);
      if (guardKey && seen.has(guardKey)) {
        errors.push(`guard ${guardKey} is duplicated`);
      }
      if (type && !['gatekeeper', 'capability', 'evidence', 'timeout', 'condition'].includes(type)) {
        errors.push(`guard ${guardKey ?? '<unknown>'} has invalid type`);
      }
      if (guardKey && type && description && ['gatekeeper', 'capability', 'evidence', 'timeout', 'condition'].includes(type)) {
        parsed.push({ guard_key: guardKey, type: type as WorkflowGuardType, description });
        seen.add(guardKey);
      }
    }

    return parsed;
  }

  private approvalDefinitions(definition: Record<string, unknown>, errors: string[]): WorkflowApprovalDefinition[] {
    const approvals = this.recordArrayField(definition, 'approvals', errors);
    const seen = new Set<string>();
    const parsed: WorkflowApprovalDefinition[] = [];

    for (const approval of approvals) {
      const approvalKey = this.stringField(approval, 'approval_key', errors);
      const approvalChainKey = this.stringField(approval, 'approval_chain_key', errors);
      const evidenceRequired = approval.evidence_required;
      const timeoutSeconds = approval.timeout_seconds;
      if (approvalKey && seen.has(approvalKey)) {
        errors.push(`approval ${approvalKey} is duplicated`);
      }
      if (typeof evidenceRequired !== 'boolean') {
        errors.push(`approval ${approvalKey ?? '<unknown>'} evidence_required must be boolean`);
      }
      if (
        typeof timeoutSeconds === 'number' &&
        (!Number.isInteger(timeoutSeconds) || timeoutSeconds <= 0)
      ) {
        errors.push(`approval ${approvalKey ?? '<unknown>'} timeout_seconds must be positive integer when present`);
      }
      if (timeoutSeconds !== undefined && timeoutSeconds !== null && typeof timeoutSeconds !== 'number') {
        errors.push(`approval ${approvalKey ?? '<unknown>'} timeout_seconds must be positive integer when present`);
      }
      if (approvalKey && approvalChainKey && typeof evidenceRequired === 'boolean') {
        parsed.push({
          approval_key: approvalKey,
          approval_chain_key: approvalChainKey,
          evidence_required: evidenceRequired,
          timeout_seconds: typeof timeoutSeconds === 'number' ? timeoutSeconds : null,
        });
        seen.add(approvalKey);
      }
    }

    return parsed;
  }

  private transitionDefinitions(
    definition: Record<string, unknown>,
    states: WorkflowStateDefinition[],
    guards: WorkflowGuardDefinition[],
    approvals: WorkflowApprovalDefinition[],
    errors: string[],
  ): WorkflowTransitionDefinition[] {
    const transitions = this.recordArrayField(definition, 'transitions', errors);
    const stateKeys = new Set(states.map((state) => state.state_key));
    const guardKeys = new Set(guards.map((guard) => guard.guard_key));
    const approvalKeys = new Set(approvals.map((approval) => approval.approval_key));
    const seen = new Set<string>();
    const parsed: WorkflowTransitionDefinition[] = [];

    for (const transition of transitions) {
      const transitionKey = this.stringField(transition, 'transition_key', errors);
      const fromState = this.stringField(transition, 'from_state', errors);
      const toState = this.stringField(transition, 'to_state', errors);
      const actionKey = this.stringField(transition, 'action_key', errors);
      const guardKeysForTransition = this.stringArrayField(transition, 'guard_keys', errors);
      const emittedEventTypes = this.stringArrayField(transition, 'emitted_event_types', errors);
      const approvalKey = typeof transition.approval_key === 'string' ? transition.approval_key : null;

      if (transitionKey && seen.has(transitionKey)) {
        errors.push(`transition ${transitionKey} is duplicated`);
      }
      if (fromState && !stateKeys.has(fromState)) {
        errors.push(`transition ${transitionKey ?? '<unknown>'} references unknown from_state ${fromState}`);
      }
      if (toState && !stateKeys.has(toState)) {
        errors.push(`transition ${transitionKey ?? '<unknown>'} references unknown to_state ${toState}`);
      }
      for (const guardKey of guardKeysForTransition) {
        if (!guardKeys.has(guardKey)) {
          errors.push(`transition ${transitionKey ?? '<unknown>'} references unknown guard ${guardKey}`);
        }
      }
      if (approvalKey && !approvalKeys.has(approvalKey)) {
        errors.push(`transition ${transitionKey ?? '<unknown>'} references unknown approval ${approvalKey}`);
      }
      if (emittedEventTypes.length === 0) {
        errors.push(`transition ${transitionKey ?? '<unknown>'} must emit at least one event`);
      }
      if (transitionKey && fromState && toState && actionKey) {
        parsed.push({
          transition_key: transitionKey,
          from_state: fromState,
          to_state: toState,
          action_key: actionKey,
          guard_keys: guardKeysForTransition,
          approval_key: approvalKey,
          emitted_event_types: emittedEventTypes,
        });
        seen.add(transitionKey);
      }
    }

    return parsed;
  }

  private auditHookDefinitions(definition: Record<string, unknown>, errors: string[]): WorkflowAuditHookDefinition[] {
    const hooks = this.recordArrayField(definition, 'audit_hooks', errors);
    const parsed: WorkflowAuditHookDefinition[] = [];

    for (const hook of hooks) {
      const hookKey = this.stringField(hook, 'hook_key', errors);
      const eventType = this.stringField(hook, 'event_type', errors);
      const actionKey = this.stringField(hook, 'action_key', errors);
      if (hook.audit_required !== true) {
        errors.push(`audit hook ${hookKey ?? '<unknown>'} audit_required must be true`);
      }
      if (hookKey && eventType && actionKey && hook.audit_required === true) {
        parsed.push({ hook_key: hookKey, event_type: eventType, action_key: actionKey, audit_required: true });
      }
    }

    return parsed;
  }

  private tenantScope(definition: Record<string, unknown>, errors: string[]): WorkflowTenantScope | null {
    const tenantScope = this.stringField(definition, 'tenant_scope', errors);
    if (tenantScope && tenantScope !== 'global' && tenantScope !== 'organization') {
      errors.push('tenant_scope must be global or organization');
      return null;
    }

    return tenantScope as WorkflowTenantScope | null;
  }

  private stringField(record: Record<string, unknown>, key: string, errors: string[]): string | null {
    const value = record[key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${key} is required`);
      return null;
    }

    return value.trim();
  }

  private assertNonEmpty(value: string, message: string) {
    if (value.trim().length === 0) {
      throw new BadRequestException(message);
    }
  }

  private recordField(record: Record<string, unknown>, key: string, errors: string[]): Record<string, unknown> | null {
    const value = record[key];
    if (!isRecord(value)) {
      errors.push(`${key} must be an object`);
      return null;
    }

    return value;
  }

  private recordArrayField(record: Record<string, unknown>, key: string, errors: string[]): Record<string, unknown>[] {
    const value = record[key];
    if (!Array.isArray(value)) {
      errors.push(`${key} must be an array`);
      return [];
    }
    if (!value.every(isRecord)) {
      errors.push(`${key} must contain objects`);
      return value.filter(isRecord);
    }

    return value;
  }

  private stringArrayField(record: Record<string, unknown>, key: string, errors: string[]): string[] {
    const value = record[key];
    if (!Array.isArray(value)) {
      errors.push(`${key} must be an array`);
      return [];
    }
    const strings = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    if (strings.length !== value.length) {
      errors.push(`${key} must contain non-empty strings`);
    }

    return strings.map((item) => item.trim());
  }

  private rejectGatekeeperOutcomeRedefinition(record: Record<string, unknown>, errors: string[], path = 'definition') {
    for (const [key, value] of Object.entries(record)) {
      if (key === 'gatekeeper_outcomes' || key === 'allowed_gatekeeper_outcomes' || key === 'outcomes') {
        errors.push(`${path}.${key} must not redefine Gatekeeper outcomes`);
      }
      if (FORBIDDEN_GATEKEEPER_OUTCOME_KEYS.has(key)) {
        errors.push(`${path}.${key} must not redefine a Gatekeeper outcome`);
      }
      if (typeof value === 'string' && FORBIDDEN_GATEKEEPER_OUTCOME_KEYS.has(value)) {
        errors.push(`${path}.${key} must not declare Gatekeeper outcome ${value}`);
      }
      if (isRecord(value)) {
        this.rejectGatekeeperOutcomeRedefinition(value, errors, `${path}.${key}`);
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (isRecord(item)) {
            this.rejectGatekeeperOutcomeRedefinition(item, errors, `${path}.${key}[${index}]`);
          }
          if (typeof item === 'string' && FORBIDDEN_GATEKEEPER_OUTCOME_KEYS.has(item)) {
            errors.push(`${path}.${key}[${index}] must not declare Gatekeeper outcome ${item}`);
          }
        });
      }
    }
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
