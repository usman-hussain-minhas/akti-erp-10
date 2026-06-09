import { createHash } from 'node:crypto';

export const PHASE_6C_OFFER_APPROVAL_WORKFLOW_SEED_ID = 'seed_6c_015_offer_approval_workflow' as const;
export const PHASE_6C_OFFER_APPROVAL_WORKFLOW_COMPONENT_ID = '6C.02' as const;
export const OFFER_APPROVAL_WORKFLOW_RUNTIME_EVENT = 'phase_6c.hr_recruitment_and_onboarding_pipeline.offer_approval_workflow.evaluated' as const;

export type OfferApprovalConditionType = 'ALL_OFFERS' | 'COMPENSATION_AT_OR_ABOVE' | 'DEPARTMENT_MATCH' | 'EMPLOYMENT_TYPE_MATCH';
export type OfferApprovalAction = 'REQUIRE_HUMAN_APPROVAL' | 'REQUIRE_GATEKEEPER_REVIEW' | 'NOTIFY_ONLY';
export type OfferApprovalRouteStatus = 'APPROVAL_REQUIRED' | 'READY_WITH_CONFIGURED_NO_APPROVAL_MATCH';

export type OfferApprovalRule = {
  rule_code: string;
  label: string;
  order: number;
  condition_type: OfferApprovalConditionType;
  approval_action: OfferApprovalAction;
  approver_role_ref?: string;
  gatekeeper_policy_ref?: string;
  compensation_threshold_minor?: number;
  department_ref?: string;
  employment_type?: string;
  active: boolean;
};

export type OfferApprovalWorkflowInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  offer_ref: string;
  department_ref: string;
  employment_type: string;
  compensation_amount_minor: number;
  compensation_currency: string;
  configured_policy_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  approval_rules: readonly OfferApprovalRule[];
  access_provisioning_requested?: boolean;
  control_metadata?: Record<string, unknown>;
  hardcoded_rule_requested?: boolean;
  access_provisioning_without_gatekeeper_requested?: boolean;
  schema_mutation_requested?: boolean;
  phase_6a_mutation_requested?: boolean;
  phase_6b_mutation_requested?: boolean;
  runtime_adapter_requested?: boolean;
  ticket_flag_flip_requested?: boolean;
};

export type OfferApprovalMatchedRule = {
  rule_code: string;
  order: number;
  approval_action: OfferApprovalAction;
  approver_role_ref?: string;
  gatekeeper_policy_ref?: string;
};

export type OfferApprovalWorkflowReceipt = {
  seed_id: typeof PHASE_6C_OFFER_APPROVAL_WORKFLOW_SEED_ID;
  component_id: typeof PHASE_6C_OFFER_APPROVAL_WORKFLOW_COMPONENT_ID;
  component_slug: 'hr_recruitment_and_onboarding_pipeline';
  model_name: 'Phase6COfferApprovalWorkflow';
  event_name: typeof OFFER_APPROVAL_WORKFLOW_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  source_record_ref: string;
  applicant_ref: string;
  offer_ref: string;
  runtime_status: 'OFFER_APPROVAL_WORKFLOW_EVALUATED';
  route_status: OfferApprovalRouteStatus;
  configured_policy_ref: string;
  hardcoded_rules_allowed: false;
  access_provisioning_gatekeeper_required: boolean;
  access_provisioning_executed: false;
  schema_mutation_allowed: false;
  runtime_adapter_allowed: false;
  active_rule_count: number;
  matched_rules: readonly OfferApprovalMatchedRule[];
  approval_required_count: number;
  notification_only_count: number;
  decision_refs: readonly string[];
  evidence_artifacts: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  offer_approval_workflow_evidence_digest: string;
};

type OfferApprovalReceiptWithoutDigest = Omit<OfferApprovalWorkflowReceipt, 'offer_approval_workflow_evidence_digest'>;

const CONDITION_TYPES = new Set<OfferApprovalConditionType>(['ALL_OFFERS', 'COMPENSATION_AT_OR_ABOVE', 'DEPARTMENT_MATCH', 'EMPLOYMENT_TYPE_MATCH']);
const APPROVAL_ACTIONS = new Set<OfferApprovalAction>(['REQUIRE_HUMAN_APPROVAL', 'REQUIRE_GATEKEEPER_REVIEW', 'NOTIFY_ONLY']);
const POLICY_REF_PREFIX = 'offer_policy:';
const GATEKEEPER_POLICY_REF_PREFIX = 'gatekeeper_policy:';

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for offer_approval_workflow runtime.');
  }
  return value.trim();
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for offer_approval_workflow runtime.');
  }
  return normalized;
}

function requireNonNegativeInteger(value: number, field: string): number {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(field + ' must be a non-negative integer for offer_approval_workflow runtime.');
  }
  return value;
}

function rejectForbiddenRequests(input: OfferApprovalWorkflowInput): void {
  if (input.hardcoded_rule_requested === true) {
    throw new Error('offer_approval_workflow runtime must use configurable rules, not hardcoded approval thresholds.');
  }
  if (input.access_provisioning_without_gatekeeper_requested === true) {
    throw new Error('offer_approval_workflow runtime must route access provisioning through Gatekeeper.');
  }
  if (input.schema_mutation_requested === true) {
    throw new Error('offer_approval_workflow runtime must not mutate Prisma schema or migrations.');
  }
  if (input.phase_6a_mutation_requested === true) {
    throw new Error('offer_approval_workflow runtime must not mutate Phase 6A surfaces.');
  }
  if (input.phase_6b_mutation_requested === true) {
    throw new Error('offer_approval_workflow runtime must not mutate Phase 6B surfaces.');
  }
  if (input.runtime_adapter_requested === true) {
    throw new Error('offer_approval_workflow runtime must not execute runtime adapters.');
  }
  if (input.ticket_flag_flip_requested === true) {
    throw new Error('offer_approval_workflow runtime must not flip ticket or execution authorization flags.');
  }
}

function normalizeRules(rules: readonly OfferApprovalRule[]): OfferApprovalRule[] {
  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error('at least one configurable approval rule is required for offer_approval_workflow runtime.');
  }
  const ruleCodes = new Set<string>();
  const ruleOrders = new Set<number>();
  const normalized: OfferApprovalRule[] = [];

  for (const rule of rules) {
    const ruleCode = requireNonEmpty(rule.rule_code, 'rule_code');
    requireNonEmpty(rule.label, 'rule label');
    if (ruleCodes.has(ruleCode)) {
      throw new Error('rule_code must be unique for offer_approval_workflow runtime: ' + ruleCode);
    }
    ruleCodes.add(ruleCode);
    if (!Number.isInteger(rule.order) || rule.order <= 0) {
      throw new Error('rule order must be a positive integer for offer_approval_workflow runtime: ' + ruleCode);
    }
    if (ruleOrders.has(rule.order)) {
      throw new Error('rule order must be unique for offer_approval_workflow runtime: ' + rule.order);
    }
    ruleOrders.add(rule.order);
    if (!CONDITION_TYPES.has(rule.condition_type)) {
      throw new Error('condition_type is not supported for offer_approval_workflow runtime: ' + ruleCode);
    }
    if (!APPROVAL_ACTIONS.has(rule.approval_action)) {
      throw new Error('approval_action is not supported for offer_approval_workflow runtime: ' + ruleCode);
    }
    if (typeof rule.active !== 'boolean') {
      throw new Error('rule active flag must be boolean for offer_approval_workflow runtime: ' + ruleCode);
    }
    if ((rule.approval_action === 'REQUIRE_HUMAN_APPROVAL' || rule.approval_action === 'NOTIFY_ONLY') && rule.approver_role_ref !== undefined) {
      requireNonEmpty(rule.approver_role_ref, 'approver_role_ref');
    }
    if (rule.approval_action === 'REQUIRE_HUMAN_APPROVAL' && rule.approver_role_ref === undefined) {
      throw new Error('REQUIRE_HUMAN_APPROVAL rule requires approver_role_ref for offer_approval_workflow runtime: ' + ruleCode);
    }
    if (rule.approval_action === 'REQUIRE_GATEKEEPER_REVIEW') {
      const gatekeeperPolicyRef = requireNonEmpty(rule.gatekeeper_policy_ref, 'gatekeeper_policy_ref');
      if (!gatekeeperPolicyRef.startsWith(GATEKEEPER_POLICY_REF_PREFIX)) {
        throw new Error('gatekeeper_policy_ref must identify a Gatekeeper policy for offer_approval_workflow runtime: ' + ruleCode);
      }
    }
    if (rule.condition_type === 'COMPENSATION_AT_OR_ABOVE') {
      requireNonNegativeInteger(rule.compensation_threshold_minor ?? -1, 'compensation_threshold_minor');
    }
    if (rule.condition_type === 'DEPARTMENT_MATCH') {
      requireNonEmpty(rule.department_ref, 'department_ref');
    }
    if (rule.condition_type === 'EMPLOYMENT_TYPE_MATCH') {
      requireNonEmpty(rule.employment_type, 'employment_type');
    }
    normalized.push({ ...rule, rule_code: ruleCode });
  }

  if (normalized.every((rule) => !rule.active)) {
    throw new Error('at least one active approval rule is required for offer_approval_workflow runtime.');
  }

  return normalized.sort((a, b) => a.order - b.order);
}

function ruleMatches(rule: OfferApprovalRule, input: OfferApprovalWorkflowInput): boolean {
  if (!rule.active) {
    return false;
  }
  switch (rule.condition_type) {
    case 'ALL_OFFERS':
      return true;
    case 'COMPENSATION_AT_OR_ABOVE':
      return input.compensation_amount_minor >= (rule.compensation_threshold_minor ?? Number.POSITIVE_INFINITY);
    case 'DEPARTMENT_MATCH':
      return input.department_ref === rule.department_ref;
    case 'EMPLOYMENT_TYPE_MATCH':
      return input.employment_type === rule.employment_type;
  }
}

function digestReceipt(receiptWithoutDigest: OfferApprovalReceiptWithoutDigest): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluateOfferApprovalWorkflowRuntime(input: OfferApprovalWorkflowInput): OfferApprovalWorkflowReceipt {
  rejectForbiddenRequests(input);

  const organizationId = requireNonEmpty(input.organization_id, 'organization_id');
  const serviceManifestContractId = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const sourceRecordRef = requireNonEmpty(input.source_record_ref, 'source_record_ref');
  const applicantRef = requireNonEmpty(input.applicant_ref, 'applicant_ref');
  const offerRef = requireNonEmpty(input.offer_ref, 'offer_ref');
  requireNonEmpty(input.department_ref, 'department_ref');
  requireNonEmpty(input.employment_type, 'employment_type');
  requireNonNegativeInteger(input.compensation_amount_minor, 'compensation_amount_minor');
  requireNonEmpty(input.compensation_currency, 'compensation_currency');
  const configuredPolicyRef = requireNonEmpty(input.configured_policy_ref, 'configured_policy_ref');
  if (!configuredPolicyRef.startsWith(POLICY_REF_PREFIX)) {
    throw new Error('configured_policy_ref must identify a configurable offer policy for offer_approval_workflow runtime.');
  }
  const evaluatedByUserId = requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id');
  const evaluatedAt = requireTimestamp(input.evaluated_at, 'evaluated_at');
  const rules = normalizeRules(input.approval_rules);
  const activeRules = rules.filter((rule) => rule.active);
  const matchedRules: OfferApprovalMatchedRule[] = rules.filter((rule) => ruleMatches(rule, input)).map((rule) => ({
    rule_code: rule.rule_code,
    order: rule.order,
    approval_action: rule.approval_action,
    ...(rule.approver_role_ref === undefined ? {} : { approver_role_ref: rule.approver_role_ref.trim() }),
    ...(rule.gatekeeper_policy_ref === undefined ? {} : { gatekeeper_policy_ref: rule.gatekeeper_policy_ref.trim() }),
  }));
  const approvalRequiredCount = matchedRules.filter((rule) => rule.approval_action !== 'NOTIFY_ONLY').length;
  const notificationOnlyCount = matchedRules.filter((rule) => rule.approval_action === 'NOTIFY_ONLY').length;
  const accessProvisioningGatekeeperRequired = input.access_provisioning_requested === true || matchedRules.some((rule) => rule.approval_action === 'REQUIRE_GATEKEEPER_REVIEW');

  const receiptWithoutDigest: OfferApprovalReceiptWithoutDigest = {
    seed_id: PHASE_6C_OFFER_APPROVAL_WORKFLOW_SEED_ID,
    component_id: PHASE_6C_OFFER_APPROVAL_WORKFLOW_COMPONENT_ID,
    component_slug: 'hr_recruitment_and_onboarding_pipeline',
    model_name: 'Phase6COfferApprovalWorkflow',
    event_name: OFFER_APPROVAL_WORKFLOW_RUNTIME_EVENT,
    organization_id: organizationId,
    service_manifest_contract_id: serviceManifestContractId,
    source_record_ref: sourceRecordRef,
    applicant_ref: applicantRef,
    offer_ref: offerRef,
    runtime_status: 'OFFER_APPROVAL_WORKFLOW_EVALUATED',
    route_status: approvalRequiredCount > 0 ? 'APPROVAL_REQUIRED' : 'READY_WITH_CONFIGURED_NO_APPROVAL_MATCH',
    configured_policy_ref: configuredPolicyRef,
    hardcoded_rules_allowed: false,
    access_provisioning_gatekeeper_required: accessProvisioningGatekeeperRequired,
    access_provisioning_executed: false,
    schema_mutation_allowed: false,
    runtime_adapter_allowed: false,
    active_rule_count: activeRules.length,
    matched_rules: matchedRules,
    approval_required_count: approvalRequiredCount,
    notification_only_count: notificationOnlyCount,
    decision_refs: ['6C-RECRUIT-006'],
    evidence_artifacts: [
      'offer_approval_workflow_runtime_receipt',
      'offer_approval_workflow_validation_result',
      'offer_approval_workflow_forbidden_behavior_rejection_evidence',
    ],
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: evaluatedByUserId,
    evaluated_at: evaluatedAt,
  };

  return {
    ...receiptWithoutDigest,
    offer_approval_workflow_evidence_digest: digestReceipt(receiptWithoutDigest),
  };
}
