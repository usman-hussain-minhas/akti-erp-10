import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function findSchemaFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = readdirSync(dir).sort();
  const files = [];

  for (const entry of entries) {
    if (entry === "node_modules" || entry === "scripts") {
      continue;
    }

    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findSchemaFiles(fullPath));
    } else if (entry.endsWith(".schema.ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: packageRoot,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const schemaFiles = findSchemaFiles(packageRoot);

if (schemaFiles.length === 0) {
  console.log("No schema files exist yet. Contracts scaffold is ready.");
  process.exit(0);
}

run("pnpm", ["exec", "tsc", "--noEmit"]);

for (const schemaFile of schemaFiles) {
  console.log(`Validating ${relative(packageRoot, schemaFile)}`);
  run("pnpm", ["exec", "tsx", schemaFile]);
}

const accessCoreValidator = join(packageRoot, "scripts", "validate-access-core-contracts.mjs");
if (!existsSync(accessCoreValidator)) {
  console.error(
    `Required validator is missing: ${relative(packageRoot, accessCoreValidator)}`,
  );
  process.exit(1);
}

console.log(`Validating ${relative(packageRoot, accessCoreValidator)}`);
run("pnpm", ["exec", "tsx", accessCoreValidator]);

const engagementGatewayLiteValidator = join(
  packageRoot,
  "scripts",
  "validate-engagement-gateway-lite-contracts.mjs",
);
if (!existsSync(engagementGatewayLiteValidator)) {
  console.error(
    `Required validator is missing: ${relative(packageRoot, engagementGatewayLiteValidator)}`,
  );
  process.exit(1);
}

console.log(`Validating ${relative(packageRoot, engagementGatewayLiteValidator)}`);
run("pnpm", ["exec", "tsx", engagementGatewayLiteValidator]);

const leadDeskValidator = join(packageRoot, "scripts", "validate-lead-desk-contracts.mjs");
if (existsSync(leadDeskValidator)) {
  console.log(`Validating ${relative(packageRoot, leadDeskValidator)}`);
  run("pnpm", ["exec", "tsx", leadDeskValidator]);
}

const moduleManifestValidator = join(packageRoot, "scripts", "validate-module-manifest-contracts.mjs");
if (!existsSync(moduleManifestValidator)) {
  console.error(
    `Required validator is missing: ${relative(packageRoot, moduleManifestValidator)}`,
  );
  process.exit(1);
}

console.log(`Validating ${relative(packageRoot, moduleManifestValidator)}`);
run("pnpm", ["exec", "tsx", moduleManifestValidator]);

const screenValidator = join(packageRoot, "scripts", "validate-screen-contracts.mjs");
if (!existsSync(screenValidator)) {
  console.error(
    `Required validator is missing: ${relative(packageRoot, screenValidator)}`,
  );
  process.exit(1);
}

console.log(`Validating ${relative(packageRoot, screenValidator)}`);
run("pnpm", ["exec", "tsx", screenValidator]);
