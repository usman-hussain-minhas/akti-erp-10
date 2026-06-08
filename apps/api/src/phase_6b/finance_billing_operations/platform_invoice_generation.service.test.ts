import assert from 'node:assert/strict';
import { generatePhase6BPlatformInvoice } from './platform_invoice_generation.service';

const invoice = generatePhase6BPlatformInvoice({
  organization_id: 'org_6b_invoice',
  invoice_ref: 'inv_2026_0001',
  customer_ref: 'customer_acme',
  billing_account_ref: 'billing_account_acme',
  pricing_table_ref: 'pricing_table_2026_q2',
  payment_allocation_ref: 'payment_allocation_pending',
  chart_version_ref: 'chart_version_2026_q2',
  currency: 'PKR',
  issue_date: '2026-06-08',
  due_date: '2026-06-30',
  generated_at: '2026-06-08T00:00:00.000Z',
  lines: [
    {
      line_id: 'line_subscription',
      service_ref: 'service_core_subscription',
      pricing_ref: 'price_core_subscription',
      usage_evidence_ref: 'usage_core_subscription_001',
      description: 'Core subscription charge',
      kind: 'subscription',
      quantity: 2,
      unit_amount_minor: 10000,
      tax_rate_bps: 1700,
      discount_amount_minor: 1000,
    },
    {
      line_id: 'line_usage',
      service_ref: 'service_usage_meter',
      pricing_ref: 'price_usage_meter',
      usage_evidence_ref: 'usage_meter_001',
      description: 'Usage charge',
      kind: 'usage',
      quantity: 3,
      unit_amount_minor: 2500,
      tax_rate_bps: 0,
    },
  ],
});

assert.equal(invoice.status, 'generated_immutable_snapshot');
assert.equal(invoice.subtotal_minor, 27500);
assert.equal(invoice.discount_total_minor, 1000);
assert.equal(invoice.tax_total_minor, 3230);
assert.equal(invoice.grand_total_minor, 29730);
assert.equal(invoice.line_count, 2);
assert.deepEqual(invoice.immutable_snapshot.usage_evidence_refs, [
  'usage_core_subscription_001',
  'usage_meter_001',
]);
assert.equal(invoice.immutable_snapshot.snapshot_digest.length, 64);
assert.equal(invoice.evidence.seed_id, 'seed_6b_15_platform_invoice_generation');
assert.ok(invoice.evidence.forbidden_behaviors_rejected.includes('collect_payment'));
assert.ok(invoice.evidence.forbidden_behaviors_rejected.includes('mutate_final_invoice'));

assert.throws(
  () =>
    generatePhase6BPlatformInvoice({
      organization_id: 'org_6b_invoice',
      invoice_ref: 'inv_bad',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      pricing_table_ref: 'pricing_table_2026_q2',
      chart_version_ref: 'chart_version_2026_q2',
      currency: 'PKR',
      issue_date: '2026-06-08',
      due_date: '2026-06-30',
      requested_forbidden_action: 'collect_payment',
      lines: [
        {
          line_id: 'line_1',
          service_ref: 'service_core_subscription',
          pricing_ref: 'price_core_subscription',
          usage_evidence_ref: 'usage_core_subscription_001',
          description: 'Core subscription charge',
          kind: 'subscription',
          quantity: 1,
          unit_amount_minor: 10000,
        },
      ],
    }),
  /cannot collect payment/,
);

assert.throws(
  () =>
    generatePhase6BPlatformInvoice({
      organization_id: 'org_6b_invoice',
      invoice_ref: 'inv_bad_due_date',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      pricing_table_ref: 'pricing_table_2026_q2',
      chart_version_ref: 'chart_version_2026_q2',
      currency: 'PKR',
      issue_date: '2026-06-30',
      due_date: '2026-06-08',
      lines: [
        {
          line_id: 'line_1',
          service_ref: 'service_core_subscription',
          pricing_ref: 'price_core_subscription',
          usage_evidence_ref: 'usage_core_subscription_001',
          description: 'Core subscription charge',
          kind: 'subscription',
          quantity: 1,
          unit_amount_minor: 10000,
        },
      ],
    }),
  /due_date cannot be before issue_date/,
);

assert.throws(
  () =>
    generatePhase6BPlatformInvoice({
      organization_id: 'org_6b_invoice',
      invoice_ref: 'inv_duplicate_line',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      pricing_table_ref: 'pricing_table_2026_q2',
      chart_version_ref: 'chart_version_2026_q2',
      currency: 'PKR',
      issue_date: '2026-06-08',
      due_date: '2026-06-30',
      lines: [
        {
          line_id: 'line_1',
          service_ref: 'service_core_subscription',
          pricing_ref: 'price_core_subscription',
          usage_evidence_ref: 'usage_core_subscription_001',
          description: 'Core subscription charge',
          kind: 'subscription',
          quantity: 1,
          unit_amount_minor: 10000,
        },
        {
          line_id: 'line_1',
          service_ref: 'service_usage_meter',
          pricing_ref: 'price_usage_meter',
          usage_evidence_ref: 'usage_meter_001',
          description: 'Usage charge',
          kind: 'usage',
          quantity: 1,
          unit_amount_minor: 10000,
        },
      ],
    }),
  /duplicate invoice line_id line_1/,
);

assert.throws(
  () =>
    generatePhase6BPlatformInvoice({
      organization_id: 'org_6b_invoice',
      invoice_ref: 'inv_bad_discount',
      customer_ref: 'customer_acme',
      billing_account_ref: 'billing_account_acme',
      pricing_table_ref: 'pricing_table_2026_q2',
      chart_version_ref: 'chart_version_2026_q2',
      currency: 'PKR',
      issue_date: '2026-06-08',
      due_date: '2026-06-30',
      lines: [
        {
          line_id: 'line_1',
          service_ref: 'service_core_subscription',
          pricing_ref: 'price_core_subscription',
          usage_evidence_ref: 'usage_core_subscription_001',
          description: 'Core subscription charge',
          kind: 'subscription',
          quantity: 1,
          unit_amount_minor: 10000,
          discount_amount_minor: 10001,
        },
      ],
    }),
  /discount_amount_minor cannot exceed/,
);

console.log('P6B-FFET-100 platform invoice generation test passed.');
