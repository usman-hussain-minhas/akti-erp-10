import assert from 'node:assert/strict';

import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { HeaderRecord, createPhase3SessionToken } from '../security/request-context';
import { ConfigurationController } from './configuration.controller';

const AUTH_SECRET = 'phase5b1-effective-branding-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-alpha', actorUserId = 'actor-alpha'): HeaderRecord {
  return {
    authorization: `Bearer ${createPhase3SessionToken(
      {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        issued_at: new Date(Date.now() - 60_000).toISOString(),
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      AUTH_SECRET,
    )}`,
  };
}

function createController() {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const service = {
    getEffectiveBranding: async (...args: unknown[]) => {
      calls.push({ method: 'getEffectiveBranding', args });
      return {
        product_name: 'Esbla Spark',
        logo_url: null,
        theme_mode: 'system',
        primary_color: null,
        accent_color: null,
      };
    },
  };

  return {
    calls,
    controller: new ConfigurationController(service as never),
  };
}

function testEffectiveBrandingRouteMetadataIsExact() {
  const descriptor = Object.getOwnPropertyDescriptor(
    ConfigurationController.prototype,
    'getEffectiveBranding',
  );

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, ConfigurationController), 'platform');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'branding/effective');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

function testExistingConfigurationRoutesRemainUnderConfigurationPath() {
  const portalDescriptor = Object.getOwnPropertyDescriptor(ConfigurationController.prototype, 'getPortalMode');
  const tenantDescriptor = Object.getOwnPropertyDescriptor(ConfigurationController.prototype, 'getTenantConfiguration');

  assert.ok(portalDescriptor?.value);
  assert.ok(tenantDescriptor?.value);
  assert.equal(
    Reflect.getMetadata(PATH_METADATA, portalDescriptor.value),
    'configuration/organizations/:organization_id/portal-mode',
  );
  assert.equal(
    Reflect.getMetadata(PATH_METADATA, tenantDescriptor.value),
    'configuration/organizations/:organization_id/tenant-config',
  );
}

async function testEffectiveBrandingUsesTrustedTenantContext() {
  const { controller, calls } = createController();

  const result = await controller.getEffectiveBranding(trustedHeaders());

  assert.deepEqual(calls, [
    {
      method: 'getEffectiveBranding',
      args: ['org-alpha', 'actor-alpha'],
    },
  ]);
  assert.deepEqual(result, {
    product_name: 'Esbla Spark',
    logo_url: null,
    theme_mode: 'system',
    primary_color: null,
    accent_color: null,
  });
}

async function run() {
  testEffectiveBrandingRouteMetadataIsExact();
  testExistingConfigurationRoutesRemainUnderConfigurationPath();
  await testEffectiveBrandingUsesTrustedTenantContext();

  console.log('P5B1-008 effective branding controller tests passed.');
}

void run();
