import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { type Prisma } from '../prisma/prisma-client';

import { PrismaService } from '../prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient;

type RecordMutationOutboxInput = {
  organization_id: string;
  action_key: string;
  entity_type: string;
  entity_id: string;
  actor_user_id?: string | null;
  occurred_at?: Date;
  idempotency_key?: string;
};

type RecordEventOutboxInput = {
  organization_id: string;
  event_type: string;
  version: string;
  payload: Record<string, unknown>;
  idempotency_key: string;
};

export const PLATFORM_MUTATION_RECORDED_EVENT_TYPE = 'platform.mutation.recorded';
export const PLATFORM_MUTATION_RECORDED_EVENT_VERSION = '0.1.0';

@Injectable()
export class EventOutboxService {
  async recordMutation(db: DbClient, input: RecordMutationOutboxInput): Promise<{ written: true }> {
    const occurredAt = input.occurred_at ?? new Date();
    const actorUserId = this.normalizeActorUserId(input.actor_user_id);
    const idempotencyKey =
      this.normalizeIdempotencyKey(input.idempotency_key) ??
      this.deriveMutationIdempotencyKey({
        organization_id: input.organization_id,
        action_key: input.action_key,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        actor_user_id: actorUserId,
      });

    return this.recordEvent(db, {
      organization_id: input.organization_id,
      event_type: PLATFORM_MUTATION_RECORDED_EVENT_TYPE,
      version: PLATFORM_MUTATION_RECORDED_EVENT_VERSION,
      idempotency_key: idempotencyKey,
      payload: {
        action_key: input.action_key,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        actor_user_id: actorUserId,
        occurred_at: occurredAt.toISOString(),
      },
    });
  }

  async recordEvent(db: DbClient, input: RecordEventOutboxInput): Promise<{ written: true }> {
    const createData = {
      organization_id: input.organization_id,
      idempotency_key: input.idempotency_key,
      event_type: input.event_type,
      version: input.version,
      status: 'pending',
      attempt_count: 0,
      next_attempt_at: null,
      last_error: null,
      dead_lettered_at: null,
      locked_at: null,
      locked_by: null,
      processed_at: null,
      payload: input.payload as Prisma.InputJsonValue,
    };

    if (typeof (db.eventOutbox as { upsert?: unknown }).upsert === 'function') {
      await db.eventOutbox.upsert({
        where: {
          organization_id_idempotency_key: {
            organization_id: input.organization_id,
            idempotency_key: input.idempotency_key,
          },
        },
        create: createData,
        update: {},
      });
    } else {
      await db.eventOutbox.create({
        data: createData,
      });
    }

    return { written: true };
  }

  async recordAttemptFailure(
    db: DbClient,
    input: {
      organization_id: string;
      idempotency_key: string;
      failed_at?: Date;
      retry_after_ms?: number;
      error_message: string;
      locked_by?: string | null;
    },
  ): Promise<{ written: true }> {
    const failedAt = input.failed_at ?? new Date();
    const retryDelay = input.retry_after_ms ?? 60_000;

    await db.eventOutbox.update({
      where: {
        organization_id_idempotency_key: {
          organization_id: input.organization_id,
          idempotency_key: input.idempotency_key,
        },
      },
      data: {
        status: 'pending',
        attempt_count: {
          increment: 1,
        },
        next_attempt_at: new Date(failedAt.getTime() + retryDelay),
        last_error: input.error_message,
        locked_at: null,
        locked_by: this.normalizeActorUserId(input.locked_by),
      },
    });

    return { written: true };
  }

  async markDelivered(
    db: DbClient,
    input: {
      organization_id: string;
      idempotency_key: string;
      delivered_at?: Date;
    },
  ): Promise<{ written: true }> {
    const deliveredAt = input.delivered_at ?? new Date();

    await db.eventOutbox.update({
      where: {
        organization_id_idempotency_key: {
          organization_id: input.organization_id,
          idempotency_key: input.idempotency_key,
        },
      },
      data: {
        status: 'processed',
        processed_at: deliveredAt,
        next_attempt_at: null,
        last_error: null,
        locked_at: null,
        locked_by: null,
      },
    });

    return { written: true };
  }

  async markDeadLettered(
    db: DbClient,
    input: {
      organization_id: string;
      idempotency_key: string;
      dead_lettered_at?: Date;
      error_message: string;
    },
  ): Promise<{ written: true }> {
    const deadLetteredAt = input.dead_lettered_at ?? new Date();

    await db.eventOutbox.update({
      where: {
        organization_id_idempotency_key: {
          organization_id: input.organization_id,
          idempotency_key: input.idempotency_key,
        },
      },
      data: {
        status: 'dead_lettered',
        dead_lettered_at: deadLetteredAt,
        last_error: input.error_message,
        next_attempt_at: null,
        locked_at: null,
        locked_by: null,
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

  private normalizeIdempotencyKey(idempotencyKeyRaw?: string): string | null {
    if (typeof idempotencyKeyRaw !== 'string') {
      return null;
    }

    const trimmed = idempotencyKeyRaw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private deriveMutationIdempotencyKey(input: {
    organization_id: string;
    action_key: string;
    entity_type: string;
    entity_id: string;
    actor_user_id: string | null;
  }): string {
    const hash = createHash('sha256');
    hash.update(input.organization_id);
    hash.update('|');
    hash.update(input.action_key);
    hash.update('|');
    hash.update(input.entity_type);
    hash.update('|');
    hash.update(input.entity_id);
    hash.update('|');
    hash.update(input.actor_user_id ?? 'anonymous');

    return `outbox_${hash.digest('hex')}`;
  }
}
