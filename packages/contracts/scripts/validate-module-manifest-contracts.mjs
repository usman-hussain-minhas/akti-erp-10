import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function findModuleManifestContracts(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const entries = readdirSync(dir).sort();
  const files = [];

  for (const entry of entries) {
    if (entry === "dist" || entry === "node_modules" || entry === "scripts") {
      continue;
    }

    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findModuleManifestContracts(fullPath));
    } else if (entry.endsWith(".module-manifest.contract.ts")) {
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

const manifestContracts = findModuleManifestContracts(packageRoot);

if (manifestContracts.length === 0) {
  console.error("Required module manifest contract files are missing.");
  process.exit(1);
}

for (const manifestContract of manifestContracts) {
  console.log(`Validating module manifest ${relative(packageRoot, manifestContract)}`);
  run("pnpm", ["exec", "tsx", manifestContract]);
}

console.log(`Validated ${manifestContracts.length} module manifest contract file(s).`);
