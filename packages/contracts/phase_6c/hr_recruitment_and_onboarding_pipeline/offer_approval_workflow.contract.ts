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
