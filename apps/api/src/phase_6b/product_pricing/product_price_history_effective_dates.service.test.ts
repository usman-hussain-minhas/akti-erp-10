import assert from 'node:assert/strict';
import { Phase6BProductPriceHistoryEffectiveDatesService } from './product_price_history_effective_dates.service';

const service = new Phase6BProductPriceHistoryEffectiveDatesService();

const baseRequest = {
  organization_id: 'org_phase_6b',
  product_id: 'product_price_history_program',
  records: [
    {
      price_history_id: 'price_history_001',
      product_id: 'product_price_history_program',
      amount_minor_units: 100000,
      currency_code: 'USD',
      effective_from: '2026-01-01T00:00:00.000Z',
      effective_to: '2026-06-30T23:59:59.000Z',
      evidence_id: 'evidence_price_history_001',
    },
    {
      price_history_id: 'price_history_002',
      product_id: 'product_price_history_program',
      amount_minor_units: 110000,
      currency_code: 'USD',
      effective_from: '2026-07-01T00:00:00.000Z',
      evidence_id: 'evidence_price_history_002',
    },
  ],
  actor_user_id: 'user_pricing_admin',
  evidence_id: 'evidence_price_history_request',
  source_seed_id: 'seed_6b_02_product_price_history_effective_dates' as const,
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const validation = service.validateHistory(baseRequest);
assert.equal(validation.seed_id, 'seed_6b_02_product_price_history_effective_dates');
assert.equal(validation.component_id, '6B.02');
assert.equal(validation.module_key, 'phase-6b.product-pricing');
assert.equal(validation.record_count, 2);
assert.equal(validation.pricing_authority.canonical_price_history, true);
assert.equal(validation.pricing_authority.effective_date_ranges_required, true);
assert.equal(validation.pricing_authority.invoice_snapshot_required, true);
assert.equal(validation.pricing_authority.retroactive_invoice_mutation_allowed, false);
assert.equal(validation.lifecycle.activation_manifest_required, true);
assert.equal(validation.lifecycle.independent_foundry_activation, false);
assert.equal(validation.evidence.validation_event, 'PHASE_6B_PRODUCT_PRICE_HISTORY_EFFECTIVE_DATES_VALIDATED');

const resolved = service.resolvePriceAsOf({
  ...baseRequest,
  price_as_of: '2026-07-15T00:00:00.000Z',
});
assert.equal(resolved.active_price_history_id, 'price_history_002');
assert.equal(resolved.active_amount_minor_units, 110000);
assert.equal(resolved.active_currency_code, 'USD');

assert.throws(
  () =>
    service.validateHistory({
      ...baseRequest,
      records: [],
    }),
  /at least one record/,
);

assert.throws(
  () =>
    service.validateHistory({
      ...baseRequest,
      records: [
        baseRequest.records[0],
        {
          ...baseRequest.records[1],
          effective_from: '2026-06-01T00:00:00.000Z',
        },
      ],
    }),
  /must not overlap/,
);

assert.throws(
  () =>
    service.validateHistory({
      ...baseRequest,
      records: [
        {
          ...baseRequest.records[0],
          effective_to: '2025-12-31T00:00:00.000Z',
        },
      ],
    }),
  /effective_to must be on or after effective_from/,
);

assert.throws(
  () =>
    service.validateHistory({
      ...baseRequest,
      records: [
        {
          ...baseRequest.records[0],
          product_id: 'other_product',
        },
      ],
    }),
  /record product_id must match/,
);

assert.throws(
  () =>
    service.resolvePriceAsOf({
      ...baseRequest,
      price_as_of: '2025-01-01T00:00:00.000Z',
    }),
  /no active price/,
);

assert.throws(
  () =>
    service.validateHistory({
      ...baseRequest,
      invoice_snapshot_required: false,
    } as never),
  /invoice price snapshots/,
);

assert.throws(
  () =>
    service.validateHistory({
      ...baseRequest,
      retroactive_invoice_mutation_requested: 'mutate_old_invoice',
    } as never),
  /retroactive invoice mutation/,
);

console.log('P6B-FFET-016 product price history effective dates service test passed.');
