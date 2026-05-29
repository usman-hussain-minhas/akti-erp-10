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
    const actorUserId = this.normalizeActorUserId(input.actor_user_id);
    if (!actorUserId) {
      throw new BadRequestException('x-actor-user-id is required for audit logging');
    }

    const actorUser = await db.user.findFirst({
      where: {
        organization_id: input.organization_id,
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
      action_key: input.action_key,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
    });

    await db.auditLog.create({
      data: {
        organization_id: input.organization_id,
        actor_user_id: actorUserId,
        action_key: input.action_key,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
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
