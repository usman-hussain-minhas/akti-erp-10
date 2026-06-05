import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const components = [
  "product_catalogue",
  "product_pricing",
  "inventory_stock",
  "crm_lead_intake",
  "crm_deduplication",
  "crm_pipeline",
  "crm_communication",
  "crm_scoring_reporting",
  "finance_invoice_receivables",
  "payment_collection_topup",
  "expense_purchase_vendor",
  "general_ledger_accounting",
  "banking_reconciliation",
  "finance_payroll_foundation",
  "finance_billing_operations",
];

const failures = [];

function readJson(path) {
  return JSON.parse(readFileSync(join(repoRoot, path), "utf8"));
}

function requireFile(path) {
  if (!existsSync(join(repoRoot, path))) {
    failures.push(`Missing required scaffold-control file: ${path}`);
  }
}

function requireText(path, expected) {
  requireFile(path);
  if (!existsSync(join(repoRoot, path))) {
    return;
  }
  const source = readFileSync(join(repoRoot, path), "utf8");
  if (!source.includes(expected)) {
    failures.push(`Expected ${path} to contain ${expected}`);
  }
}

for (const component of components) {
  requireFile(`packages/contracts/phase_6b/${component}.contract.ts`);
  requireFile(`packages/contracts/phase_6b/${component}.module_manifest.contract.ts`);
  requireFile(`apps/api/src/phase_6b/${component}/${component}.module.ts`);
  requireFile(`apps/api/src/phase_6b/${component}/${component}.controller.ts`);
  requireFile(`apps/api/src/phase_6b/${component}/${component}.service.ts`);
  requireFile(`apps/api/src/phase_6b/${component}/${component}.service.test.ts`);
  requireText(`apps/api/src/phase_6b/${component}/${component}.service.ts`, "capability_implementation_authorized: false");
  requireText(`apps/api/src/phase_6b/${component}/${component}.service.ts`, "ticket_generation_allowed: false");

  const serviceSource = existsSync(join(repoRoot, `apps/api/src/phase_6b/${component}/${component}.service.ts`))
    ? readFileSync(join(repoRoot, `apps/api/src/phase_6b/${component}/${component}.service.ts`), "utf8")
    : "";
  if (serviceSource.includes("PrismaService") || serviceSource.includes("@prisma/client")) {
    failures.push(`${component} scaffold service must not depend on Prisma`);
  }
}

requireFile("packages/contracts/scripts/validate_phase_6b_contracts.mjs");
requireFile("docs/process/v4_1/phase_6b/scaffold_control/phase_6b_prisma_ownership_decision_v1.json");
requireFile("apps/api/src/phase_6b/phase_6b.module.ts");
requireText("apps/api/src/app.module.ts", "Phase6BModule");

const rootPackage = readJson("package.json");
const contractsPackage = readJson("packages/contracts/package.json");
const apiPackage = readJson("apps/api/package.json");

if (rootPackage.scripts?.["phase6b:scaffold:check"] !== "node scripts/quality/check_phase_6b_scaffold_control.mjs") {
  failures.push("Root package must expose phase6b:scaffold:check");
}

if (!contractsPackage.scripts?.["contracts:validate"]?.includes("validate_phase_6b_contracts.mjs")) {
  failures.push("@akti/contracts contracts:validate must run validate_phase_6b_contracts.mjs");
}

if (!apiPackage.scripts?.["test:phase-6b-scaffold"]?.includes("src/phase_6b")) {
  failures.push("@akti/api must expose test:phase-6b-scaffold for Phase 6B metadata-only tests");
}

if (!apiPackage.scripts?.test?.includes("test:phase-6b-scaffold")) {
  failures.push("@akti/api test must include test:phase-6b-scaffold");
}

const v14Pack = readJson("docs/process/v4_1/phase_6b/v14/scaffold_control_ticket_pack_v1.json");
const capabilityTickets = v14Pack.tickets.filter((ticket) => ticket.capability_implementation_authorized !== false);
const ticketGenerationEnabled = v14Pack.tickets.filter((ticket) => ticket.ticket_generation_allowed !== false);
if (capabilityTickets.length !== 0) {
  failures.push(`Capability implementation tickets authorized unexpectedly: ${capabilityTickets.length}`);
}
if (ticketGenerationEnabled.length !== 0 || v14Pack.ticket_generation_allowed !== false) {
  failures.push("Ticket generation must remain forbidden in v14 source pack");
}

const prismaDecision = readJson("docs/process/v4_1/phase_6b/scaffold_control/phase_6b_prisma_ownership_decision_v1.json");
if (prismaDecision.schema_change_authorized !== false || prismaDecision.migration_authorized !== false) {
  failures.push("Prisma ownership decision must keep schema and migration authorization false");
}
if (prismaDecision.component_count !== components.length) {
  failures.push(`Prisma ownership decision must cover ${components.length} components`);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`FAIL: ${failure}`);
  }
  process.exit(1);
}

console.log(`Phase 6B scaffold-control check passed for ${components.length} components.`);
console.log("Capability implementation tickets authorized: 0");
console.log("ticket_generation_allowed=false");
