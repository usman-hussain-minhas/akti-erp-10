import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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
};

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

function createService(input: {
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
          ? modules.filter((row) => allowedModuleKeys.includes(row.module_key))
          : modules;

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

async function testUnauthorizedActorCannotSeeCrmCard() {
  const { service } = createService({
    memberships: [{ organization_id: 'org-alpha', user_id: 'actor-viewer', group_id: 'group-viewer' }],
    capabilities: [
      {
        organization_id: 'org-alpha',
        group_id: 'group-viewer',
        capability_key: 'platform.modules.view',
      },
    ],
  });

  const response = await service.listModulesForActor({
    organization_id: 'org-alpha',
    actor_user_id: 'actor-viewer',
  });

  assert.deepEqual(response.items, []);
  assert.equal(response.authority.visibility_grants_destructive_actions, false);
}

async function testModuleVisibilityDoesNotGrantDestructiveAuthority() {
  const { service } = createService({
    memberships: [{ organization_id: 'org-alpha', user_id: 'actor-crm', group_id: 'group-crm' }],
    capabilities: [
      {
        organization_id: 'org-alpha',
        group_id: 'group-crm',
        capability_key: 'platform.modules.view',
      },
      {
        organization_id: 'org-alpha',
        group_id: 'group-crm',
        capability_key: 'platform.crm.access',
      },
    ],
  });

  const response = await service.listModulesForActor({
    organization_id: 'org-alpha',
    actor_user_id: 'actor-crm',
  });

  assert.deepEqual(response.items.map((item) => item.module_key), ['lead.desk']);
  assert.equal(response.items[0].display_name, 'CRM');
  assert.deepEqual(response.items[0].required_capabilities, ['platform.crm.access']);
  assert.equal(response.capability.required, 'platform.modules.view');
  assert.equal(response.authority.visibility_grants_destructive_actions, false);

  const serialized = JSON.stringify(response).toLowerCase();
  for (const forbiddenAuthority of ['import_export', 'delete', 'admin', 'approve', 'configure']) {
    assert.equal(serialized.includes(forbiddenAuthority), false);
  }
}

async function testActorCapabilitiesAreTenantScoped() {
  const { service, calls } = createService({
    memberships: [{ organization_id: 'org-alpha', user_id: 'actor-alpha', group_id: 'shared-group' }],
    capabilities: [
      {
        organization_id: 'org-beta',
        group_id: 'shared-group',
        capability_key: 'platform.crm.access',
      },
      {
        organization_id: 'org-alpha',
        group_id: 'shared-group',
        capability_key: 'platform.modules.view',
      },
    ],
  });

  const response = await service.listModulesForActor({
    organization_id: 'org-alpha',
    actor_user_id: 'actor-alpha',
  });

  assert.deepEqual(response.items, []);
  assert.deepEqual(
    calls.find((call) => call.fn === 'groupCapability.findMany')?.args.where,
    {
      organization_id: 'org-alpha',
      group_id: {
        in: ['shared-group'],
      },
    },
  );
}

function parseMarkdownTableLine(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function forbiddenPhraseIsInMustNotShowColumn(line: string, phrase: string): boolean {
  if (!line.trim().startsWith('|')) {
    return false;
  }

  const cells = parseMarkdownTableLine(line);
  return cells.length > 1 && cells[cells.length - 1].toLowerCase().includes(phrase.toLowerCase());
}

function testScreenRegistryContainsOnlyGuardrailedFakeSurfaceReferences() {
  const registry = readFileSync(
    join(process.cwd(), '../../docs/process/AKTI_ERP_Phase_5C_Screen_Contract_Registry_v1.md'),
    'utf8',
  );
  const phrases = [
    'fake revenue',
    'fake CRM pipeline',
    'fake notifications',
    'fake analytics',
    'Admissions',
    'Finance',
    'HR',
  ];
  const allowedContextPatterns = [
    /does not/i,
    /must not/i,
    /not authorized/i,
    /deferred/i,
    /blocked/i,
    /no admissions/i,
    /no .*finance/i,
    /no .*hr/i,
  ];

  for (const phrase of phrases) {
    const offendingLines = registry
      .split('\n')
      .filter((line) => line.toLowerCase().includes(phrase.toLowerCase()))
      .filter((line) => !forbiddenPhraseIsInMustNotShowColumn(line, phrase))
      .filter((line) => !allowedContextPatterns.some((pattern) => pattern.test(line)));

    assert.deepEqual(offendingLines, [], `${phrase} must only appear in blocked, deferred, or must-not-show contexts`);
  }
}

async function run() {
  await testUnauthorizedActorCannotSeeCrmCard();
  await testModuleVisibilityDoesNotGrantDestructiveAuthority();
  await testActorCapabilitiesAreTenantScoped();
  testScreenRegistryContainsOnlyGuardrailedFakeSurfaceReferences();

  console.log('P5B1-024 module visibility and no-fake-surface tests passed.');
}

void run();
