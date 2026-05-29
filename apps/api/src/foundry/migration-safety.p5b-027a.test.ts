import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { BadRequestException } from '@nestjs/common';

import {
  FoundryMigrationSafetyValidator,
  type FoundryMigrationSafetyInput,
} from './migration-safety.validator';

const schemaBeforeTest = readFileSync('../../prisma/schema.prisma', 'utf8');

function validInput(overrides?: Partial<FoundryMigrationSafetyInput>): FoundryMigrationSafetyInput {
  return {
    module_key: 'core.foundry.fixture',
    organization_id: 'org-027a',
    actor_user_id: 'actor-027a',
    correlation_id: 'corr-027a',
    schema_contributions: [
      {
        path: 'prisma/schema.prisma',
        model_or_table: 'FoundryFixtureRecord',
        operation: 'create_table',
        tenant_scoped: true,
        organization_id_required: true,
        rls_metadata_present: true,
        indexes_declared: true,
      },
    ],
    migration_contributions: [
      {
        path: 'prisma/migrations/00000000000000_foundry_fixture/migration.sql',
        operation: 'create_table',
        destructive: false,
        validation_passed: true,
        rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-027a/rollback-plan.md',
        evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-027a/migration-evidence.md',
      },
    ],
    ...overrides,
  };
}

function testSafeContributionClassifiesAsAllowInput() {
  const result = new FoundryMigrationSafetyValidator().classify(validInput());

  assert.equal(result.classification, 'safe');
  assert.equal(result.gatekeeper_outcome, 'ALLOW');
  assert.equal(result.migration_risk, 'non_destructive');
  assert.equal(result.migration_validation_passed, true);
  assert.equal(result.destructive_migration, false);
  assert.equal(result.tenant_isolation_risk, false);
  assert.equal(result.gatekeeper_payload.risk_surface, 'migration');
  assert.equal(result.gatekeeper_payload.migration_risk, 'non_destructive');
  assert.equal(result.gatekeeper_payload.migration_approval_required, false);
}

function testMissingRollbackOrValidationClassifiesAsApprovalRequiredInput() {
  const result = new FoundryMigrationSafetyValidator().classify(
    validInput({
      migration_contributions: [
        {
          path: 'prisma/migrations/00000000000000_foundry_fixture/migration.sql',
          operation: 'add_column',
          destructive: false,
          validation_passed: false,
          rollback_plan_ref: null,
          evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-027a/migration-evidence.md',
        },
      ],
    }),
  );

  assert.equal(result.classification, 'approval_required');
  assert.equal(result.gatekeeper_outcome, 'APPROVAL_REQUIRED');
  assert.equal(result.migration_risk, 'approval_required');
  assert.equal(result.migration_validation_passed, false);
  assert.equal(result.gatekeeper_payload.migration_approval_required, true);
  assert.match(result.reasons.join('\n'), /rollback/);
}

function testDestructiveContributionClassifiesAsStopForReviewInput() {
  const result = new FoundryMigrationSafetyValidator().classify(
    validInput({
      schema_contributions: [
        {
          path: 'prisma/schema.prisma',
          model_or_table: 'LegacyUnsafeRecord',
          operation: 'drop_table',
          tenant_scoped: true,
          organization_id_required: true,
          rls_metadata_present: true,
          indexes_declared: true,
        },
      ],
      migration_contributions: [
        {
          path: 'prisma/migrations/00000000000000_drop_legacy/migration.sql',
          operation: 'drop_table',
          destructive: true,
          validation_passed: true,
          rollback_plan_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-027a/rollback-plan.md',
          evidence_ref: 'codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-027a/migration-evidence.md',
        },
      ],
    }),
  );

  assert.equal(result.classification, 'stop_for_review');
  assert.equal(result.gatekeeper_outcome, 'STOP_FOR_REVIEW');
  assert.equal(result.migration_risk, 'destructive');
  assert.equal(result.destructive_migration, true);
  assert.equal(result.stop_for_review_required, true);
  assert.equal(result.gatekeeper_payload.destructive_migration, true);
}

function testTenantIsolationRiskClassifiesAsStopForReviewInput() {
  const result = new FoundryMigrationSafetyValidator().classify(
    validInput({
      schema_contributions: [
        {
          path: 'prisma/schema.prisma',
          model_or_table: 'TenantScopedWithoutTenantColumn',
          operation: 'create_table',
          tenant_scoped: true,
          organization_id_required: false,
          rls_metadata_present: false,
          indexes_declared: false,
        },
      ],
    }),
  );

  assert.equal(result.classification, 'stop_for_review');
  assert.equal(result.gatekeeper_outcome, 'STOP_FOR_REVIEW');
  assert.equal(result.tenant_isolation_risk, true);
  assert.equal(result.gatekeeper_payload.tenant_isolation_risk, true);
}

function testValidatorRejectsMalformedInputsAndDoesNotModifyPrismaSchema() {
  const validator = new FoundryMigrationSafetyValidator();

  assert.throws(() => validator.classify(validInput({ module_key: '' })), BadRequestException);
  assert.throws(
    () =>
      validator.classify(
        validInput({
          schema_contributions: null as never,
        }),
      ),
    BadRequestException,
  );

  assert.equal(readFileSync('../../prisma/schema.prisma', 'utf8'), schemaBeforeTest);
}

function run() {
  testSafeContributionClassifiesAsAllowInput();
  testMissingRollbackOrValidationClassifiesAsApprovalRequiredInput();
  testDestructiveContributionClassifiesAsStopForReviewInput();
  testTenantIsolationRiskClassifiesAsStopForReviewInput();
  testValidatorRejectsMalformedInputsAndDoesNotModifyPrismaSchema();

  console.log('P5B-027a Foundry migration safety validator tests passed.');
}

run();
