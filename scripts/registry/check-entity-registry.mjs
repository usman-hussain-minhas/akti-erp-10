import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { generatedRegistryPath, renderEntityRegistry } from "./generate-entity-registry.mjs";

// generated/entity-registry.generated.json is generated and should not be edited manually.

function main() {
  let expected;
  try {
    expected = readFileSync(generatedRegistryPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("generated/entity-registry.generated.json is missing. Run pnpm registry:generate.");
      process.exit(1);
    }

    throw error;
  }

  const tempDir = mkdtempSync(join(tmpdir(), "akti-entity-registry-"));
  const tempFile = join(tempDir, "entity-registry.generated.json");

  try {
    const actual = renderEntityRegistry();
    writeFileSync(tempFile, actual);

    if (actual !== expected) {
      console.error("Entity Registry drift detected. Run pnpm registry:generate and commit the updated output.");
      process.exit(1);
    }

    console.log("Entity Registry is up to date.");
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main();
