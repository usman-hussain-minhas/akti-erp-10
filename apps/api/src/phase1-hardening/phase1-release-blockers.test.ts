import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import {
  PLATFORM_MUTATION_RECORDED_EVENT_TYPE,
  PLATFORM_MUTATION_RECORDED_EVENT_VERSION,
} from '../platform-observability/event-outbox.service';

const apiRoot = process.cwd();
const repoRoot = resolve(apiRoot, '../..');
const apiSourceRoot = join(apiRoot, 'src');
const thisTestPath = 'phase1-hardening/phase1-release-blockers.test.ts';

type RegistryEvent = {
  event_type?: unknown;
  version?: unknown;
};

function listTypeScriptTestFiles(directory: string): string[] {
  return readdirSync(directory)
    .flatMap((entry) => {
      const fullPath = join(directory, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        return listTypeScriptTestFiles(fullPath);
      }

      return fullPath.endsWith('.test.ts') ? [fullPath] : [];
    })
    .sort();
}

function toApiSourcePath(path: string) {
  return relative(apiSourceRoot, path).replaceAll('\\', '/');
}

function assertExactPhase1OutboxEvent(events: RegistryEvent[], label: string) {
  assert.deepEqual(events, [
    {
      event_type: PLATFORM_MUTATION_RECORDED_EVENT_TYPE,
      version: PLATFORM_MUTATION_RECORDED_EVENT_VERSION,
    },
  ], `${label} must declare only the Phase 1 platform mutation event`);
}

function testRegistryEventMetadataMatchesRuntimeConstants() {
  const metadata = JSON.parse(readFileSync(resolve(repoRoot, 'prisma/entity-registry.metadata.json'), 'utf8'));
  const generated = JSON.parse(readFileSync(resolve(repoRoot, 'generated/entity-registry.generated.json'), 'utf8'));

  const metadataModels = metadata.models as Record<string, { events_emitted?: RegistryEvent[] }>;
  assertExactPhase1OutboxEvent(metadataModels.EventOutbox?.events_emitted ?? [], 'metadata EventOutbox');

  for (const [modelName, model] of Object.entries(metadataModels)) {
    if (modelName === 'EventOutbox') {
      continue;
    }

    assert.deepEqual(model.events_emitted, [], `metadata ${modelName}.events_emitted must remain empty`);
  }

  const generatedEntities = generated.entities as Array<{ model_name: string; events_emitted?: RegistryEvent[] }>;
  const generatedEventOutbox = generatedEntities.find((entity) => entity.model_name === 'EventOutbox');
  assert.ok(generatedEventOutbox, 'generated registry must contain EventOutbox');
  assertExactPhase1OutboxEvent(generatedEventOutbox.events_emitted ?? [], 'generated EventOutbox');

  for (const entity of generatedEntities) {
    if (entity.model_name === 'EventOutbox') {
      continue;
    }

    assert.deepEqual(entity.events_emitted, [], `generated ${entity.model_name}.events_emitted must remain empty`);
  }
}

function testPhase1WorkflowKeepsGeneratedRegistryDriftGuard() {
  const workflow = readFileSync(resolve(repoRoot, '.github/workflows/phase1-validation.yml'), 'utf8');

  assert.equal(workflow.includes('pnpm registry:generate'), true);
  assert.equal(workflow.includes('git diff --exit-code -- generated/entity-registry.generated.json'), true);
}

function testAccessCoreTenantReadRoutesRequireActorHeader() {
  const source = readFileSync(join(apiSourceRoot, 'access-core/access-core.controller.ts'), 'utf8');
  const requiredActorForwardingCalls = [
    'this.accessCoreService.listUsers(organizationId, actorUserIdRaw)',
    'this.accessCoreService.getUser(organizationId, userId, actorUserIdRaw)',
    'this.accessCoreService.listGroups(organizationId, actorUserIdRaw)',
    'this.accessCoreService.getGroup(organizationId, groupId, actorUserIdRaw)',
    'this.accessCoreService.listMemberships(organizationId, actorUserIdRaw)',
    'this.accessCoreService.listGroupCapabilityAssignments(organizationId, actorUserIdRaw)',
  ];
  const forbiddenActorlessCalls = [
    'this.accessCoreService.listUsers(organizationId)',
    'this.accessCoreService.getUser(organizationId, userId)',
    'this.accessCoreService.listGroups(organizationId)',
    'this.accessCoreService.getGroup(organizationId, groupId)',
    'this.accessCoreService.listMemberships(organizationId)',
    'this.accessCoreService.listGroupCapabilityAssignments(organizationId)',
  ];

  for (const call of requiredActorForwardingCalls) {
    assert.equal(source.includes(call), true, `${call} must forward x-actor-user-id`);
  }

  for (const call of forbiddenActorlessCalls) {
    assert.equal(source.includes(call), false, `${call} must not remain actorless`);
  }
}

function testApiTestFixturesDoNotLeakHardcodedBusinessTerms() {
  const forbiddenTerms = [
    ['cam', 'pus'].join(''),
    ['Cam', 'pus'].join(''),
    ['Main ', 'Cam', 'pus'].join(''),
    ['cam', 'pus', '.main'].join(''),
    ['akti', '.com', '.pk'].join(''),
  ];
  const violations: string[] = [];

  for (const path of listTypeScriptTestFiles(apiSourceRoot)) {
    const relativePath = toApiSourcePath(path);
    if (relativePath === thisTestPath) {
      continue;
    }

    const source = readFileSync(path, 'utf8');
    for (const term of forbiddenTerms) {
      if (source.includes(term)) {
        violations.push(`${relativePath} contains forbidden hardcoded fixture term "${term}"`);
      }
    }
  }

  assert.deepEqual(violations, []);
}

function run() {
  testRegistryEventMetadataMatchesRuntimeConstants();
  testPhase1WorkflowKeepsGeneratedRegistryDriftGuard();
  testAccessCoreTenantReadRoutesRequireActorHeader();
  testApiTestFixturesDoNotLeakHardcodedBusinessTerms();

  console.log('phase1-release-blockers tests passed');
}

run();
