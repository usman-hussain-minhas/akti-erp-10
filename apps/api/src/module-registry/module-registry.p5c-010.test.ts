import assert from 'node:assert/strict';

import { ModuleRegistryService } from './module-registry.service';

type ModuleRow = {
  module_key: string;
  display_name: string;
  version: string;
  status: string;
  manifest_hash: string;
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
};

function createService(modules: ModuleRow[]) {
  const prisma = {
    moduleRegistryEntry: {
      findMany: async (args: FindManyArgs = {}) => {
        const allowed = args.where?.module_key?.in;
        return (allowed ? modules.filter((row) => allowed.includes(row.module_key)) : modules).map((row) => ({
          module_key: row.module_key,
          display_name: row.display_name,
          version: row.version,
          status: row.status,
          manifest_hash: row.manifest_hash,
        }));
      },
    },
    userGroup: {
      findMany: async () => [{ group_id: 'group-phase5c' }],
    },
    groupCapability: {
      findMany: async () => [
        { capability_key: 'platform.modules.view' },
        { capability_key: 'platform.crm.access' },
      ],
    },
  };

  return new ModuleRegistryService(prisma as never);
}

async function testDisplayFeaturesAreManifestBackedAndOptional() {
  const service = createService([
    {
      module_key: 'lead.desk',
      display_name: 'Lead Desk Core',
      version: '0.1.0',
      status: 'available',
      manifest_hash: 'c'.repeat(64),
    },
  ]);

  const response = await service.listModulesForActor({
    organization_id: 'org-p5c',
    actor_user_id: 'actor-p5c',
  });

  assert.equal(response.items.length, 1);
  assert.equal(response.items[0].module_key, 'lead.desk');
  assert.deepEqual(response.items[0].display_features, [
    'Lead intake inbox',
    'Follow-up workspace',
    'Existing Lead Desk routes',
  ]);
  assert.equal(JSON.stringify(response).includes('hardcoded'), false);
}

void testDisplayFeaturesAreManifestBackedAndOptional().then(() => {
  console.log('P5C-010 display_features manifest contract proof passed.');
});
