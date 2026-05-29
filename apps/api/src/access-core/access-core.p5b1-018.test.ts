import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { accessCoreCapabilitySeedDefinitions } from '@akti/contracts/access-core-capability-seed';
import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';

const dataControlsViewCapability = 'platform.data.controls.view';
const reservedFutureCapabilities = [
  'platform.import_export.manage',
  'platform.export.run',
  'platform.import.run',
  'platform.backup_restore.manage',
];

function readImportExportSources() {
  const dir = join(process.cwd(), 'src/import-export');
  return readdirSync(dir)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => readFileSync(join(dir, file), 'utf8'))
    .join('\n');
}

function testDataControlsViewCapabilityIsGrantableSubstrate() {
  const seed = accessCoreCapabilitySeedDefinitions.find(
    (capability) => capability.capability_key === dataControlsViewCapability,
  );
  const manifestCapability = accessCoreModuleManifest.capabilities.find(
    (capability) => capability.key === dataControlsViewCapability,
  );
  const manifestPermission = accessCoreModuleManifest.permissions.find(
    (permission) => permission.key === dataControlsViewCapability,
  );

  assert.ok(seed, `${dataControlsViewCapability} must be in Access Core seed definitions`);
  assert.ok(manifestCapability, `${dataControlsViewCapability} must be in Access Core module manifest`);
  assert.ok(manifestPermission, `${dataControlsViewCapability} must have a matching permission`);
  assert.equal(seed?.risk_level, 'low');
  assert.equal(seed?.gatekeeper_required, false);
  assert.equal(seed?.approval_chain_required, false);
  assert.equal(seed?.requires_permission, true);
  assert.deepEqual(seed?.allowed_scope_types, ['organization']);
}

function testFutureExecutionCapabilitiesRemainReservedOnly() {
  const seedKeys = new Set(accessCoreCapabilitySeedDefinitions.map((capability) => capability.capability_key));
  const manifestCapabilityKeys = new Set(accessCoreModuleManifest.capabilities.map((capability) => capability.key));
  const manifestPermissionKeys = new Set(accessCoreModuleManifest.permissions.map((permission) => permission.key));

  for (const capabilityKey of reservedFutureCapabilities) {
    assert.equal(seedKeys.has(capabilityKey), false, `${capabilityKey} must not be seeded in Phase 5B1`);
    assert.equal(manifestCapabilityKeys.has(capabilityKey), false, `${capabilityKey} must not be manifest-grantable`);
    assert.equal(manifestPermissionKeys.has(capabilityKey), false, `${capabilityKey} must not have permission authority`);
  }
}

function testRegistryGuidanceAndNoRuntimeExecutionWereAdded() {
  const registry = readFileSync(
    join(process.cwd(), '../../docs/process/AKTI_ERP_Platform_Capability_Namespace_Registry_v1.md'),
    'utf8',
  );
  const importExportSources = readImportExportSources();

  assert.match(registry, /platform\.data\.controls\.view.*seeded/);
  for (const capabilityKey of reservedFutureCapabilities) {
    assert.match(registry, new RegExp(`${capabilityKey.replaceAll('.', '\\.')}.*reserved`));
    assert.equal(importExportSources.includes(capabilityKey), false);
  }
}

testDataControlsViewCapabilityIsGrantableSubstrate();
testFutureExecutionCapabilitiesRemainReservedOnly();
testRegistryGuidanceAndNoRuntimeExecutionWereAdded();

console.log('P5B1-018 data-control capability namespace tests passed.');
