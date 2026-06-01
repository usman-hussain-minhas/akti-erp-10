# Phase 6C — Operations

**Status:** `V4_PHASE_6C_OPERATIONS_SPEC`  
**Document type:** v4 phase specification for sub-surface cataloguing and dependency-aware ticket generation.  
**Non-scope:** No code file paths, endpoint paths, validation commands, implementation instructions, or repo-specific operations.

> **Authority rule:** Business logic authority = `0_Business_Logic.md`; phase documents MUST conform to it. Where a phase document and the business logic document conflict, `0_Business_Logic.md` wins. Service boundaries proposed here are subject to sub-surface validation; dependency ordering and business logic are locked.

> **Dependency rule:** Anything in phase N+1 MUST NOT be developed before phase N. Within a phase, a component may depend only on earlier phases or earlier-numbered components in the same phase. If a feature needs a later dependency, the dependency must be moved earlier, the feature must be split, or the dependent part must be deferred.

## 1. Phase Objective

Phase 6C builds operational services that depend on the commerce foundation: HR, Workspace, and Events. It turns the platform from sales/finance foundation into day-to-day operations for people, collaboration, scheduling, projects, and event delivery.

## 2. Entry Dependencies

Phase 6A and 6B complete. Within 6C, HR employee structure comes first, then HR operational services, then Workspace, then Events. Events depends on Products/CRM/Finance and Workspace calendar capabilities.

## 3. Explicit Non-Scope

- LMS, Campaigns, E-Commerce, Website/App Builder, AI Business Consultant, advanced onboarding/support/design polish.
- HR owning global Person identity.
- Events directly bypassing CRM/Finance/Communication Gateway.
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
| 6C.01 | HR Employee Records and Organisation Structure | Candidate tenant service | 6A.05, 6A.06, 6A.13, 6B.14 | None | Employee role extensions, departments, teams, positions, contracts, documents | employee.created, org_position.changed | person.created, payroll.disbursed | Foundry-managed; employee data soft-protected | Employee/profile evidence |
| 6C.02 | HR Recruitment and Onboarding Pipeline | Candidate service/micro-service | 6C.01, 6B.04, 6B.06 | None | Requisitions, applicants, scorecards, interviews, offers, onboarding tasks | candidate.created, offer.issued, onboarding.started | lead.created, pipeline.stage_changed | Foundry-managed; configurable lifecycle | Recruitment evidence |
| 6C.03 | HR Attendance, Leave, and Time Tracking | Candidate tenant service | 6C.01, 6A.11, 6A.13 | Device/provider extensions | Attendance events, shifts, leave balances, approvals, holidays | attendance.marked, leave.requested, leave.approved | employee.created, rule.blocked | Foundry-managed; methods configurable | Attendance/leave evidence; possible payroll inputs |
| 6C.04 | HR Performance, Commission, Policy, and Offboarding | Candidate service cluster | 6C.01, 6C.03, 6B.10, 6B.12, 6B.14 | CRM performance signals from 6B.08 | Performance cycles, goals, commissions, policies, acknowledgements, offboarding checklist | commission.approved, policy.acknowledged, offboarding.started, access_revocation.requested | attendance.marked, payment.verified | Foundry-managed; high-risk offboarding uses Gatekeeper | Commission/offboarding evidence |
| 6C.05 | Workspace Messaging and Collaboration | Candidate tenant service | 6A.05, 6A.06, 6A.11, 6A.14, 6C.01 | None | Channels, messages, threads, reactions, attachments, read state | message.sent, channel.created, mention.created | employee.created, communication.sent | Foundry-managed; channel policies configurable | Message/storage evidence |
| 6C.06 | Workspace Tasks, Projects, Documents, and Knowledge | Candidate service cluster | 6C.05, 6A.14, 6A.13 | 6B Finance for project budgets | Tasks, projects, wiki pages, document folders, versions, time logs | task.created, project.updated, wiki.versioned | message.sent, file.stored | Foundry-managed; cross-module tasks allowed through events | Task/time/storage evidence |
| 6C.07 | Workspace Calendar, Meetings, Rooms, Announcements | Candidate service cluster | 6C.05, 6C.06 | Calendar provider extensions | Calendars, meeting records, room/resource bookings, announcements, reminders | meeting.scheduled, room.booked, announcement.sent | task.created, message.sent | Foundry-managed; announcements route through gateway/preferences | Calendar/notification evidence |
| 6C.08 | Events Configuration and Registration Service | Candidate tenant service | 6B.01, 6B.09, 6B.10, 6B.04, 6C.07 | None | Events, sessions, speakers, ticket types, registration forms, waitlists | event.created, registration.submitted, waitlist.promoted | product.created, invoice.issued, meeting.scheduled | Foundry-managed; registration package-specific | Registration/ticket evidence |
| 6C.09 | Events Check-In and Post-Event Service | Candidate micro-service cluster | 6C.08, 6A.11, 6A.14, 6B.06 | 6C.05 Workspace channels | Tickets, QR codes, check-ins, feedback, post-event resources, lead conversion mapping | ticket.issued, attendee.checked_in, feedback.submitted, event_lead.created | registration.submitted, communication.sent | Optional depending event package; check-in rules configurable | Check-in/feedback/lead evidence |

## 7. Microscopic Component Scope

### 6C.01 — HR Employee Records and Organisation Structure

**Microscopic scope:**

- Employee is a role-specific extension linked to core Person; HR does not own Person.
- Organisation structures, departments, teams, positions, reporting lines, and employee assignments are configurable.
- Employee documents use 6A file/storage and follow soft-delete/purge rules.
- Compensation metadata can feed Finance payroll through events without making Finance depend on HR at build time.
- Employment changes are audit/evidence-producing.

### 6C.02 — HR Recruitment and Onboarding Pipeline

**Microscopic scope:**

- Recruitment stages, forms, scorecards, interview stages, offer steps, and onboarding tasks are configuration-driven.
- Applicants may originate from CRM leads or direct HR forms.
- Offer acceptance can trigger employee creation and onboarding workflow.
- No direct access provisioning bypasses Gatekeeper; access provisioning emits events.
- Recruitment integrates with Workspace through events when Workspace is active; Workspace consumes recruitment/onboarding events later in the phase and is not a dependency of recruitment.

### 6C.03 — HR Attendance, Leave, and Time Tracking

**Microscopic scope:**

- Attendance methods are registered capabilities: geofenced QR, biometric device, RFID/NFC, mobile GPS, manual override.
- Leave types, accrual, carry-forward, expiry, encashment, approvals, and holidays are data-driven.
- Attendance and leave can emit payroll input evidence consumed by 6B payroll foundation.
- Manual attendance override requires reason and may require approval.
- Device/provider failure degrades to allowed fallback methods without blocking unrelated HR records.

### 6C.04 — HR Performance, Commission, Policy, and Offboarding

**Microscopic scope:**

- Performance frameworks, rating scales, review cycles, forms, and at-risk flags are configurable.
- Commission schemes can consume CRM/payment evidence and emit approved commission batches to Finance payroll.
- Policies are versioned; acknowledgements are evidence records.
- Offboarding is a Saga when it crosses HR, Finance, Workspace, assets, and access revocation.
- Access revocation must route through Gatekeeper and session revocation evidence.

### 6C.05 — Workspace Messaging and Collaboration

**Microscopic scope:**

- Channels, DMs, mentions, threads, attachments, announcements, and read receipts operate inside Tenant Frontend.
- Workspace uses Person/employee identity but does not own HR employee records.
- Files use 6A file service; outbound notifications use Communication Gateway.
- Message edit history and archive preserve audit where required.
- Workspace becomes the shared collaboration substrate for later LMS, Events, and advanced admin/support.

### 6C.06 — Workspace Tasks, Projects, Documents, and Knowledge

**Microscopic scope:**

- Tasks can be linked to any earlier module record through registered cross-module references.
- Projects may consume Finance budget data as optional read/evidence, without writing Finance internals.
- Knowledge base pages are versioned and restorable.
- Time tracking emits evidence and may later support billing dimensions.
- Document restore follows customer-first data protection rules.

### 6C.07 — Workspace Calendar, Meetings, Rooms, Announcements

**Microscopic scope:**

- Calendar entries may originate from HR, tasks/projects, events, and later LMS.
- Meeting provider integrations are registered extensions, not hardcoded provider dependencies.
- Announcements use Communication Gateway for outbound delivery and respect notification preferences/mandatory notice distinctions.
- Room/resource booking enforces conflicts and emits booking evidence.
- Reminders and quiet hours are configurable.

### 6C.08 — Events Configuration and Registration Service

**Microscopic scope:**

- Events use Products for ticket/product definitions, CRM for lead capture, Finance for invoices/payments, and Workspace Calendar for scheduling.
- Registration forms are Configuration Engine forms.
- Waitlist rules, claim deadlines, approval requirements, ticket types, and capacities are configurable.
- Billable registration flows use Finance invoices and payment events via Saga.
- Events do not depend on LMS; LMS may later consume events if needed.

### 6C.09 — Events Check-In and Post-Event Service

**Microscopic scope:**

- QR ticket issuing follows payment/registration state and emits ticket evidence.
- Check-in windows, manual override, kiosk mode, session-level check-in, and badge export are configurable.
- Post-event feedback forms are Configuration Engine forms.
- Attendees can create/update CRM leads through events, not direct CRM internal writes.
- Certificates of attendance may use file/certificate primitives, but full LMS certification remains 6D.

## 8. Forward Dependency Check

PASS: Every 6C component depends only on 6A, 6B, or earlier-numbered 6C components. LMS, Campaigns, E-Commerce, Website Builder, AI Business Consultant, advanced admin, and design polish are not dependencies.


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
