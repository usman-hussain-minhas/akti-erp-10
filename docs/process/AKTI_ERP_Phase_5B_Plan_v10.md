# AKTI ERP Phase 5B Plan v10 — Systematic Pre-Ticket-Pack Control Document

> **Governing axioms**
>
> Implementation is not stale by itself. Tickets become stale.
> Each ticket must contain maximum concrete implementation within its approved scope.
>
> **Status:** Draft for Codex repo verification and human review.
> **Boundary:** This document prepares the Phase 5B ticket pack. It does not authorize runtime implementation.

## 0. Purpose

This v10 document preserves the v9 dependency graph, applies the verified repo-verification fixes, and keeps all matrices merged in one systematic document.

## 1. Final status

```text
READY_TO_CREATE_PHASE_5B_TICKET_PACK_JSON
```

This status means v10 is ready to be used as the source for later Phase 5B JSON ticket-pack generation:

```text
READY_TO_CREATE_PHASE_5B_TICKET_PACK_JSON
```

## 2. Six corrections applied

| # | Correction | v10 fix |
| --- | --- | --- |
| 1 | P5B-011d dependency fixed | P5B-011d now depends on P5B-007h and P5B-009a. |
| 2 | P5B-026g MCR fixed | Uses negative/proof test MCR pattern, not schema pattern. |
| 3 | P5B-023b MCR fixed | Uses API MCR pattern and explicit GET /platform/read-models/:key route. |
| 4 | P5B-007b renamed and clarified | Now Gatekeeper outcome schema alignment and decision persistence migration. |
| 5 | Workflow API added | Added P5B-018e Workflow service API baseline. |
| 6 | P5B-T2-GATE known gap documented | Tier 2 gate evidence must record event-envelope retrofit as open gap until P5B-017e/f close it. |

## 3. Count summary

| Tier | Ticket count |
| --- | --- |
| Tier 0 | 5 |
| Tier 1 | 19 |
| Tier 2 | 43 |
| Tier 3 | 36 |
| Tier 4 | 22 |
| Tier 5 | 12 |
| Total | 137 |

## 4. Graph validation

```text
direct_dependency_violations: 0
final_gate_missing_ancestors: 0
```

## 5. Ordered ticket queue

### Tier 0
```text
P5B-000 — Baseline controls, repo-state inventory, source authority map
P5B-000a — Implementation surface map and exact-file convention validation
P5B-000b — Ticket-pack schema/field/MCR/dependency readiness check
P5B-000c — Phase 5A input traceability matrix
P5B-000d — Phase 5B artifact directory and evidence convention
```

### Tier 1
```text
P5B-001a — API response/error convention baseline
P5B-001b — Trusted tenant context hardening
P5B-002a — Platform version reader
P5B-002b — Platform compatibility check baseline
P5B-003a — Current-user/profile service
P5B-003b — Current-user/profile API
P5B-003c — Current-user/profile missing/invalid trusted-context tests
P5B-004a — platform.shell.access capability seed
P5B-004b — Access Core seed-boundary generalization for platform.shell.access
P5B-004c — Shell capability grant/visibility tests
P5B-005a — Tenant config schema/model baseline
P5B-005b — Tenant config service
P5B-005c — Tenant config API
P5B-005d — Tenant config tenant-isolation tests
P5B-006a — Branding asset resolver
P5B-006b — Domain/sender identity verification boundary
P5B-006c — Configurable label resolver
P5B-006d — Branding/label invariant tests
P5B-T1-GATE — Tier 1 gate — baseline and core prerequisite closure
```

### Tier 2
```text
P5B-007a — Gatekeeper contract outcome alignment
P5B-007b — Gatekeeper outcome schema alignment and decision persistence migration
P5B-007c — Gatekeeper runtime outcome normalization
P5B-007d — Gatekeeper preflight API
P5B-007e — Gatekeeper DENY / APPROVAL_REQUIRED / STOP_FOR_REVIEW outcome tests
P5B-007f — Gatekeeper migration/rollback risk output contract
P5B-007g — Gatekeeper audit recording
P5B-007h — Gatekeeper pre-envelope evidence intent recording
P5B-008a — Gatekeeper checklist rule engine — capability checks
P5B-008b — Gatekeeper checklist rule engine — tenant-context checks
P5B-008c — Gatekeeper checklist rule engine — migration safety checks
P5B-008d — Gatekeeper checklist rule engine — rollback evidence checks
P5B-008e — Gatekeeper evidence/audit recording integration
P5B-008f — STOP_FOR_REVIEW immutability enforcement
P5B-008g — STOP_FOR_REVIEW immutability tests
P5B-009a — Foundry module scaffold
P5B-009b — Foundry manifest validation service
P5B-009c — Foundry manifest negative tests
P5B-010a — Module registry schema/model baseline
P5B-010b — Replace Phase 2 module-registry allowlist
P5B-010c — Module registry persistence service
P5B-010d — Module compatibility checks
P5B-011a — Foundry lifecycle state machine
P5B-011b — Foundry lifecycle invalid-transition tests
P5B-011c — Module lifecycle registry status API
P5B-011d — Foundry evidence package builder baseline
P5B-012a — Foundry install preflight flow
P5B-012b — Foundry install execution
P5B-012c — Foundry install evidence receipt
P5B-013a — Foundry enable flow
P5B-013b — Foundry disable flow
P5B-013c — Foundry uninstall flow
P5B-014a — Foundry update flow
P5B-014b — Foundry rollback/recovery flow
P5B-015a — Capability contribution registration
P5B-015b — Menu registration
P5B-015c — Screen registration
P5B-015d — Command registration
P5B-015e — Settings registration
P5B-015f — Health/degraded state registration
P5B-016a — Module registry frontend API — late Tier 2
P5B-016b — Module registry frontend-safe response tests
P5B-T2-GATE — Tier 2 gate — Gatekeeper and Foundry branch closure
```

### Tier 3
```text
P5B-017a — Event envelope contract/validator
P5B-017b — EventOutbox schema/envelope migration
P5B-017c — Event envelope Outbox alignment tests
P5B-017d — Compliance-class event context tests
P5B-017e — Gatekeeper event-envelope retrofit
P5B-017f — Foundry lifecycle event-envelope retrofit
P5B-017g — Gatekeeper/Foundry compliance-class event regression tests
P5B-018a — Workflow process-definition validation
P5B-018b — Workflow persistence/model baseline
P5B-018c — Workflow approval-flow execution proof
P5B-018d — Workflow audit/event proof
P5B-018e — Workflow service API baseline
P5B-019a — PostgreSQL FTS search schema/index baseline
P5B-019b — Search service/API
P5B-019c — Search tenant isolation and p95 fixture proof
P5B-020a — File/document metadata model
P5B-020b — File/document storage adapter boundary
P5B-020c — File/document access service/API
P5B-020d — File/document tenant negative tests
P5B-021a — Communication intent declaration service
P5B-021b — Communication vs Engagement Gateway boundary alignment
P5B-021c — Communication local/stub delivery proof
P5B-021d — Communication audit/consent/risk tests
P5B-022a — Scheduler declaration validation
P5B-022b — Scheduler dependency/runtime boundary
P5B-022c — Scheduler safety/dead-letter baseline
P5B-023a — Reporting/read-model event consumer
P5B-023b — Reporting/read-model query API
P5B-023c — Reporting tenant isolation tests
P5B-024a — Import service baseline
P5B-024b — Export service baseline
P5B-024c — Import/export audit and safety tests
P5B-025a — AI proxy declaration boundary
P5B-025b — AI proxy stub/cost/audit proof
P5B-025c — AI proxy no-real-provider negative tests
P5B-T3-GATE — Tier 3 gate — core platform service closure
```

### Tier 4
```text
P5B-026a — ADR-0015 tenant isolation implementation audit
P5B-026b — DB RLS readiness target checks
P5B-026c — Cross-tenant negative tests — Tier 1 surfaces
P5B-026d — Cross-tenant negative tests — Foundry/Gatekeeper surfaces
P5B-026e — Cross-tenant negative tests — workflow/search surfaces
P5B-026f — Cross-tenant negative tests — file/document surfaces
P5B-026g — Cross-tenant negative tests — reporting/read-model/import-export surfaces
P5B-026h — Cross-tenant negative tests — communication/scheduler surfaces
P5B-026i — Cross-tenant negative tests — AI proxy surface
P5B-027a — Migration/schema contribution validator
P5B-027b — Destructive migration STOP_FOR_REVIEW tests
P5B-028a — Capability namespace enforcement
P5B-028b — Capability collision tests
P5B-029a — Structured logging and correlation context
P5B-029b — Redaction/no-secret logging tests
P5B-030a — Audit completeness checks for Gatekeeper actions
P5B-030b — Audit completeness checks for Foundry lifecycle
P5B-031a — Health aggregation endpoint
P5B-031b — SLO telemetry baseline
P5B-032a — Search/query performance fixture
P5B-032b — Load simulation baseline
P5B-T4-GATE — Tier 4 gate — security tenant observability performance closure
```

### Tier 5
```text
P5B-033a — Module manifest validation CI gate
P5B-033b — Foundry lifecycle CI test wiring
P5B-033c — Gatekeeper negative test CI wiring
P5B-034a — Evidence package validation gate
P5B-034b — Evidence package checksum/manifest proof
P5B-035a — Internal minimal fixture manifest
P5B-035b — Internal fixture Foundry lifecycle harness
P5B-035c — Internal fixture no-business-module verification
P5B-036a — Phase 5C readiness handoff
P5B-036b — Known deferrals and exclusion verification
P5B-T5-GATE — Tier 5 gate — operational CI evidence handoff closure
P5B-GATE — Phase 5B final audit package and merge-readiness gate
```


## 6. Dependency adjacency list

| Ticket | Direct dependencies |
| --- | --- |
| P5B-000 | [] |
| P5B-000a | P5B-000 |
| P5B-000b | P5B-000a |
| P5B-000c | P5B-000 |
| P5B-000d | P5B-000 |
| P5B-001a | P5B-000a |
| P5B-001b | P5B-001a |
| P5B-002a | P5B-000a |
| P5B-002b | P5B-002a |
| P5B-003a | P5B-001b |
| P5B-003b | P5B-003a, P5B-001a |
| P5B-003c | P5B-003b |
| P5B-004a | P5B-000a |
| P5B-004b | P5B-004a |
| P5B-004c | P5B-004b, P5B-003b |
| P5B-005a | P5B-001b |
| P5B-005b | P5B-005a |
| P5B-005c | P5B-005b, P5B-001a |
| P5B-005d | P5B-005c |
| P5B-006a | P5B-005b |
| P5B-006b | P5B-005b |
| P5B-006c | P5B-005b |
| P5B-006d | P5B-006a, P5B-006c |
| P5B-T1-GATE | P5B-000, P5B-000a, P5B-000b, P5B-000c, P5B-000d, P5B-001a, P5B-001b, P5B-002a, P5B-002b, P5B-003a, P5B-003b, P5B-003c, P5B-004a, P5B-004b, P5B-004c, P5B-005a, P5B-005b, P5B-005c, P5B-005d, P5B-006a, P5B-006b, P5B-006c, P5B-006d |
| P5B-007a | P5B-T1-GATE |
| P5B-007b | P5B-007a |
| P5B-007c | P5B-007b |
| P5B-007d | P5B-007c, P5B-001a |
| P5B-007e | P5B-007d |
| P5B-007f | P5B-007d |
| P5B-007g | P5B-007d |
| P5B-007h | P5B-007g |
| P5B-008a | P5B-007c, P5B-003b |
| P5B-008b | P5B-007c, P5B-001b |
| P5B-008c | P5B-007f |
| P5B-008d | P5B-007f, P5B-007h |
| P5B-008e | P5B-007g, P5B-007h |
| P5B-008f | P5B-007f, P5B-008c, P5B-008d |
| P5B-008g | P5B-008f |
| P5B-009a | P5B-T1-GATE |
| P5B-009b | P5B-009a |
| P5B-009c | P5B-009b |
| P5B-010a | P5B-009a |
| P5B-010b | P5B-010a |
| P5B-010c | P5B-010b |
| P5B-010d | P5B-010c, P5B-002b |
| P5B-011a | P5B-010c |
| P5B-011b | P5B-011a |
| P5B-011c | P5B-011a, P5B-010c |
| P5B-011d | P5B-007h, P5B-009a |
| P5B-012a | P5B-008a, P5B-008b, P5B-008c, P5B-008d, P5B-009b, P5B-011a |
| P5B-012b | P5B-012a |
| P5B-012c | P5B-012b, P5B-011d |
| P5B-013a | P5B-011a, P5B-012a, P5B-011d |
| P5B-013b | P5B-011a, P5B-012a, P5B-011d |
| P5B-013c | P5B-013b |
| P5B-014a | P5B-011a, P5B-012a, P5B-010d, P5B-011d |
| P5B-014b | P5B-011a, P5B-012a, P5B-011d |
| P5B-015a | P5B-009b, P5B-010c, P5B-004b |
| P5B-015b | P5B-009b, P5B-010c |
| P5B-015c | P5B-009b, P5B-010c |
| P5B-015d | P5B-009b, P5B-010c |
| P5B-015e | P5B-009b, P5B-005b |
| P5B-015f | P5B-009b, P5B-011a |
| P5B-016a | P5B-010c, P5B-011c |
| P5B-016b | P5B-016a |
| P5B-T2-GATE | P5B-T1-GATE, P5B-007a, P5B-007b, P5B-007c, P5B-007d, P5B-007e, P5B-007f, P5B-007g, P5B-007h, P5B-008a, P5B-008b, P5B-008c, P5B-008d, P5B-008e, P5B-008f, P5B-008g, P5B-009a, P5B-009b, P5B-009c, P5B-010a, P5B-010b, P5B-010c, P5B-010d, P5B-011a, P5B-011b, P5B-011c, P5B-011d, P5B-012a, P5B-012b, P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b, P5B-015a, P5B-015b, P5B-015c, P5B-015d, P5B-015e, P5B-015f, P5B-016a, P5B-016b |
| P5B-017a | P5B-T1-GATE |
| P5B-017b | P5B-017a |
| P5B-017c | P5B-017b |
| P5B-017d | P5B-017c, P5B-007h |
| P5B-017e | P5B-017d, P5B-T2-GATE |
| P5B-017f | P5B-017d, P5B-T2-GATE |
| P5B-017g | P5B-017e, P5B-017f |
| P5B-018a | P5B-017a, P5B-007c |
| P5B-018b | P5B-018a |
| P5B-018c | P5B-018b, P5B-007c, P5B-003b |
| P5B-018d | P5B-018c, P5B-017c |
| P5B-018e | P5B-018c, P5B-018d, P5B-001a |
| P5B-019a | P5B-005a, P5B-001b |
| P5B-019b | P5B-019a, P5B-001a |
| P5B-019c | P5B-019b |
| P5B-020a | P5B-005a, P5B-001b |
| P5B-020b | P5B-020a |
| P5B-020c | P5B-020b, P5B-001a |
| P5B-020d | P5B-020c |
| P5B-021a | P5B-017a, P5B-005b |
| P5B-021b | P5B-021a |
| P5B-021c | P5B-021b, P5B-017c |
| P5B-021d | P5B-021c, P5B-007c |
| P5B-022a | P5B-017a |
| P5B-022b | P5B-022a |
| P5B-022c | P5B-022b, P5B-017c |
| P5B-023a | P5B-017c |
| P5B-023b | P5B-023a, P5B-001a |
| P5B-023c | P5B-023b |
| P5B-024a | P5B-017c, P5B-005b |
| P5B-024b | P5B-017c, P5B-005b |
| P5B-024c | P5B-024a, P5B-024b |
| P5B-025a | P5B-017a, P5B-007c |
| P5B-025b | P5B-025a |
| P5B-025c | P5B-025b |
| P5B-T3-GATE | P5B-T2-GATE, P5B-017a, P5B-017b, P5B-017c, P5B-017d, P5B-017e, P5B-017f, P5B-017g, P5B-018a, P5B-018b, P5B-018c, P5B-018d, P5B-018e, P5B-019a, P5B-019b, P5B-019c, P5B-020a, P5B-020b, P5B-020c, P5B-020d, P5B-021a, P5B-021b, P5B-021c, P5B-021d, P5B-022a, P5B-022b, P5B-022c, P5B-023a, P5B-023b, P5B-023c, P5B-024a, P5B-024b, P5B-024c, P5B-025a, P5B-025b, P5B-025c |
| P5B-026a | P5B-005d, P5B-010c, P5B-017c |
| P5B-026b | P5B-026a |
| P5B-026c | P5B-005d, P5B-006b |
| P5B-026d | P5B-016b, P5B-008g, P5B-014b |
| P5B-026e | P5B-018e, P5B-019c |
| P5B-026f | P5B-020d |
| P5B-026g | P5B-023c, P5B-024c |
| P5B-026h | P5B-021d, P5B-022c |
| P5B-026i | P5B-025c |
| P5B-027a | P5B-008c, P5B-009b |
| P5B-027b | P5B-027a, P5B-008g |
| P5B-028a | P5B-015a |
| P5B-028b | P5B-028a |
| P5B-029a | P5B-017c, P5B-006b |
| P5B-029b | P5B-029a |
| P5B-030a | P5B-007g, P5B-007h, P5B-017e |
| P5B-030b | P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b, P5B-017f |
| P5B-031a | P5B-015f, P5B-016a |
| P5B-031b | P5B-031a, P5B-029a |
| P5B-032a | P5B-019c |
| P5B-032b | P5B-032a, P5B-031b |
| P5B-T4-GATE | P5B-T3-GATE, P5B-026a, P5B-026b, P5B-026c, P5B-026d, P5B-026e, P5B-026f, P5B-026g, P5B-026h, P5B-026i, P5B-027a, P5B-027b, P5B-028a, P5B-028b, P5B-029a, P5B-029b, P5B-030a, P5B-030b, P5B-031a, P5B-031b, P5B-032a, P5B-032b |
| P5B-033a | P5B-009c |
| P5B-033b | P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b |
| P5B-033c | P5B-007e, P5B-008g, P5B-008f |
| P5B-034a | P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b, P5B-011d, P5B-017e, P5B-017f |
| P5B-034b | P5B-034a |
| P5B-035a | P5B-009b, P5B-015b, P5B-015c, P5B-015d, P5B-015e |
| P5B-035b | P5B-035a, P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b, P5B-016b, P5B-034a |
| P5B-035c | P5B-035b |
| P5B-036a | P5B-035c, P5B-032b, P5B-034b |
| P5B-036b | P5B-036a |
| P5B-T5-GATE | P5B-T4-GATE, P5B-033a, P5B-033b, P5B-033c, P5B-034a, P5B-034b, P5B-035a, P5B-035b, P5B-035c, P5B-036a, P5B-036b |
| P5B-GATE | P5B-T5-GATE |

## 7. Ticket Pack Preparation Matrix

| ticket_id | tier | title | dependencies | files_expected_to_change_seed | MCR_seed | validation_commands_seed | evidence_artifact_seed | stop_condition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P5B-000 | 0 | Baseline controls, repo-state inventory, source authority map | [] | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000/P5B-000-summary.md | Scoped behavior for Baseline controls, repo-state inventory, source authority map is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000/P5B-000-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-000a | 0 | Implementation surface map and exact-file convention validation | P5B-000 | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000a/P5B-000a-summary.md | Scoped behavior for Implementation surface map and exact-file convention validation is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000a/P5B-000a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-000b | 0 | Ticket-pack schema/field/MCR/dependency readiness check | P5B-000a | prisma/schema.prisma | Exact model/table decision for Ticket-pack schema/field/MCR/dependency readiness check is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000b/P5B-000b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-000c | 0 | Phase 5A input traceability matrix | P5B-000 | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000c/P5B-000c-summary.md | Scoped behavior for Phase 5A input traceability matrix is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000c/P5B-000c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-000d | 0 | Phase 5B artifact directory and evidence convention | P5B-000 | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000d/P5B-000d-summary.md | Scoped behavior for Phase 5B artifact directory and evidence convention is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-000d/P5B-000d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-001a | 1 | API response/error convention baseline | P5B-000a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-001a/P5B-001a-summary.md | API behavior for API response/error convention baseline defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-001a/P5B-001a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-001b | 1 | Trusted tenant context hardening | P5B-001a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-001b/P5B-001b-summary.md | Scoped behavior for Trusted tenant context hardening is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-001b/P5B-001b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-002a | 1 | Platform version reader | P5B-000a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-002a/P5B-002a-summary.md | Scoped behavior for Platform version reader is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-002a/P5B-002a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-002b | 1 | Platform compatibility check baseline | P5B-002a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-002b/P5B-002b-summary.md | Scoped behavior for Platform compatibility check baseline is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-002b/P5B-002b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-003a | 1 | Current-user/profile service | P5B-001b | apps/api/src/security/current-user.service.ts; apps/api/src/security/current-user.service.test.ts; apps/api/src/security/request-context.ts | Scoped behavior for Current-user/profile service is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-003a/P5B-003a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-003b | 1 | Current-user/profile API | P5B-003a, P5B-001a | apps/api/src/security/current-user.controller.ts; apps/api/src/security/current-user.controller.test.ts; apps/api/src/app.module.ts | API behavior for Current-user/profile API defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-003b/P5B-003b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-003c | 1 | Current-user/profile missing/invalid trusted-context tests | P5B-003b | apps/api/src/security/current-user.service.test.ts; apps/api/src/security/current-user.controller.test.ts | Negative/proof tests for Current-user/profile missing/invalid trusted-context tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-003c/P5B-003c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-004a | 1 | platform.shell.access capability seed | P5B-000a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004a/P5B-004a-summary.md | Scoped behavior for platform.shell.access capability seed is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004a/P5B-004a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-004b | 1 | Access Core seed-boundary generalization for platform.shell.access | P5B-004a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004b/P5B-004b-summary.md | Scoped behavior for Access Core seed-boundary generalization for platform.shell.access is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004b/P5B-004b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-004c | 1 | Shell capability grant/visibility tests | P5B-004b, P5B-003b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004c/P5B-004c-summary.md | Negative/proof tests for Shell capability grant/visibility tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-004c/P5B-004c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-005a | 1 | Tenant config schema/model baseline | P5B-001b | apps/api/src/configuration/configuration.service.ts; apps/api/src/configuration/configuration.p5b-005a.test.ts | Exact model/table decision for Tenant config schema/model baseline is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-005a/P5B-005a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-005b | 1 | Tenant config service | P5B-005a | apps/api/src/configuration/configuration.service.ts; apps/api/src/configuration/configuration.p5b-005b.test.ts | Scoped behavior for Tenant config service is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-005b/P5B-005b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-005c | 1 | Tenant config API | P5B-005b, P5B-001a | apps/api/src/configuration/configuration.service.ts; apps/api/src/configuration/configuration.p5b-005c.test.ts | API behavior for Tenant config API defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-005c/P5B-005c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-005d | 1 | Tenant config tenant-isolation tests | P5B-005c | apps/api/src/configuration/configuration.service.ts; apps/api/src/configuration/configuration.p5b-005d.test.ts | Negative/proof tests for Tenant config tenant-isolation tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-005d/P5B-005d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-006a | 1 | Branding asset resolver | P5B-005b | apps/api/src/configuration/configuration.service.ts; apps/api/src/configuration/configuration.p5b-006a.test.ts | Scoped behavior for Branding asset resolver is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-006a/P5B-006a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-006b | 1 | Domain/sender identity verification boundary | P5B-005b | apps/api/src/configuration/configuration.service.ts; apps/api/src/configuration/configuration.p5b-006b.test.ts | Scoped behavior for Domain/sender identity verification boundary is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-006b/P5B-006b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-006c | 1 | Configurable label resolver | P5B-005b | apps/api/src/configuration/configuration.service.ts; apps/api/src/configuration/configuration.p5b-006c.test.ts | Scoped behavior for Configurable label resolver is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-006c/P5B-006c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-006d | 1 | Branding/label invariant tests | P5B-006a, P5B-006c | apps/api/src/configuration/configuration.service.ts; apps/api/src/configuration/configuration.p5b-006d.test.ts | Negative/proof tests for Branding/label invariant tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-006d/P5B-006d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-T1-GATE | 1 | Tier 1 gate — baseline and core prerequisite closure | P5B-000, P5B-000a, P5B-000b, P5B-000c, P5B-000d, P5B-001a, P5B-001b, P5B-002a, P5B-002b, P5B-003a, P5B-003b, P5B-003c, P5B-004a, P5B-004b, P5B-004c, P5B-005a, P5B-005b, P5B-005c, P5B-005d, P5B-006a, P5B-006b, P5B-006c, P5B-006d | codex-review/phase5b-gatekeeper-foundry/tier-gates/P5B-T1-GATE-evidence.md | `P5B-T1-GATE-evidence.md` lists dependency MCRs, commands, evidence, known gaps, and pass/fail status. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-T1-GATE/P5B-T1-GATE-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-007a | 2 | Gatekeeper contract outcome alignment | P5B-T1-GATE | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; packages/contracts/gatekeeper-contract.ts; apps/api/src/gatekeeper/gatekeeper.p5b-007a.test.ts | Scoped behavior for Gatekeeper contract outcome alignment is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-007a/P5B-007a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-007b | 2 | Gatekeeper outcome schema alignment and decision persistence migration | P5B-007a | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-007b.test.ts | Gatekeeper outcome schema alignment and decision persistence migration is verified against contract/service/schema source, existing Gatekeeper tests pass, and persistence is added only if repo verification proves it is missing. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-007b/P5B-007b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-007c | 2 | Gatekeeper runtime outcome normalization | P5B-007b | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-007c.test.ts | Scoped behavior for Gatekeeper runtime outcome normalization is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-007c/P5B-007c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-007d | 2 | Gatekeeper preflight API | P5B-007c, P5B-001a | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-007d.test.ts | API behavior for Gatekeeper preflight API defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-007d/P5B-007d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-007e | 2 | Gatekeeper DENY / APPROVAL_REQUIRED / STOP_FOR_REVIEW outcome tests | P5B-007d | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-007e.test.ts | Negative/proof tests for Gatekeeper DENY / APPROVAL_REQUIRED / STOP_FOR_REVIEW outcome tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-007e/P5B-007e-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-007f | 2 | Gatekeeper migration/rollback risk output contract | P5B-007d | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-007f.test.ts | Exact model/table decision for Gatekeeper migration/rollback risk output contract is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-007f/P5B-007f-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-007g | 2 | Gatekeeper audit recording | P5B-007d | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-007g.test.ts | Scoped behavior for Gatekeeper audit recording is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-007g/P5B-007g-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-007h | 2 | Gatekeeper pre-envelope evidence intent recording | P5B-007g | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-007h.test.ts | Scoped behavior for Gatekeeper pre-envelope evidence intent recording is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-007h/P5B-007h-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-008a | 2 | Gatekeeper checklist rule engine — capability checks | P5B-007c, P5B-003b | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-008a.test.ts | Scoped behavior for Gatekeeper checklist rule engine — capability checks is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-008a/P5B-008a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-008b | 2 | Gatekeeper checklist rule engine — tenant-context checks | P5B-007c, P5B-001b | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-008b.test.ts | Scoped behavior for Gatekeeper checklist rule engine — tenant-context checks is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-008b/P5B-008b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-008c | 2 | Gatekeeper checklist rule engine — migration safety checks | P5B-007f | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-008c.test.ts | Exact model/table decision for Gatekeeper checklist rule engine — migration safety checks is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-008c/P5B-008c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-008d | 2 | Gatekeeper checklist rule engine — rollback evidence checks | P5B-007f, P5B-007h | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-008d.test.ts | Scoped behavior for Gatekeeper checklist rule engine — rollback evidence checks is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-008d/P5B-008d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-008e | 2 | Gatekeeper evidence/audit recording integration | P5B-007g, P5B-007h | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-008e.test.ts | Scoped behavior for Gatekeeper evidence/audit recording integration is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-008e/P5B-008e-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-008f | 2 | STOP_FOR_REVIEW immutability enforcement | P5B-007f, P5B-008c, P5B-008d | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-008f.test.ts | Scoped behavior for STOP_FOR_REVIEW immutability enforcement is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-008f/P5B-008f-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-008g | 2 | STOP_FOR_REVIEW immutability tests | P5B-008f | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-008g.test.ts | Negative/proof tests for STOP_FOR_REVIEW immutability tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-008g/P5B-008g-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-009a | 2 | Foundry module scaffold | P5B-T1-GATE | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-009a.test.ts | Scoped behavior for Foundry module scaffold is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-009a/P5B-009a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-009b | 2 | Foundry manifest validation service | P5B-009a | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-009b.test.ts | Scoped behavior for Foundry manifest validation service is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-009b/P5B-009b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-009c | 2 | Foundry manifest negative tests | P5B-009b | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-009c.test.ts | Negative/proof tests for Foundry manifest negative tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-009c/P5B-009c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-010a | 2 | Module registry schema/model baseline | P5B-009a | apps/api/src/module-registry/module-registry.service.ts; apps/api/src/module-registry/module-registry.p5b-010a.test.ts | Exact model/table decision for Module registry schema/model baseline is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-010a/P5B-010a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-010b | 2 | Replace Phase 2 module-registry allowlist | P5B-010a | apps/api/src/module-registry/module-registry.service.ts; apps/api/src/module-registry/module-registry.p5b-010b.test.ts | Scoped behavior for Replace Phase 2 module-registry allowlist is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-010b/P5B-010b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-010c | 2 | Module registry persistence service | P5B-010b | apps/api/src/module-registry/module-registry.service.ts; apps/api/src/module-registry/module-registry.p5b-010c.test.ts | Exact model/table decision for Module registry persistence service is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-010c/P5B-010c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-010d | 2 | Module compatibility checks | P5B-010c, P5B-002b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-010d/P5B-010d-summary.md | Scoped behavior for Module compatibility checks is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-010d/P5B-010d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-011a | 2 | Foundry lifecycle state machine | P5B-010c | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-011a.test.ts | Scoped behavior for Foundry lifecycle state machine is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011a/P5B-011a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-011b | 2 | Foundry lifecycle invalid-transition tests | P5B-011a | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-011b.test.ts | Negative/proof tests for Foundry lifecycle invalid-transition tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011b/P5B-011b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-011c | 2 | Module lifecycle registry status API | P5B-011a, P5B-010c | apps/api/src/module-registry/module-registry.service.ts; apps/api/src/module-registry/module-registry.p5b-011c.test.ts | API behavior for Module lifecycle registry status API defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011c/P5B-011c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-011d | 2 | Foundry evidence package builder baseline | P5B-007h, P5B-009a | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-011d.test.ts | Scoped behavior for Foundry evidence package builder baseline is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-011d/P5B-011d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-012a | 2 | Foundry install preflight flow | P5B-008a, P5B-008b, P5B-008c, P5B-008d, P5B-009b, P5B-011a | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-012a.test.ts | API behavior for Foundry install preflight flow defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012a/P5B-012a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-012b | 2 | Foundry install execution | P5B-012a | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-012b.test.ts | Scoped behavior for Foundry install execution is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012b/P5B-012b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-012c | 2 | Foundry install evidence receipt | P5B-012b, P5B-011d | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-012c.test.ts | Scoped behavior for Foundry install evidence receipt is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-012c/P5B-012c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-013a | 2 | Foundry enable flow | P5B-011a, P5B-012a, P5B-011d | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-013a.test.ts | Scoped behavior for Foundry enable flow is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013a/P5B-013a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-013b | 2 | Foundry disable flow | P5B-011a, P5B-012a, P5B-011d | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-013b.test.ts | Scoped behavior for Foundry disable flow is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013b/P5B-013b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-013c | 2 | Foundry uninstall flow | P5B-013b | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-013c.test.ts | Scoped behavior for Foundry uninstall flow is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-013c/P5B-013c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-014a | 2 | Foundry update flow | P5B-011a, P5B-012a, P5B-010d, P5B-011d | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-014a.test.ts | Scoped behavior for Foundry update flow is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-014a/P5B-014a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-014b | 2 | Foundry rollback/recovery flow | P5B-011a, P5B-012a, P5B-011d | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-014b.test.ts | Scoped behavior for Foundry rollback/recovery flow is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-014b/P5B-014b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-015a | 2 | Capability contribution registration | P5B-009b, P5B-010c, P5B-004b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015a/P5B-015a-summary.md | Scoped behavior for Capability contribution registration is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015a/P5B-015a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-015b | 2 | Menu registration | P5B-009b, P5B-010c | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015b/P5B-015b-summary.md | Scoped behavior for Menu registration is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015b/P5B-015b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-015c | 2 | Screen registration | P5B-009b, P5B-010c | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015c/P5B-015c-summary.md | Scoped behavior for Screen registration is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015c/P5B-015c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-015d | 2 | Command registration | P5B-009b, P5B-010c | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015d/P5B-015d-summary.md | Scoped behavior for Command registration is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015d/P5B-015d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-015e | 2 | Settings registration | P5B-009b, P5B-005b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015e/P5B-015e-summary.md | Scoped behavior for Settings registration is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015e/P5B-015e-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-015f | 2 | Health/degraded state registration | P5B-009b, P5B-011a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015f/P5B-015f-summary.md | Scoped behavior for Health/degraded state registration is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-015f/P5B-015f-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-016a | 2 | Module registry frontend API — late Tier 2 | P5B-010c, P5B-011c | apps/api/src/module-registry/module-registry.service.ts; apps/api/src/module-registry/module-registry.p5b-016a.test.ts | API behavior for Module registry frontend API — late Tier 2 defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-016a/P5B-016a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-016b | 2 | Module registry frontend-safe response tests | P5B-016a | apps/api/src/module-registry/module-registry.service.ts; apps/api/src/module-registry/module-registry.p5b-016b.test.ts | Negative/proof tests for Module registry frontend-safe response tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-016b/P5B-016b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-T2-GATE | 2 | Tier 2 gate — Gatekeeper and Foundry branch closure | P5B-T1-GATE, P5B-007a, P5B-007b, P5B-007c, P5B-007d, P5B-007e, P5B-007f, P5B-007g, P5B-007h, P5B-008a, P5B-008b, P5B-008c, P5B-008d, P5B-008e, P5B-008f, P5B-008g, P5B-009a, P5B-009b, P5B-009c, P5B-010a, P5B-010b, P5B-010c, P5B-010d, P5B-011a, P5B-011b, P5B-011c, P5B-011d, P5B-012a, P5B-012b, P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b, P5B-015a, P5B-015b, P5B-015c, P5B-015d, P5B-015e, P5B-015f, P5B-016a, P5B-016b | codex-review/phase5b-gatekeeper-foundry/tier-gates/P5B-T2-GATE-evidence.md | `P5B-T2-GATE-evidence.md` lists dependency MCRs, commands, evidence, known gaps, and pass/fail status. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-T2-GATE/P5B-T2-GATE-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-017a | 3 | Event envelope contract/validator | P5B-T1-GATE | apps/api/src/platform-observability/event-outbox.service.ts; apps/api/src/platform-observability/audit-log.service.ts | Scoped behavior for Event envelope contract/validator is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017a/P5B-017a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-017b | 3 | EventOutbox schema/envelope migration | P5B-017a | apps/api/src/platform-observability/event-outbox.service.ts; apps/api/src/platform-observability/audit-log.service.ts | Exact model/table decision for EventOutbox schema/envelope migration is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017b/P5B-017b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-017c | 3 | Event envelope Outbox alignment tests | P5B-017b | apps/api/src/platform-observability/event-outbox.service.ts; apps/api/src/platform-observability/audit-log.service.ts | Negative/proof tests for Event envelope Outbox alignment tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017c/P5B-017c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-017d | 3 | Compliance-class event context tests | P5B-017c, P5B-007h | apps/api/src/platform-observability/event-outbox.service.ts; apps/api/src/platform-observability/audit-log.service.ts | Negative/proof tests for Compliance-class event context tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017d/P5B-017d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-017e | 3 | Gatekeeper event-envelope retrofit | P5B-017d, P5B-T2-GATE | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-017e.test.ts | Scoped behavior for Gatekeeper event-envelope retrofit is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017e/P5B-017e-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-017f | 3 | Foundry lifecycle event-envelope retrofit | P5B-017d, P5B-T2-GATE | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-017f.test.ts | Scoped behavior for Foundry lifecycle event-envelope retrofit is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017f/P5B-017f-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-017g | 3 | Gatekeeper/Foundry compliance-class event regression tests | P5B-017e, P5B-017f | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-017g.test.ts | Negative/proof tests for Gatekeeper/Foundry compliance-class event regression tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-017g/P5B-017g-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-018a | 3 | Workflow process-definition validation | P5B-017a, P5B-007c | apps/api/src/workflow/workflow.service.ts; apps/api/src/workflow/workflow.p5b-018a.test.ts | Scoped behavior for Workflow process-definition validation is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-018a/P5B-018a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-018b | 3 | Workflow persistence/model baseline | P5B-018a | apps/api/src/workflow/workflow.service.ts; apps/api/src/workflow/workflow.p5b-018b.test.ts | Exact model/table decision for Workflow persistence/model baseline is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-018b/P5B-018b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-018c | 3 | Workflow approval-flow execution proof | P5B-018b, P5B-007c, P5B-003b | apps/api/src/workflow/workflow.service.ts; apps/api/src/workflow/workflow.p5b-018c.test.ts | Negative/proof tests for Workflow approval-flow execution proof pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-018c/P5B-018c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-018d | 3 | Workflow audit/event proof | P5B-018c, P5B-017c | apps/api/src/workflow/workflow.service.ts; apps/api/src/workflow/workflow.p5b-018d.test.ts | Negative/proof tests for Workflow audit/event proof pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-018d/P5B-018d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-018e | 3 | Workflow service API baseline | P5B-018c, P5B-018d, P5B-001a | apps/api/src/workflow/workflow.service.ts; apps/api/src/workflow/workflow.p5b-018e.test.ts | API behavior for Workflow service API baseline defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-018e/P5B-018e-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-019a | 3 | PostgreSQL FTS search schema/index baseline | P5B-005a, P5B-001b | apps/api/src/search/search.service.ts; apps/api/src/search/search.p5b-019a.test.ts | Exact model/table decision for PostgreSQL FTS search schema/index baseline is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-019a/P5B-019a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-019b | 3 | Search service/API | P5B-019a, P5B-001a | apps/api/src/search/search.service.ts; apps/api/src/search/search.p5b-019b.test.ts | API behavior for Search service/API defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-019b/P5B-019b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-019c | 3 | Search tenant isolation and p95 fixture proof | P5B-019b | apps/api/src/search/search.service.ts; apps/api/src/search/search.p5b-019c.test.ts | Negative/proof tests for Search tenant isolation and p95 fixture proof pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-019c/P5B-019c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-020a | 3 | File/document metadata model | P5B-005a, P5B-001b | apps/api/src/file-service/file-service.service.ts; apps/api/src/file-service/file-service.p5b-020a.test.ts | Exact model/table decision for File/document metadata model is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-020a/P5B-020a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-020b | 3 | File/document storage adapter boundary | P5B-020a | apps/api/src/file-service/file-service.service.ts; apps/api/src/file-service/file-service.p5b-020b.test.ts | Scoped behavior for File/document storage adapter boundary is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-020b/P5B-020b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-020c | 3 | File/document access service/API | P5B-020b, P5B-001a | apps/api/src/file-service/file-service.service.ts; apps/api/src/file-service/file-service.p5b-020c.test.ts | API behavior for File/document access service/API defines method, route, request/response, capability, tenant context, Gatekeeper/audit behavior and passes positive/negative tests. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-020c/P5B-020c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-020d | 3 | File/document tenant negative tests | P5B-020c | apps/api/src/file-service/file-service.service.ts; apps/api/src/file-service/file-service.p5b-020d.test.ts | Negative/proof tests for File/document tenant negative tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-020d/P5B-020d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-021a | 3 | Communication intent declaration service | P5B-017a, P5B-005b | apps/api/src/communication/communication.service.ts; apps/api/src/communication/communication.p5b-021a.test.ts | Scoped behavior for Communication intent declaration service is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-021a/P5B-021a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-021b | 3 | Communication vs Engagement Gateway boundary alignment | P5B-021a | apps/api/src/communication/communication.service.ts; apps/api/src/communication/communication.p5b-021b.test.ts | Scoped behavior for Communication vs Engagement Gateway boundary alignment is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-021b/P5B-021b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-021c | 3 | Communication local/stub delivery proof | P5B-021b, P5B-017c | apps/api/src/communication/communication.service.ts; apps/api/src/communication/communication.p5b-021c.test.ts | Negative/proof tests for Communication local/stub delivery proof pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-021c/P5B-021c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-021d | 3 | Communication audit/consent/risk tests | P5B-021c, P5B-007c | apps/api/src/communication/communication.service.ts; apps/api/src/communication/communication.p5b-021d.test.ts | Negative/proof tests for Communication audit/consent/risk tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-021d/P5B-021d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-022a | 3 | Scheduler declaration validation | P5B-017a | apps/api/src/scheduler/scheduler.service.ts; apps/api/src/scheduler/scheduler.p5b-022a.test.ts | Scoped behavior for Scheduler declaration validation is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-022a/P5B-022a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-022b | 3 | Scheduler dependency/runtime boundary | P5B-022a | apps/api/src/scheduler/scheduler.service.ts; apps/api/src/scheduler/scheduler.p5b-022b.test.ts | Scoped behavior for Scheduler dependency/runtime boundary is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-022b/P5B-022b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-022c | 3 | Scheduler safety/dead-letter baseline | P5B-022b, P5B-017c | apps/api/src/scheduler/scheduler.service.ts; apps/api/src/scheduler/scheduler.p5b-022c.test.ts | Scoped behavior for Scheduler safety/dead-letter baseline is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-022c/P5B-022c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-023a | 3 | Reporting/read-model event consumer | P5B-017c | apps/api/src/reporting/reporting.service.ts; apps/api/src/reporting/reporting.p5b-023a.test.ts | Exact model/table decision for Reporting/read-model event consumer is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-023a/P5B-023a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-023b | 3 | Reporting/read-model query API | P5B-023a, P5B-001a | apps/api/src/reporting/reporting.service.ts; apps/api/src/reporting/reporting.p5b-023b.test.ts | API ticket defines method, route `GET /platform/read-models/:key`, request/response shape, capability, tenant context, Gatekeeper/audit behavior; positive and negative tests pass. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-023b/P5B-023b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-023c | 3 | Reporting tenant isolation tests | P5B-023b | apps/api/src/reporting/reporting.service.ts; apps/api/src/reporting/reporting.p5b-023c.test.ts | Negative/proof tests for Reporting tenant isolation tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-023c/P5B-023c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-024a | 3 | Import service baseline | P5B-017c, P5B-005b | apps/api/src/import-export/import-export.service.ts; apps/api/src/import-export/import-export.p5b-024a.test.ts | Scoped behavior for Import service baseline is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-024a/P5B-024a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-024b | 3 | Export service baseline | P5B-017c, P5B-005b | apps/api/src/import-export/import-export.service.ts; apps/api/src/import-export/import-export.p5b-024b.test.ts | Scoped behavior for Export service baseline is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-024b/P5B-024b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-024c | 3 | Import/export audit and safety tests | P5B-024a, P5B-024b | apps/api/src/import-export/import-export.service.ts; apps/api/src/import-export/import-export.p5b-024c.test.ts | Negative/proof tests for Import/export audit and safety tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-024c/P5B-024c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-025a | 3 | AI proxy declaration boundary | P5B-017a, P5B-007c | apps/api/src/ai-proxy/ai-proxy.service.ts; apps/api/src/ai-proxy/ai-proxy.p5b-025a.test.ts | Scoped behavior for AI proxy declaration boundary is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-025a/P5B-025a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-025b | 3 | AI proxy stub/cost/audit proof | P5B-025a | apps/api/src/ai-proxy/ai-proxy.service.ts; apps/api/src/ai-proxy/ai-proxy.p5b-025b.test.ts | Negative/proof tests for AI proxy stub/cost/audit proof pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-025b/P5B-025b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-025c | 3 | AI proxy no-real-provider negative tests | P5B-025b | apps/api/src/ai-proxy/ai-proxy.service.ts; apps/api/src/ai-proxy/ai-proxy.p5b-025c.test.ts | Negative/proof tests for AI proxy no-real-provider negative tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-025c/P5B-025c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-T3-GATE | 3 | Tier 3 gate — core platform service closure | P5B-T2-GATE, P5B-017a, P5B-017b, P5B-017c, P5B-017d, P5B-017e, P5B-017f, P5B-017g, P5B-018a, P5B-018b, P5B-018c, P5B-018d, P5B-018e, P5B-019a, P5B-019b, P5B-019c, P5B-020a, P5B-020b, P5B-020c, P5B-020d, P5B-021a, P5B-021b, P5B-021c, P5B-021d, P5B-022a, P5B-022b, P5B-022c, P5B-023a, P5B-023b, P5B-023c, P5B-024a, P5B-024b, P5B-024c, P5B-025a, P5B-025b, P5B-025c | codex-review/phase5b-gatekeeper-foundry/tier-gates/P5B-T3-GATE-evidence.md | `P5B-T3-GATE-evidence.md` lists dependency MCRs, commands, evidence, known gaps, and pass/fail status. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-T3-GATE/P5B-T3-GATE-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026a | 4 | ADR-0015 tenant isolation implementation audit | P5B-005d, P5B-010c, P5B-017c | apps/api/src/platform-observability/event-outbox.service.ts; apps/api/src/platform-observability/audit-log.service.ts | Scoped behavior for ADR-0015 tenant isolation implementation audit is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026a/P5B-026a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026b | 4 | DB RLS readiness target checks | P5B-026a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026b/P5B-026b-summary.md | Scoped behavior for DB RLS readiness target checks is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026b/P5B-026b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026c | 4 | Cross-tenant negative tests — Tier 1 surfaces | P5B-005d, P5B-006b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026c/P5B-026c-summary.md | Negative/proof tests for Cross-tenant negative tests — Tier 1 surfaces pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026c/P5B-026c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026d | 4 | Cross-tenant negative tests — Foundry/Gatekeeper surfaces | P5B-016b, P5B-008g, P5B-014b | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-026d.test.ts | Negative/proof tests for Cross-tenant negative tests — Foundry/Gatekeeper surfaces pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026d/P5B-026d-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026e | 4 | Cross-tenant negative tests — workflow/search surfaces | P5B-018e, P5B-019c | apps/api/src/workflow/workflow.service.ts; apps/api/src/workflow/workflow.p5b-026e.test.ts | Negative/proof tests for Cross-tenant negative tests — workflow/search surfaces pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026e/P5B-026e-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026f | 4 | Cross-tenant negative tests — file/document surfaces | P5B-020d | apps/api/src/file-service/file-service.service.ts; apps/api/src/file-service/file-service.p5b-026f.test.ts | Negative/proof tests for Cross-tenant negative tests — file/document surfaces pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026f/P5B-026f-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026g | 4 | Cross-tenant negative tests — reporting/read-model/import-export surfaces | P5B-023c, P5B-024c | apps/api/src/reporting/reporting.service.ts; apps/api/src/reporting/reporting.p5b-026g.test.ts | Negative/proof tests for cross-tenant reporting/read-model/import-export surfaces pass via repo-real validation and produce a ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026g/P5B-026g-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026h | 4 | Cross-tenant negative tests — communication/scheduler surfaces | P5B-021d, P5B-022c | apps/api/src/communication/communication.service.ts; apps/api/src/communication/communication.p5b-026h.test.ts | Negative/proof tests for Cross-tenant negative tests — communication/scheduler surfaces pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026h/P5B-026h-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-026i | 4 | Cross-tenant negative tests — AI proxy surface | P5B-025c | apps/api/src/ai-proxy/ai-proxy.service.ts; apps/api/src/ai-proxy/ai-proxy.p5b-026i.test.ts | Negative/proof tests for Cross-tenant negative tests — AI proxy surface pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-026i/P5B-026i-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-027a | 4 | Migration/schema contribution validator | P5B-008c, P5B-009b | prisma/schema.prisma | Exact model/table decision for Migration/schema contribution validator is verified against Prisma and Phase 5A source; Prisma validation passes if schema changes. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-027a/P5B-027a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-027b | 4 | Destructive migration STOP_FOR_REVIEW tests | P5B-027a, P5B-008g | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-027b.test.ts | Negative/proof tests for destructive migration STOP_FOR_REVIEW behavior pass, proving destructive migration attempts produce STOP_FOR_REVIEW and cannot be bypassed by module, tenant admin, or automation paths. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-027b/P5B-027b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-028a | 4 | Capability namespace enforcement | P5B-015a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-028a/P5B-028a-summary.md | Scoped behavior for Capability namespace enforcement is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-028a/P5B-028a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-028b | 4 | Capability collision tests | P5B-028a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-028b/P5B-028b-summary.md | Negative/proof tests for Capability collision tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-028b/P5B-028b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-029a | 4 | Structured logging and correlation context | P5B-017c, P5B-006b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-029a/P5B-029a-summary.md | Scoped behavior for Structured logging and correlation context is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-029a/P5B-029a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-029b | 4 | Redaction/no-secret logging tests | P5B-029a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-029b/P5B-029b-summary.md | Negative/proof tests for Redaction/no-secret logging tests pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-029b/P5B-029b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-030a | 4 | Audit completeness checks for Gatekeeper actions | P5B-007g, P5B-007h, P5B-017e | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-030a.test.ts | Scoped behavior for Audit completeness checks for Gatekeeper actions is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030a/P5B-030a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-030b | 4 | Audit completeness checks for Foundry lifecycle | P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b, P5B-017f | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-030b.test.ts | Scoped behavior for Audit completeness checks for Foundry lifecycle is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-030b/P5B-030b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-031a | 4 | Health aggregation endpoint | P5B-015f, P5B-016a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-031a/P5B-031a-summary.md | Scoped behavior for Health aggregation endpoint is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-031a/P5B-031a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-031b | 4 | SLO telemetry baseline | P5B-031a, P5B-029a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-031b/P5B-031b-summary.md | Scoped behavior for SLO telemetry baseline is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-031b/P5B-031b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-032a | 4 | Search/query performance fixture | P5B-019c | apps/api/src/search/search.service.ts; apps/api/src/search/search.p5b-032a.test.ts | Scoped behavior for Search/query performance fixture is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-032a/P5B-032a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-032b | 4 | Load simulation baseline | P5B-032a, P5B-031b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-032b/P5B-032b-summary.md | Scoped behavior for Load simulation baseline is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-032b/P5B-032b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-T4-GATE | 4 | Tier 4 gate — security tenant observability performance closure | P5B-T3-GATE, P5B-026a, P5B-026b, P5B-026c, P5B-026d, P5B-026e, P5B-026f, P5B-026g, P5B-026h, P5B-026i, P5B-027a, P5B-027b, P5B-028a, P5B-028b, P5B-029a, P5B-029b, P5B-030a, P5B-030b, P5B-031a, P5B-031b, P5B-032a, P5B-032b | codex-review/phase5b-gatekeeper-foundry/tier-gates/P5B-T4-GATE-evidence.md | `P5B-T4-GATE-evidence.md` lists dependency MCRs, commands, evidence, known gaps, and pass/fail status. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-T4-GATE/P5B-T4-GATE-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-033a | 5 | Module manifest validation CI gate | P5B-009c | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-033a/P5B-033a-summary.md | Scoped behavior for Module manifest validation CI gate is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-033a/P5B-033a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-033b | 5 | Foundry lifecycle CI test wiring | P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-033b.test.ts | Negative/proof tests for Foundry lifecycle CI test wiring pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-033b/P5B-033b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-033c | 5 | Gatekeeper negative test CI wiring | P5B-007e, P5B-008g, P5B-008f | apps/api/src/gatekeeper/gatekeeper-preflight.service.ts; apps/api/src/gatekeeper/gatekeeper.p5b-033c.test.ts | Negative/proof tests for Gatekeeper negative test CI wiring pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-033c/P5B-033c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-034a | 5 | Evidence package validation gate | P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b, P5B-011d, P5B-017e, P5B-017f | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-034a/P5B-034a-summary.md | Scoped behavior for Evidence package validation gate is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-034a/P5B-034a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-034b | 5 | Evidence package checksum/manifest proof | P5B-034a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-034b/P5B-034b-summary.md | Negative/proof tests for Evidence package checksum/manifest proof pass via repo-real validation and produce ticket validation summary. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-034b/P5B-034b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-035a | 5 | Internal minimal fixture manifest | P5B-009b, P5B-015b, P5B-015c, P5B-015d, P5B-015e | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-035a/P5B-035a-summary.md | Scoped behavior for Internal minimal fixture manifest is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-035a/P5B-035a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-035b | 5 | Internal fixture Foundry lifecycle harness | P5B-035a, P5B-012c, P5B-013a, P5B-013b, P5B-013c, P5B-014a, P5B-014b, P5B-016b, P5B-034a | apps/api/src/foundry/foundry.service.ts; apps/api/src/foundry/foundry.p5b-035b.test.ts | Scoped behavior for Internal fixture Foundry lifecycle harness is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-035b/P5B-035b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-035c | 5 | Internal fixture no-business-module verification | P5B-035b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-035c/P5B-035c-summary.md | Scoped behavior for Internal fixture no-business-module verification is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-035c/P5B-035c-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-036a | 5 | Phase 5C readiness handoff | P5B-035c, P5B-032b, P5B-034b | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-036a/P5B-036a-summary.md | Scoped behavior for Phase 5C readiness handoff is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-036a/P5B-036a-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-036b | 5 | Known deferrals and exclusion verification | P5B-036a | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-036b/P5B-036b-summary.md | Scoped behavior for Known deferrals and exclusion verification is implemented in exact files and passes repo-real validation. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-036b/P5B-036b-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-T5-GATE | 5 | Tier 5 gate — operational CI evidence handoff closure | P5B-T4-GATE, P5B-033a, P5B-033b, P5B-033c, P5B-034a, P5B-034b, P5B-035a, P5B-035b, P5B-035c, P5B-036a, P5B-036b | codex-review/phase5b-gatekeeper-foundry/tier-gates/P5B-T5-GATE-evidence.md | `P5B-T5-GATE-evidence.md` lists dependency MCRs, commands, evidence, known gaps, and pass/fail status. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-T5-GATE/P5B-T5-GATE-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |
| P5B-GATE | 5 | Phase 5B final audit package and merge-readiness gate | P5B-T5-GATE | apps/api/src/platform-observability/event-outbox.service.ts; apps/api/src/platform-observability/audit-log.service.ts | `P5B-GATE-evidence.md` lists dependency MCRs, commands, evidence, known gaps, and pass/fail status. | repo-real command required; Codex must verify exact command | codex-review/phase5b-gatekeeper-foundry/ticket-artifacts/P5B-GATE/P5B-GATE-validation-summary.md | Stop if exact files/schema/API/MCR cannot be verified from repo truth. |

## 8. API Surface Map

| ticket_id | method | route | request_shape | response_shape | required_capability | tenant_context_source | gatekeeper_requirement | audit_outbox_event | positive_tests | negative_tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P5B-003a | internal service only | none | CurrentUserService input | CurrentUserProfile object | trusted authenticated context | resolveTrustedRequestContext | No HTTP route; no duplicate /me route | none unless mutating | service test | invalid session context |
| P5B-003b | GET | /platform/access/me | none | { actor_id, display_name, organization_id, capabilities[] } | platform.shell.access or authenticated session | resolveTrustedRequestContext | No mutation Gatekeeper unless policy requires | none | valid session returns profile | 401 invalid/missing context |
| P5B-003c | test only | /platform/access/me | invalid/missing session fixtures | 401/403 expected responses | same as P5B-003b | resolveTrustedRequestContext | No mutation | none | N/A | invalid token, org mismatch, no raw token returned |
| P5B-018e | POST/GET | /platform/workflows and /platform/workflows/:id | WorkflowStartRequest / query params | WorkflowResponse | platform.workflow.manage/read | trusted context | Required for high-risk transitions | workflow.action.recorded | trigger/query workflow | invalid/cross-tenant workflow denied |
| P5B-023b | GET | /platform/read-models/:key | query params | { items, page } | platform.reporting.read | trusted context | risk check for high-classification data | read_model.query.executed if required | tenant-scoped facts | business report not created |

## 9. Schema Surface Decision Table

| ticket_id | model_or_table | existing_or_new | owner_service | tenant_scoped | organization_id_required | migration_required | migration_risk | RLS_target | indexes_required | audit_required | stop_condition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P5B-007b | GatekeeperDecisionRecord | new if current repo lacks durable decision persistence | Gatekeeper | Yes | Yes | Maybe | non-destructive | Required target | organization_id, request_id, actor_user_id, decision | Yes | Stop if persistence already exists or Phase 5A source forbids schema touch |
| P5B-005a | PlatformTenantConfig | new if OrganizationSetting/OrganizationDomain cannot satisfy exact fields | Configuration | Yes | Yes | Yes | non-destructive | Required target | organization_id, custom_domain/subdomain | Yes | Stop if Phase 5A source says reuse existing settings only |
| P5B-010a | ModuleRegistryEntry; ModuleLifecycleEvent | extend existing + possible new lifecycle event model | Module Registry / Foundry | Registry entry global; lifecycle event tenant-scoped if org-specific | organization_id required where tenant-scoped | Yes | non-destructive | Required target where tenant-scoped | module_key,status,version | Yes | Stop if model ownership conflicts |
| P5B-017b | EventOutbox | extend existing | Platform Observability | Yes | Yes | Yes | non-destructive | Required target | organization_id,event_type,status,correlation_id | Yes | Stop if envelope fields cannot be mapped |
| P5B-018b | WorkflowDefinition; WorkflowInstance; WorkflowStepInstance | new | Workflow | Yes | Yes | Yes | non-destructive | Required target | organization_id, workflow_key, version, status | Yes | Stop if not authorized by Phase 5A |
| P5B-019a | tsvector columns / GIN index on approved existing tables | extend existing | Search | Yes where target table is tenant-scoped | organization_id inherited where tenant-scoped | Yes | non-destructive | Required target where tenant-scoped | GIN index on tsvector; target-table tenant/capability filters | Maybe | Stop if target tables are not Phase 5A-approved or exact execution cannot stay tenant/capability scoped |
| P5B-020a | FileDocumentMetadata | new | File Service | Yes | Yes | Yes | non-destructive | Required target | organization_id, file_key/storage_key, owner_module, created_at | Yes | Stop if storage metadata ownership conflicts or secrets/storage provider work is required |
| P5B-023a | ReadModelEntry; ReadModelCursor | new | Reporting / Read Model | Yes | Yes | Yes | non-destructive | Required target | organization_id, read_model_key, source_event_id/cursor, updated_at | Yes | Stop if read-model ownership conflicts with event/outbox policy |
| P5B-023b | read-model query state if persistence is required | extend existing if needed | Reporting / Read Model | Yes where persisted | Yes where persisted | Maybe | non-destructive | Required target if persisted | organization_id, read_model_key, cursor/page token | Yes | Stop if query API can be implemented without new persistence |
| P5B-024a | ImportJob | new if persistence required | Import / Export | Yes | Yes | Maybe | non-destructive | Required target if persisted | organization_id, status, source_type, created_at | Yes | Stop if Phase 5B scope only permits stateless import validation |
| P5B-024b | ExportJob | new if persistence required | Import / Export | Yes | Yes | Maybe | non-destructive | Required target if persisted | organization_id, status, export_type, created_at | Yes | Stop if Phase 5B scope only permits stateless export validation |

Schema surface notes:

- These entries are planning guidance only.
- No Prisma/schema implementation occurs in this patch.
- Any schema work in Phase 5B must be exact-file scoped, validated, and ticket-approved.
- P5B-019a must remain non-destructive and tenant/capability scoped.
- P5B-020a, P5B-023a, P5B-024a, and P5B-024b must remain tenant-scoped.
- Stop if actual execution later finds target tables/models are not Phase 5A-approved.

## 10. Tier 2 Gate Event Envelope Known Gap

`P5B-T2-GATE` is allowed to close Gatekeeper and Foundry baseline runtime before full Phase 5A event-envelope compliance is retrofitted.

Its evidence artifact must explicitly state:

```text
known_open_gap: Gatekeeper and Foundry do not yet emit fully compliant Phase 5A event envelopes.
compliance-class event envelope retrofit is P5B-017e and P5B-017f in Tier 3.
P5B-T2-GATE is conditional on this gap being closed before P5B-T3-GATE closes.
```

## 11. Codex repo-verification checklist

Codex must verify before JSON ticket generation:

```text
1. Every source file exists on current main.
2. Every files_expected_to_change seed is an exact file path or approved new exact path.
3. No final JSON ticket contains `or` paths.
4. Schema model/table seeds match prisma/schema.prisma and Phase 5A source authority.
5. API route shapes, capabilities, tenant context, Gatekeeper behavior, and audit/outbox behavior are valid.
6. Validation commands are repo-real.
7. P5B-003a does not create the /platform/access/me route.
8. P5B-003b owns the /platform/access/me route.
9. P5B-026g uses negative-test MCR.
10. P5B-023b uses API MCR.
11. P5B-011d depends on P5B-009a.
12. P5B-T2-GATE records the event-envelope open gap.
```

## 12. Final recommendation

```text
PHASE_5B_PLAN_V10_READY_FOR_JSON_TICKET_PACK_GENERATION
```
