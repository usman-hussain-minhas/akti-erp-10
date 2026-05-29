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

export type ReportingReadModelQueryInput = {
  organization_id: string;
  actor_user_id: string;
  read_model_key: string;
  capability_keys: string[];
  limit?: number;
  cursor?: string | null;
  entries?: ReportingReadModelEntryWrite[];
};

export type ReportingReadModelQueryResponse = {
  method: 'GET';
  route: '/platform/read-models/:key';
  request_shape: 'ReadModelQueryRequest';
  response_shape: 'ReadModelQueryResponse';
  request: {
    read_model_key: string;
    capability_keys: string[];
    limit: number;
    cursor: string | null;
  };
  capability: {
    required: 'platform.reporting.read';
    target_capability_filter: string[];
  };
  tenant_context: {
    organization_id: string;
    actor_user_id: string;
  };
  gatekeeper: {
    risk_check_required: true;
    data_source_validation_required: true;
    capability_key: 'platform.reporting.read';
  };
  audit: {
    event_type: 'read_model.query.executed';
    audit_required: true;
  };
  items: ReportingReadModelEntryWrite[];
  page: {
    limit: number;
    cursor: string | null;
    next_cursor: string | null;
  };
  direct_cross_module_table_read: false;
  business_report_created: false;
};

export type ReportingTenantIsolationFixtureInput = {
  organization_id: string;
  actor_user_id: string;
  read_model_key: string;
  capability_keys: string[];
  entries: ReportingReadModelEntryWrite[];
};

export type ReportingTenantIsolationFixtureResult = {
  organization_id: string;
  actor_user_id: string;
  visible_source_event_ids: string[];
  excluded_cross_tenant_source_event_ids: string[];
  excluded_other_read_model_source_event_ids: string[];
  tenant_isolation_enforced: true;
  read_model_filter_enforced: true;
  direct_cross_module_table_read: false;
  fake_operational_data: false;
  entries_examined: number;
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

  queryReadModel(input: ReportingReadModelQueryInput): ReportingReadModelQueryResponse {
    const organizationId = this.required(input.organization_id, 'organization_id');
    const actorUserId = this.required(input.actor_user_id, 'actor_user_id');
    const readModelKey = this.required(input.read_model_key, 'read_model_key');
    const capabilityKeys = this.capabilityKeys(input.capability_keys);
    const limit = this.limit(input.limit);
    const cursor = this.optionalString(input.cursor, 'cursor');
    const entries = this.entries(input.entries ?? [], organizationId, readModelKey, limit);

    return {
      method: 'GET',
      route: '/platform/read-models/:key',
      request_shape: 'ReadModelQueryRequest',
      response_shape: 'ReadModelQueryResponse',
      request: {
        read_model_key: readModelKey,
        capability_keys: capabilityKeys,
        limit,
        cursor,
      },
      capability: {
        required: 'platform.reporting.read',
        target_capability_filter: capabilityKeys,
      },
      tenant_context: {
        organization_id: organizationId,
        actor_user_id: actorUserId,
      },
      gatekeeper: {
        risk_check_required: true,
        data_source_validation_required: true,
        capability_key: 'platform.reporting.read',
      },
      audit: {
        event_type: 'read_model.query.executed',
        audit_required: true,
      },
      items: entries,
      page: {
        limit,
        cursor,
        next_cursor: entries.length === limit ? entries[entries.length - 1]?.source_event_cursor ?? null : null,
      },
      direct_cross_module_table_read: false,
      business_report_created: false,
    };
  }

  runTenantIsolationFixture(input: ReportingTenantIsolationFixtureInput): ReportingTenantIsolationFixtureResult {
    const organizationId = this.required(input.organization_id, 'organization_id');
    const actorUserId = this.required(input.actor_user_id, 'actor_user_id');
    const readModelKey = this.required(input.read_model_key, 'read_model_key');
    this.capabilityKeys(input.capability_keys);
    if (!Array.isArray(input.entries) || input.entries.length === 0) {
      throw new BadRequestException('reporting tenant isolation fixture entries must not be empty');
    }

    const visibleSourceEventIds: string[] = [];
    const excludedCrossTenantSourceEventIds: string[] = [];
    const excludedOtherReadModelSourceEventIds: string[] = [];

    for (const entry of input.entries) {
      if (entry.direct_cross_module_table_read !== false || entry.fake_operational_data !== false) {
        throw new BadRequestException('reporting fixture entries must be event-driven projections');
      }
      const sourceEventId = this.required(entry.source_event_id, 'entry.source_event_id');
      const entryOrganizationId = this.required(entry.organization_id, 'entry.organization_id');
      const entryReadModelKey = this.required(entry.read_model_key, 'entry.read_model_key');

      if (entryOrganizationId !== organizationId) {
        excludedCrossTenantSourceEventIds.push(sourceEventId);
        continue;
      }
      if (entryReadModelKey !== readModelKey) {
        excludedOtherReadModelSourceEventIds.push(sourceEventId);
        continue;
      }

      visibleSourceEventIds.push(sourceEventId);
    }

    return {
      organization_id: organizationId,
      actor_user_id: actorUserId,
      visible_source_event_ids: visibleSourceEventIds.sort(),
      excluded_cross_tenant_source_event_ids: excludedCrossTenantSourceEventIds.sort(),
      excluded_other_read_model_source_event_ids: excludedOtherReadModelSourceEventIds.sort(),
      tenant_isolation_enforced: true,
      read_model_filter_enforced: true,
      direct_cross_module_table_read: false,
      fake_operational_data: false,
      entries_examined: input.entries.length,
    };
  }

  private cursorFor(event: EventEnvelope): string {
    return `${event.occurred_at}:${event.event_id}`;
  }

  private entries(
    input: ReportingReadModelEntryWrite[],
    organizationId: string,
    readModelKey: string,
    limit: number,
  ): ReportingReadModelEntryWrite[] {
    if (!Array.isArray(input)) {
      throw new BadRequestException('reporting read-model entries must be an array');
    }
    for (const entry of input) {
      if (entry.direct_cross_module_table_read !== false || entry.fake_operational_data !== false) {
        throw new BadRequestException('reporting read-model entries must come from event-driven projections');
      }
      this.required(entry.organization_id, 'entry.organization_id');
      this.required(entry.read_model_key, 'entry.read_model_key');
      this.required(entry.source_event_cursor, 'entry.source_event_cursor');
    }

    return input
      .filter((entry) => entry.organization_id === organizationId && entry.read_model_key === readModelKey)
      .slice(0, limit);
  }

  private capabilityKeys(input: string[]): string[] {
    if (!Array.isArray(input) || input.length === 0) {
      throw new BadRequestException('reporting capability_keys are required');
    }

    const keys = input.map((value) => this.required(value, 'capability_keys'));
    if (!keys.includes('platform.reporting.read')) {
      throw new BadRequestException('reporting platform.reporting.read capability is required');
    }
    if (new Set(keys).size !== keys.length) {
      throw new BadRequestException('reporting capability_keys must be unique');
    }

    return keys;
  }

  private limit(input: number | undefined): number {
    if (input === undefined) {
      return 25;
    }
    if (!Number.isSafeInteger(input) || input < 1 || input > 100) {
      throw new BadRequestException('reporting limit must be an integer between 1 and 100');
    }

    return input;
  }

  private payload(input: Record<string, unknown>): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('reporting read-model projection_payload must be an object');
    }

    return input;
  }

  private optionalString(input: unknown, field: string): string | null {
    if (input === undefined || input === null) {
      return null;
    }

    return this.required(input, field);
  }

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`reporting ${field} is required`);
    }

    return input.trim();
  }
}
