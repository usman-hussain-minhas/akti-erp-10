import { Module } from '@nestjs/common';

import { FinanceBillingOperationsController } from './finance_billing_operations.controller';
import { FinanceBillingOperationsService } from './finance_billing_operations.service';

@Module({
  controllers: [FinanceBillingOperationsController],
  providers: [FinanceBillingOperationsService],
  exports: [FinanceBillingOperationsService],
})
export class FinanceBillingOperationsModule {}
