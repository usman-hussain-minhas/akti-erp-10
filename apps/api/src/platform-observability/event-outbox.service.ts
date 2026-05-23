import { Injectable } from '@nestjs/common';
import { Prisma } from '../../node_modules/.prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient;

type RecordMutationOutboxInput = {
  organization_id: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  actor_user_id?: string | null;
  occurred_at?: Date;
};

@Injectable()
export class EventOutboxService {
  async recordMutation(db: DbClient, input: RecordMutationOutboxInput): Promise<{ written: true }> {
    const occurredAt = input.occurred_at ?? new Date();

    await db.eventOutbox.create({
      data: {
        organization_id: input.organization_id,
        event_type: 'platform.mutation.recorded',
        version: '0.1.0',
        status: 'pending',
        processed_at: null,
        payload: {
          action_key: input.action_key,
          entity_type: input.entity_type,
          entity_id: input.entity_id,
          actor_user_id: this.normalizeActorUserId(input.actor_user_id),
          occurred_at: occurredAt.toISOString(),
        },
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
