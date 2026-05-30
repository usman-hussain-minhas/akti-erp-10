import assert from 'node:assert/strict';

import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';
import { engagementGatewayLiteModuleManifest } from '@akti/contracts/engagement-gateway-lite-module-manifest';
import { leadDeskCoreModuleManifest } from '@akti/contracts/lead-desk-core-module-manifest';

const manifests = [
  accessCoreModuleManifest,
  engagementGatewayLiteModuleManifest,
  leadDeskCoreModuleManifest,
];

function testApprovedManifestsExposeDisplayMetadata() {
  for (const manifest of manifests) {
    assert.ok(manifest.display_metadata.display_name.trim(), `${manifest.module_key} has display name`);
    assert.ok(manifest.display_metadata.display_description.trim(), `${manifest.module_key} has display description`);
    assert.ok(manifest.display_metadata.icon_key.trim(), `${manifest.module_key} has icon key`);
    assert.ok(
      ['available', 'requires_setup', 'locked', 'coming_soon', 'hidden'].includes(
        manifest.display_metadata.visibility_state,
      ),
      `${manifest.module_key} has approved visibility_state`,
    );

    if (manifest.display_metadata.display_features !== undefined) {
      assert.ok(Array.isArray(manifest.display_metadata.display_features), `${manifest.module_key} feature list is an array`);
      assert.ok(
        manifest.display_metadata.display_features.every((feature) => feature.trim().length > 0),
        `${manifest.module_key} feature entries are non-empty`,
      );
    }
  }
}

function testDisplayMetadataDoesNotCreateFutureModuleSurfaces() {
  const displayNames = manifests.map((manifest) => manifest.display_metadata.display_name.toLowerCase());
  const featureText = manifests
    .flatMap((manifest) => manifest.display_metadata.display_features ?? [])
    .join(' ')
    .toLowerCase();

  for (const forbidden of ['admissions', 'finance', 'hr', 'analytics / operations', 'marketplace', 'workflow builder', 'ai assistant']) {
    assert.equal(displayNames.includes(forbidden), false, `display metadata must not create ${forbidden} as an active module`);
    assert.equal(featureText.includes(forbidden), false, `display_features must not claim ${forbidden}`);
  }
}

function run() {
  testApprovedManifestsExposeDisplayMetadata();
  testDisplayMetadataDoesNotCreateFutureModuleSurfaces();
  console.log('P5C-012 module metadata verification passed.');
}

run();
