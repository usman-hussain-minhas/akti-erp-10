import { Module } from '@nestjs/common';

import { ProductPricingController } from './product_pricing.controller';
import { ProductPricingService } from './product_pricing.service';

@Module({
  controllers: [ProductPricingController],
  providers: [ProductPricingService],
  exports: [ProductPricingService],
})
export class ProductPricingModule {}
