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
document_type: composer_codex_ui_figma_frontend_skill
scope: Candidate Codex/Figma/frontend discipline for Composer UI work; for ratification only, not an operative skill yet.
title: Esbla Composer - Codex UI, Figma, and Frontend App-Builder Skill v3
---
# Esbla Composer — Codex UI, Figma, and Frontend App-Builder Skill v3

## 0. Purpose

This skill defines how Codex or any implementation agent must use Figma, frontend app-builder plugins, Figma Make, Code Connect, design-system libraries, and generated UI drafts when working on Esbla Composer frontend surfaces.

Figma and frontend app-builder plugins are accelerators. They are not source of truth, business logic, implementation authority, or a substitute for screen contracts.

The goal is to prevent frontend drift while allowing high-quality UI work.

Composer frontend must remain:

- doctrine-aligned;
- screen-contract-led;
- permission-aware;
- activation-aware;
- evidence-aware;
- cost-aware;
- explainable;
- noob-proof;
- accessible;
- connected to a real API or explicit mock contract;
- never a fake dashboard or pretty prototype posing as production UI.

## 1. Non-negotiable rule

Codex must not implement a Composer frontend screen from imagination.

A Composer screen requires:

1. approved Composer doctrine;
2. approved screen contract;
3. current repo inspection;
4. component/data/API boundary inspection;
5. Figma/design context if available;
6. exact-file implementation plan;
7. validation plan;
8. screen-state matrix;
9. architectural-strength guarantee mapping.

Figma and frontend-builder outputs can clarify visual intent, spacing, component composition, interaction hints, and state variants. They do not override Composer Blueprint, Composer How It Works, Business Logic, Access Core, Gatekeeper, Foundry, screen contracts, package contracts, Prisma, manifests, or tests.

## 2. Required stack target

Frontend implementation must target the approved project stack:

- Next.js;
- React;
- TypeScript;
- Tailwind;
- shadcn/ui;
- `packages/ui` where available;
- permission-aware route/navigation patterns;
- activation-aware rendering;
- real API/data contract or explicit mock contract;
- empty/loading/error/recovery states;
- responsive behavior;
- audit and evidence hooks where applicable.

No new dependency may be introduced unless the active ticket/control document explicitly approves it.

## 3. Inputs required before frontend work

Before any Composer frontend implementation, Codex must identify:

- screen contract path or approved draft;
- primary user role;
- primary task;
- primary action;
- data source/API/mock contract;
- activation state dependency;
- permission dependency;
- evidence/audit dependency;
- cost/risk dependency if applicable;
- empty/loading/error/recovery states;
- Figma node URL or design reference if available;
- relevant Composer Architectural Strength Guarantees;
- exact files proposed;
- validation commands;
- stop conditions.

If any required item is missing, Codex stops and reports the missing control input.

## 4. Figma usage policy

### 4.1 Figma is design context, not authority

Figma may provide:

- layout direction;
- component hierarchy;
- spacing/visual rhythm;
- interaction intent;
- state variants;
- responsive references;
- copy direction;
- visual QA target.

Figma may not define:

- business rules;
- permissions;
- activation truth;
- data ownership;
- evidence rules;
- payment/escrow rules;
- AI authority;
- backend schema;
- source-of-truth precedence;
- validation scope;
- implementation file ownership.

If Figma contradicts doctrine or screen contract, doctrine/screen contract wins and the conflict is logged.

### 4.2 Node-specific URL requirement

Codex should use node-specific Figma URLs where available. A broad design-file URL is insufficient for implementation when the screen contract names a specific screen or component.

### 4.3 Figma tool sequence

When a Figma tool or connector is available, Codex should:

1. fetch the specific node or frame;
2. identify component structure;
3. map visible states;
4. map tokens/components to approved UI library where possible;
5. identify deviations from the screen contract;
6. propose adaptation rather than blind copying;
7. report what was used and what was intentionally ignored.

## 5. Frontend app-builder and plugin usage policy

Frontend app-builder plugins may be used to accelerate draft UI, but generated output is not accepted until adapted.

Generated UI must be checked for:

- use of approved stack;
- no hardcoded demo data except explicit mock fixtures;
- no hidden state as source of truth;
- no direct production external calls;
- no credentials or secrets;
- activation-aware rendering;
- permission-aware rendering;
- accessible labels and keyboard behavior;
- responsive behavior;
- screen-state completeness;
- evidence/cost/risk display where required;
- no removal of required platform identity;
- no AI autonomy beyond doctrine;
- no behavior not represented in screen contract or registered capability.

Generated UI must be treated as a draft input to the implementation plan, not as final implementation authority.

## 6. One Change Pipeline for design/tool output

Any Figma, frontend-builder, plugin, AI, or manually drafted output that proposes behavior, fields, copy with operational meaning, state transitions, actions, or configuration changes must enter the same governed proposal path.

Codex must record:

```text
source_type = figma | frontend_builder | plugin | ai | manual
source_artifact_ref = node URL / generated artifact / prompt / file
proposed_ui_diff
proposed_behavior_diff
screen_contract_alignment
composer_guarantees_checked
accept_or_reject_reason
```

If the generated output proposes a Composer configuration change, it must be represented as a `ConfigurationChangeProposal`. If it proposes frontend implementation only, it must be represented as a `ScreenImplementationPlan`.

No generated UI may bypass screen contract, Access Core, Gatekeeper, Foundry activation, tenant isolation, data classification, evidence, audit, or validation requirements.

## 7. Composer Architectural Strength Guarantees in frontend work

Composer v3 adds architectural-strength guarantees. Frontend work must expose these guarantees through usable UI, not hide them behind logs.

| UI area | Required guarantees |
|---|---|
| Settings/manual form | Single Canonical Configuration; One Change Pipeline; Explainable Decisions |
| AI proposal panel | One Change Pipeline; Human Preview Before Consequence; Explainable Decisions |
| Figma-derived implementation | One Change Pipeline; Credential Boundary; Noob-Proof Surface |
| Frontend app-builder output | One Change Pipeline; Primitive Compatibility Contracts; No fake behavior |
| Workflow canvas | First-Class Failure Paths; No Dead-End Runtime; Cost as First-Class Signal |
| Delegation chooser | Delegation as Composition; Human Preview Before Consequence; Credential Boundary |
| Run monitor | Replayable Execution; No Hidden Decision State; Evidence Multiplexing; Explainable Decisions |
| Publish view | Versioned Change Graph; Shadow Mode; No-Surprise Export; Impact Preview |
| Export/import view | No-Surprise Export; Credential Boundary; Symbolic remapping |
| Debugger/replay view | Replayable Execution; Time-safe non-production trace; No production mutation |

A frontend plan is incomplete if it only describes layout. It must describe the state, action, evidence, permission, validation, and consequence behavior behind the UI.

## 8. Composer-specific frontend surfaces

### 8.1 Setup Wizard

Purpose: help a non-technical operator create the first valid composition from a template or guided description.

Must show:

- business type/starting pattern;
- selected template;
- organisation defaults;
- required modules/services;
- cost/risk preview;
- validation summary;
- next action.

### 8.2 Organisation View

Purpose: let the tenant compose branches, departments, teams, roles, and inheritance.

Must show:

- hierarchy graph;
- parent/child or multi-parent order where applicable;
- inherited vs overridden settings;
- attached workflows;
- attached permission sets;
- members;
- warnings for unsafe reorganization;
- form/list fallback.

### 8.3 Workflow View

Purpose: let the tenant compose stages and transitions.

Must show:

- stage nodes;
- success/failure/timeout/rejection/cost/provider/permission outcome edges;
- responsible party;
- primitive type;
- custom fields;
- cost policy;
- evidence policy;
- validation errors;
- test/publish status;
- form/list fallback.

### 8.4 Policy and Permission View

Purpose: let the tenant compose source-scoped permissions without leaking data across departments or tenants.

Must show:

- inherited grants;
- individual grants;
- source scope;
- data class;
- workflow scope;
- expiry;
- identity tier requirement;
- effective permission preview;
- blocked hard-rule overrides.

### 8.5 Sub-Tenant Delegation View

Purpose: let a host tenant delegate a stage to another tenant safely.

Must show:

- sub-tenant directory/direct invitation/marketplace source where applicable;
- reputation signal;
- capacity/availability signal;
- capability/interface selected;
- pinned version;
- input/output contract;
- evidence-crossing policy;
- structured agreement;
- escrow/payment split where applicable;
- fallback/revocation/abandonment behavior.

Delegation must look like composition, not like a broad access grant.

### 8.6 Agreement and Split Rule View

Purpose: let tenants configure scope, acceptance, milestones, payment, split, refunds, and dispute behavior.

Must show:

- parties;
- scope;
- milestones;
- objective/subjective acceptance criteria;
- notice ladder;
- price/split/holdback/platform fee/tax lines;
- refund reversal;
- dispute hold;
- legal/compliance disclosure.

### 8.7 External Connections View

Purpose: bind external actions without exposing secrets.

Must show:

- provider;
- symbolic credential reference;
- required scope;
- health;
- retry policy;
- idempotency policy;
- fallback stage;
- manual recovery path;
- no secret values.

### 8.8 AI Proposal Panel

Purpose: let AI propose, explain, and repair without becoming authority.

Must show:

- prompt/source;
- proposed diff;
- explanation;
- validation result;
- risk/cost/permission/evidence impact;
- accept/reject/edit;
- provenance;
- human approval requirement where applicable.

### 8.9 Test, Shadow, Debug, and Replay View

Purpose: let the tenant test or diagnose without production mutation.

Must show:

- test data or mirrored trigger source;
- side effects suppressed;
- path trace;
- divergence report for shadow runs;
- replay trace for historical instances;
- what-if modifications clearly marked non-production;
- no production evidence/billing/reputation/payment mutation.

### 8.10 Publish View

Purpose: make publishing safe and explainable.

Must show:

- diff;
- author;
- summary/reason;
- validation result;
- risk classification;
- cost impact;
- permission impact;
- evidence impact;
- export validation;
- rollback target;
- approval requirement.

### 8.11 Run Monitor

Purpose: make live execution explainable and repairable.

Must answer:

- where am I;
- who owns me now;
- what am I waiting for;
- since when;
- what happens next;
- when do I escalate;
- who gets notified;
- what evidence explains this;
- what repair actions are available.

### 8.12 Export/Import View

Purpose: preserve customer sovereignty and no-surprise export.

Must show:

- what is included;
- what is excluded;
- unresolved references;
- credential remapping required;
- sub-tenant remapping required;
- validation result;
- clean-room test result where available;
- import repair path.

## 9. Noob-proof frontend acceptance

A Composer frontend surface is not accepted because it looks good. It is accepted only when a non-technical operator can understand the task, complete the primary action, recover from invalid input, see consequences before publish, and avoid implementation jargon.

Required checks:

- plain-language copy;
- visible primary action;
- empty/loading/error/recovery states;
- form/list fallback where canvas is insufficient;
- meaningful validation messages;
- cost/risk/evidence/failure visibility;
- no hidden destructive action;
- accessible keyboard/focus behavior;
- responsive behavior appropriate to the screen;
- screenshots or visual QA evidence where required.

## 10. Required screen-state matrix

Every Composer screen contract or implementation plan must cover:

| State | Required answer |
|---|---|
| Empty | What should the user do first? |
| Loading | What is being fetched or prepared? |
| Ready | What is the primary action? |
| Invalid | What failed and how can it be repaired? |
| Permission denied | Which role/capability is missing? |
| Activation missing | Which service/module is disabled? |
| Cost blocked | Which budget/prepaid/cost rule blocked it? |
| Provider unavailable | What fallback or retry exists? |
| Conflict | What changed and how can the user resolve it? |
| Published | What changed, who changed it, and rollback path? |
| Runtime stuck | Owner, waiting reason, timeout, repair action? |
| Export/import unresolved | What must be remapped or removed? |

## 11. Figma-to-code adaptation checklist

Before implementation, Codex must map:

- Figma frame → screen contract;
- Figma components → approved UI components;
- Figma states → state matrix;
- Figma actions → approved API/actions;
- Figma copy → doctrine-safe plain language;
- Figma data examples → real API/mock contract;
- Figma visual hierarchy → noob-proof task hierarchy;
- Figma hidden assumptions → documented gaps;
- Figma deviations → explicit acceptance/rejection.

## 12. Code Connect and design-system usage

If Code Connect or an equivalent design-system mapping exists, Codex should prefer mapped components over custom recreation.

If a Figma component has no approved implementation counterpart, Codex must not silently invent a new component library. It should map to existing primitives where reasonable or stop for a design-system/screen-contract decision.

## 13. Frontend implementation stop conditions

Stop if the proposed frontend work:

- has no screen contract;
- has no exact-file plan;
- uses fake data as if real;
- bypasses Access Core, Gatekeeper, Foundry, or activation truth;
- stores configuration outside the canonical record;
- hides failure paths;
- hides cost impact;
- includes provider secrets or literal credentials;
- removes required platform identity;
- presents AI as an autonomous actor;
- implements destructive action without preview;
- creates new executable behavior not registered as a primitive/capability/extension;
- cannot explain what data/API/evidence powers the screen.

## 14. Output format for Codex design-to-code planning

```md
## Screen implementation plan

### Source inspection
- Repo files inspected:
- Screen contract:
- Figma node/artifact:
- API/data contract:

### Screen intent
- User:
- Primary task:
- Primary action:
- Noob-proof concern:

### Component map
- Existing components:
- New components required:
- Figma/component mapping:

### Data map
- API/mock source:
- Permission/activation dependencies:
- Evidence/cost/risk dependencies:

### Action map
- User actions:
- Gatekeeper/human approvals:
- Audit/evidence events:

### States
- Empty:
- Loading:
- Ready:
- Invalid:
- Permission denied:
- Activation missing:
- Error:
- Recovery:

### Architectural-strength guarantees touched
- CSG IDs:
- How the UI exposes/protects them:

### Exact files proposed
- Files:
- Ownership boundary:

### Validation
- Commands:
- Visual QA:
- Accessibility checks:

### Stop conditions
- Missing decisions:
- Out-of-scope dependencies:
```

## 15. Relationship to FFET and ticketing

This skill does not authorize implementation.

It informs screen contracts, planning, and FFET creation.

A frontend FFET must still have:

- exact file ownership;
- runtime behavior;
- minimum concrete requirement;
- validation commands;
- dependency tickets;
- blockers;
- stop conditions;
- freshness check against repo HEAD;
- no overlapping file ownership.

## 16. Composer-specific anti-patterns

Reject these patterns:

- canvas-only UI with no accessible fallback;
- AI prompt box that silently changes workflow;
- permissions shown as simple role badges without scope;
- sub-tenant assignment without agreement and capability grant;
- payment split UI without refund/dispute preview;
- budget cap UI without breach behavior;
- import/export UI that hides unresolved references;
- publish button without validation diff;
- run monitor without repair actions;
- replay/debug UI that mutates production;
- shadow mode UI that sends real notifications or moves funds;
- Figma-perfect page with no real data path;
- frontend app-builder code pasted without adaptation;
- generic SaaS dashboard replacing Composer-specific operator tasks.

## 17. Closing rule

Figma and frontend app-builder plugins are accelerators.

They help Codex see and implement better frontend experiences.

They are not product doctrine, not business logic, not source of truth, and not implementation authority.

Composer UI implementation remains governed by:

- Composer Blueprint;
- Composer How It Works;
- Business Logic;
- AGENTS/Codex operating doctrine;
- screen contracts;
- package contracts;
- repo source of truth;
- validation evidence.

End of Esbla Composer — Codex UI, Figma, and Frontend App-Builder Skill v3.
