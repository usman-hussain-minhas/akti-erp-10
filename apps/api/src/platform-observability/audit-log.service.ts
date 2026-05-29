import { BadRequestException, Injectable } from '@nestjs/common';
import { type Prisma } from '../prisma/prisma-client';

import { PrismaService } from '../prisma/prisma.service';
import { type EventEnvelopeSubject } from './event-outbox.service';

type DbClient = PrismaService | Prisma.TransactionClient;

type WriteAuditLogInput = {
  organization_id: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  actor_user_id?: string | null;
  metadata: Prisma.InputJsonValue;
};

type AuditWriteResult = {
  written: true;
};

export type AuditEventEnvelopeContext = {
  source_module: 'platform.audit';
  producer: 'akti-api';
  subject: EventEnvelopeSubject;
  actor_user_id: string;
  action_key: string;
};

export function buildAuditEventEnvelopeContext(input: {
  actor_user_id: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
}): AuditEventEnvelopeContext {
  return {
    source_module: 'platform.audit',
    producer: 'akti-api',
    subject: {
      entity_type: requireNonEmptyString(input.entity_type, 'audit event subject entity_type is required'),
      entity_id: requireNonEmptyString(input.entity_id, 'audit event subject entity_id is required'),
    },
    actor_user_id: requireNonEmptyString(input.actor_user_id, 'audit event actor_user_id is required'),
    action_key: requireNonEmptyString(input.action_key, 'audit event action_key is required'),
  };
}

@Injectable()
export class AuditLogService {
  async writeAuditLog(db: DbClient, input: WriteAuditLogInput): Promise<AuditWriteResult> {
    const organizationId = requireNonEmptyString(input.organization_id, 'audit log organization_id is required');
    const actionKey = requireNonEmptyString(input.action_key, 'audit log action_key is required');
    const entityType = requireNonEmptyString(input.entity_type, 'audit log entity_type is required');
    const entityId = requireNonEmptyString(input.entity_id, 'audit log entity_id is required');
    const actorUserId = this.normalizeActorUserId(input.actor_user_id);
    if (!actorUserId) {
      throw new BadRequestException('x-actor-user-id is required for audit logging');
    }
    this.assertMetadataTenant(input.metadata, organizationId);

    const actorUser = await db.user.findFirst({
      where: {
        organization_id: organizationId,
        id: actorUserId,
      },
      select: {
        id: true,
      },
    });

    if (!actorUser) {
      throw new BadRequestException('x-actor-user-id must reference a user in the same organization');
    }

    buildAuditEventEnvelopeContext({
      actor_user_id: actorUserId,
      action_key: actionKey,
      entity_type: entityType,
      entity_id: entityId,
    });

    await db.auditLog.create({
      data: {
        organization_id: organizationId,
        actor_user_id: actorUserId,
        action_key: actionKey,
        entity_type: entityType,
        entity_id: entityId,
        metadata: input.metadata,
      },
    });

    return { written: true };
  }

  private normalizeActorUserId(actorUserIdRaw?: string | null): string | null {
    if (typeof actorUserIdRaw !== 'string') {
      return null;
    }

    const trimmed = actorUserIdRaw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private assertMetadataTenant(metadata: Prisma.InputJsonValue, organizationId: string): void {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return;
    }

    const metadataRecord = metadata as Record<string, unknown>;
    const metadataOrganizationId = metadataRecord.organization_id;
    if (metadataOrganizationId === undefined || metadataOrganizationId === null) {
      return;
    }

    if (metadataOrganizationId !== organizationId) {
      throw new BadRequestException('audit metadata organization_id must match audit tenant');
    }
  }
}

function requireNonEmptyString(value: string | null | undefined, message: string): string {
  if (typeof value !== 'string') {
    throw new BadRequestException(message);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new BadRequestException(message);
  }

  return trimmed;
}
