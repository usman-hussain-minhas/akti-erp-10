import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { accessCoreCapabilitySeedDefinitions } from '@akti/contracts/access-core-capability-seed';
import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';

import { assertAccessCoreSeedBoundary } from './module-registry.service';

const source = readFileSync('src/module-registry/module-registry.service.ts', 'utf8');

assert.doesNotThrow(() =>
  assertAccessCoreSeedBoundary(accessCoreModuleManifest, accessCoreCapabilitySeedDefinitions),
);

for (const capabilityKey of ['platform.crm.access', 'platform.modules.view']) {
  assert.ok(
    accessCoreCapabilitySeedDefinitions.some((seed) => seed.capability_key === capabilityKey),
    `${capabilityKey} must be present in the Access Core seed contract`,
  );
  assert.match(
    source,
    new RegExp(capabilityKey.replaceAll('.', '\\.')),
    `${capabilityKey} must be present in the module-registry approved seed boundary`,
  );
}

console.log('P5B1-010 Module Registry seed boundary tests passed.');
