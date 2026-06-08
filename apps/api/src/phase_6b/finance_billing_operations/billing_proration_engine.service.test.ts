import assert from 'node:assert/strict';
import { calculatePhase6BBillingProration } from './billing_proration_engine.service';

const proration = calculatePhase6BBillingProration({
  organization_id: 'org_6b_proration',
  proration_ref: 'proration_upgrade_001',
  customer_ref: 'customer_acme',
  billing_account_ref: 'billing_account_acme',
  service_ref: 'service_core_subscription',
  current_pricing_ref: 'price_core_basic',
  replacement_pricing_ref: 'price_core_pro',
  usage_evidence_ref: 'usage_subscription_period_001',
  currency: 'PKR',
  period_start: '2026-06-01',
  period_end: '2026-07-01',
  change_effective_at: '2026-06-16',
  current_unit_amount_minor: 30000,
  replacement_unit_amount_minor: 60000,
  quantity: 1,
  tax_rate_bps: 1700,
  reason: 'upgrade',
});

assert.equal(proration.period_days, 30);
assert.equal(proration.remaining_days, 15);
assert.equal(proration.proration_ratio_bps, 5000);
assert.equal(proration.subtotal_delta_minor, 15000);
assert.equal(proration.tax_delta_minor, 2550);
assert.equal(proration.total_delta_minor, 17550);
assert.equal(proration.lines.length, 3);
assert.equal(proration.lines[0].amount_minor, -15000);
assert.equal(proration.lines[1].amount_minor, 30000);
assert.equal(proration.lines[2].amount_minor, 2550);
assert.equal(proration.evidence.seed_id, 'seed_6b_15_billing_proration_engine');
assert.equal(proration.evidence.pricing_authority, 'product_price_history_effective_dates');
assert.equal(proration.evidence.digest.length, 64);
assert.ok(proration.evidence.forbidden_behaviors_rejected.includes('generate_invoice'));
assert.ok(proration.evidence.forbidden_behaviors_rejected.includes('change_pricing_authority'));

const cancellation = calculatePhase6BBillingProration({
  organization_id: 'org_6b_proration',
  proration_ref: 'proration_cancel_001',
  customer_ref: 'customer_acme',
  billing_account_ref: 'billing_account_acme',
  service_ref: 'service_core_subscription',
  current_pricing_ref: 'price_core_pro',
  replacement_pricing_ref: 'price_cancelled',
  usage_evidence_ref: 'usage_subscription_period_002',
  currency: 'PKR',
  period_start: '2026-06-01',
  period_end: '2026-07-01',
  change_effective_at: '2026-06-16',
  current_unit_amount_minor: 60000,
  replacement_unit_amount_minor: 0,
  quantity: 1,
  reason: 'cancellation',
});

assert.equal(cancellation.subtotal_delta_minor, -30000);
assert.equal(cancellation.total_delta_minor, -30000);

assert.throws(
  () =>
    calculatePhase6BBillingProration({
      organization_id: 'org_6b_proration',
      proration_ref: 'proration_bad_action',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      service_ref: 'service_core_subscription',
      current_pricing_ref: 'price_core_basic',
      replacement_pricing_ref: 'price_core_pro',
      usage_evidence_ref: 'usage_subscription_period_001',
      currency: 'PKR',
      period_start: '2026-06-01',
      period_end: '2026-07-01',
      change_effective_at: '2026-06-16',
      current_unit_amount_minor: 30000,
      replacement_unit_amount_minor: 60000,
      quantity: 1,
      reason: 'upgrade',
      requested_forbidden_action: 'generate_invoice',
    }),
  /cannot generate invoices/,
);

assert.throws(
  () =>
    calculatePhase6BBillingProration({
      organization_id: 'org_6b_proration',
      proration_ref: 'proration_bad_effective',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      service_ref: 'service_core_subscription',
      current_pricing_ref: 'price_core_basic',
      replacement_pricing_ref: 'price_core_pro',
      usage_evidence_ref: 'usage_subscription_period_001',
      currency: 'PKR',
      period_start: '2026-06-01',
      period_end: '2026-07-01',
      change_effective_at: '2026-07-02',
      current_unit_amount_minor: 30000,
      replacement_unit_amount_minor: 60000,
      quantity: 1,
      reason: 'upgrade',
    }),
  /must fall inside the billing period/,
);

assert.throws(
  () =>
    calculatePhase6BBillingProration({
      organization_id: 'org_6b_proration',
      proration_ref: 'proration_bad_tax',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      service_ref: 'service_core_subscription',
      current_pricing_ref: 'price_core_basic',
      replacement_pricing_ref: 'price_core_pro',
      usage_evidence_ref: 'usage_subscription_period_001',
      currency: 'PKR',
      period_start: '2026-06-01',
      period_end: '2026-07-01',
      change_effective_at: '2026-06-16',
      current_unit_amount_minor: 30000,
      replacement_unit_amount_minor: 60000,
      quantity: 1,
      tax_rate_bps: 10001,
      reason: 'upgrade',
    }),
  /tax_rate_bps must be an integer between 0 and 10000/,
);

console.log('P6B-FFET-101 billing proration engine test passed.');
