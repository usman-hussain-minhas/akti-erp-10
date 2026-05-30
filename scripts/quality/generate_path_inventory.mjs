#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUTPUT_JSON = "docs/process/core/v0_0_2/path_migration_inventory.json";
const OUTPUT_MD = "docs/process/core/v0_0_2/path_migration_inventory.md";
const EXCEPTIONS_PATH = ".path_policy_exceptions.json";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gitLsFiles() {
  return git(["ls-files"]).split("\n").filter(Boolean).sort();
}

function hasHyphenatedSegment(path) {
  return path.split("/").some((segment) => segment.includes("-"));
}

function topLevel(path) {
  return path.split("/")[0] || ".";
}

function guessCategory(path) {
  if (path.startsWith("codex-review/")) return "historical_evidence";
  if (path === ".github/workflows/phase1-validation.yml") return "tool_convention";
  if (path === "pnpm-lock.yaml" || path.endsWith("next-env.d.ts")) return "tool_convention";
  if (path.startsWith("apps/web/app/lead-desk/")) return "route_api_public_surface";
  if (path.startsWith("apps/api/src/lead-desk/")) return "route_api_public_surface";

  const publicSegments = [
    "access-core",
    "ai-proxy",
    "data-controls",
    "engagement-gateway",
    "file-service",
    "import-export",
    "module-registry",
    "organization-setup",
    "platform-health",
    "platform-observability"
  ];

  if (publicSegments.some((segment) => path.includes(`/${segment}/`) || path.includes(`/${segment}.`))) {
    return "route_api_public_surface";
  }

  if (path.startsWith("docs/")) return "docs_artifact_candidate";
  if (path.startsWith("apps/") || path.startsWith("packages/") || path.startsWith("scripts/")) {
    return "internal_code_import_candidate";
  }

  return "review_required";
}

function countBy(items, getKey) {
  const counts = {};
  for (const item of items) {
    const key = getKey(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

const trackedPaths = gitLsFiles();
const hyphenatedPaths = trackedPaths.filter(hasHyphenatedSegment);
const compliantPaths = trackedPaths.filter((path) => !hasHyphenatedSegment(path));
const categoryGuesses = countBy(hyphenatedPaths, guessCategory);
const topLevelAreaCounts = countBy(hyphenatedPaths, topLevel);
const exceptionConfig = JSON.parse(readFileSync(EXCEPTIONS_PATH, "utf8"));

const inventory = {
  status: "ACTIVE_LEGACY_BASELINE",
  generated_for: "core_v0_0_2_underscore_migration_guardrails",
  generated_at: new Date().toISOString(),
  git_head: git(["rev-parse", "HEAD"]),
  total_tracked_files: trackedPaths.length,
  hyphenated_path_count: hyphenatedPaths.length,
  underscore_compliant_path_count: compliantPaths.length,
  exception_count: exceptionConfig.exceptions.length,
  top_level_area_counts: topLevelAreaCounts,
  category_guesses: categoryGuesses,
  hyphenated_paths: hyphenatedPaths
};

mkdirSync(dirname(OUTPUT_JSON), { recursive: true });
writeFileSync(OUTPUT_JSON, `${JSON.stringify(inventory, null, 2)}\n`);

const markdown = [
  "# AKTI Core v0.0.2 Path Migration Inventory",
  "",
  "Status: ACTIVE_LEGACY_BASELINE",
  "",
  "This inventory captures tracked hyphenated paths that existed when PR 31 introduced the lower_snake_case path checker. It is a guardrail baseline, not permission to create new hyphenated AKTI-generated paths.",
  "",
  "## Summary",
  "",
  `- Generated at: ${inventory.generated_at}`,
  `- Git HEAD: ${inventory.git_head}`,
  `- Total tracked files: ${inventory.total_tracked_files}`,
  `- Hyphenated path count: ${inventory.hyphenated_path_count}`,
  `- Underscore-compliant path count: ${inventory.underscore_compliant_path_count}`,
  `- Explicit exception count: ${inventory.exception_count}`,
  "",
  "## Top-Level Area Counts",
  "",
  "| Area | Count |",
  "| --- | ---: |",
  ...Object.entries(topLevelAreaCounts).map(([area, count]) => `| \`${area}\` | ${count} |`),
  "",
  "## Category Guesses",
  "",
  "| Category | Count |",
  "| --- | ---: |",
  ...Object.entries(categoryGuesses).map(([category, count]) => `| \`${category}\` | ${count} |`),
  "",
  "## Hyphenated Paths",
  "",
  ...hyphenatedPaths.map((path) => `- \`${path}\``),
  ""
].join("\n");

writeFileSync(OUTPUT_MD, markdown);

console.log(JSON.stringify({
  status: "PASS",
  output_json: OUTPUT_JSON,
  output_md: OUTPUT_MD,
  total_tracked_files: inventory.total_tracked_files,
  hyphenated_path_count: inventory.hyphenated_path_count,
  underscore_compliant_path_count: inventory.underscore_compliant_path_count,
  exception_count: inventory.exception_count
}, null, 2));
