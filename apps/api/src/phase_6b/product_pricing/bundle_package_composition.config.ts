export const phase6BBundlePackageCompositionSeedId = 'seed_6b_02_bundle_package_composition' as const;
export const phase6BBundlePackageCompositionComponentId = '6B.02' as const;
export const phase6BBundlePackageCompositionModuleKey = 'phase-6b.product-pricing' as const;

export interface Phase6BBundleComponentConfigInput {
  readonly component_product_id: string;
  readonly quantity: number;
  readonly component_price_history_id?: string;
  readonly evidence_id: string;
}

export interface Phase6BBundlePackageCompositionConfigInput {
  readonly organization_id: string;
  readonly bundle_product_id: string;
  readonly price_history_id: string;
  readonly source_seed_id?: typeof phase6BBundlePackageCompositionSeedId;
  readonly components: readonly Phase6BBundleComponentConfigInput[];
  readonly actor_user_id: string;
  readonly evidence_id: string;
  readonly invoice_snapshot_required: true;
  readonly independent_activation_requested?: boolean;
  readonly pricing_calculation_requested?: never;
}

export interface Phase6BBundleComponentDecision {
  readonly component_product_id: string;
  readonly quantity: number;
  readonly component_price_history_id: string | null;
  readonly evidence_id: string;
}

export interface Phase6BBundlePackageCompositionDecision {
  readonly seed_id: typeof phase6BBundlePackageCompositionSeedId;
  readonly component_id: typeof phase6BBundlePackageCompositionComponentId;
  readonly module_key: typeof phase6BBundlePackageCompositionModuleKey;
  readonly organization_id: string;
  readonly bundle_product_id: string;
  readonly price_history_id: string;
  readonly configuration_extension: true;
  readonly canonical_price_history_required: true;
  readonly invoice_snapshot_required: true;
  readonly independent_foundry_activation: false;
  readonly pricing_engine_implemented: false;
  readonly component_count: number;
  readonly components: readonly Phase6BBundleComponentDecision[];
  readonly evidence: {
    readonly actor_user_id: string;
    readonly evidence_id: string;
    readonly validation_event: 'PHASE_6B_BUNDLE_PACKAGE_COMPOSITION_CONFIG_VALIDATED';
  };
}

export class Phase6BBundlePackageCompositionConfig {
  validate(input: Phase6BBundlePackageCompositionConfigInput): Phase6BBundlePackageCompositionDecision {
    assertNonEmpty(input.organization_id, 'organization_id');
    assertNonEmpty(input.bundle_product_id, 'bundle_product_id');
    assertNonEmpty(input.price_history_id, 'price_history_id');
    assertNonEmpty(input.actor_user_id, 'actor_user_id');
    assertNonEmpty(input.evidence_id, 'evidence_id');

    if (input.source_seed_id !== undefined && input.source_seed_id !== phase6BBundlePackageCompositionSeedId) {
      throw new Error('Bundle package composition source_seed_id must match the FFET seed.');
    }

    if (input.components.length === 0) {
      throw new Error('Bundle package composition requires at least one component.');
    }

    if (input.invoice_snapshot_required !== true) {
      throw new Error('Bundle package composition requires immutable invoice price snapshots.');
    }

    if (input.independent_activation_requested === true) {
      throw new Error('Bundle package composition is a configuration extension and cannot request independent activation.');
    }

    if ('pricing_calculation_requested' in input) {
      throw new Error('Bundle package composition does not implement bundle pricing calculation.');
    }

    const componentProductIds = new Set<string>();
    for (const component of input.components) {
      assertNonEmpty(component.component_product_id, 'component_product_id');
      assertNonEmpty(component.evidence_id, 'component evidence_id');

      if (component.component_price_history_id !== undefined) {
        assertNonEmpty(component.component_price_history_id, 'component_price_history_id');
      }

      if (!Number.isInteger(component.quantity) || component.quantity < 1) {
        throw new Error('Bundle package composition quantity must be a positive integer.');
      }

      if (component.component_product_id === input.bundle_product_id) {
        throw new Error('Bundle package composition cannot directly include the bundle product as its own component.');
      }

      if (componentProductIds.has(component.component_product_id)) {
        throw new Error('Bundle package composition component_product_id values must be unique.');
      }

      componentProductIds.add(component.component_product_id);
    }

    return {
      seed_id: phase6BBundlePackageCompositionSeedId,
      component_id: phase6BBundlePackageCompositionComponentId,
      module_key: phase6BBundlePackageCompositionModuleKey,
      organization_id: input.organization_id,
      bundle_product_id: input.bundle_product_id,
      price_history_id: input.price_history_id,
      configuration_extension: true,
      canonical_price_history_required: true,
      invoice_snapshot_required: true,
      independent_foundry_activation: false,
      pricing_engine_implemented: false,
      component_count: input.components.length,
      components: input.components.map((component) => ({
        component_product_id: component.component_product_id,
        quantity: component.quantity,
        component_price_history_id: component.component_price_history_id ?? null,
        evidence_id: component.evidence_id,
      })),
      evidence: {
        actor_user_id: input.actor_user_id,
        evidence_id: input.evidence_id,
        validation_event: 'PHASE_6B_BUNDLE_PACKAGE_COMPOSITION_CONFIG_VALIDATED',
      },
    };
  }
}

function assertNonEmpty(value: string, fieldName: string): void {
  if (value.trim().length === 0) {
    throw new Error(`Bundle package composition requires ${fieldName}.`);
  }
}
