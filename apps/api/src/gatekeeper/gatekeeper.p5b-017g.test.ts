import assert from 'node:assert/strict';

import { ServiceUnavailableException } from '@nestjs/common';
import type { GatekeeperDecisionResult, GatekeeperRequest } from '@akti/contracts/gatekeeper-contract';

import { GatekeeperPreflightService, type GatekeeperPreflightInput } from './gatekeeper-preflight.service';
import {
  FoundryService,
  type FoundryInstallExecutionInput,
  type FoundryModuleManifestCandidate,
  type FoundryRollbackRecoveryInput,
} from '../foundry/foundry.service';
import {
  type EventEnvelope,
  EventOutboxService,
  assertComplianceEventContext,
} from '../platform-observability/event-outbox.service';
import type { PrismaService } from '../prisma/prisma.service';

type MockPrisma = PrismaService & {
  storedDecisions: Array<{ data: Record<string, unknown> }>;
  outboxWrites: Array<Record<string, unknown>>;
};

function createMockPrisma(): MockPrisma {
  const storedDecisions: Array<{ data: Record<string, unknown> }> = [];
  const outboxWrites: Array<Record<string, unknown>> = [];

  return {
    storedDecisions,
    outboxWrites,
    gatekeeperDecisionRecord: {
      create: async (input: { data: Record<string, unknown> }) => {
        storedDecisions.push(input);
        return { id: `decision-${storedDecisions.length}` };
      },
    },
    eventOutbox: {
      upsert: async ({ create }: { create: Record<string, unknown> }) => {
        outboxWrites.push(create);
        return create;
      },
    },
  } as unknown as MockPrisma;
}

class TestGatekeeperPreflightService extends GatekeeperPreflightService {
  constructor(
    private readonly handler: (request: GatekeeperRequest) => Promise<unknown> | unknown,
    prisma: PrismaService,
  ) {
    super(prisma, undefined, new EventOutboxService());
  }

  protected override async provideDecision(request: GatekeeperRequest): Promise<unknown> {
    return this.handler(request);
  }
}

function preflightInput(overrides?: Partial<GatekeeperPreflightInput>): GatekeeperPreflightInput {
  return {
    organization_id: 'org-017g',
    actor_user_id: 'actor-017g',
    active_group_ids: ['group-017g'],
    entity_type: 'foundry.module',
    entity_id: 'platform.fixture',
    action_key: 'module.install',
    capability_key: 'access.policy.manage',
    module_key: 'core.access',
    payload: {
      action_key: 'module.install',
      correlation_id: 'corr-p5b-017g',
      risk_surface: 'migration',
      migration_risk: 'non_destructive',
      rollback_risk: 'covered',
      migration_validation_passed: true,
      rollback_validation_passed: true,
      rollback_evidence_present: true,
    },
    module_health: {
      'core.access': 'healthy',
    },
    dependency_health: {},
    ...overrides,
  };
}

function decisionFor(
  request: GatekeeperRequest,
  overrides?: Partial<GatekeeperDecisionResult>,
): GatekeeperDecisionResult {
  const baseDecision: GatekeeperDecisionResult = {
    decision: 'ALLOW',
    request_id: request.request_id,
    capability_key: request.capability_key,
    actor_user_id: request.actor_user_id,
    organization_id: request.organization_id,
    reasons: [],
    checks: [
      {
        check_key: 'gatekeeper.p5b-017g.preflight',
        status: 'passed',
        reason: null,
        evidence_required: [],
        evidence_present: [],
      },
    ],
    required_evidence: [],
    missing_evidence: [],
    reauth_required: false,
    decision_token: `decision-${request.request_id}`,
    expires_at: new Date(Date.now() + 60_000).toISOString(),
  };

  return {
    ...baseDecision,
    ...overrides,
  };
}

function validManifest(overrides?: Partial<FoundryModuleManifestCandidate>): FoundryModuleManifestCandidate {
  return {
    module_key: 'platform.fixture',
    display_name: 'Platform Fixture',
    module_type: 'standard',
    version: '0.2.0',
    owner: 'platform',
    min_platform_version: '0.1.0',
    dependencies: [{ module_key: 'core.access', min_version: '0.1.0' }],
    optional_dependencies: [],
    capabilities: [
      {
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        risk_level: 'high',
        requires_reauth: false,
        requires_audit: true,
        gatekeeper_required: true,
      },
    ],
    permissions: [
      {
        key: 'platform.fixture.manage',
        module_key: 'platform.fixture',
        allowed_scope_types: ['organization'],
      },
    ],
    api_routes: [
      {
        method: 'POST',
        path: '/platform/fixture/actions',
        capability_key: 'platform.fixture.manage',
      },
    ],
    gatekeeper_hooks: [
      {
        key: 'platform.fixture.manage.preflight',
        capability_key: 'platform.fixture.manage',
        required: true,
      },
    ],
    schemas: [{ key: 'platform.fixture.schema' }],
    migrations: [{ key: 'platform.fixture.migration' }],
    data_ownership: {
      owner_module_key: 'platform.fixture',
      tenant_scoped: true,
      entity_refs: ['platform.fixture.record'],
    },
    ...overrides,
  };
}

function validInstallInput(
  service: FoundryService,
  overrides?: Partial<FoundryInstallExecutionInput>,
): FoundryInstallExecutionInput {
  const manifest = validManifest();
  const compatibilityResult = service.checkCompatibility({
    manifest,
    platform_core_version: '1.0.0',
    installed_modules: [{ module_key: 'core.access', version: '0.1.0', status: 'enabled' }],
  });

  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    manifest_hash: service.assertManifestValid(manifest).manifest_hash ?? '',
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_017g',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017g/evidence.md',
    migration_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017g/migration-plan.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017g/rollback-plan.md',
    compatibility_result: compatibilityResult,
    organization_id: 'org-017g',
    actor_user_id: 'actor-017g',
    correlation_id: 'corr-p5b-017g-foundry',
    ...overrides,
  };
}

function validRollbackInput(overrides?: Partial<FoundryRollbackRecoveryInput>): FoundryRollbackRecoveryInput {
  return {
    module_key: 'platform.fixture',
    module_version: '0.2.0',
    current_status: 'rollback_required',
    manifest_hash: '1'.repeat(64),
    gatekeeper_outcome: 'ALLOW',
    gatekeeper_decision_token: 'gk_decision_p5b_017g_rollback',
    evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017g/rollback-evidence.md',
    rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017g/rollback-plan.md',
    failure_evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017g/failure-evidence.md',
    organization_id: 'org-017g',
    actor_user_id: 'actor-017g',
    correlation_id: 'corr-p5b-017g-rollback',
    ...overrides,
  };
}

function assertGatekeeperOutboxWriteIsComplianceClass(event: Record<string, unknown>, outcome: string) {
  assert.equal(event.event_type, 'gatekeeper.preflight.decided');
  assert.equal(event.version, '0.1.0');
  assert.match(String(event.event_id), /^evt_[a-f0-9]{64}$/);
  assert.equal(event.producer, 'akti-api');
  assert.equal(event.schema_version, '1.0.0');
  assert.equal(event.source_module, 'gatekeeper');
  assert.deepEqual(event.subject, {
    entity_type: 'gatekeeper.decision',
    entity_id: (event.payload as Record<string, unknown>).request_id,
  });
  assert.equal(event.privacy_class, 'restricted');
  assert.equal(event.retention_class, 'audit');
  assert.equal(event.redaction_policy, 'strict');
  assert.equal(event.audit_required, true);
  assert.equal(event.replay_allowed, false);

  const payload = event.payload as Record<string, unknown>;
  assert.equal(payload.outcome, outcome);
  assert.equal(payload.correlation_id, 'corr-p5b-017g');
}

function assertFoundryEnvelopeIsComplianceClass(envelope: EventEnvelope, expected: { event_type: string; correlation_id: string }) {
  assert.equal(assertComplianceEventContext(envelope), envelope);
  assert.equal(envelope.event_type, expected.event_type);
  assert.equal(envelope.producer, 'akti-api');
  assert.equal(envelope.schema_version, '1.0.0');
  assert.equal(envelope.source_module, 'foundry');
  assert.deepEqual(envelope.subject, {
    entity_type: 'foundry.module',
    entity_id: 'platform.fixture',
  });
  assert.equal(envelope.context.actor_user_id, 'actor-017g');
  assert.equal(envelope.context.correlation_id, expected.correlation_id);
  assert.equal(envelope.compliance.privacy_class, 'restricted');
  assert.equal(envelope.compliance.retention_class, 'audit');
  assert.equal(envelope.compliance.redaction_policy, 'strict');
  assert.equal(envelope.compliance.audit_required, true);
  assert.equal(envelope.compliance.replay_allowed, false);
}

async function testGatekeeperAllowAndStopForReviewWritesRemainComplianceClass() {
  const allowPrisma = createMockPrisma();
  const allowService = new TestGatekeeperPreflightService((request) => decisionFor(request), allowPrisma);
  await allowService.requireAllow(preflightInput());

  assert.equal(allowPrisma.outboxWrites.length, 1);
  assertGatekeeperOutboxWriteIsComplianceClass(allowPrisma.outboxWrites[0], 'ALLOW');

  const stopPrisma = createMockPrisma();
  const stopService = new TestGatekeeperPreflightService(
    (request) =>
      decisionFor(request, {
        decision: 'STOP_FOR_REVIEW',
        reasons: [
          {
            code: 'gatekeeper.p5b-017g.stop',
            message: 'Gatekeeper requires platform architect review.',
            severity: 'error',
          },
        ],
        checks: [
          {
            check_key: 'gatekeeper.p5b-017g.stop',
            status: 'failed',
            reason: {
              code: 'gatekeeper.p5b-017g.stop',
              message: 'Gatekeeper requires platform architect review.',
              severity: 'error',
            },
            evidence_required: [],
            evidence_present: [],
          },
        ],
        decision_token: undefined,
        expires_at: null,
      }),
    stopPrisma,
  );

  await assert.rejects(stopService.requireAllow(preflightInput()), ServiceUnavailableException);

  assert.equal(stopPrisma.outboxWrites.length, 1);
  assertGatekeeperOutboxWriteIsComplianceClass(stopPrisma.outboxWrites[0], 'STOP_FOR_REVIEW');
}

function testFoundryInstallAndRollbackEnvelopesRemainComplianceClass() {
  const service = new FoundryService();
  const install = service.executeInstall(validInstallInput(service));
  const rollback = service.executeRollbackRecovery(validRollbackInput());

  assertFoundryEnvelopeIsComplianceClass(install.audit.event_envelope, {
    event_type: 'foundry.install.executed',
    correlation_id: 'corr-p5b-017g-foundry',
  });
  assert.equal(install.audit.event_envelope.payload.action_key, 'module.install');

  assertFoundryEnvelopeIsComplianceClass(rollback.audit.event_envelope, {
    event_type: 'foundry.module.rollback_recovered',
    correlation_id: 'corr-p5b-017g-rollback',
  });
  assert.equal(rollback.audit.event_envelope.payload.action_key, 'module.rollback_recovery');
}

function testComplianceClassRegressionCopiesAreRejected() {
  const service = new FoundryService();
  const envelope = service.executeInstall(validInstallInput(service)).audit.event_envelope;

  assert.throws(() =>
    assertComplianceEventContext({
      ...envelope,
      context: {
        ...envelope.context,
        actor_user_id: null,
      },
    }),
  );

  assert.throws(() =>
    assertComplianceEventContext({
      ...envelope,
      compliance: {
        ...envelope.compliance,
        retention_class: 'standard',
      },
    }),
  );

  assert.throws(() =>
    assertComplianceEventContext({
      ...envelope,
      compliance: {
        ...envelope.compliance,
        audit_required: false,
      },
    }),
  );
}

async function run() {
  await testGatekeeperAllowAndStopForReviewWritesRemainComplianceClass();
  testFoundryInstallAndRollbackEnvelopesRemainComplianceClass();
  testComplianceClassRegressionCopiesAreRejected();

  console.log('P5B-017g Gatekeeper/Foundry compliance-class event regression tests passed.');
}

void run();
