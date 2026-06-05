import { Controller, Get } from '@nestjs/common';

import { BankingReconciliationService } from './banking_reconciliation.service';

@Controller('phase-6b/banking-reconciliation/scaffold')
export class BankingReconciliationController {
  constructor(private readonly banking_reconciliationService: BankingReconciliationService) {}

  @Get()
  getScaffoldMetadata() {
    return this.banking_reconciliationService.getScaffoldMetadata();
  }
}
