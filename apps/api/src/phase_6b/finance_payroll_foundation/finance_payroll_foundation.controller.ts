import { Controller, Get } from '@nestjs/common';

import { FinancePayrollFoundationService } from './finance_payroll_foundation.service';

@Controller('phase-6b/finance-payroll-foundation/scaffold')
export class FinancePayrollFoundationController {
  constructor(private readonly finance_payroll_foundationService: FinancePayrollFoundationService) {}

  @Get()
  getScaffoldMetadata() {
    return this.finance_payroll_foundationService.getScaffoldMetadata();
  }
}
