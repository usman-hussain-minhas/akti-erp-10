# ADR-0001: Architecture Governance and Source-of-Truth Hierarchy

## ADR number

ADR-0001

## Title

Architecture Governance and Source-of-Truth Hierarchy

## Date

2026-05-22

## Status

Accepted

## Decision

AKTI ERP architecture decisions are final only when recorded in ADRs and reflected by the appropriate repo artifacts. AI/chat output is advisory only and must not be treated as architecture authority.

The source-of-truth hierarchy is:

1. `prisma/schema.prisma` for table existence, structure, relationships, migrations, and database constraints
2. `packages/contracts` for behavioral contracts, Zod schemas, manifest schemas, Gatekeeper contracts, screen contracts, and validation contracts
3. Module manifests for capabilities, permissions, API routes, events, dependencies, settings, and menu entries
4. Generated entity registry for metadata derived from Prisma and approved annotations, not structural authority
5. `docs/adr` for accepted decisions, rationale, tradeoffs, and consequences
6. `docs/blueprints` for planning direction and scope context only
7. Chat history for drafting and reasoning support only

When sources conflict, the lower rank number wins. If implementation reality contradicts an ADR, the ADR must be reviewed and updated instead of relying on hidden chat memory.

## Context

Previous projects drifted when blueprints, manual lists, evidence documents, and chat memory competed as source of truth. AKTI ERP needs enforceable repo artifacts before Phase 0 and Phase 1 work can proceed safely.

Blueprint v1.2 remains planning input only. It is not a build spec and must not be expanded into another broad blueprint before repo artifacts exist.

## Options considered

- Use chat history and blueprints as the practical source of truth.
- Use ADRs alone as the source of truth.
- Use a ranked hierarchy with Prisma, contracts, manifests, generated artifacts, ADRs, blueprints, and chat in explicit order.

## Chosen option

Use the ranked source-of-truth hierarchy from the doctrine and `AGENTS.md`.

## Consequences

- Architecture decisions require ADRs and supporting repo artifacts.
- Prisma and contracts override ADR prose when structural or behavioral details conflict.
- Manual source-of-truth lists must be replaced by generated or contract-backed artifacts where applicable.
- Chat memory cannot settle conflicts or introduce accepted architecture.
- Future blueprint work must not replace enforceable contracts, schemas, tests, and implementation.

## Affected modules

All AKTI ERP modules, contracts, data models, manifests, generated registries, ADRs, and implementation tickets.

## Owner

Usman Minhas / AKTI leadership as interim owner until formally delegated.

## Review date

2026-06-22 or before Phase 1 Build Specification, whichever comes first.
