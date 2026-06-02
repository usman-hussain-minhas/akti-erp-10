# Phase 6B — Commerce Core

**Status:** `V4_PHASE_6B_COMMERCE_CORE_SPEC`  
**Document type:** v4 phase specification for sub-surface cataloguing and dependency-aware ticket generation.  
**Non-scope:** No code file paths, endpoint paths, validation commands, implementation instructions, or repo-specific operations.

> **Authority rule:** Business logic authority = `0_Business_Logic.md`; phase documents MUST conform to it. Where a phase document and the business logic document conflict, `0_Business_Logic.md` wins. Service boundaries proposed here are subject to sub-surface validation; dependency ordering and business logic are locked.

> **Dependency rule:** Anything in phase N+1 MUST NOT be developed before phase N. Within a phase, a component may depend only on earlier phases or earlier-numbered components in the same phase. If a feature needs a later dependency, the dependency must be moved earlier, the feature must be split, or the dependent part must be deferred.

## 1. Phase Objective

Phase 6B builds the first business-value layer on the 6A foundation: Products, CRM, and Finance. These must be together because Finance depends on Products and CRM, while CRM relies on Products for interests/expected value and Finance for conversion/payment journeys.

## 2. Entry Dependencies

Phase 6A complete. Within 6B, Products precede CRM, and Finance follows Products/CRM. Finance payroll foundation must not depend on 6C HR; later HR integration is event-based.

## 3. Explicit Non-Scope

- HR, Workspace, Events, LMS, Campaigns, E-Commerce, Website/App Builder, AI Business Consultant, advanced onboarding/design polish.
- Direct provider bypass of Communication Gateway.
- Final service boundaries before sub-surface validation.

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
| 6B.01 | Product Catalogue Service | Candidate tenant service | 6A.03, 6A.05, 6A.06, 6A.10, 6A.13, 6A.18 | None | Products, categories, product media, product status, product history | product.created, product.updated, product.archived | service.activated | Foundry-managed service; archive over delete | Product record evidence; optional per-record pricing |
| 6B.02 | Product Pricing and Package Service | Candidate service/micro-service cluster | 6B.01, 6A.09, 6A.15 | None | Product prices, effective dates, installment plans, package/bundle definitions | product_price.changed, package.created | product.created | Tenant-toggleable only through Product service; pricing immutable in invoices once issued | Pricing evidence; projection source for product sales |
| 6B.03 | Inventory and Stock Movement Service | Candidate optional/core service depending business type | 6B.01, 6B.02 | Storage/file evidence from 6A.14 | Stock levels, locations, lots, serials, movements, purchase stock evidence | stock.reserved, stock.moved, stock.adjusted | product.created | Optional for non-inventory businesses; required for retail/e-commerce packages | Stock movement evidence; storage/record evidence |
| 6B.04 | CRM Lead Intake Service | Candidate tenant service | 6A.05, 6A.06, 6A.10, 6A.11, 6A.12, 6A.13, 6B.01 | None | Leads, sources, intake mappings, consent basis, assignment state | lead.created, lead.source_recorded, lead.assigned | person.created, form.submitted, webhook.received | Foundry-managed; no direct provider messaging | Lead/record evidence; source analytics |
| 6B.05 | CRM Deduplication and Identity Resolution Micro-service | Candidate core micro-service of CRM | 6B.04, 6A.05 | None | Lead/contact match candidates, merge records, duplicate decisions | lead.merged, duplicate.detected | lead.created, identity.linked | Core to CRM; not separately toggleable | Dedup evidence |
| 6B.06 | CRM Pipeline and Timeline Service | Candidate tenant service | 6B.04, 6B.05, 6A.13 | 6B.02 product pricing for expected value | Pipeline stages, activities, notes, timeline entries, stage history | pipeline.stage_changed, crm.timeline_appended | lead.created, config.changed | Foundry-managed; lifecycle configured | Timeline and activity evidence |
| 6B.07 | CRM Communication Engines | Candidate optional micro-services | 6B.06, 6A.11 | Provider adapters registered through 6A.12 | WhatsApp/email conversation metadata, templates, sequence enrollment, send attempts | crm.message_requested, sequence.enrolled, reply.received | communication.sent, communication.blocked | Optional per channel; gateway enforcement mandatory | Message usage evidence; billable communication evidence |
| 6B.08 | CRM Scoring, Follow-Up, and Reporting Service | Candidate service/micro-service cluster | 6B.06, 6B.07, 6A.15 | None | Lead scores, follow-up tasks, reporting definitions, compliance views | lead.score_changed, followup.created, crm.report_generated | crm.timeline_appended, communication.sent | Foundry-managed; scoring rules configurable | Report/task/record evidence |
| 6B.09 | Finance Invoice and Receivables Service | Candidate tenant service | 6B.01, 6B.02, 6B.06, 6A.09, 6A.13 | 6B.08 for CRM conversion signals | Invoices, invoice lines, receivables, credit/debit notes, payment terms | invoice.issued, invoice.voided, credit_note.issued | product_price.changed, pipeline.stage_changed | Foundry-managed; invoices immutable after issue | Invoice/transaction evidence; finance billing |
| 6B.10 | Payment, Collection, and Top-Up Service | Candidate tenant service | 6B.09, 6A.11, 6A.12, 6A.09 | Payment provider extensions | Payments, allocations, receipts, top-ups, provider references, reconciliation candidates | payment.recorded, payment.verified, topup.received, receipt.issued | invoice.issued, webhook.received | Foundry-managed; provider failures degrade gracefully | Payment evidence; provider transaction evidence |
| 6B.11 | Expense, Purchase, and Vendor Service | Candidate tenant service | 6B.10, 6A.05, 6A.13 | 6B.03 inventory for purchase receiving | Vendors, expenses, purchase orders, approvals, receipts | expense.created, po.approved, vendor.updated | payment.verified, rule.blocked | Foundry-managed; approvals capability-gated | Expense/approval evidence |
| 6B.12 | General Ledger and Accounting Service | Candidate tenant service | 6B.09, 6B.10, 6B.11 | Regional compliance packs from 6A.17 | Chart of accounts, journal entries, periods, tax mappings | journal.posted, period.closed, tax_report.generated | invoice.issued, payment.verified, expense.created | Foundry-managed; accounting periods protected | Accounting/report evidence |
| 6B.13 | Banking and Reconciliation Service | Candidate optional service | 6B.10, 6B.12 | Bank/provider extensions | Bank accounts, imported transactions, matches, reconciliation statements | bank_tx.imported, reconciliation.completed | payment.verified, webhook.received | Optional unless package requires it | Reconciliation evidence |
| 6B.14 | Finance Payroll Foundation | Candidate service with HR integration deferred | 6B.10, 6B.12, 6A.05 | None | Payees, payroll batches, payout records, deductions/allowance formulas as finance data | payroll.calculated, payroll.approved, payroll.disbursed | journal.posted, payment.verified | Foundry-managed; HR data dependency is future event integration, not forward build dependency | Payroll run evidence; billable payroll events |
| 6B.15 | Finance Platform Billing UI and Customer Billing Operations | Tenant-facing UI/service layer | 6B.10, 6B.12, 6A.09, 6A.15 | None | Tenant billing view, balance display, budget cap controls, receipts, service spend views | budget.updated, cap.overridden, billing_view.opened | spend.aggregated, topup.received | Tenant-facing; core billing engine remains 6A authority | Billing admin evidence |

## 7. Microscopic Component Scope

### 6B.01 — Product Catalogue Service

**Microscopic scope:**

- Owns product/service/programme/event-ticket/digital/physical/subscription catalogue records.
- Archives products instead of hard-deleting where historical invoices/orders depend on them.
- Links product records to Person only through later customer/lead/student roles, not directly as identity owner.
- Uses 6A storage/file service for media and attachments.
- Emits product lifecycle evidence for reports, pricing, CRM interests, Finance invoicing, LMS programme setup, and E-Commerce later.

### 6B.02 — Product Pricing and Package Service

**Microscopic scope:**

- Maintains product price histories with effective dates.
- Defines bundles, packages, installment plans, early-bird pricing, scholarships/discountable prices, and branch overrides as configuration.
- Feeds projected customer invoice values and CRM expected value.
- Once invoice issued, invoice stores actual price and is not mutated by later product price changes.
- Supports Quick Start/Recommended/Full Power product package suggestions where relevant to business type.

### 6B.03 — Inventory and Stock Movement Service

**Microscopic scope:**

- Owns stock locations, stock movements, reservations, transfers, adjustments, lots, serials, and reorder levels.
- Optional for non-inventory tenants; core for retail and e-commerce-ready packages.
- No E-Commerce dependency exists here; E-Commerce later consumes inventory.
- Every stock movement is evidence-producing and auditable.
- Purchase receiving may integrate with 6B.11 but does not depend on 6C/6D/6E.

### 6B.04 — CRM Lead Intake Service

**Microscopic scope:**

- All lead sources normalize into one lead structure.
- Inbound forms/webhooks use 6A idempotency and webhook dedupe.
- No direct WhatsApp/Email/SMS provider bypass; communication requests route through 6A Communication Gateway.
- Lead source is recorded as evidence and correction requires audited override.
- Product interest links to 6B.01 products without making CRM own product data.

### 6B.05 — CRM Deduplication and Identity Resolution Micro-service

**Microscopic scope:**

- Uses Person / Identity Graph to resolve contacts, raw contact values, and consent history.
- Exact phone/contact matching may merge automatically where configured; ambiguous matches require human review.
- Merge preserves full timeline, source, and audit evidence.
- Deduplication rules are configurable, but identity integrity and audit are hard.
- Supports later Events, LMS, Campaigns, and Finance without letting those modules own global identity.

### 6B.06 — CRM Pipeline and Timeline Service

**Microscopic scope:**

- Pipelines, stages, stage transitions, required fields, reason codes, and workflows are configuration-driven.
- Timeline is append-only for communications, notes, stage changes, assignments, score changes, tasks, forms, files, invoices, payments, and merges.
- Kanban/list/calendar views are Tenant Frontend surfaces using base design system.
- Won/lost events become cross-service events; Finance invoicing may consume them.
- Pipeline movement does not directly write Finance or LMS tables; it emits events/Saga triggers.

### 6B.07 — CRM Communication Engines

**Microscopic scope:**

- Provides CRM-specific conversation UX, templates, sequences, and reply matching.
- All send attempts go through 6A Communication Gateway and global opt-out enforcement.
- Channel availability depends on configured providers/adapters, not hardcoded provider logic.
- Marketing opt-out blocks promotional sends; transactional notices remain allowed where legally/operationally required.
- Sequences pause on reply and emit evidence for scoring and follow-up.

### 6B.08 — CRM Scoring, Follow-Up, and Reporting Service

**Microscopic scope:**

- Scoring rules are tenant-configured from registered signals.
- Follow-up tasks can be generated from lead activity, score changes, stage rules, or workflows.
- Reports use CRM-owned data and approved cross-service evidence rather than direct unauthorized table reads.
- Optimize hooks expose unused channels, low-value sequences, inactive pipelines, and cost-heavy lead sources.
- Manager compliance views use evidence rather than decorative fake dashboards.

### 6B.09 — Finance Invoice and Receivables Service

**Microscopic scope:**

- Invoices can originate from products, CRM conversions, manual finance actions, later LMS enrollment, later event registration, and later e-commerce order flows.
- Invoice content, line items, tax, prices, and discounts are immutable after issue.
- Corrections use credit notes, debit notes, reversals, or replacement invoices.
- Regional tax/compliance behavior is read from compliance packs, not hardcoded Pakistan/FBR global rules.
- Invoices emit events for payments, collections, GL, CRM timeline, and later LMS/Event/E-Commerce Sagas.

### 6B.10 — Payment, Collection, and Top-Up Service

**Microscopic scope:**

- Payment callbacks use provider event/transaction identity for idempotency and reconciliation.
- Partial payments use allocation records and computed balances.
- Top-ups fund prepaid balance; prepaid balance remains core financial availability source.
- Receipts are immutable evidence artifacts once issued.
- Provider failures degrade to manual payment recording where allowed by tenant policy.

### 6B.11 — Expense, Purchase, and Vendor Service

**Microscopic scope:**

- Vendors link to Person/Organisation concepts without owning global identity.
- Expense approvals use configurable approval chains and Gatekeeper for high-risk/financial capability checks.
- Purchase orders, receiving, and vendor invoices support evidence for GL and reconciliation.
- If inventory is active, purchase receiving can emit stock movement events to 6B.03.
- Expense records follow soft-delete and audit retention rules.

### 6B.12 — General Ledger and Accounting Service

**Microscopic scope:**

- Receives finance events and posts journals according to configured chart of accounts.
- Supports period management, soft close, hard close, and audit-protected corrections.
- Tax reports use regional compliance packs.
- GL is not bypassed by modules; modules emit financial events consumed by Finance.
- Accounting reports are evidence-backed and exportable according to tenant permissions.

### 6B.13 — Banking and Reconciliation Service

**Microscopic scope:**

- Imports bank/provider transactions through registered adapters or manual upload.
- Matches transactions to payment/receipt/invoice evidence with confidence scoring.
- Unmatched items remain visible and auditable.
- Period reconciliation emits close evidence and can restrict later edits according to rules.
- Optional service; tenants without bank integration may use manual reconciliation.

### 6B.14 — Finance Payroll Foundation

**Microscopic scope:**

- Finance owns payroll calculation, approval, disbursement, payslip/receipt evidence, and accounting postings.
- In 6B, payees and payroll inputs may be finance-managed to avoid depending on future HR.
- When 6C HR exists, HR emits employee/attendance/leave/commission events consumed by payroll through events/Saga, not direct dependency backwards.
- Payroll run can be billable and emits usage evidence.
- MFA and financial capability checks are mandatory for payroll approval/disbursement.

### 6B.15 — Finance Platform Billing UI and Customer Billing Operations

**Microscopic scope:**

- Provides tenant-facing balance, top-up, invoices, receipts, budget cap, spend counter, and service-cost UI.
- Core billing calculations remain in 6A; Finance UI reads approved billing evidence and exposes tenant-facing operations.
- Hard cap override is restricted to Billing Authority or delegate with explicit budget permission.
- Spend block reason always identifies budget cap vs prepaid balance.
- Projected cost and actual spend are visually separated.

## 8. Forward Dependency Check

PASS: 6B components depend only on 6A or earlier-numbered 6B components. Finance follows Products and CRM. Payroll foundation is split to avoid depending on 6C HR; HR-to-payroll integration is deferred to 6C through events. No 6B component depends on 6C, 6D, 6E, or 6F.


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
