-- CreateTable
CREATE TABLE "Phase6BProduct" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BProductCategory" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BProductMedia" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "product_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BProductMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BProductHistory" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "product_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BProductHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BProductPriceHistory" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "product_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BProductPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPackageDefinition" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPackageDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BDiscountRule" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BDiscountRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BInventoryLocation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BInventoryLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BStockItem" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "product_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BStockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BStockMovement" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "stock_item_id" TEXT,
    "inventory_location_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BStockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BLeadSource" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BLeadSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BLeadEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BLeadEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BLeadMatchCandidate" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BLeadMatchCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BLeadMergeRecord" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BLeadMergeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPipelineStage" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPipelineTimelineEntry" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPipelineTimelineEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BCommunicationTemplate" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BCommunicationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BCommunicationAttempt" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "template_id" TEXT,
    "sequence_enrollment_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BCommunicationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BCommunicationSequenceEnrollment" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BCommunicationSequenceEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BLeadScore" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BLeadScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BFollowUpTask" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BFollowUpTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BInvoice" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BInvoiceLine" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "product_id" TEXT,
    "price_history_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BInvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BReceivable" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BReceivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BCreditDebitNote" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BCreditDebitNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPayment" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPaymentAllocation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "invoice_id" TEXT,
    "receivable_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BReceipt" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BTopUp" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BTopUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BReconciliationCandidate" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "bank_transaction_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BReconciliationCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BVendor" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BVendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BExpense" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "vendor_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPurchaseOrder" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "vendor_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPurchaseReceipt" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "purchase_order_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPurchaseReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BChartOfAccount" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BChartOfAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BJournalEntry" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BJournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BJournalEntryLine" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "journal_entry_id" TEXT,
    "chart_of_account_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BJournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BAccountingPeriod" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BAccountingPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BTaxMapping" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BTaxMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BBankAccount" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BBankTransaction" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "bank_account_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BBankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BReconciliationStatement" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "bank_account_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BReconciliationStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPayee" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPayee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPayrollBatch" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPayrollBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BPayrollPayout" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "payroll_batch_id" TEXT,
    "payee_id" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BPayrollPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BBillingOperation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BBillingOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase6BBudgetCap" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Phase6BBudgetCap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Phase6BProduct_organization_id_idx" ON "Phase6BProduct"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BProduct_organization_id_source_seed_id_idx" ON "Phase6BProduct"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BProduct_organization_id_id_key" ON "Phase6BProduct"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BProductCategory_organization_id_idx" ON "Phase6BProductCategory"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BProductCategory_organization_id_source_seed_id_idx" ON "Phase6BProductCategory"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BProductCategory_organization_id_id_key" ON "Phase6BProductCategory"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BProductMedia_organization_id_idx" ON "Phase6BProductMedia"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BProductMedia_organization_id_source_seed_id_idx" ON "Phase6BProductMedia"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BProductMedia_organization_id_product_id_idx" ON "Phase6BProductMedia"("organization_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BProductMedia_organization_id_id_key" ON "Phase6BProductMedia"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BProductHistory_organization_id_idx" ON "Phase6BProductHistory"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BProductHistory_organization_id_source_seed_id_idx" ON "Phase6BProductHistory"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BProductHistory_organization_id_product_id_idx" ON "Phase6BProductHistory"("organization_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BProductHistory_organization_id_id_key" ON "Phase6BProductHistory"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BProductPriceHistory_organization_id_idx" ON "Phase6BProductPriceHistory"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BProductPriceHistory_organization_id_source_seed_id_idx" ON "Phase6BProductPriceHistory"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BProductPriceHistory_organization_id_product_id_idx" ON "Phase6BProductPriceHistory"("organization_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BProductPriceHistory_organization_id_id_key" ON "Phase6BProductPriceHistory"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPackageDefinition_organization_id_idx" ON "Phase6BPackageDefinition"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPackageDefinition_organization_id_source_seed_id_idx" ON "Phase6BPackageDefinition"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPackageDefinition_organization_id_id_key" ON "Phase6BPackageDefinition"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BDiscountRule_organization_id_idx" ON "Phase6BDiscountRule"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BDiscountRule_organization_id_source_seed_id_idx" ON "Phase6BDiscountRule"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BDiscountRule_organization_id_id_key" ON "Phase6BDiscountRule"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BInventoryLocation_organization_id_idx" ON "Phase6BInventoryLocation"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BInventoryLocation_organization_id_source_seed_id_idx" ON "Phase6BInventoryLocation"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BInventoryLocation_organization_id_id_key" ON "Phase6BInventoryLocation"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BStockItem_organization_id_idx" ON "Phase6BStockItem"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BStockItem_organization_id_source_seed_id_idx" ON "Phase6BStockItem"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BStockItem_organization_id_product_id_idx" ON "Phase6BStockItem"("organization_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BStockItem_organization_id_id_key" ON "Phase6BStockItem"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BStockMovement_organization_id_idx" ON "Phase6BStockMovement"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BStockMovement_organization_id_source_seed_id_idx" ON "Phase6BStockMovement"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BStockMovement_organization_id_stock_item_id_idx" ON "Phase6BStockMovement"("organization_id", "stock_item_id");

-- CreateIndex
CREATE INDEX "Phase6BStockMovement_organization_id_inventory_location_id_idx" ON "Phase6BStockMovement"("organization_id", "inventory_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BStockMovement_organization_id_id_key" ON "Phase6BStockMovement"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BLeadSource_organization_id_idx" ON "Phase6BLeadSource"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadSource_organization_id_source_seed_id_idx" ON "Phase6BLeadSource"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BLeadSource_organization_id_id_key" ON "Phase6BLeadSource"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BLeadEvidence_organization_id_idx" ON "Phase6BLeadEvidence"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadEvidence_organization_id_source_seed_id_idx" ON "Phase6BLeadEvidence"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadEvidence_organization_id_lead_id_idx" ON "Phase6BLeadEvidence"("organization_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BLeadEvidence_organization_id_id_key" ON "Phase6BLeadEvidence"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BLeadMatchCandidate_organization_id_idx" ON "Phase6BLeadMatchCandidate"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadMatchCandidate_organization_id_source_seed_id_idx" ON "Phase6BLeadMatchCandidate"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadMatchCandidate_organization_id_lead_id_idx" ON "Phase6BLeadMatchCandidate"("organization_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BLeadMatchCandidate_organization_id_id_key" ON "Phase6BLeadMatchCandidate"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BLeadMergeRecord_organization_id_idx" ON "Phase6BLeadMergeRecord"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadMergeRecord_organization_id_source_seed_id_idx" ON "Phase6BLeadMergeRecord"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadMergeRecord_organization_id_lead_id_idx" ON "Phase6BLeadMergeRecord"("organization_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BLeadMergeRecord_organization_id_id_key" ON "Phase6BLeadMergeRecord"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPipelineStage_organization_id_idx" ON "Phase6BPipelineStage"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPipelineStage_organization_id_source_seed_id_idx" ON "Phase6BPipelineStage"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPipelineStage_organization_id_id_key" ON "Phase6BPipelineStage"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPipelineTimelineEntry_organization_id_idx" ON "Phase6BPipelineTimelineEntry"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPipelineTimelineEntry_organization_id_source_seed_id_idx" ON "Phase6BPipelineTimelineEntry"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BPipelineTimelineEntry_organization_id_lead_id_idx" ON "Phase6BPipelineTimelineEntry"("organization_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPipelineTimelineEntry_organization_id_id_key" ON "Phase6BPipelineTimelineEntry"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationTemplate_organization_id_idx" ON "Phase6BCommunicationTemplate"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationTemplate_organization_id_source_seed_id_idx" ON "Phase6BCommunicationTemplate"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BCommunicationTemplate_organization_id_id_key" ON "Phase6BCommunicationTemplate"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationAttempt_organization_id_idx" ON "Phase6BCommunicationAttempt"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationAttempt_organization_id_source_seed_id_idx" ON "Phase6BCommunicationAttempt"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationAttempt_organization_id_lead_id_idx" ON "Phase6BCommunicationAttempt"("organization_id", "lead_id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationAttempt_organization_id_template_id_idx" ON "Phase6BCommunicationAttempt"("organization_id", "template_id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationAttempt_organization_id_sequence_enroll_idx" ON "Phase6BCommunicationAttempt"("organization_id", "sequence_enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BCommunicationAttempt_organization_id_id_key" ON "Phase6BCommunicationAttempt"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationSequenceEnrollment_organization_id_idx" ON "Phase6BCommunicationSequenceEnrollment"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationSequenceEnrollment_organization_id_sour_idx" ON "Phase6BCommunicationSequenceEnrollment"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BCommunicationSequenceEnrollment_organization_id_lead_idx" ON "Phase6BCommunicationSequenceEnrollment"("organization_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BCommunicationSequenceEnrollment_organization_id_id_key" ON "Phase6BCommunicationSequenceEnrollment"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BLeadScore_organization_id_idx" ON "Phase6BLeadScore"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadScore_organization_id_source_seed_id_idx" ON "Phase6BLeadScore"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BLeadScore_organization_id_lead_id_idx" ON "Phase6BLeadScore"("organization_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BLeadScore_organization_id_id_key" ON "Phase6BLeadScore"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BFollowUpTask_organization_id_idx" ON "Phase6BFollowUpTask"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BFollowUpTask_organization_id_source_seed_id_idx" ON "Phase6BFollowUpTask"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BFollowUpTask_organization_id_lead_id_idx" ON "Phase6BFollowUpTask"("organization_id", "lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BFollowUpTask_organization_id_id_key" ON "Phase6BFollowUpTask"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BInvoice_organization_id_idx" ON "Phase6BInvoice"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BInvoice_organization_id_source_seed_id_idx" ON "Phase6BInvoice"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BInvoice_organization_id_id_key" ON "Phase6BInvoice"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BInvoiceLine_organization_id_idx" ON "Phase6BInvoiceLine"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BInvoiceLine_organization_id_source_seed_id_idx" ON "Phase6BInvoiceLine"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BInvoiceLine_organization_id_invoice_id_idx" ON "Phase6BInvoiceLine"("organization_id", "invoice_id");

-- CreateIndex
CREATE INDEX "Phase6BInvoiceLine_organization_id_product_id_idx" ON "Phase6BInvoiceLine"("organization_id", "product_id");

-- CreateIndex
CREATE INDEX "Phase6BInvoiceLine_organization_id_price_history_id_idx" ON "Phase6BInvoiceLine"("organization_id", "price_history_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BInvoiceLine_organization_id_id_key" ON "Phase6BInvoiceLine"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BReceivable_organization_id_idx" ON "Phase6BReceivable"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BReceivable_organization_id_source_seed_id_idx" ON "Phase6BReceivable"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BReceivable_organization_id_invoice_id_idx" ON "Phase6BReceivable"("organization_id", "invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BReceivable_organization_id_id_key" ON "Phase6BReceivable"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BCreditDebitNote_organization_id_idx" ON "Phase6BCreditDebitNote"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BCreditDebitNote_organization_id_source_seed_id_idx" ON "Phase6BCreditDebitNote"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BCreditDebitNote_organization_id_invoice_id_idx" ON "Phase6BCreditDebitNote"("organization_id", "invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BCreditDebitNote_organization_id_id_key" ON "Phase6BCreditDebitNote"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPayment_organization_id_idx" ON "Phase6BPayment"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPayment_organization_id_source_seed_id_idx" ON "Phase6BPayment"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPayment_organization_id_id_key" ON "Phase6BPayment"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPaymentAllocation_organization_id_idx" ON "Phase6BPaymentAllocation"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPaymentAllocation_organization_id_source_seed_id_idx" ON "Phase6BPaymentAllocation"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BPaymentAllocation_organization_id_payment_id_idx" ON "Phase6BPaymentAllocation"("organization_id", "payment_id");

-- CreateIndex
CREATE INDEX "Phase6BPaymentAllocation_organization_id_invoice_id_idx" ON "Phase6BPaymentAllocation"("organization_id", "invoice_id");

-- CreateIndex
CREATE INDEX "Phase6BPaymentAllocation_organization_id_receivable_id_idx" ON "Phase6BPaymentAllocation"("organization_id", "receivable_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPaymentAllocation_organization_id_id_key" ON "Phase6BPaymentAllocation"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BReceipt_organization_id_idx" ON "Phase6BReceipt"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BReceipt_organization_id_source_seed_id_idx" ON "Phase6BReceipt"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BReceipt_organization_id_payment_id_idx" ON "Phase6BReceipt"("organization_id", "payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BReceipt_organization_id_id_key" ON "Phase6BReceipt"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BTopUp_organization_id_idx" ON "Phase6BTopUp"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BTopUp_organization_id_source_seed_id_idx" ON "Phase6BTopUp"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BTopUp_organization_id_payment_id_idx" ON "Phase6BTopUp"("organization_id", "payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BTopUp_organization_id_id_key" ON "Phase6BTopUp"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BReconciliationCandidate_organization_id_idx" ON "Phase6BReconciliationCandidate"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BReconciliationCandidate_organization_id_source_seed__idx" ON "Phase6BReconciliationCandidate"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BReconciliationCandidate_organization_id_payment_id_idx" ON "Phase6BReconciliationCandidate"("organization_id", "payment_id");

-- CreateIndex
CREATE INDEX "Phase6BReconciliationCandidate_organization_id_bank_transac_idx" ON "Phase6BReconciliationCandidate"("organization_id", "bank_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BReconciliationCandidate_organization_id_id_key" ON "Phase6BReconciliationCandidate"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BVendor_organization_id_idx" ON "Phase6BVendor"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BVendor_organization_id_source_seed_id_idx" ON "Phase6BVendor"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BVendor_organization_id_id_key" ON "Phase6BVendor"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BExpense_organization_id_idx" ON "Phase6BExpense"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BExpense_organization_id_source_seed_id_idx" ON "Phase6BExpense"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BExpense_organization_id_vendor_id_idx" ON "Phase6BExpense"("organization_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BExpense_organization_id_id_key" ON "Phase6BExpense"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPurchaseOrder_organization_id_idx" ON "Phase6BPurchaseOrder"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPurchaseOrder_organization_id_source_seed_id_idx" ON "Phase6BPurchaseOrder"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BPurchaseOrder_organization_id_vendor_id_idx" ON "Phase6BPurchaseOrder"("organization_id", "vendor_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPurchaseOrder_organization_id_id_key" ON "Phase6BPurchaseOrder"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPurchaseReceipt_organization_id_idx" ON "Phase6BPurchaseReceipt"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPurchaseReceipt_organization_id_source_seed_id_idx" ON "Phase6BPurchaseReceipt"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BPurchaseReceipt_organization_id_purchase_order_id_idx" ON "Phase6BPurchaseReceipt"("organization_id", "purchase_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPurchaseReceipt_organization_id_id_key" ON "Phase6BPurchaseReceipt"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BChartOfAccount_organization_id_idx" ON "Phase6BChartOfAccount"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BChartOfAccount_organization_id_source_seed_id_idx" ON "Phase6BChartOfAccount"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BChartOfAccount_organization_id_id_key" ON "Phase6BChartOfAccount"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BJournalEntry_organization_id_idx" ON "Phase6BJournalEntry"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BJournalEntry_organization_id_source_seed_id_idx" ON "Phase6BJournalEntry"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BJournalEntry_organization_id_id_key" ON "Phase6BJournalEntry"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BJournalEntryLine_organization_id_idx" ON "Phase6BJournalEntryLine"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BJournalEntryLine_organization_id_source_seed_id_idx" ON "Phase6BJournalEntryLine"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BJournalEntryLine_organization_id_journal_entry_id_idx" ON "Phase6BJournalEntryLine"("organization_id", "journal_entry_id");

-- CreateIndex
CREATE INDEX "Phase6BJournalEntryLine_organization_id_chart_of_account_id_idx" ON "Phase6BJournalEntryLine"("organization_id", "chart_of_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BJournalEntryLine_organization_id_id_key" ON "Phase6BJournalEntryLine"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BAccountingPeriod_organization_id_idx" ON "Phase6BAccountingPeriod"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BAccountingPeriod_organization_id_source_seed_id_idx" ON "Phase6BAccountingPeriod"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BAccountingPeriod_organization_id_id_key" ON "Phase6BAccountingPeriod"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BTaxMapping_organization_id_idx" ON "Phase6BTaxMapping"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BTaxMapping_organization_id_source_seed_id_idx" ON "Phase6BTaxMapping"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BTaxMapping_organization_id_id_key" ON "Phase6BTaxMapping"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BBankAccount_organization_id_idx" ON "Phase6BBankAccount"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BBankAccount_organization_id_source_seed_id_idx" ON "Phase6BBankAccount"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BBankAccount_organization_id_id_key" ON "Phase6BBankAccount"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BBankTransaction_organization_id_idx" ON "Phase6BBankTransaction"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BBankTransaction_organization_id_source_seed_id_idx" ON "Phase6BBankTransaction"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BBankTransaction_organization_id_bank_account_id_idx" ON "Phase6BBankTransaction"("organization_id", "bank_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BBankTransaction_organization_id_id_key" ON "Phase6BBankTransaction"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BReconciliationStatement_organization_id_idx" ON "Phase6BReconciliationStatement"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BReconciliationStatement_organization_id_source_seed__idx" ON "Phase6BReconciliationStatement"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BReconciliationStatement_organization_id_bank_account_idx" ON "Phase6BReconciliationStatement"("organization_id", "bank_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BReconciliationStatement_organization_id_id_key" ON "Phase6BReconciliationStatement"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPayee_organization_id_idx" ON "Phase6BPayee"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPayee_organization_id_source_seed_id_idx" ON "Phase6BPayee"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPayee_organization_id_id_key" ON "Phase6BPayee"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPayrollBatch_organization_id_idx" ON "Phase6BPayrollBatch"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPayrollBatch_organization_id_source_seed_id_idx" ON "Phase6BPayrollBatch"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPayrollBatch_organization_id_id_key" ON "Phase6BPayrollBatch"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BPayrollPayout_organization_id_idx" ON "Phase6BPayrollPayout"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BPayrollPayout_organization_id_source_seed_id_idx" ON "Phase6BPayrollPayout"("organization_id", "source_seed_id");

-- CreateIndex
CREATE INDEX "Phase6BPayrollPayout_organization_id_payroll_batch_id_idx" ON "Phase6BPayrollPayout"("organization_id", "payroll_batch_id");

-- CreateIndex
CREATE INDEX "Phase6BPayrollPayout_organization_id_payee_id_idx" ON "Phase6BPayrollPayout"("organization_id", "payee_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BPayrollPayout_organization_id_id_key" ON "Phase6BPayrollPayout"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BBillingOperation_organization_id_idx" ON "Phase6BBillingOperation"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BBillingOperation_organization_id_source_seed_id_idx" ON "Phase6BBillingOperation"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BBillingOperation_organization_id_id_key" ON "Phase6BBillingOperation"("organization_id", "id");

-- CreateIndex
CREATE INDEX "Phase6BBudgetCap_organization_id_idx" ON "Phase6BBudgetCap"("organization_id");

-- CreateIndex
CREATE INDEX "Phase6BBudgetCap_organization_id_source_seed_id_idx" ON "Phase6BBudgetCap"("organization_id", "source_seed_id");

-- CreateIndex
CREATE UNIQUE INDEX "Phase6BBudgetCap_organization_id_id_key" ON "Phase6BBudgetCap"("organization_id", "id");

-- AddForeignKey
ALTER TABLE "Phase6BProduct" ADD CONSTRAINT "Phase6BProduct_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BProductCategory" ADD CONSTRAINT "Phase6BProductCategory_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BProductMedia" ADD CONSTRAINT "Phase6BProductMedia_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BProductMedia" ADD CONSTRAINT "Phase6BProductMedia_organization_id_product_id_fkey" FOREIGN KEY ("organization_id", "product_id") REFERENCES "Phase6BProduct"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BProductHistory" ADD CONSTRAINT "Phase6BProductHistory_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BProductHistory" ADD CONSTRAINT "Phase6BProductHistory_organization_id_product_id_fkey" FOREIGN KEY ("organization_id", "product_id") REFERENCES "Phase6BProduct"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BProductPriceHistory" ADD CONSTRAINT "Phase6BProductPriceHistory_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BProductPriceHistory" ADD CONSTRAINT "Phase6BProductPriceHistory_organization_id_product_id_fkey" FOREIGN KEY ("organization_id", "product_id") REFERENCES "Phase6BProduct"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPackageDefinition" ADD CONSTRAINT "Phase6BPackageDefinition_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BDiscountRule" ADD CONSTRAINT "Phase6BDiscountRule_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BInventoryLocation" ADD CONSTRAINT "Phase6BInventoryLocation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BStockItem" ADD CONSTRAINT "Phase6BStockItem_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BStockItem" ADD CONSTRAINT "Phase6BStockItem_organization_id_product_id_fkey" FOREIGN KEY ("organization_id", "product_id") REFERENCES "Phase6BProduct"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BStockMovement" ADD CONSTRAINT "Phase6BStockMovement_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BStockMovement" ADD CONSTRAINT "Phase6BStockMovement_organization_id_stock_item_id_fkey" FOREIGN KEY ("organization_id", "stock_item_id") REFERENCES "Phase6BStockItem"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BStockMovement" ADD CONSTRAINT "Phase6BStockMovement_organization_id_inventory_location_id_fkey" FOREIGN KEY ("organization_id", "inventory_location_id") REFERENCES "Phase6BInventoryLocation"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadSource" ADD CONSTRAINT "Phase6BLeadSource_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadEvidence" ADD CONSTRAINT "Phase6BLeadEvidence_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadEvidence" ADD CONSTRAINT "Phase6BLeadEvidence_organization_id_lead_id_fkey" FOREIGN KEY ("organization_id", "lead_id") REFERENCES "LeadRecord"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadMatchCandidate" ADD CONSTRAINT "Phase6BLeadMatchCandidate_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadMatchCandidate" ADD CONSTRAINT "Phase6BLeadMatchCandidate_organization_id_lead_id_fkey" FOREIGN KEY ("organization_id", "lead_id") REFERENCES "LeadRecord"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadMergeRecord" ADD CONSTRAINT "Phase6BLeadMergeRecord_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadMergeRecord" ADD CONSTRAINT "Phase6BLeadMergeRecord_organization_id_lead_id_fkey" FOREIGN KEY ("organization_id", "lead_id") REFERENCES "LeadRecord"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPipelineStage" ADD CONSTRAINT "Phase6BPipelineStage_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPipelineTimelineEntry" ADD CONSTRAINT "Phase6BPipelineTimelineEntry_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPipelineTimelineEntry" ADD CONSTRAINT "Phase6BPipelineTimelineEntry_organization_id_lead_id_fkey" FOREIGN KEY ("organization_id", "lead_id") REFERENCES "LeadRecord"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCommunicationTemplate" ADD CONSTRAINT "Phase6BCommunicationTemplate_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCommunicationAttempt" ADD CONSTRAINT "Phase6BCommunicationAttempt_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCommunicationAttempt" ADD CONSTRAINT "Phase6BCommunicationAttempt_organization_id_lead_id_fkey" FOREIGN KEY ("organization_id", "lead_id") REFERENCES "LeadRecord"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCommunicationAttempt" ADD CONSTRAINT "Phase6BCommunicationAttempt_organization_id_template_id_fkey" FOREIGN KEY ("organization_id", "template_id") REFERENCES "Phase6BCommunicationTemplate"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCommunicationAttempt" ADD CONSTRAINT "Phase6BCommunicationAttempt_organization_id_sequence_enrol_fkey" FOREIGN KEY ("organization_id", "sequence_enrollment_id") REFERENCES "Phase6BCommunicationSequenceEnrollment"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCommunicationSequenceEnrollment" ADD CONSTRAINT "Phase6BCommunicationSequenceEnrollment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCommunicationSequenceEnrollment" ADD CONSTRAINT "Phase6BCommunicationSequenceEnrollment_organization_id_lea_fkey" FOREIGN KEY ("organization_id", "lead_id") REFERENCES "LeadRecord"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadScore" ADD CONSTRAINT "Phase6BLeadScore_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BLeadScore" ADD CONSTRAINT "Phase6BLeadScore_organization_id_lead_id_fkey" FOREIGN KEY ("organization_id", "lead_id") REFERENCES "LeadRecord"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BFollowUpTask" ADD CONSTRAINT "Phase6BFollowUpTask_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BFollowUpTask" ADD CONSTRAINT "Phase6BFollowUpTask_organization_id_lead_id_fkey" FOREIGN KEY ("organization_id", "lead_id") REFERENCES "LeadRecord"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BInvoice" ADD CONSTRAINT "Phase6BInvoice_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BInvoiceLine" ADD CONSTRAINT "Phase6BInvoiceLine_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BInvoiceLine" ADD CONSTRAINT "Phase6BInvoiceLine_organization_id_invoice_id_fkey" FOREIGN KEY ("organization_id", "invoice_id") REFERENCES "Phase6BInvoice"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BInvoiceLine" ADD CONSTRAINT "Phase6BInvoiceLine_organization_id_product_id_fkey" FOREIGN KEY ("organization_id", "product_id") REFERENCES "Phase6BProduct"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BInvoiceLine" ADD CONSTRAINT "Phase6BInvoiceLine_organization_id_price_history_id_fkey" FOREIGN KEY ("organization_id", "price_history_id") REFERENCES "Phase6BProductPriceHistory"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReceivable" ADD CONSTRAINT "Phase6BReceivable_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReceivable" ADD CONSTRAINT "Phase6BReceivable_organization_id_invoice_id_fkey" FOREIGN KEY ("organization_id", "invoice_id") REFERENCES "Phase6BInvoice"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCreditDebitNote" ADD CONSTRAINT "Phase6BCreditDebitNote_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BCreditDebitNote" ADD CONSTRAINT "Phase6BCreditDebitNote_organization_id_invoice_id_fkey" FOREIGN KEY ("organization_id", "invoice_id") REFERENCES "Phase6BInvoice"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPayment" ADD CONSTRAINT "Phase6BPayment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPaymentAllocation" ADD CONSTRAINT "Phase6BPaymentAllocation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPaymentAllocation" ADD CONSTRAINT "Phase6BPaymentAllocation_organization_id_payment_id_fkey" FOREIGN KEY ("organization_id", "payment_id") REFERENCES "Phase6BPayment"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPaymentAllocation" ADD CONSTRAINT "Phase6BPaymentAllocation_organization_id_invoice_id_fkey" FOREIGN KEY ("organization_id", "invoice_id") REFERENCES "Phase6BInvoice"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPaymentAllocation" ADD CONSTRAINT "Phase6BPaymentAllocation_organization_id_receivable_id_fkey" FOREIGN KEY ("organization_id", "receivable_id") REFERENCES "Phase6BReceivable"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReceipt" ADD CONSTRAINT "Phase6BReceipt_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReceipt" ADD CONSTRAINT "Phase6BReceipt_organization_id_payment_id_fkey" FOREIGN KEY ("organization_id", "payment_id") REFERENCES "Phase6BPayment"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BTopUp" ADD CONSTRAINT "Phase6BTopUp_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BTopUp" ADD CONSTRAINT "Phase6BTopUp_organization_id_payment_id_fkey" FOREIGN KEY ("organization_id", "payment_id") REFERENCES "Phase6BPayment"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReconciliationCandidate" ADD CONSTRAINT "Phase6BReconciliationCandidate_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReconciliationCandidate" ADD CONSTRAINT "Phase6BReconciliationCandidate_organization_id_payment_id_fkey" FOREIGN KEY ("organization_id", "payment_id") REFERENCES "Phase6BPayment"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReconciliationCandidate" ADD CONSTRAINT "Phase6BReconciliationCandidate_organization_id_bank_transa_fkey" FOREIGN KEY ("organization_id", "bank_transaction_id") REFERENCES "Phase6BBankTransaction"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BVendor" ADD CONSTRAINT "Phase6BVendor_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BExpense" ADD CONSTRAINT "Phase6BExpense_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BExpense" ADD CONSTRAINT "Phase6BExpense_organization_id_vendor_id_fkey" FOREIGN KEY ("organization_id", "vendor_id") REFERENCES "Phase6BVendor"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPurchaseOrder" ADD CONSTRAINT "Phase6BPurchaseOrder_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPurchaseOrder" ADD CONSTRAINT "Phase6BPurchaseOrder_organization_id_vendor_id_fkey" FOREIGN KEY ("organization_id", "vendor_id") REFERENCES "Phase6BVendor"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPurchaseReceipt" ADD CONSTRAINT "Phase6BPurchaseReceipt_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPurchaseReceipt" ADD CONSTRAINT "Phase6BPurchaseReceipt_organization_id_purchase_order_id_fkey" FOREIGN KEY ("organization_id", "purchase_order_id") REFERENCES "Phase6BPurchaseOrder"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BChartOfAccount" ADD CONSTRAINT "Phase6BChartOfAccount_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BJournalEntry" ADD CONSTRAINT "Phase6BJournalEntry_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BJournalEntryLine" ADD CONSTRAINT "Phase6BJournalEntryLine_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BJournalEntryLine" ADD CONSTRAINT "Phase6BJournalEntryLine_organization_id_journal_entry_id_fkey" FOREIGN KEY ("organization_id", "journal_entry_id") REFERENCES "Phase6BJournalEntry"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BJournalEntryLine" ADD CONSTRAINT "Phase6BJournalEntryLine_organization_id_chart_of_account_i_fkey" FOREIGN KEY ("organization_id", "chart_of_account_id") REFERENCES "Phase6BChartOfAccount"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BAccountingPeriod" ADD CONSTRAINT "Phase6BAccountingPeriod_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BTaxMapping" ADD CONSTRAINT "Phase6BTaxMapping_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BBankAccount" ADD CONSTRAINT "Phase6BBankAccount_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BBankTransaction" ADD CONSTRAINT "Phase6BBankTransaction_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BBankTransaction" ADD CONSTRAINT "Phase6BBankTransaction_organization_id_bank_account_id_fkey" FOREIGN KEY ("organization_id", "bank_account_id") REFERENCES "Phase6BBankAccount"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReconciliationStatement" ADD CONSTRAINT "Phase6BReconciliationStatement_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BReconciliationStatement" ADD CONSTRAINT "Phase6BReconciliationStatement_organization_id_bank_accoun_fkey" FOREIGN KEY ("organization_id", "bank_account_id") REFERENCES "Phase6BBankAccount"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPayee" ADD CONSTRAINT "Phase6BPayee_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPayrollBatch" ADD CONSTRAINT "Phase6BPayrollBatch_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPayrollPayout" ADD CONSTRAINT "Phase6BPayrollPayout_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPayrollPayout" ADD CONSTRAINT "Phase6BPayrollPayout_organization_id_payroll_batch_id_fkey" FOREIGN KEY ("organization_id", "payroll_batch_id") REFERENCES "Phase6BPayrollBatch"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BPayrollPayout" ADD CONSTRAINT "Phase6BPayrollPayout_organization_id_payee_id_fkey" FOREIGN KEY ("organization_id", "payee_id") REFERENCES "Phase6BPayee"("organization_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BBillingOperation" ADD CONSTRAINT "Phase6BBillingOperation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phase6BBudgetCap" ADD CONSTRAINT "Phase6BBudgetCap_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

