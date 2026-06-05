import { Injectable } from '@nestjs/common';

export type ProductCatalogueScaffoldMetadata = {
  phase: '6b';
  source_component_id: '6B.01';
  component_key: 'product_catalogue';
  display_name: 'Product Catalogue';
  scaffold_status: 'metadata_only';
  capability_implementation_authorized: false;
  ticket_generation_allowed: false;
};

export const ProductCatalogueScaffoldMetadata: ProductCatalogueScaffoldMetadata = {
  phase: '6b',
  source_component_id: '6B.01',
  component_key: 'product_catalogue',
  display_name: 'Product Catalogue',
  scaffold_status: 'metadata_only',
  capability_implementation_authorized: false,
  ticket_generation_allowed: false,
};

@Injectable()
export class ProductCatalogueService {
  getScaffoldMetadata(): ProductCatalogueScaffoldMetadata {
    return ProductCatalogueScaffoldMetadata;
  }
}
