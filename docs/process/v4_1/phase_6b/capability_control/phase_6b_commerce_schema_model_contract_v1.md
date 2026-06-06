# Phase 6B Commerce Schema Model Contract v1

Status: `P6B_SCHEMA_001_APPROVED_SCHEMA_BASELINE_INPUT`

This artifact is the output of `P6B-SCHEMA-001`. It defines the approved Phase 6B schema baseline input for `P6B-SCHEMA-002` without authorizing Phase 6B capability behavior.

Ticket generation remains forbidden: `false`.
Capability implementation remains authorized: `false`.

## Doctrine guardrails

Implementation is not stale by itself. Tickets become stale.
Apply maximum concrete capability within the approved scope of each ticket.

## Common model policy

- Every Phase 6B model is tenant scoped through `organization_id`.
- Every Phase 6B model must be represented in entity registry metadata.
- Every Phase 6B model must keep `tenant_scoped=true`, `organization_id_required=true`, `rls_required=true`, and `audit_required=true` in metadata.
- The baseline may create storage scaffolds, but it must not implement pricing engines, payment behavior, communication sending, inventory movement logic, GL posting, payroll calculation, or UI workflows.

## Component model groups

### 6B.01 - Product Catalogue

Module key: `phase-6b.product-catalogue`

Owned data: Products, categories, product media, product status, and product history.

Models:
- `Phase6BProduct`
- `Phase6BProductCategory`
- `Phase6BProductMedia`
- `Phase6BProductHistory`

### 6B.02 - Pricing and Package Service

Module key: `phase-6b.product-pricing`

Owned data: Product price histories, effective dates, package and bundle definitions, and pricing configuration extensions controlled through Product service.

Models:
- `Phase6BProductPriceHistory`
- `Phase6BPackageDefinition`
- `Phase6BDiscountRule`

### 6B.03 - Inventory Stock Control

Module key: `phase-6b.inventory-stock`

Owned data: Stock locations, lots/serials, stock levels, stock movements, and evidence references.

Models:
- `Phase6BInventoryLocation`
- `Phase6BStockItem`
- `Phase6BStockMovement`

### 6B.04 - CRM Lead Intake

Module key: `phase-6b.crm-lead-intake`

Owned data: Lead sources, intake mappings, consent basis, and intake evidence.

Models:
- `Phase6BLeadSource`
- `Phase6BLeadEvidence`

### 6B.05 - CRM Deduplication

Module key: `phase-6b.crm-deduplication`

Owned data: Duplicate match candidates, merge records, and duplicate decisions.

Models:
- `Phase6BLeadMatchCandidate`
- `Phase6BLeadMergeRecord`

### 6B.06 - CRM Pipeline

Module key: `phase-6b.crm-pipeline`

Owned data: Pipeline stages, activities, notes, timeline entries, and stage history.

Models:
- `Phase6BPipelineStage`
- `Phase6BPipelineTimelineEntry`

### 6B.07 - Communication

Module key: `phase-6b.crm-communication`

Owned data: Templates, sequence enrollments, conversation metadata, and send-attempt evidence with gateway enforcement for send attempts.

Models:
- `Phase6BCommunicationTemplate`
- `Phase6BCommunicationAttempt`
- `Phase6BCommunicationSequenceEnrollment`

### 6B.08 - Lead Scoring and Reporting

Module key: `phase-6b.crm-scoring-reporting`

Owned data: Lead scores, follow-up tasks, reporting definitions, and compliance views.

Models:
- `Phase6BLeadScore`
- `Phase6BFollowUpTask`

### 6B.09 - Invoice and Receivables

Module key: `phase-6b.finance-invoice-receivables`

Owned data: Invoices, invoice lines, receivables, payment terms, and credit/debit notes.

Models:
- `Phase6BInvoice`
- `Phase6BInvoiceLine`
- `Phase6BReceivable`
- `Phase6BCreditDebitNote`

### 6B.10 - Payment Collection and Top-Up

Module key: `phase-6b.payment-collection-topup`

Owned data: Payments, allocations, receipts, top-ups, provider references, callbacks, and reconciliation candidates.

Models:
- `Phase6BPayment`
- `Phase6BPaymentAllocation`
- `Phase6BReceipt`
- `Phase6BTopUp`
- `Phase6BReconciliationCandidate`

### 6B.11 - Expense, Purchase, and Vendor

Module key: `phase-6b.expense-purchase-vendor`

Owned data: Vendors, expenses, purchase orders, approvals, receipts, and purchase evidence.

Models:
- `Phase6BVendor`
- `Phase6BExpense`
- `Phase6BPurchaseOrder`
- `Phase6BPurchaseReceipt`

### 6B.12 - General Ledger Accounting

Module key: `phase-6b.general-ledger-accounting`

Owned data: Chart of accounts, journal entries, accounting periods, and tax mappings.

Models:
- `Phase6BChartOfAccount`
- `Phase6BJournalEntry`
- `Phase6BJournalEntryLine`
- `Phase6BAccountingPeriod`
- `Phase6BTaxMapping`

### 6B.13 - Banking Reconciliation

Module key: `phase-6b.banking-reconciliation`

Owned data: Bank accounts, imported transactions, matches, and reconciliation statements.

Models:
- `Phase6BBankAccount`
- `Phase6BBankTransaction`
- `Phase6BReconciliationStatement`

### 6B.14 - Payroll Foundation

Module key: `phase-6b.finance-payroll-foundation`

Owned data: Payees, payroll batches, payout records, deductions, and allowance formulas.

Models:
- `Phase6BPayee`
- `Phase6BPayrollBatch`
- `Phase6BPayrollPayout`

### 6B.15 - Billing UI and Operations

Module key: `phase-6b.finance-billing-operations`

Owned data: Tenant billing views, balance displays, budget caps, receipts, and service spend views.

Models:
- `Phase6BBillingOperation`
- `Phase6BBudgetCap`

## Validation expectations

- `P6B-SCHEMA-002` must add only additive Phase 6B schema baseline models and migration SQL.
- `P6B-SCHEMA-003` must align contracts/manifests/NestJS scaffold metadata without implementing business behavior.
- `P6B-SCHEMA-004` must regenerate v18 from live repo truth and promote only genuinely grounded capability tickets.

## Result

- Component groups: `15`
- Model names: `47`
- Seed coverage declared: `103`
- Capability implementation tickets authorized: `false`
- Ticket generation authorized: `false`
