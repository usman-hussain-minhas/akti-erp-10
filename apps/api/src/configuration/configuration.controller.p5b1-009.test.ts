import assert from 'node:assert/strict';

import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { HeaderRecord, createPhase3SessionToken } from '../security/request-context';
import { ConfigurationController } from './configuration.controller';

const AUTH_SECRET = 'phase5b1-organization-profile-secret';
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
    getOrganizationProfile: async (...args: unknown[]) => {
      calls.push({ method: 'getOrganizationProfile', args });
      return {
        organization_id: 'org-alpha',
        display_name: 'Rising Stars Academy',
        short_name: 'RS',
        logo_url: null,
        branding_config: {},
        my_modules: ['lead.desk'],
        my_role: 'manager',
        my_capabilities: ['access.policy.manage'],
      };
    },
  };

  return {
    calls,
    controller: new ConfigurationController(service as never),
  };
}

function testOrganizationProfileRouteMetadataIsExact() {
  const descriptor = Object.getOwnPropertyDescriptor(
    ConfigurationController.prototype,
    'getOrganizationProfile',
  );

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, ConfigurationController), 'platform');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'organization/profile');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.GET);
}

async function testOrganizationProfileUsesTrustedTenantContext() {
  const { controller, calls } = createController();

  const result = await controller.getOrganizationProfile(trustedHeaders());

  assert.deepEqual(calls, [
    {
      method: 'getOrganizationProfile',
      args: ['org-alpha', 'actor-alpha'],
    },
  ]);
  assert.equal(result.organization_id, 'org-alpha');
  assert.deepEqual(result.my_capabilities, ['access.policy.manage']);
}

async function run() {
  testOrganizationProfileRouteMetadataIsExact();
  await testOrganizationProfileUsesTrustedTenantContext();

  console.log('P5B1-009 organization profile controller tests passed.');
}

void run();
