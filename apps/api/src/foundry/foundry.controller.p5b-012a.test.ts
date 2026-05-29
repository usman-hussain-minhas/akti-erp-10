import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException, ForbiddenException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

import { FoundryController } from './foundry.controller';
import { FoundryService, type FoundryInstallPreflightInput } from './foundry.service';
import { type HeaderRecord, createPhase3SessionToken } from '../security/request-context';

const AUTH_SECRET = 'phase5b-foundry-install-preflight-secret';
process.env.AKTI_AUTH_SESSION_SECRET = AUTH_SECRET;

function trustedHeaders(organizationId = 'org-012a', actorUserId = 'actor-012a'): HeaderRecord {
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

function validInput(overrides?: Partial<FoundryInstallPreflightInput>): FoundryInstallPreflightInput {
  return {
    organization_id: 'org-012a',
    actor_user_id: 'actor-012a',
    active_group_ids: ['group-012a'],
    target_module_key: 'platform.fixture',
    target_module_version: '0.1.0',
    manifest_hash: 'a'.repeat(64),
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012a/migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012a/rollback-plan.md',
    evidence_package_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012a/evidence-package.md',
    correlation_id: 'corr-p5b-012a',
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    reauth_status: 'not_required',
    ...overrides,
  };
}

function validBody(overrides?: Record<string, unknown>) {
  return {
    ...validInput(),
    ...overrides,
  };
}

function testInstallPreflightRouteMetadataIsExplicit() {
  const descriptor = Object.getOwnPropertyDescriptor(FoundryController.prototype, 'installPreflight');

  assert.ok(descriptor?.value);
  assert.equal(Reflect.getMetadata(PATH_METADATA, FoundryController), 'platform/foundry');
  assert.equal(Reflect.getMetadata(PATH_METADATA, descriptor.value), 'install-preflight');
  assert.equal(Reflect.getMetadata(METHOD_METADATA, descriptor.value), RequestMethod.POST);
}

async function testControllerUsesTrustedTenantAndActorContext() {
  const calls: Array<{ input: FoundryInstallPreflightInput }> = [];
  const service = {
    runInstallPreflight: async (input: FoundryInstallPreflightInput) => {
      calls.push({ input });
      return {
        method: 'POST',
        route: '/platform/foundry/install-preflight',
        action_key: 'module.install',
        target_module: {
          module_key: input.target_module_key,
          version: input.target_module_version,
          manifest_hash: input.manifest_hash,
        },
        capability: {
          required: 'access.policy.manage',
          authority_note:
            'existing Gatekeeper-supported high-risk platform management capability; no new capability invented in P5B-012a',
        },
        tenant_context: {
          organization_id: input.organization_id,
          actor_user_id: input.actor_user_id,
        },
        gatekeeper: {
          preflight_required: true,
          request: {} as never,
          decision: null,
        },
        audit: {
          event_type: 'foundry.install.preflight.requested',
          evidence_required: true,
          evidence_package_ref: input.evidence_package_ref,
          correlation_id: input.correlation_id,
        },
        foundry_execution: {
          allowed_after_preflight: false,
          executed: false,
          next_step: 'P5B-012b Foundry install execution',
        },
      };
    },
  };
  const controller = new FoundryController(service as never);

  const response = await controller.installPreflight(validBody(), trustedHeaders());

  assert.equal(response.route, '/platform/foundry/install-preflight');
  assert.equal(response.capability.required, 'access.policy.manage');
  assert.equal(response.foundry_execution.executed, false);
  assert.deepEqual(calls[0].input, validInput());
}

async function testFoundryServiceBuildsGatekeeperPreflightPacket() {
  const gatekeeperCalls: unknown[] = [];
  const gatekeeper = {
    requireAllow: async (input: unknown) => {
      gatekeeperCalls.push(input);
      return {
        decision: 'ALLOW',
        request_id: 'gk_req_012a',
        capability_key: 'access.policy.manage',
        actor_user_id: 'actor-012a',
        organization_id: 'org-012a',
        reasons: [],
        checks: [],
        required_evidence: [],
        missing_evidence: [],
        reauth_required: false,
        decision_token: 'gk_decision_012a',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      };
    },
  };
  const service = new FoundryService(gatekeeper as never);

  const response = await service.runInstallPreflight(validInput());
  const request = gatekeeperCalls[0] as {
    capability_key: string;
    module_key: string;
    entity_type: string;
    entity_id: string;
    action_key: string;
    payload: Record<string, unknown>;
  };

  assert.equal(response.foundry_execution.allowed_after_preflight, true);
  assert.equal(response.foundry_execution.executed, false);
  assert.equal(response.audit.event_type, 'foundry.install.preflight.requested');
  assert.equal(request.capability_key, 'access.policy.manage');
  assert.equal(request.module_key, 'core.access');
  assert.equal(request.entity_type, 'foundry.module');
  assert.equal(request.entity_id, 'platform.fixture');
  assert.equal(request.action_key, 'module.install');
  assert.equal(request.payload.target_module_key, 'platform.fixture');
  assert.equal(request.payload.migration_plan_ref, validInput().migration_plan_ref);
  assert.equal(request.payload.rollback_plan_ref, validInput().rollback_plan_ref);
  assert.equal(request.payload.evidence_package_ref, validInput().evidence_package_ref);
  assert.equal(request.payload.risk_surface, 'migration');
  assert.equal(request.payload.rollback_evidence_present, true);
}

async function testInstallPreflightRejectsInvalidAndMismatchedContext() {
  const gatekeeper = {
    requireAllow: async () => ({
      decision: 'ALLOW',
      request_id: 'gk_req_012a',
      capability_key: 'access.policy.manage',
      actor_user_id: 'actor-012a',
      organization_id: 'org-012a',
      reasons: [],
      checks: [],
      required_evidence: [],
      missing_evidence: [],
      reauth_required: false,
      decision_token: 'gk_decision_012a',
      expires_at: new Date(Date.now() + 60_000).toISOString(),
    }),
  };
  const controller = new FoundryController(new FoundryService(gatekeeper as never));

  assert.throws(
    () => controller.installPreflight(validBody({ organization_id: ' ' }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.installPreflight(validBody({ active_group_ids: [] }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.installPreflight(validBody({ module_health: { 'core.access': 'offline' } }), trustedHeaders()),
    BadRequestException,
  );
  assert.throws(
    () => controller.installPreflight(validBody(), trustedHeaders('org-other')),
    ForbiddenException,
  );
  assert.throws(
    () => controller.installPreflight(validBody({ actor_user_id: 'actor-other' }), trustedHeaders()),
    ForbiddenException,
  );
  assert.throws(
    () => controller.installPreflight(validBody(), {}),
    UnauthorizedException,
  );
}

async function testServiceRejectsMissingAccessCoreHealthBeforeGatekeeperCall() {
  const service = new FoundryService({ requireAllow: async () => ({ decision: 'ALLOW' }) } as never);

  await assert.rejects(
    () => service.runInstallPreflight(validInput({ module_health: {} })),
    BadRequestException,
  );
}

function testAppModuleRegistersFoundryApiSurface() {
  const appModuleSource = readFileSync('src/app.module.ts', 'utf8');

  assert.equal(appModuleSource.includes('FoundryController'), true);
  assert.equal(appModuleSource.includes('FoundryService'), true);
}

async function run() {
  testInstallPreflightRouteMetadataIsExplicit();
  await testControllerUsesTrustedTenantAndActorContext();
  await testFoundryServiceBuildsGatekeeperPreflightPacket();
  await testInstallPreflightRejectsInvalidAndMismatchedContext();
  await testServiceRejectsMissingAccessCoreHealthBeforeGatekeeperCall();
  testAppModuleRegistersFoundryApiSurface();

  console.log('P5B-012a Foundry install preflight flow tests passed.');
}

void run();
