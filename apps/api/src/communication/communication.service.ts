import { BadRequestException, Injectable } from '@nestjs/common';

export type CommunicationChannel = 'email_stub' | 'sms_stub' | 'push_stub' | 'whatsapp_stub';
export type CommunicationRiskClassification = 'low' | 'medium' | 'high';

export type CommunicationIntentInput = {
  organization_id: string;
  actor_user_id: string;
  source_module: string;
  intent_key: string;
  recipient_ref: string;
  channel: CommunicationChannel;
  template_key: string;
  payload: Record<string, unknown>;
  idempotency_key: string;
  requested_at: string;
  consent_ref: string;
  retention_policy: string;
  risk_classification: CommunicationRiskClassification;
  priority: 'low' | 'normal' | 'high';
};

export type CommunicationIntentDeclaration = {
  organization_id: string;
  actor_user_id: string;
  source_module: string;
  intent_key: string;
  recipient_ref: string;
  channel: CommunicationChannel;
  template_key: string;
  payload: Record<string, unknown>;
  idempotency_key: string;
  requested_at: string;
  consent_ref: string;
  retention_policy: string;
  risk_classification: CommunicationRiskClassification;
  priority: 'low' | 'normal' | 'high';
  status: 'declared';
  delivery_executed: false;
  production_provider_calls: false;
  gatekeeper: {
    risk_check_required: true;
    capability_key: 'platform.communication.send';
    consent_check_required: true;
  };
  audit: {
    event_type: 'communication.intent.declared';
    audit_required: true;
  };
};

const ALLOWED_CHANNELS = new Set<CommunicationChannel>(['email_stub', 'sms_stub', 'push_stub', 'whatsapp_stub']);
const ALLOWED_RISK = new Set<CommunicationRiskClassification>(['low', 'medium', 'high']);
const ALLOWED_PRIORITY = new Set(['low', 'normal', 'high']);
const FORBIDDEN_LIVE_CHANNEL_MARKERS = ['live', 'production', 'provider', 'twilio', 'sendgrid', 'whatsapp_business'];

@Injectable()
export class CommunicationService {
  declareIntent(input: CommunicationIntentInput): CommunicationIntentDeclaration {
    const channel = this.channel(input.channel);
    const riskClassification = this.riskClassification(input.risk_classification);
    const priority = this.priority(input.priority);
    const requestedAt = this.isoTimestamp(input.requested_at, 'requested_at');
    const payload = this.payload(input.payload);

    return {
      organization_id: this.required(input.organization_id, 'organization_id'),
      actor_user_id: this.required(input.actor_user_id, 'actor_user_id'),
      source_module: this.required(input.source_module, 'source_module'),
      intent_key: this.required(input.intent_key, 'intent_key'),
      recipient_ref: this.required(input.recipient_ref, 'recipient_ref'),
      channel,
      template_key: this.required(input.template_key, 'template_key'),
      payload,
      idempotency_key: this.required(input.idempotency_key, 'idempotency_key'),
      requested_at: requestedAt,
      consent_ref: this.required(input.consent_ref, 'consent_ref'),
      retention_policy: this.required(input.retention_policy, 'retention_policy'),
      risk_classification: riskClassification,
      priority,
      status: 'declared',
      delivery_executed: false,
      production_provider_calls: false,
      gatekeeper: {
        risk_check_required: true,
        capability_key: 'platform.communication.send',
        consent_check_required: true,
      },
      audit: {
        event_type: 'communication.intent.declared',
        audit_required: true,
      },
    };
  }

  private channel(input: CommunicationChannel): CommunicationChannel {
    const value = this.required(input, 'channel') as CommunicationChannel;
    if (!ALLOWED_CHANNELS.has(value) || this.containsLiveProviderMarker(value)) {
      throw new BadRequestException('communication channel must be an approved local/stub channel');
    }

    return value;
  }

  private riskClassification(input: CommunicationRiskClassification): CommunicationRiskClassification {
    const value = this.required(input, 'risk_classification') as CommunicationRiskClassification;
    if (!ALLOWED_RISK.has(value)) {
      throw new BadRequestException('communication risk_classification is invalid');
    }

    return value;
  }

  private priority(input: CommunicationIntentInput['priority']): CommunicationIntentInput['priority'] {
    const value = this.required(input, 'priority') as CommunicationIntentInput['priority'];
    if (!ALLOWED_PRIORITY.has(value)) {
      throw new BadRequestException('communication priority is invalid');
    }

    return value;
  }

  private payload(input: Record<string, unknown>): Record<string, unknown> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('communication payload must be an object');
    }

    return input;
  }

  private isoTimestamp(input: unknown, field: string): string {
    const value = this.required(input, field);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`communication ${field} must be an ISO timestamp`);
    }

    return date.toISOString();
  }

  private required(input: unknown, field: string): string {
    if (typeof input !== 'string' || input.trim().length === 0) {
      throw new BadRequestException(`communication ${field} is required`);
    }

    return input.trim();
  }

  private containsLiveProviderMarker(input: string): boolean {
    const normalized = input.toLowerCase();
    return FORBIDDEN_LIVE_CHANNEL_MARKERS.some((marker) => normalized.includes(marker));
  }
}
