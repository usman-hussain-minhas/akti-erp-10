import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../../node_modules/.prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient;

type WriteAuditLogInput = {
  organization_id: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  actor_user_id?: string | null;
  metadata: Prisma.InputJsonValue;
};

type AuditWriteResult =
  | {
      written: true;
    }
  | {
      written: false;
      reason: 'missing_actor';
    };

@Injectable()
export class AuditLogService {
  async writeAuditLog(db: DbClient, input: WriteAuditLogInput): Promise<AuditWriteResult> {
    const actorUserId = this.normalizeActorUserId(input.actor_user_id);
    if (!actorUserId) {
      return {
        written: false,
        reason: 'missing_actor',
      };
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
