import { Controller, Get } from '@nestjs/common';

import { ProductPricingService } from './product_pricing.service';

@Controller('phase-6b/product-pricing/scaffold')
export class ProductPricingController {
  constructor(private readonly product_pricingService: ProductPricingService) {}

  @Get()
  getScaffoldMetadata() {
    return this.product_pricingService.getScaffoldMetadata();
  }
}
