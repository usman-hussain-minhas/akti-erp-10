import { BadRequestException, Injectable } from '@nestjs/common';

import { assertEventEnvelope, type EventEnvelope } from '../platform-observability/event-outbox.service';

export type ReportingReadModelConsumeInput = {
  read_model_key: string;
  event: EventEnvelope;
  projection_payload: Record<string, unknown>;
};

export type ReportingReadModelEntryWrite = {
  model_name: 'ReadModelEntry';
  organization_id: string;
  read_model_key: string;
  source_event_id: string;
  source_event_type: string;
  source_event_version: string;
  source_event_occurred_at: string;
  source_event_cursor: string;
  subject_type: string;
  subject_id: string | null;
  payload: Record<string, unknown>;
  privacy_class: EventEnvelope['compliance']['privacy_class'];
  retention_class: EventEnvelope['compliance']['retention_class'];
  updated_at: string;
  direct_cross_module_table_read: false;
  fake_operational_data: false;
};

export type ReportingReadModelCursorWrite = {
  model_name: 'ReadModelCursor';
  organization_id: string;
  read_model_key: string;
  source_module: string;
  event_type: string;
  cursor_value: string;
  last_event_id: string;
  last_event_occurred_at: string;
  processed_at: string;
};

export type ReportingReadModelProjection = {
  entry: ReportingReadModelEntryWrite;
  cursor: ReportingReadModelCursorWrite;
  audit: {
    event_type: 'read_model.event.consumed';
    audit_required: true;
  };
  query_contract: {
    route: 'GET /platform/read-models/:key';
    capability_key: 'platform.reporting.read';
    implemented_in_this_ticket: false;
  };
};

@Injectable()
export class ReportingService {
  consumeEventForReadModel(input: ReportingReadModelConsumeInput): ReportingReadModelProjection {
    const readModelKey = this.required(input.read_model_key, 'read_model_key');
    const event = assertEventEnvelope(input.event);
    const projectionPayload = this.payload(input.projection_payload);
    const cursor = this.cursorFor(event);

    return {
      entry: {
        model_name: 'ReadModelEntry',
        organization_id: event.organization_id,
        read_model_key: readModelKey,
        source_event_id: event.event_id,
        source_event_type: event.event_type,
        source_event_version: event.schema_version,
        source_event_occurred_at: event.occurred_at,
        source_event_cursor: cursor,
        subject_type: event.subject.entity_type,
        subject_id: event.subject.entity_id,
        payload: projectionPayload,
        privacy_class: event.compliance.privacy_class,
        retention_class: event.compliance.retention_class,
        updated_at: event.occurred_at,
        direct_cross_module_table_read: false,
        fake_operational_data: false,
      },
      cursor: {
        model_name: 'ReadModelCursor',
        organization_id: event.organization_id,
        read_model_key: readModelKey,
        source_module: event.source_module,
        event_type: event.event_type,
        cursor_value: cursor,
        last_event_id: event.event_id,
        last_event_occurred_at: event.occurred_at,
        processed_at: event.occurred_at,
      },
      audit: {
        event_type: 'read_model.event.consumed',
        audit_required: true,
      },
      query_contract: {
        route: 'GET /platform/read-models/:key',
        capability_key: 'platform.reporting.read',
        implemented_in_this_ticket: false,
      },
    };
  }

  private cursorFor(event: EventEnvelope): string {
    return `${event.occurred_at}:${event.event_id}`;
  }

  private payload(input: Record<string, unknown>): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('reporting read-model projection_payload must be an object');
    }

    return input;
  }

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`reporting ${field} is required`);
    }

    return input.trim();
  }
}
