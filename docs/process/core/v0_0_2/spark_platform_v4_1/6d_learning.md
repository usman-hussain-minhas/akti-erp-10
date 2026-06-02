# Phase 6D — Learning

**Status:** `V4_PHASE_6D_LEARNING_SPEC`  
**Document type:** v4 phase specification for sub-surface cataloguing and dependency-aware ticket generation.  
**Non-scope:** No code file paths, endpoint paths, validation commands, implementation instructions, or repo-specific operations.

> **Authority rule:** Business logic authority = `0_Business_Logic.md`; phase documents MUST conform to it. Where a phase document and the business logic document conflict, `0_Business_Logic.md` wins. Service boundaries proposed here are subject to sub-surface validation; dependency ordering and business logic are locked.

> **Dependency rule:** Anything in phase N+1 MUST NOT be developed before phase N. Within a phase, a component may depend only on earlier phases or earlier-numbered components in the same phase. If a feature needs a later dependency, the dependency must be moved earlier, the feature must be split, or the dependent part must be deferred.

## 1. Phase Objective

Phase 6D builds the full LMS after Commerce Core and Operations exist. It depends on Products, CRM, Finance, HR attendance concepts, Workspace, Events/calendar support where earlier, and the foundation systems. It must not depend on Growth Surface or Intelligence phases.

## 2. Entry Dependencies

Phase 6A, 6B, and 6C complete. LMS may depend on Products, CRM, Finance, HR attendance methods, Workspace calendar/messaging, and Events only where Events already exists in 6C. LMS does not depend on Campaigns, E-Commerce, Website Builder, AI Business Consultant, or advanced design polish.

## 3. Explicit Non-Scope

- Campaigns, E-Commerce, Website/App Builder, AI Business Consultant, advanced onboarding/support/design polish.
- Full event/campaign marketing automations beyond LMS notifications.
- Hardcoded education thresholds, grading formulas, attendance percentages, programme stages, or certificate criteria.
- Final SCORM/xAPI/H5P/LRS micro-service boundaries before sub-surface validation.

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
| 6D.01 | Academic Structure and Programme Catalogue | Candidate LMS service | 6B.01, 6B.02, 6C.07, 6A.13 | None | Faculties/departments/programmes/courses/sections, academic terms, credit rules | programme.created, course.created, academic_term.opened | product.created, config.changed | Foundry-managed LMS service foundation | Programme/course evidence |
| 6D.02 | Student Profile and Lifecycle Service | Candidate LMS service | 6D.01, 6A.05, 6B.04, 6B.09, 6B.10 | 6C.05 Workspace channels | Student role extensions, applications, admissions, enrollment state, documents | student.created, application.submitted, admission.confirmed, enrollment.created | person.created, lead.created, payment.verified | Foundry-managed; admission requirements configurable | Student/enrollment evidence |
| 6D.03 | Timetable, Classes, and Cohort Operations | Candidate LMS service | 6D.02, 6C.07, 6C.05 | Meeting provider extensions | Class sessions, cohorts, rooms/links, substitutions, rosters | class.scheduled, cohort.created, substitution.assigned | enrollment.created, meeting.scheduled | Foundry-managed; schedule rules configurable | Class/session evidence |
| 6D.04 | LMS Attendance and At-Risk Rules | Candidate LMS micro-service cluster | 6D.03, 6C.03, 6A.13, 6A.11 | None | Student attendance, absence reasons, risk flags, intervention tasks | student_attendance.marked, at_risk.flagged, absence.notified | class.scheduled, attendance.marked | Core for in-person/online learning packages; methods configurable | Attendance/risk evidence |
| 6D.05 | Assignments, Submissions, and Academic Integrity | Candidate LMS service | 6D.03, 6A.14, 6A.13 | Plagiarism provider extensions | Assignments, submissions, rubrics, feedback, integrity logs | assignment.published, submission.received, grade_item.created, integrity.flagged | class.scheduled, file.stored | Foundry-managed; policies configurable | Submission/storage/evaluation evidence |
| 6D.06 | Assessment and Examination Service | Candidate LMS service | 6D.05, 6C.07 | Proctoring/lockdown extensions | Question banks, quizzes, exams, seating, attempts, moderation | assessment.created, attempt.submitted, exam.completed | submission.received, meeting.scheduled | Foundry-managed; exam rules configurable | Assessment/report evidence |
| 6D.07 | Grading, Transcript, and Progression Service | Candidate LMS service | 6D.06, 6D.04, 6A.13 | None | Grade formulas, scales, releases, appeals, transcripts, progression status | grade.released, transcript.generated, progression.updated | attempt.submitted, student_attendance.marked | Foundry-managed; formulas configurable | Transcript/report evidence |
| 6D.08 | Content Library and Learning Standards Service | Candidate LMS service/micro-service cluster | 6D.03, 6A.14 | SCORM/xAPI/H5P/LRS extensions subject to sub-surface validation | Learning content, modules/topics, completion state, content package metadata | content.published, content.completed, lrs.statement_recorded | enrollment.created, file.stored | Core/optional split validated in sub-surface cataloguing | Storage/content/progress evidence |
| 6D.09 | Student, Teacher, Coordinator, and Parent Portals | Candidate LMS UI/service layer | 6D.02, 6D.03, 6D.04, 6D.05, 6D.07, 6D.08, 6C.05 | None | Portal preferences, dashboard views, guardian links, communication preferences | portal.viewed, guardian.linked, portal_action.requested | grade.released, content.completed, absence.notified | Tenant-facing LMS UI; access capability-scoped | Portal usage evidence |
| 6D.10 | Certificates, Completion, Alumni, and University-Scale Extensions | Candidate LMS service cluster | 6D.07, 6D.09, 6B.06, 6C.08 | None | Certificates, credential IDs, revocations, alumni status, degree audits, thesis milestones | certificate.issued, certificate.revoked, alumni.created, degree_audit.updated | progression.updated, event.created | Foundry-managed; certificate revocation audited | Certificate/alumni/credential evidence |

## 7. Microscopic Component Scope

### 6D.01 — Academic Structure and Programme Catalogue

**Microscopic scope:**

- Creates the academic hierarchy and programme/course catalogue using Products as commercial catalogue source where relevant.
- Supports training centres, schools, colleges, universities, corporate training, and professional certification bodies through configuration.
- Credit rules, academic terms, prerequisites, sections, and programme requirements are data-driven.
- No LMS component depends on 6E website/e-commerce/campaigns.
- Education-specific defaults can be seeded through industry configuration packages.

### 6D.02 — Student Profile and Lifecycle Service

**Microscopic scope:**

- Student is a role-specific extension linked to core Person.
- Applications may originate from CRM leads, forms, or direct LMS application paths.
- Admission confirmation can depend on payment gate, document verification, test score, interview result, or configured rule combination.
- Enrollment creation from CRM/Finance is a Saga, not direct table mutation.
- Student documents use 6A file service and follow data protection rules.

### 6D.03 — Timetable, Classes, and Cohort Operations

**Microscopic scope:**

- Cohorts, rosters, timetables, class sessions, rooms, meeting links, substitutions, makeup classes, and delivery modes are configurable.
- Calendar integration uses Workspace calendar; meeting providers are extensions.
- Conflict detection covers teacher, room, class, cohort, and student conflicts where data exists.
- Cohort Workspace channels may be created through events when Workspace is active.
- Schedule publishing emits notifications through Communication Gateway.

### 6D.04 — LMS Attendance and At-Risk Rules

**Microscopic scope:**

- Reuses HR/operations attendance method concepts but stores student attendance as LMS-owned records.
- Attendance thresholds, late rules, excused absence rules, makeup policies, parent alerts, and at-risk criteria are configuration-driven.
- At-risk flags can create tasks, messages, coordinator alerts, or workflow actions through registered capabilities.
- Marketing opt-out does not block mandatory academic/security/billing notices where allowed.
- Attendance evidence feeds progression and AI context later.

### 6D.05 — Assignments, Submissions, and Academic Integrity

**Microscopic scope:**

- Assignment policies include due dates, extensions, resubmission limits, file types, late penalties, grading rubrics, and release controls as configuration.
- Submissions use file service and emit storage/content evidence.
- Academic integrity logs may record tab switching, focus loss, copy/paste events, and plagiarism-provider results where policy allows.
- Teacher feedback and grades are evidence-backed and auditable.
- Group assignments link multiple students while preserving individual evidence.

### 6D.06 — Assessment and Examination Service

**Microscopic scope:**

- Question bank, online quizzes, in-person exams, seating, attempts, moderation, invigilation, and result imports are LMS-owned.
- Lockdown/proctoring integrations are optional extensions, not hardcoded LMS requirements.
- Assessment rules and grade release settings are configurable.
- Assessment evidence feeds grading and progression.
- Exam scheduling uses Workspace calendar, avoiding a dependency on later Events/Growth surfaces.

### 6D.07 — Grading, Transcript, and Progression Service

**Microscopic scope:**

- Grade formulas, component weights, grade scales, pass/fail/distinction rules, GPA, academic standing, and progression rules are configuration-driven.
- Grade release is an explicit action and is audited.
- Grade appeal workflow is configurable and evidence-backed.
- Transcripts are generated from immutable grade history and programme rules.
- Progression outputs can trigger certificate eligibility and alumni transition.

### 6D.08 — Content Library and Learning Standards Service

**Microscopic scope:**

- Organises content by programme, course, week, module, topic, and content type.
- Supports video, PDF, presentation, audio, external link, embedded resources, and standards-based packages.
- Exact split of SCORM, xAPI, H5P, and LRS into core vs optional micro-services is deferred to sub-surface validation.
- Content completion emits evidence for progress and future AI.
- Content access follows payment/financial hold rules configured through LMS/Finance integration.

### 6D.09 — Student, Teacher, Coordinator, and Parent Portals

**Microscopic scope:**

- Portals expose role-specific views only through registered capabilities.
- Student sees schedule, assignments, resources, grades, attendance, fee/payment view, certificates, and messages where allowed.
- Teacher sees rosters, attendance marking, grading queue, class resources, assignments, and communication tools.
- Coordinator sees programme health, at-risk students, teacher load, escalation queues, timetable conflicts, and bulk communication tools.
- Parent/guardian portal links to student Person relationship and shows only configured allowed sections. Parent/guardian views consume attendance and absence events from 6D.04; 6D.04 does not depend on the portal.

### 6D.10 — Certificates, Completion, Alumni, and University-Scale Extensions

**Microscopic scope:**

- Completion criteria are configuration-driven: attendance, grades, credit hours, project/portfolio, payment, documents, or any registered rule combination.
- Certificates have immutable credential IDs, verification URLs, revocation workflow, and audit evidence.
- Alumni transition updates CRM/alumni role state through events, preserving student history.
- University-scale extensions include degree audits, prerequisites, electives, academic standing, thesis/dissertation milestones, accreditation outputs, and outcome mapping.
- Certificate revocation is high-risk and requires human approval and audit.

## 8. Forward Dependency Check

PASS: Every 6D component depends only on 6A, 6B, 6C, or earlier-numbered 6D components. No LMS component depends on Campaigns, E-Commerce, Website Builder, AI Business Consultant, advanced onboarding/admin, or design polish.


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
