import { BadRequestException, Injectable } from '@nestjs/common';

export type FileDocumentMetadataModelBaseline = {
  model_name: 'FileDocumentMetadata';
  owner_module: 'core.file';
  tenant_scoped: true;
  organization_id_required: true;
  storage_credentials_exposed: false;
  required_fields: string[];
  unique_constraints: string[][];
  indexes: string[][];
  classification_required: true;
  retention_required: true;
  access_policy_required: true;
  audit_required: true;
};

export type FileDocumentMetadataInput = {
  organization_id: string;
  file_key: string;
  storage_key: string;
  owner_module: string;
  display_name: string;
  mime_type: string;
  byte_size: number;
  classification: string;
  retention_policy: string;
  access_policy: Record<string, unknown>;
  storage_provider: string;
  status: string;
  owner_entity_type?: string | null;
  owner_entity_id?: string | null;
  checksum_sha256?: string | null;
  created_by_user_id?: string | null;
};

export type FileDocumentMetadataValidationResult = {
  valid: boolean;
  tenant_scoped: true;
  storage_key_abstracted: true;
  storage_credentials_exposed: false;
  errors: string[];
};

export type FileStorageAdapterBoundary = {
  boundary: 'metadata_intent_only';
  default_storage_provider: 's3-compatible';
  credentials_exposed: false;
  real_provider_calls: false;
  signed_urls_created: false;
  operations: ['upload_intent', 'download_intent'];
};

export type FileStorageIntentInput = {
  organization_id: string;
  actor_user_id: string;
  file_key: string;
  owner_module: string;
  display_name: string;
  mime_type: string;
  byte_size: number;
  classification: string;
  retention_policy: string;
  capability_key: string;
  storage_provider?: string;
  checksum_sha256?: string | null;
};

export type FileStorageIntent = {
  operation: 'upload_intent' | 'download_intent';
  organization_id: string;
  actor_user_id: string;
  file_key: string;
  storage_key: string;
  storage_provider: string;
  capability_key: string;
  gatekeeper: {
    risk_check_required: true;
    capability_key: string;
    exposure_surface: 'file_document_storage';
  };
  audit: {
    event_type: 'file.document.intent.recorded';
    audit_required: true;
  };
  credentials_exposed: false;
  signed_url_created: false;
};

export type FileDocumentAccessContext = {
  organization_id: string;
  actor_user_id: string;
  capability_key: string;
};

export type FileDocumentAccessRecord = {
  organization_id: string;
  file_key: string;
  owner_module: string;
  storage_key: string;
  classification: string;
  access_policy: {
    capability_key: string;
    tenant_scoped: true;
  };
};

export type FileDocumentAccessDecision = {
  allowed: true;
  organization_id: string;
  actor_user_id: string;
  file_key: string;
  capability_key: string;
  tenant_isolation_enforced: true;
  capability_filter_enforced: true;
};

export type FileDocumentTenantIsolationFixtureInput = {
  context: FileDocumentAccessContext;
  records: FileDocumentAccessRecord[];
};

export type FileDocumentTenantIsolationFixtureResult = {
  organization_id: string;
  actor_user_id: string;
  visible_file_keys: string[];
  excluded_cross_tenant_file_keys: string[];
  excluded_unauthorized_file_keys: string[];
  tenant_isolation_enforced: true;
  capability_filter_enforced: true;
  records_examined: number;
};

const STORAGE_CREDENTIAL_MARKERS = ['secret', 'password', 'access_key', 'private_key', 'token'];
const STORAGE_KEY_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9_.-]*$/;

@Injectable()
export class FileService {
  fileDocumentMetadataModelBaseline(): FileDocumentMetadataModelBaseline {
    return {
      model_name: 'FileDocumentMetadata',
      owner_module: 'core.file',
      tenant_scoped: true,
      organization_id_required: true,
      storage_credentials_exposed: false,
      required_fields: [
        'organization_id',
        'file_key',
        'storage_key',
        'owner_module',
        'display_name',
        'mime_type',
        'byte_size',
        'classification',
        'retention_policy',
        'access_policy',
        'storage_provider',
        'status',
        'created_at',
      ],
      unique_constraints: [
        ['organization_id', 'file_key'],
        ['organization_id', 'storage_key'],
        ['organization_id', 'id'],
      ],
      indexes: [
        ['organization_id', 'owner_module', 'created_at'],
        ['organization_id', 'owner_entity_type', 'owner_entity_id'],
        ['organization_id', 'classification', 'created_at'],
        ['organization_id', 'status', 'created_at'],
        ['organization_id', 'created_by_user_id', 'created_at'],
      ],
      classification_required: true,
      retention_required: true,
      access_policy_required: true,
      audit_required: true,
    };
  }

  validateMetadataInput(input: FileDocumentMetadataInput): FileDocumentMetadataValidationResult {
    const errors: string[] = [];

    this.required(input.organization_id, 'organization_id', errors);
    this.required(input.file_key, 'file_key', errors);
    this.required(input.storage_key, 'storage_key', errors);
    this.required(input.owner_module, 'owner_module', errors);
    this.required(input.display_name, 'display_name', errors);
    this.required(input.mime_type, 'mime_type', errors);
    this.required(input.classification, 'classification', errors);
    this.required(input.retention_policy, 'retention_policy', errors);
    this.required(input.storage_provider, 'storage_provider', errors);
    this.required(input.status, 'status', errors);

    if (!Number.isSafeInteger(input.byte_size) || input.byte_size < 0) {
      errors.push('byte_size must be a non-negative integer');
    }
    if (!input.access_policy || typeof input.access_policy !== 'object' || Array.isArray(input.access_policy)) {
      errors.push('access_policy must be an object');
    }
    if (this.containsCredentialMarker(input.storage_key)) {
      errors.push('storage_key must be an abstract object key, not a credential-bearing value');
    }
    if (this.containsCredentialMarker(input.storage_provider)) {
      errors.push('storage_provider must not contain credential material');
    }

    return {
      valid: errors.length === 0,
      tenant_scoped: true,
      storage_key_abstracted: true,
      storage_credentials_exposed: false,
      errors,
    };
  }

  assertMetadataInput(input: FileDocumentMetadataInput): FileDocumentMetadataInput {
    const result = this.validateMetadataInput(input);
    if (!result.valid) {
      throw new BadRequestException(`File document metadata is invalid: ${result.errors.join('; ')}`);
    }

    return input;
  }

  fileStorageAdapterBoundary(): FileStorageAdapterBoundary {
    return {
      boundary: 'metadata_intent_only',
      default_storage_provider: 's3-compatible',
      credentials_exposed: false,
      real_provider_calls: false,
      signed_urls_created: false,
      operations: ['upload_intent', 'download_intent'],
    };
  }

  createUploadIntent(input: FileStorageIntentInput): FileStorageIntent {
    const storageProvider = this.storageProvider(input.storage_provider);
    const storageKey = this.buildStorageKey({
      organization_id: input.organization_id,
      owner_module: input.owner_module,
      file_key: input.file_key,
    });
    this.assertMetadataInput({
      organization_id: input.organization_id,
      file_key: input.file_key,
      storage_key: storageKey,
      owner_module: input.owner_module,
      display_name: input.display_name,
      mime_type: input.mime_type,
      byte_size: input.byte_size,
      checksum_sha256: input.checksum_sha256 ?? null,
      classification: input.classification,
      retention_policy: input.retention_policy,
      access_policy: {
        capability_key: this.requireNonEmpty(input.capability_key, 'capability_key'),
        tenant_scoped: true,
      },
      storage_provider: storageProvider,
      status: 'upload_intent',
      created_by_user_id: input.actor_user_id,
    });

    return this.intent('upload_intent', input, storageKey, storageProvider);
  }

  createDownloadIntent(input: Pick<FileStorageIntentInput, 'organization_id' | 'actor_user_id' | 'file_key' | 'owner_module' | 'capability_key' | 'storage_provider'>): FileStorageIntent {
    const storageProvider = this.storageProvider(input.storage_provider);
    const storageKey = this.buildStorageKey({
      organization_id: input.organization_id,
      owner_module: input.owner_module,
      file_key: input.file_key,
    });

    return this.intent('download_intent', input, storageKey, storageProvider);
  }

  buildStorageKey(input: { organization_id: string; owner_module: string; file_key: string }): string {
    const organizationId = this.storageSegment(input.organization_id, 'organization_id');
    const ownerModule = this.storageSegment(input.owner_module.replaceAll('.', '-'), 'owner_module');
    const fileKey = this.storageSegment(input.file_key, 'file_key');

    return `${organizationId}/${ownerModule}/${fileKey}`;
  }

  authorizeMetadataAccess(
    context: FileDocumentAccessContext,
    record: FileDocumentAccessRecord,
  ): FileDocumentAccessDecision {
    const organizationId = this.requireNonEmpty(context.organization_id, 'organization_id');
    const actorUserId = this.requireNonEmpty(context.actor_user_id, 'actor_user_id');
    const capabilityKey = this.requireNonEmpty(context.capability_key, 'capability_key');
    const recordOrganizationId = this.requireNonEmpty(record.organization_id, 'record organization_id');
    const fileKey = this.requireNonEmpty(record.file_key, 'record file_key');
    this.requireNonEmpty(record.owner_module, 'record owner_module');
    this.requireNonEmpty(record.storage_key, 'record storage_key');
    this.requireNonEmpty(record.classification, 'record classification');

    if (!record.access_policy || record.access_policy.tenant_scoped !== true) {
      throw new BadRequestException('file access policy must be tenant scoped');
    }
    if (recordOrganizationId !== organizationId) {
      throw new BadRequestException('file access denied across organization boundary');
    }
    if (record.access_policy.capability_key !== capabilityKey) {
      throw new BadRequestException('file access denied by capability policy');
    }

    return {
      allowed: true,
      organization_id: organizationId,
      actor_user_id: actorUserId,
      file_key: fileKey,
      capability_key: capabilityKey,
      tenant_isolation_enforced: true,
      capability_filter_enforced: true,
    };
  }

  runTenantIsolationFixture(input: FileDocumentTenantIsolationFixtureInput): FileDocumentTenantIsolationFixtureResult {
    if (!Array.isArray(input.records) || input.records.length === 0) {
      throw new BadRequestException('file tenant isolation fixture records must not be empty');
    }

    const organizationId = this.requireNonEmpty(input.context.organization_id, 'organization_id');
    const actorUserId = this.requireNonEmpty(input.context.actor_user_id, 'actor_user_id');
    this.requireNonEmpty(input.context.capability_key, 'capability_key');
    const visibleFileKeys: string[] = [];
    const excludedCrossTenantFileKeys: string[] = [];
    const excludedUnauthorizedFileKeys: string[] = [];

    for (const record of input.records) {
      const fileKey = this.requireNonEmpty(record.file_key, 'record file_key');
      const recordOrganizationId = this.requireNonEmpty(record.organization_id, 'record organization_id');

      if (recordOrganizationId !== organizationId) {
        excludedCrossTenantFileKeys.push(fileKey);
        continue;
      }

      try {
        this.authorizeMetadataAccess(input.context, record);
        visibleFileKeys.push(fileKey);
      } catch {
        excludedUnauthorizedFileKeys.push(fileKey);
      }
    }

    return {
      organization_id: organizationId,
      actor_user_id: actorUserId,
      visible_file_keys: visibleFileKeys.sort(),
      excluded_cross_tenant_file_keys: excludedCrossTenantFileKeys.sort(),
      excluded_unauthorized_file_keys: excludedUnauthorizedFileKeys.sort(),
      tenant_isolation_enforced: true,
      capability_filter_enforced: true,
      records_examined: input.records.length,
    };
  }

  private required(input: unknown, field: string, errors: string[]) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      errors.push(`${field} is required`);
    }
  }

  private containsCredentialMarker(input: string): boolean {
    const normalized = input.toLowerCase();
    return STORAGE_CREDENTIAL_MARKERS.some((marker) => normalized.includes(marker));
  }

  private intent(
    operation: FileStorageIntent['operation'],
    input: Pick<FileStorageIntentInput, 'organization_id' | 'actor_user_id' | 'file_key' | 'capability_key'>,
    storageKey: string,
    storageProvider: string,
  ): FileStorageIntent {
    return {
      operation,
      organization_id: this.requireNonEmpty(input.organization_id, 'organization_id'),
      actor_user_id: this.requireNonEmpty(input.actor_user_id, 'actor_user_id'),
      file_key: this.requireNonEmpty(input.file_key, 'file_key'),
      storage_key: storageKey,
      storage_provider: storageProvider,
      capability_key: this.requireNonEmpty(input.capability_key, 'capability_key'),
      gatekeeper: {
        risk_check_required: true,
        capability_key: this.requireNonEmpty(input.capability_key, 'capability_key'),
        exposure_surface: 'file_document_storage',
      },
      audit: {
        event_type: 'file.document.intent.recorded',
        audit_required: true,
      },
      credentials_exposed: false,
      signed_url_created: false,
    };
  }

  private storageProvider(input: string | undefined): string {
    const value = input === undefined ? 's3-compatible' : this.requireNonEmpty(input, 'storage_provider');
    if (this.containsCredentialMarker(value)) {
      throw new BadRequestException('storage_provider must not contain credential material');
    }

    return value;
  }

  private storageSegment(input: string, field: string): string {
    const value = this.requireNonEmpty(input, field).toLowerCase();
    if (!STORAGE_KEY_SEGMENT_PATTERN.test(value) || value.includes('..')) {
      throw new BadRequestException(`${field} is not safe for storage key construction`);
    }

    return value;
  }

  private requireNonEmpty(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`${field} is required`);
    }

    return input.trim();
  }
}
