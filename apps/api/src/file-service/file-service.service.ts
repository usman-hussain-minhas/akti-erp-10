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

const STORAGE_CREDENTIAL_MARKERS = ['secret', 'password', 'access_key', 'private_key', 'token'];

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

  private required(input: unknown, field: string, errors: string[]) {
    if (typeof input !== 'string' || input.trim().length === 0) {
      errors.push(`${field} is required`);
    }
  }

  private containsCredentialMarker(input: string): boolean {
    const normalized = input.toLowerCase();
    return STORAGE_CREDENTIAL_MARKERS.some((marker) => normalized.includes(marker));
  }
}
