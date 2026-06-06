export type Phase6BScaffoldSurface = {
  module_key: string;
  display_name: string;
  owned_model_names: string[];
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
};

export type Phase6BScaffoldControlSnapshot = {
  phase: '6B';
  status: 'scaffold_control_only';
  ticket_generation_allowed: false;
  capability_execution_allowed: false;
  surfaces: Phase6BScaffoldSurface[];
};

export const phase6BScaffoldSurfaces = [
  {
    module_key: 'phase-6b.product-catalogue',
    display_name: 'Phase 6B Product Catalogue',
    owned_model_names: ['Phase6BProduct', 'Phase6BProductCategory', 'Phase6BProductMedia', 'Phase6BProductHistory'],
  },
  {
    module_key: 'phase-6b.product-pricing',
    display_name: 'Phase 6B Product Pricing',
    owned_model_names: ['Phase6BProductPriceHistory', 'Phase6BPackageDefinition', 'Phase6BDiscountRule'],
  },
  {
    module_key: 'phase-6b.inventory-stock',
    display_name: 'Phase 6B Inventory Stock',
    owned_model_names: ['Phase6BInventoryLocation', 'Phase6BStockItem', 'Phase6BStockMovement'],
  },
  {
    module_key: 'phase-6b.crm-lead-intake',
    display_name: 'Phase 6B CRM Lead Intake',
    owned_model_names: ['Phase6BLeadSource', 'Phase6BLeadEvidence'],
  },
  {
    module_key: 'phase-6b.crm-deduplication',
    display_name: 'Phase 6B CRM Deduplication',
    owned_model_names: ['Phase6BLeadMatchCandidate', 'Phase6BLeadMergeRecord'],
  },
  {
    module_key: 'phase-6b.crm-pipeline',
    display_name: 'Phase 6B CRM Pipeline',
    owned_model_names: ['Phase6BPipelineStage', 'Phase6BPipelineTimelineEntry'],
  },
  {
    module_key: 'phase-6b.crm-communication',
    display_name: 'Phase 6B CRM Communication',
    owned_model_names: [
      'Phase6BCommunicationTemplate',
      'Phase6BCommunicationAttempt',
      'Phase6BCommunicationSequenceEnrollment',
    ],
  },
  {
    module_key: 'phase-6b.crm-scoring-reporting',
    display_name: 'Phase 6B CRM Scoring Reporting',
    owned_model_names: ['Phase6BLeadScore', 'Phase6BFollowUpTask'],
  },
  {
    module_key: 'phase-6b.finance-invoice-receivables',
    display_name: 'Phase 6B Finance Invoice Receivables',
    owned_model_names: ['Phase6BInvoice', 'Phase6BInvoiceLine', 'Phase6BReceivable', 'Phase6BCreditDebitNote'],
  },
  {
    module_key: 'phase-6b.payment-collection-topup',
    display_name: 'Phase 6B Payment Collection Topup',
    owned_model_names: [
      'Phase6BPayment',
      'Phase6BPaymentAllocation',
      'Phase6BReceipt',
      'Phase6BTopUp',
      'Phase6BReconciliationCandidate',
    ],
  },
  {
    module_key: 'phase-6b.expense-purchase-vendor',
    display_name: 'Phase 6B Expense Purchase Vendor',
    owned_model_names: ['Phase6BVendor', 'Phase6BExpense', 'Phase6BPurchaseOrder', 'Phase6BPurchaseReceipt'],
  },
  {
    module_key: 'phase-6b.general-ledger-accounting',
    display_name: 'Phase 6B General Ledger Accounting',
    owned_model_names: [
      'Phase6BChartOfAccount',
      'Phase6BJournalEntry',
      'Phase6BJournalEntryLine',
      'Phase6BAccountingPeriod',
      'Phase6BTaxMapping',
    ],
  },
  {
    module_key: 'phase-6b.banking-reconciliation',
    display_name: 'Phase 6B Banking Reconciliation',
    owned_model_names: ['Phase6BBankAccount', 'Phase6BBankTransaction', 'Phase6BReconciliationStatement'],
  },
  {
    module_key: 'phase-6b.finance-payroll-foundation',
    display_name: 'Phase 6B Finance Payroll Foundation',
    owned_model_names: ['Phase6BPayee', 'Phase6BPayrollBatch', 'Phase6BPayrollPayout'],
  },
  {
    module_key: 'phase-6b.finance-billing-operations',
    display_name: 'Phase 6B Finance Billing Operations',
    owned_model_names: ['Phase6BBillingOperation', 'Phase6BBudgetCap'],
  },
].map((surface) => ({
  ...surface,
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
})) satisfies Phase6BScaffoldSurface[];

export const phase6BScaffoldControlSnapshot: Phase6BScaffoldControlSnapshot = {
  phase: '6B',
  status: 'scaffold_control_only',
  ticket_generation_allowed: false,
  capability_execution_allowed: false,
  surfaces: phase6BScaffoldSurfaces,
};

export function assertPhase6BScaffoldControlSnapshot(snapshot: Phase6BScaffoldControlSnapshot): void {
  const seenModuleKeys = new Set<string>();
  const seenModels = new Set<string>();

  for (const surface of snapshot.surfaces) {
    if (seenModuleKeys.has(surface.module_key)) {
      throw new Error(`Duplicate Phase 6B scaffold module key: ${surface.module_key}`);
    }

    seenModuleKeys.add(surface.module_key);

    if (surface.owned_model_names.length === 0) {
      throw new Error(`Phase 6B scaffold surface ${surface.module_key} must own at least one schema model`);
    }

    for (const modelName of surface.owned_model_names) {
      if (seenModels.has(modelName)) {
        throw new Error(`Duplicate Phase 6B scaffold model ownership: ${modelName}`);
      }

      seenModels.add(modelName);
    }

    if (
      surface.capability_implementation_allowed ||
      surface.business_behavior_allowed ||
      surface.runtime_adapter_allowed
    ) {
      throw new Error(`Phase 6B scaffold surface ${surface.module_key} must not authorize capability behavior`);
    }
  }

  if (snapshot.ticket_generation_allowed || snapshot.capability_execution_allowed) {
    throw new Error('Phase 6B scaffold control must keep ticket generation and execution disabled');
  }

  if (snapshot.surfaces.length !== 15) {
    throw new Error(`Expected 15 Phase 6B scaffold surfaces; got ${snapshot.surfaces.length}`);
  }

  if (seenModels.size !== 47) {
    throw new Error(`Expected 47 Phase 6B scaffold model owners; got ${seenModels.size}`);
  }
}

assertPhase6BScaffoldControlSnapshot(phase6BScaffoldControlSnapshot);
