import { createHash } from 'node:crypto';

import { BadRequestException, Injectable } from '@nestjs/common';
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
  producer?: string;
  source_module?: string;
  subject?: EventEnvelopeSubject;
  occurred_at?: Date;
  compliance?: Partial<EventEnvelopeComplianceContext>;
};

export const PLATFORM_MUTATION_RECORDED_EVENT_TYPE = 'platform.mutation.recorded';
export const PLATFORM_MUTATION_RECORDED_EVENT_VERSION = '0.1.0';
export const EVENT_ENVELOPE_SCHEMA_VERSION = '1.0.0';
export const DEFAULT_EVENT_PRODUCER = 'akti-api';
export const DEFAULT_EVENT_SOURCE_MODULE = 'platform';

export type EventEnvelopeSubject = {
  entity_type: string;
  entity_id: string | null;
};

export type EventEnvelopeComplianceContext = {
  privacy_class: 'internal' | 'confidential' | 'restricted';
  retention_class: 'standard' | 'audit' | 'legal_hold';
  redaction_policy: 'none' | 'standard' | 'strict';
  audit_required: boolean;
  replay_allowed: boolean;
};

export type EventEnvelope = {
  event_id: string;
  event_type: string;
  producer: string;
  occurred_at: string;
  schema_version: string;
  organization_id: string;
  source_module: string;
  subject: EventEnvelopeSubject;
  payload: Record<string, unknown>;
  idempotency_key: string;
  compliance: EventEnvelopeComplianceContext;
};

type BuildEventEnvelopeInput = {
  organization_id: string;
  event_type: string;
  idempotency_key: string;
  payload: Record<string, unknown>;
  producer?: string;
  source_module?: string;
  subject?: EventEnvelopeSubject;
  occurred_at?: Date;
  schema_version?: string;
  compliance?: Partial<EventEnvelopeComplianceContext>;
};

const DEFAULT_EVENT_COMPLIANCE_CONTEXT: EventEnvelopeComplianceContext = {
  privacy_class: 'internal',
  retention_class: 'standard',
  redaction_policy: 'standard',
  audit_required: true,
  replay_allowed: true,
};

export function buildEventEnvelope(input: BuildEventEnvelopeInput): EventEnvelope {
  const occurredAt = input.occurred_at ?? new Date();
  const idempotencyKey = requireNonEmptyString(input.idempotency_key, 'event envelope idempotency_key is required');
  const envelope: EventEnvelope = {
    event_id: deriveEventEnvelopeId(input.organization_id, idempotencyKey),
    event_type: requireNonEmptyString(input.event_type, 'event envelope event_type is required'),
    producer: normalizeOptionalString(input.producer) ?? DEFAULT_EVENT_PRODUCER,
    occurred_at: occurredAt.toISOString(),
    schema_version: normalizeOptionalString(input.schema_version) ?? EVENT_ENVELOPE_SCHEMA_VERSION,
    organization_id: requireNonEmptyString(input.organization_id, 'event envelope organization_id is required'),
    source_module: normalizeOptionalString(input.source_module) ?? inferSourceModuleFromEventType(input.event_type),
    subject: normalizeEventSubject(input.subject, idempotencyKey),
    payload: requirePayloadObject(input.payload),
    idempotency_key: idempotencyKey,
    compliance: {
      ...DEFAULT_EVENT_COMPLIANCE_CONTEXT,
      ...(input.compliance ?? {}),
    },
  };

  assertEventEnvelope(envelope);
  return envelope;
}

export function assertEventEnvelope(envelope: EventEnvelope): EventEnvelope {
  requireNonEmptyString(envelope.event_id, 'event envelope event_id is required');
  requireNonEmptyString(envelope.event_type, 'event envelope event_type is required');
  requireNonEmptyString(envelope.producer, 'event envelope producer is required');
  requireIsoTimestamp(envelope.occurred_at, 'event envelope occurred_at must be an ISO timestamp');
  requireNonEmptyString(envelope.schema_version, 'event envelope schema_version is required');
  requireNonEmptyString(envelope.organization_id, 'event envelope organization_id is required');
  requireNonEmptyString(envelope.source_module, 'event envelope source_module is required');
  normalizeEventSubject(envelope.subject, envelope.idempotency_key);
  requirePayloadObject(envelope.payload);
  requireNonEmptyString(envelope.idempotency_key, 'event envelope idempotency_key is required');
  assertComplianceContext(envelope.compliance);

  return envelope;
}

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
      source_module: 'platform.mutation',
      subject: {
        entity_type: input.entity_type,
        entity_id: input.entity_id,
      },
      occurred_at: occurredAt,
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
    const envelope = buildEventEnvelope({
      organization_id: input.organization_id,
      event_type: input.event_type,
      idempotency_key: input.idempotency_key,
      payload: input.payload,
      producer: input.producer,
      source_module: input.source_module,
      subject: input.subject,
      occurred_at: input.occurred_at,
      compliance: input.compliance,
    });

    const createData = {
      organization_id: input.organization_id,
      idempotency_key: input.idempotency_key,
      event_type: input.event_type,
      version: input.version,
      event_id: envelope.event_id,
      producer: envelope.producer,
      occurred_at: new Date(envelope.occurred_at),
      schema_version: envelope.schema_version,
      source_module: envelope.source_module,
      subject: envelope.subject as Prisma.InputJsonValue,
      status: 'pending',
      attempt_count: 0,
      next_attempt_at: null,
      last_error: null,
      dead_lettered_at: null,
      locked_at: null,
      locked_by: null,
      processed_at: null,
      payload: input.payload as Prisma.InputJsonValue,
      privacy_class: envelope.compliance.privacy_class,
      retention_class: envelope.compliance.retention_class,
      redaction_policy: envelope.compliance.redaction_policy,
      audit_required: envelope.compliance.audit_required,
      replay_allowed: envelope.compliance.replay_allowed,
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

function deriveEventEnvelopeId(organizationIdRaw: string, idempotencyKeyRaw: string): string {
  const organizationId = requireNonEmptyString(organizationIdRaw, 'event envelope organization_id is required');
  const idempotencyKey = requireNonEmptyString(idempotencyKeyRaw, 'event envelope idempotency_key is required');
  const hash = createHash('sha256');
  hash.update(organizationId);
  hash.update('|');
  hash.update(idempotencyKey);

  return `evt_${hash.digest('hex')}`;
}

function inferSourceModuleFromEventType(eventTypeRaw: string): string {
  const eventType = requireNonEmptyString(eventTypeRaw, 'event envelope event_type is required');
  const [first, second] = eventType.split('.');

  if (!first || !second) {
    return DEFAULT_EVENT_SOURCE_MODULE;
  }

  return `${first}.${second}`;
}

function normalizeEventSubject(subjectRaw: EventEnvelopeSubject | undefined, idempotencyKey: string): EventEnvelopeSubject {
  if (!subjectRaw) {
    return {
      entity_type: 'event',
      entity_id: idempotencyKey,
    };
  }

  return {
    entity_type: requireNonEmptyString(subjectRaw.entity_type, 'event envelope subject.entity_type is required'),
    entity_id: normalizeOptionalString(subjectRaw.entity_id),
  };
}

function assertComplianceContext(compliance: EventEnvelopeComplianceContext): void {
  const allowedPrivacy = new Set<EventEnvelopeComplianceContext['privacy_class']>([
    'internal',
    'confidential',
    'restricted',
  ]);
  const allowedRetention = new Set<EventEnvelopeComplianceContext['retention_class']>([
    'standard',
    'audit',
    'legal_hold',
  ]);
  const allowedRedaction = new Set<EventEnvelopeComplianceContext['redaction_policy']>(['none', 'standard', 'strict']);

  if (!allowedPrivacy.has(compliance.privacy_class)) {
    throw new BadRequestException('event envelope privacy_class is invalid');
  }
  if (!allowedRetention.has(compliance.retention_class)) {
    throw new BadRequestException('event envelope retention_class is invalid');
  }
  if (!allowedRedaction.has(compliance.redaction_policy)) {
    throw new BadRequestException('event envelope redaction_policy is invalid');
  }
  if (typeof compliance.audit_required !== 'boolean') {
    throw new BadRequestException('event envelope audit_required must be boolean');
  }
  if (typeof compliance.replay_allowed !== 'boolean') {
    throw new BadRequestException('event envelope replay_allowed must be boolean');
  }
}

function requirePayloadObject(payloadRaw: Record<string, unknown>): Record<string, unknown> {
  if (!payloadRaw || typeof payloadRaw !== 'object' || Array.isArray(payloadRaw)) {
    throw new BadRequestException('event envelope payload must be an object');
  }

  return payloadRaw;
}

function requireIsoTimestamp(value: string, message: string): string {
  const normalized = requireNonEmptyString(value, message);
  const parsed = Date.parse(normalized);

  if (Number.isNaN(parsed) || new Date(parsed).toISOString() !== normalized) {
    throw new BadRequestException(message);
  }

  return normalized;
}

function requireNonEmptyString(value: string | null | undefined, message: string): string {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    throw new BadRequestException(message);
  }

  return normalized;
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
