import { z } from 'zod';

export const phase6BBundlePackageCompositionSeedId = 'seed_6b_02_bundle_package_composition' as const;
export const phase6BBundlePackageCompositionComponentId = '6B.02' as const;
export const phase6BBundlePackageCompositionModuleKey = 'phase-6b.product-pricing' as const;

export const Phase6BBundleComponentSchema = z.object({
  component_product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  component_price_history_id: z.string().min(1).optional(),
  evidence_id: z.string().min(1),
});

export const Phase6BBundlePackageCompositionConfigSchema = z.object({
  organization_id: z.string().min(1),
  bundle_product_id: z.string().min(1),
  price_history_id: z.string().min(1),
  source_seed_id: z.literal(phase6BBundlePackageCompositionSeedId).optional(),
  components: z.array(Phase6BBundleComponentSchema).min(1),
  actor_user_id: z.string().min(1),
  evidence_id: z.string().min(1),
  invoice_snapshot_required: z.literal(true),
  independent_activation_requested: z.literal(false).optional(),
  pricing_calculation_requested: z.never().optional(),
});

export type Phase6BBundlePackageCompositionConfig = z.infer<typeof Phase6BBundlePackageCompositionConfigSchema>;
export type Phase6BBundleComponentConfig = z.infer<typeof Phase6BBundleComponentSchema>;

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

export function validatePhase6BBundlePackageCompositionConfig(
  input: unknown,
): Phase6BBundlePackageCompositionDecision {
  const parsed = Phase6BBundlePackageCompositionConfigSchema.parse(input);
  assertValidBundleComponents(parsed.bundle_product_id, parsed.components);

  return {
    seed_id: phase6BBundlePackageCompositionSeedId,
    component_id: phase6BBundlePackageCompositionComponentId,
    module_key: phase6BBundlePackageCompositionModuleKey,
    organization_id: parsed.organization_id,
    bundle_product_id: parsed.bundle_product_id,
    price_history_id: parsed.price_history_id,
    configuration_extension: true,
    canonical_price_history_required: true,
    invoice_snapshot_required: true,
    independent_foundry_activation: false,
    pricing_engine_implemented: false,
    component_count: parsed.components.length,
    components: parsed.components.map((component) => ({
      component_product_id: component.component_product_id,
      quantity: component.quantity,
      component_price_history_id: component.component_price_history_id ?? null,
      evidence_id: component.evidence_id,
    })),
    evidence: {
      actor_user_id: parsed.actor_user_id,
      evidence_id: parsed.evidence_id,
      validation_event: 'PHASE_6B_BUNDLE_PACKAGE_COMPOSITION_CONFIG_VALIDATED',
    },
  };
}

function assertValidBundleComponents(bundleProductId: string, components: readonly Phase6BBundleComponentConfig[]): void {
  const componentProductIds = new Set<string>();

  for (const component of components) {
    if (component.component_product_id === bundleProductId) {
      throw new Error('Bundle package composition cannot directly include the bundle product as its own component.');
    }

    if (componentProductIds.has(component.component_product_id)) {
      throw new Error('Bundle package composition component_product_id values must be unique.');
    }

    componentProductIds.add(component.component_product_id);
  }
}
