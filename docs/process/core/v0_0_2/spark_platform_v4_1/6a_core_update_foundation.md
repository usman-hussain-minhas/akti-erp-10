# Phase 6A — Core Update + Foundation

**Status:** `V4_PHASE_6A_FOUNDATION_SPEC`  
**Document type:** v4 phase specification for sub-surface cataloguing and dependency-aware ticket generation.  
**Non-scope:** No code file paths, endpoint paths, validation commands, implementation instructions, or repo-specific operations.

> **Authority rule:** Business logic authority = `0_Business_Logic.md`; phase documents MUST conform to it. Where a phase document and the business logic document conflict, `0_Business_Logic.md` wins. Service boundaries proposed here are subject to sub-surface validation; dependency ordering and business logic are locked.

> **Dependency rule:** Anything in phase N+1 MUST NOT be developed before phase N. Within a phase, a component may depend only on earlier phases or earlier-numbered components in the same phase. If a feature needs a later dependency, the dependency must be moved earlier, the feature must be split, or the dependent part must be deferred.

## 1. Phase Objective

Phase 6A establishes the non-negotiable platform foundation required before any commerce, operations, learning, growth, or intelligence surface can be safely built. It updates the existing core to v4 rules, introduces Person / Identity Graph, Foundry runtime authority, evidence, billing primitives, non-AI optimization, AI proxy governance, base admin, and base design system.

## 2. Entry Dependencies

Existing platform baseline and approved v4 business logic. No dependency on 6B, 6C, 6D, 6E, or 6F is allowed.

## 3. Explicit Non-Scope

- Products, CRM, Finance, HR, Workspace, Events, LMS, Campaigns, E-Commerce, Website Builder, AI Business Consultant, advanced onboarding, and advanced design polish.
- Production-specific deployment commitments beyond foundation rules.
- Exact service ticket decomposition before sub-surface cataloguing.

## 4. Boundary Status

LOCKED: Business logic and dependency ordering in this phase are locked.

PROPOSED: Exact service and micro-service boundaries in this document are candidate boundaries. Sub-surface cataloguing validates, splits, merges, or promotes them before ticket generation.

## 5. Phase-Level Business Logic Applied

- Modules are labels; candidate services are architecture units.
- Every service/micro-service boundary must respect the one-way dependency arrow: service → core.
- Foundry is activation authority for tenant-toggleable services and optional micro-services.
- Every micro-service emits evidence, including zero-priced capabilities.
- Pricing attaches at the leaf and rolls up.
- No component may depend on a later-numbered component in this phase or on a later phase.
- Operator-specific defaults are forbidden; tenant-authored content may be tenant-specific while preserving required platform identity.
- Configuration applies to instances of registered capabilities; new capability types require extension registration.

## 6. Topological Component Catalog

| ID | Component | Type | Required dependencies | Optional dependencies | Owned data / authority | Emits | Consumes | Activation / lifecycle | Billing / evidence impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6A.01 | Platform Core Update Baseline | Core platform system cluster | Existing approved platform baseline | None | Core capability baseline, module registry baseline, tenant context baseline | core.updated, baseline.normalized | None | Not tenant-toggleable; upgrade-only | Operational evidence only |
| 6A.02 | Infrastructure Runtime Foundation | Core platform system | 6A.01 | None | Runtime topology configuration, feature-flag foundation, environment class metadata | runtime.ready, runtime.degraded | core.updated | Not tenant-toggleable | Infrastructure usage evidence where measurable |
| 6A.03 | Storage, SVFS, Backup, and Image Pipeline | Core platform system | 6A.02 | None | Object metadata, content hashes, backup metadata, image variants, retention state | file.stored, file.versioned, backup.completed, backup.failed | runtime.ready | Not tenant-toggleable; service consumers use it | Storage evidence, backup evidence, image processing evidence |
| 6A.04 | Tenant, Organisation, Branch, and Session Identity | Core platform system | 6A.02, 6A.03 | None | Tenant profile, organisation profile, branch hierarchy, session context, auth events | identity.created, session.started, session.revoked | runtime.ready | Not tenant-toggleable | Auth/security evidence |
| 6A.05 | Person / Identity Graph | Core platform system | 6A.04 | CRM/HR/LMS/Finance role extensions later | Person anchor, contact values, identity links, merge/split evidence, consent anchors | person.created, identity.linked, identity.merged, consent.recorded | identity.created | Not tenant-toggleable | Universal identity evidence |
| 6A.06 | Access Core and Gatekeeper | Core platform system | 6A.04, 6A.05 | None | Capability registry, role composition, permission decisions, high-risk approvals | capability.registered, gatekeeper.checked, approval.required | identity.linked | Not tenant-toggleable | Permission and approval evidence |
| 6A.07 | Audit Log and Universal Evidence Stream | Core platform system | 6A.04, 6A.06 | None | Audit entries, hash-chain integrity, evidence event ledger | audit.appended, evidence.recorded, audit.integrity_failed | gatekeeper.checked | Not tenant-toggleable | Universal audit/evidence authority |
| 6A.08 | Transactional Outbox, Event Bus, and DLQ | Core platform system | 6A.07 | None | Outbox messages, event schemas, subscriptions, delivery attempts, DLQ records | event.published, event.delivered, event.failed, dlq.alerted | audit.appended | Not tenant-toggleable | Event delivery evidence |
| 6A.09 | Core Billing Engine and Pricing Registry | Core platform system | 6A.07, 6A.08 | None | Pricing references, billing dimensions, measurement registry, spend counters, budget/prepaid primitives | billing.evidence_recorded, spend.aggregated, budget.blocked | evidence.recorded, event.published | Not tenant-toggleable | Billing evidence authority |
| 6A.10 | Foundry Runtime Authority | Core platform system | 6A.06, 6A.08, 6A.09 | Feature flags from 6A.02 | Service registry, activation state, dependency graph, version pins, lifecycle state | service.activated, service.deactivated, dependency.blocked, version.pinned | capability.registered, billing.evidence_recorded | Not tenant-toggleable; controls tenant-toggleable services | Activation, dependency, and billing-impact evidence |
| 6A.11 | Communication Gateway and Global Opt-Out | Core platform system | 6A.05, 6A.07, 6A.08 | Provider adapters later | Opt-out registry, outbound attempt log, provider route config, rate-limit evidence | communication.sent, communication.blocked, optout.recorded, reoptin.recorded | person.created, evidence.recorded | Not tenant-toggleable; channels may be configured | Communication evidence; billable message evidence |
| 6A.12 | API Gateway and Webhook Management | Core platform system | 6A.06, 6A.08, 6A.09 | Provider-specific adapters later | API key scopes, webhook definitions, idempotency keys, retry logs, delivery logs | api.write_accepted, webhook.received, webhook.rejected, webhook.delivered | gatekeeper.checked, event.published | Not tenant-toggleable; tenant configs allowed | API call evidence, webhook evidence |
| 6A.13 | Configuration Engine | Core platform system | 6A.06, 6A.08, 6A.10 | None | Custom field instances, lifecycle configs, rule configs, workflow definitions, forms, templates | config.changed, workflow.activated, rule.blocked, form.submitted | service.activated, capability.registered | Not tenant-toggleable; config surfaces tenant-facing | Configuration evidence; workflow evidence |
| 6A.14 | Search and File Service Layer | Core platform system | 6A.03, 6A.07, 6A.08 | 6A.13 custom field indexing | Search indexes, file metadata, share links, previews, virus scan status | search.indexed, file.shared, file.quarantined | file.stored, evidence.recorded | Not tenant-toggleable; service consumers use it | Storage/search usage evidence |
| 6A.15 | Non-AI Optimization Foundation | Core platform system | 6A.09, 6A.10, 6A.13 | None | Optimization facts, cost projections, dependency-aware alternatives, recommendation logs | optimization.requested, optimization.presented, optimization.accepted, optimization.rejected | spend.aggregated, service.activated | Always available; proactive AI deferred to 6F | Optimization evidence; projected cost only |
| 6A.16 | AI Proxy and AI Governance Foundation | Core platform system | 6A.06, 6A.07, 6A.09 | 6A.13 for AI workflow wizard | AI request classifications, model routing policy, AI cost cap, prohibited data rules | ai.requested, ai.blocked, ai.cost_recorded | gatekeeper.checked, billing.evidence_recorded | Not tenant-toggleable as core; tenant AI features governed | AI usage evidence; AI cost evidence |
| 6A.17 | Base Admin and Tenant Onboarding | Core platform UI/system | 6A.04, 6A.06, 6A.10, 6A.13, 6A.15 | 6A.16 for limited AI assistance only if enabled | Tenant setup, industry selection, package selection, users, roles, billing authority, basic settings | tenant.configured, package.selected, user.invited | service.activated, config.changed | Tenant-facing admin; not a business module | Admin action evidence; projected cost views |
| 6A.18 | Base Design System and Shell | Core platform UI system | 6A.17 | None | Design tokens, base components, navigation shell, loading/empty/error patterns | ui.contract.registered, shell.ready | tenant.configured | Not tenant-toggleable | No direct billing; UI evidence only if instrumented |

## 7. Microscopic Component Scope

### 6A.01 — Platform Core Update Baseline

**Microscopic scope:**

- Normalize existing core to v4 language: modules are labels, services are architecture units, and core platform systems are not marketplace services.
- Preserve existing validated platform foundation; do not rebuild working core unless required by v4 authority rules.
- Create the conceptual upgrade boundary for moving from old module-centric assumptions to service-first Foundry-controlled assumptions.
- Ensure future phase documents inherit the hard/configurable rule split.
- Record that service boundaries remain proposed until sub-surface validation.

### 6A.02 — Infrastructure Runtime Foundation

**Microscopic scope:**

- Cloud-native first; Docker/containerized runtime first, Kubernetes only when load/client count justifies it.
- Rent managed services where practical: managed database, managed object storage, edge/CDN, managed email/SMS/WhatsApp providers, payment providers, managed monitoring where suitable.
- Feature flags exist from foundation and support per-tenant/per-user evaluation without application restart.
- Runtime must support graceful degradation: provider failure does not collapse unrelated services.
- Infrastructure is not a tenant-toggleable service and cannot be priced as a tenant micro-service directly.

### 6A.03 — Storage, SVFS, Backup, and Image Pipeline

**Microscopic scope:**

- Content-addressed file storage with immutable object versions and reference pointers.
- Soft delete hides files/records while preserving recovery state and audit evidence.
- Backup metadata records backup completion, failure, verification status, restore drill status, and storage class.
- Image pipeline creates web-optimized variants and strips sensitive metadata where required.
- Storage usage emits evidence for billing, optimization, alerts, and capacity planning.

### 6A.04 — Tenant, Organisation, Branch, and Session Identity

**Microscopic scope:**

- First-run setup has no default credentials; admin is created through secure setup.
- MFA required for Super Admin, Billing Authority, and financial capability holders.
- Super Admin session and Tenant Frontend session are separate contexts.
- Tenant/organisation/branch hierarchy is configurable and platform-neutral.
- Session revocation occurs on relevant capability, membership, or security changes.

### 6A.05 — Person / Identity Graph

**Microscopic scope:**

- Person is a core-owned anchor, not CRM-owned, LMS-owned, HR-owned, or Finance-owned.
- Role-specific records link to Person: lead/contact, student, employee, customer, vendor, attendee, parent/guardian, campaign recipient.
- Contact values are tracked independently so opt-out can apply to one phone/email without blocking all contact values for the Person.
- Merge/split operations are audited and preserve evidence.
- Identity graph provides future AI context boundary without granting AI unrestricted cross-module access.

### 6A.06 — Access Core and Gatekeeper

**Microscopic scope:**

- Low-level capabilities are declared by service manifests; roles and bundles compose registered capabilities.
- Gatekeeper checks high-risk actions, financial actions, activation changes, support windows, purge requests, and AI-suggested high-risk actions.
- Capabilities are tenant-scoped and session-aware.
- Permission decisions emit evidence and are auditable.
- No frontend-only access control is sufficient for protected actions.

### 6A.07 — Audit Log and Universal Evidence Stream

**Microscopic scope:**

- Append-only audit record with integrity protection.
- Universal evidence stream records operational, activation, billing, communication, optimization, AI, webhook, and service lifecycle evidence.
- Core platform systems emit evidence even though they are not tenant-toggleable.
- Audit retention is preferred over feature richness where tradeoff exists.
- Evidence stream feeds billing, optimization, AI, monitoring, and support diagnostics with appropriate access controls.

### 6A.08 — Transactional Outbox, Event Bus, and DLQ

**Microscopic scope:**

- Outbox records events transactionally with local data changes.
- Event bus provides at-least-once delivery; consumers must be idempotent.
- Dead Letter Queue stores failure details, retry count, and recovery action state.
- Saga compensation failures go to DLQ and alert admins.
- Events include schema version, correlation ID, audit reference, service ID, and tenant/organisation ID.

### 6A.09 — Core Billing Engine and Pricing Registry

**Microscopic scope:**

- Pricing table stores numeric values with effective date ranges; service manifests store references and dimensions only.
- Formula/measurement registry defines unit name, measurement source, aggregation rule, pricing formula, rounding rule, and evidence requirements.
- Actual spend counter is evidence-aggregated; default aggregation is hourly.
- Projected cost is instant and uses pricing/configuration state only; it does not mutate spend.
- Budget caps and prepaid primitives exist here; tenant-facing financial UI is in 6B Finance.

### 6A.10 — Foundry Runtime Authority

**Microscopic scope:**

- Foundry holds service activation state as the only source of truth.
- Foundry resolves dependency graph before activation/deactivation.
- Foundry shows activation impact, dependency impact, pricing impact, and rollback/version state.
- Foundry blocks deactivation when required dependencies exist.
- Foundry preserves previous module/service/optional micro-service configuration for restoration.

### 6A.11 — Communication Gateway and Global Opt-Out

**Microscopic scope:**

- All outbound WhatsApp, email, SMS, push, and promotional in-app notifications route through Communication Gateway.
- Global opt-out enforces person_id + contact_value + channel, with raw_contact_value fallback and retroactive attachment.
- Transactional, system, billing, security, and legal notices are separated from marketing opt-out.
- Provider unavailability queues where appropriate and degrades unrelated platform functions gracefully.
- Every send, block, failure, rate-limit, and opt-out action emits evidence.

### 6A.12 — API Gateway and Webhook Management

**Microscopic scope:**

- Write APIs require idempotency; reads are exempt.
- Third-party webhooks dedupe by provider event/transaction ID or stable canonical hash; receipt time is never dedupe key.
- Webhook without stable dedupe fields is rejected with a bad request result so provider must retry with a stable format.
- Webhook retry schedules are configurable as data.
- API keys are scoped to registered capabilities and emit usage evidence.

### 6A.13 — Configuration Engine

**Microscopic scope:**

- Custom field instances, lifecycle stages, rules, workflows, forms, and templates are data-driven.
- New capability types require extension registration; tenants compose instances from registered capabilities.
- Configuration Engine exposes registered workflow definitions and registries. AI assistance, when present through 6A.16 or later 6F intelligence services, must use these registered capabilities and cannot invent execution actions.
- Rules engine enforces tenant-specific requirements before state transitions complete.
- Configuration changes are audited and versioned.

### 6A.14 — Search and File Service Layer

**Microscopic scope:**

- Search indexes records according to registered metadata and field-level index settings.
- File service handles upload/download/preview/share/archive/version behavior using storage foundation.
- Virus scanning/quarantine behavior is configured as policy and evidence-emitting.
- Search degrades gracefully if unavailable; underlying record views remain accessible where allowed.
- File and search usage can support future billing dimensions and optimization.

### 6A.15 — Non-AI Optimization Foundation

**Microscopic scope:**

- Calculates projected before/after cost from pricing table and configuration state.
- Explains dependency consequences of turning services or optional micro-services on/off.
- Powers always-visible Optimize button and activation/deactivation intercept wizards.
- Logs recommendations, accepts, rejects, and user actions.
- Does not require AI Business Consultant and does not autonomously change configuration.

### 6A.16 — AI Proxy and AI Governance Foundation

**Microscopic scope:**

- Central AI proxy enforces data classification, tenant context, Gatekeeper, cost caps, and audit/evidence.
- AI cost is measured through billing evidence.
- AI may assist configuration only through registered capabilities exposed by 6A.13; 6A.16 enhances 6A.13 when AI assistance is enabled and does not make 6A.13 depend on AI.
- AI cannot read prohibited data or cross-tenant data.
- Business-facing AI Consultant is deferred to 6F.

### 6A.17 — Base Admin and Tenant Onboarding

**Microscopic scope:**

- Tenant setup includes organisation profile, industry leaf selection, package selection, initial users, roles, billing authority, delegates, and basic settings.
- Quick Start, Recommended, and Full Power are shown as configurable presets with projected cost and activation impact.
- Super Admin manages industry tree, compliance packs, service catalog, pricing references, extension registry, support windows, and tenant lifecycle.
- Advanced AI Concierge, sample data journeys, support workflows, and design polish are deferred to 6F.
- No billable services silently activate during onboarding.

### 6A.18 — Base Design System and Shell

**Microscopic scope:**

- Design tokens, base components, navigation shell, modal/drawer/dialog patterns, loading/empty/error states, and accessibility baseline exist before 6B frontend work.
- Base shell supports two-frontends separation.
- Core components avoid operator-specific copy and externalise strings.
- Advanced design polish, business intelligence surfaces, and refined onboarding UX are deferred to 6F.
- Phase 6B/6C/6D/6E frontends use the base system rather than inventing unrelated UI patterns.

## 8. Forward Dependency Check

PASS: Every 6A component depends only on existing baseline or earlier-numbered 6A components. No 6A component depends on 6B, 6C, 6D, 6E, or 6F. Advanced AI, advanced admin, and design polish are explicitly deferred to 6F.


## Appendix A — Component Field Meaning

| Field | Meaning |
| --- | --- |
| ID | Topological order number. Later components may depend on earlier components only. |
| Component | Candidate service, micro-service cluster, core platform system, or UI/system layer. |
| Type | Boundary classification before sub-surface validation. |
| Required dependencies | Earlier components required before this one can be catalogued or built. |
| Optional dependencies | Earlier components that enhance behavior but are not required for core function. |
| Owned data / authority | Data domain or configuration authority owned by this component. |
| Emits | Conceptual events/evidence this component produces. |
| Consumes | Conceptual events/evidence this component consumes. |
| Activation / lifecycle | Foundry or lifecycle behavior. |
| Billing / evidence impact | Billing, usage, audit, or operational evidence behavior. |

## Appendix B — Sub-Surface Validation Rule

Sub-surface cataloguing MUST validate whether each proposed component should remain one service, split into multiple services, merge into an earlier service, become a core micro-service, become an optional micro-service, or defer to a later phase. This validation may change exact boundaries, but it MUST NOT violate the locked dependency order or business rules.
