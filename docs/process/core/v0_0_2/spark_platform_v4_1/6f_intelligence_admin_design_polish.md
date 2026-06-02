# Phase 6F — Intelligence, Advanced Admin, and Design Polish

**Status:** `V4_PHASE_6F_INTELLIGENCE_ADMIN_DESIGN_POLISH_SPEC`  
**Document type:** v4 phase specification for sub-surface cataloguing and dependency-aware ticket generation.  
**Non-scope:** No code file paths, endpoint paths, validation commands, implementation instructions, or repo-specific operations.

> **Authority rule:** Business logic authority = `0_Business_Logic.md`; phase documents MUST conform to it. Where a phase document and the business logic document conflict, `0_Business_Logic.md` wins. Service boundaries proposed here are subject to sub-surface validation; dependency ordering and business logic are locked.

> **Dependency rule:** Anything in phase N+1 MUST NOT be developed before phase N. Within a phase, a component may depend only on earlier phases or earlier-numbered components in the same phase. If a feature needs a later dependency, the dependency must be moved earlier, the feature must be split, or the dependent part must be deferred.

## 1. Phase Objective

Phase 6F adds the late-stage intelligence and experience layer after real operational modules and evidence exist: AI Business Consultant, proactive AI optimization, prediction/AAR/collective intelligence, advanced admin/support/onboarding, migration workbench, documentation/community, and advanced design polish.

## 2. Entry Dependencies

Phase 6A through 6E complete. 6F depends on real evidence from commerce, operations, learning, growth surfaces, billing, communication, activation, and configuration systems.

## 3. Explicit Non-Scope

- Foundational AI proxy, base admin, base design system, core billing engine, core Foundry, core configuration engine — these belong to 6A and must not be rebuilt here.
- Autonomous AI configuration/spend changes without human approval.
- AI bypass of Access Core, Gatekeeper, tenant context, module ownership, prohibited-data declarations, cost controls, or audit.
- Decorative dashboards without evidence.

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
| 6F.01 | AI Context Broker and Evidence Readiness Layer | Candidate intelligence service | 6A.16, 6A.07, 6A.09, 6B, 6C, 6D, 6E | None | AI-readable context maps, prohibited data maps, freshness metadata, evidence summaries | ai_context.prepared, ai_context.blocked | evidence.recorded, ai.requested | Foundry-managed intelligence service; governed by AI proxy | AI context evidence |
| 6F.02 | AI Business Consultant | Candidate tenant service | 6F.01, 6A.16, 6A.06 | None | Business insights, recommendation briefs, question/answer sessions, confidence/freshness records | business_insight.generated, ai_advice.viewed | ai_context.prepared, spend.aggregated | Tenant-toggleable AI service with cost caps | AI query/cost evidence |
| 6F.03 | Proactive AI Optimization Intelligence | Candidate optional AI micro-service | 6F.02, 6A.15 | None | Optimization alerts, before/after cost analyses, accepted/rejected actions | ai_optimization.suggested, ai_optimization.accepted, ai_optimization.rejected | optimization.presented, evidence.recorded | Optional alerts can be disabled; Optimize button remains | AI optimization evidence |
| 6F.04 | Prediction, After-Action Review, and Collective Intelligence | Candidate optional service cluster | 6F.02, 6F.03 | Opt-in cohort intelligence settings | Predictions, confidence labels, AAR responses, anonymised benchmarks | prediction.generated, aar.created, benchmark.presented | business_insight.generated, evidence.recorded | Opt-in/consent-governed; never cross-tenant identity leakage | Prediction/benchmark evidence |
| 6F.05 | Advanced Admin, Support, and Diagnostics | Candidate Super Admin/Tenant Admin service cluster | 6A.17, 6C.05, 6E.08 | 6F.02 AI assist | Support tickets, SLA evidence, diagnostics views, support-window workflows, admin task automation | support_ticket.created, sla.breached, support_window.opened | tenant.configured, message.sent | Admin/support capabilities; support windows audited | Support/admin evidence |
| 6F.06 | AI Concierge and Advanced Onboarding | Candidate tenant onboarding service | 6A.17, 6F.02, 6E.08 | 6E.05 demo store data if active | Guided setup plans, tours, sample data packs, onboarding progress, accepted AI setup suggestions | concierge.suggested, onboarding.completed, sample_data.created | package.selected, business_insight.generated | Tenant admin controlled; human approves applied config | Onboarding/AI evidence |
| 6F.07 | Documentation, Community, Training, and Data Migration Workbench | Candidate admin/support service | 6F.05, 6A.14, 6A.13 | 6F.02 AI help | Docs, tutorials, migration mappings, import jobs, community posts, accepted answers | doc.published, migration.started, migration.completed, community_answer.accepted | support_ticket.created, file.stored | Foundry-managed support surface | Migration/storage/support evidence |
| 6F.08 | Advanced Design Polish and Experience Quality System | Candidate UI/system layer | 6A.18, 6E.08, 6F.05 | 6F.02 for AI-assisted UX hints | Advanced components, visual QA records, UX quality metrics, accessibility audits, noob-proof patterns | design_component.promoted, visualqa.recorded, accessibility.checked | shell.ready, page.published | Not tenant-toggleable as core quality layer | UX quality evidence |

## 7. Microscopic Component Scope

### 6F.01 — AI Context Broker and Evidence Readiness Layer

**Microscopic scope:**

- Assembles AI-readable context from module evidence and declared module permissions.
- Enforces prohibited data declarations before any AI response.
- Shows data freshness and confidence boundaries.
- Does not bypass Access Core, Gatekeeper, tenant context, or module ownership.
- Prepares evidence summaries for business consultant and optimization intelligence.

### 6F.02 — AI Business Consultant

**Microscopic scope:**

- Answers business questions using tenant-owned authorised data and evidence summaries.
- Provides confidence level, data sources, data freshness, and reasoning summary without claiming certainty.
- Operates under AI cost caps and records AI usage evidence.
- Does not provide prohibited legal/tax/investment/medical/mental-health/audit-assurance advice beyond safe boundaries.
- Human remains final decision-maker for business actions.

### 6F.03 — Proactive AI Optimization Intelligence

**Microscopic scope:**

- Uses 6A non-AI optimization foundation plus operational module evidence to suggest cheaper/better configurations.
- Recommendations include exact before/after cost, evidence, tradeoffs, and dependency impact.
- AI never applies optimization automatically; human approval is required.
- Accepted and rejected recommendations are audit-logged.
- Tenants may disable proactive alerts while retaining the always-visible Optimize tool.

### 6F.04 — Prediction, After-Action Review, and Collective Intelligence

**Microscopic scope:**

- Prediction maturity depends on data age and quality; insufficient data must be stated honestly.
- After-action reviews capture qualitative decisions the data cannot see.
- Collective intelligence is opt-in, anonymised, cohort-thresholded, and privacy-protected.
- Benchmarks show ratios/rates rather than identities or raw confidential amounts.
- Predictions are recommendations, not guarantees.

### 6F.05 — Advanced Admin, Support, and Diagnostics

**Microscopic scope:**

- Extends base admin with support ticketing, SLA tracking, diagnostics, escalation, and support-window workflows.
- Support windows remain explicit, time-bound, audited, and tenant-visible.
- Diagnostics expose technical detail under Admin/Advanced surfaces, not default business UI.
- AI may assist support triage but cannot open tenant data access without authorised support window.
- Support evidence feeds product improvement and quality metrics.

### 6F.06 — AI Concierge and Advanced Onboarding

**Microscopic scope:**

- Natural-language business description may generate proposed setup, but user approves before changes apply.
- AI Concierge uses registered capabilities only and cannot invent services/workflows/actions.
- Sample data packs are clear, removable, isolated, and never mixed with real data without explicit action.
- Role-based tours adapt to tenant users and modules active for that tenant.
- Onboarding progress uses evidence and identifies product-improvement signals when users need support.

### 6F.07 — Documentation, Community, Training, and Data Migration Workbench

**Microscopic scope:**

- Documentation is separate for users, API/partners, and platform developers/operators.
- Migration workbench supports mapping, validation preview, import evidence, rollback by batch where safe, and deduplication review.
- Community/forum support is moderated and tied to tenant/user permissions.
- AI help may answer from documentation but must identify uncertainty and escalate where needed.
- Data migration never bypasses idempotency, consent, opt-out, tenant isolation, or audit.

### 6F.08 — Advanced Design Polish and Experience Quality System

**Microscopic scope:**

- Builds on 6A base design system; does not replace it with unrelated patterns.
- Noob-proof patterns hide technical/admin details by default and expose diagnostics under Advanced/Admin surfaces.
- Visual QA, accessibility, responsiveness, empty/error/loading states, and user-task clarity are quality gates.
- Advanced dashboards are evidence-backed and avoid fake decorative metrics.
- Design polish applies across earlier module frontends after they exist.

## 8. Forward Dependency Check

PASS: Every 6F component depends only on completed phases 6A–6E or earlier-numbered 6F components. 6F does not introduce backward dependencies into earlier phases; earlier modules expose hooks/evidence, while intelligence consumes them after the fact.


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
