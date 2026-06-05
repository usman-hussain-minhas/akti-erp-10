import { Module } from '@nestjs/common';

import { GeneralLedgerAccountingController } from './general_ledger_accounting.controller';
import { GeneralLedgerAccountingService } from './general_ledger_accounting.service';

@Module({
  controllers: [GeneralLedgerAccountingController],
  providers: [GeneralLedgerAccountingService],
  exports: [GeneralLedgerAccountingService],
})
export class GeneralLedgerAccountingModule {}
