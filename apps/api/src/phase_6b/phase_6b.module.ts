import { Module } from '@nestjs/common';

import { ProductCatalogueModule } from './product_catalogue/product_catalogue.module';
import { ProductPricingModule } from './product_pricing/product_pricing.module';
import { InventoryStockModule } from './inventory_stock/inventory_stock.module';
import { CrmLeadIntakeModule } from './crm_lead_intake/crm_lead_intake.module';
import { CrmDeduplicationModule } from './crm_deduplication/crm_deduplication.module';
import { CrmPipelineModule } from './crm_pipeline/crm_pipeline.module';
import { CrmCommunicationModule } from './crm_communication/crm_communication.module';
import { CrmScoringReportingModule } from './crm_scoring_reporting/crm_scoring_reporting.module';
import { FinanceInvoiceReceivablesModule } from './finance_invoice_receivables/finance_invoice_receivables.module';
import { PaymentCollectionTopupModule } from './payment_collection_topup/payment_collection_topup.module';
import { ExpensePurchaseVendorModule } from './expense_purchase_vendor/expense_purchase_vendor.module';
import { GeneralLedgerAccountingModule } from './general_ledger_accounting/general_ledger_accounting.module';
import { BankingReconciliationModule } from './banking_reconciliation/banking_reconciliation.module';
import { FinancePayrollFoundationModule } from './finance_payroll_foundation/finance_payroll_foundation.module';
import { FinanceBillingOperationsModule } from './finance_billing_operations/finance_billing_operations.module';

@Module({
  imports: [
  ProductCatalogueModule,
  ProductPricingModule,
  InventoryStockModule,
  CrmLeadIntakeModule,
  CrmDeduplicationModule,
  CrmPipelineModule,
  CrmCommunicationModule,
  CrmScoringReportingModule,
  FinanceInvoiceReceivablesModule,
  PaymentCollectionTopupModule,
  ExpensePurchaseVendorModule,
  GeneralLedgerAccountingModule,
  BankingReconciliationModule,
  FinancePayrollFoundationModule,
  FinanceBillingOperationsModule
  ],
  exports: [
  ProductCatalogueModule,
  ProductPricingModule,
  InventoryStockModule,
  CrmLeadIntakeModule,
  CrmDeduplicationModule,
  CrmPipelineModule,
  CrmCommunicationModule,
  CrmScoringReportingModule,
  FinanceInvoiceReceivablesModule,
  PaymentCollectionTopupModule,
  ExpensePurchaseVendorModule,
  GeneralLedgerAccountingModule,
  BankingReconciliationModule,
  FinancePayrollFoundationModule,
  FinanceBillingOperationsModule
  ],
})
export class Phase6BModule {}
