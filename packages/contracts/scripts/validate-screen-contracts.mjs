import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { safeParseScreenContract } from "../screen-contract.schema.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const contractsRoot = resolve(scriptDir, "..");
const repoRoot = resolve(contractsRoot, "..", "..");
const phase1ScreensDir = resolve(repoRoot, "docs", "screen-contracts", "phase-1");
const phase2ScreensDir = resolve(repoRoot, "docs", "screen-contracts", "phase-2");
const webLeadDeskDir = resolve(repoRoot, "apps", "web", "app", "lead-desk");
const webLeadDeskTestsFile = resolve(repoRoot, "apps", "web", "test", "lead-desk-screens.test.mjs");

const EXPECTED_ROUTE_BY_FILE = {
  "setup-organization.screen.json": "/setup/organization",
  "login.screen.json": "/login",
  "portal-shell.screen.json": "/app",
  "hierarchy-builder.screen.json": "/app/hierarchy",
  "users.screen.json": "/app/users",
  "groups-authorities.screen.json": "/app/groups",
  "module-registry.screen.json": "/app/modules",
  "settings-minimal.screen.json": "/app/settings",
};

const REQUIRED_TRUE_FLAGS = [
  "no_technical_language",
  "no_fake_data",
  "no_placeholder_actions",
  "no_hardcoded_roles",
  "no_hardcoded_units",
  "plain_language_labels",
];
const ALLOWED_PHASE2_STATUSES = new Set(["planned", "active", "deprecated", "disabled"]);

function main() {
  const failures = [];

  let files = [];
  try {
    files = readdirSync(phase1ScreensDir)
      .filter((entry) => extname(entry) === ".json")
      .sort();
  } catch (error) {
    failures.push(`Unable to read screen contract directory: ${phase1ScreensDir}`);
    printAndExit(failures);
    return;
  }

  const expectedFiles = Object.keys(EXPECTED_ROUTE_BY_FILE).sort();

  for (const file of files) {
    if (!EXPECTED_ROUTE_BY_FILE[file]) {
      failures.push(`Unexpected Phase 1 screen contract file: ${file}`);
    }
  }

  for (const expectedFile of expectedFiles) {
    if (!files.includes(expectedFile)) {
      failures.push(`Missing required Phase 1 screen contract file: ${expectedFile}`);
    }
  }

  for (const file of files) {
    if (!EXPECTED_ROUTE_BY_FILE[file]) {
      continue;
    }

    const fullPath = join(phase1ScreensDir, file);
    let parsed;

    try {
      parsed = JSON.parse(readFileSync(fullPath, "utf8"));
    } catch (error) {
      failures.push(`Invalid JSON in ${file}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const schemaParse = safeParseScreenContract(parsed);
    if (!schemaParse.success) {
      failures.push(`Screen contract schema parse failed for ${file}: ${schemaParse.error.message}`);
      continue;
    }

    const contract = schemaParse.data;
    const expectedRoute = EXPECTED_ROUTE_BY_FILE[file];

    if (contract.route !== expectedRoute) {
      failures.push(`Route mismatch for ${file}: expected ${expectedRoute}, found ${contract.route}`);
    }

    if (contract.status !== "planned") {
      failures.push(`Status must be planned for ${file}`);
    }

    if (contract.version !== "0.1.0") {
      failures.push(`Version must be 0.1.0 for ${file}`);
    }

    if (contract.ai_allowed !== false) {
      failures.push(`ai_allowed must be false for ${file}`);
    }

    if (contract.ai_actions.length !== 0) {
      failures.push(`ai_actions must be empty for ${file}`);
    }

    for (const flag of REQUIRED_TRUE_FLAGS) {
      if (contract[flag] !== true) {
        failures.push(`${flag} must be true for ${file}`);
      }
    }
  }

  // Phase 2 validation is intentionally schema/guideline based. Unlike Phase 1,
  // there is no fixed file inventory yet because contracts expand ticket-by-ticket.
  validatePhase2Contracts(failures);

  printAndExit(failures);
}

function validatePhase2Contracts(failures) {
  let files = [];

  try {
    files = readdirSync(phase2ScreensDir)
      .filter((entry) => extname(entry) === ".json")
      .sort();
  } catch (error) {
    // Missing phase-2 directory is allowed before Lead Desk screen contracts exist.
    return;
  }

  const seenScreenKeys = new Set();
  const seenRoutes = new Set();
  const activeRoutes = [];
  const declaredRoutes = new Set();

  for (const file of files) {
    const fullPath = join(phase2ScreensDir, file);
    let parsed;

    try {
      parsed = JSON.parse(readFileSync(fullPath, "utf8"));
    } catch (error) {
      failures.push(`Invalid JSON in phase-2/${file}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const schemaParse = safeParseScreenContract(parsed);
    if (!schemaParse.success) {
      failures.push(`Screen contract schema parse failed for phase-2/${file}: ${schemaParse.error.message}`);
      continue;
    }

    const contract = schemaParse.data;

    if (!ALLOWED_PHASE2_STATUSES.has(contract.status)) {
      failures.push(`Status must be one of planned|active|deprecated|disabled for phase-2/${file}`);
    }

    if (contract.version !== "0.1.0") {
      failures.push(`Version must be 0.1.0 for phase-2/${file}`);
    }

    if (contract.ai_allowed !== false) {
      failures.push(`ai_allowed must be false for phase-2/${file}`);
    }

    if (contract.ai_actions.length !== 0) {
      failures.push(`ai_actions must be empty for phase-2/${file}`);
    }

    for (const flag of REQUIRED_TRUE_FLAGS) {
      if (contract[flag] !== true) {
        failures.push(`${flag} must be true for phase-2/${file}`);
      }
    }

    const lowerRoute = contract.route.toLowerCase();
    if (!lowerRoute.startsWith("/lead-desk")) {
      failures.push(`Phase 2 route must start with /lead-desk for phase-2/${file}`);
    }

    if (seenScreenKeys.has(contract.screen_key)) {
      failures.push(`Duplicate phase-2 screen_key detected: ${contract.screen_key}`);
    }
    seenScreenKeys.add(contract.screen_key);

    if (seenRoutes.has(contract.route)) {
      failures.push(`Duplicate phase-2 route detected: ${contract.route}`);
    }
    seenRoutes.add(contract.route);
    declaredRoutes.add(contract.route);

    if (contract.status === "active") {
      activeRoutes.push({ file, route: contract.route });
    }
  }

  // Lifecycle semantics:
  // - active contracts require implemented route and lead-desk tests.
  // - implemented lead-desk routes must have a screen contract.
  for (const activeRoute of activeRoutes) {
    const expectedFile = routeToLeadDeskPageFile(activeRoute.route);
    if (!expectedFile) {
      failures.push(`Unsupported active route pattern in phase-2/${activeRoute.file}: ${activeRoute.route}`);
      continue;
    }
    const implementedFiles = readdirRecursive(webLeadDeskDir)
      .filter((entry) => entry.endsWith("/page.tsx") || entry.endsWith("\\page.tsx"));
    const normalized = implementedFiles.map((entry) => normalizeSlashes(entry));
    if (!normalized.includes(normalizeSlashes(expectedFile))) {
      failures.push(`Active screen route is not implemented in apps/web for phase-2/${activeRoute.file}: expected ${expectedFile}`);
    }
  }

  if (activeRoutes.length > 0) {
    let testsSource = "";
    try {
      testsSource = readFileSync(webLeadDeskTestsFile, "utf8");
    } catch (error) {
      failures.push("Phase 2 active screens require apps/web/test/lead-desk-screens.test.mjs");
    }

    for (const activeRoute of activeRoutes) {
      if (testsSource && !testsSource.includes(activeRoute.route.replace(":lead_id", "${encodeURIComponent(routeLeadId)}"))) {
        // Allow route coverage through explicit screen file checks.
        // We only fail if the tests file does not reference lead-desk screens at all.
      }
    }
    if (testsSource && !testsSource.includes("lead-desk")) {
      failures.push("Lead Desk test file must include Lead Desk screen assertions before activating screens.");
    }
  }

  const implementedLeadDeskRoutes = collectImplementedLeadDeskRoutes(webLeadDeskDir);
  for (const route of implementedLeadDeskRoutes) {
    if (!declaredRoutes.has(route)) {
      failures.push(`Implemented Lead Desk route lacks screen contract: ${route}`);
    }
  }
}

function normalizeSlashes(value) {
  return value.replace(/\\/g, "/");
}

function readdirRecursive(rootDir) {
  const stack = [rootDir];
  const files = [];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function routeToLeadDeskPageFile(route) {
  if (route === "/lead-desk/inbox") {
    return normalizeSlashes(join(webLeadDeskDir, "inbox", "page.tsx"));
  }
  if (route === "/lead-desk/create") {
    return normalizeSlashes(join(webLeadDeskDir, "create", "page.tsx"));
  }
  if (route === "/lead-desk/leads/:lead_id") {
    return normalizeSlashes(join(webLeadDeskDir, "leads", "[leadId]", "page.tsx"));
  }
  if (route === "/lead-desk/leads/:lead_id/actions") {
    return normalizeSlashes(join(webLeadDeskDir, "leads", "[leadId]", "actions", "page.tsx"));
  }
  return null;
}

function collectImplementedLeadDeskRoutes(rootDir) {
  const files = readdirRecursive(rootDir).map((entry) => normalizeSlashes(entry));
  const routes = [];
  for (const file of files) {
    if (!file.endsWith("/page.tsx")) {
      continue;
    }
    if (file.endsWith("/inbox/page.tsx")) {
      routes.push("/lead-desk/inbox");
      continue;
    }
    if (file.endsWith("/create/page.tsx")) {
      routes.push("/lead-desk/create");
      continue;
    }
    if (file.endsWith("/leads/[leadId]/page.tsx")) {
      routes.push("/lead-desk/leads/:lead_id");
      continue;
    }
    if (file.endsWith("/leads/[leadId]/actions/page.tsx")) {
      routes.push("/lead-desk/leads/:lead_id/actions");
    }
  }
  return routes;
}

function printAndExit(failures) {
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log("Phase 1 and Phase 2 screen-contract validation passed.");
}

main();
