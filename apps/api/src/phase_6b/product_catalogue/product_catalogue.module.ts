import { Module } from '@nestjs/common';

import { ProductCatalogueController } from './product_catalogue.controller';
import { ProductCatalogueService } from './product_catalogue.service';

@Module({
  controllers: [ProductCatalogueController],
  providers: [ProductCatalogueService],
  exports: [ProductCatalogueService],
})
export class ProductCatalogueModule {}
