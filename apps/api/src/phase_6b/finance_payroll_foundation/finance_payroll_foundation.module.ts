import { Module } from '@nestjs/common';

import { FinancePayrollFoundationController } from './finance_payroll_foundation.controller';
import { FinancePayrollFoundationService } from './finance_payroll_foundation.service';

@Module({
  controllers: [FinancePayrollFoundationController],
  providers: [FinancePayrollFoundationService],
  exports: [FinancePayrollFoundationService],
})
export class FinancePayrollFoundationModule {}
