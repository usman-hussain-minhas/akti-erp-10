import assert from 'node:assert/strict';

import { ProductCatalogueService } from './product_catalogue.service';

const service = new ProductCatalogueService();
const metadata = service.getScaffoldMetadata();

assert.equal(metadata.phase, '6b');
assert.equal(metadata.source_component_id, '6B.01');
assert.equal(metadata.component_key, 'product_catalogue');
assert.equal(metadata.display_name, 'Product Catalogue');
assert.equal(metadata.scaffold_status, 'metadata_only');
assert.equal(metadata.capability_implementation_authorized, false);
assert.equal(metadata.ticket_generation_allowed, false);

console.log('product_catalogue scaffold metadata boundary validated.');
