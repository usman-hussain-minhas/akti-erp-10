import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

import { safeParseModuleManifest } from "../module-manifest.schema.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const contractsRoot = resolve(scriptDir, "..");
const phase6bRoot = resolve(contractsRoot, "phase_6b");

const EXPECTED_COMPONENTS = [
  ["6B.01", "product_catalogue", "phase-6b.product-catalogue"],
  ["6B.02", "product_pricing", "phase-6b.product-pricing"],
  ["6B.03", "inventory_stock", "phase-6b.inventory-stock"],
  ["6B.04", "crm_lead_intake", "phase-6b.crm-lead-intake"],
  ["6B.05", "crm_deduplication", "phase-6b.crm-deduplication"],
  ["6B.06", "crm_pipeline", "phase-6b.crm-pipeline"],
  ["6B.07", "crm_communication", "phase-6b.crm-communication"],
  ["6B.08", "crm_scoring_reporting", "phase-6b.crm-scoring-reporting"],
  ["6B.09", "finance_invoice_receivables", "phase-6b.finance-invoice-receivables"],
  ["6B.10", "payment_collection_topup", "phase-6b.payment-collection-topup"],
  ["6B.11", "expense_purchase_vendor", "phase-6b.expense-purchase-vendor"],
  ["6B.12", "general_ledger_accounting", "phase-6b.general-ledger-accounting"],
  ["6B.13", "banking_reconciliation", "phase-6b.banking-reconciliation"],
  ["6B.14", "finance_payroll_foundation", "phase-6b.finance-payroll-foundation"],
  ["6B.15", "finance_billing_operations", "phase-6b.finance-billing-operations"],
];

const failures = [];

async function loadModule(path) {
  return import(pathToFileURL(path).href);
}

for (const [sourceComponentId, fileStem, moduleKey] of EXPECTED_COMPONENTS) {
  const contractPath = resolve(phase6bRoot, `${fileStem}.contract.ts`);
  const manifestPath = resolve(phase6bRoot, `${fileStem}.module_manifest.contract.ts`);

  if (!existsSync(contractPath)) {
    failures.push(`Missing Phase 6B contract scaffold: ${fileStem}.contract.ts`);
    continue;
  }

  if (!existsSync(manifestPath)) {
    failures.push(`Missing Phase 6B module_manifest scaffold: ${fileStem}.module_manifest.contract.ts`);
    continue;
  }

  const contractModule = await loadModule(contractPath);
  const manifestModule = await loadModule(manifestPath);
  const contract = contractModule.phase6bScaffoldContract;
  const manifest = manifestModule.phase6bModuleManifest;

  if (!contract) {
    failures.push(`Missing phase6bScaffoldContract export for ${fileStem}`);
  } else {
    if (contract.phase !== "6b") {
      failures.push(`${fileStem} contract phase must be 6b`);
    }
    if (contract.source_component_id !== sourceComponentId) {
      failures.push(`${fileStem} contract source_component_id must be ${sourceComponentId}`);
    }
    if (contract.module_key !== moduleKey) {
      failures.push(`${fileStem} contract module_key must be ${moduleKey}`);
    }
    if (contract.capability_implementation_authorized !== false) {
      failures.push(`${fileStem} contract must keep capability_implementation_authorized=false`);
    }
    if (contract.ticket_generation_allowed !== false) {
      failures.push(`${fileStem} contract must keep ticket_generation_allowed=false`);
    }
  }

  const manifestParse = safeParseModuleManifest(manifest);
  if (!manifestParse.success) {
    failures.push(`${fileStem} manifest parse failed: ${manifestParse.error.message}`);
  } else {
    const parsedManifest = manifestParse.data;
    if (parsedManifest.module_key !== moduleKey) {
      failures.push(`${fileStem} manifest module_key must be ${moduleKey}`);
    }
    if (parsedManifest.capabilities.length !== 0) {
      failures.push(`${fileStem} manifest must not declare implemented capabilities`);
    }
    if (parsedManifest.api_routes.length !== 0) {
      failures.push(`${fileStem} manifest must not declare runtime API routes`);
    }
    if (parsedManifest.migrations.length !== 0) {
      failures.push(`${fileStem} manifest must not declare migrations`);
    }
    if (parsedManifest.data_ownership.entity_refs.length !== 0) {
      failures.push(`${fileStem} manifest must not declare runtime entity ownership`);
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log(`Phase 6B contract scaffolds validated: ${EXPECTED_COMPONENTS.length}`);
console.log("ticket_generation_allowed=false");
console.log("capability_implementation_authorized=false");
