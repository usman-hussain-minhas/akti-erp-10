---
company: HAUTM
platform: Esbla Spark
author: Usman Hussain
owner: Usman Hussain
suite_version: v5.0
file_version: v3.0
created: 2026-06-14
last_updated: 2026-06-14
status: for_ratification
document_type: composer_blueprint
scope: Candidate product doctrine for Phase 6.5 Composer; for ratification only, not implementation authority.
title: Esbla Composer - Blueprint v3
supersedes: esbla_composer_blueprint_v2.md
companion_document: esbla_composer_how_it_works_v3.md
---
# Esbla Composer — Blueprint v3

## 0. Document purpose

This document defines **what Esbla Composer is**. v3 treats v2 as the baseline and adds the agreed Composer Architectural Strength Guarantees: replay, no hidden decision state, shadow mode, first-class failure, cost as signal, delegation as composition, version graph, bounded recovery, no-surprise export, evidence multiplexing, explainable decisions, instance isolation, credential boundary, primitive compatibility contracts, human-preview before consequence, no dead-end runtime, additive capability growth, and noob-proof surface over expert mechanics.

It is not a ticket pack, implementation plan, screen contract, database design, route list, or phase boundary. It deliberately does not decide what ships in v1, v2, or v3 of the product. It describes the complete target picture so later execution planning can decide sequencing without re-litigating the product concept.

The companion document, **Esbla Composer — How It Works v3**, defines runtime mechanics: configuration resolution, validation, versioning, execution, failure handling, AI proposal flow, export/import, and operational edge cases.

Where the Blueprint and How document differ, the Blueprint defines the product principle and the How document must be corrected or clarified. Where either Composer document conflicts with the Esbla master blueprint or the current ratified Business Logic authority, the higher authority wins and the conflict must be logged rather than silently interpreted.

Numbers and tunable thresholds belong in the master parameter registry or release-specific acceptance criteria. This document may reference parameter IDs, but it does not freeze numeric targets unless explicitly stated as a backbone rule.

---

## Part A — Product identity and philosophy

### A.1 One-sentence definition

**Esbla Composer is the visual operating-model surface where a tenant composes how their organisation operates — its structure, workflows, policies, external connections, agreements, costs, evidence, and relationships with other tenants — using registered platform primitives.**

### A.2 Plain-language definition

Composer is the place where a business owner or operator answers:

- Who are we as an organisation?
- What departments, branches, teams, and roles do we have?
- What work happens in each part of the business?
- Who does each stage of work?
- Which parts are internal and which parts are delegated to another tenant?
- What evidence proves that work happened?
- What agreement governs the work?
- What payment, escrow, refund, split, or budget rule applies?
- What external tools participate?
- What happens if a person, partner, provider, payment, notification, or AI step fails?
- What can be exported if the tenant leaves?

Composer is therefore not only a workflow canvas. It is the operating surface of the Esbla ecosystem.

### A.3 The central product rule

> **Composer orchestrates. Modules own domain depth. The configuration of both is one thing, stored once.**

Composer owns the arrangement and connection of things: organisation graph, workflow graph, stage naming, policy composition, sub-tenant delegation, external action wiring, agreement attachment, cost visibility, versioning, and export/import.

Modules own the internal domain details behind primitives: Learning owns the course structure; Commerce owns invoice and tax computation; HR owns employee records; Campaigns own audience rules; Finance owns ledger rules; Workspace owns collaboration artifacts.

Composer references module primitives and sequences them. It does not re-implement module internals.

### A.4 One setting, two faces

Every configurable thing has exactly **one canonical backend record**. That record may be shown through more than one surface:

- a conventional module settings page;
- the visual Composer canvas;
- a guided setup wizard;
- an AI proposal diff;
- an import/template application flow;
- a Super Admin support or diagnostic surface where permitted.

There is no sync process because there are not two records. A change on any authorised face writes to the canonical record. A read from any other face returns that same record.

This principle prevents configuration drift, fake visual builders, and the common ERP problem where settings edited in one area are contradicted elsewhere.

### A.5 Decentralisation principle

> **Everything is configurable by the tenant except the spine.**

The spine is small, enumerated, and immutable. Everything outside it is the tenant's to compose, name, arrange, permission, delegate, price, and export.

Configurable does **not** mean arbitrary executable behavior from free text. Configurable means configurable within registered primitives, registered capabilities, registered field types, registered policies, registered providers, registered extension contracts, and registered compliance packs. Tenants and AI may compose, name, arrange, parameterize, delegate, override, and version registered behavior. They may not invent new executable behavior without an approved extension.

### A.6 Complex underneath, noob-proof on top

Composer must absorb enterprise-grade complexity while exposing a surface that an ordinary SMB operator can understand without training.

Noob-proof is not visual polish. It is a structural acceptance rule. A technically complete Composer capability that fails the noob-proof test remains incomplete.

A Composer surface is noob-proof only when:

- a non-technical operator can start from a relevant template and produce a valid working composition within the release-defined target session length;
- most first-time operators can complete the core task without documentation or support;
- invalid actions produce plain-language explanations and repair paths;
- the surface avoids implementation jargon such as primitive, saga, RLS, manifest, schema, or idempotency;
- the UI explains consequences before the tenant publishes changes;
- cost, risk, and missing requirements are visible before runtime failure.

Numerical targets for time-to-first-working-composition, unaided success rate, and confusion events are release-specific. The doctrinal rule is that every release must set and test them.

### A.7 AI is a helper, not the product

Composer works fully without AI. AI improves speed, understanding, template drafting, validation explanation, and cost optimization. It does not become the authority.

AI may:

- draft a composition from a tenant's plain-language description;
- propose changes to an existing composition;
- explain why a workflow is invalid;
- suggest cheaper or safer alternatives;
- generate template variants;
- summarize operational issues;
- help map imported configurations.

AI may not:

- invent primitives;
- write substrate code;
- bypass registered capability contracts;
- silently apply a change;
- approve its own high-risk action;
- bypass Access Core, Gatekeeper, audit, cost controls, identity tiering, compliance packs, or human approval;
- hide its reasoning, data use, model provenance, or cost.

Everything AI can propose must also be possible manually.

### A.8 The product promise

Composer's promise is not that every tenant becomes successful. The product promise is narrower and stronger:

> Esbla gives tenants a noob-proof way to compose, run, delegate, monitor, and export their operating model using evidence-bearing, agreement-backed, reputation-aware, cost-visible, and compliance-bounded primitives.

Composer communicates capabilities clearly. It never promises business outcomes, income, employment, sales growth, operational perfection, or dispute-free relationships.

---

## Part B — Composer immutable backbone

This is the Composer-level immutable backbone. It inherits all higher-order immutable rules from the Esbla master blueprint and current Business Logic authority. If a higher-order rule exists outside this list, it still applies. This list is exhaustive only for Composer-specific tenant composition boundaries.

A tenant cannot configure around these rules.

| ID | Backbone rule | Product meaning |
|---|---|---|
| CB-01 | Security primitives | Authentication, session integrity, encryption, secret management, tenant isolation, and support-window controls cannot be weakened by composition. |
| CB-02 | Tenant isolation | Cross-tenant access occurs only through explicit, scoped, audited capability grants. |
| CB-03 | Identity-tier gating | High-trust actions require the mandated identity tier. Tenant composition cannot lower the tier requirement. |
| CB-04 | Access Core and Gatekeeper | Consequence-bearing or high-risk actions pass through registered approval and policy gates. |
| CB-05 | Audit completeness | Every consequential action, configuration change, agreement change, evidence crossing, payment state change, and AI-accepted proposal is audited. |
| CB-06 | Customer data sovereignty | Tenant data remains exportable; no composition may create hostage data or withhold export for unpaid invoices. |
| CB-07 | Reversible by default | Destructive or irreversible actions require human approval and explicit countdown/confirmation where applicable. |
| CB-08 | Minor safety | Minors cannot be granted prohibited marketplace, payout, unsupervised messaging, or adult-mentorship surfaces. |
| CB-09 | Behavior-based enforcement | Enforcement uses behavior and evidence, not demographic identity. Lawful age, sanctions, market, or jurisdiction compliance is narrowly applied and logged as compliance, not platform preference. |
| CB-10 | Prohibited inference | No hidden personality inference, background-based prediction, or undisclosed fit scoring may be introduced through composition. |
| CB-11 | Reputation protection | Reputation and behavioral data are not sold or licensed as a commercial data product. |
| CB-12 | Primitive invariants | Mandatory fields and behavior of registered primitives cannot be removed by tenant composition. |
| CB-13 | Registered capability boundary | Tenants and AI compose only registered capabilities, field types, policies, providers, and extensions. |
| CB-14 | Outcome-claim boundary | Composition copy, templates, AI output, and onboarding may describe capabilities but may not guarantee outcomes. |
| CB-15 | Platform identity | Tenant branding may customize business content, but required platform identity cannot be fully removed where mandated. |
| CB-16 | Legal compliance | Money-services posture, tax handling, data residency, retention, payout constraints, and equivalent obligations are applied through platform-approved market/legal packs and are not tenant-overridable. |
| CB-17 | Off-ramp integrity | Export/import and deletion mechanisms must preserve customer sovereignty, audit integrity, and legal holds. |
| CB-18 | Cost honesty | Composer must not hide cost-bearing actions, external API calls, AI use, communication sends, payment fees, sub-tenant fees, or platform fees. |

---

## Part C — What the user sees: primary UI model

Composer must feel like an operating studio, not an ERP settings maze.

### C.1 Main layout

The standard Composer layout has five regions:

1. **Top bar** — tenant, environment, draft/published version, save, test, publish, schedule, rollback, export, help.
2. **Left panel** — templates, primitive palette, search, saved patterns, AI suggestions, recently used items.
3. **Center canvas** — organisation graph, workflow graph, agreement map, or run monitor depending on mode.
4. **Right inspector** — selected node, stage, policy, agreement, external action, split rule, or evidence setting.
5. **Bottom drawer** — validation errors, warnings, cost forecast, risk summary, run log, unresolved references, and suggested fixes.

An optional **AI side panel** can be opened, but the UI must remain fully functional without it.

### C.2 Primary modes

Composer has these primary modes:

| Mode | Purpose | Main user question |
|---|---|---|
| Setup Wizard | Create first operating model from template or guided questions | How do I start safely? |
| Organisation View | Draw branches, departments, teams, and responsibility | Who are we? |
| Workflow View | Compose work stages and transitions | How does work move? |
| Policy & Permission View | Define who can see/do what | Who has authority? |
| Delegation View | Assign stages/departments to other tenants | Who outside us does this work? |
| Agreement View | Attach structured terms, acceptance, splits, and dispute path | What governs this relationship? |
| Cost & Budget View | Forecast and control cost | What will this cost? |
| Test & Debug View | Simulate before publishing | Will this run safely? |
| Run Monitor | Observe live instances and stuck work | What is happening now? |
| Evidence View | Inspect proof, attribution, and audit | What happened and who did it? |
| Export/Import View | Move or clone compositions safely | Can we leave or reuse this? |
| Support View | Tenant-authorized diagnostic assistance | What is broken and who may help? |

### C.3 Progressive disclosure

Composer must never show every capability at once. It should begin with a template or simple path, then reveal depth only when needed.

Beginner surfaces use plain terms: department, step, person, partner, approval, payment, evidence, warning, test, publish.

Advanced surfaces may show technical terms only inside admin/developer diagnostics, not ordinary tenant workflows.

### C.4 Canvas plus form parity

Every visual control has a form/list alternative. A user who cannot or does not want to use a canvas can configure the same thing through tables, forms, guided flows, and inspectors.

Canvas is a face, not the only face.

### C.5 Empty, loading, error, and recovery states

Every Composer screen must define:

- first-run empty state;
- empty after filters;
- loading state;
- validation-error state;
- external-provider unavailable state;
- permission-denied state;
- unresolved reference state;
- unsupported mobile-editing state where applicable;
- recovery route and next action.

Generic dashboards and decorative cards are forbidden. Every screen must expose a real task, decision, warning, or operating state.

### C.6 Mobile and tablet posture

Composer may allow mobile viewing, approvals, monitoring, and emergency actions. Full canvas editing may be desktop/tablet-first. The mobile experience must never pretend to support complex composition if the screen cannot safely do so.

---

## Part D — Feature universe

### D.1 Organisation Graph

The tenant draws its organisation as a graph of units: headquarters, branches, sub-branches, departments, teams, project groups, committees, or tenant-defined unit types.

Each node may hold:

- name and display label;
- type;
- parent(s);
- precedence order among parents where multi-parent inheritance is allowed;
- position on canvas;
- members and responsible roles;
- attached workflows;
- attached permission policies;
- local overrides;
- locale, currency, timezone, fiscal calendar, budget view, and data-region metadata where allowed;
- cost and depth pricing warnings.

**Multi-parent precedence.** If a node inherits from more than one parent, the tenant declares the precedence through an ordered list in the UI. A drag-to-reorder control is the preferred noob-proof face; internally the stored artifact preserves an explicit ordered parent list with stable priority values. The exact UI may evolve, but the persisted semantics are always explicit and deterministic.

### D.2 Workflow Graph

A workflow is a directed graph of stages. Stages are tenant-named but primitive-typed.

A stage may define:

- stage name;
- primitive type;
- responsible person, role, department, or sub-tenant;
- custom fields;
- entry condition;
- exit condition;
- acceptance rule;
- timeout;
- fallback;
- evidence policy;
- cost impact;
- required identity tier;
- required permission;
- AI-use setting;
- external provider setting;
- next-stage edges;
- loop count and overflow path where loops are allowed.

Workflows may call sub-workflows. Sub-workflows are reusable, versioned units. A workflow should not duplicate a repeated process if a sub-workflow can represent it safely.

### D.3 Primitive Palette

The palette is dynamically populated by registered primitives. A primitive declares its name, purpose, invariants, inputs, outputs, emitted events, configurable fields, permissions, evidence policy, cost dimensions, validation rules, export format, UI inspector schema, and test hooks.

Examples include:

- Person;
- Tenant;
- Organisation Unit;
- Role;
- Approval;
- Evaluation;
- Agreement;
- Workspace;
- Task;
- Invoice;
- Payment;
- Escrow;
- Refund;
- Ledger Event;
- Notification;
- External Action;
- AI Action;
- File;
- Form;
- Course;
- Product;
- Order;
- Dispatch;
- Certificate;
- Campaign;
- Report.

Composer displays user-friendly names, but validation uses the registered primitive contract.

### D.4 Custom Fields with Primitive Inheritance

Tenants may add custom fields to stages, objects, agreements, evaluations, products, courses, people-role extensions, and other registered targets.

Custom fields inherit from registered field types. Supported examples include text, rich text, number, currency, percentage, date, datetime, duration, select, multi-select, boolean, file, image, URL, email, phone, person reference, tenant reference, product reference, course reference, agreement reference, location, formula, computed read-only, signature, rubric row, and risk classification.

New field behavior requires a registered extension; a tenant cannot create executable field logic from plain text.

### D.5 Permission Composition

Composer owns the composition of permissions, not the underlying Access Core.

A tenant can author permissions through two faces:

- inline policies attached directly to departments, workflows, or stages;
- standalone reusable permission sets.

Effective permission is the union of applicable grants, intersected with platform hard rules, identity tier, service activation, data classification, source scope, and expiry.

Every grant carries:

- subject;
- action;
- resource type;
- source scope;
- data class;
- workflow or stage scope;
- identity tier requirement;
- start/end time where applicable;
- revocation behavior;
- audit reason.

A permission inherited from Department B cannot be used to access Department A data unless a separate sharing rule permits it.

### D.6 Sub-Tenant Delegation

Sub-tenant delegation is the ecosystem primitive that allows one tenant to assign a stage, workflow, workflow tree, or department to another tenant.

Delegation may be discovered through:

- direct invitation/reference;
- private partner directory;
- reputation-bearing directory;
- marketplace surface where later enabled.

The conceptual answer is fixed; the first release mechanism is decided in execution planning.

Before delegating, the host tenant must see:

- candidate tenant name and verified status;
- relevant service categories;
- reputation summary and confidence;
- low-history marker where applicable;
- capacity/availability signal;
- accepted agreement terms;
- price/split/escrow terms;
- evidence crossing policy;
- required data access;
- fallback and revocation behavior;
- onward delegation setting;
- dispute path.

**Capacity signal.** Capacity is not only a binary busy flag. The stored concept supports availability status, queue length, open slots, SLA window, blackout dates, region/service fit, and last-updated timestamp. The UI may simplify this into plain chips such as Available, Limited, Queue 3, Unavailable, or Manual confirmation required.

### D.7 Structured Agreements

Every delegation and multi-party transaction is governed by a structured agreement.

The agreement defines:

- parties;
- scope;
- deliverables;
- objective acceptance criteria;
- subjective review window;
- evidence requirements;
- pricing;
- split rules;
- escrow or hold terms;
- refund/reversal terms;
- tax/duty/withholding lines;
- fallback and revocation;
- abandonment timer;
- sub-delegation permission;
- dispute path;
- versioning rule;
- data and AI consent;
- exportable summary.

The agreement is not a legal magic trick. It is a structured operational contract for standard low-to-medium-risk patterns. High-risk, regulated, custom, employment, or jurisdiction-sensitive arrangements may still require counsel or separate templates.

### D.8 Escrow, payment splits, refunds, and tax lines

Composer represents commercial execution through structured agreement split rules.

Split logic may include:

- fixed amount;
- percentage split;
- milestone release;
- staged release;
- holdback;
- platform fee;
- penalty;
- bonus;
- refund reversal;
- dispute hold;
- tax/duty/withholding line.

Tax, duty, and withholding are their own lines, not hidden inside participant percentages. The tax compliance pack decides whether a line is percentage of gross, percentage of net, fixed, jurisdictional, conditional, exempt, withheld, reverse-charged, or informational.

Example: 70/30 is not product logic. It is one AgreementSplitRule instance.

### D.9 External Actions

External services participate through registered adapters. Examples include payment providers, video meeting providers, messaging providers, storage providers, AI providers, tax providers, verification providers, shipping/dispatch providers, or arbitrary webhooks.

Every External Action declares:

- provider;
- credential source;
- data sent;
- data received;
- consent requirement;
- timeout;
- retry policy;
- idempotency strategy;
- fallback stage;
- manual recovery path;
- failure event;
- cost dimension;
- health requirement.

Provider failure must be visible on the canvas and in the run monitor. Failure routing is part of the workflow, not hidden in logs.

### D.10 Evidence and Audit

Composer makes evidence visible, attributable, and useful.

Evidence includes:

- configuration change;
- stage start/completion;
- approval;
- rejection;
- agreement acceptance;
- payment hold/release/refund;
- split execution;
- notification sent/failed;
- external provider response;
- AI proposal accepted/rejected;
- delegation accepted/declined/revoked;
- dispute opened/resolved;
- export/import performed.

Evidence crossing is explicit. A delegated primitive declares whether evidence is host-only, sub-tenant-only, both parties, or no crossing except audit metadata. A host cannot force private internal evidence to cross, and a sub-tenant cannot hide evidence that the agreement declares shared.

### D.11 Reputation-aware selection and cold-start fairness

Composer uses evidence-based reputation when selecting sub-tenants, freelancers, partners, mentors, and other participants where matching is enabled.

Displayed signals must be role-contextual, time-decayed, confidence-aware, and explainable.

Low-history participants are not buried automatically. Matching surfaces reserve a governed cold-start exposure floor for eligible New — insufficient history profiles that meet baseline identity, safety, capability, fit, and validation evidence requirements. The floor is not paid promotion and cannot override hard rules.

### D.12 AI Assistance

AI has five product modes:

1. Draft from description.
2. Modify current composition.
3. Explain current composition.
4. Find problems.
5. Optimize cost, safety, or simplicity.

AI proposals appear as cards with:

- proposed change summary;
- affected nodes/stages/policies/agreements;
- diff;
- assumptions;
- cost impact;
- risk impact;
- validation result;
- data used;
- model/provider provenance;
- accept/reject/edit actions.

AI never acts invisibly. Accepted proposals become audited configuration changes.

### D.13 Templates and pattern library

Templates are not screenshots or copied automations. A Composer template is a typed process model with registered primitives, invariants, events, inputs, outputs, permission requirements, evidence policies, failure paths, cost dimensions, export semantics, and validation rules.

Template examples:

- simple training institute;
- coaching program;
- manufacturer-brand split;
- outsourced finance department;
- external evaluation/accreditation;
- product return/refund;
- freelancer website handoff;
- HR onboarding;
- student enrollment;
- campaign approval;
- dispatch/fulfilment loop.

Templates may accumulate operational evidence: usage count, completion rate, dispute rate, average time, fallback frequency, refund frequency, export/import success, and user satisfaction where measured.

### D.14 Simulation, testing, and debugger

Before publishing, the tenant can run a simulation with sample data. The debugger explains why the composition cannot safely run.

Example messages:

- Stage 3 requires Tier 2 identity, but assigned operator is Tier 1.
- Payment split totals do not reconcile.
- External Action has no fallback.
- Notification target includes opted-out contacts.
- Escrow release has no acceptance condition.
- Delegation reference is unresolved after import.
- Budget cap has no breach behavior selected.
- Compliance pack requires retention rule for this evidence type.

The debugger must be plain-language and repair-oriented.

### D.15 Run Monitor

The run monitor shows live workflow instances, stuck stages, failed provider calls, pending approvals, dispute holds, escrow holds, cost overruns, waiting-on-counterparty states, notification failures, and unresolved references.

It answers:

- What is running?
- What is stuck?
- Who is responsible?
- What is the next action?
- What evidence exists?
- What cost has accrued?
- What risk is active?
- What can be repaired safely?

### D.16 Export, import, clone, and off-ramp

Composer exports compositions as declarative artifacts using symbolic references. Export includes organisation graph, workflows, custom fields, permission policies, agreements, split rules, external action declarations, templates, evidence policy, validation rules, and documentation.

Export must not include hard-coded tenant IDs, user IDs, workspace IDs, external credential IDs, or sub-tenant IDs as executable references.

On import, unresolved references must be remapped, removed, or replaced. Nothing silently points to the wrong tenant, person, credential, provider, or sub-tenant.

Tenant export is not withheld for unpaid invoices. Legal holds and evidence retention are handled separately from customer data off-ramp.

### D.17 Governance and compliance packs

Compliance packs inject constraints into the configuration resolution chain. Examples include data-retention rules, tax handling, payout restrictions, consent requirements, minor-safety rules, data residency restrictions, industry recordkeeping, and market-specific notification duties.

A compliance pack constrains composition but does not become hidden hardcoding. The tenant sees why a rule applies and which pack applied it.

### D.18 Cost forecasting and budget honesty

Composer surfaces cost before and during execution:

- platform service fees;
- micro-service usage;
- AI usage;
- storage;
- communication sends;
- external provider fees;
- payment/escrow fees;
- sub-tenant charges;
- tax/duty/withholding estimate where applicable.

Budget cap breach behavior must be declared by the tenant. If the tenant has not declared a behavior, the safe default is pause-and-notify for non-critical workflows and hold-for-review for consequence-bearing/payment workflows. Execution plans may refine defaults by market and service, but silent overrun is never allowed.

### D.19 Dispute and review path

Disputes use structured evidence first:

1. Automated evidence recheck.
2. Mutual correction window.
3. Human review.
4. Independent panel where applicable.
5. External legal route remains available where required.

Opening a dispute may place relevant funds, evidence, and workflow stages on hold according to agreement terms. The user must see what is held, why, by whom, and what action is next.

### D.20 Collaboration and editing

Composer supports editing discipline before it supports real-time multiplayer magic.

At minimum, concurrent editing must prevent silent overwrite. Later collaboration may add live cursors, comments, change suggestions, and branch/merge workflows.

---

## Part E — Native Ecosystem Advantage Radius

Composer is not differentiated because it draws workflows. Workflow drawing, automation, and ERP configuration already exist.

Composer is differentiated because it makes business relationships composable.

A tenant can delegate work to another tenant, bind it through a structured agreement, scope access through capability grants, hold payment through escrow, write evidence to the correct ledgers, apply reputation consequences to the responsible party, route failure to fallback stages, and export the resulting composition.

Incumbent ERP, workflow automation, and marketplace tools may approximate parts of these flows through custom integration, legal contracts, consultants, or manual operations. Composer's claim is narrower and stronger: these patterns are first-class substrate primitives available natively and repeatably for SMBs.

Composer's advantage radius includes:

1. Multi-party execution with trust via evidence-based reputation, structured agreements, scoped permissions, and escrow.
2. Cross-tenant evidence flow with attribution and explicit evidence-crossing boundaries.
3. Escrow-mediated order, fulfilment, refund, and payment-split loops without bespoke legal/banking setup for every standard relationship.
4. Composable departmental permissions through source-scoped inheritance and additive grants.
5. Primitive-typed process templates reusable across industries.
6. External service orchestration with timeout, retry, idempotency, fallback, and manual recovery visible on the canvas.
7. Sub-tenant replacement and fallback routing when delegated operators fail health, tier, SLA, or abandonment checks.
8. Evidence-based dispute resolution with auto-hold, legal hold where applicable, structured review, and appeal path.
9. Cold-start exposure floors for eligible low-history participants.
10. Composition portability through declarative exports and symbolic references.
11. Capacity-aware delegation based on availability, SLA, region, category, and current load.
12. Agreement-aware pricing and payment splitting.
13. Reputation-backed templates whose operational performance is measured.
14. Noob-proof composition debugging.
15. Composition-level cost forecasting before activation.

Every advantage claim must eventually map to a primitive, a demo proof, a negative test, a measurable metric, and a known risk. If a claim cannot be proven through a golden path, it remains positioning language and must not be treated as implementation truth.

---

## Part F — Personas Composer must serve

### F.1 Tenant operator

A founder, owner, principal, or CEO who wants the business to run without understanding software architecture.

Needs: template onboarding, simple language, cost visibility, control over who does what, confidence that nothing dangerous is hidden.

### F.2 Operations manager

The person who maintains the operating model.

Needs: deeper workflow control, policy editing, run monitor, debugging, migration, versioning, evidence view, and repair tools.

### F.3 Staff member

The person who receives tasks, approvals, or notifications generated by Composer.

Needs: simple task inbox, clear responsibility, visible deadline, context, and escalation route.

### F.4 Freelancer or external professional

An individual who may receive delegated stage work.

Needs: clear agreement, access boundary, evidence protection, fair acceptance, payment visibility, reputation attribution, and dispute route.

### F.5 Sub-tenant / partner business

A business that operates a delegated department, service, fulfilment process, or expert function.

Needs: scoped access, capacity controls, private internal evidence boundary, payment terms, fallback rules, and protection from host overreach.

### F.6 Client/customer of tenant

An end-customer affected by composed workflows.

Needs: transparent order/status/approval/payment experience, not exposure to internal Composer complexity.

### F.7 Platform operator

A support/admin user with explicit tenant-authorized diagnostic access.

Needs: support window, audit trail, safe repair options, no casual data browsing, and clear escalation.

### F.8 Codex / AI implementer

Not an end user, but a special build-time actor. It must consume screen contracts, Composer docs, Figma outputs, frontend-builder outputs, and ticket packs without treating any generated artifact as source truth unless committed and approved.

---

## Part G — UI implementation picture

### G.1 Setup Wizard

The first experience asks plain questions:

- What kind of business are you setting up?
- Do you have branches/departments?
- What is the first workflow you want to run?
- Who will perform the work?
- Do you need external partners?
- Do you collect payment?
- Do you need approvals?
- Do you want AI to draft a starting setup?

The result is a draft composition, not a live system.

### G.2 Organisation canvas

The org canvas shows units as cards with inheritance badges, cost badges, warnings, attached workflows, member count, and policy state.

Multi-parent units show an ordered inheritance stack. The tenant can reorder through drag handles, and the inspector shows the resulting precedence explanation.

### G.3 Workflow canvas

Stages appear as cards connected by arrows. Stage color/icon reflects primitive type, not arbitrary decoration. Warnings appear directly on the affected stage.

The right inspector edits stage fields. The bottom drawer shows validation, cost, risk, and unresolved items.

### G.4 Agreement editor

The agreement editor should feel like a guided checklist, not a legal document editor. It shows parties, scope, acceptance, evidence, payment, splits, refund, dispute, and fallback.

Complex terms can expand, but the first screen must make responsibilities understandable.

### G.5 Delegation chooser

The delegation chooser shows candidate tenants, reputation, confidence, capacity, service fit, price/terms, response expectation, identity tier, and privacy/evidence boundaries.

Low-history candidates are marked honestly rather than hidden.

### G.6 Cost panel

The cost panel shows estimated cost before publish and observed cost at runtime. It separates platform, provider, AI, communication, payment, tax, and sub-tenant lines.

### G.7 AI panel

The AI panel must never replace the canvas. It is a proposal and explanation surface. Each AI card must have accept, reject, edit, show diff, and show why.

### G.8 Run monitor

Run Monitor is the operational screen after publishing. It is where a tenant sees stuck work, failed provider events, approvals, pending acceptances, dispute holds, budget cap events, and evidence.

### G.9 Debugger

The debugger is the noob-proof safety layer. It explains errors in business language and suggests repair actions.

### G.10 Design language

Composer UI should feel calm, operational, explainable, and safe. It should not feel like a developer-only node editor, crypto dashboard, automation puzzle, or consultant ERP screen.

---

## Part H — Manual, AI, template, import, and plugin parity

Every Composer change source must converge into the same canonical change pipeline:

- manual edit;
- AI proposal;
- template application;
- import;
- clone;
- compliance-pack update;
- default/rebaseline update;
- Codex/frontend-builder generated screen update during implementation.

No change source gets a private bypass.

The user-facing rule is simple:

> If Composer can do it through AI, it must be possible manually. If Composer can do it visually, it must be represented as canonical configuration. If Composer can export it, it must be importable with safe remapping.

---


## Part I — Composer Architectural Strength Guarantees

Composer is not strengthened by adding more buttons. Composer is strengthened by eliminating entire categories of drift, opacity, lock-in, hidden state, unsafe automation, debugging uncertainty, accidental cost exposure, and cross-tenant trust failure.

The following guarantees are Composer-level product doctrine. They do **not** decide implementation sequencing. Execution plans may stage their depth, but they may not contradict them. A release may ship a shallow version of a guarantee only if the release plan names the bounded depth, the missing depth, and the future maturity path.

### I.1 Single Canonical Configuration

**Principle.** Every configurable setting has one backend record and may have multiple faces: manual settings, Composer canvas, setup wizard, AI proposal diff, import/template flow, and authorised support/diagnostic surfaces.

**What it eliminates.** Duplicate configuration stores, sync jobs, stale visual builders, settings that disagree across modules, and the classic ERP drift of "I changed it here but the workflow still used the old value."

**Testable guarantee.** Editing a setting through any authorised face and reading it through another face returns the same canonical value, with no sync step and no independent duplicate store.

### I.2 One Change Pipeline

**Principle.** Manual edits, AI proposals, templates, imports, clones, compliance-pack updates, default/rebaseline updates, Figma-derived UI proposals, and frontend app-builder proposals all enter a governed proposal pipeline before they change Composer.

**What it eliminates.** AI bypasses, import surprises, plugin-generated drift, template mutations outside review, and separate rules for manual vs AI configuration.

**Testable guarantee.** Every accepted change carries source, proposed diff, validation result, risk classification, cost impact, permission impact, evidence impact, required human acceptance where applicable, versioned publish reference, and audit event.

### I.3 Replayable Execution

**Principle.** Every workflow instance is replayable from its pinned composition version, recorded initial inputs, recorded external responses, recorded human decisions, and recorded time/cost/state events.

**What it eliminates.** "Why did this happen?" debugging, log spelunking, non-reproducible bugs, and weak audit review.

**Testable guarantee.** Given the same pinned composition version, recorded inputs, external response envelopes, policy versions, and seeded time/randomness, replay produces the same decision path, stage transitions, and evidence-equivalent output. The guarantee is **evidence-equivalent**, not necessarily byte-identical, unless the replay environment also seeds IDs, timestamps, hashes, and encryption metadata.

### I.4 No Hidden Decision State

**Principle.** No state that affects routing, eligibility, timeout, approval, delegation, escrow, notification, cost, reputation, or failure handling may exist only as hidden internal runtime state.

**What it eliminates.** Invisible counters, mystery timers, implicit flags, unexplained waits, and runtime decisions nobody can inspect.

**Testable guarantee.** For any paused, failed, routed, escalated, accepted, rejected, or completed workflow instance, Run Monitor can show the exact state values, evidence events, and derived values that caused the current status. Internal caches may exist, but they are never authoritative for decisions.

### I.5 First-Class Failure Paths

**Principle.** Failures are workflow outcomes, not hidden exception handlers. Every outcome that affects business state has a visible edge, visible fallback, or visible platform-default failure handler.

**What it eliminates.** Silent stalls, hidden error routes, provider failures that disappear into logs, and workflows that only model the happy path.

**Testable guarantee.** A composition cannot be published if a stage outcome such as success, rejection, timeout, provider failure, permission denial, cost-cap breach, validation rejection, cancellation, or manual stop lacks a declared resolution path.

### I.6 Shadow Mode Before Cutover

**Principle.** A candidate composition version may run beside the live version using mirrored production triggers while suppressing real side effects.

**What it eliminates.** Fear of publishing complex workflow changes and dependence on perfect staging environments.

**Testable guarantee.** Shadow mode receives copies of live triggers, produces a shadow trace, compares it with the live trace, and never sends real notifications, releases funds, changes customer state, writes production reputation, or calls destructive external actions. The divergence report shows every meaningful difference.

### I.7 Cost as First-Class Signal

**Principle.** Cost is not merely a report after execution. Cost forecasts, caps, actual cost, budget remaining, and variance from forecast are workflow-readable signals and evidence-bearing events.

**What it eliminates.** Budget shock, uncontrolled AI/external-service spend, and after-the-fact cost archaeology.

**Testable guarantee.** Every cost-bearing stage declares forecast cost, maximum allowed cost, budget scope, breach behavior, and actual cost evidence. Cost may pause, route, warn, block, or require human approval according to tenant-declared policy and platform hard rules.

### I.8 Delegation as Composition, Not Permission

**Principle.** A delegated stage references a sub-tenant's published capability or composition interface. Delegation is not a broad permission grant into the host tenant.

**What it eliminates.** Opaque outsourcing, overbroad cross-tenant access, and confusion between "you may access my data" and "you are responsible for this work."

**Testable guarantee.** A DelegatedStage has input contract, output contract, evidence-crossing policy, identity-tier requirement, capacity signal, agreement reference, escrow reference where applicable, fallback or internal replacement path, revocation policy, abandonment timer, and failure edges. The sub-tenant executes inside its own boundary; the host receives only what the crossing policy permits.

### I.9 Versioned Change Graph

**Principle.** Every publish is a versioned change record with author, reason, parent version, diff, validation result, risk level, and rollback path. Advanced users may see branches and merge requests; ordinary users see Draft, Test, Review, Live, and Restore Previous Version.

**What it eliminates.** Lost history, unknown authorship, unsafe edits, and fear of experimentation.

**Testable guarantee.** Every published composition version has a parent reference, change summary, author, timestamp, validation evidence, risk classification, approval record where required, and rollback target.

### I.10 Bounded Recovery Policies

**Principle.** Composer may recover automatically from known failure patterns only through declared recovery policies with bounded triggers and actions. It does not mutate workflows freely.

**What it eliminates.** Repetitive manual intervention for predictable failures while avoiding runaway automation.

**Testable guarantee.** Every recovery policy declares trigger pattern, threshold, allowed actions, maximum duration, human notification, audit event, and stop condition. Recovery policies may retry, pause, fallback, open a circuit breaker, switch provider within declared limits, queue, notify, or escalate. They may not create primitives, alter payment/legal terms, release funds, expand permissions, or change reputation without human approval.

### I.11 No-Surprise Export

**Principle.** Export is not just a file format. Export is a tested capability.

**What it eliminates.** Fake portability, hidden dependencies, export-format drift, and tenant lock-in disguised as export.

**Testable guarantee.** Composer validates that exported compositions can be re-imported into a clean tenant without hard-coded tenant IDs, user IDs, credential IDs, provider secrets, or silent references. Certified templates and high-risk compositions must prove clean-room export, import, validation, and golden-path execution.

### I.12 Evidence Multiplexing

**Principle.** A consequential runtime event is recorded once and may be viewed through authorised audit, billing, debugging, support, reputation, analytics, and export lenses.

**What it eliminates.** Parallel truth stores, billing-vs-audit drift, support logs that disagree with workflow history, and reputation signals derived from unofficial sources.

**Testable guarantee.** A completed cost-bearing or consequence-bearing stage exposes the same evidence reference in Run Monitor, audit trail, billing evidence, support diagnostics, export package, and reputation input where applicable.

### I.13 Explainable Decisions

**Principle.** Every consequential Composer decision can explain itself to an authorised operator.

**What it eliminates.** Black-box routing, unexplained blocks, and admin frustration.

**Testable guarantee.** For any state transition, Composer can show: decision, trigger, rule ID, source layer, inputs used, output, responsible party, and remediation path. This applies to validation failure, compliance-pack block, cost-cap stop, permission denial, fallback, escalation, AI-proposed change, and delegated-stage routing.

### I.14 Instance Isolation by Default

**Principle.** Every workflow instance has its own execution context. Shared state exists only through explicit, evidence-backed shared objects.

**What it eliminates.** One customer or workflow run corrupting another, leaked counters, shared mutable state bugs, and concurrency surprises.

**Testable guarantee.** Two concurrent runs of the same workflow with different inputs cannot read or mutate each other's runtime state unless a shared object is explicitly referenced, authorised, and evidenced.

### I.15 Credential Boundary

**Principle.** Compositions contain symbolic credential references only. Secrets live in the integration/secret-management layer.

**What it eliminates.** Leaked API keys in exports, templates, AI prompts, screenshots, clones, or app-builder generated code.

**Testable guarantee.** Exported compositions may contain credential reference symbols, provider type, required scope, remap requirement, and health requirement. They never contain API keys, tokens, refresh tokens, private keys, secrets, or raw credentials.

### I.16 Primitive Compatibility Contracts

**Principle.** No primitive appears in Composer unless its compatibility contract is registered.

**What it eliminates.** Fake canvas nodes, one-off hidden behavior, hardcoded primitive exceptions, and UI elements that cannot run.

**Testable guarantee.** Every primitive contract declares inputs, outputs, emitted events, invariants, failure modes, cost dimensions, evidence policy, export shape, permission requirements, identity-tier requirements, validation hooks, and version compatibility. The palette rejects unregistered primitives.

### I.17 Human-Preview Before Consequence

**Principle.** Before a composition change can affect money, identity, access, reputation, public communication, customer data, sub-tenant delegation, legal/compliance posture, or irreversible actions, Composer shows a human-readable impact preview.

**What it eliminates.** Accidental destructive automation and hidden consequence changes.

**Testable guarantee.** The preview shows who is affected, what data changes, what permissions change, what costs change, what external actions may fire, what evidence/reputation may be created, what rollback/compensation exists, and what approval is required.

### I.18 No Dead-End Runtime

**Principle.** Every active workflow instance always has a known current state, responsible owner, next expected event, timeout, escalation path, and recovery action.

**What it eliminates.** Zombie workflows and unowned operational dead ends.

**Testable guarantee.** Every active instance can answer: where am I, who owns me now, what am I waiting for, since when, what happens next, when do I escalate, and who gets notified?

### I.19 Additive Capability Growth

**Principle.** Composer expands by registering primitives, field types, policy types, provider adapters, templates, compliance packs, and extensions. It does not expand through hidden hardcoded behavior in the canvas.

**What it eliminates.** Special-case decay and workflow behavior that cannot be reasoned about or exported.

**Testable guarantee.** Any new executable behavior must trace to a registered primitive, adapter, policy, field type, template, compliance pack, or extension manifest.

### I.20 Noob-Proof Surface Over Expert Mechanics

**Principle.** Composer may contain expert mechanics underneath, but the default operator surface remains understandable, recoverable, and plain-language.

**What it eliminates.** Powerful tools that only engineers can use and SMB-facing screens polluted with implementation language.

**Testable guarantee.** Advanced mechanics live behind Advanced, Diagnostics, Inspector, or Developer views. The default operator flow uses plain-language labels, templates, previews, explanations, and recovery paths.

### I.21 The daily architecture question

Every future Composer feature must answer these questions before acceptance:

- Can it be expressed manually?
- Can it be proposed by AI without becoming AI-only?
- Can it be validated before publish?
- Can it be replayed or simulated?
- Can failure be seen and routed?
- Can cost be forecast, capped, and evidenced?
- Can a delegated version run without cross-tenant leakage?
- Can a non-technical operator understand the consequence?
- Can the change be exported without hidden dependencies?
- Can the runtime explain why it did what it did?

## Part J — Boundaries: what Composer is not

Composer is not:

- a generic automation tool;
- a Zapier/n8n clone;
- a generic no-code app builder;
- a Bubble/Retool clone;
- a BI or analytics suite;
- a process-mining product;
- a project-management product;
- a community forum;
- a legal-services provider;
- an escrow bank;
- an AI agent that runs the business;
- a replacement for module internals;
- a replacement for screen contracts, contracts, manifests, tests, or tickets.

Composer is the organisational operating model and ecosystem composition surface of Esbla.

---

## Part K — Product acceptance doctrine

A Composer capability is product-complete only when all of the following are true:

1. It is expressible manually.
2. It is expressible visually where visual expression is appropriate.
3. It has a form/list fallback where visual editing is not suitable.
4. It can be proposed by AI only within registered capability boundaries.
5. It writes to one canonical configuration record.
6. It enters the universal change proposal pipeline regardless of source.
7. It validates against the immutable backbone and registered contracts.
8. It exposes cost, risk, evidence, permission, and failure-path impact before publish.
9. It audits changes and accepted AI proposals.
10. It has empty/loading/error/recovery states.
11. It can be tested before publish.
12. It can run in shadow mode where the release scope supports shadow execution.
13. It can be monitored at runtime.
14. It has no hidden decision state.
15. It has visible failure paths or visible platform-default failure handlers.
16. It is replayable or explicitly marked as not yet replayable with release-scoped reason.
17. It preserves instance isolation.
18. It uses symbolic credential references, never secrets.
19. It can be exported/imported or explicitly marked as non-exportable with reason.
20. It supports explainable decisions for all consequential transitions.
21. It has a human-readable preview before money, identity, access, reputation, public communication, customer data, delegation, or irreversible action is affected.
22. It has noob-proof acceptance targets for the release.
23. It does not require implementation users to guess from the Blueprint; it has a screen contract and execution artifact before build.
24. It can be decomposed into ticketable runtime surfaces later without forcing Codex to invent business rules.

These acceptance rules make the architectural strength guarantees practical. A feature is not accepted merely because a screen exists or a document describes it.

---

## Appendix A — Glossary

| Term | Meaning |
|---|---|
| Composition | The tenant-authored operating model: organisation, workflows, policies, agreements, external actions, cost rules, and related configuration. |
| Composer | The product surface for authoring, testing, publishing, monitoring, and exporting compositions. |
| Primitive | A registered platform capability that can appear as a stage, object, policy, agreement component, or action. |
| Module | A domain service area that owns internal depth behind primitives. |
| Stage | A workflow step with a primitive type, responsibility, conditions, evidence, and transitions. |
| Workflow instance | A live execution of a workflow pinned to a composition version. |
| Face | A UI surface that reads/writes the canonical configuration record. |
| Sub-tenant | Another tenant that performs delegated work inside a scoped relationship. |
| Delegation | Assignment of a stage, workflow, workflow tree, or department to another tenant. |
| Structured agreement | The operational contract that binds scope, acceptance, price, split, evidence, fallback, and dispute path. |
| Evidence crossing | The rule deciding which delegated-work evidence is visible to which party. |
| AgreementSplitRule | A configurable rule for splitting, holding, reversing, or allocating money. |
| Compliance pack | A jurisdictional/market/industry constraint layer injected into configuration resolution. |
| Noob-proof | A measurable usability and recoverability bar for non-technical operators. |
| Runtime Resolver | The shared interpretation layer described in the How document. |
| Architectural Strength Guarantee | Composer-level doctrine that eliminates a class of drift, opacity, lock-in, hidden state, unsafe automation, or debugging uncertainty. |
| Shadow Mode | A side-effect-free candidate-version run beside the live version using mirrored triggers and divergence reporting. |
| Replay | Reconstruction of a workflow instance from pinned version, inputs, external responses, human decisions, and recorded time/cost/state events. |
| Replay Lab | Non-production debug surface for replaying a stored instance from a chosen point with modified inputs or mocked external responses. |
| Decision State | Any state value that can affect routing, eligibility, approval, cost, delegation, escrow, notification, reputation, or failure handling. |
| First-Class Failure Path | A visible stage outcome or platform-default failure handler for a failure, timeout, rejection, denial, cancellation, or breach. |
| Bounded Recovery Policy | Declared automatic recovery rule with trigger, threshold, allowed actions, duration, audit, notification, and stop condition. |
| Versioned Change Graph | Composition history in which every publish has parent, author, diff, reason, validation, risk, and rollback path. |
| Evidence Multiplexing | One evidence event viewed through authorised audit, billing, debugging, support, reputation, analytics, and export lenses. |
| Credential Boundary | Rule that compositions reference credentials symbolically and never contain raw secrets. |
| Primitive Compatibility Contract | Registered primitive metadata describing inputs, outputs, events, invariants, failures, costs, evidence, export shape, permission, identity, and version rules. |
| No Dead-End Runtime | Runtime guarantee that every active instance has owner, state, expected event, timeout, escalation, and recovery action. |

End of Esbla Composer — Blueprint v3.
