import assert from 'node:assert/strict';

import { ConflictException } from '@nestjs/common';
import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';
import { engagementGatewayLiteModuleManifest } from '@akti/contracts/engagement-gateway-lite-module-manifest';
import { leadDeskCoreModuleManifest } from '@akti/contracts/lead-desk-core-module-manifest';

import { ModuleRegistryService, loadRegisteredRuntimeModuleKeys } from './module-registry.service';

async function testExistingRuntimeManifestsLoadWithNewFields() {
  const keys = await loadRegisteredRuntimeModuleKeys();

  assert.deepEqual(keys, ['core.access', 'engagement.gateway', 'lead.desk']);
}

function testModuleRegistryRejectsMalformedNewFields() {
  const service = new ModuleRegistryService({} as never);

  assert.throws(
    () =>
      service.registerMenuContributions({
        ...leadDeskCoreModuleManifest,
        display_metadata: {
          ...leadDeskCoreModuleManifest.display_metadata,
          visibility_state: 'active',
        },
      } as never),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerMenuContributions({
        ...leadDeskCoreModuleManifest,
        required_capabilities: ['platform.unknown'],
      } as never),
    ConflictException,
  );

  assert.throws(
    () =>
      service.registerMenuContributions({
        ...leadDeskCoreModuleManifest,
        ai_data_classification: 'provider_enabled',
      } as never),
    ConflictException,
  );
}

function testExistingManifestNewFieldsArePreservedInRuntimeShape() {
  assert.equal(accessCoreModuleManifest.display_metadata.visibility_state, 'hidden');
  assert.equal(engagementGatewayLiteModuleManifest.ai_data_classification, 'restricted');
  assert.equal(leadDeskCoreModuleManifest.required_capabilities.includes('platform.crm.access'), true);
  assert.equal(leadDeskCoreModuleManifest.display_metadata.display_name, 'CRM');
}

async function run() {
  await testExistingRuntimeManifestsLoadWithNewFields();
  testModuleRegistryRejectsMalformedNewFields();
  testExistingManifestNewFieldsArePreservedInRuntimeShape();

  console.log('P5B1-015 Module Registry manifest-field validation tests passed.');
}

void run();
