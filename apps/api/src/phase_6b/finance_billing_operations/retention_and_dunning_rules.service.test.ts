import assert from 'node:assert/strict';
import { evaluatePhase6BRetentionAndDunningRules } from './retention_and_dunning_rules.service';

const policyRules = [
  {
    rule_id: 'day_03_reminder',
    kind: 'reminder' as const,
    trigger_after_overdue_days: 3,
    message_template_ref: 'template_payment_reminder',
  },
  {
    rule_id: 'day_10_final_notice',
    kind: 'final_notice' as const,
    trigger_after_overdue_days: 10,
    message_template_ref: 'template_final_notice',
  },
  {
    rule_id: 'day_15_retention_review',
    kind: 'retention_review' as const,
    trigger_after_overdue_days: 15,
    retention_offer_ref: 'retention_offer_installment_plan',
  },
  {
    rule_id: 'day_30_restriction_review',
    kind: 'restriction_review' as const,
    trigger_after_overdue_days: 30,
  },
];

const result = evaluatePhase6BRetentionAndDunningRules({
  organization_id: 'org_6b_dunning',
  dunning_case_ref: 'dunning_case_001',
  customer_ref: 'customer_acme',
  billing_account_ref: 'billing_account_acme',
  receivable_ref: 'receivable_001',
  invoice_ref: 'invoice_001',
  currency: 'PKR',
  outstanding_amount_minor: 250000,
  due_date: '2026-06-01',
  evaluation_date: '2026-06-18',
  policy_ref: 'policy_standard_billing_recovery',
  policy_rules: policyRules,
  previous_action_refs: ['day_03_reminder'],
});

assert.equal(result.days_overdue, 17);
assert.equal(result.case_state, 'human_review_required');
assert.equal(result.recommended_actions.length, 2);
assert.deepEqual(
  result.recommended_actions.map((action) => action.rule_id),
  ['day_10_final_notice', 'day_15_retention_review'],
);
assert.equal(result.recommended_actions[0].requires_gateway_send, true);
assert.equal(result.recommended_actions[1].requires_human_review, true);
assert.equal(result.next_review_date, '2026-07-01');
assert.equal(result.evidence.seed_id, 'seed_6b_15_retention_and_dunning_rules');
assert.equal(result.evidence.communication_gateway_required, true);
assert.equal(result.evidence.irreversible_actions_blocked, true);
assert.equal(result.evidence.digest.length, 64);
assert.ok(result.evidence.forbidden_behaviors_rejected.includes('send_communication'));
assert.ok(result.evidence.forbidden_behaviors_rejected.includes('purge_customer_data'));

const current = evaluatePhase6BRetentionAndDunningRules({
  organization_id: 'org_6b_dunning',
  dunning_case_ref: 'dunning_case_current',
  customer_ref: 'customer_acme',
  billing_account_ref: 'billing_account_acme',
  receivable_ref: 'receivable_002',
  invoice_ref: 'invoice_002',
  currency: 'PKR',
  outstanding_amount_minor: 0,
  due_date: '2026-06-01',
  evaluation_date: '2026-06-18',
  policy_ref: 'policy_standard_billing_recovery',
  policy_rules: policyRules,
});

assert.equal(current.case_state, 'current_no_action');
assert.equal(current.recommended_actions.length, 0);

assert.throws(
  () =>
    evaluatePhase6BRetentionAndDunningRules({
      organization_id: 'org_6b_dunning',
      dunning_case_ref: 'dunning_case_bad_action',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      receivable_ref: 'receivable_001',
      invoice_ref: 'invoice_001',
      currency: 'PKR',
      outstanding_amount_minor: 250000,
      due_date: '2026-06-01',
      evaluation_date: '2026-06-18',
      policy_ref: 'policy_standard_billing_recovery',
      policy_rules: policyRules,
      requested_forbidden_action: 'send_communication',
    }),
  /cannot send it/,
);

assert.throws(
  () =>
    evaluatePhase6BRetentionAndDunningRules({
      organization_id: 'org_6b_dunning',
      dunning_case_ref: 'dunning_case_bad_restriction',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      receivable_ref: 'receivable_001',
      invoice_ref: 'invoice_001',
      currency: 'PKR',
      outstanding_amount_minor: 250000,
      due_date: '2026-06-01',
      evaluation_date: '2026-06-18',
      policy_ref: 'policy_standard_billing_recovery',
      policy_rules: [
        {
          rule_id: 'restriction_without_notice',
          kind: 'restriction_review',
          trigger_after_overdue_days: 1,
        },
      ],
    }),
  /requires a prior reminder/,
);

assert.throws(
  () =>
    evaluatePhase6BRetentionAndDunningRules({
      organization_id: 'org_6b_dunning',
      dunning_case_ref: 'dunning_case_bad_template',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      receivable_ref: 'receivable_001',
      invoice_ref: 'invoice_001',
      currency: 'PKR',
      outstanding_amount_minor: 250000,
      due_date: '2026-06-01',
      evaluation_date: '2026-06-18',
      policy_ref: 'policy_standard_billing_recovery',
      policy_rules: [
        {
          rule_id: 'day_03_reminder',
          kind: 'reminder',
          trigger_after_overdue_days: 3,
        },
      ],
    }),
  /require message_template_ref/,
);

console.log('P6B-FFET-102 retention and dunning rules test passed.');
