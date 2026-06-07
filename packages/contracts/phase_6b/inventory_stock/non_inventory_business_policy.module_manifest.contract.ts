export const nonInventoryBusinessPolicyModuleManifest = {
  seed_id: 'seed_6b_03_non_inventory_business_policy',
  component_id: '6B.03',
  capability_surface: 'inventory_stock.non_inventory_business_policy',
  activation_lifecycle_required: true,
  product_record_authority_required: true,
  product_price_history_required: true,
  policy: {
    non_inventory_businesses: 'inventory_optional',
    retail_packages: 'inventory_required',
    ecommerce_packages: 'inventory_required',
    stock_tracking_requires_inventory: true,
  },
  forbidden_behaviors: [
    'provider_operation',
    'payment_allocation',
    'pricing_engine_execution',
    'frontend_screen',
    'shared_scaffold_mutation',
  ],
} as const;
