import assert from 'node:assert/strict';

import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';
import { engagementGatewayLiteModuleManifest } from '@akti/contracts/engagement-gateway-lite-module-manifest';
import { leadDeskCoreModuleManifest } from '@akti/contracts/lead-desk-core-module-manifest';

import { internalFixtureModuleManifest } from '../../../../packages/contracts/internal-fixture.module-manifest.contract';
import { ModuleManifestSchema } from '../../../../packages/contracts/module-manifest.schema';

const allowedVisibilityStates = ['available', 'requires_setup', 'locked', 'coming_soon', 'hidden'] as const;
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
