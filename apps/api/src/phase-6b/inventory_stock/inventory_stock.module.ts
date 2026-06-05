import { Module } from '@nestjs/common';

import { InventoryStockController } from './inventory_stock.controller';
import { InventoryStockService } from './inventory_stock.service';

@Module({
  controllers: [InventoryStockController],
  providers: [InventoryStockService],
  exports: [InventoryStockService],
})
export class InventoryStockModule {}
