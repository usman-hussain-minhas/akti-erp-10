import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { safeParseScreenContract } from "../screen-contract.schema.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const contractsRoot = resolve(scriptDir, "..");
const repoRoot = resolve(contractsRoot, "..", "..");
const screensDir = resolve(repoRoot, "docs", "screen-contracts", "phase-1");

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
    files = readdirSync(screensDir)
      .filter((entry) => extname(entry) === ".json")
      .sort();
  } catch (error) {
    failures.push(`Unable to read screen contract directory: ${screensDir}`);
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

    const fullPath = join(screensDir, file);
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

  printAndExit(failures);
}

function printAndExit(failures) {
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log("Phase 1 screen-contract validation passed.");
}

main();
