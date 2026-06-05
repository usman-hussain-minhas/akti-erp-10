import { Controller, Get } from '@nestjs/common';

import { InventoryStockService } from './inventory_stock.service';

@Controller('phase-6b/inventory-stock/scaffold')
export class InventoryStockController {
  constructor(private readonly inventory_stockService: InventoryStockService) {}

  @Get()
  getScaffoldMetadata() {
    return this.inventory_stockService.getScaffoldMetadata();
  }
}
