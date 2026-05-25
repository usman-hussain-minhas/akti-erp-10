# AKTI ERP Master Roadmap Reference v1

**Status:** Strategic reference only  
**Purpose:** Big-picture roadmap for AKTI ERP after Phase 1 and Phase 2 closure  
**Authority:** This document is **not the source of truth**. It is a reference compass only.

Truth for each phase or module must be created separately through its own approved source-of-truth documents: phase plan, ticket pack, ADRs, contracts, module manifests, Prisma/schema changes, screen contracts, tests, validation evidence, and audit/closure package.

If this roadmap conflicts with a phase/module truth document, the phase/module truth document wins.

---

## 1. North Star

AKTI ERP should become a **modular operating platform** for education, training, admissions, learning, people, finance, certification, engagement, operations, and AI-assisted workflows.

The long-term direction is:

```text
Build a strong platform core.
Prove modules on top of it.
Secure the platform.
Deploy it safely.
Then scale through installable modules.
```

AKTI ERP should not become a large hardcoded ERP bundle. Future functionality should be installed, governed, validated, and audited as modules.

---

## 2. Core Architecture Layers

### Layer A — Platform Core

The platform core is the permanent foundation.

It includes:

```text
Organization Core
Access Core
Hierarchy Core
Gatekeeper
Audit
Outbox
Module Registry
Configuration
Portal Shell
Security and tenant boundary foundations
```

The platform core should remain small, stable, and heavily governed.

### Layer B — Shared Platform Modules

Shared modules are reusable platform services that multiple business modules can use.

Examples:

```text
Engagement Gateway
Notification Hub
Reporting Foundation
Workflow Foundation
Document Handling
Integration Hub
Payments Gateway
```

Current classification:

```text
Engagement Gateway = shared platform module
```

### Layer C — Business Modules

Business modules provide operational value.

Examples:

```text
Lead Desk
Admissions
Student Lifecycle
LMS / Learning
HR
Finance
Certification
Website / Public Portal
Partner Management
Alumni
Events
Support / Helpdesk
Procurement
Inventory
Reporting
```

Current classification:

```text
Lead Desk = first business module
```

### Layer D — Integration Adapters

Adapters connect AKTI ERP to external systems.

Examples:

```text
WhatsApp Adapter
Email Adapter
Payment Adapter
Accounting Adapter
Google/Microsoft Adapter
LMS Adapter
Analytics Adapter
```

Current classification:

```text
WhatsApp stub = integration adapter
```

Adapters need governance because they touch external credentials, failure modes, retries, idempotency, provider health, and audit evidence. They should not be built as informal one-off integrations.

---

## 3. Governance Rule: Roadmap Is Not Truth

This roadmap is not an execution contract.

A phase cannot begin implementation until it has its own approved truth documents:

```text
Phase Plan
Ticket Pack
Acceptance Criteria
Validation Ladder
Stop Conditions
Audit / Closure Plan
```

A module cannot begin implementation until it has its own approved truth documents:

```text
Module Definition
Module Manifest
Capability Map
Screen Contracts
Data Ownership Statement
Event Policy
Adapter Dependencies Declared, if any
Install / Disable Policy
Validation Plan
```

The roadmap section for a phase or module is only directional until that phase/module’s own documents exist. Once those documents exist, they override this roadmap.

---

## 4. Phase Roadmap

### Phase 0 — Governance, Source-of-Truth and Architecture Decisions

**Purpose:** Create the operating rules before the ERP grows.

**Big-picture scope:**

```text
Source-of-truth hierarchy
AGENTS.md
ADRs
Codex doctrine
Contract-first discipline
Screen-contract discipline
Validation rules
Autonomous run rules
Security architecture direction
Adapter governance direction
```

**Status:**

```text
Completed as baseline.
```

#### Deferred Architecture Decisions with Known Trigger Points

These are not optional improvements. They are deferred governance decisions that must exist before their relevant phase or module boundary.

| Deferred decision | Must exist before | Reason |
|---|---|---|
| Security Architecture Decision | Phase 3 | Phase 3 cannot decide auth, sessions, tenant context, RLS, secrets, route limiting, and security posture without an explicit security baseline. |
| Adapter Framework Contract | Before any real adapter and before Phase 5 | WhatsApp, email, payments, accounting, Google/Microsoft, LMS, and analytics adapters need one governing pattern. |
| Cross-Module Data Access Policy | Phase 5 | Foundry must define how modules access each other’s data before parallel modules begin. |
| Module Integration Gate Policy | Phase 5 / Phase 6 boundary | Parallel module builds need merge, promotion, and conflict-resolution rules before landing together. |

### Phase 1 — Platform Foundation

**Purpose:** Build the first version of the ERP platform core.

**Big-picture scope:**

```text
Monorepo
API shell
Web shell
Prisma foundation
Organization Core
Access Core
Hierarchy Core
Audit foundation
Outbox foundation
Module Registry
Configuration
Portal Shell
Setup flow
```

**Status:**

```text
Completed, hardened, validated, merged.
```

**Strategic note:** Phase 1 is the foundation. It should not be endlessly expanded with business logic. Future business functionality should sit on top of it.

### Phase 2 — First Module-Layer Proof

**Purpose:** Prove that AKTI ERP can host modules on top of the platform foundation.

**Classification:**

```text
Engagement Gateway Lite = shared platform module
Lead Desk = business module
WhatsApp stub = integration adapter
```

**Big-picture scope:**

```text
Engagement Gateway Lite
Lead Desk Core
Lead Desk screens
WhatsApp stub through Engagement Gateway
Module manifests
Capabilities
Events
Audit/outbox integration
Gatekeeper integration
Hardening and quality pass
```

**Status:**

```text
Completed, hardened, quality-passed, merged with accepted deferrals.
```

**Accepted deferrals:**

```text
Production deployment
Production auth/session
Production WhatsApp credentials
Real outbound WhatsApp
Fresh empty-database bootstrap baseline
Runtime route limiting
Browser-rendered frontend tests
```

These are accepted deferrals, not hidden blockers. They must feed into later phases.

### Phase 3 — Security, Auth, Tenant and Operational Trust Foundation

**Purpose:** Turn the platform from internally validated to trust-ready.

Phase 3 comes before staging/deployment because deployment without real security and tenant boundaries creates false confidence.

**Big-picture scope:**

```text
Authentication and session model
Tenant context propagation
Tenant isolation enforcement
RLS or service-level tenant strategy
Role/capability hardening
Operator context replacement
Secrets policy
Security headers
CORS policy
Runtime route limiting
Cross-tenant negative tests
Security audit evidence
Fresh DB/bootstrap decision
```

**Required Phase 3 decision:**

Phase 3 must explicitly determine whether security, tenant context, and RLS are being **hardened from existing foundations** or **added as missing architecture**.

If the answer is “adding,” Phase 3 scope must expand and the Phase 3 ticket pack must reflect that reality.

**Required Phase 3 truth docs before work begins:**

```text
AKTI_ERP_Phase_3_Security_Auth_Tenant_Hardening_Plan_v1
AKTI_ERP_Phase_3_Ticket_Pack_v1
AKTI_ERP_Phase_3_Audit_Report_v1
```

### Phase 4 — Deployment, Staging, Visual QA and Operations Runbook

**Purpose:** Make AKTI ERP runnable, inspectable, and operationally understandable in a controlled environment.

**Big-picture scope:**

```text
Staging environment
Environment variables
Deployment pipeline
Database bootstrap approach
Smoke tests
Visual QA
Screen walkthrough
Demo readiness
Backup and restore procedure
Rollback procedure
Operational runbook
Admin access model
Incident response basics
Support escalation basics
```

**Output:**

```text
Internal staging/demo-ready ERP.
```

Not necessarily:

```text
Full production launch.
```

**Required operational deliverable:**

Phase 4 must include an **Operational Runbook**, not only deployment scripts.

The Operational Runbook should answer:

```text
Who runs the ERP?
Who has platform admin access?
How are incidents handled?
How are backups/restores performed?
How does rollback work?
Who owns environment variables?
How are support escalations handled?
```

### Phase 5 — Foundry / Module Installer Framework

**Purpose:** Stop building future modules directly into the core.

Phase 5 creates the framework for installing, enabling, disabling, validating, auditing, and integrating modules.

**Big-picture scope:**

```text
Module package format
Module definition contract
Module install lifecycle
Module disable lifecycle
Module registry behavior
Module health checks
Capability seeding
Permission registration
Screen/menu registration
Migration contribution policy
Event registration
Adapter registration
Rollback/disable policy
Module validation
Module audit package format
Module promotion ceremony
Cross-module data access policy
Schema conflict resolution policy
```

**Required governance additions:**

#### Module Definition Contract

The module checklist must become enforceable, not just advisory.

Each module must define:

```text
What problem it solves
Who uses it
What data it owns
What capabilities it needs
What screens it exposes
What events it emits
What modules it depends on
What adapter dependencies it has, if any
How it is installed
How it is disabled
How it is audited
```

#### Adapter Governance Contract

Adapters must define:

```text
Credential policy
Secret boundaries
Failure behavior
Retry/idempotency behavior
Provider health
Enable/disable lifecycle
Audit evidence
Integration ownership
```

#### Cross-Module Data Access Policy

Before multiple modules exist, AKTI ERP must answer:

```text
Can one module query another module’s tables?
When must events be used?
When are service interfaces required?
Who owns reporting queries?
How is shared data exposed safely?
```

#### Module Integration Gate

Before modules built in parallel are merged into the platform, there must be an integration gate answering:

```text
Who owns the merge sequence?
How are schema conflicts resolved?
How are migrations ordered?
How are shared tables protected?
How does a module move from isolated build to platform inclusion?
```

### Phase 6 — Parallel Installable Business Modules

**Purpose:** Build business modules in parallel without corrupting the platform core.

**Possible modules:**

```text
Admissions
Student Lifecycle
LMS / Learning
HR
Finance
Certification
Website / Public Portal
Partner Management
Alumni
Events
Support / Helpdesk
Procurement
Inventory
Reporting
```

**Execution model:**

Each module should be developed as an installable module pack, not as direct core expansion.

Each module must have:

```text
Module manifest
Capabilities
Permissions
Screen contracts
API surface
Frontend screens
Owned data definition
Adapter dependencies, if any
Events
Audit/outbox behavior
Tests
Install package
Disable policy
Quality pass
External audit package
```

**Multi-chat Codex rule:**

Multiple Codex chats may work in parallel only when module boundaries are enforced by:

```text
Foundry rules
Module definition contract
Migration contribution policy
Adapter dependency declaration
Cross-module data access policy
Module integration gate
```

Without those, parallel runs should remain planning-only or isolated prototypes.

### Phase 7 — AI Assistance, Automation and Platform AI Operations

**Purpose:** Add AI capabilities without bypassing platform governance.

**Important distinction:**

AI should be split into two categories.

#### A. In-module AI assistance

Allowed earlier inside stable modules if governed by that module’s own contract, permissions, audit, and data boundaries.

Examples:

```text
Lead scoring inside Lead Desk
Admissions recommendation inside Admissions
Smart response drafting inside Engagement Gateway
Learning support inside LMS
```

#### B. Platform AI operations

Reserved for later, when multiple modules are stable.

Examples:

```text
Cross-module workflow automation
AI operations assistant
Document intelligence
Autonomous task orchestration
System-wide analytics recommendations
Agent-assisted operations
```

**Rule:**

```text
AI must operate through governed modules and permissions.
AI must not bypass Access Core, Gatekeeper, audit, tenant boundaries, or module ownership.
```

### Phase 8 — Scale, Marketplace and Enterprise Readiness

**Purpose:** Prepare AKTI ERP for broader use beyond the first internal deployment.

**Big-picture scope:**

```text
Module marketplace
Multi-tenant scale
Usage analytics
Billing readiness
Partner onboarding
Support operations
Enterprise deployment patterns
Performance optimization
Compliance evidence
Marketplace governance
```

---

## 5. Future Module Principle

Before implementation, every module must answer:

```text
What problem does it solve?
Who uses it?
What data does it own?
What permissions does it require?
What screens does it expose?
What events does it emit?
What other modules does it depend on?
What adapter dependencies does it have, if any?
How is it installed?
How is it disabled?
How is it audited?
```

If those answers are unclear, the module is not ready for implementation.

By Phase 5, this must become a structured module definition artifact.

---

## 6. Adapter Principle

Every adapter must answer:

```text
What external system does it connect to?
What credentials does it need?
Where are credentials stored?
What happens if the external provider fails?
What is retried?
What is idempotent?
What is audited?
How is it disabled?
Which modules can use it?
```

Adapters should not be built as one-off integrations.

---

## 7. Cross-Module Data Principle

Every module owns its own data.

Before Phase 6, the system must decide:

```text
Can modules query each other directly?
Should modules communicate through services?
Should modules communicate through events?
How are reporting queries governed?
How are shared references handled?
```

No parallel module implementation should proceed without this policy.

---

## 8. Autonomous Execution Principle

Future autonomous work should use the Phase 2 learning:

```text
Stable contract
Flexible runtime
Exact-file planning
Bounded repair
Validation wiring allowed
Runtime state from git/journal/artifacts
Heavy audit only at gates
Stop only on real blockers
```

Codex should not be asked to “build a phase” from imagination.

It should receive:

```text
Phase plan
Ticket pack
Source-of-truth context
Stop conditions
Validation ladder
Artifact policy
Acceptance criteria
```

---

## 9. Phase Start Gate

A phase cannot begin implementation until these exist:

```text
Phase Plan
Ticket Pack
Acceptance Criteria
Validation Ladder
Stop Conditions
Audit/Closure Plan
```

A module cannot begin implementation until these exist:

```text
Module Definition
Module Manifest
Capability Map
Screen Contracts
Data Ownership Statement
Event Policy
Adapter Dependencies Declared, if any
Install/Disable Policy
Validation Plan
```

This makes the authority model enforceable, not just advisory.

---

## 10. Accepted Deferrals After Phase 2

These remain accepted and must feed into Phase 3/4:

```text
Production deployment
Production auth/session
Production WhatsApp credentials
Real outbound WhatsApp
Fresh empty-database bootstrap baseline
Runtime route limiting
Browser-rendered frontend tests
```

They are not hidden blockers. They are planned future work.

---

## 11. Brevity Rule

This roadmap is directional.

Detailed implementation belongs in phase and module truth documents, not in this master roadmap.

The roadmap should define:

```text
phase sequence
entry gates
major boundaries
known deferred decisions
authority warnings
```

It should not contain the full implementation logic of any phase.

---

## 12. Final Note

The AKTI ERP direction is:

```text
Core first.
Modules second.
Security before deployment.
Foundry before parallel modules.
AI through governance.
Scale after operational maturity.
```

This roadmap should be uploaded as:

```text
AKTI_ERP_Master_Roadmap_Reference_v1.md
```

It should sit beside the refreshed source files as a **strategic reference only**. It should not be used as a ticket pack or phase execution contract.
