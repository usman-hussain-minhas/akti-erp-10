Sub-Surface Decomposition Guide for Genesis
How to read this guide
Each phase document gives Genesis candidate components (coarse boundaries) plus an Appendix B instruction to validate them. This guide tells Genesis where the real splits are inside each candidate, so the sub-surface catalog produces executable surfaces rather than bundled wrappers — the exact failure that sank PR #39, #40, and #41.
For every candidate component, Genesis must decide one of six outcomes (the Appendix B verbs): keep as one service, split into multiple services, merge into an earlier service, demote to core micro-service, demote to optional micro-service, or defer to a later phase. The notes below tell Genesis which candidates are bundles hiding multiple surfaces, and what the split axis is.
There are five recurring decomposition axes. Genesis should apply them mechanically:
AXIS 1 — PROVIDER:   one surface per external provider (each has its own
                     auth, webhook format, failure mode, reversal/retry rules)
AXIS 2 — STANDARD:   one surface per formal spec/standard (each has its own
                     data model and compliance requirements)
AXIS 3 — CHANNEL:    one surface per communication channel (each is an
                     independently toggleable, independently billed micro-service)
AXIS 4 — LIFECYCLE:  one surface per distinct stateful stage (each has its own
                     state machine, transitions, and edge cases)
AXIS 5 — ROLE/PORTAL: one surface per role-scoped access boundary (each has its
                     own data-scoping security rule)
A single sentence naming several providers, standards, channels, stages, or roles is a decomposition instruction, never one ticket.

Phase 6A — Foundation
6A is mostly core platform systems, which are not marketplace services and not tenant-toggleable. But several are bundles that must still split into separate buildable surfaces.
6A.03 — Storage, SVFS, Backup, Image Pipeline. Four distinct surfaces bundled by the label:
SVFS content-addressed object store (hash, write-once, ref pointers, version tree)
Backup engine (incremental, encryption, Shamir 2-of-3 recovery, restore-drill)
Image processing pipeline (format matrix in × WebP variant matrix out)
Soft-delete / staged-deletion infrastructure (two distinct mechanisms, ADL-006)
Split axis: each has its own data model and failure mode. The image pipeline further decomposes by the input-format × output-variant matrix.
6A.08 — Outbox, Event Bus, DLQ. This is the ADL-001/ADL-002 cluster. Split:
Transactional outbox writer (event + state change atomic)
Event bus delivery (at-least-once, subscription registry)
Dead Letter Queue + admin inspection/replay
Saga orchestrator (the workflow execution record + step sequencer)
Saga compensation dispatcher (reverse-order compensation on failure)
Saga terminal-state handler
This is the single most-bundled item in 6A. ADL-001 alone is four surfaces (orchestrator, execution record, compensation, terminal states). Do not let "event bus" be one ticket.
6A.09 — Billing Engine + Pricing Registry. Split:
Pricing table with effective-date ranges (numeric values, never in manifest)
Billing dimension / measurement registry (unit, source, aggregation, formula, rounding)
Evidence aggregation engine (hourly default; the actual-spend counter source)
Projected-cost calculator (instant, pricing-table-only, never mutates spend)
Budget cap primitives (soft/hard, scopes)
Prepaid balance primitives (source of truth for funds)
Split axis: projected vs actual is a hard architectural line (business logic §13.2) and must be two surfaces.
6A.11 — Communication Gateway + Global Opt-Out. Split:
Outbound gateway enforcement (no module bypasses it — ADL-004)
Global opt-out registry (person_id + contact_value + channel, NULL fallback,
                         retroactive attachment — §8.3)
Per-provider circuit breaker + queue-on-unavailable
Rate-limit enforcement per recipient/channel/window
The opt-out resolution order in §8.3 (four numbered steps) is itself the spec for the registry surface.
6A.13 — Configuration Engine. This is the Level 5 cluster. Split by builder:
Visual Workflow Builder (triggers/conditions/actions, all from registry)
Lifecycle Builder (stages, transitions, approval gates, hooks)
Rules Engine (synchronous pre-transition enforcement)
Form Builder (fields, routing, dedup, analytics, spam protection)
Custom Fields system (instances of registered field types)
Template Library (packages, versioning, conflict detection)
AI Configuration Wizard foundation (registered-capabilities-only generation)
Split axis: each builder is independently meaningful. Note the registered-capabilities rule — none of these can invent execution behavior; they compose registry entries.
6A.16 — AI Proxy + Governance. Split:
Model routing / tier classification
Data-classification enforcement (readable / restricted / prohibited)
AI cost-cap enforcement (hard pause at cap)
Per-query credit/evidence metering
The classification-enforcement surface is a safety gate that sits in front of every AI call; it is not optional and not the same surface as routing.
6A.17 / 6A.18 — Base Admin and Base Design. These are deliberately the base split from their 6F advanced counterparts. Genesis keeps them minimal: base admin = tenant setup, industry selection, package selection, users, roles, billing authority. Base design = tokens + core component contracts + shell. Everything advanced is already deferred to 6F.05/6F.06/6F.08, so Genesis must not pull advanced onboarding, AI Concierge, or design polish forward into 6A.

Phase 6B — Commerce Core
6B.02 — Product Pricing and Package. Split by pricing model (the v3 spec named six):
Fixed / tiered / volume / per-unit / per-hour / per-period (each a calc surface)
Early-bird pricing (deadline-driven)
Scholarship/discount pricing (approval-gated above threshold)
Installment plan engine (scheduling + allocation + balance — ADL-013)
Bundle/package composition (resolves child product pricing/stock)
Discount engine (stacking order ADL-015; separate ordered surface from tax)
Split axis: PRICING-MODEL. The installment engine and the discount engine are the two that most need their own surfaces because they carry stateful allocation and ordered-calculation logic.
6B.04 — CRM Lead Intake. Split by PROVIDER (Axis 1). The v3 spec named ~12 source connectors:
Meta Lead Forms / Meta WhatsApp / TikTok Lead Gen / Google Ads / Google Business /
Facebook page forms / Web form / Manual entry / CSV-Excel import / API intake /
Referral / inbound WhatsApp / inbound SMS / chatbot / live chat / email / phone / walk-in
Each connector has its own webhook format, field mapping, and auth. The unified lead record is one surface; each connector is a separate integration surface. ADL-021 (immutable source) applies across all.
6B.07 — CRM Communication Engines. Split by CHANNEL (Axis 3):
WhatsApp engine → further splits: template management / inbound routing /
                  outbound 24h-window / broadcast / auto-reply (5 sub-surfaces)
Email engine → connected inbox / transactional sending domain / sequences / shared inbox
Each channel is an independently toggleable, independently billed optional micro-service. WhatsApp internally is five surfaces (from the v3 spec), not one.
6B.10 — Payment, Collection, Top-Up. Split by PROVIDER FAMILY (Axis 1) — the canonical PR #41 failure was bundling all four local gateways into one ticket:
Local gateway family: JazzCash / EasyPaisa / RAAST / QuickPay-shadow-account
                      (each separate: different auth, webhook, reversal window)
International family: Stripe (3D Secure) / Wise
Generic webhook/manual-reconciliation path
Payment allocation + balance computation (ADL-013, computed-not-stored)
Refund workflow (ADL-014, to-original-method with manual fallback)
Top-up + prepaid credit
This is the highest-priority decomposition in 6B. Each gateway is its own surface.
6B.12 — General Ledger. Split:
Chart of accounts (configurable, region templates)
Journal entry engine (auto from modules + manual + recurring + reversing)
Period management (soft close / hard close)
Tax mapping + reporting (regional compliance pack consumer)
ADL-016 (FX gain/loss) and ADL-018 (tax rounding) attach here.
6B.14 — Payroll Foundation. Split:
Tax-slab calculator (FBR slabs, regional compliance pack)
Allowance/deduction formula engine
Payroll run state machine (calculate → review → approve → disburse)
Disbursement file export (interbank batch format)
The HR dependency is event-based and deferred — Genesis must keep payroll's financial surfaces in 6B and the HR data feed as a consumed event, never a forward build dependency.

Phase 6C — Operations
6C.03 — HR Attendance. Split by METHOD FAMILY (Axis 1, hardware variant):
Geofenced time-windowed QR (server-side geofence, supervisor + self-scan modes)
Network biometric device → further splits per brand adapter (ZKTeco/ESSL/Suprema/HikVision)
RFID/NFC reader
Mobile GPS check-in (geofence + liveness photo + offline queue)
Manual override (reason + optional approval)
Leave management (types/accrual/carry-forward-expiry/encashment — own dated logic)
Each family has different hardware, verification, and offline-buffer behavior. The cross-family edge cases (late arrival, duplicate, clock skew, GPS accuracy, missing checkout) are part of each family's surface. ADL-024 (time-window enforcement) applies.
6C.04 — HR Performance, Commission, Policy, Offboarding. This cluster splits into four-plus surfaces, with commission itself decomposing:
Performance management (OKR/KPI, review cycles, at-risk via Rules Engine)
Commission engine → splits: calculation / deferred-release scheduler /
                    clawback reversal handler / tier-accelerator evaluator /
                    pool distribution (5 sub-surfaces — stateful over time)
Policy library (versioned, acknowledgement evidence)
Offboarding (Saga: settlement → asset recovery → Gatekeeper access revocation)
Commission clawback and deferred release carry future-dated state and must be separate surfaces. Offboarding is explicitly a Saga.
6C.05 / 6C.06 / 6C.07 — Workspace clusters. Split:
6C.05: messaging real-time / edit-history model / optional E2E encryption
6C.06: tasks / projects+Gantt-dependency-engine / wiki collaborative-editing / time-tracking
6C.07: calendar / per-provider sync (Google, Outlook each own integration) /
       conferencing link gen (Meet, Zoom each own integration) / room booking / announcements
Each external calendar sync and each conferencing provider is its own integration surface (Axis 1).
6C.08 / 6C.09 — Events. Split:
6C.08: event configuration / multi-track-session model / speaker+honorarium /
       registration form / per-ticket-type capacity / waitlist auto-promotion timer (ADL-023)
6C.09: QR ticket issuing / check-in time-window enforcement (ADL-024) /
       kiosk + session-level check-in / feedback subsystem / CRM lead handoff
The waitlist auto-promotion timer (ADL-023) and check-in window (ADL-024) are distinct timed surfaces.

Phase 6D — Learning (the most-bundled phase)
6D.02 — Student Lifecycle. Split by LIFECYCLE STAGE (Axis 4) — each stage is a stateful subsystem:
Inquiry/application (form + merit-list ranking + applicant status portal)
Admission confirmation (conditional-requirement evaluator + letter generation)
Enrollment/onboarding (student-number generation + Workspace cohort provisioning)
Pre-class preparation (prerequisite check — shared with university registration)
Mid-programme checkpoints (financial-hold: 3 configurable modes)
Completion/certification (criteria evaluator — distinct from cert generator)
Alumni transition
6D.04 — LMS Attendance. Reuses the 6C.03 method families but stores LMS-owned records. Same split by method family; the at-risk-flag engine is its own surface (any-combination trigger → configurable workflow).
6D.05 — Assignments + Integrity. Split:
Assignment definition + submission handling
Resubmission-limit logic / rubric grading / PDF annotation
Cheating-detection log (tab-switch/focus-loss/paste events — own subsystem)
Plagiarism provider integration (Turnitin/Copyleaks — Axis 1, external)
6D.06 — Assessment + Exam. Split — this contains a full quiz engine:
Question bank (tagged, reusable)
Question-type rendering+grading → incl. calculated-variable type (formula evaluator)
Lockdown + integrity-detection layer
Attempt management (limits, time, auto-submit)
In-person exam (seating generator + invigilation + moderation workflow)
6D.07 — Grading/Transcript/Progression. Split:
Grade-formula evaluator (configurable weights/scales)
Grade-release gate (explicit, audited)
Grade appeal workflow
Transcript generator (immutable grade history)
Progression/academic-standing evaluator
6D.08 — Content Library + Standards. Split by STANDARD (Axis 2) — the canonical PR #41 five-into-one failure:
Content organisation + non-standard types (video/PDF/audio/link)
SCORM 1.2 runtime
SCORM 2004 runtime (different sequencing + data model from 1.2)
xAPI statement handling
Learning Record Store (shared dependency of xAPI and H5P)
H5P interactive player (emits xAPI statements to LRS)
The "core vs optional" split of these standards is explicitly deferred to this catalog step (business logic §22). SCORM 1.2 is the likely core candidate; the rest are likely optional micro-services.
6D.09 — Portals. Split by ROLE (Axis 5) — each is a data-scoping security boundary:
Student portal (sees only own data)
Teacher dashboard
Coordinator dashboard
Parent/guardian portal (per-institution view permissions + one-parent-to-many-students)
6D.10 — Certificates + University Extensions. Split:
Template designer / bulk generator / public verification endpoint (unauthenticated!) /
revocation subsystem
Degree-audit engine / prerequisite-enforcement / GPA calculator /
academic-standing evaluator / thesis-management workflow / accreditation reporting
The public verification endpoint is an unauthenticated surface with its own security profile.

Phase 6E — Growth Surface
6E.02 — Campaign Channels. Split by CHANNEL (Axis 3), each an optional micro-service with its own price:
Email campaign / WhatsApp campaign / SMS campaign / Push campaign
Shared segmentation engine (6E.01) but separate per-channel send + compliance.
6E.03 — Meta Ads + Attribution. Split: ad-account integration (Axis 1) / lead-form-to-CRM real-time push / multi-touch attribution engine (configurable models).
6E.06 — Cart/Checkout/Orders/Fulfilment/Shipping/Returns. Split — this is a six-noun cluster:
Cart + inventory-reservation timer (mirrors batch seat-hold)
Checkout + payment (reuses 6B.10 — does not reimplement gateways)
Order lifecycle engine (Saga)
Fulfilment (pick/pack/partial/backorder)
Shipping → per-carrier adapter (TCS/Leopards/M&P/DHL/FedEx — Axis 1) + 3PL
Returns/RMA (reuses ADL-014 refund)
Fraud-detection layer
6E.08 / 6E.09 — Website Builder. Split: editor core / version-rollback engine / per-breakpoint responsive editing; then connected blocks each a soft-dependency live-data integration (programme catalogue, event listing, product listing, lead form, job list, etc. — one surface per connected source). SEO structured-data, custom-domain SSL, and PWA builder are distinct surfaces.

Phase 6F — Intelligence, Advanced Admin, Design Polish
6F.02 / 6F.03 / 6F.04 — AI layers. Split: context broker (6F.01) / business consultant Q&A / proactive optimizer / prediction-maturity engine / after-action review / collective-intelligence aggregation with differential privacy (sensitive, own surface). The classification gate and mental-health protocol from 6A.16 sit in front of all of these.
6F.05 / 6F.06 / 6F.07. Split: support ticketing+SLA / support-window workflow / AI Concierge onboarding / sample-data seed-and-purge / per-module import wizard (one per module's data model) / documentation platform / community forum.

The mechanical rule for Genesis
For each candidate component, Genesis runs this check during cataloguing:
1. Does the component name (or its owned-data cell) list multiple providers?      → split per provider
2. ...multiple formal standards/specs?                                            → split per standard
3. ...multiple communication channels?                                           → split per channel
4. ...multiple stateful lifecycle stages?                                         → split per stage
5. ...multiple role-scoped access boundaries?                                     → split per role
6. Does an ADL attach stateful/timed/ordered logic to part of it?                 → that part is its own surface
7. Is a part independently toggleable, billable, or versioned?                    → its own manifest (service or optional micro-service)
8. Is a part mandatory and inseparable?                                           → core micro-service inside parent
After splitting, re-run the dependency check: no split surface may forward-reference, and each must respect service → core.
Every split above is consistent with the locked dependency order and the locked business rules — the catalog changes granularity, never ordering or busines