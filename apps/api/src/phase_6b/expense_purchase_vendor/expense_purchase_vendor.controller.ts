import { Controller, Get } from '@nestjs/common';

import { ExpensePurchaseVendorService } from './expense_purchase_vendor.service';

@Controller('phase-6b/expense-purchase-vendor/scaffold')
export class ExpensePurchaseVendorController {
  constructor(private readonly expense_purchase_vendorService: ExpensePurchaseVendorService) {}

  @Get()
  getScaffoldMetadata() {
    return this.expense_purchase_vendorService.getScaffoldMetadata();
  }
}
