import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';
import { engagementGatewayLiteModuleManifest } from '@akti/contracts/engagement-gateway-lite-module-manifest';
import { leadDeskCoreModuleManifest } from '@akti/contracts/lead-desk-core-module-manifest';

const nativeImport = new Function('specifier', 'return import(specifier)') as <T>(specifier: string) => Promise<T>;

const allowedClassifications = ['readable', 'restricted', 'prohibited'] as const;
type ModuleManifest = typeof accessCoreModuleManifest;
type ModuleManifestSchemaLike = {
  parse(input: unknown): unknown;
  safeParse(input: unknown): { success: boolean };
};

async function loadSourceModule<T>(path: string): Promise<T> {
  return nativeImport<T>(pathToFileURL(resolve(process.cwd(), '../..', path)).href);
}

async function run() {
  const [{ internalFixtureModuleManifest }, { ModuleManifestSchema }] = await Promise.all([
    loadSourceModule<{ internalFixtureModuleManifest: ModuleManifest }>(
      'packages/contracts/internal-fixture.module-manifest.contract.ts',
    ),
    loadSourceModule<{ ModuleManifestSchema: ModuleManifestSchemaLike }>('packages/contracts/module-manifest.schema.ts'),
  ]);

  const manifests = [
    accessCoreModuleManifest,
    engagementGatewayLiteModuleManifest,
    internalFixtureModuleManifest,
    leadDeskCoreModuleManifest,
  ];

  for (const manifest of manifests) {
    assert.doesNotThrow(() => ModuleManifestSchema.parse(manifest));
    assert.ok(allowedClassifications.includes(manifest.ai_data_classification));
  }

  for (const ai_data_classification of allowedClassifications) {
    assert.doesNotThrow(() =>
      ModuleManifestSchema.parse({
        ...leadDeskCoreModuleManifest,
        ai_data_classification,
      }),
    );
  }

  assert.equal(accessCoreModuleManifest.ai_data_classification, 'prohibited');
  assert.equal(leadDeskCoreModuleManifest.ai_data_classification, 'restricted');
  assert.equal(engagementGatewayLiteModuleManifest.ai_data_classification, 'restricted');
  assert.equal(internalFixtureModuleManifest.ai_data_classification, 'readable');

  const invalid = {
    ...leadDeskCoreModuleManifest,
    ai_data_classification: 'provider_enabled',
  };
  const result = ModuleManifestSchema.safeParse(invalid);
  assert.equal(result.success, false);

  const changedSources = [
    'packages/contracts/module-manifest.schema.ts',
    'packages/contracts/access-core.module-manifest.contract.ts',
    'packages/contracts/engagement-gateway-lite.module-manifest.contract.ts',
    'packages/contracts/lead-desk-core.module-manifest.contract.ts',
    'packages/contracts/internal-fixture.module-manifest.contract.ts',
  ].map((path) => readFileSync(resolve(process.cwd(), '../..', path), 'utf8').toLowerCase());

  for (const source of changedSources) {
    assert.equal(source.includes('openai'), false);
    assert.equal(source.includes('anthropic'), false);
    assert.equal(source.includes('ai runtime'), false);
  }

  console.log('P5B1-014 module AI data classification tests passed.');
}

void run();
