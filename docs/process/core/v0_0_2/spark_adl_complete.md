# Architecture Decision Log — Index

This directory contains all Architecture Decision Records for the Spark Platform.

**Usage by Genesis/Codex:**
- Read all ADL files as constraints before generating tickets for the affected level.
- ADL files are read-only planning authority. Do not implement directly from ADL files.
- If an ADL status is PROPOSED (unanswered), stop and surface for human decision before generating tickets for that level.
- Reference ADL decisions in ticket descriptions: "Implement per ADL-003".

**Status definitions:**
- ACCEPTED: Decision is locked. Implement as specified.
- PROPOSED: Decision is identified but not yet resolved. Block affected level until resolved.
- SUPERSEDED: Decision was changed. See the new ADL referenced in Supersedes field. Use the new ADL.

---

## Required Before Level 4 — Platform Services

| ADL | Title | Status |
|-----|-------|--------|
| ADL-001 | Cross-Module Transaction Boundary | ACCEPTED |
| ADL-002 | Event Versioning and Schema Registry | ACCEPTED |
| ADL-003 | Idempotency Key Generation Strategy | ACCEPTED |
| ADL-004 | Global Opt-Out Registry | ACCEPTED |

## Required Before Level 5 — Configuration Engine / Foundry

| ADL | Title | Status |
|-----|-------|--------|
| ADL-005 | Module Dependency Cycle Detection | ACCEPTED |
| ADL-006 | Module Uninstall Cleanup | ACCEPTED |
| ADL-007 | Module Upgrade Rollback | ACCEPTED |
| ADL-008 | Module Sandbox Environment | ACCEPTED |
| ADL-009 | Module Performance Contract | ACCEPTED |
| ADL-010 | Core Interface Versioning | ACCEPTED |
| ADL-011 | Configuration Reload Without Restart | ACCEPTED |

## Required Before Level 7 — CRM

| ADL | Title | Status |
|-----|-------|--------|
| ADL-021 | Lead Source Immutability | ACCEPTED |
| ADL-022 | Automated Lead Merge Rules | ACCEPTED |

## Required Before Level 8 — Finance

| ADL | Title | Status |
|-----|-------|--------|
| ADL-012 | Quote to Invoice Conversion | ACCEPTED |
| ADL-013 | Partial Invoice Payment Handling | ACCEPTED |
| ADL-014 | Refund to Original Payment Method | ACCEPTED |
| ADL-015 | Discount Stacking Rules | ACCEPTED |
| ADL-016 | Multi-Currency Exchange Rate Timing | ACCEPTED |
| ADL-017 | Invoice Number Gaps | ACCEPTED |
| ADL-018 | Tax Rounding Policy | ACCEPTED |
| ADL-019 | Tier Change Proration | ACCEPTED |
| ADL-020 | Invoice Retention Period | ACCEPTED |

## Required Before Level 12 — Events Management

| ADL | Title | Status |
|-----|-------|--------|
| ADL-023 | Waitlist Auto-Promotion with Claim Deadline | ACCEPTED |
| ADL-024 | Check-In Time Window | ACCEPTED |

---

**Total ADL records:** 24 (including this index)
**All statuses:** ACCEPTED
**Open gaps:** None — all 24 decisions are resolved.
# ADL-001: Cross-Module Transaction Boundary

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 4 — Platform Services

## Decision
Use the Saga pattern with compensating actions for all cross-module workflows. No distributed two-phase commit (2PC).

## Context
Workflows regularly span multiple modules: a single user action may update a CRM lead, create an invoice in Finance, send a WhatsApp via the Communication Gateway, and trigger an LMS enrollment. All of these touch separate database contexts. If any step fails partway through, the system must reach a consistent state without leaving orphaned records or partial updates.

Distributed 2PC requires all participating services to hold locks until the coordinator confirms, which creates deadlocks, performance bottlenecks, and a coordinator single point of failure. It is not viable for a system where modules are independently deployable and communicate via an event bus.

## Options Considered

**Option A — Distributed Two-Phase Commit (2PC)**
Rejected. Requires distributed lock management. Creates deadlocks under concurrent load. Coordinator failure leaves participants in a blocked state. Not compatible with event-driven, module-independent architecture.

**Option B — Saga pattern with orchestration (selected)**
A central orchestrator (the Workflow Engine) steps through each action in sequence. If a step fails, the orchestrator emits compensation events for each previously completed step in reverse order. Each module listens for its compensation event and reverses its action. The orchestrator is stateful but each step is independently retryable.

**Option C — Saga pattern with choreography only**
Each module emits events and reacts to others' events without a central coordinator. Simpler to start, but becomes impossible to trace and debug at scale. Compensation logic is scattered across modules with no single view of workflow state. Rejected for production use, acceptable only for simple two-step flows.

**Option D — Accept eventual inconsistency, no compensation**
Reject entire approach. For financial records, enrollment state, and invoice generation, partial updates that are never compensated create data integrity violations that compound over time.

## Consequences
Becomes easier: reasoning about workflow state (orchestrator owns it), debugging failed workflows (execution log shows exactly which step failed), retrying individual steps, adding new steps to an existing workflow.

Becomes harder: writing compensation actions (every workflow step must define its inverse), testing compensation paths (requires deliberately failing each step).

Locked: no module may assume atomicity across module boundaries. Every cross-module workflow step that has a side effect must define a compensating action.

## Implementation Constraints for Genesis/Codex
- The Workflow Engine (Level 5) acts as the Saga orchestrator. It maintains a workflow execution record with the status of each step.
- Every workflow step definition must include: `action`, `compensation_action`, `idempotency_key_template`.
- On step failure: Workflow Engine sets step status to `failed`, begins compensation sequence in reverse order of completed steps.
- Each compensation action is published as a domain event via the event bus.
- Compensation failure: event moved to dead letter queue, admin alerted via notification engine, workflow status set to `compensation_failed` requiring manual intervention.
- Workflow execution records are stored in the workflow engine's own database table, not in module tables.
- No module may import from another module's package to execute cross-module logic directly. All cross-module effects go via event bus.
- Saga state machine states: `pending`, `in_progress`, `completed`, `compensating`, `compensation_failed`, `cancelled`.
# ADL-002: Event Versioning and Schema Registry

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 4 — Platform Services

## Decision
Event schemas are stored as versioned JSON Schema files in `packages/schemas/` in the repository. Every event payload includes a `schema_version` field. All consumers implement the tolerant reader pattern. The outbox table stores `schema_version` alongside each event. No runtime schema registry service at launch.

## Context
As the platform evolves, event schemas change. A module publishing `student.enrolled` v1 may later add fields and publish v2. Consumers built against v1 must continue working when they receive v2. Consumers built against v2 must degrade gracefully when replaying historical v1 events. Without a versioning strategy, any schema change is a breaking change that requires all producers and consumers to be updated simultaneously — which is impossible in a multi-module system.

## Options Considered

**Option A — No versioning, breaking changes coordinated manually**
Rejected. Impossible to maintain as the number of modules and events grows. Any schema change risks breaking consumers. Replay of historical events for debugging or recovery becomes unreliable.

**Option B — Runtime schema registry service (Confluent Schema Registry model)**
A dedicated service validates event schemas at publish time and provides schema lookup at consume time. Powerful but adds an operational dependency. Every publish and consume requires a network call to the registry. At launch scale, the operational overhead exceeds the benefit. Deferred to growth phase when event volume and consumer count justify it.

**Option C — Repository-based schema files with version field in payload (selected)**
Schemas stored as JSON Schema files in `packages/schemas/`. Each event type has a directory with version-numbered schema files (`student.enrolled.v1.json`, `student.enrolled.v2.json`). The event payload includes `schema_version: 1` or `schema_version: 2`. Consumers check the version and apply appropriate parsing logic. Schema files are the source of truth, reviewed in pull requests, validated in CI. No runtime network dependency.

## Consequences
Becomes easier: schema changes are reviewed as code, schema history is in version control, CI validates schemas against consumer contracts, no additional service to operate.

Becomes harder: consumers must explicitly handle multiple schema versions for long-lived events, schema registry migration to a runtime service later requires tooling.

Locked: all schema changes are additive only (new optional fields). Removing a field or changing a field type requires a new schema version. Old schema versions supported for minimum 6 months.

## Implementation Constraints for Genesis/Codex
- Schema files location: `packages/schemas/events/[module]/[event-name]/v[N].json`
- Every event payload structure (TypeScript):
  ```typescript
  {
    event_id: string;          // UUID v4
    event_name: string;        // namespaced: "module.entity.action"
    schema_version: number;    // integer, matches schema file version
    org_id: string;            // UUID
    published_at: string;      // ISO 8601 UTC
    published_by: string;      // user_id or "system"
    correlation_id: string;    // UUID, for tracing event chains
    payload: Record<string, unknown>; // validated against schema file
  }
  ```
- Outbox table columns: `id`, `event_name`, `schema_version`, `payload` (JSONB), `org_id`, `created_at`, `published_at` (nullable — null means not yet published), `correlation_id`.
- All consumers must tolerate unknown fields in payload (tolerant reader pattern). Use of strict deserialization that rejects unknown fields is forbidden.
- CI gate: schema CI job validates that new schema versions are additive relative to previous version (no field removals, no type changes on existing fields).
- Consumer version support matrix maintained in `packages/schemas/COMPATIBILITY.md`.
# ADL-003: Idempotency Key Generation Strategy

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 4 — Platform Services

## Decision
The client generates a UUID v4 as the idempotency key and sends it in the `X-Idempotency-Key` request header. The server deduplicates in an `idempotency_keys` database table with a 24-hour window. Within the window, a duplicate key returns the original response without re-executing.

## Context
At-least-once delivery on the event bus and retryable HTTP clients mean that write operations (create invoice, record payment, trigger enrollment, generate certificate) may be submitted more than once — due to network failures, client retries, or browser double-submits. Without idempotency, duplicate submissions create duplicate invoices, double payments, or duplicate enrollments. The system needs a consistent strategy for all write APIs.

## Options Considered

**Option A — Server generates key from request hash**
Server hashes the request body to produce a deterministic key. Same request body = same key = deduplicated. Problem: two legitimately different requests with identical bodies (e.g., recording the same payment amount twice for two different invoices) would be incorrectly deduplicated. Content-based deduplication conflates "identical request" with "identical intent."

**Option B — Client generates UUID v4 (selected)**
Client generates a UUID v4 and sends it with the request. The UUID is unique per intent, not per content. The client retrying the same operation sends the same UUID. The client making a new operation generates a new UUID. The server stores the UUID and the result; duplicates within the window return the stored result.

**Option C — No idempotency keys, rely on application-level duplicate detection**
Each endpoint checks for duplicates based on business logic (e.g., "is there already an invoice for this lead and this batch?"). Problem: business logic duplicate detection is domain-specific and expensive to implement consistently across all write operations. It also cannot handle the case where the first request succeeded but the client never received the response.

## Consequences
Becomes easier: clients can safely retry any write operation without fear of duplicate side effects, network failures are recoverable, event bus re-delivery is safe.

Becomes harder: clients must generate and track UUIDs per operation (negligible overhead with any HTTP client library), deduplication table grows over time (mitigated by 24-hour TTL cleanup job).

Locked: all POST endpoints and state-changing PUT endpoints require `X-Idempotency-Key` header. The API gateway rejects write requests without it (HTTP 400 with a clear error message pointing to the documentation). Read-only GET and HEAD requests are exempt.

## Implementation Constraints for Genesis/Codex
- Table: `idempotency_keys(key VARCHAR(36) PRIMARY KEY, org_id UUID, endpoint VARCHAR(255), response_status INT, response_body JSONB, created_at TIMESTAMPTZ, expires_at TIMESTAMPTZ)`.
- `expires_at` = `created_at` + 24 hours. Cleanup job runs every hour, deletes expired rows.
- On incoming write request: check `idempotency_keys` for `key + org_id + endpoint`. If found and not expired: return stored `response_status` and `response_body`. If found but expired: treat as new. If not found: execute, store result, return result.
- Index on `(key, org_id, endpoint)` for fast lookup.
- Index on `expires_at` for efficient cleanup job.
- The API gateway enforces header presence before routing. Individual endpoints do not need to re-check header presence.
- Idempotency window is 24 hours. This is not configurable per tenant.
- The key is opaque to the server. The server never generates or interprets the UUID content.
# ADL-004: Global Opt-Out Registry

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 4 — Platform Services

## Decision
The global opt-out registry is a platform service owned by the Communication Gateway, not by any module. All outbound communications on any channel (WhatsApp, email, SMS, push) must route through the Communication Gateway, which checks the registry before sending. No module may send communications without going through the gateway.

## Context
A person who opts out of WhatsApp messages in the CRM must not receive WhatsApp from Campaigns, Events, LMS attendance reminders, or Finance payment reminders. A person who unsubscribes from email campaigns must not receive email from any module. Without a centralised registry enforced at the infrastructure level, each module would need its own opt-out logic, creating gaps where a person opts out in one place and still receives communications from another.

## Options Considered

**Option A — Per-module opt-out lists**
Each module maintains its own opt-out list. A CRM opt-out is only respected by CRM. Campaigns, LMS, Finance each maintain separate lists. Problem: requires opt-out synchronisation between modules (complex, error-prone), creates GDPR compliance risk (opt-out in one place does not cover all communications), and requires every new module to implement its own opt-out logic correctly.

**Option B — Centralised registry, modules check before sending (not selected as primary)**
Registry is central but modules query it themselves before calling external APIs. Problem: any module can bypass the check (accidentally or through a bug), creating compliance risk. Enforcement is distributed and cannot be guaranteed.

**Option C — Centralised registry enforced by Communication Gateway (selected)**
All outbound communications route through the Communication Gateway. The Gateway is the only entity that calls external communication APIs (Meta WhatsApp API, SendGrid, SMS gateway, push provider). The Gateway checks the opt-out registry before routing every message. If the person is opted out on that channel: message is blocked, blocking event logged, originating module is notified (non-blocking — the workflow continues, just the message is suppressed).

## Consequences
Becomes easier: GDPR and PECA compliance (one enforcement point), auditing opt-out compliance (one log), new modules automatically get opt-out enforcement without any module-level code.

Becomes harder: Communication Gateway is a harder dependency (must be highly available), all communication modules must be refactored to use the Gateway instead of calling external APIs directly.

Locked: the Communication Gateway is a required platform service (Level 4). No module at Level 7 or above may call WhatsApp, email, or SMS APIs directly. All calls go through the Gateway.

## Implementation Constraints for Genesis/Codex
- Table: `opt_out_registry(id UUID PRIMARY KEY, org_id UUID, person_id UUID, channel VARCHAR(20), opted_out_at TIMESTAMPTZ, opted_out_source VARCHAR(100), opted_in_at TIMESTAMPTZ NULLABLE, created_at TIMESTAMPTZ)`.
- `channel` values: `whatsapp`, `email`, `sms`, `push`.
- Effective opt-out: most recent `opted_out_at` is after most recent `opted_in_at` (or `opted_in_at` is null).
- Index on `(org_id, person_id, channel)` for fast lookup before every send.
- Communication Gateway API: `POST /gateway/send` with `{ org_id, person_id, channel, payload }`. Gateway checks registry, routes if allowed, logs result.
- Gateway response when blocked: `{ sent: false, reason: "opted_out", channel, person_id }`. This is not an error — the workflow continues.
- Every block is logged: `gateway_send_log(id, org_id, person_id, channel, sent, block_reason, logged_at)`.
- Opt-out event published to event bus on any opt-out action: `communication.opted_out { person_id, channel, source }`.
- Re-opt-in: only via explicit user action (not automatic), logged with timestamp and source.
- Suppression list (Campaigns): separate concept. Suppression list entries feed the opt-out registry on import.
# ADL-005: Module Dependency Cycle Detection

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 5 — Configuration Engine / Foundry

## Decision
Foundry performs a topological sort on the dependency graph at module install time. A cycle in required dependencies is a hard error that prevents installation. A cycle in optional dependencies is a warning that allows installation with degraded capability declared.

## Context
Modules declare dependencies in their manifest. If Module A requires Module B, and Module B requires Module A, installing either module would create an unresolvable dependency. More complex cycles (A→B→C→A) are harder to detect manually. Without automated detection, circular dependencies would cause undefined behaviour during module loading, activation sequencing, and uninstall.

## Options Considered

**Option A — No cycle detection, document that cycles are not allowed**
Rejected. Documentation is not enforcement. A developer adding a new dependency will not manually trace the entire dependency graph to check for cycles.

**Option B — Runtime cycle detection (detect at startup or activation)**
Detect cycles when the module is activated rather than when it is installed. Problem: the module is already on the system when the cycle is detected, requiring a potentially complex cleanup. Installing first and validating later creates a window of inconsistency.

**Option C — Install-time detection via topological sort (selected)**
Before writing any module data to the registry, Foundry runs Kahn's algorithm (or DFS-based topological sort) on the full dependency graph including the new module. If a cycle is detected, installation is rejected with an error message that shows the full cycle path. The system state is unchanged.

## Consequences
Becomes easier: dependency ordering is always valid, module loading sequence is deterministic, uninstall order can be safely computed.

Becomes harder: modules cannot have bidirectional hard dependencies (acceptable — bidirectional dependencies indicate poor module boundary design).

Locked: required dependency cycles are hard installation errors. Optional dependency cycles produce a warning in the installation log and an in-app notification to the platform admin.

## Implementation Constraints for Genesis/Codex
- Module manifest `manifest.json` structure for dependencies:
  ```json
  {
    "id": "module.crm",
    "version": "1.0.0",
    "requires_core": ">=1.0.0",
    "dependencies": {
      "required": ["module.products"],
      "optional": ["module.lms", "module.events"]
    }
  }
  ```
- Foundry install flow: load current dependency graph from registry → add new module's declared dependencies → run topological sort → if cycle in required edges: return error with cycle path displayed → if no cycle: proceed with installation.
- Error message format: `"Installation rejected: circular dependency detected. Cycle: module.crm → module.products → module.crm"`.
- Warning format: `"Optional dependency cycle detected: module.crm ↔ module.lms. Both modules will work with reduced cross-module capability."`.
- Topological sort result defines the activation order. Foundry activates modules in topological order.
- Foundry also uses the topological sort to determine safe uninstall order (reverse topological order, checking that no required dependents remain active before allowing uninstall).
# ADL-006: Module Uninstall Cleanup

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 5 — Foundry

## Decision
Module uninstall is a two-phase process. Phase 1 (Deactivate) is the default and is reversible. Phase 2 (Purge) is optional, requires Super Admin action, and is irreversible after a 30-day window.

## Context
When an operator removes a module, the platform must decide what happens to the data that module created. Simply deleting everything immediately is dangerous (accidental uninstall, data loss). Keeping everything forever wastes storage. A two-phase approach gives operators the ability to recover from mistakes while providing a path to full cleanup when genuinely needed.

Additionally, modules register scheduled jobs, webhook subscriptions, cache keys, and database tables that must be cleaned up to avoid resource leaks and unexpected behaviour from orphaned background processes.

## Options Considered

**Option A — Immediate full cleanup on uninstall**
All module data, database tables, scheduled jobs, webhooks, and cache keys deleted immediately. Rejected. Accidental uninstall causes irreversible data loss with no recovery path.

**Option B — Soft deactivate only, no cleanup path**
Module is deactivated but data and infrastructure artifacts remain forever. Rejected. Database tables with no active module create confusion and storage bloat. Scheduled jobs from uninstalled modules continue running, potentially causing errors.

**Option C — Two-phase: deactivate then optional purge (selected)**
Phase 1 deactivate is reversible and immediate. Phase 2 purge is explicit, approved, and has a 30-day cancellation window. This matches the SVFS staged deletion model used elsewhere in the platform.

## Consequences
Becomes easier: recovery from accidental uninstall (re-activate within 30 days of deactivate), controlled data cleanup path for genuine uninstalls, no orphaned background processes after purge.

Becomes harder: modules must declare their cleanup procedures in their manifest, Foundry must execute cleanup in the correct order.

Locked: Deactivate is the default. Purge requires Super Admin and is irreversible after 30 days. Data export is always offered before purge is available.

## Implementation Constraints for Genesis/Codex
- Module manifest must declare cleanup procedures:
  ```json
  {
    "uninstall": {
      "deactivate": {
        "revoke_capabilities": true,
        "pause_scheduled_jobs": true,
        "deregister_webhooks": false,
        "hide_navigation": true
      },
      "purge": {
        "drop_tables": ["module_crm_leads", "module_crm_pipelines"],
        "delete_scheduled_jobs": true,
        "deregister_webhooks": true,
        "clear_cache_prefix": "crm:",
        "delete_event_subscriptions": true
      }
    }
  }
  ```
- Phase 1 (Deactivate): capabilities revoked from all users, navigation items hidden, scheduled jobs paused (not deleted), module status set to `deactivated`. Data and tables preserved. Reversible by re-installing.
- Phase 2 (Purge): requires Super Admin, requires typing module name to confirm, 30-day cancellation window, data export offered first. After 30 days: Foundry executes purge manifest, all items in purge list deleted, module record removed from registry.
- Dependent modules check: before deactivating Module A, Foundry checks if any active module has Module A as a required dependency. If yes: deactivation blocked with list of dependent modules shown.
- Purge cannot be initiated until the deactivate phase has completed.
- All purge actions logged in platform audit log with Super Admin user, timestamp, and list of deleted resources.
# ADL-007: Module Upgrade Rollback

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 5 — Foundry

## Decision
Module upgrades use a two-phase blue-green deployment. The previous version remains registered and can be re-activated within a configurable stabilisation period (default 7 days) without data loss, provided all database migrations were backward-compatible.

## Context
When a module is upgraded, bugs may only appear in production after real usage. If rollback requires restoring a database backup, the rollback cost is too high (data loss, downtime). The solution is to ensure that the new version's database migrations are always backward-compatible with the previous version, so the previous version can be re-activated against the migrated schema without issues.

## Options Considered

**Option A — In-place upgrade, no rollback path**
New version replaces old version. If upgrade fails, restore from database backup. Rejected. Database restore means data loss for all changes made since the backup. For a SaaS platform with many concurrent users, this is unacceptable.

**Option B — Full blue-green with traffic splitting**
Run old and new versions simultaneously with traffic splitting. Rejected at current scale. Requires double infrastructure for every module upgrade. Operationally complex. The data consistency challenge (both versions writing to the same database simultaneously) requires careful schema design that exceeds the benefit at launch scale.

**Option C — Sequential blue-green with backward-compatible migrations (selected)**
Phase 1: deploy new version alongside old (both registered, old remains active). Phase 2: run database migrations (which must be backward-compatible — old version can still read/write the migrated schema). Phase 3: switch active version to new. Phase 4: monitor for stabilisation period. Phase 5: deregister old version. Rollback (within stabilisation period): switch active pointer back to old version. No data migration needed if migrations were backward-compatible.

## Consequences
Becomes easier: rollback is a registry pointer switch (seconds), no data loss, testable upgrade path in staging, clear stabilisation window for observing production behaviour.

Becomes harder: all database migrations must be backward-compatible (stricter discipline required), two versions registered during stabilisation period consume slightly more registry storage (negligible).

Locked: no migration may drop a column that the previous module version reads. No migration may change a column type that the previous version writes. Column removal requires a separate deployment after the previous version is deregistered.

## Implementation Constraints for Genesis/Codex
- Module registry stores: `module_id`, `version`, `status` (`active`, `previous`, `deregistered`), `activated_at`, `deregistered_at`.
- Only one version per module can have `status = active` at any time.
- Upgrade flow in Foundry:
  1. Register new version (status: `staged`)
  2. Run database migrations (validated as backward-compatible in CI before reaching this point)
  3. Switch active version (old: `active` → `previous`, new: `staged` → `active`)
  4. Start stabilisation timer (default 7 days, configurable per module)
  5. On stabilisation end: old version → `deregistered`, purge manifest runs for old version artifacts if any
- Rollback trigger: admin action in Foundry UI, or automated (if error rate on new version exceeds configurable threshold within stabilisation period)
- Rollback flow: new version → `previous`, old version → `active`. No database changes required (migrations were backward-compatible).
- CI gate: migration backward-compatibility check runs on every PR that includes a database migration. Check verifies: no column drops, no type changes on existing columns, no new NOT NULL columns without defaults.
- Migration backward-compatibility is enforced by automated CI checks, not by code review alone.
# ADL-008: Module Sandbox Environment

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 5 — Foundry

## Decision
The module sandbox is a separate tenant (org_id) created automatically for each organisation. It uses the same infrastructure as production but is completely data-isolated via the `is_sandbox` flag. Billing does not apply to sandbox tenants. Sandbox data is excluded from collective intelligence.

## Context
Development and testing of module configurations, workflows, and automations in the production tenant risks corrupting real data and triggering real communications. A sandbox environment is needed for safe exploration, onboarding demos, and module testing.

## Options Considered

**Option A — Separate staging infrastructure**
A completely separate deployment for testing. Rejected. Doubles infrastructure cost. Keeping staging in sync with production schema requires ongoing effort. Not viable as a per-organisation feature.

**Option B — Sandbox flag per record**
Mark individual records as sandbox records within the production tenant. Rejected. Filtering sandbox records from all queries adds performance overhead and creates risk of sandbox data leaking into production reports.

**Option C — Separate tenant with is_sandbox flag (selected)**
Each organisation gets a sandbox tenant (different org_id, same infrastructure). The `is_sandbox` flag on the org record is checked by: billing engine (skips billing), communication gateway (routes to fake delivery, logs but does not send), collective intelligence aggregation (excludes sandbox data), and any other service where sandbox vs production distinction matters. Sandbox tenant can be fully reset.

## Consequences
Becomes easier: safe exploration of configurations, onboarding demos with realistic data, module testing without production risk, sample data seeding (AI Concierge uses sandbox for demo data).

Becomes harder: operators must remember to switch between sandbox and production contexts, some features behave differently in sandbox (communications not actually sent).

Locked: sandbox tenants never pay billing. Sandbox communications are logged but never delivered to real recipients. Sandbox data never appears in collective intelligence.

## Implementation Constraints for Genesis/Codex
- `organisations` table: add `is_sandbox BOOLEAN NOT NULL DEFAULT FALSE` and `sandbox_parent_org_id UUID NULLABLE` (links sandbox to its production org).
- Platform shell: prominent visual indicator when operating in sandbox context (banner, different header colour using warning design token).
- Communication Gateway: when `is_sandbox = true` on the originating org, log the communication as `mode: sandbox_simulated`, do not call any external API, return success response to caller.
- Billing engine: skip all balance deductions and invoice generation for orgs where `is_sandbox = true`.
- Collective intelligence aggregation: `WHERE is_sandbox = FALSE` on all aggregation queries.
- Sandbox reset: deletes all records in the sandbox tenant (using the staged deletion path with immediate execution for sandbox), preserves org and user records, re-runs sample data seeding if requested.
- Sandbox tenant creation: Foundry creates sandbox tenant automatically when production tenant is created. Sandbox uses the same module set as the production tenant.
- API: sandbox operations use the same API endpoints. Sandbox vs production is determined by which `org_id` is in the authenticated session, not by a separate API endpoint.
# ADL-009: Module Performance Contract

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 5 — Foundry

## Decision
Every module declares its expected resource usage in its manifest. Foundry validates the declaration against available resources at install time. Production monitoring checks actual against declared. Upgrades that significantly increase declared resource requirements require explicit operator approval.

## Context
Without resource declarations, a new module can be installed and immediately consume all available database connections, memory, or CPU, degrading all other modules. Operators need visibility into what a module costs before installing it. The platform needs a baseline to alert on when a module behaves unexpectedly.

## Options Considered

**Option A — No declarations, monitor and alert reactively**
Install modules without resource information. Alert when resources are exhausted. Rejected. By the time alerts fire, all other modules are already degraded. No proactive protection.

**Option B — Strict resource enforcement at runtime**
Hard limits on database connections and memory per module, enforced at runtime. Rejected at launch scale. Requires per-module connection pooling and memory isolation, which is complex to implement reliably. Deferred to growth phase.

**Option C — Declared contract in manifest, monitoring and approval gate (selected)**
Module declares expected usage. Foundry validates at install time (does the declared usage exceed available headroom?). Monitoring compares actual against declared and alerts on sustained deviation. Upgrades with higher resource declarations require operator approval before proceeding.

## Consequences
Becomes easier: capacity planning (sum declared contracts across installed modules), anomaly detection (module using 3× its declared memory), operator informed decisions at install time.

Becomes harder: module authors must accurately estimate resource usage (encouraged by testing requirements), manifest becomes slightly more verbose.

Locked: every module manifest must include a performance contract section. Foundry rejects manifests without it.

## Implementation Constraints for Genesis/Codex
- Module manifest performance contract section:
  ```json
  {
    "performance_contract": {
      "max_memory_mb": 256,
      "max_db_connections": 10,
      "target_p95_latency_ms": 200,
      "max_background_jobs": 5,
      "max_storage_gb_per_1000_records": 0.5
    }
  }
  ```
- Foundry install check: sum of `max_db_connections` across all installed modules must not exceed 80% of the configured connection pool size. If it would: installation requires admin confirmation with capacity warning shown.
- Monitoring: Prometheus metrics per module (memory usage, active DB connections, background job count, API p95 latency). Alert when actual exceeds declared by >50% for more than 5 minutes.
- Upgrade approval: if new manifest declares >20% increase in any resource category, Foundry shows a confirmation dialog with old vs new values before proceeding.
- Default values (for modules that omit any field): `max_memory_mb: 128`, `max_db_connections: 5`, `target_p95_latency_ms: 500`, `max_background_jobs: 2`.
- Performance contract is not a hard runtime enforcement — it is a declaration for planning and monitoring. Hard runtime enforcement is a growth phase decision.
# ADL-010: Core Interface Versioning

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 5 — Foundry

## Decision
Core services (Gatekeeper, Foundry, Event Bus, Communication Gateway, AI Proxy) each declare a semantic version. Modules declare the minimum required core version in their manifest. Foundry validates compatibility at install time and on platform upgrades.

## Context
As core services evolve, their APIs change. A module built against Gatekeeper v1 may break if Gatekeeper v2 removes a capability check endpoint or changes its request format. Without versioning, any core upgrade potentially breaks all installed modules without warning. The platform needs a contract between core and module that can be validated mechanically.

## Options Considered

**Option A — No versioning, coordinated upgrades**
All core and module upgrades are coordinated and deployed simultaneously. Rejected. Impossible to maintain as the number of independently developed modules grows. Any third-party module author cannot be coordinated with.

**Option B — Single platform version (all or nothing)**
One version number covers core and all modules. All must be upgraded together. Rejected. This eliminates the ability to upgrade individual modules independently, which is a core value proposition of the modular architecture.

**Option C — Semantic versioning per core service with module compatibility declaration (selected)**
Each core service has its own semantic version following SemVer (MAJOR.MINOR.PATCH). Breaking changes increment MAJOR. Non-breaking additions increment MINOR. Modules declare the minimum required version per core service they depend on. Foundry checks compatibility at install and at every platform upgrade.

## Consequences
Becomes easier: module authors know exactly which core version their module is compatible with, platform team can make non-breaking core improvements without coordinating with module authors, breaking changes are flagged before they affect modules.

Becomes harder: core team must maintain semantic versioning discipline (no accidental breaking changes in minor versions), older major versions must be supported for the minimum support period.

Locked: breaking changes to any core service API require a major version increment. Old major versions supported for minimum 6 months after new major is released. Modules must declare compatibility and be updated within the support period.

## Implementation Constraints for Genesis/Codex
- Core service versions stored in `packages/core/version.json`:
  ```json
  {
    "gatekeeper": "1.0.0",
    "foundry": "1.0.0",
    "event_bus": "1.0.0",
    "communication_gateway": "1.0.0",
    "ai_proxy": "1.0.0",
    "notification_engine": "1.0.0"
  }
  ```
- Module manifest compatibility declaration:
  ```json
  {
    "requires_core": {
      "gatekeeper": ">=1.0.0",
      "event_bus": ">=1.0.0"
    }
  }
  ```
- Foundry compatibility check at install: compare module's `requires_core` against current `version.json`. If any required service version is below the declared minimum: installation rejected with a clear error showing which service needs upgrading.
- Foundry compatibility check at platform upgrade: before upgrading any core service to a new major version, check all installed modules for compatibility. If any module requires an older major version: upgrade is blocked with a list of incompatible modules. Operator must update those modules first.
- Modules that only use MINOR-level additions declare `">=1.2.0"` style requirements. This allows the core to add features without forcing module updates.
- Core services must maintain a `CHANGELOG.md` that explicitly marks breaking changes (MAJOR increment) and why.
# ADL-011: Configuration Reload Without Restart

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 5 — Configuration Engine

## Decision
Configuration is divided into two categories: hot-reloadable (changes take effect within 30 seconds without pod restart) and cold (requires pod restart). Hot-reloadable config is accessed via a config provider abstraction that polls the config store on every read. Cold config is read once at startup and cached.

## Context
Some configuration changes need to take effect immediately: feature flags, log levels, rate limit thresholds. Requiring a pod restart for these causes brief unavailability (even with rolling restarts) and slows down incident response. Other configuration changes (database connection strings, port numbers, TLS certificates) involve infrastructure-level changes that inherently require a restart.

## Options Considered

**Option A — All configuration requires restart**
Simple to implement. All config read at startup, cached in process memory. Rejected. Makes feature flag changes, log level changes during incidents, and rate limit adjustments unnecessarily slow and disruptive.

**Option B — All configuration is hot-reloadable**
All config read from a live store on every request. Rejected. Database connection string changes cannot be applied without releasing and re-establishing the connection pool. TLS certificate changes require restarting the TLS listener. Attempting to make these hot-reloadable adds significant complexity for minimal benefit.

**Option C — Explicit categorisation with config provider abstraction (selected)**
A config provider abstraction wraps all configuration access. For hot-reloadable keys, the provider polls the config store every 30 seconds. For cold keys, the provider reads at startup and caches permanently. Module code reads all config via the provider, never directly from environment variables for hot-reloadable values.

## Consequences
Becomes easier: feature flags change takes effect within 30 seconds without any deployment, log level can be raised during an incident and lowered after, rate limit adjustments for abuse mitigation without restart.

Becomes harder: developers must be aware of the category of each config key when adding new configuration, hot-reloadable keys cannot be used for values that require restart-level changes to take effect.

Locked: every new configuration key must be categorised as hot-reloadable or cold at the time it is added. This categorisation is documented in the config provider and enforced in code review.

## Implementation Constraints for Genesis/Codex
- Config provider interface: `ConfigProvider.get(key: string): string | number | boolean`.
- Hot-reloadable keys stored in the config store (database table or key-value store). Provider polls every 30 seconds.
- Cold keys stored in environment variables or secrets vault. Provider reads at startup, never re-reads.
- Config store table: `platform_config(key VARCHAR(100) PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ, updated_by UUID)`.
- All module code accesses configuration via `configProvider.get(key)`. Direct `process.env` access is forbidden for hot-reloadable keys (enforced by linter rule).
- Hot-reloadable keys (mandatory list at launch): `log_level`, `feature_flags.*`, `rate_limit.*`, `ai_model_routing.*`, `notification_quiet_hours.*`.
- Cold keys (mandatory list at launch): `DATABASE_URL`, `PORT`, `TLS_CERT_PATH`, `SECRETS_VAULT_URL`, `REDIS_URL`.
- New keys categorised as cold by default. Hot-reloadable requires explicit declaration in the config provider registry.
- Config change audit log: every change to a hot-reloadable key logged with who changed it, old value, new value, timestamp.
# ADL-012: Quote to Invoice Conversion

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance

## Decision
On acceptance, a Quote transitions to `converted` status (terminal state, read-only). A new Invoice record is created with a `quote_id` reference. If the Invoice is later cancelled, the Quote returns to `accepted` status (not back to `draft`).

## Context
A Quote and an Invoice are related but distinct financial documents. A Quote is an offer; an Invoice is a request for payment. The conversion from Quote to Invoice must preserve the Quote as an audit record while creating a new actionable Invoice document. The behaviour when an Invoice is cancelled and whether the Quote can then be re-converted must be explicitly defined.

## Options Considered

**Option A — Quote becomes the Invoice (in-place conversion)**
The Quote record is updated to become an Invoice by changing its type. Rejected. Loses the distinction between quote history and invoice history. Breaks the audit trail of what was offered vs what was billed.

**Option B — Quote deleted after conversion**
Quote is archived after Invoice is created. Rejected. The Quote is a business document that may have been sent to the customer. It must remain accessible for reference and audit.

**Option C — Quote transitions to converted (terminal), new Invoice created (selected)**
Quote status transitions: `draft` → `sent` → `accepted` → `converted` (terminal). On conversion, a new Invoice is created referencing `quote_id`. The Quote is read-only from `converted` state. If the Invoice is cancelled: Quote returns to `accepted` (not `draft` — it was accepted, and that acceptance remains valid). The operator can choose to create a new Invoice from the same Quote, or modify the Quote terms and re-send.

## Consequences
Becomes easier: clear audit trail of quote-to-invoice lifecycle, Quote remains as a historical offer document, behaviour on cancellation is predictable.

Becomes harder: UI must handle the `accepted` state after Invoice cancellation (show operator the option to re-invoice or re-negotiate).

Locked: `converted` is a terminal state for Quotes. A converted Quote cannot be edited. A converted Quote cannot be re-converted while its Invoice is active.

## Implementation Constraints for Genesis/Codex
- Quote status enum: `draft`, `sent`, `accepted`, `converted`, `rejected`, `expired`.
- Invoice has `quote_id UUID NULLABLE REFERENCES quotes(id)`.
- Quote transition `accepted → converted`: only triggered by the Invoice creation API call (not a direct Quote status update).
- Quote transition `converted → accepted`: only triggered when the linked Invoice transitions to `cancelled` or `void`.
- While Quote is `converted` and linked Invoice is active: Quote API returns read-only view, edit endpoints return HTTP 409 Conflict with message: "This quote has been converted to an invoice. Edit the invoice or cancel it to modify the quote."
- On Invoice creation from Quote: all line items, pricing, tax configuration, and discount configuration are copied from Quote to Invoice at time of conversion. Subsequent changes to the Quote template or product pricing do not affect the created Invoice.
- Quote PDF and Invoice PDF are separate documents with different templates and different document headers.
# ADL-013: Partial Invoice Payment Handling

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance

## Decision
`amount_remaining` on an invoice is always computed (not stored) as `amount_due - SUM(amount_allocated)`. Each payment creates a `payment_allocation` record linking a payment to an invoice with an allocated amount. One payment may be allocated across multiple invoices. One invoice may receive allocations from multiple payments.

## Context
Installment plans, partial payments, and account credits require tracking exactly how much of each invoice has been paid, by which payments, on which dates. Storing `amount_remaining` as a column creates consistency risk (it can become incorrect if a payment is voided or reversed without updating the invoice). Computing it from the allocation records is always correct.

## Options Considered

**Option A — Store amount_paid and amount_remaining on invoice, update on each payment**
Simple to query. Rejected. Two sources of truth (stored amount vs sum of allocations) that can diverge if any payment update does not also update the invoice. Auditability is weaker — you see the current balance but not the allocation history.

**Option B — Store only amount_paid, compute amount_remaining in application code**
Better than Option A but still maintains a stored value that can diverge from allocation sum. Rejected for same reason.

**Option C — Payment allocations table, compute balance from allocations (selected)**
All payment tracking is in the `payment_allocations` table. `amount_remaining` is a computed value derived from `amount_due - SUM(payment_allocations.allocated_amount WHERE invoice_id = X AND status != 'voided')`. There is no stored balance column that can become stale.

## Consequences
Becomes easier: complete payment history per invoice and per payment, void a payment allocation without corrupting the balance, accurate real-time balance always available, audit trail of exactly which payment covered which installment.

Becomes harder: balance queries require a JOIN and aggregation (mitigated by indexing on invoice_id), write queries must insert allocation records rather than updating invoice columns.

Locked: `amount_remaining` is never stored. It is always computed from the allocations table. Any code that stores or caches `amount_remaining` independently is a defect.

## Implementation Constraints for Genesis/Codex
- Table: `payment_allocations(id UUID PK, payment_id UUID FK, invoice_id UUID FK, installment_number INT NULLABLE, allocated_amount NUMERIC(12,2) NOT NULL, allocated_at TIMESTAMPTZ, allocated_by UUID, status VARCHAR(20), notes TEXT)`.
- `status` values: `active`, `voided`. Voided allocations are excluded from balance computation.
- Invoice status computed from allocations:
  - `paid`: `amount_remaining = 0`
  - `partial`: `0 < amount_remaining < amount_due`
  - `unpaid`: `amount_remaining = amount_due` and invoice has been sent
  - `overdue`: `amount_remaining > 0` and `due_date < NOW()`
- Invoice status is a computed field (database view or application-layer computation), not a stored column that is manually updated.
- Index on `payment_allocations(invoice_id)` for balance computation performance.
- Index on `payment_allocations(payment_id)` for payment detail queries.
- Voiding a payment: sets allocation `status = voided`, does not delete the record. Balance is recomputed automatically on next query.
- Installment tracking: `installment_number` on the allocation record indicates which installment of the payment plan this covers (nullable for non-installment payments).
# ADL-014: Refund to Original Payment Method

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance

## Decision
Refunds must return to the original payment method where technically possible. If the original method does not support API-initiated reversal, the refund is processed manually (bank transfer initiated by Finance team) and recorded in the platform as a manual refund. If the original method is unavailable, account credit is used as fallback with Billing Authority notification.

## Context
Returning a refund to a different payment method than the original creates compliance risk (potential money laundering concern), customer confusion, and in some jurisdictions is a regulatory requirement. Each payment method has different reversal capabilities and time windows.

## Options Considered

**Option A — Always refund to account credit**
Simplest to implement. Rejected. Account credit may not be acceptable to the customer (especially on account closure). Compliance risk if original method was a bank card (card schemes require refund to same card for disputed transactions).

**Option B — Manual refund only, no API integration**
Finance team manually processes all refunds via bank transfer or JazzCash agent. Rejected. Does not scale. For card payments, a manual bank transfer is the wrong method — it should be a card reversal.

**Option C — Method-specific reversal with manual fallback (selected)**
The platform attempts to refund via the original payment method's API where available. If the API reversal fails or is outside the reversal window, the Finance team processes manually and records it. Account credit is a last resort fallback when neither API reversal nor manual reversal is possible.

## Consequences
Becomes easier: correct handling of card scheme requirements (card → card), clear fallback chain for each method, compliance audit trail.

Becomes harder: different code paths per payment method for refunds, manual refund recording requires Finance team workflow.

Locked: the refund method used and the reason for any deviation from the original method must be recorded on the refund record.

## Implementation Constraints for Genesis/Codex
- `refunds` table: `id`, `invoice_id`, `payment_id`, `amount`, `currency`, `refund_method`, `original_payment_method`, `method_deviation_reason` (nullable — populated if refund method differs from payment method), `status` (`pending`, `approved`, `processing`, `completed`, `failed`), `reference` (gateway refund ID or bank transfer reference), `approved_by`, `approved_at`, `processed_at`, `notes`.
- Refund method resolution logic (run in order):
  1. If original method = `stripe_card`: attempt Stripe refund API → if within reversal window and card is valid → success.
  2. If original method = `jazz_cash`: attempt JazzCash reversal API if within reversal window → else Manual.
  3. If original method = `easy_paisa`: same as JazzCash.
  4. If original method = `bank_transfer`, `cash`, `cheque`: Manual (cannot reverse via API).
  5. If original method = `raast`: attempt RAAST reversal if API is available → else Manual.
  6. Manual: Finance team processes bank transfer, records reference number in platform.
  7. Last resort (account unavailable or customer prefers): Account Credit with Billing Authority notification.
- Manual refund flow: Finance officer marks refund as `processing`, records bank transfer reference, marks as `completed`. Manager approves above configurable threshold.
- When `refund_method != original_payment_method`: `method_deviation_reason` is required (free text, mandatory).
- Reversal window by method: Stripe (no window limit, always API), JazzCash (24 hours from transaction), EasyPaisa (same), RAAST (check API documentation — default 24 hours).
# ADL-015: Discount Stacking Rules

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance

## Decision
Discounts are applied in a fixed order: (1) product-level or early-bird discount, (2) coupon code, (3) volume or group discount. Tax is calculated on the final price after all discounts. All applied discounts appear as separate line items on the invoice. Two manual discounts cannot stack without explicit Super Admin approval. Automatic discounts can stack with one coupon code.

## Context
When multiple discount types apply to a single purchase, the order of application affects the final price. A percentage discount applied to a base price gives a different result than the same percentage applied after another discount. Without a fixed order, the same combination of discounts produces different totals depending on implementation, creating inconsistency and customer confusion.

## Options Considered

**Option A — All discounts additive (sum percentages)**
Sum all applicable discount percentages and apply once. Example: 10% early bird + 15% coupon = 25% total discount applied to base price. Rejected. Misrepresents compound discounting. A 25% single discount is more generous than 10% then 15% sequentially.

**Option B — Best single discount wins**
Apply only the single most favourable discount. Reject all others. Rejected. Does not reflect common business practice where multiple discount types legitimately combine (early bird + referral, for example).

**Option C — Fixed sequential application order (selected)**
Apply in defined order, each discount calculated on the result of the previous. This is standard retail practice and produces predictable, auditable results. The order is: product-level → coupon → volume. Tax is always last.

## Consequences
Becomes easier: predictable, auditable discount calculations, clear invoice display, no ambiguity about which discount was applied to which price.

Becomes harder: communicating to customers why their discounts were applied in a specific order (mitigated by showing each discount as a separate line item).

Locked: discount application order is product-level → coupon → volume → tax. This order is not configurable per transaction. Only the available discount types per product are configurable.

## Implementation Constraints for Genesis/Codex
- Invoice line item structure for discounts:
  ```
  Programme Fee (base):           PKR 25,000
  Early Bird Discount (10%):     -PKR  2,500
  Subtotal after early bird:      PKR 22,500
  Referral Coupon (REFER15, 15%): -PKR  3,375
  Subtotal after coupon:          PKR 19,125
  Group Discount (5 persons, 5%): -PKR    956
  Subtotal after all discounts:   PKR 18,169
  Sales Tax (17%):               +PKR  3,089
  Total:                          PKR 21,258
  ```
- Each discount recorded on the invoice with: `discount_type`, `discount_code` (if coupon), `percentage_or_amount`, `base_price_applied_to`, `discount_amount_calculated`, `applied_by` (user_id or "system"), `approval_required` (boolean), `approved_by` (nullable).
- Two manual discounts stacking: if a Finance officer is applying a discount manually (not automatic), and a manual discount is already applied, the system prompts for Super Admin approval before adding the second manual discount. Without approval, only one manual discount can exist per line item.
- Automatic discounts (early bird, group, volume) stack freely with each other and with one coupon code.
- Two coupon codes on the same invoice: not allowed. If operator tries to apply a second coupon, the system shows: "One coupon code per invoice. Remove the existing coupon to apply a different one."
- Discount eligibility checks run at invoice creation time, not at product selection time. The price at checkout is authoritative.
# ADL-016: Multi-Currency Exchange Rate Timing

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance

## Decision
The exchange rate is locked at invoice creation time and stored on the invoice. If a payment is received in a different currency, the rate at payment time is stored on the payment record. Any difference between the invoice rate and the payment rate is posted as a foreign exchange gain or loss journal entry in the General Ledger.

## Context
An invoice issued in USD at today's rate, paid 30 days later when the rate has changed, creates a discrepancy between the expected revenue (at invoice rate) and the actual cash received (at payment rate). This discrepancy is a foreign exchange gain or loss — a real financial event that must be accounted for. The platform must decide when the "official" rate is set, and how the gain or loss is handled.

## Options Considered

**Option A — Rate at payment time only, no invoice rate stored**
The invoice shows the foreign currency amount. The PKR amount is calculated only when payment is received. Problem: the invoice does not show a PKR amount, making it harder for the customer to understand what they owe, and for the operator to forecast PKR revenue.

**Option B — Rate at invoice creation, no gain/loss accounting**
Rate locked at invoice creation. Payment is always recorded at the invoice rate regardless of actual exchange rate at payment time. Problem: if payment is received at a different rate (which it will be if paid in foreign currency), the actual PKR received differs from the PKR on the invoice. This discrepancy is silently ignored, which is incorrect accounting.

**Option C — Rate at invoice creation, gain/loss journal on payment (selected)**
Invoice rate locked at creation and stored. Payment records the rate at payment time. Difference posted to a foreign exchange gain/loss GL account. This matches standard accounting practice (IFRS IAS 21, Pakistani accounting standards).

## Consequences
Becomes easier: correct financial reporting, invoice shows a definite PKR amount, audit trail of both rates, GL is always balanced.

Becomes harder: a separate GL journal entry is created for every foreign currency payment where the rate differs from the invoice rate (automated, not manual).

Locked: invoices in foreign currency store both the foreign currency amount and the PKR equivalent at invoice creation rate. Payments store the rate at payment time. Any difference generates an automated journal entry.

## Implementation Constraints for Genesis/Codex
- Invoice table: `base_currency VARCHAR(3)` (org's base currency, e.g., PKR), `invoice_currency VARCHAR(3)` (currency of the invoice, may differ), `invoice_currency_amount NUMERIC(15,2)`, `exchange_rate_at_issue NUMERIC(10,6)`, `base_currency_amount NUMERIC(15,2)` (= invoice_currency_amount × exchange_rate_at_issue).
- Payment table: `payment_currency VARCHAR(3)`, `payment_currency_amount NUMERIC(15,2)`, `exchange_rate_at_payment NUMERIC(10,6)`, `base_currency_amount NUMERIC(15,2)` (= payment_currency_amount × exchange_rate_at_payment).
- FX gain/loss journal entry triggered automatically when payment is recorded in a foreign currency and `exchange_rate_at_payment != exchange_rate_at_issue`.
- Journal entry: Debit `Cash/Bank` (actual PKR received), Credit `Accounts Receivable` (PKR per invoice rate), post difference to `Foreign Exchange Gain` (credit) or `Foreign Exchange Loss` (debit) GL account.
- Exchange rate source: manual entry at invoice creation time (Finance officer enters the rate). API-sourced rate (from a currency API) is a future enhancement — not at launch.
- Exchange rate history stored in `exchange_rates(from_currency, to_currency, rate, effective_date, entered_by)` for audit.
# ADL-017: Invoice Number Gaps

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance

## Decision
Invoice numbers are sequential and never reused. When an invoice is voided or cancelled, its number is retired. Gaps in the invoice number sequence are acceptable and FBR-compliant. Invoice numbers are generated at creation time, not at send time.

## Context
Sequential invoice numbering is required for accounting integrity and FBR compliance. The question is whether gaps in the sequence (caused by voided or cancelled invoices) are acceptable, and whether unused numbers can be reassigned.

## Options Considered

**Option A — Reuse voided invoice numbers**
When an invoice is voided, its number becomes available for the next invoice. Rejected. This creates a situation where two different invoices (the voided one and the new one) have the same number, which is an accounting control violation and unacceptable for audit purposes. FBR does not allow reuse of invoice numbers.

**Option B — No sequential numbers, use UUIDs**
Use UUID as the invoice identifier for all purposes. Rejected. Human-readable sequential numbers are required for: verbal communication with customers ("Invoice 1047"), FBR compliance, accounting software import.

**Option C — Sequential, no reuse, gaps allowed (selected)**
Invoice numbers are sequential, allocated at creation, never reused after voiding. Voided invoices retain their number in the system with status `voided`. The gap in the sequence is self-explanatory to auditors (the voided invoice is present in the system with its number, explaining the gap). This is standard accounting practice.

## Consequences
Becomes easier: unambiguous invoice identification, no re-use risk, void records fully preserved, FBR compliant, auditor-friendly.

Becomes harder: sequences with gaps may concern non-accounting users who notice "missing" numbers (mitigated by clearly showing voided invoices in the invoice list with their numbers).

Locked: invoice numbers are never reused. Voided invoices remain in the system with their original number and status `voided`. Invoice number is assigned at creation time, not at approval or send time.

## Implementation Constraints for Genesis/Codex
- Invoice number format: configurable per organisation. Default: `INV-[YEAR]-[SEQUENCE]` (e.g., `INV-2026-00847`). Sequence resets annually or continues from previous year (configurable).
- Per-branch numbering: branches may have separate number sequences (e.g., `LHR-2026-00234`, `KHI-2026-00089`). Configurable per organisation.
- Number generation: `SELECT nextval('invoice_seq_[org_id]')` — a PostgreSQL sequence per organisation. Sequences never decrement.
- Voided invoice: `status = voided`, `voided_at TIMESTAMPTZ`, `voided_by UUID`, `void_reason TEXT`. Invoice number retained as-is. Invoice is visible in invoice list with `voided` badge. Not deletable.
- Invoice list default filter: excludes voided invoices. "Show voided" toggle reveals them with their numbers (explains sequence gaps to users).
- Credit note: a cancelled invoice that has been partially or fully paid generates a credit note (separate document, separate number sequence: `CN-2026-00023`) rather than voiding the original paid invoice.
# ADL-018: Tax Rounding Policy

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance

## Decision
Tax is rounded per invoice total, not per line item. The unrounded tax amount for each line item is summed, and the total is rounded once to the nearest paisa. This is configurable per organisation. Default: per-invoice rounding.

## Context
On a multi-line invoice, applying per-line rounding and then summing the rounded amounts produces a different total than summing the unrounded amounts and rounding once. The difference is typically a few paisas but creates discrepancies between invoice totals and what is reported to FBR. A consistent, documented policy prevents disputes and ensures FBR submissions match invoice totals.

## Options Considered

**Option A — Per-line rounding**
Round each line item's tax to the nearest paisa, then sum the rounded amounts for the invoice tax total. Produces slightly different totals due to rounding accumulation across lines. More intuitive to customers (each line balances individually). Slightly higher total tax liability in most cases.

**Option B — Per-invoice rounding (selected as default)**
Sum all unrounded line item tax amounts, then round the invoice total once. This is the standard approach in Pakistani accounting practice and matches FBR's preferred calculation method. Minimises rounding differences in FBR reconciliation.

**Option C — No rounding (use full decimal precision)**
Keep full decimal precision throughout. Problem: Pakistani currency (PKR) has paisa denominations (1/100 PKR). Sub-paisa amounts are not payable and create reconciliation issues.

## Consequences
Becomes easier: FBR submission matches invoice totals, consistent tax amounts across invoices, no accumulated rounding errors from per-line rounding.

Becomes harder: individual line items may show unrounded tax amounts that do not independently sum to the invoice total (the rounding is applied only at the total). This is explained in the invoice footer.

Locked: default is per-invoice rounding. Per-line rounding is configurable per organisation for operators whose accounting system requires it. Tax rounding policy is displayed on all invoices in the footer.

## Implementation Constraints for Genesis/Codex
- Org settings: `tax_rounding_policy ENUM('per_invoice', 'per_line') DEFAULT 'per_invoice'`.
- Per-invoice calculation (default):
  ```
  line_1_tax = line_1_subtotal × tax_rate  (not rounded)
  line_2_tax = line_2_subtotal × tax_rate  (not rounded)
  total_tax = ROUND(line_1_tax + line_2_tax, 2)  (round once at total)
  ```
- Per-line calculation:
  ```
  line_1_tax = ROUND(line_1_subtotal × tax_rate, 2)  (round per line)
  line_2_tax = ROUND(line_2_subtotal × tax_rate, 2)  (round per line)
  total_tax = line_1_tax + line_2_tax  (sum already-rounded amounts)
  ```
- Tax rate precision: stored as `NUMERIC(5,4)` (up to 99.9999% rate). Tax amount stored as `NUMERIC(12,2)` (PKR to paisa precision).
- The invoice PDF shows the rounding policy used in the tax section footer.
- FBR tax report uses the same rounding policy as invoices to ensure reconciliation.
- Changing the rounding policy: applies to new invoices only. Historical invoices retain the policy that was in effect at their creation time. The policy used is stored on each invoice record.
# ADL-019: Tier Change Proration

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance (Platform Billing)

## Decision
Upgrades: unused days of the current tier are credited to the account balance immediately. The new tier's daily rate begins the same day. Downgrades: the current tier continues until the end of the current billing cycle. The new (lower) tier begins from the next billing date. No refund for unused days on downgrade.

## Context
Mid-cycle tier changes are common. An operator upgrading from Starter to Business on day 15 of a 30-day cycle has paid for 30 days of Starter but now wants Business. The platform must decide whether to charge immediately, credit back the unused Starter days, or defer the change. The reverse case (downgrade) has its own implications.

## Options Considered

**Option A — No proration, full charge on change date**
New tier is charged in full immediately, no credit for unused days. Rejected. Unfair to operators who paid for Starter and are upgrading — they lose the value of unused days. Discourages upgrades.

**Option B — Defer upgrade to next billing cycle**
Upgrade takes effect at the next billing date. Rejected. Operators who need Business capabilities today cannot get them until the next cycle. Unacceptable UX for urgent capability needs.

**Option C — Credit unused days on upgrade, defer downgrade (selected)**
Upgrade: credit `(days_remaining / total_days) × current_tier_daily_rate × days_remaining` to account balance. New tier's daily rate begins immediately. Downgrade: current tier continues until cycle end. New tier begins on next billing date. No refund for remaining days on downgrade (operator had access to the higher tier for the full period they paid for).

**Option D — Credit unused days on upgrade, immediate downgrade with credit**
Same as C for upgrades. For downgrades: immediate switch with credit for unused days at higher tier rate. Rejected for downgrade. Operators could game this by upgrading just before a big send (to get higher limits) then immediately downgrading for a refund. The business risk exceeds the UX benefit.

## Consequences
Becomes easier: operators upgrade immediately when they need to, no gaming incentive on downgrades, billing math is transparent.

Becomes harder: upgrade creates a partial-period credit that must be tracked in the account balance, downgrade UX must clearly communicate when the new tier takes effect.

Locked: upgrade credit is calculated at the time of the upgrade and added to the prepaid balance. Billing date does not change on any tier change.

## Implementation Constraints for Genesis/Codex
- Upgrade credit calculation:
  ```
  days_remaining = billing_cycle_end_date - today
  current_tier_daily_rate = current_plan_monthly_fee / 30
  credit_amount = ROUND(days_remaining × current_tier_daily_rate, 2)
  ```
- Credit is added to `organisation_balance` immediately on upgrade confirmation.
- A credit transaction is created in the billing ledger with `type = tier_upgrade_credit`, showing the calculation.
- The new tier's daily rate begins deducting from balance at midnight on the same day as the upgrade.
- Billing date remains unchanged. The next full cycle bill is for the new tier.
- Downgrade: create a scheduled tier change in `scheduled_tier_changes(org_id, new_plan_id, effective_date)` where `effective_date = billing_cycle_end_date`. On effective date (midnight): switch plan, deduct new daily rate going forward.
- If operator upgrades again before scheduled downgrade takes effect: cancel the scheduled downgrade, recalculate upgrade credit from the intermediate tier.
- Tier change confirmation screen shows: current plan, new plan, upgrade credit amount (if upgrade), effective date (if downgrade), next bill amount and date.
# ADL-020: Invoice Retention Period

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 8 — Finance

## Decision
Invoices and related financial records (payments, credit notes, refunds) are retained for a minimum of 6 years from the invoice date, as required by FBR Pakistan. This retention applies regardless of account status (including after account closure). Invoice records have a separate, longer data retention lifecycle than general operational data.

## Context
Pakistan's Federal Board of Revenue (FBR) requires businesses to maintain financial records for 6 years for tax audit purposes. This is a legal requirement, not a preference. If an operator closes their account, their invoices must still be retained for the full required period. The platform's standard data deletion policies (30-day staged deletion, 1-year dormant account retention) do not apply to financial records.

## Options Considered

**Option A — Apply standard data retention policy to invoices**
Invoices deleted on account closure after standard retention period. Rejected. Non-compliant with FBR requirement. Operators are the data subjects for their financial records and the platform is the data processor — the platform cannot delete records that operators are legally required to maintain.

**Option B — Retain invoices indefinitely**
Keep all invoice records forever. Rejected. Storage cost grows unboundedly. After the 6-year legal requirement is met, there is no obligation to retain, and long-term retention of personal data in invoices creates GDPR concerns.

**Option C — 6-year retention with separate lifecycle (selected)**
Invoice records are tagged with a retention category (`financial_record_6y`). This category has its own retention rules enforced separately from the standard data retention settings. Retention period is 6 years from invoice date. After 6 years: records are eligible for deletion but not automatically deleted — operator must explicitly request deletion or the records are retained indefinitely by default (safe default). On account closure: invoice records are preserved in cold storage, not accessible via the platform UI but available for legal/audit requests.

## Consequences
Becomes easier: FBR compliance without operator action, clear legal requirement met, operators not at risk of FBR audit exposure.

Becomes harder: storage must be maintained for closed accounts, storage cost for cold invoice storage (mitigated by cold storage pricing, typically 95% cheaper than hot storage), separate retention lifecycle to implement and maintain.

Locked: invoice records cannot be permanently deleted before the 6-year FBR retention period expires, regardless of account status or operator request. This is not configurable.

## Implementation Constraints for Genesis/Codex
- All financial records (`invoices`, `payments`, `payment_allocations`, `credit_notes`, `refunds`, `journal_entries`) include `retention_category VARCHAR(30) DEFAULT 'financial_record_6y'` and `retention_eligible_at TIMESTAMPTZ` (= `invoice_date` or `transaction_date` + 6 years).
- Standard data retention policies explicitly exclude records with `retention_category = 'financial_record_6y'` that have not yet reached `retention_eligible_at`.
- On account closure: organisation status set to `closed`. Standard operational data follows standard retention. Financial records with `retention_eligible_at > NOW()` are moved to cold storage tier (S3 Glacier or equivalent), removed from the active database, but preserved in the archive.
- Cold storage records are not accessible via the platform API during the closed period. They are accessible for legal/audit requests through a separate internal process.
- A GDPR data erasure request for a data subject who appears on invoices: the platform removes personal data from general records but retains invoice records (citing FBR compliance as the lawful basis for retention). Invoice records may have personal data pseudonymised where legally permitted.
- Invoice data export: always available during account active period. Cold storage retrieval during closed period available within 48 hours via support request.
# ADL-021: Lead Source Immutability

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 7 — CRM

## Decision
The lead source field (structured enum) is immutable after the lead record is created. The value set at intake is the permanent record of how the lead entered the system. Super Admin may correct an incorrect source with a mandatory audit log entry documenting the reason. No other user can change the source.

## Context
Lead source data drives marketing attribution reporting, CPL analysis, campaign effectiveness measurement, and commission calculations that credit admission officers for specific lead sources. If the source can be changed after creation, officers or managers could manipulate attribution to shift credit, and marketing analytics would become unreliable. Source integrity is more important than the flexibility to correct mistakes.

## Options Considered

**Option A — Source fully editable by any authorised user**
Any officer can change the source. Rejected. Enables attribution manipulation. Destroys analytics integrity. If an officer's commission is source-dependent, they have a financial incentive to change sources.

**Option B — Source editable with approval workflow**
Source changes require manager approval. Rejected. Approval adds process but does not prevent collusive manipulation between officer and manager.

**Option C — Source immutable, Super Admin correction with mandatory audit entry (selected)**
Source is set at intake and cannot be changed by any normal operation. Super Admin can make a correction, but the correction is logged permanently in the audit trail with: original source, corrected source, reason for correction, Super Admin identity, timestamp. This creates accountability for any source change without making it impossible to fix genuine data entry errors.

## Consequences
Becomes easier: reliable attribution analytics, commission calculations based on trustworthy source data, audit trail of any anomalies.

Becomes harder: genuine data entry errors (officer manually created a lead but selected wrong source) require Super Admin involvement to fix (acceptable — these are rare and the friction is intentional).

Locked: source is set once at intake and is immutable for all users except Super Admin. Super Admin corrections are logged permanently and cannot be edited or deleted.

## Implementation Constraints for Genesis/Codex
- `leads.source` column is set at creation, has a database-level CHECK constraint ensuring it matches the enum values.
- No UPDATE statement may change `leads.source` through any normal API endpoint. Source is excluded from the lead update API's allowed fields.
- Super Admin source correction: separate dedicated API endpoint `PATCH /admin/leads/:id/source` requiring Super Admin capability check, idempotency key, new source value, and mandatory `correction_reason` field.
- Audit log entry on correction: `action = "lead_source_corrected"`, `old_value`, `new_value`, `reason`, `performed_by`, `session_id`, `timestamp`. This audit entry cannot be deleted.
- Lead timeline entry on correction: "Source corrected from [old] to [new] by [Admin Name] — Reason: [reason]". Visible to all users with access to the lead record.
- Source correction count tracked on the lead record (`source_correction_count INT DEFAULT 0`). More than 2 corrections on a single lead triggers an alert to the platform admin (anomaly detection).
# ADL-022: Automated Lead Merge Rules

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 7 — CRM

## Decision
Exact normalised phone number match triggers automatic merge without user action. Email match plus name similarity above a configurable threshold triggers a suggested merge presented to a human. All other duplicate signals create the record separately. All automatic merges are logged and reversible within 30 days.

## Context
Duplicate lead records are created when the same person enters through multiple channels (fills a web form, then messages on WhatsApp, then gets manually entered by an officer). Without deduplication, operators work with fragmented data, send duplicate communications, and miss the full picture of a lead's journey. However, incorrect automatic merges (merging two different people who share a phone number, for example) cause data loss. The strategy must balance automation against safety.

## Options Considered

**Option A — All merges manual, no automation**
Every duplicate is flagged for human decision. Rejected. In high-volume environments (hundreds of daily leads), the manual merge queue becomes unmanageable. Duplicates pile up faster than operators can process them.

**Option B — Aggressive automatic merge on any overlap**
Any matching field (same first name, or same city, or similar email) triggers automatic merge. Rejected. Too many false positives. Phone numbers shared between family members, offices using shared numbers, and common names would cause incorrect merges at unacceptable rates.

**Option C — Tiered confidence with configurable thresholds (selected)**
High confidence (exact phone match after normalisation): automatic merge. Phone numbers are a reliable identifier in Pakistani business context. Medium confidence (email match + name similarity): surface as suggested merge for human decision. Low confidence (name similarity only, or partial email match): create separate records, flag as possible duplicate for later review.

## Consequences
Becomes easier: high-volume duplicate prevention without manual queue overload, human judgment for ambiguous cases, operator trust in automatically merged records.

Becomes harder: normalisation logic must handle Pakistani phone number formats correctly, name similarity threshold must be tuned (too sensitive: false positive merges; too loose: missed duplicates).

Locked: exact normalised phone match = automatic merge. This is the only automatic merge trigger. All other matches are presented as suggestions only. Automatic merges are reversible within 30 days by any Manager or above.

## Implementation Constraints for Genesis/Codex
- Phone normalisation: strip all non-digit characters, normalise Pakistani numbers to 11-digit format (03XXXXXXXXX), handle +92 prefix (strip and replace leading 92 with 0), handle 0092 prefix. After normalisation, `03001234567 == +923001234567 == 00923001234567`.
- Auto-merge trigger: on lead creation, query `SELECT id FROM leads WHERE org_id = ? AND normalised_phone_primary = ? AND state != 'permanently_deleted'`. If one result found: proceed with auto-merge. If multiple results found: surface all as suggestions (do not auto-merge into ambiguous situation).
- Auto-merge process: designate the older lead as the canonical record, append the newer lead's timeline entries to the canonical record chronologically, copy any fields from the newer record that are empty in the canonical record, mark newer record as `merged_into` with `canonical_lead_id`, create merge audit event.
- Merge reversal (within 30 days): restore the merged record with all its original fields and timeline entries. Both records become independent again. Timeline entries added after the merge remain on the canonical record.
- Suggested merge (email + name similarity): notification to the assigned officer with a comparison view showing both records side-by-side. Officer can: merge (designate which is canonical), dismiss (mark as not a duplicate, suppress future suggestions for this pair), defer (decide later). Dismissed pairs are stored in `lead_non_duplicate_pairs` to prevent re-suggesting.
- Name similarity: Levenshtein distance or phonetic matching (Soundex or Metaphone for Urdu-to-English transliteration handling), configurable threshold (default: 85% similarity for English names, configurable for other scripts).
- Merge history: `lead_merges(id, canonical_lead_id, merged_lead_id, merge_type ENUM('automatic','manual'), merged_at, merged_by NULLABLE, reversal_deadline, reversed_at NULLABLE, reversed_by NULLABLE)`.
# ADL-023: Waitlist Auto-Promotion with Claim Deadline

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 12 — Events Management

## Decision
When a seat opens, the first person on the waitlist is notified and given a configurable claim deadline (default 24 hours). If they do not claim within the deadline, the seat is offered to the next person. Unclaimed promotions are logged. The claim deadline is configurable per event.

## Context
When event capacity opens (due to cancellation or added capacity), the waitlist must be managed fairly. Notifying all waitlisted people simultaneously creates a race condition. Notifying sequentially with no time pressure means the first person can block the seat indefinitely. A claim deadline balances fairness with urgency.

## Options Considered

**Option A — First-come-first-served, no deadline**
Notify first person, wait indefinitely for their response. Rejected. Unresponsive first-in-waitlist blocks seat for all others indefinitely. No guarantee the seat gets filled.

**Option B — Notify all waitlisted simultaneously, first to respond gets seat**
Race condition. Fair by intent but creates anxiety and disappointment for those who respond but lose. Rejected. Poor UX, especially for paid events.

**Option C — Sequential notification with configurable claim deadline (selected)**
Notify one at a time. Each person gets a deadline to claim. If they claim: seat is reserved, payment or confirmation required. If they miss the deadline: move to next person, mark their promotion as `expired`. Log all promotions (who was notified, when, whether they claimed or let expire).

## Consequences
Becomes easier: fair and orderly seat allocation, no race conditions, predictable user experience, full audit trail.

Becomes harder: requires a background job to monitor claim deadlines and escalate to next in queue automatically.

Locked: only one person at a time is in the `offered` state per seat opening. Claim deadline is always enforced. Waitlist position is preserved for people who miss their deadline (they remain on the waitlist and may be offered again later if another seat opens).

## Implementation Constraints for Genesis/Codex
- `waitlist_entries(id, event_id, ticket_type_id NULLABLE, person_id, registered_at, position INT, status ENUM('waiting', 'offered', 'claimed', 'expired', 'cancelled'))`.
- `position` is assigned at registration time and never changes (first-registered = position 1).
- On seat opening: find `min(position)` where `status = 'waiting'`. Update that entry to `status = 'offered'`, set `offered_at = NOW()`, set `claim_deadline = NOW() + claim_deadline_hours`.
- Claim deadline default: 24 hours. Configurable per event at creation time.
- Notification on offer: WhatsApp + email with clear deadline stated ("You have until [date and time] to claim your seat").
- Background job runs every 15 minutes: find all entries where `status = 'offered' AND claim_deadline < NOW()`. For each: set `status = 'expired'`, find next `status = 'waiting'` entry for the same event and ticket type, send offer notification.
- Claim action: person clicks claim link → seat reserved, enters registration details if not already done, completes payment if paid event. If claim link expires: page shows "This offer has expired. You remain on the waitlist."
- The claim deadline is shown prominently on the claim page with a countdown timer.
- Waitlist position transparency: registered waitlist entries can see their current position (not the positions of others) in their registration confirmation and the event page.
# ADL-024: Check-In Time Window

**Status:** ACCEPTED
**Date:** 2026-05-31
**Required before:** Level 12 — Events Management

## Decision
Check-in is only valid within a configurable time window around the event start time (default: opens 30 minutes before, closes 60 minutes after). Outside this window, the QR scanner displays a clear message and does not record attendance. Manual check-in by an authorised user is available outside the window with a required reason.

## Context
Without a time window, check-in QR codes could be scanned at any time — the day before an event, a week after, or remotely from anywhere. This defeats the purpose of attendance tracking and enables fraudulent attendance recording. A time window ensures that check-in reflects actual presence at the event at the right time.

## Options Considered

**Option A — No time window, check-in valid anytime**
Check-in open from the moment the event is created until the event is deleted. Rejected. Anyone with the QR code can scan at any time from anywhere. Attendance data is meaningless.

**Option B — Fixed 15-minute window (before and after start)**
Hard-coded short window. Rejected. Events have variable lengths and registration periods. A conference registration may be open for 2 hours before the event starts. Hard-coding 15 minutes would block legitimate attendees who arrive during registration.

**Option C — Configurable window per event (selected)**
Each event can configure: how many minutes before start the window opens, how many minutes after start the window closes. Defaults: opens 30 minutes before, closes 60 minutes after start time. For multi-day events: check-in window is per-day (each day has its own window). Manual check-in (by an authorised scanner operator) is available outside the window with a required reason logged.

## Consequences
Becomes easier: attendance data reflects actual presence, no remote scanning abuse, configurable for events with unusual timing requirements.

Becomes harder: background job must manage window open/close state for all events, late arrivals beyond the window require coordinator intervention.

Locked: check-in is rejected (not just warned) outside the time window for self-scan and automated scanning. Manual override is always available to authorised operators with a logged reason. This applies to both event attendance and LMS class attendance.

## Implementation Constraints for Genesis/Codex
- Event-level config: `checkin_opens_minutes_before INT DEFAULT 30`, `checkin_closes_minutes_after INT DEFAULT 60`.
- These are stored on the event record and copied to each session record for multi-session events.
- Check-in validation logic (runs on every scan):
  ```
  window_open = session.start_time - checkin_opens_minutes_before
  window_close = session.start_time + checkin_closes_minutes_after
  if now() < window_open: reject with "Check-in opens at [window_open time]"
  if now() > window_close: reject with "Check-in closed at [window_close time]"
  else: accept and record attendance
  ```
- Rejection response to scanner: clear human-readable message with the actual open/close times shown. No generic error.
- Manual override: separate API endpoint `POST /attendance/manual-checkin` requiring `scanner_operator` capability, `person_id`, `session_id`, `override_reason` (required field, minimum 10 characters). Override logged with all fields.
- Manual overrides are visible in the attendance report with `check_in_type = 'manual_override'` and the reason shown (so coordinators can review patterns).
- For LMS class attendance: same time window logic applies. Configured per class session, not per programme (each session can have different check-in window lengths).
- Background job is not needed for open/close enforcement — the validation runs at scan time using the current timestamp. No state to manage.
