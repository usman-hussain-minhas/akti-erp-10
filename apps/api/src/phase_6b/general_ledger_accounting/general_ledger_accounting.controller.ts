import { Controller, Get } from '@nestjs/common';

import { GeneralLedgerAccountingService } from './general_ledger_accounting.service';

@Controller('phase-6b/general-ledger-accounting/scaffold')
export class GeneralLedgerAccountingController {
  constructor(private readonly general_ledger_accountingService: GeneralLedgerAccountingService) {}

  @Get()
  getScaffoldMetadata() {
    return this.general_ledger_accountingService.getScaffoldMetadata();
  }
}
