import { BadRequestException, Body, Controller, Headers, Param, Post } from '@nestjs/common';

import { FileService, type FileStorageIntentInput } from './file-service.service';
import {
  type HeaderRecord,
  requireContextBodyMatch,
  resolveTrustedRequestContext,
} from '../security/request-context';

type UploadIntentBody = {
  organization_id?: unknown;
  actor_user_id?: unknown;
  file_key?: unknown;
  owner_module?: unknown;
  display_name?: unknown;
  mime_type?: unknown;
  byte_size?: unknown;
  classification?: unknown;
  retention_policy?: unknown;
  capability_key?: unknown;
  storage_provider?: unknown;
  checksum_sha256?: unknown;
};

type DownloadIntentBody = {
  organization_id?: unknown;
  actor_user_id?: unknown;
  owner_module?: unknown;
  capability_key?: unknown;
  storage_provider?: unknown;
};

@Controller('platform/files')
export class FileServiceController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload-intent')
  createUploadIntent(@Body() body: UploadIntentBody, @Headers() headers: HeaderRecord) {
    const organizationId = requiredString(body.organization_id, 'organization_id');
    const actorUserId = optionalString(body.actor_user_id, 'actor_user_id');
    const context = resolveTrustedRequestContext(headers, { routeOrganizationId: organizationId });
    requireContextBodyMatch(context, {
      organization_id: organizationId,
      actor_user_id: actorUserId ?? undefined,
    });

    const intent = this.fileService.createUploadIntent({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      file_key: requiredString(body.file_key, 'file_key'),
      owner_module: requiredString(body.owner_module, 'owner_module'),
      display_name: requiredString(body.display_name, 'display_name'),
      mime_type: requiredString(body.mime_type, 'mime_type'),
      byte_size: requiredNumber(body.byte_size, 'byte_size'),
      classification: requiredString(body.classification, 'classification'),
      retention_policy: requiredString(body.retention_policy, 'retention_policy'),
      capability_key: optionalString(body.capability_key, 'capability_key') ?? 'platform.file.write',
      storage_provider: optionalString(body.storage_provider, 'storage_provider') ?? undefined,
      checksum_sha256: optionalString(body.checksum_sha256, 'checksum_sha256'),
    });

    return {
      method: 'POST',
      route: '/platform/files/upload-intent',
      request_shape: 'FileUploadIntentRequest',
      response_shape: 'FileStorageIntentResponse',
      capability: {
        required: 'platform.file.write',
      },
      tenant_context: {
        organization_id: context.organization_id,
        actor_user_id: context.actor_user_id,
      },
      gatekeeper: intent.gatekeeper,
      audit: intent.audit,
      storage_intent: intent,
    };
  }

  @Post(':fileKey/download-intent')
  createDownloadIntent(
    @Param('fileKey') fileKey: string,
    @Body() body: DownloadIntentBody,
    @Headers() headers: HeaderRecord,
  ) {
    const organizationId = requiredString(body.organization_id, 'organization_id');
    const actorUserId = optionalString(body.actor_user_id, 'actor_user_id');
    const context = resolveTrustedRequestContext(headers, { routeOrganizationId: organizationId });
    requireContextBodyMatch(context, {
      organization_id: organizationId,
      actor_user_id: actorUserId ?? undefined,
    });

    const intent = this.fileService.createDownloadIntent({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      file_key: requiredString(fileKey, 'file_key'),
      owner_module: requiredString(body.owner_module, 'owner_module'),
      capability_key: optionalString(body.capability_key, 'capability_key') ?? 'platform.file.read',
      storage_provider: optionalString(body.storage_provider, 'storage_provider') ?? undefined,
    });

    return {
      method: 'POST',
      route: '/platform/files/:fileKey/download-intent',
      request_shape: 'FileDownloadIntentRequest',
      response_shape: 'FileStorageIntentResponse',
      capability: {
        required: 'platform.file.read',
      },
      tenant_context: {
        organization_id: context.organization_id,
        actor_user_id: context.actor_user_id,
      },
      gatekeeper: intent.gatekeeper,
      audit: intent.audit,
      storage_intent: intent,
    };
  }
}

function requiredString(input: unknown, field: string): string {
  const value = optionalString(input, field);
  if (!value) {
    throw new BadRequestException(`file ${field} is required`);
  }

  return value;
}

function optionalString(input: unknown, field: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`file ${field} must be a non-empty string`);
  }

  return input.trim();
}

function requiredNumber(input: unknown, field: string): number {
  if (typeof input !== 'number' || !Number.isSafeInteger(input)) {
    throw new BadRequestException(`file ${field} must be an integer`);
  }

  return input;
}
