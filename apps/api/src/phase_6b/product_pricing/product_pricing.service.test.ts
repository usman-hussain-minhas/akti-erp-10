import assert from 'node:assert/strict';

import { ProductPricingService } from './product_pricing.service';

const service = new ProductPricingService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.02');
assert.equal(metadata.component_key, 'product_pricing');
assert.equal(metadata.display_name, 'Product Pricing');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('product_pricing scaffold metadata boundary validated.');
