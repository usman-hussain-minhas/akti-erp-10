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
document_type: composer_mechanics
scope: Candidate runtime mechanics for Phase 6.5 Composer; for ratification only, not implementation authority.
title: Esbla Composer - How It Works v3
supersedes: esbla_composer_how_it_works_v2.md
companion_document: esbla_composer_blueprint_v3.md
---
# Esbla Composer — How It Works v3

## 0. Purpose and relationship to the Blueprint

The Blueprint defines **what Esbla Composer is**. This document defines **how Composer behaves**.

It covers mechanics: configuration records, proposal flow, validation, runtime execution, versioning, publishing, rollback, external actions, delegation, agreements, split rules, evidence, AI assistance, UI implementation discipline, Figma/frontend-builder usage, edge cases, and the Composer Architectural Strength Guarantees added in Blueprint v3.

This document remains non-phased. It describes target mechanics. Execution plans decide sequencing, maturity bands, ticket scope, exact files, validation ladders, and release boundaries.

Inclusion here is not implementation authorization. Absence from an early release is not deletion.

---

## 1. Core operating thesis

Everything variable is governed configuration.

Everything dangerous is constrained by the immutable backbone.

Everything executable comes from registered primitives, registered capabilities, registered providers, registered policies, registered field types, registered extensions, and approved compliance packs.

Everything user-facing must be noob-proof.

Everything AI proposes enters the same pipeline as manual edits.

Everything consequential is audited.

Everything running is version-pinned.

Everything cross-tenant is scoped, attributable, and revocable.

Everything cost-bearing is visible.

Everything exportable uses symbolic references and safe remapping.

Everything replayable carries enough recorded inputs, external responses, human decisions, time/cost/state events, and policy versions to reconstruct its decision path.

Everything decision-affecting is visible as evidence or explainable derived state.

Everything side-effecting can be tested, shadowed, blocked, or previewed according to risk.

---

## 2. Composer stack

### 2.1 Layer 1 — Substrate primitives and platform services

Substrate primitives are owned by platform services and modules. Examples include Person, Tenant, Organisation Unit, Role, Approval, Evaluation, Agreement, Workspace, Invoice, Payment, Escrow, Refund, Notification, External Action, AI Action, File, Form, Course, Product, Order, Dispatch, Campaign, and Report.

Each primitive owns its domain behavior. Composer orchestrates primitives; it does not re-implement them.

### 2.2 Layer 2 — Composer Runtime Resolver

Composer has a shared **Runtime Resolver**.

The Runtime Resolver is not a monolithic workflow engine. Primitive services execute their own stages. The resolver interprets the pinned composition version, evaluates next-stage rules, applies validation context, checks capability boundaries, resolves permission and compliance constraints, and dispatches the next action to the owning primitive service.

Primitive services own execution. The Runtime Resolver owns interpretation.

### 2.3 Layer 3 — Registry and extension system

The registry tells Composer what can be composed. It contains primitive contracts, extension manifests, provider adapters, field types, policy types, compliance packs, UI inspector schemas, cost dimensions, and validation hooks.

No registered entry means no executable behavior.

If a tenant, AI proposal, import package, or frontend builder output refers to an unregistered capability, validation fails visibly.

### 2.4 Layer 4 — Canonical configuration store

A composition is not a loose JSON blob. It is a versioned artifact made from typed records:

- Composition;
- CompositionVersion;
- OrganisationNode;
- Workflow;
- Stage;
- Edge;
- SubWorkflowReference;
- FieldDefinition;
- PermissionPolicy;
- PermissionGrant;
- DelegationGrant;
- StructuredAgreement;
- AgreementSplitRule;
- ExternalActionBinding;
- AIActionPolicy;
- EvidenceCrossingPolicy;
- CompliancePackBinding;
- BudgetRule;
- ValidationRule;
- ExportMapping;
- RuntimeInstance.

These records may be stored across normalized tables and exported as a package. The canonical truth is the backend record set, not the canvas shape.

### 2.5 Layer 5 — Validation, simulation, and publishing

Validation checks whether a draft composition can be saved, tested, published, or run. Simulation runs controlled sample data through the draft. Publishing creates a new immutable published version.

### 2.6 Layer 6 — Authoring sources

Composer accepts changes from:

- manual UI edit;
- AI proposal;
- template application;
- import;
- clone;
- compliance-pack update;
- platform default/rebaseline update;
- migration tool;
- approved implementation scaffold generated from Figma/frontend-builder during build work.

All sources converge into the same proposal pipeline.

### 2.7 Layer 7 — Tenant-facing UI

The UI includes guided setup, organisation canvas, workflow canvas, policy view, delegation view, agreement editor, test/debug view, run monitor, evidence view, export/import view, and AI proposal panel.

Canvas and form/list faces operate over the same canonical record.

---

## 3. Universal change proposal pipeline

Every Composer change becomes a **ConfigurationChangeProposal** before it can alter a composition.

### 3.1 Proposal sources

A proposal may originate from:

- manual edit;
- AI draft;
- AI modification;
- template apply;
- import;
- clone;
- rebaseline;
- compliance-pack update;
- migration;
- support-window repair;
- frontend-builder or Figma-derived implementation scaffold during development.

### 3.2 Proposal object

A ConfigurationChangeProposal contains:

- proposal ID;
- source type;
- actor;
- tenant;
- target composition/version;
- proposed diff;
- affected nodes/stages/policies/agreements;
- assumptions;
- validation result;
- risk class;
- cost impact;
- compliance impact;
- AI provenance where applicable;
- Figma/frontend-builder provenance where applicable;
- required human approvals;
- preview payload;
- acceptance/rejection/edit result;
- audit event reference.

### 3.3 Pipeline

Every proposal follows:

```text
source → proposed diff → validation → risk classification → cost impact → compliance warnings → preview → human acceptance where required → versioned draft/publish → audit/evidence
```

A proposal that fails validation is visible and repairable where possible. It is never silently applied, silently discarded, or converted into hidden behavior.

### 3.4 Risk classes

| Risk class | Examples | Approval expectation |
|---|---|---|
| Low | rename stage, move canvas card, add description | ordinary save |
| Medium | alter workflow order, add field, change responsible role | tenant admin confirmation |
| High | change payment split, delegate to sub-tenant, change evidence crossing, modify approval route | explicit approval + disclosure |
| Critical | purge, irreversible export/import overwrite, escrow release policy, identity-tier change, minor-safety effect | Gatekeeper/human approval and possibly external review |

---

## 4. Configuration resolution chain

### 4.1 Source layers

Configuration may originate from:

1. immutable backbone;
2. law/regulation/compliance pack;
3. platform defaults;
4. market/jurisdiction pack;
5. industry pack;
6. business-type template;
7. tenant organisation default;
8. branch/department override;
9. workflow override;
10. stage override;
11. agreement-level setting;
12. runtime instance state;
13. person-level preference where allowed.

### 4.2 Conflict rule

Higher safety/legal/backbone constraints win. Lower layers may narrow, customize, name, arrange, and parameterize, but may not weaken constraints.

A conflict must explain:

- which rule applied;
- which layer supplied it;
- which lower setting it blocked;
- how to repair the configuration.

### 4.3 Merge strategies

Supported merge strategies include:

- replace;
- append;
- union;
- intersection;
- first-match by ordered priority;
- highest-safety-wins;
- numeric min/max;
- effective-date selection;
- symbolic-reference remapping;
- compliance override.

Each configurable field declares its merge strategy. There is no implicit merge magic.

### 4.4 Tenant-specific validation rules

Tenant-specific validation rules are stored inside the CompositionVersion as typed conditions over registered stage fields, primitive outputs, agreement terms, cost dimensions, identity tiers, time windows, and evidence states.

They are evaluated by the Runtime Resolver at the relevant point:

- save-time for structural validity;
- publish-time for activation and dependency validity;
- run-time before stage entry/exit;
- migration-time when moving an in-flight instance;
- import-time before draft creation;
- scheduled-publish-time immediately before activation.

Rules stored in an old composition version continue to govern instances pinned to that version unless the tenant explicitly migrates them.

---

## 5. Composition artifact model

### 5.1 Composition

The top-level tenant-authored operating model. It has identity, name, tenant, status, current draft, current published version, owner, tags, maturity state, and export policy.

### 5.2 CompositionVersion

An immutable snapshot of the composition at a point in time. It includes the graph, references, rules, policies, agreements, validation results, and compatibility metadata.

Published versions are immutable. Drafts are mutable through proposals.

### 5.3 Version statuses

- draft;
- validating;
- ready_to_publish;
- scheduled;
- published;
- deprecated;
- archived;
- retained_for_running_instances;
- blocked;
- deleted_draft.

### 5.4 Symbolic references

Exports use symbolic references, not executable hard IDs. References include:

- `person:role:billing_authority`;
- `department:finance`;
- `tenant:delegated_manufacturer`;
- `credential:stripe_primary`;
- `provider:zoom_meeting`;
- `policy:standard_approval_set`.

Imports prompt the user to map unresolved references.

---

## 6. Registered primitive contract

Every primitive registered into Composer declares:

- primitive ID;
- display name;
- category;
- owning service/module;
- activation dependency;
- invariant fields;
- configurable fields;
- allowed stage contexts;
- required identity tier;
- required permission;
- input schema;
- output schema;
- emitted events;
- accepted events;
- evidence events;
- default evidence-crossing policy;
- cost dimensions;
- validation hooks;
- test fixture schema;
- UI inspector schema;
- export schema;
- migration policy;
- deprecation policy.

Composer may show a primitive only if the tenant has the service active and the user has permission to use it.

---

## 7. Extension registration model

An extension adds a new provider, field type, primitive, policy type, compliance pack, template pack, AI tool, or export adapter.

An extension must declare:

- manifest;
- owner;
- capability ID;
- dependency graph;
- permissions;
- data classes;
- cost dimensions;
- events;
- failure modes;
- idempotency policy;
- UI inspector contract;
- validation contract;
- export/import behavior;
- test fixture;
- lifecycle/deprecation rules.

A new type family that requires new storage, rendering, validation, indexing, measurement, security, or execution behavior must be provided by an extension. It cannot be invented by a tenant setting or AI prompt.

---

## 8. Manual configuration experience

Manual configuration is first-class.

A user can:

- choose a template;
- draw organisation nodes;
- add workflows;
- drag stages;
- select primitives;
- edit stage settings;
- attach policies;
- define fields;
- select responsible parties;
- attach agreements;
- configure splits;
- configure budget behavior;
- test;
- publish;
- monitor.

Manual editing must expose all core capability that AI can propose. AI convenience must not create hidden feature asymmetry.

---

## 9. AI-assisted configuration experience

### 9.1 AI modes

AI supports:

1. Draft from description.
2. Modify current composition.
3. Explain current composition.
4. Find problems.
5. Optimize cost/risk/simplicity.
6. Map imported configuration.
7. Suggest template from business description.
8. Generate plain-language documentation for a composition.

### 9.2 AI proposal card

Every proposal card shows:

- summary;
- affected objects;
- visual diff;
- textual diff;
- assumptions;
- missing inputs;
- risk class;
- cost impact;
- validation state;
- data used;
- model/provider;
- prompt category;
- accept/edit/reject.

### 9.3 AI boundaries

AI cannot:

- bypass validation;
- bypass human acceptance;
- create unregistered primitives;
- alter the immutable backbone;
- lower identity-tier requirements;
- hide cost;
- hide data use;
- execute high-risk actions without approval;
- bypass support-window controls;
- use prohibited data;
- make legal or guaranteed-outcome claims.

### 9.4 AI provenance

Accepted AI proposals record:

- model/provider/version;
- prompt category;
- relevant prompt excerpt where safe;
- data classes accessed;
- generated diff;
- human modifications;
- final accepted diff;
- validation result;
- cost estimate;
- timestamp;
- actor.

---

## 10. Organisation graph mechanics

### 10.1 Node structure

An OrganisationNode contains:

- node ID;
- tenant ID;
- name;
- type;
- parent references;
- ordered parent precedence;
- local settings;
- inherited settings;
- members;
- attached workflows;
- permission policies;
- locale/timezone/currency/fiscal metadata;
- budget profile;
- canvas position;
- evidence/audit metadata.

### 10.2 Multi-parent precedence

When a node has multiple parents, precedence is stored as an ordered list. UI should default to drag-to-reorder. A numeric priority can exist internally for deterministic storage and conflict resolution.

The inspector must show the resolved order and explain which parent supplied each inherited value.

### 10.3 Reorganisation

Moving a node creates a configuration proposal and a versioned event. In-flight workflow instances continue under their pinned composition version unless explicitly migrated.

---

## 11. Workflow graph mechanics

### 11.1 Stage structure

A Stage contains:

- stage ID;
- workflow ID;
- display name;
- primitive type;
- responsible party;
- entry conditions;
- exit conditions;
- custom fields;
- acceptance rule;
- timeout;
- retry/fallback;
- evidence policy;
- agreement reference;
- budget behavior;
- cost dimensions;
- external action binding;
- AI action policy;
- UI position.

### 11.2 Edges and branching

Edges connect stages. Guarded outgoing edges are evaluated in tenant-declared priority order. A default edge is required where conditions are not exhaustive.

### 11.3 Bounded loops

Loops require an exit condition, maximum iteration count, and overflow route. Unbounded loops cannot be saved.

### 11.4 Sub-workflows

Sub-workflows are versioned reusable workflows. A parent workflow references a specific sub-workflow version for running instances unless migrated.

---

## 12. Permission mechanics

### 12.1 Permission sources

Permission sources include:

- platform role;
- tenant role;
- department membership;
- workflow assignment;
- stage assignment;
- agreement role;
- delegation grant;
- support window;
- individual additive grant;
- compliance pack;
- emergency break-glass where separately approved.

### 12.2 Effective permission formula

```text
effective_permission = union(applicable_grants)
  ∩ identity_tier
  ∩ activation_state
  ∩ data_class_allowed
  ∩ source_scope
  ∩ workflow_scope
  ∩ time_window
  ∩ immutable_backbone
```

### 12.3 Source-scoped grants

Every grant carries source scope. A user cannot use a permission granted by Department B to access Department A data unless a separate sharing rule permits it.

### 12.4 Permission changes during in-flight work

Permission policies are versioned. In-flight stages use the policy version active when the stage started. A tenant changing a policy sees whether in-flight work is affected and may choose a controlled retroactive application if allowed by the primitive and risk class.

### 12.5 Revocation

Revocation affects future access immediately. In-flight access follows the revocation policy: complete-with-grace, pause-for-review, reassign, or force-fail where permitted.

---

## 13. Sub-tenant delegation mechanics

### 13.1 Delegation levels

A tenant may delegate:

- one stage;
- one workflow;
- a workflow tree;
- a department;
- a service package;
- a recurring operational role.

### 13.2 DelegationGrant

A DelegationGrant contains:

- host tenant;
- sub-tenant;
- scope;
- capability grants;
- agreement reference;
- evidence-crossing policy;
- capacity requirement;
- identity-tier requirement;
- acceptance mode;
- price/split reference;
- fallback sub-tenant or internal route;
- abandonment timer;
- revocation mode;
- onward delegation flag;
- start/end;
- audit references.

### 13.3 Delegation states

```text
proposed → accepted → active → paused → completing_with_grace → replaced → closed
                   ↘ declined
                   ↘ tier_suspended
                   ↘ abandoned
                   ↘ revoked_for_new_work
                   ↘ force_failed
                   ↘ disputed
```

### 13.4 Revocation and replacement

Revocation blocks new work immediately. In-flight delegated work follows the agreement:

- complete with grace;
- pause pending review;
- force-fail and route to fallback;
- replace sub-tenant for unstarted stages;
- internally complete remaining stages.

Switching sub-tenant creates a new capability grant and leaves the old grant only for permitted completion/settlement. Every transition writes evidence.

### 13.5 Tier drop

If a sub-tenant's identity or payout tier falls below the requirement, affected delegations pause automatically. The host sees options: wait for re-verification, switch to fallback, internalize the stage, or open dispute depending on agreement terms.

### 13.6 Abandonment

If the sub-tenant misses required responses/actions beyond the agreement's abandonment timer, the host may terminate or route to fallback. Reputation impact is context-weighted and not automatic if outage, illness, provider failure, or host dependency caused the delay.

### 13.7 Onward delegation

Onward delegation is forbidden unless explicitly permitted in the original DelegationGrant. Unauthorized onward delegation is a severe integrity violation and triggers access revocation, evidence review, and dispute path.

---

## 14. Evidence crossing mechanics

Evidence crossing is decided at write time by policy.

Policies:

- `both_parties` — shared engagement evidence visible to host and sub-tenant;
- `host_only` — work product or customer-facing result visible to host;
- `subtenant_only` — internal process evidence private to sub-tenant;
- `metadata_only` — only timestamp, actor, and event type cross;
- `none` — no cross-tenant evidence except platform audit where required.

Defaults are declared by primitive. Agreement terms may narrow or disclose, but cannot force crossing of private internal evidence where platform policy forbids it and cannot hide evidence required for the shared engagement.

---

## 15. Structured agreement mechanics

### 15.1 Agreement structure

A StructuredAgreement contains:

- parties;
- scope;
- role of each party;
- deliverables;
- acceptance criteria;
- subjective review windows;
- objective evidence requirements;
- communication expectations;
- pricing;
- split rules;
- escrow/hold rules;
- refund/reversal rules;
- tax/duty/withholding lines;
- data-sharing rules;
- AI-use consent;
- evidence crossing;
- capacity commitment;
- fallback;
- revocation;
- abandonment;
- dispute path;
- version;
- effective date.

### 15.2 Objective vs subjective criteria

Objective criteria can be machine-checked when the primitive supports it. Subjective criteria require acceptance, bounded review window, or dispute route.

AI verification is advisory unless both parties explicitly opt into binding AI verification through a separate agreement field.

### 15.3 Acceptance ladder

A stage may use:

- explicit acceptance;
- objective auto-check;
- time-plus-notice auto-acceptance;
- mutual correction window;
- human review;
- dispute escalation.

Auto-acceptance requires successful notices through approved channels and visible pending status. Failed notification delivery pauses the clock.

---

## 16. AgreementSplitRule mechanics

### 16.1 Rule types

AgreementSplitRule supports:

- fixed amount;
- percentage split;
- milestone split;
- staged release;
- holdback;
- platform fee;
- external provider fee;
- tax line;
- duty line;
- withholding line;
- penalty;
- bonus;
- refund reversal;
- dispute hold;
- manual settlement.

### 16.2 70/30 example

A 70/30 manufacturer-brand split is stored as split rules attached to an agreement:

```yaml
agreement_split_rules:
  - party: brand_tenant
    type: percentage
    base: net_after_tax_and_provider_fees
    value: 70
  - party: manufacturer_tenant
    type: percentage
    base: net_after_tax_and_provider_fees
    value: 30
  - party: platform
    type: platform_fee
    base: gross_or_net_as_configured
    value: configured_by_pricing_registry
  - party: tax_authority_or_tax_line
    type: tax_line
    source: jurisdiction_pack
```

No split executes unless it reconciles, is attached to a signed structured agreement, has disclosure accepted by affected parties, and passes payment/escrow capability validation.

### 16.3 Tax lines

Tax, duty, and withholding lines are composed through the tax compliance pack. They may be fixed, percentage of gross, percentage of net, jurisdictional, conditional, exempt, withheld, reverse-charged, or informational.

Tenants do not write tax law into Composer; they select applicable packs and supply required business facts.

### 16.4 Refund and reversal

Refund behavior is agreement-defined. A refund may fully reverse all shares, partially reverse undispatched portions, preserve manufacturer share after dispatch, allocate provider fees separately, or route to dispute hold.

Every reversal writes evidence and ledger events.

---

## 17. Escrow, payment, and payout mechanics

Composer models escrow/hold states through registered payment primitives and market-approved payment rails.

Typical lifecycle:

```text
customer_payment_received → funds_held → stage_completed → acceptance_or_evidence_confirmed → split_calculated → payout_scheduled → payout_completed
```

Failure states:

- payment failed;
- hold failed;
- provider timeout;
- chargeback;
- partial capture;
- refund requested;
- payout rail unavailable;
- split execution failed;
- dispute hold active;
- compliance hold active.

A payment/payout/provider failure is recorded with causation and never attributed to participant reputation unless the participant caused it through evidence-backed misconduct.

---

## 18. External action mechanics

### 18.1 External action declaration

Every ExternalActionBinding declares:

- provider;
- credential owner;
- credential scope;
- data sent;
- data received;
- timeout;
- retry policy;
- idempotency key strategy;
- webhook mapping;
- provider health requirement;
- fallback route;
- manual recovery route;
- cost dimension;
- data retention disclosure;
- consent requirement.

### 18.2 Idempotency

External action idempotency keys derive from workflow instance ID, stage ID, provider, and attempt context. Duplicate inbound events are acknowledged idempotently, not reprocessed.

### 18.3 External success, internal failure

If an external provider succeeds but the internal update fails, the system reconciles using idempotency/provider identity before retrying. It must not double-charge, double-send, double-create meetings, double-release funds, or lose a successful provider outcome.

---

## 19. Execution model

### 19.1 Instance version pinning

Every workflow instance stores the CompositionVersion ID it started under. All next-stage resolution, condition evaluation, permission checks, field definitions, validation rules, evidence crossing, and budget behavior read that pinned version.

New instances use the current published version.

### 19.2 Event flow

```text
stage starts → primitive service executes → primitive emits event → evidence/audit records event → Runtime Resolver evaluates next step → next primitive receives dispatch
```

### 19.3 Unrecognized events

If a primitive emits an event the pinned composition cannot match, the event is recorded, the instance moves to safe waiting state, and an operator notification is created. The event is not discarded and the instance is not corrupted.

### 19.4 Waiting states

Every waiting state must have:

- responsible party;
- reason;
- start time;
- expected next action;
- escalation path;
- timeout or explicit no-timeout reason;
- evidence trail.

### 19.5 Primitive unavailable

If a primitive service is unavailable at runtime, the instance follows retry/backoff rules. If the threshold is reached, it routes to fallback or safe waiting state.

---

## 20. Validation model

### 20.1 Validation order

Validation runs in this order:

1. schema validation;
2. registry reference validation;
3. activation validation;
4. permission validation;
5. identity-tier validation;
6. immutable backbone validation;
7. compliance-pack validation;
8. primitive invariant validation;
9. tenant-specific validation rules;
10. external provider health/credential validation;
11. cost/budget validation;
12. export/import validation;
13. noob-proof/debuggability checks where release requires.

### 20.2 Validation severity

| Severity | Meaning | Can save draft? | Can publish? |
|---|---|---:|---:|
| Error | Cannot run safely or violates backbone | yes, as invalid draft | no |
| Warning | Can run but risk/cost/edge condition exists | yes | yes with acknowledgement |
| Advisory | Improvement suggestion | yes | yes |
| Cost warning | Budget/cost issue | yes | depends on budget behavior |
| Legal/compliance block | Required compliance issue | yes, as invalid draft | no |
| Unsupported | Requires unregistered extension | no executable publish | no |

### 20.3 Validation message style

Messages must use business language:

- Bad: `permission_policy_scope_mismatch`.
- Good: `This approval right comes from Finance, so it cannot approve HR payroll unless you add an HR sharing rule.`

### 20.4 Scheduled-publish validation failure

If a composition passed validation when scheduled but fails validation at the scheduled publish time because a dependency changed, provider became unhealthy, activation changed, compliance pack changed, credential expired, or reference became unresolved:

- the scheduled publish fails safely;
- the current published version remains active;
- the schedule is cleared unless the tenant chooses to reschedule;
- tenant admins are notified;
- the draft remains available with validation errors;
- no running instance is migrated;
- the failure writes audit/evidence.

---

## 21. Test mode and simulation

Test mode runs the draft with sample data or a safe copied scenario. It must not contact real payment rails, send real messages, release real escrow, create real tax documents, or notify real customers unless explicitly in a test provider/sandbox.

Test output includes:

- path taken;
- stages skipped;
- conditions evaluated;
- permissions used;
- costs estimated;
- evidence that would write;
- external actions that would call;
- warnings;
- failure route.

---

## 22. Publishing, rollback, and migration

### 22.1 Publish stages

```text
draft → validation → preview diff → approvals → scheduled or immediate publish → published immutable version
```

### 22.2 Publish diff

Publish diff shows:

- added/removed/changed nodes;
- added/removed/changed stages;
- policy changes;
- delegation changes;
- agreement/split changes;
- cost impact;
- affected running instances;
- migration recommendation;
- risk class.

### 22.3 Rollback

Rollback means publishing a prior valid version as a new current version. It does not mutate history or automatically move running instances.

### 22.4 In-flight migration

A tenant may explicitly migrate a running instance. The migration preview shows current stage, remaining path, field mapping, lost/added requirements, permission impact, cost impact, and evidence implications.

Migration is never automatic.

### 22.5 Rollback vs compensation

Rollback changes future configuration. Compensation repairs or reverses runtime effects already produced by primitive services. Payment release, invoice issue, message send, external provider action, and evidence write may require compensation rather than rollback.

---

## 23. Concurrent editing

### 23.1 Locking and optimistic concurrency

A draft records version token and editor sessions. When two users edit the same area, the second save cannot silently overwrite the first.

### 23.2 Conflict presentation

The second editor sees a conflict view that may include:

- diff;
- overlapping fields;
- changed nodes/stages;
- who changed what;
- keep mine;
- accept theirs;
- manual merge;
- duplicate as branch;
- discard mine.

The exact UI may evolve, but silent overwrite is forbidden.

### 23.3 Real-time collaboration

Real-time multiplayer editing is optional later maturity. Safe conflict handling is required before live collaboration.

---

## 24. Custom field mechanics

A FieldDefinition declares:

- ID;
- label;
- type;
- target scope;
- required/optional;
- default;
- validation;
- visibility;
- data class;
- export behavior;
- evidence behavior;
- AI-readable flag;
- retention policy;
- computed formula where registered.

Changing a field used by running instances requires compatibility validation. Removing a field does not erase historical evidence.

---

## 25. Budget and cost mechanics

### 25.1 Cost forecast inputs

- platform service pricing;
- micro-service usage;
- depth pricing;
- active workflow count;
- stage count;
- AI calls;
- external API calls;
- communications;
- storage;
- payment fees;
- escrow fees;
- sub-tenant fees;
- tax/duty/withholding estimates.

### 25.2 BudgetRule

A BudgetRule declares:

- scope;
- cap amount;
- period;
- cost dimensions included;
- warning threshold;
- breach behavior;
- responsible party;
- exception approval path.

### 25.3 Budget breach behavior

The tenant must declare breach behavior. Supported behaviors:

- pause;
- notify-and-continue;
- stop;
- route to approval;
- downgrade provider/model;
- switch fallback;
- hold for review.

If no behavior is declared, safe defaults apply: pause-and-notify for ordinary workflows, hold-for-review for payment/consequence-bearing workflows.

Silent overrun is forbidden.

---

## 26. Evidence and audit mechanics

Every consequential event writes evidence. Audit and evidence entries include:

- actor;
- tenant;
- source;
- action;
- before/after where applicable;
- composition version;
- workflow instance;
- primitive;
- timestamp UTC;
- user-facing local time rendering;
- IP/device/provider where relevant;
- reason/context;
- linked agreement;
- linked cost;
- linked external provider event;
- visibility/crossing policy;
- retention/legal hold status.

Evidence may be visible in Composer through timelines, run monitor, agreement view, dispute view, and export summaries.

---

## 27. Export/import mechanics

### 27.1 Export package

Export includes:

- manifest;
- composition metadata;
- organisation graph;
- workflow graph;
- field definitions;
- policies;
- agreements;
- split rules;
- evidence-crossing policies;
- external action declarations;
- compliance-pack references;
- templates;
- documentation;
- compatibility/version metadata.

### 27.2 Export exclusions

Export excludes:

- secret values;
- live credentials;
- unresolved legal holds;
- non-exportable third-party provider data;
- hard-coded tenant/person/workspace/external credential IDs as executable references;
- private sub-tenant internal evidence unless included by policy and law.

### 27.3 Import flow

```text
upload → parse → schema validate → compatibility validate → reference map → compliance validate → cost preview → create draft → test → publish
```

Import never creates a live composition directly. It creates a draft.

---

## 28. Clone and reuse mechanics

Cloning copies structure and configuration. It remaps or asks the tenant to confirm:

- people;
- departments;
- policies;
- credentials;
- sub-tenants;
- agreements;
- evidence settings;
- budget rules;
- compliance packs.

Sub-tenant delegation references are unresolved until confirmed. A clone never silently inherits a partner access relationship.

---

## 29. Run Monitor mechanics

Run Monitor shows:

- live instances;
- stage state;
- responsible party;
- waiting reason;
- provider health;
- stuck work;
- pending approvals;
- failed notifications;
- budget warnings;
- escrow holds;
- dispute holds;
- evidence timeline;
- repair actions.

Repair actions must be permissioned, audited, and safe. Examples:

- retry external action;
- switch fallback;
- reassign responsible party;
- send reminder;
- pause instance;
- open dispute;
- migrate instance;
- mark as resolved with evidence.

---

## 30. Support and Super Admin mechanics

Super Admin is a technical control plane, not a business-operations surface.

Support access to tenant business data requires an explicit support window: permission-scoped, time-bound, visible to tenant admin, and audited.

Support may diagnose configuration health, provider failures, reference errors, validation conflicts, and export/import issues. Support may not casually browse tenant data, override tenant decisions, bypass the immutable backbone, or silently change a composition.

---

## 31. Data classification and AI access

Data classes include:

- public;
- tenant operational;
- sensitive business;
- financial;
- identity/KYC;
- minor-related;
- private communication;
- legal/dispute;
- reputation/evidence;
- prohibited-for-AI.

AI access requires:

- tenant AI enabled;
- user AI enabled;
- data class allowed;
- purpose allowed;
- provider allowed;
- cost budget available;
- provenance recording;
- human acceptance for changes.

BYO-API processing of another party's data requires explicit consent with provider/model/retention disclosed.

---

## 32. UI architecture mechanics

### 32.1 Main layout

Implementation surfaces must support the Blueprint layout: top bar, left panel, center canvas, right inspector, bottom drawer, optional AI side panel.

### 32.2 Screen states

Every screen contract must define:

- default loaded state;
- empty state;
- loading state;
- error state;
- permission-denied state;
- validation-blocked state;
- unresolved-reference state;
- offline/provider-degraded state;
- success state;
- recovery path.

### 32.3 Accessibility

Composer UI must support keyboard navigation, focus management, readable contrast, labels, assistive text, and non-canvas alternatives for critical operations.

### 32.4 Noob-proof UI behaviors

- Plain-language labels.
- Explanatory warnings.
- Preview before publish.
- Diff before acceptance.
- Suggested fixes.
- Cost visible before activation.
- Safe defaults.
- One-click revert where safe.
- Guided first setup.

---

## 33. Codex skill: Figma and frontend app builder usage

This section is a build-time skill for Codex or equivalent implementation agents. It does not authorize implementation by itself.

### 33.1 Preconditions before any frontend build

Codex must have:

1. current Composer Blueprint and How docs;
2. active phase/control document;
3. approved screen contract;
4. exact-file ticket;
5. API/mock contract;
6. validation ladder;
7. known activation/permission behavior;
8. Figma or design artifact where required;
9. frontend-builder output only if it maps to the screen contract.

If the screen contract is missing, frontend implementation stops.

### 33.2 Role of Figma

Figma is a design/interaction artifact source, not source of truth for business rules.

Use Figma to define:

- frame hierarchy;
- visual layout;
- responsive behavior;
- component variants;
- states;
- typography and spacing tokens;
- interaction notes;
- validation drawer behavior;
- AI proposal card layout;
- canvas/inspector/panel behavior;
- accessibility annotations.

Figma must not define backend authority, permission logic, API behavior, pricing logic, evidence policy, or workflow runtime semantics.

### 33.3 Figma page structure for Composer

Recommended pages:

1. `00 Cover + Notes`;
2. `01 Tokens + Components`;
3. `02 Composer Shell`;
4. `03 Setup Wizard`;
5. `04 Organisation View`;
6. `05 Workflow View`;
7. `06 Policy + Permission View`;
8. `07 Delegation + Agreement`;
9. `08 Cost + Budget`;
10. `09 Test + Debug`;
11. `10 Run Monitor`;
12. `11 Export + Import`;
13. `12 Empty Loading Error States`;
14. `13 Mobile/Tablet Views`.

### 33.4 Figma naming convention

Frames should use:

```text
Composer/<mode>/<screen>/<state>/<viewport>
```

Examples:

```text
Composer/Workflow/Canvas/Default/Desktop
Composer/Workflow/Canvas/ValidationError/Desktop
Composer/Delegation/Chooser/LowHistoryCandidate/Desktop
Composer/RunMonitor/StuckStage/Error/Desktop
Composer/SetupWizard/TemplateStart/MobileViewOnly
```

### 33.5 Frontend app builder plugins

Frontend app builder plugins may be used to scaffold UI from screen contracts and Figma frames. They are accelerators, not authority.

Plugin output must be treated as draft code. Codex must review and adapt it to the repo stack, current design system, activation rules, API contracts, accessibility requirements, and validation ladder.

A frontend-builder plugin may not:

- invent API endpoints;
- invent data models;
- bypass activation pruning;
- hardcode mock business data into production UI;
- remove required platform identity;
- ignore screen states;
- add new dependencies without ticket approval;
- write around shadcn/Tailwind conventions;
- bypass TypeScript types;
- implement business logic in the component that belongs in backend/contracts;
- create a second configuration store.

### 33.6 Codex frontend pipeline

```text
read source docs → read screen contract → inspect Figma/design artifact → generate or adapt scaffold → map to repo components → wire to approved API/mock contract → implement all states → add tests → run validation → attach evidence
```

Codex must prefer small, exact-file implementation slices. If plugin output spans unrelated surfaces, split it before implementation.

### 33.7 Prompt template for Figma/frontend-builder generation

```text
Build only the UI specified by this screen contract.
Do not invent backend fields, API routes, permissions, pricing, or workflow semantics.
Use the existing design system, Tailwind, shadcn/ui, TypeScript, and approved component patterns.
Include empty, loading, error, permission-denied, validation-blocked, and success states.
Expose activation-pruned behavior.
All business logic remains in backend/contracts; UI only renders and submits approved shapes.
If the screen contract is incomplete, stop and list missing fields.
```

### 33.8 Acceptance of plugin-assisted UI

A plugin-assisted UI is acceptable only when:

- it matches the screen contract;
- it uses the repo stack;
- it uses approved design tokens/components;
- it implements required states;
- it obeys activation and permission behavior;
- it has accessible labels/focus states;
- it passes validation commands;
- it has no hardcoded real tenant/operator data;
- it is reviewed as human-owned code, not trusted generator output.

---

## 34. Observability and reporting

Composer should emit operational metrics:

- composition created;
- draft saved;
- validation failed;
- validation repaired;
- published;
- scheduled publish failed;
- rollback published;
- workflow instance started/completed/failed/stuck;
- external action failed/retried/reconciled;
- AI proposal accepted/rejected/edited;
- delegation accepted/declined/revoked/replaced;
- dispute opened/resolved;
- export/import success/failure;
- noob-proof friction events.

Reports should separate platform health from tenant business metrics.

---

## 35. Golden paths

### 35.1 Training institute golden path

1. Choose training institute template.
2. Create branches/departments.
3. Add admissions workflow.
4. Add payment/invoice stage.
5. Add course enrollment stage.
6. Add attendance/evaluation stage.
7. Add certificate stage.
8. Test with sample learner.
9. Publish.
10. Monitor one live instance.
11. Export composition.

### 35.2 Manufacturer-brand golden path

1. Brand tenant selects manufacturer-brand split template.
2. Creates order workflow.
3. Attaches product/order/payment primitives.
4. Delegates fulfilment to manufacturer sub-tenant.
5. Defines 70/30 split plus platform/tax lines.
6. Holds payment.
7. Manufacturer dispatches.
8. Evidence crosses with attribution.
9. Acceptance releases split.
10. Refund/dispute path works.
11. Export/import preserves symbolic references.

### 35.3 Outsourced department golden path

1. Tenant creates Finance department.
2. Delegates operational stage to external finance tenant.
3. Grants scoped access.
4. Defines evidence crossing.
5. Sets capacity and fallback.
6. Tests invoice approval flow.
7. Revokes delegation for new work.
8. In-flight work completes with grace or routes to fallback.

---

## 36. Negative tests

Composer must eventually prove these failures are safe:

- hard-rule override is blocked;
- AI proposal for unregistered primitive fails visibly;
- payment split > whole is blocked unless platform/tax lines are explicitly separate;
- external action retry does not duplicate charge/send/meeting/order;
- scheduled publish fails safely when dependency becomes unhealthy;
- cross-tenant evidence does not leak private sub-tenant internals;
- sub-tenant tier drop pauses high-trust delegation;
- unresolved import reference cannot publish;
- permission from one department cannot access another department's data without sharing rule;
- budget breach follows declared behavior or safe default;
- plugin-generated frontend cannot bypass screen contract or activation state;
- Figma frame mismatch triggers screen-contract correction rather than code invention;
- running instance remains pinned to original version after new publish;
- rollback does not mutate history;
- failed notification pauses auto-acceptance;
- duplicate webhook is acknowledged but not reprocessed;
- replay of a stored instance produces the same decision path;
- hidden decision state is rejected by validation/contract review;
- shadow run suppresses all side effects;
- cost-cap breach routes to declared breach behavior;
- delegated stage exposes only evidence allowed by crossing policy;
- exported composition contains symbolic credential references and no secrets;
- active instance without owner/timeout/escalation cannot publish;
- primitive without compatibility contract cannot enter the palette.

---


## 37. Architectural strength mechanics

This section operationalizes Blueprint v3 Part I (Composer Architectural Strength Guarantees). It does not make all depth immediate release scope. It defines the mechanics that later execution plans must preserve as they stage the product.

### 37.1 Single Canonical Configuration mechanics

Every Composer-editable concept resolves to one canonical backend record or record set. Faces do not own truth.

Faces may include:

- module settings page;
- Composer canvas;
- setup wizard;
- AI proposal diff;
- template/import/clone flow;
- Super Admin support view;
- diagnostics view;
- implementation-generated screen proposal.

A face may cache draft UI state locally while editing, but it must not become an independent configuration store. Saving a face writes to the canonical record set through the proposal pipeline. Reading another face reads the canonical record set.

**Validation rule.** A setting is not Composer-ready until a two-face test exists: edit through face A, read through face B, verify equality and audit source.

### 37.2 One Change Pipeline mechanics

Every Composer change source becomes a `ConfigurationChangeProposal` before it can alter canonical configuration.

The minimum proposal envelope is:

```text
proposal_id
source_type
source_actor
source_artifact_ref
composition_id
base_version_id
proposed_diff
affected_records
validation_result
risk_classification
cost_impact
permission_impact
evidence_impact
external_action_impact
export_impact
human_acceptance_required
approval_record_ref
publish_target
created_at
accepted_at
rejected_at
audit_event_ref
```

`source_type` values include `manual_edit`, `ai_proposal`, `template_apply`, `import`, `clone`, `compliance_pack_update`, `default_rebaseline`, `figma_screen_proposal`, `frontend_builder_proposal`, `codex_screen_plan`, and `support_repair`.

A proposal that fails validation remains visible with repair guidance. It is never silently applied and never silently discarded.

### 37.3 Replayable Execution mechanics

Every workflow instance stores a `ReplayEnvelope` sufficient to reconstruct the decision path:

```text
instance_id
composition_version_id
trigger_event_ref
initial_inputs
runtime_policy_versions
permission_policy_versions
compliance_pack_versions
pricing_table_version_ref
external_event_envelopes
external_response_envelopes
human_decision_refs
time_source_events
cost_events
state_events
random_seed_ref_if_used
feature_flag_snapshot
```

Replay does not mutate production. It writes a replay trace to a non-production replay ledger or debug artifact. Replay is **evidence-equivalent** by default. Byte-identical replay is required only when IDs, timestamps, randomness, hashes, and encryption metadata are deterministic or mocked.

Replay result fields:

```text
source_instance_id
replay_id
replay_mode
started_from_stage_id
modified_inputs_ref
mocked_external_responses_ref
decision_path
state_transition_trace
evidence_equivalence_result
divergences
side_effects_performed = false
created_by
created_at
```

### 37.4 No Hidden Decision State mechanics

Decision-affecting state includes counters, timers, flags, accumulated values, retry counts, budget consumption, cost variance, approval requirements, dependency wait markers, capacity signals, delegated-stage state, evidence-crossing decisions, and circuit-breaker state.

Such state must be one of:

1. an evidence event;
2. a state event;
3. an explainable derived value computed from evidence/state events;
4. a policy/version snapshot recorded with the instance.

Internal caches, locks, queues, and memoized values may exist, but they cannot be authoritative for routing, approvals, escalations, payment release, reputation, permission, or cost decisions.

Run Monitor must expose decision state in plain language:

```text
Current state: Waiting for client review
Why: acceptance_notice.sent at 2026-06-14T10:00 + review_window=P-16
Paused because: final notice delivery failed
Next action: resend notice or manual review
Owner: tenant.operations_manager
```

### 37.5 First-Class Failure Path mechanics

Every stage has outcome ports. Outcome ports may include:

```text
success
rejected
timeout
validation_failed
provider_failed
permission_denied
identity_tier_failed
cost_cap_breached
budget_depleted
capacity_unavailable
abandoned
manual_stop
disputed
cancelled
fallback_used
```

A publishable composition must resolve every outcome that can affect business state. Resolution may be:

- drawn edge to next stage;
- drawn edge to fallback stage;
- declared retry policy;
- declared pause/escalation path;
- visible platform-default failure handler with owner and notification;
- terminal safe state with explanation.

Hidden exception-only behavior is forbidden for business-state outcomes.

### 37.6 Shadow Mode mechanics

Shadow mode runs a candidate composition version beside the live version. It uses mirrored triggers and recorded/mocked external responses, but suppresses side effects.

Suppressed side effects include:

- sending customer-facing notifications;
- moving money;
- releasing escrow;
- changing customer-facing state;
- writing production reputation;
- mutating external providers;
- executing destructive actions;
- changing permissions;
- publishing public content.

Shadow run output:

```text
shadow_run_id
live_instance_ref
live_version_id
candidate_version_id
input_event_refs
live_decision_path
shadow_decision_path
divergence_points
cost_delta
state_delta
external_action_delta
suppressed_side_effects
recommendation
```

A shadow run may be used to support publish approval, but it is not a substitute for validation.

### 37.7 Cost as First-Class Signal mechanics

Every cost-bearing stage has a `CostPolicy`:

```text
cost_dimension_ref
forecast_cost
max_cost_per_invocation
budget_scope
variance_tolerance
breach_behavior
actual_cost_event_ref
cost_owner
approval_required_above
```

`breach_behavior` values:

```text
notify_and_continue
pause_for_approval
route_to_cheaper_provider
route_to_manual_review
stop_stage
stop_workflow
fallback_stage
```

Workflow conditions may branch on `forecast_cost`, `actual_cost`, `budget_remaining`, `cost_variance`, `prepaid_balance_state`, and `budget_cap_state` where the registered primitive exposes those values.

Actual spend is sourced from billing evidence, not UI mutation. Projected cost remains a forecast.

### 37.8 Delegation as Composition mechanics

A `DelegatedStage` is a stage whose implementation is fulfilled by a sub-tenant's published capability or composition interface.

Required fields:

```text
delegated_stage_id
host_tenant_id
subtenant_id
subtenant_capability_ref
subtenant_published_interface_version
input_contract
output_contract
evidence_crossing_policy
required_identity_tier
capacity_signal_ref
agreement_ref
escrow_ref_if_applicable
revocation_policy
fallback_subtenant_ref_or_internal_stage
abandonment_timer_ref
failure_edges
```

The sub-tenant executes inside its own tenant boundary. The host sees status, outputs, costs, SLA, and allowed evidence only. The host does not get internal sub-tenant process evidence unless explicitly permitted by the evidence-crossing policy.

Sub-tenant version pinning: a delegated stage pins the sub-tenant interface version at start. Later sub-tenant composition edits do not change in-flight delegated work unless an explicit migration occurs.

### 37.9 Versioned Change Graph mechanics

Every publish is a commit-like record, even if the beginner UI does not use Git language.

```text
version_id
composition_id
parent_version_id
branch_name_or_mode
author
change_summary
reason
created_at
validated_at
published_at
diff_ref
validation_result_ref
risk_classification
approval_record_ref
rollback_target_ref
```

Beginner labels:

- Draft;
- Test;
- Review;
- Live;
- Restore Previous Version.

Advanced labels may expose branch, merge, conflict, blame, and commit history when appropriate.

### 37.10 Bounded Recovery Policy mechanics

A `RecoveryPolicy` is a declared rule over evidence/state patterns.

```text
policy_id
scope
trigger_pattern
threshold
window
allowed_actions
max_duration
max_attempts
notification_targets
audit_event_type
stop_condition
requires_human_approval_if
```

Allowed actions may include retry, pause, queue, route to fallback, route to manual review, open circuit breaker, switch provider within approved provider set, notify, or escalate.

Forbidden automatic recovery actions:

- create new primitive;
- expand permissions;
- release funds;
- alter agreement terms;
- alter legal/compliance posture;
- publish public content;
- change reputation;
- bypass Gatekeeper;
- change identity tier;
- disable evidence capture.

### 37.11 No-Surprise Export mechanics

Export validation has levels:

1. **Schema export validation:** exported package conforms to export schema.
2. **Reference validation:** no hard-coded tenant/user/workspace/credential/sub-tenant IDs.
3. **Import dry-run:** package imports into clean isolated tenant with unresolved references marked.
4. **Golden-path run:** imported package runs its declared golden path.
5. **Certified-template proof:** template is not certified until level 4 passes.

Ordinary publishes require at least levels 1–2. High-risk compositions and certified templates require levels 1–4. Release plans may require stricter rules.

### 37.12 Evidence Multiplexing mechanics

A consequential event is recorded once and referenced by authorised views.

Minimum event envelope:

```text
evidence_event_id
event_type
tenant_id
actor_ref
subject_ref
workflow_instance_ref
stage_ref
correlation_id
timestamp
source_service
payload_hash
visibility_policy
billing_dimension_ref_if_any
reputation_signal_ref_if_any
export_visibility
```

The event may appear in:

- Run Monitor;
- audit trail;
- billing evidence;
- support diagnostics;
- reputation interpretation input;
- analytics/reporting;
- export package;
- dispute review.

Those are lenses, not independent truth stores.

### 37.13 Explainable Decision mechanics

Every consequential state transition has a decision explanation:

```text
decision_id
transition_ref
rule_id
source_layer
inputs_used
evidence_refs
policy_version_refs
result
responsible_party
plain_language_explanation
remediation_options
appeal_or_review_path_if_applicable
```

Source layers include platform backbone, compliance pack, service manifest, tenant configuration, agreement, permission policy, budget rule, recovery policy, AI proposal validation, and platform-default failure handler.

### 37.14 Instance Isolation mechanics

Every workflow instance has a private execution context:

```text
instance_id
composition_version_id
local_state_refs
local_timer_refs
local_retry_refs
local_cost_refs
local_evidence_refs
```

Shared state must be an explicit object:

```text
shared_object_ref
sharing_policy
allowed_readers
allowed_writers
evidence_event_refs
conflict_resolution_rule
```

A workflow cannot implicitly share counters, accumulated values, temporary flags, retries, or provider state across instances.

### 37.15 Credential Boundary mechanics

Compositions may reference credentials symbolically:

```text
credential_ref_symbol
provider_type
required_scope
owner_scope
health_requirement
rotation_state
remap_required_on_import
```

Compositions, exports, templates, AI prompts, screenshots, and generated frontend code must never contain:

```text
api_key
secret
token
refresh_token
private_key
password
raw credential material
```

On import, credential references are unresolved until the tenant maps them to authorised credentials.

### 37.16 Primitive Compatibility Contract mechanics

The primitive registry contract must include:

```text
primitive_id
name
owning_service
version
input_schema
output_schema
event_schema
invariants
failure_modes
cost_dimensions
evidence_policy
export_shape
permission_requirements
identity_tier_requirements
validation_hooks
ui_inspector_schema
side_effect_classification
version_compatibility
```

A primitive cannot enter the palette without this contract. AI proposals, imports, templates, and plugins cannot reference unregistered primitives.

### 37.17 Human-Preview Before Consequence mechanics

High-impact proposals must render an impact preview before acceptance.

High-impact domains:

- money;
- identity;
- access/permission;
- reputation;
- public communication;
- customer data;
- sub-tenant delegation;
- legal/compliance posture;
- irreversible actions;
- external destructive side effects.

Preview envelope:

```text
affected_people
affected_tenants
data_changes
permission_changes
cost_changes
external_actions_possible
evidence_created
reputation_possible
export_impact
rollback_or_compensation_path
approval_required
plain_language_risk
```

### 37.18 No Dead-End Runtime mechanics

Every active instance must maintain:

```text
current_state
current_owner
next_expected_event
waiting_since
timeout_at
escalation_target
recovery_action
last_evidence_event
```

A missing owner, missing timeout, missing expected event, or missing escalation path is a validation error for any stage that can wait.

### 37.19 Additive Capability Growth mechanics

New behavior enters Composer through registry additions:

- primitive registration;
- field type registration;
- policy type registration;
- provider adapter registration;
- template registration;
- compliance pack registration;
- extension manifest;
- UI inspector schema.

Hardcoded hidden canvas behavior is forbidden. A code path that changes execution without a registered contract is a doctrine breach.

### 37.20 Noob-Proof Surface Over Expert Mechanics

Advanced mechanics are exposed through progressive disclosure:

- default operator copy is plain language;
- advanced terms are available in Inspector, Diagnostics, Developer, or Admin views;
- warnings explain user consequences before implementation details;
- repair paths are visible before raw errors;
- templates pre-fill expert-safe defaults;
- AI explains, but manual controls remain available.

A feature that is technically correct but cannot be operated by its target persona remains incomplete.

### 37.21 Replay Lab mechanics

Replay Lab is the authorised debugging surface for time-travel analysis.

It may:

- reconstruct instance state at a past stage;
- substitute mocked external responses;
- modify inputs for analysis;
- replay forward into a non-production trace;
- compare actual vs hypothetical path.

It may not:

- mutate the real instance;
- send real notifications;
- move funds;
- change reputation;
- alter production evidence;
- bypass access/permission controls.

Replay Lab access requires support/diagnostic capability and audit.

### 37.22 Shadow-mode divergence report mechanics

A divergence report compares live and candidate behavior:

```text
same_path_until_stage
first_divergence_stage
live_next_stage
candidate_next_stage
live_cost
candidate_cost
live_evidence_types
candidate_evidence_types
side_effects_suppressed
risk_notes
suggested_action
```

Publish UI must never present "shadow passed" as absolute safety. It means no divergence beyond accepted tolerance was observed under mirrored inputs.

### 37.23 Strength guarantee release staging

Execution plans may stage guarantee depth using this vocabulary:

| Maturity | Meaning |
|---|---|
| Declared | Doctrine exists, implementation not in current release. |
| Scaffolded | Contracts/fields exist, behavior partial or disabled. |
| Advisory | Behavior reports/warns but does not enforce. |
| Enforced | Runtime blocks, routes, or requires approval. |
| Certified | Golden-path and negative tests prove behavior. |

A maturity label must never hide missing behavior. If a guarantee is not enforced in a release, the release notes must say so.

## 38. Internal contracts required before implementation

Before Composer implementation tickets, execution planning must define or reference:

- CompositionArtifact contract;
- CompositionVersion contract;
- PrimitiveRegistration contract;
- ExtensionManifest contract;
- ConfigurationChangeProposal contract;
- ValidationResult contract;
- RuntimeResolver contract;
- ReplayEnvelope contract;
- ReplayTrace contract;
- ShadowRun contract;
- DivergenceReport contract;
- DecisionStateEvent contract;
- RecoveryPolicy contract;
- CostPolicy contract;
- VersionedChangeGraph contract;
- CredentialReference contract;
- PrimitiveCompatibilityContract contract;
- ImpactPreview contract;
- RuntimeOwnership contract;
- PermissionPolicy and PermissionGrant contract;
- DelegationGrant contract;
- EvidenceCrossingPolicy contract;
- StructuredAgreement contract;
- AgreementSplitRule contract;
- ExternalActionAdapter contract;
- AIProposal contract;
- ExportImport contract;
- ScreenContract for every frontend surface;
- Figma/component contract where design is required;
- frontend-builder acceptance contract where plugin-assisted code is allowed.

---

## Appendix A — Local parameter references

This appendix names Composer parameter dependencies without freezing numeric values.

| Parameter | Used for |
|---|---|
| P-05 | reputation decay where reputation-aware selection is used |
| P-06 | minimum completed structured engagements before numeric reputation display |
| P-08/P-09 | AI freemium/credit controls where AI assistant is enabled |
| P-11 | parameter-change notice |
| P-16 | acceptance ladder / timeout escalation |
| P-17 | maximum undisclosed safety suppression where relevant |
| P-18 | human review SLA |
| P-20 | reputation bond cap where KYC alternatives apply |
| P-21 | marketplace demand gates instrumented through Composer transactions |
| P-22/P-23 | revenue-validation measurement hooks where applicable |
| P-26 | organisation depth-tier pricing |
| P-27 | per-tenant active workflow limit |
| P-28 | per-workflow stage-count limit |
| P-29 | composition-version retention |
| P-30 | budget warning threshold, if defined |
| P-31 | delegation abandonment timer |

---

## Appendix B — Glossary

| Term | Meaning |
|---|---|
| Runtime Resolver | Shared interpretation layer that reads a pinned composition version and dispatches to primitive services. |
| ConfigurationChangeProposal | Universal change object created before any Composer modification is accepted. |
| CompositionVersion | Immutable snapshot used by running workflow instances. |
| Primitive service | Service that owns execution of a primitive stage. |
| Evidence crossing | Visibility policy for evidence produced in delegated work. |
| AgreementSplitRule | Rule defining payment allocation, hold, release, reversal, tax, fee, penalty, or bonus. |
| Figma artifact | Design artifact used to express screen behavior; not business authority. |
| Frontend app builder plugin | Generator/scaffolder used to accelerate UI, not source truth. |
| Screen contract | Approved frontend specification that must exist before implementation. |
| ReplayEnvelope | Recorded instance package needed to reconstruct a decision path. |
| ReplayTrace | Non-production result of replaying an instance. |
| ShadowRun | Side-effect-free candidate-version execution beside a live version. |
| DivergenceReport | Comparison of live and shadow/candidate behavior. |
| DecisionStateEvent | Evidence/state event representing a value that affects workflow progression. |
| CostPolicy | Stage-level cost forecast/cap/breach rule. |
| RecoveryPolicy | Bounded automatic recovery rule over evidence/state patterns. |
| VersionedChangeGraph | Commit-like composition history with parent, author, diff, validation, risk, and rollback. |
| CredentialReference | Symbolic reference to a credential stored outside the composition. |
| PrimitiveCompatibilityContract | Registered primitive capability description required before a node enters Composer. |
| ImpactPreview | Human-readable consequence preview before high-risk changes. |
| No Dead-End Runtime | Guarantee that every active instance has owner, state, timeout, next event, escalation, and recovery. |

End of Esbla Composer — How It Works v3.
