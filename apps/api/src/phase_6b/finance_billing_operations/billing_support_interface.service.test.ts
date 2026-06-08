import assert from 'node:assert/strict';
import { createPhase6BBillingSupportInterface } from './billing_support_interface.service';

const supportView = createPhase6BBillingSupportInterface({
  organization_id: 'org_6b_support',
  support_case_ref: 'support_case_001',
  support_window_ref: 'support_window_001',
  support_window_authorized_by_ref: 'support_manager_001',
  support_window_expires_at: '2026-06-08T12:00:00.000Z',
  evaluated_at: '2026-06-08T10:00:00.000Z',
  support_agent_ref: 'support_agent_001',
  customer_ref: 'customer_acme',
  billing_account_ref: 'billing_account_acme',
  support_reason: 'Customer asked for invoice and allocation explanation.',
  requested_view: 'invoice_detail',
  authorization_scopes: ['billing_support_read'],
  invoice_refs: ['invoice_001', 'invoice_001'],
  receivable_refs: ['receivable_001'],
  payment_allocation_refs: ['payment_allocation_001'],
  budget_cap_refs: ['budget_cap_001'],
});

assert.equal(supportView.access_state, 'authorized_read_only_support_window');
assert.deepEqual(supportView.visible_refs.invoice_refs, ['invoice_001']);
assert.equal(supportView.escalation_required, false);
assert.ok(supportView.redacted_fields.includes('provider_credentials'));
assert.ok(supportView.redacted_fields.includes('raw_webhook_payload'));
assert.ok(
  supportView.support_recommendations.includes(
    'Inspect immutable invoice snapshot and use adjustment or credit-note flow for correction requests.',
  ),
);
assert.equal(supportView.evidence.seed_id, 'seed_6b_15_billing_support_interface');
assert.equal(supportView.evidence.support_window_authorized_by_ref, 'support_manager_001');
assert.equal(supportView.evidence.digest.length, 64);
assert.ok(supportView.evidence.forbidden_behaviors_rejected.includes('collect_payment'));
assert.ok(supportView.evidence.forbidden_behaviors_rejected.includes('export_unredacted_data'));

const escalatedView = createPhase6BBillingSupportInterface({
  organization_id: 'org_6b_support',
  support_case_ref: 'support_case_002',
  support_window_ref: 'support_window_002',
  support_window_authorized_by_ref: 'support_manager_001',
  support_window_expires_at: '2026-06-08T12:00:00.000Z',
  evaluated_at: '2026-06-08T10:00:00.000Z',
  support_agent_ref: 'support_agent_001',
  customer_ref: 'customer_acme',
  billing_account_ref: 'billing_account_acme',
  support_reason: 'Customer asked about dunning state.',
  requested_view: 'dunning_history',
  authorization_scopes: ['billing_support_read'],
  dunning_case_refs: ['dunning_case_001'],
});

assert.equal(escalatedView.escalation_required, true);
assert.ok(escalatedView.support_recommendations.some((value) => value.includes('retention/dunning rules')));

assert.throws(
  () =>
    createPhase6BBillingSupportInterface({
      organization_id: 'org_6b_support',
      support_case_ref: 'support_case_bad_action',
      support_window_ref: 'support_window_001',
      support_window_authorized_by_ref: 'support_manager_001',
      support_window_expires_at: '2026-06-08T12:00:00.000Z',
      evaluated_at: '2026-06-08T10:00:00.000Z',
      support_agent_ref: 'support_agent_001',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      support_reason: 'Customer asked for invoice and allocation explanation.',
      requested_view: 'invoice_detail',
      authorization_scopes: ['billing_support_read'],
      invoice_refs: ['invoice_001'],
      requested_forbidden_action: 'collect_payment',
    }),
  /cannot collect payments/,
);

assert.throws(
  () =>
    createPhase6BBillingSupportInterface({
      organization_id: 'org_6b_support',
      support_case_ref: 'support_case_expired',
      support_window_ref: 'support_window_expired',
      support_window_authorized_by_ref: 'support_manager_001',
      support_window_expires_at: '2026-06-08T10:00:00.000Z',
      evaluated_at: '2026-06-08T10:00:00.000Z',
      support_agent_ref: 'support_agent_001',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      support_reason: 'Customer asked for invoice and allocation explanation.',
      requested_view: 'invoice_detail',
      authorization_scopes: ['billing_support_read'],
      invoice_refs: ['invoice_001'],
    }),
  /must be after evaluated_at/,
);

assert.throws(
  () =>
    createPhase6BBillingSupportInterface({
      organization_id: 'org_6b_support',
      support_case_ref: 'support_case_missing_scope',
      support_window_ref: 'support_window_001',
      support_window_authorized_by_ref: 'support_manager_001',
      support_window_expires_at: '2026-06-08T12:00:00.000Z',
      evaluated_at: '2026-06-08T10:00:00.000Z',
      support_agent_ref: 'support_agent_001',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      support_reason: 'Customer asked for invoice and allocation explanation.',
      requested_view: 'invoice_detail',
      authorization_scopes: ['billing_read_only'],
      invoice_refs: ['invoice_001'],
    }),
  /must include billing_support_read/,
);

assert.throws(
  () =>
    createPhase6BBillingSupportInterface({
      organization_id: 'org_6b_support',
      support_case_ref: 'support_case_no_refs',
      support_window_ref: 'support_window_001',
      support_window_authorized_by_ref: 'support_manager_001',
      support_window_expires_at: '2026-06-08T12:00:00.000Z',
      evaluated_at: '2026-06-08T10:00:00.000Z',
      support_agent_ref: 'support_agent_001',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      support_reason: 'Customer asked for invoice and allocation explanation.',
      requested_view: 'invoice_detail',
      authorization_scopes: ['billing_support_read'],
    }),
  /at least one billing artifact reference is required/,
);

console.log('P6B-FFET-103 billing support interface test passed.');
