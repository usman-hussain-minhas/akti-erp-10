import { Module } from '@nestjs/common';

import { ExpensePurchaseVendorController } from './expense_purchase_vendor.controller';
import { ExpensePurchaseVendorService } from './expense_purchase_vendor.service';

@Module({
  controllers: [ExpensePurchaseVendorController],
  providers: [ExpensePurchaseVendorService],
  exports: [ExpensePurchaseVendorService],
})
export class ExpensePurchaseVendorModule {}
