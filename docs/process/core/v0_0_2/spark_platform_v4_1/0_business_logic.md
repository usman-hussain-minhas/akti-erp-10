# Spark Platform v4 — Global Business Logic

**Status:** `V4_BUSINESS_LOGIC_LOCKED_FOR_PHASE_DOCUMENTS`  
**Scope:** This document defines product, commercial, operational, activation, billing, evidence, configuration, customer-protection, identity, and dependency rules for Spark Platform v4.  
**Non-scope:** This document intentionally avoids implementation file paths, API endpoint paths, validation commands, repo instructions, code snippets, and deployment procedures.

> **Dependency rule:** Anything in phase N+1 MUST NOT be developed before phase N. Within a phase, a component may depend only on earlier phases or earlier-numbered components in the same phase. If a feature needs a later dependency, the dependency must be moved earlier, the feature must be split, or the dependent part must be deferred.

## 1. Source Authority and Precedence

LOCKED: The v4 document set uses this authority stack:

1. **`0_Business_Logic.md`** — business rules, commercial logic, hard rules, configurability, customer-protection, identity, activation, evidence, billing, and dependency law.
2. **Spark Platform Spec v3** — feature depth and phase grouping, valid only where it does not conflict with this document.
3. **`spark_plan_v2.md`** — historical dependency map and feature source, valid only where it does not conflict with v4 business logic or v3 feature grouping.

LOCKED: Where these sources conflict, the higher source wins. Silence in this document is not deletion: valid v2/v3 feature depth remains usable unless contradicted by v4 rules.

LOCKED: Every phase document MUST state that it conforms to this business logic document. Every phase document MUST include a forward dependency check.

## 2. Platform Identity and Commercial Model

### 2.1 Platform-neutral product identity

LOCKED: Platform-owned code, default copy, seed data, default configuration, default industry packages, internal labels, service descriptions, pricing defaults, templates, and examples MUST be platform-neutral.

LOCKED: No operator-specific references may appear in platform-owned code, platform-owned copy, platform-owned seed data, or platform-owned default configuration.

LOCKED: Tenant-authored business content may contain tenant-specific names and branding. This includes organisation names, branch names, tenant website pages, invoices, certificates, campaigns, portals, forms, email copy, WhatsApp campaign copy, learning content, and public-facing business pages.

LOCKED: Tenant-authored branding MUST NOT remove or obscure required platform identity where the business model mandates it. Required platform identity may include a “Powered by Spark Platform” line, copyright line, platform mark, or other mandated attribution.

LOCKED: Tenant branding is allowed. White-label removal of platform identity is forbidden.

### 2.2 Distribution model

LOCKED: Platform team and authorised partners may sell subscriptions under their own commercial brand, but the end-user sees Spark Platform’s UI and required platform identity.

LOCKED: Authorised partners sell; they do not redefine platform packages, service boundaries, dependency rules, pricing architecture, or hard rules.

LOCKED: “We are a tenant on our own platform” is a product-quality rule. The platform team uses the Tenant Frontend for its own business operations. Super Admin may grant the platform team’s own tenant early-access/unpublished services at zero price for validation.

### 2.3 No white-label

LOCKED: Tenants may customise their own organisation branding and customer-facing content, but they cannot make Spark Platform appear to be a fully separate tenant-owned product.

LOCKED: No tenant configuration, partner configuration, industry configuration, theme, website setting, invoice template, certificate template, app builder setting, or campaign builder setting may fully remove mandated platform identity.

## 3. Hard Rules — Immutable Without ADR

The following rules are hard rules. They cannot be changed through Super Admin UI, tenant settings, industry configuration, environment variables, partner agreements, or implementation shortcuts. Any change requires an approved Architecture Decision Record and a platform upgrade.

### 3.1 Platform identity and architecture

| Rule | Rationale |
| --- | --- |
| Platform-owned code, default copy, seed data, and default configuration MUST be platform-neutral. | Protects single product identity and prevents hidden white-label forks. |
| There are exactly two frontends: Super Admin Frontend and Tenant Frontend. | Separates technical control plane from business operations. |
| Super Admin is a technical control plane only; business operations happen only in Tenant Frontend. | Prevents privilege mixing and operational confusion. |
| Services are the unit of architecture. Modules are labels for UI grouping, marketplace presentation, and billing rollup. | Enables independent deployability, versioning, dependency checks, and granular billing. |
| Foundry is the single source of truth for activation state. | Prevents frontend/backend desynchronisation and billing errors. |
| Frontend MUST NOT cache activation state as truth. | Activation state is backend-confirmed only. |
| Dependency arrow is one-way: service → core. Core platform systems never import from services. | Keeps core stable and prevents circular dependencies. |
| Every service requires a manifest with required fields. | Enables discovery, dependency resolution, billing, audit, and governance. |


### 3.2 Transaction and data integrity

| Rule | Rationale |
| --- | --- |
| Cross-module and cross-service transactions use Saga pattern; no distributed two-phase commit. | Scalability, fault tolerance, and clear compensation behavior. |
| Event bus delivers at least once; every consumer MUST be idempotent. | Exactly-once is not assumed; duplicate-safe consumers are mandatory. |
| All write APIs require idempotency. | Prevents duplicate charges, duplicate records, duplicate actions, and duplicate workflows. |
| Default idempotency deduplication window is 24 hours. | Provides safe retry behavior for ordinary writes. |
| Payment and webhook idempotency are keyed on provider event/transaction identity and have no fixed expiry within reconciliation periods. | Financial and provider retries may arrive days later. |
| Invoices are immutable after issue. | Preserves legal and accounting integrity. |
| Price changes use effective date ranges; past usage is billed at the old price. | Prevents retroactive billing mutation. |
| Operational soft delete and staged permanent deletion are distinct mechanisms. | Protects customers while supporting compliance deletion. |


### 3.3 Security and identity

| Rule | Rationale |
| --- | --- |
| No default credentials. | First-run setup must create the admin account securely. |
| MFA required for Super Admin, Billing Authority, and financial capability holders. | Protects high-risk functions. |
| Super Admin sees tenant business data only through an authorised, time-bound, audited support window. | Protects tenant privacy. |
| Super Admin and Tenant Frontend sessions are separate contexts. | A person with both accounts does not carry one privilege into the other. |
| A support window is explicit, permission-scoped, visible to tenant admin, and audited. | Makes exceptional access accountable. |


### 3.4 Billing and evidence

| Rule | Rationale |
| --- | --- |
| Pricing attaches at micro-service level and rolls up to service, module, and organisation bill. | Enables granular billing and optimization. |
| Every micro-service has a price reference; zero price is allowed. | Supports free features, trials, and future pricing. |
| Every micro-service emits usage evidence, including zero-priced micro-services. | Supports analytics, optimization, billing evolution, and AI evidence. |
| Billing evidence is append-only. | Protects billing integrity. |
| Prepaid balance is the source of truth for available funds. | Clarifies financial availability. |
| Budget caps are customer-defined limits layered over prepaid balance. | Separates real funds from self-imposed spending control. |


### 3.5 Customer-first protection

| Rule | Rationale |
| --- | --- |
| Two-phase uninstall is immutable: deactivate first, purge second. | Data survives service deactivation and can be restored. |
| Deactivate is reversible and preserves data. | Prevents accidental business loss. |
| Purge is Super Admin only, irreversible after countdown, and requires double confirmation. | Protects against irreversible mistakes. |
| Default platform minimum purge countdown is 30 days. | Gives recovery time by default. |
| Organisations may extend the purge window but may not reduce it below platform minimum unless legal erasure requires faster deletion. | Protects customers while allowing legal compliance. |
| Soft-delete restore within protection window is always free. | Never punish accidental deletion. |
| Reminders before purge and long-term deleted-data reminders are mandatory as mechanisms, though schedules are configurable. | Ensures customer awareness. |
| Human approval is required for irreversible actions. | Prevents silent destructive automation. |


### 3.6 25-year engineering principles

LOCKED: The following principles govern all architecture, product decisions, service decomposition, phase planning, and ticket generation:

- Additive only.
- Pricing at the leaf.
- Evidence-driven.
- No hardcoded service knowledge.
- Customer data outlives services.
- Industry configuration is additive.
- Audit retention over feature richness.
- Tenant trust over platform convenience.
- Graceful degradation over feature failure.
- Reversible by default.
- Human approval for irreversible actions.
- Configuration over hardcoding.
- Dependency transparency everywhere.
- Supportability before automation.

## 4. Configuration Doctrine — Everything Else Is Data-Driven

LOCKED: Any behaviour that could reasonably vary between operators MUST be implemented as data, not hardcoded logic.

LOCKED: Configuration applies to **instances of registered capabilities**. New capability types require extension registration. The core engine does not invent new execution behavior from plain text.

LOCKED: Super Admin can configure instances of registered types at runtime. If a new type family requires new storage, rendering, validation, indexing, measurement, security, or execution behavior, it must be provided by a registered extension with a manifest.

### 4.1 Configurable domains

| Configurable domain | Examples / rule |
| --- | --- |
| Industry tree | Add, archive, reorder, rename, describe, and delete industries, sub-industries, and business types under locked deletion rules. |
| Tax and compliance packs | GST, VAT, WHT, retention periods, regional invoice fields, rounding policies, registration formats. |
| Discount stacking order | Data-driven order of product discount, coupon, volume, tax, loyalty, or other registered discount types. |
| Roles and capability bundles | Users compose roles from registered service capabilities; they cannot invent executable capabilities. |
| Onboarding checklist steps | Add, remove, reorder, localise, or specialise checklist steps. |
| Default service packages | Quick Start, Recommended, Full Power contents by business type. |
| Workflow instances | Tenants configure workflows from registered triggers, conditions, and actions. |
| Custom field instances | Fields are configured from registered field types. New field type definitions require extension registration. |
| Billing dimensions | Dimensions are defined by formula/measurement registry entries plus measurement sources. |
| Notification quiet hours | Per-user and per-organisation schedules. |
| Webhook retry schedules | Backoff parameters, maximum attempts, alert thresholds. |
| Opt-out reminder schedules | Reminder frequency and copy; existence of opt-out enforcement remains hard. |
| UI labels and help text | Externalised strings overrideable per organisation where allowed. |
| Default configuration packages | Industry/business-type package contents. |
| Regional compliance settings | Invoice retention, tax registration formats, required document fields. |


### 4.2 Registry and extension boundaries

LOCKED: Roles and bundles are composition, not invention. Low-level capabilities are declared by service manifests.

LOCKED: Workflow triggers, conditions, and actions are discovered from service and extension registries. Tenants and the AI wizard may compose workflows only from registered capabilities.

LOCKED: Custom field instances are configurable. New field type definitions are registry-driven. Field types requiring new storage, rendering, validation, indexing, search behavior, security behavior, or retention behavior require a registered extension.

LOCKED: Billing dimensions use a formula/measurement registry. A billing dimension declares unit name, measurement source, aggregation rule, pricing formula, rounding rule, and evidence requirements. Adding a dimension that uses an existing measurement source requires a registry entry; adding a dimension with a new source requires a measurement extension.

## 5. Service-First Architecture

### 5.1 Vocabulary

| Term | Definition | Tenant-toggleable? | Marketplace-visible? |
| --- | --- | --- | --- |
| Core platform system | Non-marketplace system required for platform operation. v4 core systems include Foundry, Gatekeeper, Audit Log, Event Bus, Communication Gateway, Billing Engine, Configuration Engine, Identity Graph, API Gateway, Search/File Service Layer, Non-AI Optimization Foundation, and AI Proxy. | No | No |
| Module | Label/category for UI grouping, marketplace presentation, and billing rollup. Not a deployable code unit. | No, except module-level group toggle mapped through Foundry to services | Yes |
| Service | Smallest independently meaningful, manifest-declared, versioned, installable/activatable capability. | Yes, unless core-only/internal | Yes if tenant-facing |
| Core micro-service | Part of a service required for that service to function meaningfully. | No, follows parent service | Visible as included part of service |
| Optional micro-service | Independently toggleable/additive capability that enhances a parent service. | Yes | Yes |
| Extension | Manifest-declared registered type/capability provider used to add new field types, workflow actions, billing measurement sources, integrations, or UI exposure. | Depends on extension | Depends on extension |


### 5.2 Modules as labels

LOCKED: A module is not a deployable unit. “CRM,” “Finance,” “LMS,” “Campaigns,” and “E-Commerce” are category labels for presentation and rollup.

LOCKED: A service has exactly one primary module for ownership and billing rollup, but may be surfaced under multiple modules for presentation when useful.

### 5.3 Services as architecture units

LOCKED: A service is defined by independent deployability and independent meaning. If two capabilities are always deployed, versioned, activated, and released together, they are not separate services.

LOCKED: Every service has a manifest. At minimum, the manifest declares:

- immutable service identifier;
- service name and description;
- primary module/category;
- service version;
- maximum tenant versions back for rollback;
- hard dependencies;
- soft dependencies;
- owned data domains;
- emitted events;
- consumed events;
- public service interface concept;
- capabilities granted;
- core micro-services;
- optional micro-services;
- billing dimension references;
- price references;
- frontend exposure enumeration;
- frontend chunk reference, including placeholder/empty chunk for backend-only services;
- activation rules;
- deactivation rules;
- audit requirements;
- evidence requirements;
- AI-readable/prohibited declarations where relevant.

### 5.4 Frontend exposure enumeration

LOCKED: Every service manifest declares frontend exposure as one of:

| Value | Meaning |
| --- | --- |
| tenant_ui | Service exposes UI in Tenant Frontend. |
| super_admin_ui | Service exposes UI in Super Admin Frontend. |
| both | Service exposes separate, scoped UI surfaces in both frontends. |
| none | Backend-only service; manifest still includes a placeholder or empty frontend chunk reference for uniformity. |


### 5.5 Core and optional micro-services

LOCKED: Core micro-services are declared inside the parent service manifest unless independently billable/versioned/deployable. They are not independently tenant-toggleable.

LOCKED: Optional micro-services that are independently toggleable, independently billable, or independently versioned receive their own manifest.

LOCKED: Billability and toggleability are independent. A core micro-service can emit billable usage evidence even when it cannot be toggled separately.

LOCKED: Every optional micro-service has its own price reference, even if the price is zero.

### 5.6 Promotion of micro-service to service

LOCKED: A micro-service may be promoted to a full service when it becomes independently meaningful and independently deployable. Promotion is additive.

LOCKED: Existing tenants get the promoted service automatically if they previously had the parent capability. Their previous configuration is preserved. Effective pricing is grandfathered until they actively change plan/configuration. Migration is automatic and non-disruptive.

## 6. Foundry Runtime Authority

LOCKED: Foundry is the single runtime authority for activation state and service lifecycle.

LOCKED: Foundry controls:

- activation;
- deactivation;
- dependency resolution;
- install order;
- uninstall/deactivation rules;
- version pinning;
- upgrade and rollback;
- service manifest registration;
- event subscription registration;
- route/interface registration conceptually;
- frontend chunk availability;
- capability registration;
- pricing reference registration;
- audit logging;
- evidence emission.

### 6.1 Activation state rule

LOCKED: Activation state exists only in Foundry backend registry. The frontend has no independent activation truth.

Activation toggle flow:

1. User clicks toggle.
2. UI enters pending state.
3. Backend/Foundry evaluates permission, dependencies, budget/prepaid rules, version state, and activation impact.
4. Backend updates activation state if allowed.
5. Backend returns confirmed state.
6. UI updates only from confirmed backend response.
7. If call fails, UI reverts to prior confirmed state.
8. If call is slow, UI remains pending.

LOCKED: No optimistic activation is allowed.

### 6.2 Module/service toggle behavior

LOCKED: Module-level toggle maps to service-level state through Foundry.

- Module OFF deactivates all services and optional micro-services inside the module, while preserving the previous configuration.
- Module ON restores the previous service and optional micro-service configuration, not a default package.
- Service OFF deactivates its core and optional micro-services.
- Service ON restores previous optional micro-service configuration.
- Core micro-services follow the parent service.

### 6.3 Dependency blocking

LOCKED: If another active service has a hard dependency on the service being disabled, Foundry blocks deactivation and shows the dependency chain.

LOCKED: Required dependency cycles are installation errors. Optional dependency cycles are warnings and proceed with degraded behavior.

### 6.4 Versioning and deprecation

LOCKED: Tenants are pinned to major service versions until they explicitly upgrade.

LOCKED: Minor/patch upgrades auto-apply unless tenant explicitly opts out.

LOCKED: Major upgrades require tenant action, migration guidance, and a 12-month EOL notice. Rollback is allowed only within the service’s `max_tenant_versions_back` rule.

### 6.5 Two-phase uninstall

LOCKED: Phase 1 = deactivate. Capabilities revoked, routes/interfaces unavailable, jobs paused, data preserved, reversible.

LOCKED: Phase 2 = purge. Super Admin only, staged countdown, double confirmation, impact assessment, irreversible after countdown, audit retained.

## 7. Two-Frontend Separation

### 7.1 Super Admin Frontend

LOCKED: Super Admin Frontend is the technical control plane. It is used by platform support, platform engineering, auditors, testers, and authorised platform administrators.

Super Admin may manage:

- tenants;
- tenant utilisation and cost monitoring;
- service catalog;
- service versions;
- global feature rollout;
- support windows;
- industry tree;
- compliance packs;
- default configuration packages;
- pricing tables;
- extension registries;
- system health;
- platform diagnostics;
- global audit and evidence monitoring.

LOCKED: Business operations do not happen in Super Admin.

### 7.2 Tenant Frontend

LOCKED: Tenant Frontend is the single operational entry point for tenant users and tenant business operations.

Tenant Frontend includes:

- tenant administration;
- user management;
- service activation view;
- billing and optimization;
- role configuration;
- industry package selection;
- business services;
- tenant-owned content and customer-facing surfaces.

LOCKED: The platform team’s own company also uses Tenant Frontend for its own operations.

### 7.3 Dual-account humans

LOCKED: The same human may have Super Admin and Tenant Frontend accounts, but they are separate session contexts with separate permissions. Privilege does not transfer across contexts.

### 7.4 Authorised support window

LOCKED: Super Admin may access tenant business data only through an authorised support window. The support window is explicit, time-bound, permission-scoped, audited, and visible to tenant admin.

## 8. Person / Identity Graph and Global Opt-Out

### 8.1 Person / Identity Graph

LOCKED: Person / Identity Graph is a 6A core platform foundation. It provides a shared identity anchor `person_id` used by CRM leads/contacts, LMS students, HR employees, Finance customers/vendors, Events attendees, Campaign recipients, parents/guardians, and other role-specific records.

LOCKED: The Person record is owned by platform core. Modules own role-specific extensions linked to Person.

The identity graph supports:

- contact value resolution;
- duplicate detection keys;
- consent records;
- opt-out enforcement;
- cross-module identity linking;
- merge/split evidence;
- role-specific profile links;
- AI context boundaries in later phases.

### 8.2 Global opt-out registry

LOCKED: Global opt-out registry is enforced at Communication Gateway before outbound messaging.

Covered channels:

- WhatsApp;
- email;
- SMS;
- push notifications;
- marketing/promotional in-app notifications.

LOCKED: System, security, billing, legal, and transactional notifications are mandatory and cannot be opted out when required for service operation or legal/compliance reasons.

### 8.3 Opt-out identity and resolution order

LOCKED: Opt-out is enforced at `person_id + contact_value + channel` scope.

Resolution order:

1. If contact value is linked to a person, enforce opt-out for `person_id + contact_value + channel`.
2. If contact value is not linked, store opt-out against `raw_contact_value + channel` with `person_id = NULL`.
3. When the raw contact value is later linked to a Person, retroactively attach the opt-out to that Person.
4. Preserve contact-value-specific scope.
5. Opt-out on one phone number or email does not automatically block all other contact values of the same person.

LOCKED: Re-opt-in requires explicit consent or tenant-admin restoration with recorded consent basis. Every re-opt-in is audited.

LOCKED: No module may bypass the Communication Gateway for outbound communication.

## 9. Idempotency and Webhook Deduplication

### 9.1 Write API idempotency

LOCKED: All write APIs require idempotency. Read APIs are exempt.

Applies to:

- tenant-facing writes;
- public API writes;
- internal service writes;
- workflow actions;
- payment callbacks;
- inbound webhooks;
- event consumers;
- Saga steps and compensation actions.

LOCKED: Default write idempotency window is 24 hours. Duplicate request inside the window returns the original response without re-executing.

### 9.2 Payment and webhook idempotency

LOCKED: Payment and third-party webhook idempotency use provider/source identity.

Provider event/transaction ID wins. If absent, create a canonical hash from stable webhook content + provider/source identity + relevant transaction reference. Receipt time is stored as audit metadata but never included in the deduplication key.

LOCKED: If no stable fields exist, reject the webhook with `400 Bad Request` and require the provider to retry with an idempotency-bearing format.

LOCKED: Payment/webhook deduplication has no fixed expiry within reconciliation periods.

## 10. Events, Outbox, Audit, and Saga

LOCKED: Spark Platform is not full event-sourced by default. It uses normal database records plus transactional outbox, event history, audit log, evidence stream, and Saga coordination.

### 10.1 Event requirements

Every event MUST include conceptually:

- event ID;
- tenant/organisation ID;
- service ID;
- schema version;
- actor;
- timestamp;
- correlation ID;
- payload;
- audit reference.

LOCKED: Event schemas are additive and versioned. Consumers are tolerant readers. Unknown fields do not break consumers.

### 10.2 Saga pattern

LOCKED: Cross-service/module workflows use Saga pattern with compensation, not distributed two-phase commit.

Confirmed Saga examples:

- CRM lead won → invoice generated → payment verified → LMS enrollment created.
- E-commerce order → payment → inventory reservation → fulfillment.
- Event registration → ticket invoice → payment → QR ticket issued.
- HR offboarding → final settlement → asset recovery → access revoked.
- Service activation → dependencies installed → migrations/config contribution → capabilities → billing evidence.

LOCKED: Workflows wholly inside one service boundary use local transactions, not Saga.

LOCKED: Failed Saga compensation goes to Dead Letter Queue and raises admin alert.

## 11. Industry Configuration System

### 11.1 Runtime industry tree

LOCKED: Industry tree is data, not code. Industries, sub-industries, and business types are stored in configuration data and managed through Super Admin.

Super Admin can:

- add an industry;
- add a sub-industry under an industry;
- add a business type leaf under a sub-industry;
- archive any node;
- delete a node only when no active dependencies remain;
- reorder siblings;
- edit labels and descriptions;
- view impact assessment;
- reassign affected tenants before deletion.

LOCKED: No code change or ADR is required to add, remove, rename, reorder, or describe industry-tree nodes. The platform reads the tree at runtime.

### 11.2 Archive and delete behavior

LOCKED: Archive hides the node from new onboarding but preserves existing tenant links. Existing tenants remain resolvable.

LOCKED: Delete is blocked until no active tenants or default configuration packages depend on the node. The system offers reassignment before deletion can proceed.

LOCKED: All industry-tree changes are audit-logged with actor, timestamp, old value, new value, and impact.

### 11.3 Tenant selection and package defaults

LOCKED: Tenants select a leaf business type during onboarding. The selected leaf determines default configuration package suggestions.

LOCKED: Industry configuration affects default services, optional micro-services, pricing projections, workflow templates, forms, lifecycle stages, reports, role templates, and onboarding defaults.

LOCKED: Nothing billable is silently activated. The tenant sees and confirms cost-impacting activation.

### 11.4 Seed data

LOCKED: Platform-provided seed data includes initial industry tree data, with Education and Retail as primary starting focus. Super Admin can modify the tree at runtime.

## 12. Quick Start, Recommended, Full Power

LOCKED: Quick Start, Recommended, and Full Power are universal configuration preset labels. Contents differ by business type.

| Preset | Meaning | Customer promise |
| --- | --- | --- |
| Quick Start | Minimum viable setup for the selected business type. | Fastest onboarding and lowest projected cost. |
| Recommended | Balanced setup for most tenants in the selected business type. | Practical operational coverage without maximum complexity. |
| Full Power | Maximum capability package for the selected business type. | Full platform capability exposure where dependencies and budget allow. |


LOCKED: These are configuration presets, not hard subscription tiers. A tenant may start with Quick Start and upgrade service-by-service or micro-service-by-micro-service.

Onboarding package view MUST show:

- included services;
- included optional micro-services;
- dependencies;
- projected monthly cost;
- activation impact;
- billing implications;
- what can be changed later.

## 13. Pricing, Billing, Evidence, and Cost Counters

### 13.1 Pricing architecture

LOCKED: Pricing attaches at micro-service level and rolls up to service, module, and organisation.

LOCKED: Every micro-service has a price reference, including zero-priced micro-services.

LOCKED: Manifest declares billability and billing dimension. Numeric price lives in pricing data with effective date ranges.

Supported dimensions at v4 baseline:

- flat monthly;
- per use;
- per record;
- per storage GB;
- per API call;
- per report;
- per hour;
- combined;
- any future registered dimension from the billing formula/measurement registry.

### 13.2 Projected cost vs actual spend

LOCKED: Projected cost is calculated instantly from pricing table and current/proposed configuration. It is used during onboarding, service toggles, package selection, and optimization wizards.

LOCKED: Actual spend counter is calculated from aggregated billing evidence, not per-event UI mutation.

LOCKED: Default actual-spend aggregation is hourly. Higher-frequency aggregation such as per-minute or per-second may be a paid tier.

LOCKED: The UI may call the counter “live,” but documents and tooltips MUST clarify that it reflects the configured aggregation window.

LOCKED: Projected cost never mutates actual spend.

### 13.3 Billable events and universal evidence

LOCKED: Every micro-service emits usage evidence, whether priced above zero or not.

Billable event categories may include:

- AI query;
- WhatsApp message sent;
- email sent;
- SMS sent;
- storage consumed;
- payroll run;
- report generated;
- API call;
- active user/month;
- record created;
- transaction processed;
- any registered dimension event.

Every billable event includes conceptually:

- tenant/organisation;
- service;
- micro-service;
- billing dimension;
- quantity;
- price reference;
- timestamp;
- actor/system;
- correlation ID;
- evidence reference.

LOCKED: Billing engine and AI optimizer read the same evidence stream.

### 13.4 Core platform evidence

LOCKED: Core platform systems are not tenant-toggleable services, but they emit operational and audit evidence. Where relevant, core platform evidence may feed billing, monitoring, security review, optimization, and support diagnostics.

## 14. Budget Caps and Prepaid Balance

LOCKED: Prepaid balance is the source of truth for available funds. Budget caps are customer-defined spending limits layered on top.

LOCKED: Billing Authority and delegates with explicit budget permission may set and override budget caps.

Supported cap scopes:

- monthly default;
- weekly;
- daily;
- project/cost-center;
- service/module-specific where configured.

LOCKED: Soft cap notifies. Hard cap blocks billable actions.

LOCKED: If hard budget cap is reached before prepaid balance is exhausted, billable actions are blocked. Billing Authority or budget-permission delegate may choose “Ignore cap, continue,” which is audited.

LOCKED: If prepaid balance reaches zero first, service pause rules apply regardless of budget cap.

LOCKED: The user is always shown whether a block was caused by budget cap or prepaid balance.

LOCKED: Even budget distribution across billing period is advisory, not enforcement. Enforcement is the cap itself.

## 15. Customer-First Data Protection

### 15.1 Soft delete / archive lifecycle

LOCKED: Soft delete hides data from normal views, preserves it, is reversible, and is audited.

LOCKED: Soft-deleted and archived data has operational-protection reminders at configurable milestones. Defaults: 30 days, 6 months, 12 months.

LOCKED: Restore within protection window is free. Authorised restore is role-based per service and capability-gated.

LOCKED: Cold storage restore is free within 12-month protection window. If the tenant explicitly chose extended retention beyond the default window, deep cold storage restore may carry pass-through storage cost, never punitive markup.

### 15.2 Staged permanent deletion lifecycle

LOCKED: Tenant admin may request purge; Super Admin executes purge.

LOCKED: Permanent deletion requires impact assessment, double confirmation, countdown window, reminders, and audit record.

LOCKED: Staged permanent deletion countdown is separate from soft-delete/archival reminder lifecycle. Default countdown is 30 days. Countdown cannot be bypassed except for legally required faster deletion with Super Admin recorded reason.

LOCKED: Minimal audit proof remains after erasure: what was erased, who approved, when, legal basis/reason, and integrity reference. Business data itself is removed according to erasure rules.

## 16. Invoice Immutability

LOCKED: After an invoice is issued, content, line items, tax, unit prices, and discounts cannot change.

Allowed status transitions include draft → sent → partial → paid → overdue → cancelled/voided as applicable.

LOCKED: Corrections to sent or paid invoices use credit notes, debit notes, reversal entries, or replacement invoices. The original remains as issued.

LOCKED: Invoices generated before a price change use the old price through effective date ranges.

## 17. Optimization System

LOCKED: Optimization exists at four touchpoints:

1. Always-visible Optimize button on module headers.
2. Turn-off intercept wizard before deactivation completes.
3. Turn-on restoration wizard before restoring previous configuration.
4. Proactive AI optimization alerts in later intelligence phase.

LOCKED: 6A provides non-AI optimization foundation using pricing table, configuration state, activation state, and evidence stream.

LOCKED: 6B onward every module exposes optimization hooks: what can be turned off, downgraded, replaced, delayed, batched, or reconfigured.

LOCKED: 6F provides proactive AI optimization intelligence using real operational evidence.

LOCKED: Optimization operates at module, service, optional micro-service, and pricing-plan level.

LOCKED: AI may recommend but never autonomously apply configuration or spend changes. Human approval is required. Accepted and rejected recommendations are audit-logged.

LOCKED: Tenants may disable proactive AI alerts, but cannot remove the always-visible Optimize tool.

## 18. Regional Compliance Packs

LOCKED: Regional tax, invoice, retention, document, and compliance requirements are implemented as data-driven compliance packs.

LOCKED: Pakistan/FBR, generic EU, generic US, and similar packages are seeded compliance packs, not hardcoded global rules.

LOCKED: Adding a region requires adding a compliance pack, not modifying core code.

## 19. Cross-Cutting Policies

LOCKED: The following cross-cutting policies apply to every phase unless explicitly deferred:

- UTC storage for timestamps; tenant/user locale for display.
- i18n and externalised strings from foundation onward.
- RTL readiness where supported by design system.
- Tenant isolation on every tenant-owned data domain.
- Audit on high-risk actions, configuration changes, activation changes, billing events, and communication attempts.
- No direct external communication outside Communication Gateway.
- No hardcoded workflow, lifecycle, threshold, grading, discount, tax, approval, or escalation rules where operators may vary.
- Graceful degradation for unavailable external providers.
- Feature flags for controlled rollout.
- Evidence over decorative reports.
- No code-level or implementation-file assumptions inside business/phase logic documents.

## 20. Global Phase Dependency Matrix

| Phase | Theme | May depend on | Must not depend on | Locked output intent |
| --- | --- | --- | --- | --- |
| 6A | Core Update + Foundation | Existing platform baseline only | 6B/6C/6D/6E/6F | Foundational systems, base admin, base design, identity, evidence, Foundry, configuration, billing primitives, AI proxy. |
| 6B | Commerce Core | 6A and earlier-numbered 6B components | 6C/6D/6E/6F | Products, CRM, Finance, tenant-facing billing/finance. |
| 6C | Operations | 6A, 6B, and earlier-numbered 6C components | 6D/6E/6F | HR, Workspace, Events. |
| 6D | Learning | 6A, 6B, 6C, and earlier-numbered 6D components | 6E/6F | Full LMS and education operations. |
| 6E | Growth Surface | 6A–6D and earlier-numbered 6E components | 6F | Campaigns, E-Commerce, Website/App Builder. |
| 6F | Intelligence, Advanced Admin, Design Polish | 6A–6E and earlier-numbered 6F components | Future phases only | AI Business Consultant, proactive optimization, advanced onboarding/support/admin, design polish. |


## 21. Conflict Resolution Log — v4 Replaces Earlier Assumptions

| Earlier assumption | v4 resolution |
| --- | --- |
| Industry tree stored in source JSON and changes require ADR. | Industry tree is runtime data managed through Super Admin; no ADR/code change required for node changes. |
| Phase 6E contains campaigns, e-commerce, website builder, AI consultant, admin, onboarding, and design system. | 6E is split. Base admin/design/AI proxy move to 6A. Growth surface remains 6E. Intelligence/advanced admin/design polish moves to 6F. |
| Platform billing lives entirely in Finance. | Core billing engine/primitives live in 6A; tenant-facing finance, invoices, top-ups, receipts, reconciliation live in 6B Finance. |
| AI optimization may be treated as part of the AI Consultant only. | Non-AI optimization foundation lives in 6A; module hooks begin 6B; proactive AI optimization lives in 6F. |
| Global opt-out keyed only by person/channel. | Opt-out is person_id + contact_value + channel, with raw_contact_value fallback and retroactive attachment. |
| Webhook idempotency may use receipt time. | Receipt time is audit metadata only; never part of dedupe key. Webhook without stable key is rejected. |
| FBR/Pakistan rules treated as global finance requirements. | Pakistan/FBR is a regional compliance pack, not hardcoded global behavior. |
| Design system belongs fully in late surface phase. | Base design tokens/core components belong in 6A before module frontends; advanced polish belongs in 6F. |
| Admin/onboarding belongs fully late. | Base admin/onboarding belongs in 6A; AI Concierge/advanced support/onboarding belongs in 6F. |
| Service boundaries are final in phase docs. | Phase docs propose service/micro-service boundaries subject to sub-surface validation; business rules and dependency order are locked. |


## 22. Deferred Decisions for Sub-Surface Cataloguing

DEFERRED: Exact final service and micro-service decomposition is validated during sub-surface cataloguing.

DEFERRED: Exact numeric pricing is a commercial decision.

DEFERRED: Exact default package contents for every business type are data configuration and should be catalogued after the service catalog is validated.

DEFERRED: Exact e-learning standards packaging — for example, which standards are core vs optional — must be validated in Phase 6D sub-surface cataloguing.

DEFERRED: Genesis-specific specifications and ticket generation inputs remain outside this business logic document.
