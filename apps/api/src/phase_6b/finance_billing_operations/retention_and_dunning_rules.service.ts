import { createHash } from 'node:crypto';

type Phase6BDunningRuleKind = 'reminder' | 'final_notice' | 'retention_review' | 'restriction_review';

type Phase6BForbiddenDunningAction =
  | 'send_communication'
  | 'collect_payment'
  | 'suspend_service'
  | 'purge_customer_data'
  | 'waive_debt'
  | 'post_journal'
  | 'irreversible_action';

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
  requested_forbidden_action?: Phase6BForbiddenDunningAction;
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
    forbidden_behaviors_rejected: Phase6BForbiddenDunningAction[];
  };
};

const dayMs = 24 * 60 * 60 * 1000;
const supportedCurrencies = new Set(['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR']);
const supportedRuleKinds = new Set<Phase6BDunningRuleKind>([
  'reminder',
  'final_notice',
  'retention_review',
  'restriction_review',
]);

const forbiddenActionReasons: Record<Phase6BForbiddenDunningAction, string> = {
  send_communication: 'Retention and dunning rules can recommend communication but cannot send it.',
  collect_payment: 'Retention and dunning rules cannot collect payments.',
  suspend_service: 'Retention and dunning rules cannot execute service suspension.',
  purge_customer_data: 'Retention and dunning rules cannot purge customer data.',
  waive_debt: 'Retention and dunning rules cannot waive debt.',
  post_journal: 'Retention and dunning rules cannot post general-ledger entries.',
  irreversible_action: 'Retention and dunning rules cannot perform irreversible customer-impacting actions.',
};

function requireNonEmpty(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required.`);
  }
}

function parseDate(value: string, field: string): number {
  requireNonEmpty(value, field);
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`${field} must be an ISO date.`);
  }
  return timestamp;
}

function addDays(timestamp: number, days: number): string {
  return new Date(timestamp + days * dayMs).toISOString().slice(0, 10);
}

function validatePolicyRules(rules: Phase6BDunningPolicyRule[]): Phase6BDunningPolicyRule[] {
  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error('policy_rules must contain at least one rule.');
  }
  const seen = new Set<string>();
  const sorted = [...rules].sort((a, b) => a.trigger_after_overdue_days - b.trigger_after_overdue_days);
  for (const rule of sorted) {
    requireNonEmpty(rule.rule_id, 'rule_id');
    if (seen.has(rule.rule_id)) {
      throw new Error(`duplicate policy rule_id ${rule.rule_id}.`);
    }
    seen.add(rule.rule_id);
    if (!supportedRuleKinds.has(rule.kind)) {
      throw new Error(`unsupported dunning rule kind ${rule.kind}.`);
    }
    if (!Number.isInteger(rule.trigger_after_overdue_days) || rule.trigger_after_overdue_days < 0) {
      throw new Error('trigger_after_overdue_days must be a non-negative integer.');
    }
    if ((rule.kind === 'reminder' || rule.kind === 'final_notice') && !rule.message_template_ref) {
      throw new Error(`${rule.kind} rules require message_template_ref for gateway-controlled sending.`);
    }
    if (rule.kind === 'retention_review' && !rule.retention_offer_ref) {
      throw new Error('retention_review rules require retention_offer_ref.');
    }
  }

  const firstRestriction = sorted.find((rule) => rule.kind === 'restriction_review');
  if (firstRestriction) {
    const priorNotice = sorted.some(
      (rule) =>
        rule.trigger_after_overdue_days < firstRestriction.trigger_after_overdue_days &&
        (rule.kind === 'reminder' || rule.kind === 'final_notice' || rule.kind === 'retention_review'),
    );
    if (!priorNotice) {
      throw new Error('restriction_review requires a prior reminder, final notice, or retention review rule.');
    }
  }
  return sorted;
}

function buildDigest(result: Omit<Phase6BRetentionAndDunningResult, 'evidence'>): string {
  return createHash('sha256').update(JSON.stringify(result)).digest('hex');
}

function actionRequiresGateway(kind: Phase6BDunningRuleKind): boolean {
  return kind === 'reminder' || kind === 'final_notice';
}

function actionRequiresHumanReview(kind: Phase6BDunningRuleKind): boolean {
  return kind === 'retention_review' || kind === 'restriction_review';
}

export function evaluatePhase6BRetentionAndDunningRules(
  input: Phase6BRetentionAndDunningInput,
): Phase6BRetentionAndDunningResult {
  if (input.requested_forbidden_action) {
    throw new Error(forbiddenActionReasons[input.requested_forbidden_action]);
  }

  requireNonEmpty(input.organization_id, 'organization_id');
  requireNonEmpty(input.dunning_case_ref, 'dunning_case_ref');
  requireNonEmpty(input.customer_ref, 'customer_ref');
  requireNonEmpty(input.billing_account_ref, 'billing_account_ref');
  requireNonEmpty(input.receivable_ref, 'receivable_ref');
  requireNonEmpty(input.invoice_ref, 'invoice_ref');
  requireNonEmpty(input.currency, 'currency');
  requireNonEmpty(input.policy_ref, 'policy_ref');
  if (!supportedCurrencies.has(input.currency)) {
    throw new Error('currency must be a supported ISO currency for the Phase 6B billing baseline.');
  }
  if (!Number.isInteger(input.outstanding_amount_minor) || input.outstanding_amount_minor < 0) {
    throw new Error('outstanding_amount_minor must be a non-negative integer minor-unit amount.');
  }

  const dueTimestamp = parseDate(input.due_date, 'due_date');
  const evaluationTimestamp = parseDate(input.evaluation_date, 'evaluation_date');
  const daysOverdue = Math.max(0, Math.floor((evaluationTimestamp - dueTimestamp) / dayMs));
  const rules = validatePolicyRules(input.policy_rules);
  const previousActionRefs = new Set(input.previous_action_refs ?? []);

  const eligibleRules = input.outstanding_amount_minor === 0
    ? []
    : rules.filter((rule) => rule.trigger_after_overdue_days <= daysOverdue && !previousActionRefs.has(rule.rule_id));

  const recommendedActions: Phase6BDunningRecommendedAction[] = eligibleRules.map((rule) => ({
    action_id: `${input.dunning_case_ref}:${rule.rule_id}`,
    rule_id: rule.rule_id,
    kind: rule.kind,
    requires_gateway_send: actionRequiresGateway(rule.kind),
    requires_human_review: actionRequiresHumanReview(rule.kind),
    amount_minor: input.outstanding_amount_minor,
    evidence_ref: input.receivable_ref,
  }));

  let caseState: Phase6BRetentionAndDunningResult['case_state'] = 'current_no_action';
  if (input.outstanding_amount_minor > 0 && daysOverdue === 0) {
    caseState = 'monitor_grace';
  } else if (recommendedActions.some((action) => action.requires_human_review)) {
    caseState = 'human_review_required';
  } else if (recommendedActions.length > 0) {
    caseState = 'action_recommended';
  } else if (input.outstanding_amount_minor > 0) {
    caseState = 'monitor_grace';
  }

  const nextRule = rules.find(
    (rule) => rule.trigger_after_overdue_days > daysOverdue && !previousActionRefs.has(rule.rule_id),
  );
  const nextReviewDate = nextRule ? addDays(dueTimestamp, nextRule.trigger_after_overdue_days) : addDays(evaluationTimestamp, 1);

  const resultWithoutEvidence = {
    organization_id: input.organization_id,
    dunning_case_ref: input.dunning_case_ref,
    customer_ref: input.customer_ref,
    billing_account_ref: input.billing_account_ref,
    receivable_ref: input.receivable_ref,
    invoice_ref: input.invoice_ref,
    policy_ref: input.policy_ref,
    currency: input.currency,
    outstanding_amount_minor: input.outstanding_amount_minor,
    days_overdue: daysOverdue,
    case_state: caseState,
    recommended_actions: recommendedActions,
    next_review_date: nextReviewDate,
  };

  return {
    ...resultWithoutEvidence,
    evidence: {
      seed_id: 'seed_6b_15_retention_and_dunning_rules',
      communication_gateway_required: true,
      irreversible_actions_blocked: true,
      digest: buildDigest(resultWithoutEvidence),
      forbidden_behaviors_rejected: Object.keys(forbiddenActionReasons) as Phase6BForbiddenDunningAction[],
    },
  };
}
