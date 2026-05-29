import { BadRequestException, Injectable } from '@nestjs/common';

export type StructuredLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type StructuredLogInput = {
  level: StructuredLogLevel;
  message: string;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
  source_module: string;
  action_key: string;
  entity_type: string;
  entity_id: string | null;
  metadata?: Record<string, unknown>;
};

export type StructuredLogEntry = {
  level: StructuredLogLevel;
  message: string;
  organization_id: string;
  actor_user_id: string;
  correlation_id: string;
  source_module: string;
  action_key: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  redacted_fields: string[];
  structured: true;
  emitted_at: string;
};

const ALLOWED_LEVELS = new Set<StructuredLogLevel>(['debug', 'info', 'warn', 'error']);
const SECRET_FIELD_MARKERS = ['authorization', 'api_key', 'apikey', 'secret', 'token', 'password', 'credential', 'cookie'];
export const STRUCTURED_LOG_REDACTED_VALUE = '[REDACTED]';

@Injectable()
export class StructuredLoggerService {
  buildEntry(input: StructuredLogInput, emittedAt: string = new Date().toISOString()): StructuredLogEntry {
    const level = this.level(input.level);
    const message = this.required(input.message, 'message');
    const organizationId = this.required(input.organization_id, 'organization_id');
    const actorUserId = this.required(input.actor_user_id, 'actor_user_id');
    const correlationId = this.required(input.correlation_id, 'correlation_id');
    const sourceModule = this.required(input.source_module, 'source_module');
    const actionKey = this.required(input.action_key, 'action_key');
    const entityType = this.required(input.entity_type, 'entity_type');
    const metadata = this.metadata(input.metadata ?? {});
    const redactedMetadata = this.redactMetadata(metadata);
    const timestamp = this.isoTimestamp(emittedAt, 'emitted_at');

    return {
      level,
      message,
      organization_id: organizationId,
      actor_user_id: actorUserId,
      correlation_id: correlationId,
      source_module: sourceModule,
      action_key: actionKey,
      entity_type: entityType,
      entity_id: input.entity_id === null ? null : this.required(input.entity_id, 'entity_id'),
      metadata: redactedMetadata.value,
      redacted_fields: redactedMetadata.redactedFields,
      structured: true,
      emitted_at: timestamp,
    };
  }

  private level(input: StructuredLogLevel): StructuredLogLevel {
    const value = this.required(input, 'level') as StructuredLogLevel;
    if (!ALLOWED_LEVELS.has(value)) {
      throw new BadRequestException('structured log level is invalid');
    }

    return value;
  }

  private metadata(input: Record<string, unknown>): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('structured log metadata must be an object');
    }

    return { ...input };
  }

  private redactMetadata(input: Record<string, unknown>): {
    value: Record<string, unknown>;
    redactedFields: string[];
  } {
    const redactedFields: string[] = [];
    const value = this.redactValue(input, [], redactedFields) as Record<string, unknown>;

    return {
      value,
      redactedFields,
    };
  }

  private redactValue(input: unknown, path: string[], redactedFields: string[]): unknown {
    if (Array.isArray(input)) {
      return input.map((item, index) => this.redactValue(item, [...path, String(index)], redactedFields));
    }

    if (input && typeof input === 'object') {
      const output: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        const nextPath = [...path, key];
        if (this.isSecretField(key)) {
          redactedFields.push(nextPath.join('.'));
          output[key] = STRUCTURED_LOG_REDACTED_VALUE;
          continue;
        }

        output[key] = this.redactValue(value, nextPath, redactedFields);
      }

      return output;
    }

    return input;
  }

  private isSecretField(field: string): boolean {
    const normalized = field.toLowerCase().replace(/[-\s]/g, '_');
    return SECRET_FIELD_MARKERS.some((marker) => normalized.includes(marker));
  }

  private isoTimestamp(input: unknown, field: string): string {
    const value = this.required(input, field);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`structured log ${field} must be an ISO timestamp`);
    }

    return date.toISOString();
  }

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`structured log ${field} is required`);
    }

    return input.trim();
  }
}
