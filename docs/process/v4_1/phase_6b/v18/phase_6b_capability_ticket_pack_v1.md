# Phase 6B v18 Production Capability Ticket Pack v1

Status: `PHASE_6B_V18_EXECUTABLE_TICKET_PACK_READY_FOR_FINAL_REVIEW`

Implementation is not stale by itself. Tickets become stale.
Apply maximum concrete capability within the approved scope of each ticket.

Ticket generation allowed: `false`.
Execution authorized: `false`.

## Counts

- Executable-review-ready capability tickets: `15`
- Blocked capability tickets: `0`
- Source seeds mapped: `103/103`
- Exact-file ownership overlaps: `0`

## Tickets

### P6B-CAP-001 - Implement Phase 6B Product Catalogue Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Product Catalogue Service exposes source-grounded tenant-scoped service behavior using Phase6BProduct, Phase6BProductCategory, Phase6BProductMedia, Phase6BProductHistory and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/product_catalogue.contract.ts`
- `packages/contracts/phase_6b/product_catalogue.module_manifest.contract.ts`
- `apps/api/src/phase_6b/product_catalogue/product_catalogue.controller.ts`
- `apps/api/src/phase_6b/product_catalogue/product_catalogue.service.ts`
- `apps/api/src/phase_6b/product_catalogue/product_catalogue.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/product_catalogue/product_catalogue.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-002 - Implement Phase 6B Pricing and Package Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Pricing and Package Service exposes source-grounded tenant-scoped service behavior using Phase6BProductPriceHistory, Phase6BPackageDefinition, Phase6BDiscountRule and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/product_pricing.contract.ts`
- `packages/contracts/phase_6b/product_pricing.module_manifest.contract.ts`
- `apps/api/src/phase_6b/product_pricing/product_pricing.controller.ts`
- `apps/api/src/phase_6b/product_pricing/product_pricing.service.ts`
- `apps/api/src/phase_6b/product_pricing/product_pricing.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/product_pricing/product_pricing.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-003 - Implement Phase 6B Inventory Stock Control Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Inventory Stock Control Service exposes source-grounded tenant-scoped service behavior using Phase6BInventoryLocation, Phase6BStockItem, Phase6BStockMovement and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/inventory_stock.contract.ts`
- `packages/contracts/phase_6b/inventory_stock.module_manifest.contract.ts`
- `apps/api/src/phase_6b/inventory_stock/inventory_stock.controller.ts`
- `apps/api/src/phase_6b/inventory_stock/inventory_stock.service.ts`
- `apps/api/src/phase_6b/inventory_stock/inventory_stock.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/inventory_stock/inventory_stock.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-004 - Implement Phase 6B CRM Lead Intake Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: CRM Lead Intake Service exposes source-grounded tenant-scoped service behavior using Phase6BLeadSource, Phase6BLeadEvidence and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/crm_lead_intake.contract.ts`
- `packages/contracts/phase_6b/crm_lead_intake.module_manifest.contract.ts`
- `apps/api/src/phase_6b/crm_lead_intake/crm_lead_intake.controller.ts`
- `apps/api/src/phase_6b/crm_lead_intake/crm_lead_intake.service.ts`
- `apps/api/src/phase_6b/crm_lead_intake/crm_lead_intake.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/crm_lead_intake/crm_lead_intake.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-005 - Implement Phase 6B CRM Deduplication Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: CRM Deduplication Service exposes source-grounded tenant-scoped service behavior using Phase6BLeadMatchCandidate, Phase6BLeadMergeRecord and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/crm_deduplication.contract.ts`
- `packages/contracts/phase_6b/crm_deduplication.module_manifest.contract.ts`
- `apps/api/src/phase_6b/crm_deduplication/crm_deduplication.controller.ts`
- `apps/api/src/phase_6b/crm_deduplication/crm_deduplication.service.ts`
- `apps/api/src/phase_6b/crm_deduplication/crm_deduplication.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/crm_deduplication/crm_deduplication.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-006 - Implement Phase 6B CRM Pipeline Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: CRM Pipeline Service exposes source-grounded tenant-scoped service behavior using Phase6BPipelineStage, Phase6BPipelineTimelineEntry and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/crm_pipeline.contract.ts`
- `packages/contracts/phase_6b/crm_pipeline.module_manifest.contract.ts`
- `apps/api/src/phase_6b/crm_pipeline/crm_pipeline.controller.ts`
- `apps/api/src/phase_6b/crm_pipeline/crm_pipeline.service.ts`
- `apps/api/src/phase_6b/crm_pipeline/crm_pipeline.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/crm_pipeline/crm_pipeline.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-007 - Implement Phase 6B Communication Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Communication Service exposes source-grounded tenant-scoped service behavior using Phase6BCommunicationTemplate, Phase6BCommunicationAttempt, Phase6BCommunicationSequenceEnrollment and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/crm_communication.contract.ts`
- `packages/contracts/phase_6b/crm_communication.module_manifest.contract.ts`
- `apps/api/src/phase_6b/crm_communication/crm_communication.controller.ts`
- `apps/api/src/phase_6b/crm_communication/crm_communication.service.ts`
- `apps/api/src/phase_6b/crm_communication/crm_communication.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/crm_communication/crm_communication.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-008 - Implement Phase 6B Lead Scoring and Reporting Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Lead Scoring and Reporting Service exposes source-grounded tenant-scoped service behavior using Phase6BLeadScore, Phase6BFollowUpTask and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/crm_scoring_reporting.contract.ts`
- `packages/contracts/phase_6b/crm_scoring_reporting.module_manifest.contract.ts`
- `apps/api/src/phase_6b/crm_scoring_reporting/crm_scoring_reporting.controller.ts`
- `apps/api/src/phase_6b/crm_scoring_reporting/crm_scoring_reporting.service.ts`
- `apps/api/src/phase_6b/crm_scoring_reporting/crm_scoring_reporting.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/crm_scoring_reporting/crm_scoring_reporting.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-009 - Implement Phase 6B Invoice and Receivables Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Invoice and Receivables Service exposes source-grounded tenant-scoped service behavior using Phase6BInvoice, Phase6BInvoiceLine, Phase6BReceivable, Phase6BCreditDebitNote and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/finance_invoice_receivables.contract.ts`
- `packages/contracts/phase_6b/finance_invoice_receivables.module_manifest.contract.ts`
- `apps/api/src/phase_6b/finance_invoice_receivables/finance_invoice_receivables.controller.ts`
- `apps/api/src/phase_6b/finance_invoice_receivables/finance_invoice_receivables.service.ts`
- `apps/api/src/phase_6b/finance_invoice_receivables/finance_invoice_receivables.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/finance_invoice_receivables/finance_invoice_receivables.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-010 - Implement Phase 6B Payment Collection and Top-Up Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Payment Collection and Top-Up Service exposes source-grounded tenant-scoped service behavior using Phase6BPayment, Phase6BPaymentAllocation, Phase6BReceipt, Phase6BTopUp, Phase6BReconciliationCandidate and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/payment_collection_topup.contract.ts`
- `packages/contracts/phase_6b/payment_collection_topup.module_manifest.contract.ts`
- `apps/api/src/phase_6b/payment_collection_topup/payment_collection_topup.controller.ts`
- `apps/api/src/phase_6b/payment_collection_topup/payment_collection_topup.service.ts`
- `apps/api/src/phase_6b/payment_collection_topup/payment_collection_topup.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/payment_collection_topup/payment_collection_topup.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-011 - Implement Phase 6B Expense, Purchase, and Vendor Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Expense, Purchase, and Vendor Service exposes source-grounded tenant-scoped service behavior using Phase6BVendor, Phase6BExpense, Phase6BPurchaseOrder, Phase6BPurchaseReceipt and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/expense_purchase_vendor.contract.ts`
- `packages/contracts/phase_6b/expense_purchase_vendor.module_manifest.contract.ts`
- `apps/api/src/phase_6b/expense_purchase_vendor/expense_purchase_vendor.controller.ts`
- `apps/api/src/phase_6b/expense_purchase_vendor/expense_purchase_vendor.service.ts`
- `apps/api/src/phase_6b/expense_purchase_vendor/expense_purchase_vendor.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/expense_purchase_vendor/expense_purchase_vendor.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-012 - Implement Phase 6B General Ledger Accounting Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: General Ledger Accounting Service exposes source-grounded tenant-scoped service behavior using Phase6BChartOfAccount, Phase6BJournalEntry, Phase6BJournalEntryLine, Phase6BAccountingPeriod, Phase6BTaxMapping and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/general_ledger_accounting.contract.ts`
- `packages/contracts/phase_6b/general_ledger_accounting.module_manifest.contract.ts`
- `apps/api/src/phase_6b/general_ledger_accounting/general_ledger_accounting.controller.ts`
- `apps/api/src/phase_6b/general_ledger_accounting/general_ledger_accounting.service.ts`
- `apps/api/src/phase_6b/general_ledger_accounting/general_ledger_accounting.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/general_ledger_accounting/general_ledger_accounting.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-013 - Implement Phase 6B Banking Reconciliation Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Banking Reconciliation Service exposes source-grounded tenant-scoped service behavior using Phase6BBankAccount, Phase6BBankTransaction, Phase6BReconciliationStatement and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/banking_reconciliation.contract.ts`
- `packages/contracts/phase_6b/banking_reconciliation.module_manifest.contract.ts`
- `apps/api/src/phase_6b/banking_reconciliation/banking_reconciliation.controller.ts`
- `apps/api/src/phase_6b/banking_reconciliation/banking_reconciliation.service.ts`
- `apps/api/src/phase_6b/banking_reconciliation/banking_reconciliation.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/banking_reconciliation/banking_reconciliation.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-014 - Implement Phase 6B Payroll Foundation Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Payroll Foundation Service exposes source-grounded tenant-scoped service behavior using Phase6BPayee, Phase6BPayrollBatch, Phase6BPayrollPayout and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/finance_payroll_foundation.contract.ts`
- `packages/contracts/phase_6b/finance_payroll_foundation.module_manifest.contract.ts`
- `apps/api/src/phase_6b/finance_payroll_foundation/finance_payroll_foundation.controller.ts`
- `apps/api/src/phase_6b/finance_payroll_foundation/finance_payroll_foundation.service.ts`
- `apps/api/src/phase_6b/finance_payroll_foundation/finance_payroll_foundation.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/finance_payroll_foundation/finance_payroll_foundation.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

### P6B-CAP-015 - Implement Phase 6B Billing UI and Operations Service capability surface

Status: `EXECUTABLE_REVIEW_READY`

Runtime MCR: Billing UI and Operations Service exposes source-grounded tenant-scoped service behavior using Phase6BBillingOperation, Phase6BBudgetCap and proves it with component service tests plus Phase 6B scaffold validation.

Exact files:
- `packages/contracts/phase_6b/finance_billing_operations.contract.ts`
- `packages/contracts/phase_6b/finance_billing_operations.module_manifest.contract.ts`
- `apps/api/src/phase_6b/finance_billing_operations/finance_billing_operations.controller.ts`
- `apps/api/src/phase_6b/finance_billing_operations/finance_billing_operations.service.ts`
- `apps/api/src/phase_6b/finance_billing_operations/finance_billing_operations.service.test.ts`

Validation commands:
- `pnpm contracts:validate`
- `pnpm --filter @akti/api typecheck`
- `pnpm --filter @akti/api exec tsx src/phase_6b/finance_billing_operations/finance_billing_operations.service.test.ts`
- `pnpm --filter @akti/api test:phase-6b-scaffold`
- `pnpm exec prisma validate --schema prisma/schema.prisma`
- `pnpm registry:check`
- `git diff --check`

