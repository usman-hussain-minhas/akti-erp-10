import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';
import { engagementGatewayLiteModuleManifest } from '@akti/contracts/engagement-gateway-lite-module-manifest';
import { leadDeskCoreModuleManifest } from '@akti/contracts/lead-desk-core-module-manifest';

const nativeImport = new Function('specifier', 'return import(specifier)') as <T>(specifier: string) => Promise<T>;

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
    assert.ok(manifest.display_metadata.display_name.length > 0);
    assert.ok(manifest.display_metadata.display_description.length > 0);
    assert.match(manifest.display_metadata.icon_key, /^[a-z][a-z0-9]*(?:[_.-][a-z0-9]+)*$/);
  }

  assert.equal(leadDeskCoreModuleManifest.module_key, 'lead.desk');
  assert.equal(leadDeskCoreModuleManifest.display_metadata.display_name, 'CRM');
  assert.equal(leadDeskCoreModuleManifest.display_metadata.route, '/lead-desk');
  assert.equal(leadDeskCoreModuleManifest.display_metadata.category, 'business');

  for (const manifest of manifests) {
    assert.notEqual(manifest.display_metadata.display_name, 'Settings');
    assert.notEqual(manifest.display_metadata.display_name, 'Diagnostics');
  }

  assert.equal(accessCoreModuleManifest.display_metadata.route, null);
  assert.equal(engagementGatewayLiteModuleManifest.display_metadata.route, null);
  assert.equal(internalFixtureModuleManifest.display_metadata.route, null);

  const invalid = {
    ...leadDeskCoreModuleManifest,
    display_metadata: {
      ...leadDeskCoreModuleManifest.display_metadata,
      route: 'relative/path',
    },
  };
  const result = ModuleManifestSchema.safeParse(invalid);
  assert.equal(result.success, false);

  console.log('P5B1-012 module display metadata tests passed.');
}

void run();
