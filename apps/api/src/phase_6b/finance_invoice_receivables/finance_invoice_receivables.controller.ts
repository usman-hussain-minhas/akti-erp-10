import { Controller, Get } from '@nestjs/common';

import { FinanceInvoiceReceivablesService } from './finance_invoice_receivables.service';

@Controller('phase-6b/finance-invoice-receivables/scaffold')
export class FinanceInvoiceReceivablesController {
  constructor(private readonly finance_invoice_receivablesService: FinanceInvoiceReceivablesService) {}

  @Get()
  getScaffoldMetadata() {
    return this.finance_invoice_receivablesService.getScaffoldMetadata();
  }
}
