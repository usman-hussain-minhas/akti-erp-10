# AKTI ERP Master Roadmap Reference v2

**Status:** Strategic reference only
**Purpose:** Big-picture roadmap for AKTI ERP after Phase 5A merge
**Authority:** This document is not the source of truth. It is a reference compass only.

Truth for each phase or module must be created separately through its own approved source-of-truth documents: phase plan, ticket pack, ADRs, contracts, module manifests, Prisma/schema changes, screen contracts, tests, validation evidence, and audit/closure package.

If this roadmap conflicts with a phase/module truth document, ADR, Prisma schema, contract, module manifest, generated registry, test, validation artifact, closure report, or active control document, that higher-authority artifact wins.

This document replaces the strategic direction of `AKTI_ERP_Master_Roadmap_Reference_v1.md` for future planning. It does not delete v1, and it does not authorize implementation.

---

## 1. North Star

AKTI ERP should become an **AI-ready modular operating platform** for education, training, admissions, learning, people, finance, certification, engagement, operations, and intelligence-assisted workflows.

AKTI ERP should not become a hardcoded ERP bundle.

AKTI ERP should not treat AI as a late bolt-on.

The long-term direction is:

```text
Build trust first.
Prove the platform operationally.
Stabilize the local/demo/staging loop.
Make the operator experience noob-proof before module installation.
Define AI-ready module governance before module scale.
Build installable modules with evidence and intelligence boundaries.
Mature intelligence through real module evidence and versioned governance.
Scale only after operational maturity.
```

AI-first does not mean building heavy AI infrastructure immediately after Phase 3. It means future modules, Foundry, evidence, permissions, audit, evaluation, and cost controls are designed so AI capability is native before module scale becomes too large to govern cleanly.

---

## 2. Authority Rule: Roadmap Is Not Truth

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

AI capability cannot begin implementation until its governing phase/module documents define:

```text
AI-readable data
AI-prohibited data
AI tools
AI recommendations
AI action proposal rules
Human approval rules
Gatekeeper requirements
Audit and evaluation evidence
Cost budgets and ROI intent
```

---

## 3. AI-Native Governance Principle

AI must operate through AKTI ERP governance. It must not become a god-layer.

AI must obey:

```text
Access Core
Gatekeeper
Trusted tenant context
Module ownership
Audit and outbox evidence
Data classification
Human approval
Cost controls
```

AI must not:

```text
Bypass modules
Write directly to core tables by default
Approve its own high-risk actions
Read cross-tenant data
Use undeclared tools
Use prohibited module data
Execute high-risk actions without Gatekeeper and human approval
Hide cost, source evidence, or recommendation rationale
```

AI maturity should happen through versioned core and module upgrades, not only through one late isolated AI phase. Platform AI runtime may arrive later, but AI-ready declarations must be designed into Foundry and future modules before module scale.

---

## 4. Core Architecture Layers

### Layer A - Platform Core

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

### Layer B - Shared Platform Modules

Shared modules are reusable platform services that multiple business modules can use.

Current classification:

```text
Engagement Gateway Lite = shared platform module
```

Future examples include Notification Hub, Reporting Foundation, Workflow Foundation, Document Handling, Integration Hub, Payments Gateway, and AI-facing shared services after their governance exists.

### Layer C - Business Modules

Business modules provide operational value.

Current classification:

```text
Lead Desk = first business module
```

Future examples include Admissions, Student Lifecycle, LMS / Learning, HR / People, Finance, Certification, Website / Public Portal, Partner Management, Alumni, Events, Support / Helpdesk, Procurement, Inventory, and Reporting.

### Layer D - Integration Adapters

Adapters connect AKTI ERP to external systems.

Current classification:

```text
WhatsApp stub = integration adapter
```

Adapters need governance because they touch external credentials, failure modes, retries, idempotency, provider health, and audit evidence. They should not be built as informal one-off integrations.

### Layer E - Governed Intelligence

Governed intelligence is not a shortcut around the platform. It is a set of contracts, tools, evaluation evidence, and runtime services that must sit behind tenant context, Access Core, Gatekeeper, module ownership, audit/outbox, and cost controls.

---

## 5. Revised Phase Roadmap

| Phase | Name | Strategic status |
| --- | --- | --- |
| Phase 0 | Governance, Source-of-Truth and Architecture Decisions | Complete |
| Phase 1 | Platform Foundation | Complete |
| Phase 2 | First Module-Layer Proof | Complete with accepted deferrals |
| Phase 3 | Trust Foundation | Complete and merged |
| Phase 4 | Operational Proof | Complete, validated, and merged |
| Phase 4A | Local Demo / Staging Environment Stabilization | Complete, validated, and merged |
| Phase 4B | Frontend Operational Experience & Mission Control Shell | Complete, validated, and merged |
| Phase 5A | Platform Policy Pack, Governance and Gatekeeper Rulebook | Complete, validated, and merged |
| Phase 5B | Gatekeeper-Governed Module Foundry & Core Platform Completion | Next control-doc planning target; execution not started |
| Phase 5C | Frontend Excellence & UI Platform Maturity | After Phase 5B merge/approval |
| Phase 6A | Golden Module Certification | After Phase 5B/5C foundation is ready |
| Phase 6B+ | Business Modules | After Foundry/module rules and Golden Module certification exist |
| Phase 6B or later | Evidence Foundation from Real Module Events | After real modules emit enough evidence |
| Phase 7 | Intelligence Core / Predictability / Platform AI Operations | After Foundry and real module evidence exist |
| Phase 8 | Scale / Marketplace / Enterprise | After operational and module maturity |

---

## 6. Phase Detail

### Phase 0 - Governance, Source-of-Truth and Architecture Decisions

**Purpose:** Create the operating rules before the ERP grows.

**Status:** Complete.

Phase 0 established source-of-truth hierarchy, ADR discipline, Codex operating doctrine, contract-first discipline, screen-contract discipline, validation rules, and governance for future module work.

### Phase 1 - Platform Foundation

**Purpose:** Build the first version of the ERP platform core.

**Status:** Complete.

Phase 1 built the monorepo, API shell, web shell, Prisma foundation, Organization Core, Access Core, Hierarchy Core, Audit foundation, Outbox foundation, Module Registry, Configuration, Portal Shell, and setup flow.

### Phase 2 - First Module-Layer Proof

**Purpose:** Prove that AKTI ERP can host modules on top of the platform foundation.

**Status:** Complete with accepted deferrals.

Phase 2 proved:

```text
Engagement Gateway Lite = shared platform module
Lead Desk = business module
WhatsApp stub = integration adapter
```

Phase 2 also proved module manifests, capabilities, events, audit/outbox integration, Gatekeeper integration, and first business-module screens without enabling production WhatsApp.

### Phase 3 - Trust Foundation

**Purpose:** Make the platform trust-ready before operational proof.

**Status:** Complete and merged through PR #3.

Phase 3 makes future AI safer, but it is not the AI implementation phase.

Phase 3 covered:

```text
Security architecture decision
Auth/session/tenant-context decision
Trusted request context
Access Core and Gatekeeper integration
Service-level tenant isolation path
Tenant and security negative tests
Secrets/env/header/CORS controls
Runtime route limiting
Frontend bearer-session operator context
Phase 4 readiness handoff
```

Remaining bounded risks from Phase 3 include production auth/session provider, production secret provisioning, DB-level RLS and tenant transaction context, fresh empty-database bootstrap proof, browser-rendered frontend tests, production WhatsApp credentials, real outbound WhatsApp, and distributed/infrastructure-level rate limiting.

### Phase 4 - Operational Proof

**Purpose:** Make AKTI ERP runnable, inspectable, and operationally understandable in a controlled environment.

**Status:** Complete, validated, and merged.

Phase 4 proved:

```text
Staging/deployment path
Fresh DB bootstrap proof
Environment readiness
Browser-rendered frontend and visual QA
Smoke tests
Backup and restore procedure
Rollback procedure
Operational runbook
Admin access model
Support escalation model
Production auth/session provider path, if approved for Phase 4
Deployment-specific rate limiting and CORS decisions
```

Phase 4 proved operational readiness, clean DB/bootstrap, validation, audit packaging, and controlled demo/staging proof. Phase 4 frontend evidence showed the app is technically functional but not yet noob-proof or operator-ready.

Phase 4 did not become heavy AI runtime work.

Phase 4 did not build Foundry, installable modules, marketplace, or parallel business modules.

### Phase 4A - Local Demo / Staging Environment Stabilization

**Purpose:** Create a repeatable local/demo/staging environment where AKTI ERP can be run, reset, smoke-tested, opened in a browser, and inspected by humans and Codex.

Phase 4A should define and prove:

```text
Docker Compose or equivalent local/demo runtime
Local/demo Postgres
API local/demo service
Web local/demo service
.env.local.example / .env.demo.example with non-secret placeholders
local-up / local-down / local-reset / local-smoke scripts
Clean DB migration/bootstrap path
Browser URL for app inspection
Codex browser testing support
Screenshot/evidence capture path
Local demo runbook
```

Phase 4A must not authorize production launch, production VPS/cloud deployment unless separately approved, production secrets, production credential access, real WhatsApp production behavior, new business modules, Foundry/module installer implementation, platform AI runtime, or frontend redesign beyond what is necessary to run and inspect the system.

### Phase 4B - Frontend Operational Experience & Mission Control Shell

**Purpose:** Make AKTI ERP noob-proof and operator-friendly before Foundry/module installation begins.

AKTI ERP must be noob-proof by default. A non-technical operator should understand what to click, what is happening, and what to do next. Technical/admin details should exist, but under Advanced Options, Admin, or Diagnostics surfaces, not as the default interface.

Phase 4B should define and prove:

```text
Mission Control / ERP shell
Global navigation
Module navigation
Settings/control panel
Module landing pages
Setup/onboarding polish
Lead Desk operator-friendly pages
User/session context UI
Advanced diagnostics hidden by default
Friendly empty/error/loading states
Responsive/readability baseline
Browser-rendered tests
Visual QA package
```

Phase 4B must not authorize new business modules, Foundry/module installer implementation, platform AI runtime, production launch, real WhatsApp production behavior, marketplace work, or Phase 6 parallel modules.

### Phase 5 - Foundry / Module Installer / AI-Ready Module Governance

**Purpose:** Stop building future modules directly into the core and make future modules AI-ready before module scale.

Phase 5 comes after Phase 4A and Phase 4B unless a later approved decision explicitly changes that order.

Phase 5 creates the framework for installing, enabling, disabling, validating, auditing, and integrating modules.

Phase 5A has completed the policy, ADR, standard, checklist, and control layer. Phase 5B control-doc planning is next; Foundry runtime and module installer execution must not start until Phase 5B control docs and ticket pack are approved.

Phase 5 should define:

```text
Module package format
Module definition contract
Install lifecycle
Disable lifecycle
Module registry behavior
Capability and permission registration
Screen/menu registration
Event registration
Adapter governance
Migration contribution policy
Cross-module data policy
Schema conflict policy
Module audit package format
Module promotion ceremony
```

Phase 5 should also define AI-ready module governance:

```text
Module evidence event declarations
AI-readable data declarations
AI-prohibited data declarations
AI tool declarations
AI recommendation declarations
AI action proposal rules
AI cost budgets
AI audit/evaluation requirements
Gatekeeper requirements for AI-suggested actions
Human approval requirements for high-risk AI proposals
```

This is not a mandate to build an AI runtime in Phase 5. It is a mandate that Foundry/module contracts leave the platform ready for governed intelligence instead of forcing a retrofit after many modules exist.

### Phase 6 - Installable Business Modules with Governed In-Module AI

**Purpose:** Build business modules on top of Phase 5 rules without corrupting the platform core.

Modules should be installable, governed, evidence-producing, and optionally AI-assisted inside their own module boundaries.

Possible modules:

```text
Admissions
Student Lifecycle
LMS / Learning
HR / People
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

In-module AI may be allowed only when the module contract declares its readable/prohibited data, tools, recommendation behavior, action proposal rules, Gatekeeper requirements, audit/evaluation evidence, and cost budget.

### Phase 6B or Later - Evidence Foundation from Real Module Events

**Purpose:** Build evidence foundations from real operational module events, not speculative sources.

Phase 6B or later may introduce:

```text
Evidence Event standards
Evidence Store / Evidence Graph planning
Evidence pipeline design
Module evidence quality checks
Operational data provenance
Recommendation traceability requirements
```

This phase must not overpromise predictability before evidence exists. It should be triggered by real module events, audit/outbox records, and operational data from installed modules.

### Phase 7 - Intelligence Core / Predictability / Platform AI Operations

**Purpose:** Add platform-level intelligence after Foundry, module governance, and real evidence exist.

Phase 7 is not the first AI thought. It is the runtime intelligence maturity phase.

Possible scope:

```text
AI Gateway
Model Router
Prompt Registry
Tool Registry
Context Broker
AI Audit
AI Cost Controller
Recommendation Brief engine
Predictability Engine
Evidence Graph runtime
Organizational Intelligence Cockpit
Cross-module workflow assistance
```

Phase 7 must still obey Access Core, Gatekeeper, trusted tenant context, module ownership, audit/outbox, data classification, human approval, and cost controls.

### Phase 8 - Scale / Marketplace / Enterprise

**Purpose:** Prepare AKTI ERP for broader use beyond the first controlled operational deployment.

Phase 8 may include:

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

## 7. Future Module Principle

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
What evidence does it produce?
What data may AI read?
What data is AI prohibited from reading?
What AI tools or recommendations does it expose, if any?
What AI action proposals require Gatekeeper or human approval?
What AI cost budget and evaluation evidence apply?
```

If those answers are unclear, the module is not ready for implementation.

---

## 8. Adapter Principle

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
Can AI use this adapter as a tool?
What human approval or Gatekeeper check is required before AI-suggested adapter actions?
```

Adapters should not be built as one-off integrations.

---

## 9. Cross-Module Data Principle

Every module owns its own data.

Before parallel module implementation, AKTI ERP must decide:

```text
Can modules query each other directly?
When must events be used?
When are service interfaces required?
Who owns reporting queries?
How is shared data exposed safely?
How is AI-readable cross-module context assembled?
How are prohibited fields excluded?
How is tenant isolation enforced across module context?
```

No parallel module implementation should proceed without this policy.

---

## 10. Autonomous Execution Principle

Future autonomous work should use the Phase 2 and Phase 3 learning:

```text
Stable contract
Flexible runtime
Exact-file planning
Bounded repair
Validation wiring allowed only inside active scope
Runtime state from git/journal/artifacts
Heavy audit only at gates
Stop only on real blockers
No broad implementation from roadmap prose
```

Codex should not be asked to build a phase or module from imagination. It should receive phase/module truth documents, source-of-truth context, stop conditions, validation ladder, artifact policy, and acceptance criteria.

---

## 11. Phase Start Gate

A phase cannot begin implementation until these exist:

```text
Phase Plan
Ticket Pack
Acceptance Criteria
Validation Ladder
Stop Conditions
Audit / Closure Plan
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
Install / Disable Policy
Validation Plan
AI governance declarations, if AI-assisted
```

---

## 12. Final Philosophy

```text
Trust first.
Operational proof before heavy intelligence.
Local/demo/staging stabilization before operator experience scale.
Noob-proof Mission Control before Foundry.
AI-ready Foundry before module scale.
Modules built with evidence and intelligence by default.
Intelligence and predictability mature through real module evidence.
AI maturity happens through versions, not premature infrastructure.
Scale after operational maturity.
```
