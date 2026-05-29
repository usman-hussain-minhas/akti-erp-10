import assert from 'node:assert/strict';

import { ModuleRegistryService } from './module-registry.service';

type ModuleRow = {
  module_key: string;
  display_name: string;
  version: string;
  status: string;
  manifest_hash: string;
};

type UserGroupRow = {
  organization_id: string;
  user_id: string;
  group_id: string;
};

type GroupCapabilityRow = {
  organization_id: string;
  group_id: string;
  capability_key: string;
};

type FindManyArgs = {
  where?: {
    organization_id?: string;
    user_id?: string;
    group_id?: {
      in?: string[];
    };
    module_key?: {
      in?: string[];
    };
  };
  orderBy?: unknown;
  select?: unknown;
};

function createService(input: {
  modules: ModuleRow[];
  memberships: UserGroupRow[];
  capabilities: GroupCapabilityRow[];
}) {
  const calls: Array<{ fn: string; args: FindManyArgs }> = [];
  const prisma = {
    moduleRegistryEntry: {
      findMany: async (args: FindManyArgs = {}) => {
        calls.push({ fn: 'moduleRegistryEntry.findMany', args });
        const allowedModuleKeys = args.where?.module_key?.in;
        const rows = allowedModuleKeys
          ? input.modules.filter((row) => allowedModuleKeys.includes(row.module_key))
          : input.modules;

        return rows
          .map(({ module_key, display_name, version, status, manifest_hash }) => ({
            module_key,
            display_name,
            version,
            status,
            manifest_hash,
          }))
          .sort((left, right) => left.module_key.localeCompare(right.module_key));
      },
    },
    userGroup: {
      findMany: async (args: FindManyArgs = {}) => {
        calls.push({ fn: 'userGroup.findMany', args });
        return input.memberships
          .filter((row) => row.organization_id === args.where?.organization_id)
          .filter((row) => row.user_id === args.where?.user_id)
          .map(({ group_id }) => ({ group_id }));
      },
    },
    groupCapability: {
      findMany: async (args: FindManyArgs = {}) => {
        calls.push({ fn: 'groupCapability.findMany', args });
        const allowedGroupIds = args.where?.group_id?.in ?? [];
        return input.capabilities
          .filter((row) => row.organization_id === args.where?.organization_id)
          .filter((row) => allowedGroupIds.includes(row.group_id))
          .map(({ capability_key }) => ({ capability_key }));
      },
    },
  };

  return {
    calls,
    service: new ModuleRegistryService(prisma as never),
  };
}

const modules: ModuleRow[] = [
  {
    module_key: 'core.access',
    display_name: 'Access Core',
    version: '0.1.0',
    status: 'available',
    manifest_hash: 'a'.repeat(64),
  },
  {
    module_key: 'engagement.gateway',
    display_name: 'Engagement Gateway Lite',
    version: '0.1.0',
    status: 'available',
    manifest_hash: 'b'.repeat(64),
  },
  {
    module_key: 'lead.desk',
    display_name: 'Lead Desk Core',
    version: '0.1.0',
    status: 'available',
    manifest_hash: 'c'.repeat(64),
  },
];

async function testActorWithModuleAndCrmCapabilitiesSeesCrmOnly() {
  const { service } = createService({
    modules,
    memberships: [{ organization_id: 'org-016', user_id: 'actor-016', group_id: 'group-crm' }],
    capabilities: [
      {
        organization_id: 'org-016',
        group_id: 'group-crm',
        capability_key: 'platform.modules.view',
      },
      {
        organization_id: 'org-016',
        group_id: 'group-crm',
        capability_key: 'platform.crm.access',
      },
    ],
  });

  const response = await service.listModulesForActor({
    organization_id: 'org-016',
    actor_user_id: 'actor-016',
  });

  assert.deepEqual(response.items.map((item) => item.module_key), ['lead.desk']);
  assert.equal(response.items[0].display_name, 'CRM');
  assert.equal(response.items[0].route, '/lead-desk');
  assert.equal(response.items[0].visibility_state, 'available');
  assert.deepEqual(response.items[0].required_capabilities, ['platform.crm.access']);
  assert.equal(response.capability.required, 'platform.modules.view');
  assert.equal(response.authority.visibility_grants_destructive_actions, false);
  assert.equal(JSON.stringify(response).includes('import_export'), false);
  assert.equal(JSON.stringify(response).includes('delete'), false);
}

async function testActorWithoutCrmCapabilityCannotSeeCrm() {
  const { service } = createService({
    modules,
    memberships: [{ organization_id: 'org-016', user_id: 'actor-016', group_id: 'group-view' }],
    capabilities: [
      {
        organization_id: 'org-016',
        group_id: 'group-view',
        capability_key: 'platform.modules.view',
      },
    ],
  });

  const response = await service.listModulesForActor({
    organization_id: 'org-016',
    actor_user_id: 'actor-016',
  });

  assert.deepEqual(response.items, []);
}

async function testActorWithoutModulesViewCannotSeeModuleCards() {
  const { service } = createService({
    modules,
    memberships: [{ organization_id: 'org-016', user_id: 'actor-016', group_id: 'group-crm' }],
    capabilities: [
      {
        organization_id: 'org-016',
        group_id: 'group-crm',
        capability_key: 'platform.crm.access',
      },
    ],
  });

  const response = await service.listModulesForActor({
    organization_id: 'org-016',
    actor_user_id: 'actor-016',
  });

  assert.deepEqual(response.items, []);
}

async function testCapabilityLookupIsTenantScoped() {
  const { service, calls } = createService({
    modules,
    memberships: [{ organization_id: 'org-016', user_id: 'actor-016', group_id: 'group-view' }],
    capabilities: [
      {
        organization_id: 'other-org',
        group_id: 'group-view',
        capability_key: 'platform.crm.access',
      },
      {
        organization_id: 'org-016',
        group_id: 'group-view',
        capability_key: 'platform.modules.view',
      },
    ],
  });

  const response = await service.listModulesForActor({
    organization_id: 'org-016',
    actor_user_id: 'actor-016',
  });

  assert.deepEqual(response.items, []);
  assert.deepEqual(
    calls.find((call) => call.fn === 'groupCapability.findMany')?.args.where,
    {
      organization_id: 'org-016',
      group_id: {
        in: ['group-view'],
      },
    },
  );
}

async function run() {
  await testActorWithModuleAndCrmCapabilitiesSeesCrmOnly();
  await testActorWithoutCrmCapabilityCannotSeeCrm();
  await testActorWithoutModulesViewCannotSeeModuleCards();
  await testCapabilityLookupIsTenantScoped();

  console.log('P5B1-016 Module Registry role-aware service tests passed.');
}

void run();
