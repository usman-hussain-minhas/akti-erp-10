import { BadRequestException, Injectable } from '@nestjs/common';

export type FoundryMigrationContributionOperation =
  | 'create_table'
  | 'add_column'
  | 'add_index'
  | 'add_enum_value'
  | 'drop_table'
  | 'drop_column'
  | 'rename_table'
  | 'rename_column'
  | 'alter_column_type'
  | 'raw_sql';

export type FoundrySchemaContribution = {
  path: string;
  model_or_table: string;
  operation: FoundryMigrationContributionOperation;
  tenant_scoped: boolean;
  organization_id_required: boolean;
  rls_metadata_present: boolean;
  indexes_declared: boolean;
};

export type FoundryMigrationContribution = {
  path: string;
  operation: FoundryMigrationContributionOperation;
  destructive: boolean;
  validation_passed: boolean;
  rollback_plan_ref?: string | null;
  evidence_ref?: string | null;
};

export type FoundryMigrationSafetyInput = {
  module_key: string;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
  schema_contributions: FoundrySchemaContribution[];
  migration_contributions: FoundryMigrationContribution[];
};

export type FoundryMigrationSafetyClassification =
  | 'safe'
  | 'approval_required'
  | 'stop_for_review';

export type FoundryMigrationSafetyResult = {
  module_key: string;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
  classification: FoundryMigrationSafetyClassification;
  migration_risk: 'non_destructive' | 'approval_required' | 'destructive';
  gatekeeper_outcome: 'ALLOW' | 'APPROVAL_REQUIRED' | 'STOP_FOR_REVIEW';
  migration_validation_passed: boolean;
  destructive_migration: boolean;
  tenant_isolation_risk: boolean;
  approval_required: boolean;
  stop_for_review_required: boolean;
  reasons: string[];
  gatekeeper_payload: {
    risk_surface: 'migration';
    migration_risk: 'non_destructive' | 'approval_required' | 'destructive';
    migration_validation_passed: boolean;
    migration_approval_required: boolean;
    destructive_migration: boolean;
    tenant_isolation_risk: boolean;
    correlation_id: string;
  };
};

const DESTRUCTIVE_OPERATIONS = new Set<FoundryMigrationContributionOperation>([
  'drop_table',
  'drop_column',
  'rename_table',
  'rename_column',
  'alter_column_type',
  'raw_sql',
]);

@Injectable()
export class FoundryMigrationSafetyValidator {
  classify(input: FoundryMigrationSafetyInput): FoundryMigrationSafetyResult {
    const moduleKey = this.required(input.module_key, 'module_key');
    const organizationId = this.required(input.organization_id, 'organization_id');
    const actorUserId = this.required(input.actor_user_id, 'actor_user_id');
    const correlationId = this.required(input.correlation_id, 'correlation_id');
    const schemaContributions = this.contributionList(input.schema_contributions, 'schema_contributions');
    const migrationContributions = this.contributionList(input.migration_contributions, 'migration_contributions');

    const reasons: string[] = [];
    let destructiveMigration = false;
    let tenantIsolationRisk = false;
    let validationPassed = true;
    let approvalRequired = false;

    for (const schemaContribution of schemaContributions) {
      this.required(schemaContribution.path, 'schema_contribution.path');
      this.required(schemaContribution.model_or_table, 'schema_contribution.model_or_table');
      this.operation(schemaContribution.operation);

      if (DESTRUCTIVE_OPERATIONS.has(schemaContribution.operation)) {
        destructiveMigration = true;
        reasons.push(`${schemaContribution.model_or_table} uses destructive schema operation ${schemaContribution.operation}`);
      }
      if (schemaContribution.tenant_scoped && !schemaContribution.organization_id_required) {
        tenantIsolationRisk = true;
        reasons.push(`${schemaContribution.model_or_table} is tenant scoped without organization_id`);
      }
      if (schemaContribution.tenant_scoped && !schemaContribution.rls_metadata_present) {
        tenantIsolationRisk = true;
        reasons.push(`${schemaContribution.model_or_table} is tenant scoped without RLS metadata`);
      }
      if (schemaContribution.tenant_scoped && !schemaContribution.indexes_declared) {
        approvalRequired = true;
        reasons.push(`${schemaContribution.model_or_table} requires approval until tenant indexes are declared`);
      }
    }

    for (const migrationContribution of migrationContributions) {
      this.required(migrationContribution.path, 'migration_contribution.path');
      this.operation(migrationContribution.operation);

      if (migrationContribution.destructive || DESTRUCTIVE_OPERATIONS.has(migrationContribution.operation)) {
        destructiveMigration = true;
        reasons.push(`${migrationContribution.path} is destructive or uses ${migrationContribution.operation}`);
      }
      if (!migrationContribution.validation_passed) {
        validationPassed = false;
        reasons.push(`${migrationContribution.path} did not pass migration validation`);
      }
      if (!migrationContribution.rollback_plan_ref || !migrationContribution.evidence_ref) {
        approvalRequired = true;
        reasons.push(`${migrationContribution.path} requires rollback and evidence references before execution`);
      }
    }

    if (destructiveMigration || tenantIsolationRisk) {
      return this.result({
        moduleKey,
        organizationId,
        actorUserId,
        correlationId,
        classification: 'stop_for_review',
        migrationRisk: 'destructive',
        gatekeeperOutcome: 'STOP_FOR_REVIEW',
        validationPassed,
        destructiveMigration,
        tenantIsolationRisk,
        approvalRequired: true,
        reasons,
      });
    }

    if (!validationPassed || approvalRequired) {
      return this.result({
        moduleKey,
        organizationId,
        actorUserId,
        correlationId,
        classification: 'approval_required',
        migrationRisk: 'approval_required',
        gatekeeperOutcome: 'APPROVAL_REQUIRED',
        validationPassed,
        destructiveMigration,
        tenantIsolationRisk,
        approvalRequired: true,
        reasons,
      });
    }

    return this.result({
      moduleKey,
      organizationId,
      actorUserId,
      correlationId,
      classification: 'safe',
      migrationRisk: 'non_destructive',
      gatekeeperOutcome: 'ALLOW',
      validationPassed,
      destructiveMigration,
      tenantIsolationRisk,
      approvalRequired,
      reasons: ['migration contribution is non-destructive and has required tenant/rollback/evidence controls'],
    });
  }

  private result(input: {
    moduleKey: string;
    organizationId: string;
    actorUserId: string;
    correlationId: string;
    classification: FoundryMigrationSafetyClassification;
    migrationRisk: FoundryMigrationSafetyResult['migration_risk'];
    gatekeeperOutcome: FoundryMigrationSafetyResult['gatekeeper_outcome'];
    validationPassed: boolean;
    destructiveMigration: boolean;
    tenantIsolationRisk: boolean;
    approvalRequired: boolean;
    reasons: string[];
  }): FoundryMigrationSafetyResult {
    return {
      module_key: input.moduleKey,
      organization_id: input.organizationId,
      actor_user_id: input.actorUserId,
      correlation_id: input.correlationId,
      classification: input.classification,
      migration_risk: input.migrationRisk,
      gatekeeper_outcome: input.gatekeeperOutcome,
      migration_validation_passed: input.validationPassed,
      destructive_migration: input.destructiveMigration,
      tenant_isolation_risk: input.tenantIsolationRisk,
      approval_required: input.approvalRequired,
      stop_for_review_required: input.gatekeeperOutcome === 'STOP_FOR_REVIEW',
      reasons: input.reasons,
      gatekeeper_payload: {
        risk_surface: 'migration',
        migration_risk: input.migrationRisk,
        migration_validation_passed: input.validationPassed,
        migration_approval_required: input.approvalRequired && input.gatekeeperOutcome !== 'STOP_FOR_REVIEW',
        destructive_migration: input.destructiveMigration,
        tenant_isolation_risk: input.tenantIsolationRisk,
        correlation_id: input.correlationId,
      },
    };
  }

  private contributionList<T>(input: T[], field: string): T[] {
    if (!Array.isArray(input)) {
      throw new BadRequestException(`foundry migration safety ${field} must be an array`);
    }

    return input;
  }

  private operation(input: FoundryMigrationContributionOperation): FoundryMigrationContributionOperation {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException('foundry migration safety operation is required');
    }

    return input;
  }

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`foundry migration safety ${field} is required`);
    }

    return input.trim();
  }
}
