# ADR-0005: Phase 1 Outbox Boundary

## ADR number

ADR-0005

## Title

Phase 1 Outbox Boundary

## Date

2026-05-24

## Status

Accepted

## Decision

Phase 1 uses `EventOutbox` as a transactional append-only record of platform mutations. The only approved emitted event is `platform.mutation.recorded@0.1.0`.

The outbox row is written in the same transaction as the protected mutation where practical. Phase 1 does not include an event processor, delivery runtime, retry scheduler, idempotency enforcement, or dead-letter handling.

Retry scheduling, attempt counts, idempotency keys, error details, dead-letter state, and event delivery semantics are deferred to a later explicit event-processing ticket before Phase 2 business event workflows.

## Context

Phase 1 introduced basic audit and outbox helpers for platform foundation mutations. The runtime writes a generic platform mutation event, while the registry previously declared no emitted events. Before Phase 2, runtime event behavior and registry metadata must not drift.

## Options considered

- Add full retry, idempotency, and dead-letter schema fields now.
- Implement an event processor/runtime delivery loop now.
- Keep the Phase 1 outbox append-only and formally defer processor semantics.

## Chosen option

Keep the Phase 1 outbox append-only and formally defer processor semantics. Align registry metadata and verification with the single generic platform event already emitted by runtime code.

## Consequences

- No Prisma schema change or migration is needed for this Phase 1 hardening ticket.
- `EventOutbox.events_emitted` in registry metadata must declare exactly `platform.mutation.recorded@0.1.0`.
- Phase 1 verification must reject business events and any additional emitted entity events.
- Phase 2 event processing must revisit outbox schema and runtime delivery before introducing business event workflows.

## Affected modules

Platform observability, entity registry metadata, registry verification, and future event-processing tickets.

## Owner

Usman Minhas / AKTI leadership as interim owner until formally delegated.

## Review date

Before Phase 2 event-processing implementation.
