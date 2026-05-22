# ADR-0003: WhatsApp Protected Timeline and Parallel CRM Decision

## ADR number

ADR-0003

## Title

WhatsApp Protected Timeline and Parallel CRM Decision

## Date

2026-05-22

## Status

Accepted

## Decision

AKTI will use one WhatsApp number with a shared inbox/CRM and round-robin team assignment as temporary operational relief while ERP foundation and Phase 2 are built.

Acceptable temporary tools include AiSensy, Interakt, WATI, respond.io, or equivalent. The temporary shared inbox/CRM is not final ERP architecture.

The ERP permanent path is:

- Phase 2A: Engagement Gateway Lite
- Phase 2B: Lead Desk Core
- Phase 2C: WhatsApp Lead Desk Integration

Lead Desk must not call Meta WhatsApp API directly. Messaging transport must go through Engagement Gateway Lite or the future Engagement Hub.

The temporary CRM remains active until ERP Phase 2C is tested and accepted.

Phase 2C pilot target date: TBD — must be assigned by AKTI leadership before Phase 0 is marked accepted, or a formal exception must be accepted.

## Context

AKTI currently has business pain from six WhatsApp numbers, six adsets, high Meta cost, sales team competition, and poor scaling.

Waiting for ERP Phase 2C would leave active ad-spend leakage unresolved during Phase 0 and Phase 1. The temporary CRM workflow protects the business now while keeping ERP architecture clean.

## Options considered

- Keep six WhatsApp numbers and six adsets.
- Wait for ERP Phase 2C before fixing WhatsApp operations.
- Use one temporary shared inbox/CRM in parallel while ERP foundation and Phase 2 are built.
- Build direct Meta WhatsApp integration inside Lead Desk.

## Chosen option

Use one temporary shared inbox/CRM now, with one WhatsApp number and round-robin assignment, while preserving the ERP transport boundary through Engagement Gateway Lite or the future Engagement Hub.

## Consequences

- Meta ad spend leakage gets an operational fix before ERP Phase 2C.
- Sales competition around separate WhatsApp numbers is reduced through one-number intake and team assignment.
- Lead Desk remains decoupled from direct Meta WhatsApp API calls.
- CRM/BSP selection remains an operational decision, not final ERP architecture.
- ADR-0003 must be updated with a concrete Phase 2C pilot target date before Phase 0 is fully accepted, unless a formal exception is accepted.

## Affected modules

Engagement Gateway Lite, future Engagement Hub, Lead Desk Core, WhatsApp Lead Desk Integration, CRM/BSP operational workflow, and Phase 2 planning.

## Owner

Usman Minhas / AKTI leadership as interim owner until formally delegated.

## Review date

2026-06-22 or before Phase 2A starts, whichever comes first.
