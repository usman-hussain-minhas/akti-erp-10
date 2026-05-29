import assert from 'node:assert/strict';

import { accessCoreCapabilitySeedDefinitions } from '@akti/contracts/access-core-capability-seed';
import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';

const REQUIRED_VIEW_CAPABILITIES = ['platform.crm.access', 'platform.modules.view'] as const;

function capabilityByKey(key: string) {
  return accessCoreModuleManifest.capabilities.find((capability) => capability.key === key);
}

function permissionByKey(key: string) {
  return accessCoreModuleManifest.permissions.find((permission) => permission.key === key);
}

function seedByKey(key: string) {
  return accessCoreCapabilitySeedDefinitions.find((seed) => seed.capability_key === key);
}

function assertLowRiskViewCapability(key: (typeof REQUIRED_VIEW_CAPABILITIES)[number]) {
  const capability = capabilityByKey(key);
  const permission = permissionByKey(key);
  const seed = seedByKey(key);

  assert.ok(capability, `${key} capability must exist`);
  assert.ok(permission, `${key} permission must exist`);
  assert.ok(seed, `${key} seed must exist`);

  assert.equal(capability?.module_key, 'core.access');
  assert.equal(capability?.risk_level, 'low');
  assert.equal(capability?.requires_permission, true);
  assert.equal(capability?.requires_reauth, false);
  assert.equal(capability?.requires_audit, false);
  assert.equal(capability?.gatekeeper_required, false);
  assert.equal(capability?.approval_chain_required, false);
  assert.equal(capability?.input_schema, null);
  assert.equal(capability?.output_schema, null);

  assert.equal(seed?.permission_key, key);
  assert.equal(seed?.module_key, 'core.access');
  assert.equal(seed?.risk_level, 'low');
  assert.equal(seed?.requires_permission, true);
  assert.equal(seed?.gatekeeper_required, false);
  assert.equal(seed?.approval_chain_required, false);
  assert.deepEqual(seed?.allowed_scope_types, ['organization']);
  assert.deepEqual(permission?.allowed_scope_types, ['organization']);
}

function assertNoDestructiveAuthority() {
  for (const key of REQUIRED_VIEW_CAPABILITIES) {
    const capability = capabilityByKey(key);
    const permission = permissionByKey(key);
    const seed = seedByKey(key);
    const raw = JSON.stringify({ capability, permission, seed }).toLowerCase();

    assert.equal(raw.includes('delete.'), false);
    assert.equal(raw.includes('import.'), false);
    assert.equal(raw.includes('export.'), false);
    assert.equal(raw.includes('backup.'), false);
    assert.equal(raw.includes('restore.'), false);
    assert.equal(raw.includes('gatekeeper bypass'), false);
  }
}

for (const capabilityKey of REQUIRED_VIEW_CAPABILITIES) {
  assertLowRiskViewCapability(capabilityKey);
}
assertNoDestructiveAuthority();

console.log('P5B1-010 Access Core capability seed tests passed.');
