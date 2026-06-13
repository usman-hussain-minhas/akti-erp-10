#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const EXCEPTIONS_PATH = ".path_policy_exceptions.json";

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Unable to read JSON at ${path}: ${error.message}`);
  }
}

function gitLsFiles() {
  const output = execFileSync("git", ["ls-files"], { encoding: "utf8" });
  return output.split("\n").filter(Boolean).sort();
}

function hasHyphenatedSegment(path) {
  return path.split("/").some((segment) => segment.includes("-"));
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}

function globToRegex(glob) {
  let source = "";

  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i];
    const next = glob[i + 1];

    if (char === "*" && next === "*") {
      source += ".*";
      i += 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else {
      source += escapeRegex(char);
    }
  }

  return new RegExp(`^${source}$`);
}

function validateConfig(config) {
  if (!config || typeof config !== "object") fail("Exception registry must be an object");
  if (config.status !== "ACTIVE") fail("Exception registry status must be ACTIVE");
  if (config.policy !== "lower_snake_case_new_paths") fail("Unsupported path policy");
  if (!config.legacy_baseline || typeof config.legacy_baseline.path !== "string") {
    fail("Exception registry must define legacy_baseline.path");
  }
  if (!Array.isArray(config.exceptions)) fail("Exception registry exceptions must be an array");

  for (const [index, exception] of config.exceptions.entries()) {
    if (!exception.path_pattern) fail(`Exception ${index} is missing path_pattern`);
    if (!exception.category) fail(`Exception ${index} is missing category`);
    if (!exception.reason) fail(`Exception ${index} is missing reason`);
    if (typeof exception.review_required_before_new_match !== "boolean") {
      fail(`Exception ${index} must define review_required_before_new_match as a boolean`);
    }
  }
}

function loadLegacyBaseline(path) {
  if (!existsSync(path)) fail(`Legacy baseline inventory is missing: ${path}`);
  const inventory = readJson(path);
  const paths = inventory.hyphenated_paths;

  if (!Array.isArray(paths)) {
    fail(`Legacy baseline inventory ${path} must contain hyphenated_paths`);
  }

  return new Set(paths);
}

function groupBy(items, getKey) {
  const grouped = new Map();

  for (const item of items) {
    const key = getKey(item);
    const values = grouped.get(key) || [];
    values.push(item);
    grouped.set(key, values);
  }

  return grouped;
}

const config = readJson(EXCEPTIONS_PATH);
validateConfig(config);

const trackedPaths = gitLsFiles();
const legacyBaseline = loadLegacyBaseline(config.legacy_baseline.path);
const exceptionMatchers = config.exceptions.map((exception) => ({
  ...exception,
  regex: globToRegex(exception.path_pattern)
}));

const violations = [];
const exceptionMatches = [];

for (const path of trackedPaths) {
  if (!hasHyphenatedSegment(path)) continue;
  if (legacyBaseline.has(path)) continue;

  const explicitException = exceptionMatchers.find((exception) => exception.regex.test(path));

  if (explicitException) {
    exceptionMatches.push({
      path,
      category: explicitException.category,
      pattern: explicitException.path_pattern
    });
    continue;
  }

  violations.push(path);
}

console.log("Esbla Spark lower_snake_case path policy check");
console.log(`Total tracked paths: ${trackedPaths.length}`);
console.log(`Violation count: ${violations.length}`);
console.log(`Exception count: ${exceptionMatches.length}`);

if (exceptionMatches.length) {
  console.log("Exceptions by category:");
  const byCategory = groupBy(exceptionMatches, (match) => match.category);
  for (const [category, matches] of [...byCategory.entries()].sort()) {
    console.log(`- ${category}: ${matches.length}`);
    for (const match of matches.sort((a, b) => a.path.localeCompare(b.path))) {
      console.log(`  - ${match.path} (${match.pattern})`);
    }
  }
}

if (violations.length) {
  console.log("Violations:");
  for (const path of violations) {
    console.log(`- ${path}`);
  }
  process.exit(1);
}

console.log("PASS: no new unapproved hyphenated tracked paths");
