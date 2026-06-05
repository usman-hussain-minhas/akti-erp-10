import { Module } from '@nestjs/common';

import { BankingReconciliationController } from './banking_reconciliation.controller';
import { BankingReconciliationService } from './banking_reconciliation.service';

@Module({
  controllers: [BankingReconciliationController],
  providers: [BankingReconciliationService],
  exports: [BankingReconciliationService],
})
export class BankingReconciliationModule {}
