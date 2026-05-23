import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SOURCE_ROOT = join(process.cwd(), 'src');
const BOUNDARY_TEST = 'prisma/prisma-import-boundary.test.ts';
const BRIDGE_FILE = 'prisma/prisma-client.ts';

const FORBIDDEN_GENERATED_NODE_MODULES = ['node_modules', '.prisma', 'client'].join('/');
const FORBIDDEN_STANDARD_PACKAGE = ['@prisma', 'client'].join('/');
const GENERATED_CLIENT_PATH = ['generated', 'prisma-client'].join('/');

function listTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory)
    .flatMap((entry) => {
      const fullPath = join(directory, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        return listTypeScriptFiles(fullPath);
      }

      return fullPath.endsWith('.ts') ? [fullPath] : [];
    })
    .sort();
}

function toRepoRelativeApiSourcePath(path: string) {
  return relative(SOURCE_ROOT, path).replaceAll('\\', '/');
}

function run() {
  const violations: string[] = [];

  for (const path of listTypeScriptFiles(SOURCE_ROOT)) {
    const relativePath = toRepoRelativeApiSourcePath(path);
    if (relativePath === BOUNDARY_TEST) {
      continue;
    }

    const source = readFileSync(path, 'utf8');

    if (source.includes(FORBIDDEN_GENERATED_NODE_MODULES)) {
      violations.push(`${relativePath} imports Prisma through generated node_modules internals`);
    }

    if (source.includes(FORBIDDEN_STANDARD_PACKAGE)) {
      violations.push(`${relativePath} imports Prisma directly from the standard package`);
    }

    if (relativePath !== BRIDGE_FILE && source.includes(GENERATED_CLIENT_PATH)) {
      violations.push(`${relativePath} imports the generated Prisma client without the bridge`);
    }
  }

  assert.deepEqual(violations, []);
  console.log('prisma-import-boundary tests passed');
}

run();
