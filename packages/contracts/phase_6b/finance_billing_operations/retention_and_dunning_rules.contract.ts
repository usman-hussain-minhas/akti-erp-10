export type Phase6BDunningRuleKind = 'reminder' | 'final_notice' | 'retention_review' | 'restriction_review';

export type Phase6BDunningPolicyRule = {
  rule_id: string;
  kind: Phase6BDunningRuleKind;
  trigger_after_overdue_days: number;
  message_template_ref?: string;
  retention_offer_ref?: string;
};

export type Phase6BRetentionAndDunningInput = {
  organization_id: string;
  dunning_case_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  receivable_ref: string;
  invoice_ref: string;
  currency: string;
  outstanding_amount_minor: number;
  due_date: string;
  evaluation_date: string;
  policy_ref: string;
  policy_rules: Phase6BDunningPolicyRule[];
  previous_action_refs?: string[];
  requested_forbidden_action?:
    | 'send_communication'
    | 'collect_payment'
    | 'suspend_service'
    | 'purge_customer_data'
    | 'waive_debt'
    | 'post_journal'
    | 'irreversible_action';
};

export type Phase6BDunningRecommendedAction = {
  action_id: string;
  rule_id: string;
  kind: Phase6BDunningRuleKind;
  requires_gateway_send: boolean;
  requires_human_review: boolean;
  amount_minor: number;
  evidence_ref: string;
};

export type Phase6BRetentionAndDunningResult = {
  organization_id: string;
  dunning_case_ref: string;
  customer_ref: string;
  billing_account_ref: string;
  receivable_ref: string;
  invoice_ref: string;
  policy_ref: string;
  currency: string;
  outstanding_amount_minor: number;
  days_overdue: number;
  case_state: 'current_no_action' | 'monitor_grace' | 'action_recommended' | 'human_review_required';
  recommended_actions: Phase6BDunningRecommendedAction[];
  next_review_date: string;
  evidence: {
    seed_id: 'seed_6b_15_retention_and_dunning_rules';
    communication_gateway_required: true;
    irreversible_actions_blocked: true;
    digest: string;
    forbidden_behaviors_rejected: string[];
  };
};
