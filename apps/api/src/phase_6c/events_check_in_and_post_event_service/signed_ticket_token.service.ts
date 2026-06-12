import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const PHASE_6C_SIGNED_TICKET_TOKEN_SEED_ID = "seed_6c_112_signed_ticket_token" as const;
export const PHASE_6C_SIGNED_TICKET_TOKEN_COMPONENT_ID = "6C.09" as const;
export const SIGNED_TICKET_TOKEN_RUNTIME_EVENT = "phase_6c.events_check_in_and_post_event_service.signed_ticket_token.runtime_evaluated" as const;

type SignedTicketTokenAlgorithm = 'HS256';

type SignedTicketPayload = {
  iss: string;
  aud: string;
  iat: number;
  nbf: number;
  exp: number;
  org: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  qr_payload_digest: string;
};

export type SignedTicketTokenInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  event_config_ref: string;
  registration_ref: string;
  attendee_ref: string;
  ticket_type_ref: string;
  qr_payload_digest: string;
  source_record_ref: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
  signing_key_ref: string;
  signing_key_material: string;
  issued_at: string;
  not_before: string;
  expires_at: string;
  issuer: string;
  audience: string;
  ticket_issue_ref?: string;
  person_identity_ref?: string;
  access_audit_ref?: string;
  control_metadata?: Record<string, unknown>;
  production_secret_lookup_requested?: boolean;
  token_persistence_requested?: boolean;
  token_delivery_requested?: boolean;
  check_in_validation_requested?: boolean;
  schema_mutation_requested?: boolean;
  frontend_requested?: boolean;
};

export type SignedTicketTokenRuntimeReceipt = {
  seed_id: typeof PHASE_6C_SIGNED_TICKET_TOKEN_SEED_ID;
  component_id: typeof PHASE_6C_SIGNED_TICKET_TOKEN_COMPONENT_ID;
  component_slug: "events_check_in_and_post_event_service";
  model_name: "Phase6CSignedTicketToken";
  event_name: typeof SIGNED_TICKET_TOKEN_RUNTIME_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  algorithm: SignedTicketTokenAlgorithm;
  signing_key_ref: string;
  token: string;
  token_header_digest: string;
  token_payload_digest: string;
  token_signature_digest: string;
  verification_result: 'SIGNATURE_VALID';
  dependency_trace: {
    service_manifest_contract: string;
    registration_context: '6C.08';
    qr_ticket_issuing_seed: 'seed_6c_111_qr_ticket_issuing';
    ticket_issue_ref: string | null;
    person_identity_ref: string | null;
    access_audit_ref: string | null;
  };
  decision_refs: readonly string[];
  forbidden_behavior_rejections: readonly string[];
  control_metadata: Record<string, unknown>;
  evaluated_by_user_id: string;
  evaluated_at: string;
  runtime_evidence_digest: string;
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(field + ' is required for signed_ticket_token runtime evaluation.');
  }
  return value.trim();
}

function optionalRef(value: string | undefined, field: string): string | null {
  if (value === undefined) {
    return null;
  }
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(field + ' must be non-empty when provided for signed_ticket_token.');
  }
  return normalized;
}

function requireTimestamp(value: string | undefined, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) {
    throw new Error(field + ' must be a valid ISO-compatible timestamp for signed_ticket_token.');
  }
  return normalized;
}

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function sign(input: string, key: string): string {
  return createHmac('sha256', key).update(input).digest('base64url');
}

function verify(token: string, key: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  const expected = sign(parts[0] + '.' + parts[1], key);
  const actual = parts[2];
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function assertForbiddenRequests(input: SignedTicketTokenInput): readonly string[] {
  const rejections = [
    ['production_secret_lookup_requested', input.production_secret_lookup_requested, 'production secret lookup is outside this seed-local token evaluator'],
    ['token_persistence_requested', input.token_persistence_requested, 'token persistence is outside the exact FFET scope'],
    ['token_delivery_requested', input.token_delivery_requested, 'token delivery is outside signed_ticket_token'],
    ['check_in_validation_requested', input.check_in_validation_requested, 'check-in validation belongs to a separate check-in seed'],
    ['schema_mutation_requested', input.schema_mutation_requested, 'schema mutation is forbidden for this runtime FFET'],
    ['frontend_requested', input.frontend_requested, 'frontend creation is outside the exact FFET scope'],
  ] as const;

  for (const [field, requested, message] of rejections) {
    if (requested === true) {
      throw new Error(field + ': ' + message + '.');
    }
  }

  return rejections.map(([field, , message]) => field + ': ' + message);
}

function digestRuntime(receiptWithoutDigest: Omit<SignedTicketTokenRuntimeReceipt, 'runtime_evidence_digest'>): string {
  return sha256(JSON.stringify(receiptWithoutDigest));
}

export function evaluateSignedTicketToken(input: SignedTicketTokenInput): SignedTicketTokenRuntimeReceipt {
  const forbiddenBehaviorRejections = assertForbiddenRequests(input);
  const issuedAt = requireTimestamp(input.issued_at, 'issued_at');
  const notBefore = requireTimestamp(input.not_before, 'not_before');
  const expiresAt = requireTimestamp(input.expires_at, 'expires_at');
  if (Date.parse(notBefore) < Date.parse(issuedAt)) {
    throw new Error('not_before must be on or after issued_at for signed_ticket_token.');
  }
  if (Date.parse(expiresAt) <= Date.parse(notBefore)) {
    throw new Error('expires_at must be after not_before for signed_ticket_token.');
  }

  const signingKeyMaterial = requireNonEmpty(input.signing_key_material, 'signing_key_material');
  const header = { alg: 'HS256' as const, typ: 'JWT', kid: requireNonEmpty(input.signing_key_ref, 'signing_key_ref') };
  const payload: SignedTicketPayload = {
    iss: requireNonEmpty(input.issuer, 'issuer'),
    aud: requireNonEmpty(input.audience, 'audience'),
    iat: Math.floor(Date.parse(issuedAt) / 1000),
    nbf: Math.floor(Date.parse(notBefore) / 1000),
    exp: Math.floor(Date.parse(expiresAt) / 1000),
    org: requireNonEmpty(input.organization_id, 'organization_id'),
    event_config_ref: requireNonEmpty(input.event_config_ref, 'event_config_ref'),
    registration_ref: requireNonEmpty(input.registration_ref, 'registration_ref'),
    attendee_ref: requireNonEmpty(input.attendee_ref, 'attendee_ref'),
    ticket_type_ref: requireNonEmpty(input.ticket_type_ref, 'ticket_type_ref'),
    qr_payload_digest: requireNonEmpty(input.qr_payload_digest, 'qr_payload_digest'),
  };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = sign(encodedHeader + '.' + encodedPayload, signingKeyMaterial);
  const token = encodedHeader + '.' + encodedPayload + '.' + signature;
  if (!verify(token, signingKeyMaterial)) {
    throw new Error('signed_ticket_token verification failed after signing.');
  }

  const serviceManifestContract = requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id');
  const receiptWithoutDigest: Omit<SignedTicketTokenRuntimeReceipt, 'runtime_evidence_digest'> = {
    seed_id: PHASE_6C_SIGNED_TICKET_TOKEN_SEED_ID,
    component_id: PHASE_6C_SIGNED_TICKET_TOKEN_COMPONENT_ID,
    component_slug: "events_check_in_and_post_event_service",
    model_name: "Phase6CSignedTicketToken",
    event_name: SIGNED_TICKET_TOKEN_RUNTIME_EVENT,
    organization_id: payload.org,
    service_manifest_contract_id: serviceManifestContract,
    algorithm: 'HS256',
    signing_key_ref: header.kid,
    token,
    token_header_digest: sha256(encodedHeader),
    token_payload_digest: sha256(encodedPayload),
    token_signature_digest: sha256(signature),
    verification_result: 'SIGNATURE_VALID',
    dependency_trace: {
      service_manifest_contract: serviceManifestContract,
      registration_context: '6C.08',
      qr_ticket_issuing_seed: 'seed_6c_111_qr_ticket_issuing',
      ticket_issue_ref: optionalRef(input.ticket_issue_ref, 'ticket_issue_ref'),
      person_identity_ref: optionalRef(input.person_identity_ref, 'person_identity_ref'),
      access_audit_ref: optionalRef(input.access_audit_ref, 'access_audit_ref'),
    },
    decision_refs: ["6C-EVENT-CHECK-002", "6C-EVENT-CHECK-014", "6C-GLOBAL-018"],
    forbidden_behavior_rejections: forbiddenBehaviorRejections,
    control_metadata: input.control_metadata ?? {},
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return {
    ...receiptWithoutDigest,
    runtime_evidence_digest: digestRuntime(receiptWithoutDigest),
  };
}
