import assert from 'node:assert/strict';
import { Phase6BInstallmentPlanEngineService } from './installment_plan_engine.service';

const service = new Phase6BInstallmentPlanEngineService();

const baseRequest = {
  organization_id: 'org_phase_6b',
  product_id: 'product_installment_program',
  price_history_id: 'price_history_installment_2026_06',
  installment_plan_id: 'installment_plan_001',
  total_amount_minor_units: 90000,
  currency_code: 'USD',
  installments: [
    {
      installment_id: 'installment_001',
      sequence: 1,
      due_at: '2026-07-01T00:00:00.000Z',
      amount_minor_units: 30000,
      currency_code: 'USD',
      evidence_id: 'evidence_installment_001',
    },
    {
      installment_id: 'installment_002',
      sequence: 2,
      due_at: '2026-08-01T00:00:00.000Z',
      amount_minor_units: 30000,
      currency_code: 'USD',
      evidence_id: 'evidence_installment_002',
    },
    {
      installment_id: 'installment_003',
      sequence: 3,
      due_at: '2026-09-01T00:00:00.000Z',
      amount_minor_units: 30000,
      currency_code: 'USD',
      evidence_id: 'evidence_installment_003',
    },
  ],
  actor_user_id: 'user_pricing_admin',
  evidence_id: 'evidence_installment_plan_001',
  source_seed_id: 'seed_6b_02_installment_plan_engine' as const,
  invoice_snapshot_required: true as const,
  independent_activation_requested: false,
};

const receipt = service.validatePlan(baseRequest);
assert.equal(receipt.seed_id, 'seed_6b_02_installment_plan_engine');
assert.equal(receipt.component_id, '6B.02');
assert.equal(receipt.module_key, 'phase-6b.product-pricing');
assert.equal(receipt.installment_count, 3);
assert.equal(receipt.total_amount_minor_units, 90000);
assert.deepEqual(receipt.pricing_authority.adl_refs, ['ADL-013']);
assert.equal(receipt.pricing_authority.canonical_price_history_required, true);
assert.equal(receipt.pricing_authority.invoice_snapshot_required, true);
assert.equal(receipt.lifecycle.activation_manifest_required, true);
assert.equal(receipt.lifecycle.independent_foundry_activation, false);
assert.equal(receipt.non_scope_confirmation.payment_allocation_performed, false);
assert.equal(receipt.non_scope_confirmation.provider_charge_performed, false);
assert.equal(receipt.evidence.validation_event, 'PHASE_6B_INSTALLMENT_PLAN_VALIDATED');

assert.throws(
  () =>
    service.validatePlan({
      ...baseRequest,
      installments: [],
    }),
  /at least one installment/,
);

assert.throws(
  () =>
    service.validatePlan({
      ...baseRequest,
      total_amount_minor_units: 90001,
    }),
  /sum to total_amount_minor_units/,
);

assert.throws(
  () =>
    service.validatePlan({
      ...baseRequest,
      installments: [
        baseRequest.installments[0],
        {
          ...baseRequest.installments[1],
          sequence: 3,
        },
      ],
    }),
  /gapless/,
);

assert.throws(
  () =>
    service.validatePlan({
      ...baseRequest,
      installments: [
        baseRequest.installments[0],
        {
          ...baseRequest.installments[1],
          due_at: '2026-06-15T00:00:00.000Z',
        },
      ],
    }),
  /strictly increasing/,
);

assert.throws(
  () =>
    service.validatePlan({
      ...baseRequest,
      installments: [
        baseRequest.installments[0],
        {
          ...baseRequest.installments[1],
          currency_code: 'EUR',
        },
      ],
    }),
  /must match the plan currency_code/,
);

assert.throws(
  () =>
    service.validatePlan({
      ...baseRequest,
      invoice_snapshot_required: false,
    } as never),
  /invoice price snapshots/,
);

assert.throws(
  () =>
    service.validatePlan({
      ...baseRequest,
      payment_allocation_requested: 'allocate',
    } as never),
  /does not perform payment allocation/,
);

assert.throws(
  () =>
    service.validatePlan({
      ...baseRequest,
      provider_charge_requested: 'charge',
    } as never),
  /does not perform provider charging/,
);

console.log('P6B-FFET-013 installment plan engine service test passed.');
