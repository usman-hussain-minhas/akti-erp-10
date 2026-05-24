import { Injectable } from '@nestjs/common';

type OutboundStubInput = {
  organization_id: string;
  gateway_request_id: string;
  recipient_ref: string;
  idempotency_key: string;
};

type InboundReceiptStubInput = {
  organization_id: string;
  gateway_request_id: string;
  idempotency_key: string;
};

@Injectable()
export class WhatsappStubProvider {
  dispatchOutbound(input: OutboundStubInput) {
    return {
      channel: 'whatsapp_stub',
      dispatch_status: 'accepted_stub',
      stub_dispatch_id: `stub_dispatch_${input.gateway_request_id}`,
      organization_id: input.organization_id,
      recipient_ref: input.recipient_ref,
      idempotency_key: input.idempotency_key,
      dispatched_at: new Date().toISOString(),
    };
  }

  simulateInboundReceipt(input: InboundReceiptStubInput) {
    return {
      channel: 'whatsapp_stub',
      receipt_status: 'delivered_stub',
      stub_receipt_id: `stub_receipt_${input.gateway_request_id}`,
      organization_id: input.organization_id,
      idempotency_key: input.idempotency_key,
      received_at: new Date().toISOString(),
    };
  }
}
