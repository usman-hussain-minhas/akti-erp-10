import { Module } from '@nestjs/common';

import { FinanceInvoiceReceivablesController } from './finance_invoice_receivables.controller';
import { FinanceInvoiceReceivablesService } from './finance_invoice_receivables.service';

@Module({
  controllers: [FinanceInvoiceReceivablesController],
  providers: [FinanceInvoiceReceivablesService],
  exports: [FinanceInvoiceReceivablesService],
})
export class FinanceInvoiceReceivablesModule {}
