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

function declaredOrConsumedCapabilities(manifest: {
  capabilities: Array<{ key: string }>;
  capabilities_consumed: Array<{ capability_key: string }>;
}) {
  return new Set([
    ...manifest.capabilities.map((capability) => capability.key),
    ...manifest.capabilities_consumed.map((capability) => capability.capability_key),
  ]);
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
    assert.ok(Array.isArray(manifest.required_capabilities), `${manifest.module_key} must declare required_capabilities[]`);

    const declared = declaredOrConsumedCapabilities(manifest);
    for (const capabilityKey of manifest.required_capabilities) {
      assert.equal(
        declared.has(capabilityKey),
        true,
        `${manifest.module_key} required_capabilities[] must reference a local or consumed capability`,
      );
    }
  }

  assert.deepEqual(accessCoreModuleManifest.required_capabilities, []);
  assert.deepEqual(leadDeskCoreModuleManifest.required_capabilities, ['platform.crm.access']);
  assert.deepEqual(
    leadDeskCoreModuleManifest.capabilities_consumed.some(
      (capability) =>
        capability.capability_key === 'platform.crm.access' &&
        capability.provider_module_key === 'core.access',
    ),
    true,
  );

  const invalid = {
    ...accessCoreModuleManifest,
    required_capabilities: ['platform.unknown'],
  };
  const result = ModuleManifestSchema.safeParse(invalid);
  assert.equal(result.success, false);

  console.log('P5B1-011 module manifest required_capabilities tests passed.');
}

void run();
