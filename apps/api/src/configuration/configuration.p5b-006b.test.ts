import assert from 'node:assert/strict';

import { BadRequestException } from '@nestjs/common';

import { AuditLogService } from '../platform-observability/audit-log.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { ConfigurationService } from './configuration.service';

function matchesOptionalFilter(value: unknown, filter: unknown) {
  if (filter === undefined) {
    return true;
  }

  if (
    typeof filter === 'object' &&
    filter !== null &&
    'in' in filter &&
    Array.isArray((filter as { in?: unknown }).in)
  ) {
    return (filter as { in: Array<unknown> }).in.includes(value);
  }

  return value === filter;
}

function createService() {
  const state = {
    calls: [] as Array<{ fn: string; args: unknown }>,
    users: [
      { id: 'actor-alpha', organization_id: 'org-alpha' },
      { id: 'actor-beta', organization_id: 'org-beta' },
    ],
    groups: [
      { id: 'group-alpha', organization_id: 'org-alpha' },
      { id: 'group-beta', organization_id: 'org-beta' },
    ],
    memberships: [
      { organization_id: 'org-alpha', user_id: 'actor-alpha', group_id: 'group-alpha' },
      { organization_id: 'org-beta', user_id: 'actor-beta', group_id: 'group-beta' },
    ],
    assignments: [
      {
        organization_id: 'org-alpha',
        group_id: 'group-alpha',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
      },
      {
        organization_id: 'org-beta',
        group_id: 'group-beta',
        capability_key: 'access.policy.manage',
        scope_type: 'organization',
      },
    ],
    capabilities: [{ key: 'access.policy.manage' }],
    domains: [
      {
        organization_id: 'org-alpha',
        domain: 'verified.example.test',
        is_primary: true,
        verified_at: new Date('2026-01-09T00:00:00.000Z'),
      },
      {
        organization_id: 'org-alpha',
        domain: 'pending.example.test',
        is_primary: false,
        verified_at: null,
      },
      {
        organization_id: 'org-beta',
        domain: 'verified.example.test',
        is_primary: true,
        verified_at: new Date('2026-01-10T00:00:00.000Z'),
      },
    ],
  };

  const prisma = {
    user: {
      findFirst: async ({ where }: { where: { organization_id: string; id: string } }) => {
        state.calls.push({ fn: 'user.findFirst', args: where });
        return state.users.find((item) => item.organization_id === where.organization_id && item.id === where.id) ?? null;
      },
    },
    capability: {
      findUnique: async ({ where }: { where: { key: string } }) => {
        state.calls.push({ fn: 'capability.findUnique', args: where });
        return state.capabilities.find((item) => item.key === where.key) ?? null;
      },
    },
    userGroup: {
      findMany: async ({ where }: { where: { organization_id: string; user_id?: string } }) => {
        state.calls.push({ fn: 'userGroup.findMany', args: where });
        return state.memberships.filter(
          (item) => item.organization_id === where.organization_id && matchesOptionalFilter(item.user_id, where.user_id),
        );
      },
    },
    group: {
      findMany: async ({ where }: { where: { organization_id: string; id?: string | { in: string[] } } }) => {
        state.calls.push({ fn: 'group.findMany', args: where });
        return state.groups.filter(
          (item) => item.organization_id === where.organization_id && matchesOptionalFilter(item.id, where.id),
        );
      },
    },
    groupCapability: {
      findFirst: async ({
        where,
      }: {
        where: {
          organization_id: string;
          group_id?: string | { in: string[] };
          capability_key?: string;
          scope_type?: string | { in: string[] };
        };
      }) => {
        state.calls.push({ fn: 'groupCapability.findFirst', args: where });
        return (
          state.assignments.find(
            (item) =>
              item.organization_id === where.organization_id &&
              matchesOptionalFilter(item.group_id, where.group_id) &&
              matchesOptionalFilter(item.capability_key, where.capability_key) &&
              matchesOptionalFilter(item.scope_type, where.scope_type),
          ) ?? null
        );
      },
    },
    organizationDomain: {
      findFirst: async ({ where }: { where: { organization_id: string; domain: string } }) => {
        state.calls.push({ fn: 'organizationDomain.findFirst', args: where });
        return (
          state.domains.find(
            (item) => item.organization_id === where.organization_id && item.domain === where.domain,
          ) ?? null
        );
      },
    },
  };

  return {
    service: new ConfigurationService(
      prisma as never,
      new AuditLogService(),
      new EventOutboxService(),
      {} as never,
    ),
    state,
  };
}

async function testVerifiedDomainAllowsSenderIdentity() {
  const { service, state } = createService();

  const result = await service.resolveDomainSenderIdentityBoundary(
    'org-alpha',
    ' Admin@Verified.Example.Test ',
    'actor-alpha',
  );

  assert.deepEqual(result, {
    organization_id: 'org-alpha',
    input: 'Admin@Verified.Example.Test',
    normalized_domain: 'verified.example.test',
    status: 'verified',
    allowed_for_sender: true,
    registered: true,
    verified_at: '2026-01-09T00:00:00.000Z',
    is_primary: true,
    branding_domain_changes_require_gatekeeper: true,
    canonical_identity_preserved: true,
  });
  assert.deepEqual(
    state.calls.find((call) => call.fn === 'organizationDomain.findFirst')?.args,
    {
      organization_id: 'org-alpha',
      domain: 'verified.example.test',
    },
  );
}

async function testUnverifiedDomainBlocksSenderIdentity() {
  const { service } = createService();

  const result = await service.resolveDomainSenderIdentityBoundary(
    'org-alpha',
    'pending.example.test',
    'actor-alpha',
  );

  assert.equal(result.status, 'unverified');
  assert.equal(result.allowed_for_sender, false);
  assert.equal(result.registered, true);
  assert.equal(result.verified_at, null);
  assert.equal(result.branding_domain_changes_require_gatekeeper, true);
}

async function testUnknownDomainDoesNotLeakForeignTenantRegistration() {
  const { service } = createService();

  const result = await service.resolveDomainSenderIdentityBoundary(
    'org-alpha',
    'ops@foreign.example.test',
    'actor-alpha',
  );

  assert.equal(result.status, 'not_registered');
  assert.equal(result.allowed_for_sender, false);
  assert.equal(result.registered, false);
  assert.equal(result.is_primary, false);
  assert.equal(result.verified_at, null);
}

async function testCrossTenantActorCannotResolveDomainBoundary() {
  const { service, state } = createService();

  await assert.rejects(
    service.resolveDomainSenderIdentityBoundary('org-alpha', 'verified.example.test', 'actor-beta'),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationDomain.findFirst'), false);
}

async function testInvalidSenderIdentityFailsBeforeDomainLookup() {
  const { service, state } = createService();

  await assert.rejects(
    service.resolveDomainSenderIdentityBoundary('org-alpha', 'not a domain', 'actor-alpha'),
    (error: unknown) => error instanceof BadRequestException,
  );

  assert.equal(state.calls.some((call) => call.fn === 'organizationDomain.findFirst'), false);
}

async function run() {
  await testVerifiedDomainAllowsSenderIdentity();
  await testUnverifiedDomainBlocksSenderIdentity();
  await testUnknownDomainDoesNotLeakForeignTenantRegistration();
  await testCrossTenantActorCannotResolveDomainBoundary();
  await testInvalidSenderIdentityFailsBeforeDomainLookup();

  console.log('P5B-006b domain/sender identity boundary tests passed.');
}

void run();
