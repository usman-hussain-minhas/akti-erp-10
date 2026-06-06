-- CreateTable
CREATE TABLE "phase_6b_products" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_product_categories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_product_media" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_product_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_product_histories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_product_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_product_price_histories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_product_price_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_package_definitions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_package_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_discount_rules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_discount_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_inventory_locations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_inventory_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_stock_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_stock_movements" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_lead_sources" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_lead_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_lead_evidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_lead_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_lead_match_candidates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_lead_match_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_lead_merge_records" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_lead_merge_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_pipeline_stages" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_pipeline_timeline_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_pipeline_timeline_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_communication_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_communication_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_communication_attempts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_communication_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_communication_sequence_enrollments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_communication_sequence_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_lead_scores" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_lead_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_follow_up_tasks" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_follow_up_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_invoices" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_invoice_lines" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_receivables" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_receivables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_credit_debit_notes" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_credit_debit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_payments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_payment_allocations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_receipts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_top_ups" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_top_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_reconciliation_candidates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_reconciliation_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_vendors" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_expenses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_purchase_orders" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_purchase_receipts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_purchase_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_chart_of_accounts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_journal_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_journal_entry_lines" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_journal_entry_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_accounting_periods" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_accounting_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_tax_mappings" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_tax_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_bank_accounts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_bank_transactions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_bank_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_reconciliation_statements" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_reconciliation_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_payees" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_payees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_payroll_batches" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_payroll_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_payroll_payouts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_payroll_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_billing_operations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_billing_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_6b_budget_caps" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source_authority_ref" TEXT NOT NULL DEFAULT '6b_commerce_core.md',
    "payload_json" JSONB NOT NULL,
    "evidence_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phase_6b_budget_caps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "p6b_m01_org_idx" ON "phase_6b_products"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m01_status_idx" ON "phase_6b_products"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m01_org_id_uq" ON "phase_6b_products"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m01_key_uq" ON "phase_6b_products"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m02_org_idx" ON "phase_6b_product_categories"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m02_status_idx" ON "phase_6b_product_categories"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m02_org_id_uq" ON "phase_6b_product_categories"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m02_key_uq" ON "phase_6b_product_categories"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m03_org_idx" ON "phase_6b_product_media"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m03_status_idx" ON "phase_6b_product_media"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m03_org_id_uq" ON "phase_6b_product_media"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m03_key_uq" ON "phase_6b_product_media"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m04_org_idx" ON "phase_6b_product_histories"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m04_status_idx" ON "phase_6b_product_histories"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m04_org_id_uq" ON "phase_6b_product_histories"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m04_key_uq" ON "phase_6b_product_histories"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m05_org_idx" ON "phase_6b_product_price_histories"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m05_status_idx" ON "phase_6b_product_price_histories"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m05_org_id_uq" ON "phase_6b_product_price_histories"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m05_key_uq" ON "phase_6b_product_price_histories"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m06_org_idx" ON "phase_6b_package_definitions"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m06_status_idx" ON "phase_6b_package_definitions"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m06_org_id_uq" ON "phase_6b_package_definitions"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m06_key_uq" ON "phase_6b_package_definitions"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m07_org_idx" ON "phase_6b_discount_rules"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m07_status_idx" ON "phase_6b_discount_rules"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m07_org_id_uq" ON "phase_6b_discount_rules"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m07_key_uq" ON "phase_6b_discount_rules"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m08_org_idx" ON "phase_6b_inventory_locations"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m08_status_idx" ON "phase_6b_inventory_locations"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m08_org_id_uq" ON "phase_6b_inventory_locations"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m08_key_uq" ON "phase_6b_inventory_locations"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m09_org_idx" ON "phase_6b_stock_items"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m09_status_idx" ON "phase_6b_stock_items"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m09_org_id_uq" ON "phase_6b_stock_items"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m09_key_uq" ON "phase_6b_stock_items"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m10_org_idx" ON "phase_6b_stock_movements"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m10_status_idx" ON "phase_6b_stock_movements"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m10_org_id_uq" ON "phase_6b_stock_movements"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m10_key_uq" ON "phase_6b_stock_movements"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m11_org_idx" ON "phase_6b_lead_sources"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m11_status_idx" ON "phase_6b_lead_sources"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m11_org_id_uq" ON "phase_6b_lead_sources"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m11_key_uq" ON "phase_6b_lead_sources"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m12_org_idx" ON "phase_6b_lead_evidence"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m12_status_idx" ON "phase_6b_lead_evidence"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m12_org_id_uq" ON "phase_6b_lead_evidence"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m12_key_uq" ON "phase_6b_lead_evidence"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m13_org_idx" ON "phase_6b_lead_match_candidates"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m13_status_idx" ON "phase_6b_lead_match_candidates"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m13_org_id_uq" ON "phase_6b_lead_match_candidates"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m13_key_uq" ON "phase_6b_lead_match_candidates"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m14_org_idx" ON "phase_6b_lead_merge_records"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m14_status_idx" ON "phase_6b_lead_merge_records"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m14_org_id_uq" ON "phase_6b_lead_merge_records"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m14_key_uq" ON "phase_6b_lead_merge_records"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m15_org_idx" ON "phase_6b_pipeline_stages"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m15_status_idx" ON "phase_6b_pipeline_stages"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m15_org_id_uq" ON "phase_6b_pipeline_stages"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m15_key_uq" ON "phase_6b_pipeline_stages"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m16_org_idx" ON "phase_6b_pipeline_timeline_entries"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m16_status_idx" ON "phase_6b_pipeline_timeline_entries"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m16_org_id_uq" ON "phase_6b_pipeline_timeline_entries"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m16_key_uq" ON "phase_6b_pipeline_timeline_entries"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m17_org_idx" ON "phase_6b_communication_templates"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m17_status_idx" ON "phase_6b_communication_templates"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m17_org_id_uq" ON "phase_6b_communication_templates"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m17_key_uq" ON "phase_6b_communication_templates"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m18_org_idx" ON "phase_6b_communication_attempts"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m18_status_idx" ON "phase_6b_communication_attempts"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m18_org_id_uq" ON "phase_6b_communication_attempts"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m18_key_uq" ON "phase_6b_communication_attempts"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m19_org_idx" ON "phase_6b_communication_sequence_enrollments"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m19_status_idx" ON "phase_6b_communication_sequence_enrollments"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m19_org_id_uq" ON "phase_6b_communication_sequence_enrollments"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m19_key_uq" ON "phase_6b_communication_sequence_enrollments"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m20_org_idx" ON "phase_6b_lead_scores"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m20_status_idx" ON "phase_6b_lead_scores"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m20_org_id_uq" ON "phase_6b_lead_scores"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m20_key_uq" ON "phase_6b_lead_scores"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m21_org_idx" ON "phase_6b_follow_up_tasks"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m21_status_idx" ON "phase_6b_follow_up_tasks"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m21_org_id_uq" ON "phase_6b_follow_up_tasks"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m21_key_uq" ON "phase_6b_follow_up_tasks"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m22_org_idx" ON "phase_6b_invoices"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m22_status_idx" ON "phase_6b_invoices"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m22_org_id_uq" ON "phase_6b_invoices"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m22_key_uq" ON "phase_6b_invoices"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m23_org_idx" ON "phase_6b_invoice_lines"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m23_status_idx" ON "phase_6b_invoice_lines"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m23_org_id_uq" ON "phase_6b_invoice_lines"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m23_key_uq" ON "phase_6b_invoice_lines"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m24_org_idx" ON "phase_6b_receivables"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m24_status_idx" ON "phase_6b_receivables"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m24_org_id_uq" ON "phase_6b_receivables"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m24_key_uq" ON "phase_6b_receivables"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m25_org_idx" ON "phase_6b_credit_debit_notes"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m25_status_idx" ON "phase_6b_credit_debit_notes"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m25_org_id_uq" ON "phase_6b_credit_debit_notes"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m25_key_uq" ON "phase_6b_credit_debit_notes"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m26_org_idx" ON "phase_6b_payments"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m26_status_idx" ON "phase_6b_payments"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m26_org_id_uq" ON "phase_6b_payments"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m26_key_uq" ON "phase_6b_payments"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m27_org_idx" ON "phase_6b_payment_allocations"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m27_status_idx" ON "phase_6b_payment_allocations"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m27_org_id_uq" ON "phase_6b_payment_allocations"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m27_key_uq" ON "phase_6b_payment_allocations"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m28_org_idx" ON "phase_6b_receipts"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m28_status_idx" ON "phase_6b_receipts"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m28_org_id_uq" ON "phase_6b_receipts"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m28_key_uq" ON "phase_6b_receipts"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m29_org_idx" ON "phase_6b_top_ups"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m29_status_idx" ON "phase_6b_top_ups"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m29_org_id_uq" ON "phase_6b_top_ups"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m29_key_uq" ON "phase_6b_top_ups"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m30_org_idx" ON "phase_6b_reconciliation_candidates"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m30_status_idx" ON "phase_6b_reconciliation_candidates"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m30_org_id_uq" ON "phase_6b_reconciliation_candidates"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m30_key_uq" ON "phase_6b_reconciliation_candidates"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m31_org_idx" ON "phase_6b_vendors"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m31_status_idx" ON "phase_6b_vendors"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m31_org_id_uq" ON "phase_6b_vendors"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m31_key_uq" ON "phase_6b_vendors"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m32_org_idx" ON "phase_6b_expenses"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m32_status_idx" ON "phase_6b_expenses"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m32_org_id_uq" ON "phase_6b_expenses"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m32_key_uq" ON "phase_6b_expenses"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m33_org_idx" ON "phase_6b_purchase_orders"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m33_status_idx" ON "phase_6b_purchase_orders"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m33_org_id_uq" ON "phase_6b_purchase_orders"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m33_key_uq" ON "phase_6b_purchase_orders"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m34_org_idx" ON "phase_6b_purchase_receipts"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m34_status_idx" ON "phase_6b_purchase_receipts"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m34_org_id_uq" ON "phase_6b_purchase_receipts"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m34_key_uq" ON "phase_6b_purchase_receipts"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m35_org_idx" ON "phase_6b_chart_of_accounts"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m35_status_idx" ON "phase_6b_chart_of_accounts"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m35_org_id_uq" ON "phase_6b_chart_of_accounts"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m35_key_uq" ON "phase_6b_chart_of_accounts"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m36_org_idx" ON "phase_6b_journal_entries"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m36_status_idx" ON "phase_6b_journal_entries"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m36_org_id_uq" ON "phase_6b_journal_entries"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m36_key_uq" ON "phase_6b_journal_entries"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m37_org_idx" ON "phase_6b_journal_entry_lines"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m37_status_idx" ON "phase_6b_journal_entry_lines"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m37_org_id_uq" ON "phase_6b_journal_entry_lines"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m37_key_uq" ON "phase_6b_journal_entry_lines"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m38_org_idx" ON "phase_6b_accounting_periods"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m38_status_idx" ON "phase_6b_accounting_periods"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m38_org_id_uq" ON "phase_6b_accounting_periods"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m38_key_uq" ON "phase_6b_accounting_periods"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m39_org_idx" ON "phase_6b_tax_mappings"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m39_status_idx" ON "phase_6b_tax_mappings"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m39_org_id_uq" ON "phase_6b_tax_mappings"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m39_key_uq" ON "phase_6b_tax_mappings"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m40_org_idx" ON "phase_6b_bank_accounts"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m40_status_idx" ON "phase_6b_bank_accounts"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m40_org_id_uq" ON "phase_6b_bank_accounts"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m40_key_uq" ON "phase_6b_bank_accounts"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m41_org_idx" ON "phase_6b_bank_transactions"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m41_status_idx" ON "phase_6b_bank_transactions"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m41_org_id_uq" ON "phase_6b_bank_transactions"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m41_key_uq" ON "phase_6b_bank_transactions"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m42_org_idx" ON "phase_6b_reconciliation_statements"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m42_status_idx" ON "phase_6b_reconciliation_statements"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m42_org_id_uq" ON "phase_6b_reconciliation_statements"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m42_key_uq" ON "phase_6b_reconciliation_statements"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m43_org_idx" ON "phase_6b_payees"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m43_status_idx" ON "phase_6b_payees"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m43_org_id_uq" ON "phase_6b_payees"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m43_key_uq" ON "phase_6b_payees"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m44_org_idx" ON "phase_6b_payroll_batches"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m44_status_idx" ON "phase_6b_payroll_batches"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m44_org_id_uq" ON "phase_6b_payroll_batches"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m44_key_uq" ON "phase_6b_payroll_batches"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m45_org_idx" ON "phase_6b_payroll_payouts"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m45_status_idx" ON "phase_6b_payroll_payouts"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m45_org_id_uq" ON "phase_6b_payroll_payouts"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m45_key_uq" ON "phase_6b_payroll_payouts"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m46_org_idx" ON "phase_6b_billing_operations"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m46_status_idx" ON "phase_6b_billing_operations"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m46_org_id_uq" ON "phase_6b_billing_operations"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m46_key_uq" ON "phase_6b_billing_operations"("organization_id", "key");

-- CreateIndex
CREATE INDEX "p6b_m47_org_idx" ON "phase_6b_budget_caps"("organization_id");

-- CreateIndex
CREATE INDEX "p6b_m47_status_idx" ON "phase_6b_budget_caps"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m47_org_id_uq" ON "phase_6b_budget_caps"("organization_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "p6b_m47_key_uq" ON "phase_6b_budget_caps"("organization_id", "key");

-- AddForeignKey
ALTER TABLE "phase_6b_products" ADD CONSTRAINT "phase_6b_products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_product_categories" ADD CONSTRAINT "phase_6b_product_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_product_media" ADD CONSTRAINT "phase_6b_product_media_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_product_histories" ADD CONSTRAINT "phase_6b_product_histories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_product_price_histories" ADD CONSTRAINT "phase_6b_product_price_histories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_package_definitions" ADD CONSTRAINT "phase_6b_package_definitions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_discount_rules" ADD CONSTRAINT "phase_6b_discount_rules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_inventory_locations" ADD CONSTRAINT "phase_6b_inventory_locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_stock_items" ADD CONSTRAINT "phase_6b_stock_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_stock_movements" ADD CONSTRAINT "phase_6b_stock_movements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_lead_sources" ADD CONSTRAINT "phase_6b_lead_sources_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_lead_evidence" ADD CONSTRAINT "phase_6b_lead_evidence_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_lead_match_candidates" ADD CONSTRAINT "phase_6b_lead_match_candidates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_lead_merge_records" ADD CONSTRAINT "phase_6b_lead_merge_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_pipeline_stages" ADD CONSTRAINT "phase_6b_pipeline_stages_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_pipeline_timeline_entries" ADD CONSTRAINT "phase_6b_pipeline_timeline_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_communication_templates" ADD CONSTRAINT "phase_6b_communication_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_communication_attempts" ADD CONSTRAINT "phase_6b_communication_attempts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_communication_sequence_enrollments" ADD CONSTRAINT "phase_6b_communication_sequence_enrollments_organization_i_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_lead_scores" ADD CONSTRAINT "phase_6b_lead_scores_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_follow_up_tasks" ADD CONSTRAINT "phase_6b_follow_up_tasks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_invoices" ADD CONSTRAINT "phase_6b_invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_invoice_lines" ADD CONSTRAINT "phase_6b_invoice_lines_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_receivables" ADD CONSTRAINT "phase_6b_receivables_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_credit_debit_notes" ADD CONSTRAINT "phase_6b_credit_debit_notes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_payments" ADD CONSTRAINT "phase_6b_payments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_payment_allocations" ADD CONSTRAINT "phase_6b_payment_allocations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_receipts" ADD CONSTRAINT "phase_6b_receipts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_top_ups" ADD CONSTRAINT "phase_6b_top_ups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_reconciliation_candidates" ADD CONSTRAINT "phase_6b_reconciliation_candidates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_vendors" ADD CONSTRAINT "phase_6b_vendors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_expenses" ADD CONSTRAINT "phase_6b_expenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_purchase_orders" ADD CONSTRAINT "phase_6b_purchase_orders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_purchase_receipts" ADD CONSTRAINT "phase_6b_purchase_receipts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_chart_of_accounts" ADD CONSTRAINT "phase_6b_chart_of_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_journal_entries" ADD CONSTRAINT "phase_6b_journal_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_journal_entry_lines" ADD CONSTRAINT "phase_6b_journal_entry_lines_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_accounting_periods" ADD CONSTRAINT "phase_6b_accounting_periods_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_tax_mappings" ADD CONSTRAINT "phase_6b_tax_mappings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_bank_accounts" ADD CONSTRAINT "phase_6b_bank_accounts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_bank_transactions" ADD CONSTRAINT "phase_6b_bank_transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_reconciliation_statements" ADD CONSTRAINT "phase_6b_reconciliation_statements_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_payees" ADD CONSTRAINT "phase_6b_payees_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_payroll_batches" ADD CONSTRAINT "phase_6b_payroll_batches_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_payroll_payouts" ADD CONSTRAINT "phase_6b_payroll_payouts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_billing_operations" ADD CONSTRAINT "phase_6b_billing_operations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_6b_budget_caps" ADD CONSTRAINT "phase_6b_budget_caps_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

