import assert from 'node:assert/strict';

import { accessCoreCapabilitySeedDefinitions } from '@akti/contracts/access-core-capability-seed';
import { accessCoreModuleManifest } from '@akti/contracts/access-core-module-manifest';

const SHELL_ACCESS = 'platform.shell.access';
const ACCESS_POLICY_MANAGE = 'access.policy.manage';

function findCapability(key: string) {
  return accessCoreModuleManifest.capabilities.find((capability) => capability.key === key);
}

function findPermission(key: string) {
  return accessCoreModuleManifest.permissions.find((permission) => permission.key === key);
}

function findSeed(key: string) {
  return accessCoreCapabilitySeedDefinitions.find((seed) => seed.capability_key === key);
}

const shellCapability = findCapability(SHELL_ACCESS);
const policyCapability = findCapability(ACCESS_POLICY_MANAGE);
const shellPermission = findPermission(SHELL_ACCESS);
const policyPermission = findPermission(ACCESS_POLICY_MANAGE);
const shellSeed = findSeed(SHELL_ACCESS);
const policySeed = findSeed(ACCESS_POLICY_MANAGE);

assert.ok(shellCapability, 'platform.shell.access capability must be declared');
assert.ok(shellPermission, 'platform.shell.access permission must be declared');
assert.ok(shellSeed, 'platform.shell.access seed must be declared');

assert.ok(policyCapability, 'access.policy.manage capability must remain declared');
assert.ok(policyPermission, 'access.policy.manage permission must remain declared');
assert.ok(policySeed, 'access.policy.manage seed must remain declared');

assert.notEqual(shellCapability.key, policyCapability.key);
assert.notEqual(shellPermission.key, policyPermission.key);
assert.notEqual(shellSeed.capability_key, policySeed.capability_key);

assert.equal(shellCapability.module_key, 'core.access');
assert.equal(shellCapability.risk_level, 'low');
assert.equal(shellCapability.requires_permission, true);
assert.equal(shellCapability.requires_reauth, false);
assert.equal(shellCapability.requires_audit, false);
assert.equal(shellCapability.gatekeeper_required, false);
assert.equal(shellCapability.approval_chain_required, false);
assert.equal(shellCapability.input_schema, null);
assert.equal(shellCapability.output_schema, null);

assert.equal(shellPermission.module_key, 'core.access');
assert.deepEqual(shellPermission.allowed_scope_types, ['organization']);

assert.equal(shellSeed.permission_key, SHELL_ACCESS);
assert.equal(shellSeed.module_key, 'core.access');
assert.equal(shellSeed.risk_level, 'low');
assert.equal(shellSeed.requires_permission, true);
assert.equal(shellSeed.gatekeeper_required, false);
assert.equal(shellSeed.approval_chain_required, false);
assert.deepEqual(shellSeed.allowed_scope_types, ['organization']);

assert.equal(policyCapability.risk_level, 'high');
assert.equal(policyCapability.requires_permission, true);
assert.equal(policyCapability.requires_audit, true);
assert.equal(policyCapability.gatekeeper_required, true);
assert.equal(policySeed.risk_level, 'high');
assert.equal(policySeed.gatekeeper_required, true);

assert.equal(
  accessCoreModuleManifest.gatekeeper_hooks.some((hook) => hook.capability_key === SHELL_ACCESS),
  false,
  'platform.shell.access must not be wired as a Gatekeeper management capability',
);
assert.equal(
  accessCoreModuleManifest.degraded_mode_behavior.disabled_capabilities.includes(SHELL_ACCESS),
  false,
  'platform.shell.access must not inherit access.policy.manage degraded-mode disabling',
);

console.log('P5B-004a platform.shell.access capability seed proof passed.');
