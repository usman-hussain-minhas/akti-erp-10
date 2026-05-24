import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { safeParseScreenContract } from "../screen-contract.schema.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const contractsRoot = resolve(scriptDir, "..");
const repoRoot = resolve(contractsRoot, "..", "..");
const phase1ScreensDir = resolve(repoRoot, "docs", "screen-contracts", "phase-1");
const phase2ScreensDir = resolve(repoRoot, "docs", "screen-contracts", "phase-2");

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

    if (contract.status !== "planned") {
      failures.push(`Status must be planned for phase-2/${file}`);
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
  }
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
