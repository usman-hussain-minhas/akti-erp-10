import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';
import { engagementGatewayLiteModuleManifest } from '@akti/contracts/engagement-gateway-lite-module-manifest';
import { leadDeskCoreModuleManifest } from '@akti/contracts/lead-desk-core-module-manifest';

const nativeImport = new Function('specifier', 'return import(specifier)') as <T>(specifier: string) => Promise<T>;

const allowedVisibilityStates = ['available', 'requires_setup', 'locked', 'coming_soon', 'hidden'] as const;
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
    assert.ok(
      allowedVisibilityStates.includes(manifest.display_metadata.visibility_state),
      `${manifest.module_key} has an allowed visibility_state`,
    );
  }

  for (const visibility_state of allowedVisibilityStates) {
    const candidate = {
      ...leadDeskCoreModuleManifest,
      display_metadata: {
        ...leadDeskCoreModuleManifest.display_metadata,
        visibility_state,
      },
    };

    assert.doesNotThrow(() => ModuleManifestSchema.parse(candidate));
  }

  assert.equal(leadDeskCoreModuleManifest.display_metadata.visibility_state, 'available');
  assert.equal(accessCoreModuleManifest.display_metadata.visibility_state, 'hidden');
  assert.equal(engagementGatewayLiteModuleManifest.display_metadata.visibility_state, 'hidden');
  assert.equal(internalFixtureModuleManifest.display_metadata.visibility_state, 'hidden');

  const invalid = {
    ...leadDeskCoreModuleManifest,
    display_metadata: {
      ...leadDeskCoreModuleManifest.display_metadata,
      visibility_state: 'active',
    },
  };
  const result = ModuleManifestSchema.safeParse(invalid);
  assert.equal(result.success, false);

  console.log('P5B1-013 module visibility_state tests passed.');
}

void run();
