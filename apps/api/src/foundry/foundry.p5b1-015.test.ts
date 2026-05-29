import assert from 'node:assert/strict';

import { FoundryService, type FoundryModuleManifestCandidate } from './foundry.service';

function manifest(overrides?: Partial<FoundryModuleManifestCandidate>): FoundryModuleManifestCandidate {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    display_metadata: {
      display_name: 'Internal Platform Fixture',
      display_description: 'Internal validation fixture.',
      icon_key: 'test-tube',
      category: 'internal',
      visibility_state: 'hidden',
      route: null,
    },
    ai_data_classification: 'readable',
    module_type: 'standard',
    version: '0.1.0',
    owner: 'platform',
    min_platform_version: '0.1.0',
    dependencies: [{ module_key: 'core.access', min_version: '0.1.0' }],
    optional_dependencies: [],
    capabilities: [
      {
        key: 'platform.fixture.read',
        module_key: 'platform.fixture',
        risk_level: 'low',
        requires_reauth: false,
        requires_audit: false,
        gatekeeper_required: false,
      },
    ],
    capabilities_consumed: [
      {
        capability_key: 'platform.shell.access',
        provider_module_key: 'core.access',
        required: true,
        min_version: '0.1.0',
      },
    ],
    required_capabilities: ['platform.fixture.read'],
    permissions: [
      {
        key: 'platform.fixture.read',
        module_key: 'platform.fixture',
        allowed_scope_types: ['organization'],
      },
    ],
    api_routes: [
      {
        method: 'GET',
        path: '/platform/fixture',
        capability_key: 'platform.fixture.read',
      },
    ],
    gatekeeper_hooks: [],
    schemas: [{ key: 'platform.fixture.read.output' }],
    migrations: [{ key: 'platform.fixture.migration' }],
    data_ownership: {
      owner_module_key: 'platform.fixture',
      tenant_scoped: true,
      entity_refs: ['platform.fixture.record'],
    },
    ...overrides,
  };
}

function testFoundryAcceptsNewManifestFieldsWhenValid() {
  const service = new FoundryService();
  const result = service.validateManifest(manifest());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.match(result.manifest_hash ?? '', /^[a-f0-9]{64}$/);
}

function testFoundryRejectsMalformedNewFields() {
  const service = new FoundryService();

  const invalid = service.validateManifest(
    manifest({
      display_metadata: {
        display_name: 'Fixture',
        display_description: 'Fixture.',
        icon_key: 'fixture',
        category: 'business',
        visibility_state: 'active',
        route: 'relative/path',
      },
      ai_data_classification: 'provider_enabled',
      required_capabilities: ['platform.unknown'],
    }),
  );

  assert.equal(invalid.valid, false);
  assert.match(invalid.errors.join('\n'), /display_metadata.visibility_state is invalid/);
  assert.match(invalid.errors.join('\n'), /display_metadata.route must be absolute/);
  assert.match(invalid.errors.join('\n'), /ai_data_classification is invalid/);
  assert.match(invalid.errors.join('\n'), /required capability platform.unknown/);
}

testFoundryAcceptsNewManifestFieldsWhenValid();
testFoundryRejectsMalformedNewFields();

console.log('P5B1-015 Foundry manifest-field validation tests passed.');
