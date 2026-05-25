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

function testAccessCoreTenantReadRoutesUseTrustedRequestContext() {
  const source = readFileSync(join(apiSourceRoot, 'access-core/access-core.controller.ts'), 'utf8');
  const requiredTrustedContextCalls: Array<string | RegExp> = [
    'this.accessCoreService.listUsers(organizationId, this.resolveActorUserId(headers, organizationId))',
    'this.accessCoreService.getUser(organizationId, userId, this.resolveActorUserId(headers, organizationId))',
    'this.accessCoreService.listGroups(organizationId, this.resolveActorUserId(headers, organizationId))',
    'this.accessCoreService.getGroup(organizationId, groupId, this.resolveActorUserId(headers, organizationId))',
    'this.accessCoreService.listMemberships(organizationId, this.resolveActorUserId(headers, organizationId))',
    /this\.accessCoreService\.listGroupCapabilityAssignments\(\s*organizationId,\s*this\.resolveActorUserId\(headers, organizationId\),\s*\)/,
  ];
  const forbiddenActorlessCalls = [
    'this.accessCoreService.listUsers(organizationId)',
    'this.accessCoreService.getUser(organizationId, userId)',
    'this.accessCoreService.listGroups(organizationId)',
    'this.accessCoreService.getGroup(organizationId, groupId)',
    'this.accessCoreService.listMemberships(organizationId)',
    'this.accessCoreService.listGroupCapabilityAssignments(organizationId)',
  ];

  assert.equal(
    source.includes('resolveTrustedRequestContext(headers, { routeOrganizationId: organizationId })'),
    true,
    'Access Core controller must resolve actor from trusted request context',
  );
  assert.equal(
    source.includes("@Headers('x-actor-user-id')"),
    false,
    'Access Core controller must not trust caller-controlled x-actor-user-id at ingress',
  );

  for (const call of requiredTrustedContextCalls) {
    const hasCall = typeof call === 'string' ? source.includes(call) : call.test(source);
    assert.equal(hasCall, true, `${call.toString()} must forward the trusted context actor`);
  }

  for (const call of forbiddenActorlessCalls) {
    assert.equal(source.includes(call), false, `${call} must not remain actorless`);
  }
}

function testApiControllersUseTrustedRequestContextAtIngress() {
  const controllerPaths = [
    'access-core/access-core.controller.ts',
    'configuration/configuration.controller.ts',
    'engagement-gateway/engagement-gateway.controller.ts',
    'hierarchy/hierarchy.controller.ts',
    'lead-desk/lead-desk.controller.ts',
  ];

  for (const controllerPath of controllerPaths) {
    const source = readFileSync(join(apiSourceRoot, controllerPath), 'utf8');
    assert.equal(
      source.includes("@Headers('x-actor-user-id')"),
      false,
      `${controllerPath} must not read caller-controlled x-actor-user-id`,
    );
    assert.equal(
      source.includes('resolveTrustedRequestContext'),
      true,
      `${controllerPath} must resolve trusted auth/tenant context`,
    );
    assert.equal(
      source.includes('routeOrganizationId: organizationId'),
      true,
      `${controllerPath} must bind trusted context to the route organization`,
    );
  }
}

function testTenantScopedMetadataAndServicesRequireOrganizationIsolation() {
  const metadata = JSON.parse(readFileSync(resolve(repoRoot, 'prisma/entity-registry.metadata.json'), 'utf8'));
  const tenantScopedModels = Object.entries(
    metadata.models as Record<
      string,
      { tenant_scoped?: boolean; organization_id_required?: boolean; rls_required?: boolean }
    >,
  ).filter(([, model]) => model.tenant_scoped === true);

  assert.notEqual(tenantScopedModels.length, 0, 'tenant-scoped registry metadata must not be empty');

  for (const [modelName, model] of tenantScopedModels) {
    assert.equal(model.organization_id_required, true, `${modelName} must require organization_id metadata`);
    assert.equal(model.rls_required, true, `${modelName} must keep RLS-required metadata`);
  }

  const serviceRequirements: Array<{ path: string; required: string[] }> = [
    {
      path: 'access-core/access-core.service.ts',
      required: [
        'where: {\n        organization_id: organizationId,\n        id: actorUserId,',
        'organization_id: organizationId',
        'deleteMany({\n        where: {\n          organization_id: organizationId,',
      ],
    },
    {
      path: 'configuration/configuration.service.ts',
      required: [
        'organization_id_key: {\n          organization_id: organizationId,',
        'where: {\n        organization_id: organizationId,\n        id: actorUserId,',
      ],
    },
    {
      path: 'engagement-gateway/engagement-gateway.service.ts',
      required: [
        'where: {\n        organization_id: organizationId,\n        id: actorUserId,',
        'organization_id: organizationId,\n        idempotency_key: input.idempotency_key,',
      ],
    },
    {
      path: 'hierarchy/hierarchy.service.ts',
      required: [
        'where: {\n        organization_id: organizationId,\n        id: actorUserId,',
        'where: {\n        organization_id: organizationId,',
        'assertUnitTypeExistsInOrganizationInDb',
      ],
    },
    {
      path: 'lead-desk/lead-desk.service.ts',
      required: [
        'where: {\n        organization_id: organizationId,\n        id: actorUserId,',
        'organization_id_id: {',
        'requireLeadInScope',
      ],
    },
  ];

  for (const requirement of serviceRequirements) {
    const source = readFileSync(join(apiSourceRoot, requirement.path), 'utf8');
    for (const requiredSnippet of requirement.required) {
      assert.equal(
        source.includes(requiredSnippet),
        true,
        `${requirement.path} must retain organization-scoped service enforcement: ${requiredSnippet}`,
      );
    }
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
  testAccessCoreTenantReadRoutesUseTrustedRequestContext();
  testApiControllersUseTrustedRequestContextAtIngress();
  testTenantScopedMetadataAndServicesRequireOrganizationIsolation();
  testApiTestFixturesDoNotLeakHardcodedBusinessTerms();

  console.log('phase1-release-blockers tests passed');
}

run();
