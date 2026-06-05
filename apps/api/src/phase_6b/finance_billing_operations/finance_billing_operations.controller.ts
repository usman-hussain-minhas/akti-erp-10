import { Controller, Get } from '@nestjs/common';

import { FinanceBillingOperationsService } from './finance_billing_operations.service';

@Controller('phase-6b/finance-billing-operations/scaffold')
export class FinanceBillingOperationsController {
  constructor(private readonly finance_billing_operationsService: FinanceBillingOperationsService) {}

  @Get()
  getScaffoldMetadata() {
    return this.finance_billing_operationsService.getScaffoldMetadata();
  }
}
