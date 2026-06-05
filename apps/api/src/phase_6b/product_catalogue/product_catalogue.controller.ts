import { Controller, Get } from '@nestjs/common';

import { ProductCatalogueService } from './product_catalogue.service';

@Controller('phase-6b/product-catalogue/scaffold')
export class ProductCatalogueController {
  constructor(private readonly product_catalogueService: ProductCatalogueService) {}

  @Get()
  getScaffoldMetadata() {
    return this.product_catalogueService.getScaffoldMetadata();
  }
}
