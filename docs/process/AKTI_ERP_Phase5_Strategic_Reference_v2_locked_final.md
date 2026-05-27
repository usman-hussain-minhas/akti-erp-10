# AKTI ERP — Phase 5 Strategic Reference v2

**Status:** Locked Planning Basis
**Covers: Phase 5A, Phase 5B, Phase 5C, Phase 6A, and Phase 6B+.**
**Date:** May 2026
**Authority:** This document does not authorize implementation. It is the planning basis from which Phase 5A through Phase 6A ticket packs are created.

---

## Document Purpose

This document records every architectural decision locked before Phase 5A execution begins. Every decision here is final unless a subsequent ADR explicitly supersedes it with documented reasoning. Phase 5A, Phase 5B, Phase 5C, and Phase 6A ticket packs must be consistent with every locked decision in this document.

Decisions are stated as facts. Options that were considered but rejected are recorded with their rejection reason. No decision is left open for Codex to resolve during execution.

---

## Part 1: Locked Decisions Registry

### 1.1 Core Methodology

**Decision: Ticket pack creation is the work. Code execution is the printout.**

The ratio is:
- Ticket pack creation: ~80% of total cognitive work and token cost
- Phase execution: ~20% — mechanical conversion of resolved decisions to code

Every ticket must be specified to the level where Codex has zero open interpretation. A ticket that requires Codex to make a decision during execution is an incomplete ticket. Incomplete tickets produce minimum-viable-compliance output that requires a repair pass. Repair passes are the failure pattern.

**The two enforcing lines present in every ticket pack:**

```
Implementation is not stale by itself. Tickets become stale.
Apply maximum concrete capability within the approved scope of each ticket.
```

**Phase count rule:**

Phase count equals the number of genuine human review gates required. It does not equal the number of logical concerns, technical domains, or workstreams. A 200-ticket queue executes as reliably as 20 tickets when each ticket is precisely specified.

**Three roles, never mixed:**

| Role | Actor | Output |
|---|---|---|
| Discovery | Claude + repo inspection | Options and evidence — never decisions |
| Decision | Human | Locked decisions recorded in ADRs and planning docs |
| Execution | Codex | Code, migrations, tests, docs committed to branch |

---

### 1.2 Multi-Tenant Architecture Model

**Decision: Shared database, shared schema, organization_id on every tenant-scoped table.**

All tenant data lives in a single PostgreSQL database. Every table that contains tenant-scoped data carries an `organization_id` column. Every query against tenant-scoped data must filter by `organization_id` as the first condition. No query may return data across tenant boundaries.

**Future upgrade path:** Dedicated schema or dedicated database for large or regulated tenants is an approved future upgrade path. It is not the default Phase 5/6 model. The upgrade path is documented in ADR-0015 as a conditional future decision, not authorized for Phase 5B implementation.

**Rejection of alternatives:**
- Separate schema per tenant: rejected for Phase 5 — adds schema management complexity before real scale exists
- Separate instance per tenant: rejected — infrastructure cost disproportionate to current scale
- Hybrid default: rejected — two operating models simultaneously before scale justifies it

---

### 1.3 Tenant Isolation Surfaces

Tenant isolation is enforced at four distinct surfaces. Each surface has a different enforcement mechanism. All four must be implemented in Phase 5B.

**Surface 1: Database**
```
Every tenant-scoped table has organization_id.
Service layer always passes organization_id as a query parameter.
No raw SQL bypasses the organization_id filter.
ORM queries must be validated to include organization_id at code review.
```

**Surface 2: API**
```
Every API route extracts organization_id from the trusted request context.
The trusted request context is injected by platform middleware — not by the module.
A route called without a valid organization context returns 401, not 500.
No API route may accept organization_id as a user-supplied parameter.
```

**Surface 3: Events**
```
Every event emitted to the Outbox must carry organization_id.
The Outbox write path validates organization_id is present before accepting the event.
Event consumers may only process events where organization_id matches their authorized scope.
Cross-tenant event subscription is not permitted.
```

**Surface 4: Files**
```
File storage paths are scoped: /{organization_id}/{module_key}/{file_id}
Access control is enforced at retrieval time, not only at storage path.
A signed URL for Tenant A's file cannot be used by Tenant B's session.
File metadata includes organization_id and is validated before returning signed URLs.
```

---

### 1.4 White-Labeling

**Decision: White-labeling is a core architectural constraint, not a feature.**

No platform component may render, send, store for display, or return tenant-facing identity information unless it is resolved through tenant configuration or explicitly classified as a platform-forensics/legal exception.

Hardcoding platform identity anywhere in tenant-facing components is a policy violation.

**White-label mode is an enum:**
```
white_label_mode: "none" | "partial" | "full"
```
- `none` — platform identity is displayed (internal/development use)
- `partial` — custom logo and name, platform attribution visible in footer
- `full` — zero platform identity visible to tenant operators or recipients

**Tenant configuration is a first-class platform entity:**

```
platform_tenant_config:
  organization_id          uuid       FK to organization, unique
  white_label_mode         enum       none | partial | full
  platform_name            string     display name for this tenant
  logo_url                 string     resolved from platform storage or approved domain
  favicon_url              string
  primary_color            string     hex value e.g. #1B2A4A
  secondary_color          string     hex value
  font_family              string     nullable, approved platform-hosted font or safe system stack only
  custom_domain            string     nullable, e.g. erp.hospital.example.com
  subdomain                string     required, e.g. hospital.akti.app
  ssl_cert_reference       string     nullable, reference to cert management
  sender_email             string     verified sender address
  sender_name              string     display name for outbound communication
  email_footer             text       tenant legal and contact notice
  sms_sender_id            string     nullable
  module_label_overrides   jsonb      { module_key: display_name }
  nav_label_overrides      jsonb      { nav_key: display_label }
  field_label_overrides    jsonb      { field_key: display_label }
  locale                   string     BCP 47 e.g. en-PK, ur-PK
  timezone                 string     IANA e.g. Asia/Karachi
  date_format              string     e.g. DD/MM/YYYY
  currency                 string     ISO 4217 e.g. PKR, USD
  created_at               timestamp
  updated_at               timestamp
```

**Font and asset security rule:**

Tenant typography may select only from approved platform-hosted fonts or safe system font stacks. Tenants may not inject arbitrary remote font URLs, arbitrary CSS, tracking pixels, or unreviewed third-party branding assets through white-label configuration.

**What tenant overrides can change:**
```
Visual identity: logo, favicon, colors, font
Navigation: module names, nav labels, page titles
Field display: field labels, section headings
Communication: sender name, sender email, email footer
Domain: custom domain, subdomain
Locale: language, timezone, date format, currency display
```

**What tenant overrides cannot change:**
```
Database column names
API field keys
Event type identifiers
Audit field names
Permission/capability keys
Module keys
Screen contract keys
Reporting/read-model field keys
```

**Label override priority:**
```
1. Tenant override (highest priority)
2. Module default label
3. Platform default label
4. Safe human-readable fallback (never raw code keys in normal UI)
```

Raw code keys such as `ledger_account` must never appear in normal operator UI. They are permitted only in Advanced Diagnostics/admin context.

**White-labeling exceptions (explicit):**
```
Audit trails retain platform identity for forensic integrity.
Gatekeeper decisions are attributed to platform policy.
Platform support and legal agreement areas may disclose platform identity.
SSL/TLS certificates may expose platform-controlled identifiers internally.
```

**Branding asset governance:**
```
logo_url and favicon_url must resolve to:
  - Platform-managed storage (approved path)
  - Tenant-owned domain (verified)
Permitted file types: SVG, PNG, WEBP
Maximum file size: 512KB for logo, 64KB for favicon
Assets are virus-scanned on upload
Remote tracking pixels are not permitted in system emails
Cache TTL: 24 hours with version-based invalidation
```

**Communication identity verification requirement:**
```
sender_email requires domain verification before production use
SPF, DKIM, DMARC records must be validated
Sender identity changes require Gatekeeper approval
Audit event emitted on every communication identity change
WhatsApp Business identity requires approved account before live messages
```

---

### 1.5 Configurable Field Labels

**Decision: Option C — module declares defaults, tenant overrides display labels.**

The underlying code key never changes. The display label is tenant-configurable.

```
Example:
  code key:           ledger_account
  API field name:     ledger_account
  audit field name:   ledger_account
  event field name:   ledger_account
  module default:     "Ledger Account"
  tenant override:    "Khata" or "Account Head" or "Receivable"
  UI renders:         tenant override if present, else module default

Platform invariant:
  tenant overrides affect only what is displayed to human operators.
  Every system boundary (API, event, audit, report, database) uses the code key.
```

This decision belongs in Policy 7 (Settings and Configuration Registration) and Policy 19 (Module UI).

---

### 1.6 Gatekeeper

**Decision: Gatekeeper is the policy enforcement authority. It judges. It does not execute.**

Gatekeeper evaluates whether an action is permitted. Foundry executes actions after Gatekeeper permits them.

**Gatekeeper checks, in order:**
```
1. Actor identity — is the actor authenticated and authorized in this tenant?
2. Capability — does the actor hold the required capability?
3. Tenant/org context — is the action scoped to a valid organization?
4. Risk level — what is the risk classification of this action?
5. Migration safety — if a migration is involved, does it comply with policy?
6. Module lifecycle — is this a valid state transition for this module?
7. Approval requirement — does the risk level require explicit approval?
8. Rollback evidence — is sufficient rollback capability documented?
9. Secret/adapter exposure — does this action expose credentials?
10. Policy compliance — does any other active policy prohibit this action?
11. Evidence requirements — are audit/evidence requirements satisfied?
```

**Gatekeeper verdicts:**

| Verdict | Meaning | Who can clear it |
|---|---|---|
| `ALLOW` | Action is permitted. Foundry may proceed. | N/A — proceeds automatically |
| `DENY` | Action is not permitted under current policy. | Can be appealed through approval workflow |
| `APPROVAL_REQUIRED` | Action requires explicit approval from a named approver. | Assigned approver |
| `STOP_FOR_REVIEW` | Action is outside the policy envelope. No automated path forward. | Platform architect only |

**STOP_FOR_REVIEW immutability rule:**
```
STOP_FOR_REVIEW cannot be overridden by:
  - Tenant admin
  - Module code
  - Automated retry
  - Approval workflow
  - Any actor below platform-architect level

Only explicit platform-architect resolution clears or reclassifies it.
A module that retries an action after STOP_FOR_REVIEW is returned is itself a policy violation.
```

**What Gatekeeper does not do:**
```
Install modules
Run migrations
Register menus or screens
Seed capabilities
Update module lifecycle state
Execute health checks
Build installer packages
Render UI
```

---

### 1.7 Foundry

**Decision: Foundry is the module installer and lifecycle runtime. It executes after Gatekeeper permits.**

**Foundry responsibilities:**
```
Module package intake and validation
Module manifest validation against schema
Module registration in the Module Registry
Module install execution
Module enable execution
Module disable execution
Module update execution
Module rollback execution
Module health check orchestration
Evidence package generation
Capability seeding (after Gatekeeper approval)
Menu/screen/settings registration
Module lifecycle state management
Compatibility checks against platform version and module dependencies
```

**The canonical 9-step module lifecycle action:**
```
1. Operator requests action in Mission Control
2. Foundry reads the module manifest
3. Foundry prepares a preflight packet (action, actor, module, migration plan, rollback plan)
4. Gatekeeper evaluates: policy, risk, capability, migration safety, evidence, rollback
5. Gatekeeper returns: ALLOW / DENY / APPROVAL_REQUIRED / STOP_FOR_REVIEW
6. If ALLOW: Foundry executes the action
7. Foundry updates: Module Registry, capabilities, menu/screen/settings, health check registry
8. Audit/Outbox records complete evidence
9. Mission Control reflects final state
```

**Every sensitive Foundry action requires Gatekeeper preflight:**
```
install module
enable module
disable module
apply migration
seed capability
revoke capability
register admin surface
update module version
rollback module
```

---

### 1.8 Workflow Engine

**Decision: Core Platform Service. Not a Foundry module.**

The Workflow Engine is built into the platform core. It is available before any module is installed. Foundry itself uses the Workflow Engine for approval steps in the module lifecycle.

**Rejection of Foundry-module approach:** A component required to safely install, approve, disable, and roll back modules cannot itself depend on module installation. Making the Workflow Engine a Foundry module creates a circular dependency where Foundry needs the Workflow Engine to run approval flows, but the Workflow Engine needs Foundry to install it.

**Core Workflow Engine scope:**
```
Approval flows
State transitions
Task assignment to actors based on capability
SLA / deadline tracking per step
Escalation on timeout
Delegation when assigned actor is unavailable
Human review steps
Audit hooks on every state transition
Gatekeeper preflight integration for high-risk steps
Parallel approval paths
```

**Not in core engine scope:**
```
Business-specific workflow logic (Admissions pipeline, HR onboarding, Finance approval chains)
Those are module-level workflow definitions that USE the core engine
```

**Workflow process definition schema (Phase 5A must produce this, Phase 5B implements the engine that validates and executes it):**

```
WorkflowDefinition:
  workflow_key          string    unique, format: {module_key}.{process_name}
  version               string    semver
  owner_module          string    module_key that owns this definition
  trigger               enum      manual | event | schedule | api
  trigger_event_type    string    required if trigger = event
  trigger_capability    string    capability required to initiate manually
  steps                 Step[]

Step:
  step_id               string    unique within workflow
  step_type             enum      action | approval | decision | notification | delay
  title                 string    human-readable label for UI and notifications
  actor_type            enum      specific_user | capability_holder | system | external
  actor_capability      string    capability required to be assigned this step
  timeout_hours         number    SLA: auto-escalate after N hours
  escalation_step_id    string    step to execute on timeout
  on_complete           string    next step_id or terminal keyword: COMPLETE | FAIL
  on_reject             string    next step_id or terminal keyword
  on_timeout            string    escalation step_id
  gatekeeper_required   boolean   whether Gatekeeper preflight runs for this step
  required_evidence     string[]  evidence keys that must be present before step completes
  audit_required        boolean   compliance-class steps always true
  notification_event    string    event type to emit when step is entered
```

---

### 1.9 Search Infrastructure

**Decision: PostgreSQL full-text search as Phase 5B baseline. pgvector as approved semantic extension path.**

**Phase 5B baseline implementation:**
```
PostgreSQL full-text search using tsvector columns and GIN indexes
Tenant isolation via organization_id filter (same as all other queries)
tsvector columns generated from indexed fields
GIN index per searchable entity type
Search queries: plainto_tsquery or phraseto_tsquery
Results ranked by ts_rank
```

**Approved extension path (Phase 5B must make schema ready):**
```
pgvector extension pre-installed and schema-ready
vector columns added to searchable entities but not populated
Semantic search activates when:
  - Embedding generation pipeline is approved and built
  - AI governance policy is implemented
  - Cost controls per tenant are implemented
```

**Deferred option:**
```
Typesense: deferred unless PostgreSQL FTS fails measured UX/performance targets
Target metric: search response < 200ms p95 for 100,000 records per tenant
If FTS cannot meet this target under real load, Typesense evaluation opens
```

---

### 1.10 Reporting Foundation

**Decision: Event-driven read model architecture.**

Every meaningful action on the platform emits a structured event to the Outbox. Read models are built by consuming those events. Reports are queries against read models.

**Why this approach:**
```
Any action = reportable
Any combination of actions across modules = reportable
Any time range = reportable
Any actor, tenant, module combination = filterable
ISO-level audit trail is a read model query, not a special feature
```

**Three-tier event field requirements:**

Tier 1 — Always required:
```
event_id              uuid        unique event identifier
event_type            string      format: {source_module}.{entity}.{action}
event_version         string      semver of this event schema
source_module         string      required for module-originated events
source_service        string      required for platform-service-originated events
source_origin_rule    rule        at least one of source_module or source_service is required
organization_id       uuid        tenant isolation — mandatory
timestamp_utc         timestamp   UTC, ISO 8601
correlation_id        uuid        links all events in one logical operation
action_result         enum        success | failure | partial
risk_level            enum        low | medium | high | critical
data_classification   enum        public | internal | confidential | restricted
retention_policy      string      retention rule key e.g. standard_90d | audit_7y
payload               jsonb       event-specific data
```

Tier 2 — Required when context exists:
```
actor_id              uuid        present when action is human-initiated
actor_type            enum        user | system | scheduled | import
session_id            uuid        present when a user session exists
ip_address            string      present when request comes from a client
user_agent            string      present when HTTP request exists
causation_id          uuid        event_id of the event that caused this event
previous_state        jsonb       state before change, for change events
new_state             jsonb       state after change, for change events
gatekeeper_decision   enum        allow | deny | approval_required | stop_for_review
approval_reference    uuid        present when approval was required
```

Tier 3 — Compliance-class (all Tier 1 + Tier 2 fields mandatory, no nulls permitted):

The following event types are compliance-class. Missing context fields are an audit failure unless actor_type is `system` with a documented system reason:
```
Any Gatekeeper decision event
Capability grant or revocation
Module install / enable / disable / rollback
Migration execution
Actor permission change
Data export or bulk deletion
STOP_FOR_REVIEW issued
DENY issued
White-label mode or communication identity change
Branding change (logo, domain, sender)
```

---

### 1.11 Phase Naming

```
Phase 5A — Platform Policy Pack, Governance & Gatekeeper Rulebook
Phase 5B — Gatekeeper-Governed Module Foundry & Core Platform Completion
Phase 5C — Frontend Excellence & UI Platform Maturity
Phase 6A — Golden Module Certification
Phase 6B+ — Business Modules
```

---

## Part 2: Platform Architecture

### 2.1 Platform Layer Map

Every layer is domain-neutral. Vertical-specific logic lives in modules only.

| Layer | Responsibility | Built in |
|---|---|---|
| Identity | Authentication, session, actor identity | Phase 5B |
| Capability | Permission declaration, seeding, inheritance, enforcement | Exists (Access Core) |
| Gatekeeper | Policy enforcement, risk evaluation, approval routing | Exists (extended in 5A/5B) |
| Foundry | Module lifecycle, install, enable, disable, rollback | Phase 5B |
| Workflow | Approval flows, state transitions, SLA, escalation | Phase 5B core service |
| Communication | Email, SMS, push notification, template management | Phase 5B |
| File | Document storage, access control, retention | Phase 5B |
| Search | Full-text search, future semantic search | Phase 5B |
| Reporting | Event consumption, read models, report query API, export | Phase 5B |
| AI Proxy | Governed AI calls, cost tracking, audit, tenant isolation | Phase 5B |
| Tenant Config | White-label branding, domain resolution, label overrides | Phase 5B |
| Audit / Outbox | Event persistence, evidence trail | Exists |
| Module Registry | Installed module inventory, capability map, health state | Exists (extended) |
| Mission Control | Operator shell, navigation, module surfaces | Exists (Phase 5C extends) |

---

### 2.2 What Phase 6 Modules Inherit

Every Phase 6 module inherits the following from the platform. An assumption baked into a module that contradicts any of these items requires platform-level rectification across every module that made the same assumption.

| Inherited pattern | What module assumes | Built in |
|---|---|---|
| Tenant isolation | Every query filters by organization_id. Never cross-tenant. | 5B |
| Event envelope | Every event carries all required Tier 1 fields + context-appropriate Tier 2 | 5A policy, 5B enforcement |
| API response shape | Every response follows the Module Service/API Contract Standard | 5A standard, 5B baseline |
| File storage | Files go through platform File Service — not module-specific storage | 5B |
| Workflow | Multi-step approvals use the core Workflow Engine | 5B |
| Communication | Outbound messages go through platform Communication Service | 5B |
| Search | Full-text search queries go through platform Search Service | 5B |
| Reporting | Cross-module analytics uses read models from Outbox events | 5B |
| Configurable labels | Module declares defaults. Tenant overrides display only. | 5A policy, 5B enforcement |
| White-labeling | No hardcoded platform identity in any tenant-facing surface | 5A policy, 5B/5C enforcement |
| Capability gates | Every API route declares its required capability | Exists, extended |
| Gatekeeper preflight | High-risk actions go through Gatekeeper before execution | Exists, extended |
| Audit | Every Gatekeeper-governed action produces an audit record | Exists, extended |

---

## Part 3: Phase 5A — Platform Policy Pack, Governance & Gatekeeper Rulebook

### 3.1 Purpose

Phase 5A writes the rules. Phase 5B builds the enforcement machinery. Phase 5A must not implement any runtime service, Foundry behavior, module installer, or Gatekeeper execution logic.

Every Phase 5A output must answer:
```
What is the rule?
What enforces it? (Foundry / Gatekeeper / Access Core / ADR authority / CI check)
What is the Phase 5B implementation input?
What happens if the rule is violated?
```

A policy that cannot name its enforcement point is not a policy. It is an aspiration.

---

### 3.2 The 20 Policies

**P01 — Core Update and Platform Change Policy**

```
Scope:
  Rules governing changes to the platform core itself.
  Distinguishes between: breaking changes, non-breaking changes, emergency patches.
  Defines approval requirements per change category.
  Defines evidence requirements before a core change merges to main.

Breaking change definition:
  Any change that causes an existing valid module manifest to fail schema validation.
  Any change to a public API route shape without a version increment.
  Any change to an event type shape that breaks existing consumers.
  Any Prisma migration that alters or removes existing columns.

Non-breaking change:
  Adding new optional fields to API responses.
  Adding new event types.
  Adding new optional manifest fields.
  Performance improvements with no behavior change.

Enforcement: ADR required before any breaking change. CI schema validation must pass. Module manifest validation must pass against existing installed manifests.
```

**P02 — Module Definition and Ownership Policy**

```
Scope:
  What constitutes a valid module.
  Who can define a module.
  Module key naming convention: {vertical}.{module_name} e.g. education.admissions
  Every module has exactly one owner organization_id.
  A module manifest is the sole authoritative definition of a module.

Required manifest fields for a valid module:
  module_key, version, display_name, description, owner, capabilities[],
  permissions[], api_routes[], events_emitted[], events_consumed[],
  migrations[], settings[], menu_entries[], dashboard_widgets[],
  health_checks[], gatekeeper_hooks[], audit_hooks[], disable_behavior,
  degraded_mode_behavior, data_ownership[], min_platform_version

Enforcement: Foundry validates manifest against schema on install. Invalid manifests are rejected before Gatekeeper preflight.
```

**P03 — Module Lifecycle Policy**

```
States and transitions:
  draft → proposed → certified → installed → enabled → disabled → deprecated → removed

draft:       Module is being developed. Not visible to Foundry.
proposed:    Manifest submitted to Foundry. Awaiting certification.
certified:   Manifest validated. Tests passed. Ready for install.
installed:   Migrations applied. Registry updated. Capabilities seeded. Not yet active.
enabled:     Module is active and visible in Mission Control.
disabled:    Module is inactive. Data retained. Migrations not reversed.
deprecated:  Module is still enabled but marked for retirement. Operators notified.
removed:     Data exported or deleted per policy. Migrations reversed if reversible.

Each transition requires a Gatekeeper ALLOW verdict.
Each transition produces a compliance-class audit event.
No transition may be skipped.

Enforcement: Foundry enforces state machine. State is stored in Module Registry. Gatekeeper checks transition validity.
```

**P04 — Module Installation and Update Policy**

```
Install ceremony:
  1. Foundry reads manifest
  2. Foundry validates manifest schema
  3. Foundry checks platform version compatibility
  4. Foundry checks module dependency availability
  5. Foundry prepares migration plan and rollback plan
  6. Gatekeeper evaluates (capability, risk, migration safety, rollback evidence)
  7. If ALLOW: migrations execute in transaction
  8. Capabilities seeded
  9. Menu/screen/settings registered
  10. Health checks registered
  11. Module state set to installed
  12. Evidence package committed to Audit

Update gate:
  Same ceremony as install.
  Additionally: compatibility check between current module version and new version.
  If migration is destructive: STOP_FOR_REVIEW from Gatekeeper unless explicitly approved.

Rollback trigger conditions:
  Any health check fails immediately after install
  Any smoke test fails
  Gatekeeper issues STOP_FOR_REVIEW during install
  Operator explicitly requests rollback within rollback window

Enforcement: Foundry enforces ceremony. Gatekeeper enforces approval. Audit/Outbox records evidence.
```

**P05 — Capability, Permission and Access Policy**

```
Capability model specification:

A capability is a named, scoped permission that an actor holds.

Capability record:
  capability_key        string   unique, format: {module_key}.{resource}.{action}
  display_name          string   human-readable label
  description           string
  risk_level            enum     low | medium | high | critical
  owner_module          string   module_key that declared this capability
  is_platform_core      boolean  true for platform-built capabilities
  requires_approval     boolean  whether granting requires Gatekeeper approval
  created_at            timestamp
  deprecated_at         timestamp   nullable

Actor capability record:
  actor_id              uuid
  organization_id       uuid     tenant isolation
  capability_key        string
  granted_by            uuid     actor_id who granted
  granted_at            timestamp
  expires_at            timestamp   nullable
  grant_reason          string
  revoked_at            timestamp   nullable
  revoked_by            uuid        nullable

Namespace convention:
  Platform core:        platform.{resource}.{action}
  Module-owned:         {module_key}.{resource}.{action}
  Example valid:        platform.shell.access, education.leads.view
  Example invalid:      leads.view (missing module prefix)

Collision detection:
  Two modules may not declare capabilities with the same key.
  Foundry rejects installation if a new module's capability_key conflicts with an existing registered capability.

Cross-module capability usage:
  Module A may declare a menu entry that requires a capability from Module B.
  Module A must declare the cross-module dependency in its manifest.
  If Module B is disabled, Module A surfaces that depend on Module B capabilities are hidden.

Inheritance:
  Capabilities do not inherit. An actor either holds a capability or does not.
  Role-based assignment: a module may define a role as a named set of capabilities.
  Assigning a role grants all capabilities in that role at the time of assignment.
  Revoking a role revokes all capabilities granted by that role.

Governor limits:
  A module may not declare more than 100 capabilities.
  A module may not grant capabilities outside its own namespace without explicit platform approval.
  Capability grants for risk_level=critical require APPROVAL_REQUIRED from Gatekeeper.

Enforcement: Access Core validates capability presence on every gated API route. Gatekeeper checks capability on every high-risk action. Foundry checks capability declarations on install.
```

**P06 — Menu, Navigation and Screen Registration Policy**

```
Registration: Modules register menu entries, navigation items, and screens through their manifest.
              Foundry registers these when the module is enabled.
              Foundry de-registers these when the module is disabled.

Menu entry structure:
  menu_key              string   unique within module, format: {module_key}.{entry_name}
  display_label         string   module default label (tenant may override via label policy)
  icon_key              string   from platform icon registry
  route                 string   absolute route path
  required_capability   string   capability_key actor must hold to see this entry
  sort_order            number   relative position within navigation group
  navigation_group      string   which group this entry belongs to
  visibility            enum     always | capability_gated | hidden

Conflict resolution:
  Two modules may not register the same route path.
  If a conflict is detected, Foundry issues STOP_FOR_REVIEW.
  Menu sort_order conflicts are resolved alphabetically by module_key.

Screen contract requirement:
  Every module screen must have a committed screen contract before the module reaches certified state.
  Screen contracts are validated by Foundry during install.

Enforcement: Foundry manages registration. Mission Control reads from Foundry registry. Capabilities enforced by Access Core at route level.
```

**P07 — Settings and Configuration Registration Policy**

```
Tenant configuration service is a first-class platform service (see locked decision 1.4).
Module settings are registered in the tenant configuration service when a module is enabled.
Module settings are de-registered when a module is removed.

Setting record:
  setting_key           string   unique within module, format: {module_key}.{setting_name}
  display_label         string   module default (tenant may override)
  description           string
  value_type            enum     string | number | boolean | enum | jsonb
  default_value         any      module-defined default
  tenant_overridable    boolean  whether tenant admin can change this
  requires_restart      boolean  whether change requires module restart
  required_capability   string   capability required to view/edit this setting
  validation_rule       string   nullable, regex or constraint

Label override governance:
  Tenant overrides are applied at render time only.
  Override values are stored in platform_tenant_config.field_label_overrides.
  Override keys are code keys. Override values are display strings.
  Overrides do not propagate to database, API, audit, event, or report fields.

Label priority order:
  1. Tenant override (highest)
  2. Module default label
  3. Platform default label
  4. Safe human-readable fallback (never raw code key in normal UI)

Enforcement: Foundry registers/de-registers settings. Tenant config service resolves labels. Access Core enforces setting visibility by capability.
```

**P08 — Gatekeeper Preflight and Approval Policy**

```
Trigger conditions:
  Any action that creates, modifies, or deletes a capability grant
  Any action that installs, enables, disables, updates, or rolls back a module
  Any action that executes a database migration
  Any action that modifies tenant configuration (branding, domain, sender identity)
  Any action that exports or bulk-deletes tenant data
  Any action that seeds or revokes capabilities
  Any action that registers or de-registers admin-only surfaces
  Any action classified as risk_level = high or critical

Configurable thresholds (tolerance groups):
  Thresholds are stored as configuration data, not code.
  Changing a threshold requires updating configuration — not a deployment.
  Example threshold rule:

  threshold_rule:
    field:      string    which field to evaluate
    operator:   enum      gt | gte | lt | lte | eq | between
    value:      number or [number, number]
    currency:   string    nullable, for monetary thresholds
    action:     enum      auto_approve | require_level_1 | require_level_2 | block

Approval chain:
  APPROVAL_REQUIRED routes to the actor holding the required approval capability.
  If no approver is available within timeout_hours, escalation_target receives the request.
  Approval records are compliance-class audit events.

STOP_FOR_REVIEW immutability:
  No actor below platform-architect level may clear or reclassify STOP_FOR_REVIEW.
  The action may not be retried until a platform architect explicitly resolves the finding.
  A module that retries an action after STOP_FOR_REVIEW is a policy violation.

Enforcement: Gatekeeper is called by Foundry before every sensitive action. Gatekeeper outcome is recorded as compliance-class event. Outcome is enforced — Foundry will not proceed without ALLOW.
```

**P09 — Migration and Schema Contribution Policy**

```
Every module migration must:
  Run in a transaction — all or nothing.
  Be non-destructive by default. Destructive migrations require Gatekeeper STOP_FOR_REVIEW unless explicitly pre-approved.
  Include a rollback script.
  Carry organization_id on every new tenant-scoped table.
  Follow the shared DB + organization_id model.
  Carry timestamp columns (created_at, updated_at) on every new table.
  Not modify tables owned by another module.
  Not modify platform core tables.

Destructive migration definition:
  DROP TABLE
  DROP COLUMN
  ALTER COLUMN (type change or nullability reduction)
  DELETE or TRUNCATE affecting production data

Ordering rule:
  Migrations execute in module_key alphabetical order when multiple modules install simultaneously.
  A module may declare migration_depends_on in its manifest to enforce ordering.
  Circular migration dependencies are rejected by Foundry.

Tenant-scoped table standard:
  organization_id   uuid   NOT NULL, FK to organization
  created_at        timestamp   NOT NULL, DEFAULT now()
  updated_at        timestamp   NOT NULL, DEFAULT now()

Enforcement: Foundry validates migration files before execution. Gatekeeper checks for destructive operations. CI migration linting runs on every PR.
```

**P10 — Data Ownership, Tenant Boundary and Cross-Module Access Policy**

```
Data ownership:
  Every table belongs to exactly one module or to the platform core.
  A module may not directly query another module's tables.
  Cross-module data access is via API or via Outbox events only.

Effective date model (required for HR and Finance entities):
  Records that change over time must support effective-dated history.
  Changes create new records with effective_from and effective_to dates.
  The current record is the one where effective_to is null or future.
  Historical queries return the record effective on the query date.
  Retroactive modifications are compliance-class events.

Period integrity:
  An entity type may be marked as period_bounded in its module manifest.
  A period-bounded entity cannot accept changes for closed periods.
  Attempting to post to a closed period returns a specific error code.
  The same query on a closed period always returns the same result (reproducible reporting).

Cross-tenant boundary:
  No API route may return data from a different organization_id than the authenticated session.
  Cross-tenant access requires explicit platform-level configuration and Gatekeeper approval.
  Cross-tenant access is an audit event.

Enforcement: Database: organization_id on all tenant tables. API: middleware enforces organization_id from trusted context. Foundry: module manifest declares data_ownership. CI: cross-tenant negative tests run on every PR.
```

**P11 — Adapter and External Dependency Policy**

```
An adapter is any integration with an external service (payment gateway, SMS provider, WhatsApp Business, email provider, government API, etc.).

Adapter declaration:
  Adapters are declared in the module manifest under external_adapters[].
  Each adapter declaration includes: adapter_key, provider, credential_reference (never value), failure_mode, retry_policy.

Credential policy:
  Adapter credentials are never stored in code, manifests, or version control.
  Credentials are stored in platform secrets management.
  Modules reference credentials by key — they never read the credential value directly.
  The platform injects the credential at runtime through a secure adapter invocation pattern.

Failure isolation:
  An adapter failure must not crash the module or the platform.
  Every adapter call is wrapped in a circuit breaker.
  Fallback behavior is declared in the manifest under failure_mode.
  Adapter failures are emitted as events and visible in module health status.

Retry policy:
  Retry policies are declared in the manifest — not hardcoded.
  Maximum retry attempts, backoff strategy, and dead-letter behavior are configuration.

Enforcement: Foundry validates adapter declarations on install. Access Core governs adapter invocation capability. Secrets manager enforces credential access. CI cannot run with real credentials.
```

**P12 — Version, Compatibility and Deprecation Policy**

```
Platform version artifact: platform.version.json at repository root.
  {
    "platform_core_version": "1.0.0",
    "minimum_module_compatibility": "1.0.0",
    "released_at": "[decided by ADR-0017]"
  }

Module manifest declares: min_platform_version (semver).
Foundry checks compatibility on install: module min_platform_version <= platform_core_version.
If incompatible: install is blocked. Operator is shown the version gap.

Breaking change definition (see P01): any change that invalidates existing valid manifests.
When a breaking platform change is released:
  Existing installed modules are checked for compatibility.
  Incompatible modules are set to degraded state, not disabled.
  Module owners have a documented migration window before hard deprecation.

Module deprecation ceremony:
  Module state set to deprecated.
  Operators receive notification via platform notification system.
  Dashboard shows deprecation notice with date.
  After deprecation date: module is disabled if not updated.

Enforcement: Foundry checks compatibility. CI validates platform.version.json on every core change PR.
```

**P13 — Disable, Uninstall and Rollback Policy**

```
Disable:
  Module is set to disabled state.
  Menu entries, navigation, dashboard widgets are removed from Mission Control.
  Settings sections are hidden.
  Module API routes return 503 with a specific error code.
  Data is retained. Migrations are not reversed.
  Capabilities remain declared but are marked inactive.

Uninstall:
  All of disable, plus:
  Data export is offered before uninstall executes.
  Migrations may be reversed if the rollback script exists and is non-destructive.
  If rollback script is destructive: requires STOP_FOR_REVIEW from Gatekeeper.
  Capabilities are removed from Access Core.
  File storage associated with module is flagged for retention policy evaluation.

Rollback triggers (automatic):
  Any health check fails immediately after install.
  Any smoke test fails.
  Gatekeeper issues STOP_FOR_REVIEW during install.

Rollback triggers (manual):
  Operator requests rollback within rollback window.
  Platform architect initiates rollback after STOP_FOR_REVIEW resolution.

Rollback window: defined in module manifest, default 24 hours after enable.

Data retention during disable:
  All tenant data is retained for the retention_days value in the module manifest.
  Default retention_days: 90.
  Compliance-sensitive data follows data_classification retention rules.
  File assets follow platform File Service retention policy.

Enforcement: Foundry manages lifecycle state transitions. Gatekeeper approves each transition. Audit records every state change as compliance-class event.
```

**P14 — Evidence and Audit Package Policy**

```
Every module install, update, disable, rollback, and certification produces an evidence package.

Evidence package contents:
  Module manifest (exact version installed)
  Migration files executed (with checksums)
  Capability declarations (before and after state)
  Health check results
  Smoke test results
  Gatekeeper decision log
  Rollback script reference
  Installer actor identity
  Timestamp of every step

Field history tracking standard:
  Every entity decorated with @audited must maintain field-level change history.

Field change log record:
  entity_type           string    which entity type
  entity_id             uuid
  organization_id       uuid      tenant isolation
  field_name            string    code key of the changed field
  previous_value        string    serialized previous value
  new_value             string    serialized new value
  changed_by_actor_id   uuid
  changed_at            timestamp
  change_source         enum      user_action | system | import | migration

API: GET /platform/audit/entity/{entity_type}/{entity_id}/field-history
     Returns: paginated field change log
     Capability required: audit.field_history.read
     Tenant isolation: organization_id filter mandatory

Enforcement: Foundry generates evidence package. Audit/Outbox stores it. Field history is populated by ORM hooks on @audited entities.
```

**P15 — Risk Classification and Change Gate Policy**

```
Risk levels:

low:       Reversible. No data loss possible. No capability changes. No external effects.
           Gate: CI passes. No additional approval.

medium:    Partially reversible. Affects module behavior. No capability changes. No external effects.
           Gate: CI passes. Peer review required.

high:      May be irreversible. Affects capabilities, data shape, or external integrations.
           Gate: CI passes. Architecture review. Gatekeeper APPROVAL_REQUIRED.

critical:  Irreversible or platform-wide effect. Capability grants. Migrations. External credential changes.
           Gate: CI passes. Architecture review. Gatekeeper STOP_FOR_REVIEW until platform architect approves.

Governor limits (module-level resource constraints):
  Maximum records returned per query: 1000 (default, configurable per route in manifest)
  Maximum API calls per single request: 10
  Maximum async job runtime: 300 seconds
  Maximum event payload size: 1MB
  Maximum file upload size: declared in manifest per upload route

These limits are defined in the Module Service/API Contract Standard.
Phase 5B load simulation determines whether these defaults are appropriate and may adjust them.
Phase 5A states the principle: limits are declared, not discovered.

Enforcement: Gatekeeper enforces by risk level. CI enforces governor limits via lint rules. ADR required for any change to governor limit defaults.
```

**P16 — Security, Secrets and Configuration Safety Policy**

```
Secret rules:
  No secret, credential, API key, or token appears in source code, manifests, or version control.
  No secret appears in log output, error messages, or API responses.
  Secrets are referenced by key. Platform injects value at runtime.
  Secret rotation does not require code changes.

Capability explosion prevention:
  A module may not declare capabilities outside its own namespace.
  A module may not grant capabilities to itself.
  Capability name collisions are rejected by Foundry on install.
  Maximum 100 capabilities per module.

Configuration safety:
  Configuration values that affect security behavior (auth, encryption, rate limits) require Gatekeeper approval to change.
  Configuration changes are audit events.

Session and token rules:
  Tokens are not exposed in normal operator UI.
  Advanced Diagnostics is the only surface where diagnostic token information may appear.
  Token expiry, refresh, and revocation are platform-managed, not module-managed.

Audit completeness rule:
  Every action that passes through Gatekeeper with ALLOW must produce an audit record.
  A missing audit record for a Gatekeeper-approved action is a platform bug, not a module issue.

Enforcement: Secrets manager. CI secret scanning on every PR. Gatekeeper for high-risk config changes. Access Core for capability boundaries.
```

**P17 — Observability, Health and SLO Policy**

```
Structured logging standard:
  Every API request produces a structured log entry:
    timestamp_utc, organization_id, actor_id, method, route, status_code,
    duration_ms, correlation_id, module_key (if module route)
  Log format: JSON.
  No PII in log fields unless data_classification is explicitly set.
  Log level: error and warn always. info for significant state changes. debug only in development.

Module health check standard:
  Every module must declare at least one health check in its manifest.
  Health check types: liveness (is the module running?) and readiness (can the module serve requests?).
  Health checks run on a platform-defined schedule.
  Health check failure sets module to degraded state — not disabled.

Health aggregation:
  GET /platform/health returns aggregated health of platform + all enabled modules.
  Response includes: platform_status, module_statuses[], overall_status.
  This endpoint is internal/admin only — not exposed to tenant operators.

SLO targets (Phase 5B load simulation confirms feasibility):
  Core API routes: p95 response time < 500ms under simulated load
  Search queries: p95 response time < 200ms
  Module install: p95 < 120 seconds
  Health check: p95 < 50ms

Outbox monitoring:
  Unprocessed event depth is monitored.
  Alert fires when unprocessed events exceed threshold (default: 1000 events or 5 minutes age).

Enforcement: Platform logging middleware. Foundry manages health check registration. CI performance gate on core routes.
```

**P18 — Testing, Certification and Promotion Policy**

```
A module reaches certified state after passing:
  Manifest schema validation: all required fields present and valid
  Dependency check: all declared dependencies are available
  Capability conflict check: no capability key collisions
  Migration safety check: no destructive migrations without pre-approval
  Screen contract validation: all registered screens have committed contracts
  Test suite: module test suite passes (unit + integration + tenant isolation negative tests)
  Security check: no secrets in code, no cross-tenant data access possible
  Performance gate: no unbounded queries, all routes paginated

CI requirements per module:
  pnpm typecheck passes
  pnpm lint passes
  pnpm test passes
  pnpm contracts:validate passes
  pnpm registry:check passes (no drift)
  pnpm prisma:validate passes (no schema drift)
  Cross-tenant negative tests pass (at least 3 negative tests per tenant-scoped API route)

Promotion ceremony:
  Certified → install: Gatekeeper ALLOW required
  Installed → enabled: Gatekeeper ALLOW required, health checks pass
  Enabled → deprecated: documented reason required, operator notification sent
  Deprecated → removed: data export completed or waived

Enforcement: Foundry enforces certification checklist. CI enforces test requirements. Gatekeeper enforces transition approval.
```

**P19 — Module UI, Accessibility and Noob-Proof UX Policy**

```
White-label compliance:
  No module may hardcode platform name, platform logo, platform color values, or any platform identity.
  All visual identity resolves from tenant configuration.
  Hardcoded platform identity is a policy violation that blocks certification.

Component usage:
  Modules must use platform-approved components for: tables, forms, buttons, inputs, modals, empty states, error states, loading states.
  Modules may extend components but may not override platform-defined interaction patterns.
  Raw UUIDs, internal IDs, actor IDs, token values, organization IDs must not appear in normal operator UI.
  Technical values may appear only in Advanced Diagnostics, clearly labeled as diagnostic data.

Noob-proof requirements:
  Every data surface has an empty state that explains what data will appear and how to create it.
  Every destructive action has a confirmation step with plain-language consequence description.
  Every error state shows a human-readable message and a recovery path.
  Every loading state shows a skeleton that matches the shape of the loaded content.
  Every form field has a visible label. No placeholder-only fields.

Accessibility baseline (WCAG 2.1 AA):
  Color contrast ratio: minimum 4.5:1 for normal text, 3:1 for large text.
  Every interactive element is keyboard-reachable.
  Every icon-only button has an aria-label.
  Form errors are announced to screen readers.
  Modals trap focus correctly and restore focus on close.

Configurable label compliance:
  Modules use label keys in code, never literal strings.
  Label resolution happens at render time through the tenant configuration service.
  A module that hardcodes display labels in JSX/TSX instead of using the label resolver fails certification.

Enforcement: Phase 5C design system enforces component usage. CI accessibility lint. Foundry certification checklist includes noob-proof review. Golden Module (Phase 6A) is the reference implementation.
```

**P20 — AI-Ready Module Governance Policy**

```
Every module that uses AI capabilities must declare them in its manifest under ai_declarations[].

AI capability declaration:
  capability_key          string    capability required to use this AI feature
  model_provider          string    which AI provider (platform routes — module does not call directly)
  prompt_key              string    registered prompt identifier (versioned)
  max_tokens_per_call     number    declared limit
  max_calls_per_user_day  number    declared limit
  data_classification     enum      what classification of data is sent to AI
  output_classification   enum      what classification AI output carries
  human_review_required   boolean   whether AI output requires human sign-off before action
  audit_ai_calls          boolean   always true for production AI features

AI call governance:
  Modules do not call AI providers directly.
  All AI calls go through the platform AI Proxy service.
  The AI Proxy records: prompt_key, token usage, organization_id, actor_id, model_provider, cost_estimate.
  Cost is attributed per tenant per module per day.
  A tenant exceeding cost thresholds triggers a platform alert.

Prohibited AI behaviors in modules:
  Calling AI providers directly (bypassing AI Proxy)
  Sending restricted or confidential data to AI without explicit declaration
  Using AI output to modify data without human_review_required = true for high-risk entities
  Storing AI-generated content as if it were human-authored in audit trails

AI output in audit trails:
  AI-generated content must be tagged: ai_generated: true in the relevant audit event.
  The prompt_key and model version must be recorded alongside AI-generated output.

Enforcement: AI Proxy enforces routing. Manifest validation checks ai_declarations. Foundry blocks install if ai_declarations are incomplete.
```

---

### 3.3 Phase 5A ADRs

**ADR-0015 — Tenant/RLS Enforcement Strategy**

Decision locked: Shared database, shared schema, organization_id on all tenant-scoped tables. DB-level RLS is evaluated as an optional enforcement layer on top of service-level isolation. ADR-0015 decides whether DB-level RLS is added in Phase 5B.

**ADR-0016 — Shell Base Capability**

Recommended default: Option A — introduce `platform.shell.access` capability seeded by Access Core for all valid authenticated sessions. ADR-0016 must formally decide the option and record its Phase 5B seeding requirements.

**ADR-0017 — Platform Versioning Baseline**

Recommended default: `platform.version.json` at repository root. Suggested content shape: `{ "platform_core_version": "1.0.0", "minimum_module_compatibility": "1.0.0", "released_at": "[decided by ADR-0017]" }`. ADR-0017 must formally decide the exact version value, release date, artifact path, and ownership.

**ADR-0018 — Module Registry Frontend API Boundary**

Decision: Formalizes `GET /platform/modules` and related registry endpoints. Aligns Phase 4B shell reads with Phase 5B Foundry writes.

---

### 3.4 Phase 5A Standards

**Event Schema Standard** — full three-tier field specification (see locked decision 1.10)

**Module Service/API Contract Standard:**
```
Route naming: /{module_key}/{resource}/{id?}
Response envelope:
  {
    "data": <payload>,
    "meta": { "organization_id": uuid, "timestamp_utc": string, "version": string },
    "pagination": { "page": number, "per_page": number, "total": number } | null,
    "error": null
  }
Error envelope:
  {
    "data": null,
    "error": { "code": string, "message": string, "field": string | null }
  }
Tenant check: organization_id extracted from trusted request context — not from request body
Capability check: declared in manifest, enforced by Access Core middleware
Governor limits: declared in manifest per route, enforced by platform middleware
```

**Workflow Process Definition Standard** — schema defined in locked decision 1.8

**Platform Service Contracts** — produced by P5A-014 (see ticket queue)

---

### 3.5 Updated Phase 5A Ticket Queue

Phase 5A is policy-heavy. Tickets are split by policy ownership, decision boundary, validation path, and source-of-truth artifact—not by fear of queue length. Ticket count is not a split condition. Stale, vague, overlapping, unsafe, or over-broad tickets are split conditions.

The revised Phase 5A queue uses approximately 55 tightly owned policy/ADR/standard tickets plus GATE. This is intentional: Phase 5A must produce unambiguous governance that Phase 5B can implement without guessing.

```
P5A-000   Baseline controls, current-state inventory, roadmap housekeeping

P5A-001a  Core Update & Platform Change Policy
P5A-001b  Module Definition & Ownership Policy

P5A-002a  Module Lifecycle State Policy
P5A-002b  Module Installation Policy
P5A-002c  Module Update / Upgrade Policy
P5A-002d  Module Disable & Uninstall Policy
P5A-002e  Module Rollback & Recovery Policy

P5A-003a  Capability, Permission & Access Model Policy
P5A-003b  Menu, Screen & Command Registration Policy
P5A-003c  Settings & Configuration Registration Policy
P5A-003d  Tenant Configuration & White-Label Governance Policy
P5A-003e  Configurable Labels, Localization & Display Override Policy
P5A-003f  Gatekeeper Preflight, Approval & STOP_FOR_REVIEW Policy

P5A-004a  Multi-Tenant Architecture Model
P5A-004b  Tenant Isolation / RLS Enforcement Strategy
P5A-004c  Migration & Schema Contribution Policy
P5A-004d  Cross-Module Data Access Policy

P5A-005a  Adapter & External Dependency Policy
P5A-005b  Secrets & Credential Management Policy
P5A-005c  Security Baseline & Configuration Safety Policy

P5A-006a  Event Schema Standard
P5A-006b  Evidence & Audit Package Policy
P5A-006c  Structured Logging & Observability Policy
P5A-006d  Health Checks, SLO & SLA Policy

P5A-007   Platform Versioning Baseline and Repo-Readable Artifact Decision
P5A-008   Shell Base Capability / Session-Gated Screen Contract ADR

P5A-009a  Module Registry Frontend API Boundary
P5A-009b  Module Service/API Contract Standard

P5A-010a  Notification & Communication Policy
P5A-010b  Background Job & Scheduler Policy
P5A-010c  Data Import & Export Policy
P5A-010d  Reporting & Read-Model Policy

P5A-011a  Module UI, Accessibility, Noob-Proof & White-Label UX Policy
P5A-011b  AI-Ready Module Governance Policy

P5A-012a  Platform Policy Index
P5A-012b  Gatekeeper Checklist Consolidation
P5A-012c  Phase 5B Input Consolidation

P5A-013a  Workflow Engine Core Service Architecture
P5A-013b  Search Architecture Decision
P5A-013c  Reporting / Read-Model Service Architecture
P5A-013d  File / Document Service Architecture
P5A-013e  AI Proxy / Governed AI Service Boundary
P5A-013f  Data Import / Export Service Architecture
P5A-013g  Tenant Configuration & Branding Service Architecture

P5A-014a  Tenant Configuration API Contract
P5A-014b  Branding, Domain & Label Resolution API Contract
P5A-014c  Workflow Process Definition Contract
P5A-014d  Search Service Contract
P5A-014e  File / Document Service Contract
P5A-014f  Reporting / Read-Model Query Contract
P5A-014g  Data Import / Export Service Contract
P5A-014h  AI Proxy Call Contract

P5A-015a  Golden Module Certification Specification

P5A-GATE  Policy review, final package, Phase 5B readiness handoff
```

Total: approximately mid-50s tightly owned policy/ADR/standard tickets + GATE. One Codex session. One PR. One human review gate remains the target model. Ticket count is not a split condition; stale, vague, overlapping, unsafe, or over-broad tickets are split conditions.

P5A-012c consolidates all Phase 5A outputs into structured Phase 5B implementation inputs. P5A-GATE produces the formal Phase 5B Readiness Handoff only after validating that the policy pack, index, checklist, and implementation inputs are consistent and complete.

P5A-015a specifies what the Golden Module must prove. The Phase 6 Module Certification Template is not a Phase 5A output; it is produced by Phase 6A after the Golden Module certification run proves the lifecycle.

**Split rationale:**
- P5A-001 split: core platform change authority and module ownership authority are related but not the same policy surface.
- P5A-002 split: lifecycle state, installation, update, disable/uninstall, and rollback/recovery each carry different Gatekeeper, evidence, validation, and recovery rules.
- P5A-003 split: capability/access, menu/screen/command registration, settings registration, tenant configuration/white-labeling, configurable labels/localization, and Gatekeeper preflight each require a single policy owner to avoid contradictions.
- P5A-004 split: multi-tenant architecture, RLS/isolation enforcement, migration contribution, and cross-module data access are separate decisions with different Phase 5B implementation impacts.
- P5A-005 split: adapter governance, secrets/credential management, and broader security/configuration safety have different risk models and Gatekeeper checks.
- P5A-006 split: event schema, audit/evidence packages, structured logging/observability, and health/SLO/SLA policy are different artifacts with different consumers.
- P5A-009 split: module registry frontend API and module service/API contract serve different runtime surfaces.
- P5A-010 split: notification/communication, background jobs/scheduler, import/export, and reporting/read-model policy are distinct platform services.
- P5A-011 split: UI/accessibility/white-label governance and AI-ready module governance are different control domains.
- P5A-012 split: policy index, Gatekeeper checklist, and Phase 5B input consolidation are separate control artifacts. P5A-GATE owns the formal Phase 5B readiness handoff after validation.
- P5A-013 split: each core service architecture decision gets its own ticket so Phase 5B service boundaries are not buried inside a broad “architecture” ticket.
- P5A-014 split: each platform service contract gets its own ticket so Phase 5B has clear contract ownership and no service-contract overlap.
- P5A-015 scope: Phase 5A owns the Golden Module certification specification only. The reusable Phase 6 module certification template is produced during Phase 6A after the Golden Module certification run proves the lifecycle.

**Policy/contract ownership rule:**
- If a service has a dedicated Phase 5A policy ticket, that ticket owns the policy and contract implications for that service.
- P5A-003f owns STOP_FOR_REVIEW and Gatekeeper policy. P5A-013 may consume this rule but must not redefine it.
- P5A-010a owns notification/communication policy and contract implications. P5A-014 must not duplicate notification contracts.
- P5A-003d owns tenant configuration and white-label governance. P5A-014a/014b own API/contract shape derived from that policy.
- P5A-003e owns configurable labels, localization, and display override rules. P5A-014b owns the runtime resolution contract derived from those rules.
- P5A-010c owns import/export policy. P5A-013f and P5A-014g own architecture and service-contract implications derived from that policy.
- P5A-010d owns reporting/read-model policy. P5A-013c and P5A-014f own architecture and service-contract implications derived from that policy.
- Current-user/profile surface is a Phase 5B auth/identity implementation surface, not a standalone Phase 5A platform-service contract.

**Key dependency highlights:**
- P5A-002b depends on P5A-002a: installation policy needs lifecycle states.
- P5A-002c depends on P5A-002a and P5A-002b: update/upgrade policy needs lifecycle and install baselines.
- P5A-002d depends on P5A-002a: disable/uninstall policy needs lifecycle states.
- P5A-002e depends on P5A-002b, P5A-002c, and P5A-002d: rollback/recovery must understand install, update, disable, and uninstall.
- P5A-003f depends on P5A-003a: Gatekeeper policy needs capability/access policy first.
- P5A-008 depends on P5A-003a and P5A-003b: shell capability ADR needs capability and screen/menu policy.
- P5A-003d depends on P5A-004a: tenant configuration/white-labeling depends on the tenant architecture model.
- P5A-003e depends on P5A-003c and P5A-003d: label/localization overrides depend on settings and tenant configuration.
- P5A-004b depends on P5A-004a: RLS enforcement requires tenant architecture decision.
- P5A-004c depends on P5A-004a and P5A-004b: migration policy needs tenant/RLS model.
- P5A-004d depends on P5A-004a and P5A-006a: cross-module data access needs tenant model and event schema.
- P5A-005b depends on P5A-005a where adapters require credentials.
- P5A-005c depends on P5A-005b for security controls involving secrets and configuration safety.
- P5A-006b depends on P5A-006a: evidence/audit packages depend on event schema.
- P5A-006c depends on P5A-006a: structured logging and observability use event/correlation vocabulary.
- P5A-006d depends on P5A-006c: health/SLO/SLA policy needs observability/logging fields.
- P5A-010d depends on P5A-006a and P5A-006b: reporting/read-model policy depends on event schema and evidence package.
- P5A-013a depends on P5A-003f and P5A-006a: workflow architecture depends on Gatekeeper and event schema.
- P5A-013b depends on P5A-004a: search architecture depends on tenant model.
- P5A-013c depends on P5A-006a and P5A-010d: reporting architecture depends on event schema and reporting policy.
- P5A-013f depends on P5A-010c: import/export architecture depends on import/export policy.
- P5A-013g depends on P5A-003d: tenant configuration/branding service architecture depends on white-label policy.
- P5A-014a depends on P5A-003d: tenant config API depends on tenant/white-label policy.
- P5A-014b depends on P5A-003d and P5A-003e: branding/domain/label resolution depends on white-label and display override policy.
- P5A-014c depends on P5A-013a: workflow contract depends on workflow architecture.
- P5A-014d depends on P5A-013b: search contract depends on search architecture.
- P5A-014e depends on P5A-013d: file/document contract depends on file/document service architecture.
- P5A-014f depends on P5A-013c: read-model query contract depends on reporting architecture.
- P5A-014g depends on P5A-013f: import/export contract depends on import/export architecture.
- P5A-014h depends on P5A-013e: AI proxy contract depends on AI proxy boundary.
- Phase 6A certification template depends on P5A-015a and the Phase 5A Gatekeeper checklist, but it is not a Phase 5A ticket output.


---

## Part 4: Phase 5B — Gatekeeper-Governed Module Foundry & Core Platform Completion

### 4.1 Purpose

Phase 5B builds every platform service that Phase 5A defined policies for. Phase 5B takes Phase 5A's decisions as inputs. No Phase 5B ticket invents an architectural decision — those are already locked in Phase 5A.

### 4.2 Acceptance Criteria

Phase 5B is complete when every one of the following is true:

```
Foundry proves install, enable, disable, and rollback through an internal minimal fixture or contract-level lifecycle harness only; full Golden Module certification is Phase 6A
platform.shell.access capability exists and seeded for valid authenticated sessions
GET /platform/access/me returns: display_name, organization display, session state, no raw tokens
platform.version.json is committed at repo root and Foundry reads it for compatibility checks
Tenant isolation passes cross-tenant negative tests at API boundary (not just service layer)
All existing Lead Desk and Engagement Gateway events carry Phase 5A envelope fields
Workflow Engine processes a test approval flow with timeout and escalation
File service stores and retrieves files with tenant-scoped paths and access control
Search returns results for a 10,000-record dataset within p95 < 200ms
Communication service sends a test email from tenant-configured sender identity
Tenant config service resolves branding in < 50ms from cache
AI Proxy routes a test call with cost attribution and audit record
CI covers: Foundry lifecycle, module manifest validation, security/tenant negative tests
Load simulation passes: 10,000 leads, 500 users, 50,000 audit entries — core routes within SLO
No Phase 6 module can install without passing the Phase 5A certification checklist
```

### 4.3 Phase 5B Scope Sections

| Section | Content | Estimated Tickets |
|---|---|---|
| Foundry Core | Install/enable/disable/rollback lifecycle, manifest validation, registry, preflight | 25 |
| Auth / Identity | platform.shell.access seeding, GET /platform/access/me, session state in shell | 15 |
| Tenant Configuration Service | Branding resolution, label overrides, domain resolution, caching | 10 |
| Communication Service | Email/SMS/WhatsApp provider abstraction, template versioning, delivery audit | 15 |
| File Service | Storage, tenant-scoped paths, access control, retention, virus scan integration | 15 |
| Search Service | PostgreSQL FTS baseline, GIN indexes, pgvector schema-ready, tenant isolation | 10 |
| Reporting Foundation | Event consumer, read model builder, report query API, CSV/Excel/PDF export | 20 |
| Workflow Engine | Core service, process definition validation, SLA, escalation, audit hooks | 20 |
| AI Proxy | Provider abstraction, cost attribution, prompt versioning, audit, tenant isolation | 10 |
| Database / API Hardening | Composite indexes, connection pooling, response envelope, governor limit enforcement | 15 |
| Deployment / Operational | Production pipeline, backup/restore, monitoring, runbook, health dashboard | 15 |
| CI Upgrade + Load Simulation | Manifest validation CI, tenant negative tests, load simulation 10K leads | 10 |
| SDK / Developer Experience | Module scaffolding, local dev environment, module test framework | 10 |
| GATE | Internal minimal fixture / contract-level lifecycle harness through Foundry — install, enable, workflow, disable, rollback. Full Golden Module certification remains Phase 6A. | 5 |

**Total: ~195 tickets. Target execution model: one continuous Codex queue, one implementation branch/PR, one Phase 5B human review gate.**

Ticket count alone is not a reason to split. The failure pattern is not long autonomous execution; the failure pattern is stale, shallow, under-specified, or non-predictive tickets.

If a ticket's `split_if` condition triggers, a hard stop appears, or scope expands beyond Phase 5B authority, the run pauses for human review/repair and resumes from an approved continuation point. This is exception handling, not the planned structure.

### 4.4 Phase 5B Internal Dependency Order

The following sections must be built in dependency order within Phase 5B. Tickets within each section may run in parallel if they touch separate files.

```
Tier 1 — Core platform prerequisites
  Tenant configuration service
  Platform version artifact
  Auth / identity and current-user profile surface
  Base capability model and shell access resolution
  Database/API hardening foundations that other tiers depend on

Tier 2 — Gatekeeper-governed Foundry runtime
  Module lifecycle runtime
  Manifest validation
  Install / enable / disable / update / rollback
  Capability seeding
  Registry writes
  Evidence package generation

Tier 3 — Core platform services
  Workflow engine
  Communication service architecture
  File/document service
  PostgreSQL FTS search baseline
  Reporting/read-model foundation
  AI proxy baseline where approved by Phase 5A boundaries

Tier 4 — Security, tenant, performance, observability
  Tenant enforcement baseline
  Audit completeness checks
  Structured logging
  Connection pooling
  Indexing strategy
  Governor/response-size limits
  Load simulation and performance baseline

Tier 5 — Operational/CI hardening and final gate
  CI ladder upgrade
  Module certification gates
  Developer/SDK guidance
  Final audit
  Merge readiness
  Foundry lifecycle proof through internal minimal fixture / contract-level harness
```

This tier model is ordering context, not artificial phase splitting. Phase 5B remains one strategic implementation phase unless `split_if` or a hard stop requires a human-reviewed continuation.

---

## Part 5: Phase 5C — Frontend Excellence & UI Platform Maturity

### 5.1 Purpose

Phase 5C builds the pixel-perfect, production-grade frontend shell and component library after Phase 5B platform contracts are locked and merged. Preparatory design specification work may happen before Phase 5C execution, but Phase 5C ticket execution does not run in parallel with Phase 5B.

### 5.2 Design Specification Prerequisite

Phase 5C ticket creation cannot begin until a design specification document is committed to the repository. This document must contain:

```
Color system:     Every token with exact hex value
                  Semantic tokens: --color-primary, --color-surface, --color-border,
                  --color-success, --color-warning, --color-error, --color-info
                  All values must be CSS custom properties (variables), never hardcoded

Typography:       Font family decision
                  Scale: display / h1 / h2 / h3 / h4 / body-lg / body / body-sm / caption / code
                  Exact values: font-size (px), font-weight, line-height, letter-spacing

Spacing system:   Base unit (4px or 8px — must decide)
                  Named scale: --space-1 through --space-16
                  Component padding/margin rules

Motion:           Duration tokens: --duration-fast / --duration-base / --duration-slow
                  Easing tokens: --ease-in / --ease-out / --ease-in-out / --ease-spring
                  What animates: sidebar collapse, command palette, toasts, page transitions
                  What does not animate: data table rows, form inputs, status badges

Component inventory: Complete list of every component to build with all required states:
                  default / hover / focus / active / disabled / loading / error / success

Shell layout:     Exact sidebar width (collapsed and expanded, px values)
                  Exact top bar height (px)
                  Content area max-width (px)
                  Mobile breakpoints (px values)
                  Bottom nav bar height on mobile (px)

Module UI contract: Exact padding for module screen container (px values)
                    Max-width for module content
                    Header pattern for module screens
                    Back navigation standard

Dark mode:        Yes or No. If Yes: full token system required before Phase 5C starts.
```

### 5.3 Phase 5C Scope

**Part 1 — Design System and Component Foundation (no Foundry dependency):**

This work may be specified during Phase 5B, but Phase 5C ticket execution begins only after Phase 5B is merged and approved.
```
Full token system implementation (CSS custom properties)
Every component built with all states
Storybook — every component documented with all states and usage rules
Accessibility: WCAG 2.1 AA verified across all components
Localisation infrastructure: no hardcoded strings, date/number formatting utilities
Performance: bundle size baseline measured, per-module budget set in CI
Visual regression baseline: screenshot baseline established
```

**Part 2 (requires Phase 5B complete):**
```
Shell integration with live Foundry module registrations
Command palette v2: fuzzy search, module-registered commands, keyboard navigation
User menu: real data from GET /platform/access/me
Dashboard: real Foundry module health status, real registered widgets
Settings: real registered module settings, real tenant configuration
Notification center: real notification infrastructure connected
White-label shell: branding resolves from tenant config service
Mobile excellence: all breakpoints tested, touch interactions complete
Visual regression suite: all routes captured and compared in CI
Module UI integration standard: exact spec locked for Phase 6 modules
Module UI certification checklist: what every Phase 6 module UI must pass
```

---

## Part 6: Phase 6A — Golden Module Certification

### 6.1 Purpose

Phase 6A installs a purpose-built certification module through the full Foundry lifecycle. This module is not a real business module. It is designed to exercise every platform capability. Successful Phase 6A produces the Module Certification Template used by every Phase 6B+ module.

### 6.2 Golden Module Specification (produced by P5A-015)

The complete specification for the Golden Module is produced in Phase 5A ticket P5A-015. It includes:

```
module_key            demo.platform_certification
version               1.0.0
min_platform_version  1.0.0

Declares:
  5 capabilities (low, medium, high, critical risk each)
  2 menu entries (one capability-gated, one visible to all)
  1 dashboard widget
  1 settings section with 3 configurable fields
  3 event types (one compliance-class)
  1 health check (liveness)
  1 database migration (adds 2 tables, both tenant-scoped)
  1 workflow definition (2-step approval with timeout escalation)
  1 file upload endpoint
  1 search-indexed entity
  1 AI-declared feature (disabled by default)

Proves:
  Manifest validation passes
  Foundry install completes (all 9 steps)
  Capabilities seeded and verified in Access Core
  Menu entries visible in Mission Control
  Dashboard widget renders
  Settings section renders with tenant label overrides
  Events emitted with correct Tier 1 + Tier 2 fields
  Compliance-class event has all fields
  Health check passes
  Migration applied successfully
  Workflow approval flow completes with timeout test
  File uploaded and retrieved with tenant isolation
  Search returns results within SLO
  Foundry disable completes (menu removed, routes return 503)
  Foundry rollback completes (migration reversed, capabilities removed)
  White-label mode respected throughout
  Cross-tenant negative tests pass for all module endpoints
  All Phase 5A certification checklist items checked
```

### 6.3 Phase 6A Output

```
Completed Phase 6A audit report
Module Certification Template — the checklist every Phase 6B+ module must satisfy
Phase 6B readiness handoff
```

---

## Part 7: Ticket Quality Standard

### 7.1 Required Fields — Every Ticket

Every ticket must contain all of the following. A ticket missing any field is incomplete and must not be committed to the ticket pack.

| Field | Purpose | Failure if missing |
|---|---|---|
| ticket_id | Identity | Queue management fails |
| title | Short description | Cannot track progress |
| type | Classification | Wrong execution context |
| priority | Ordering | Wrong execution order |
| objective | Why this ticket exists | Cannot evaluate correctness |
| scope | What is included | Scope creep or under-delivery |
| non_scope | What is excluded | Codex invents excluded work |
| source_files_to_inspect | What to read before editing | Discovery during execution |
| files_expected_to_change | Exact file plan | Unexpected file changes |
| files_forbidden_to_change | Hard boundaries | Phase regression |
| minimum_concrete_requirement | Observable runtime/artifact/evidence outcome | Minimum viable compliance |
| acceptance_criteria | Proof the ticket is done | Ambiguous completion |
| validation_commands | Exact commands to run | No self-verification |
| stop_conditions | When to stop and report | Codex runs too far |
| dependencies | Valid earlier ticket IDs | Out-of-order execution |
| stale_ticket_risk_notes | What could make this stale | Mid-run discovery |
| runtime_consistency_chain | What must remain consistent | Phase regression |
| split_if | Concrete split trigger | Oversized ticket |
| requires_human_approval_if | When to wait for human | Scope overrun |
| failure_classification | blocker / warning / info | Ambiguous failure |
| commit_message | Atomic commit message | Unclear history |
| rollback_notes | How to recover | No recovery path |
| exact_file_plan_required | true | Implicit scope |
| broad_globs_are_inspection_hints_only | true | Glob treated as scope |

### 7.2 Additional Fields for Decision/Policy Tickets

| Field | Purpose |
|---|---|
| decision_options | Named options with pros and cons — not "Option A/B" |
| selection_criteria | What governs the choice |
| decision_output_path | File path where the decision is recorded |

### 7.3 Minimum Concrete Requirement Standard

The MCR must name one of:
- A runtime behavior that can be observed (e.g. "route returns 200 with tenant-scoped data")
- A validation command that passes (e.g. "pnpm contracts:validate passes")
- An artifact that exists and is correct (e.g. "platform.version.json exists and parses")
- A UI state visible in a browser (e.g. "module appears in Mission Control after enable")
- A negative test that passes (e.g. "cross-tenant request returns 401")

**"Documentation updated" is never an acceptable MCR for an implementation ticket.**

---

## Part 8: Stop Conditions

### 8.1 Phase 5A Stop Conditions

```
Any policy that cannot name its enforcement point
Any ADR that does not choose between specific options
Any runtime Foundry or module installer implementation appearing
Any policy that contradicts module-manifest.schema.ts without explicit superseding ADR
Any Zod / schema / Prisma change without explicit ticket approval and exact-file scope
Any platform identity hardcoded in a tenant-facing component
Any event type missing required Tier 1 fields
Any capability declared without a namespace prefix
```

### 8.2 Phase 5B Stop Conditions

```
Any business domain logic (Admissions, HR, Finance, LMS, Hospital, FMCG) appearing in platform code
Any destructive migration without Gatekeeper pre-approval
Any production secret or credential committed to the repository
Any module that installs outside the Foundry 9-step lifecycle
Any API route without organization_id filter
Any capability seeded without Access Core registration
Any event emitted without organization_id
Any file stored without tenant-scoped path
Foundry GATE test fails — module does not complete full lifecycle
```

### 8.3 Phase 5C Stop Conditions

```
Phase 5C Part 2 starts before Phase 5B PR is merged and approved
Any hardcoded color value (must be CSS custom property)
Any hardcoded platform name in tenant-facing component
Any component built without all required states
Any interactive element unreachable by keyboard
Visual regression test fails with unexplained diff
Module UI integration contract not locked before first Phase 6 module begins
```

---

## Part 9: Current Repo State

| Phase | Status | Notes |
|---|---|---|
| Phase 0–3 | Complete | ADRs 0001–0014, Access Core, Hierarchy, Gatekeeper, Audit, Outbox, Lead Desk |
| Phase 4 | Complete | Operational proof, runbook, backup |
| Phase 4A | Complete | Local demo stabilization |
| Phase 4B | Complete — merged to main at f7f637d9546e3e77983811488f8c643e0b0e02d6; implementation branch source head d4e9ef1 | Mission Control shell, command palette, design system baseline |
| Phase 5A control docs | PR #10 open | Initial Phase 5A control docs exist; the ticket pack must be replaced/expanded from this strategic reference before execution. Target queue: P5A-000 through P5A-GATE — 54 policy/ADR/standard tickets + GATE. |
| Phase 5B | Next after Phase 5A approved | ~195 tickets |
| Phase 5C | After Phase 5B + design spec | ~180 tickets |
| Phase 6A | After Phase 5B + 5C | Golden Module certification |
| Phase 6B+ | After Phase 6A | Never-ending |

---

*End of AKTI ERP Phase 5 Strategic Reference v2*
