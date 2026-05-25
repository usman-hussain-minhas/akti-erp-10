# AKTI ERP Phase 3 - Security/Auth/Tenant Hardening Plan v1

**Status:** Active Phase 3 control plan
**Project:** AKTI ERP 1.0
**Phase:** Phase 3 - Security/Auth/Tenant Hardening
**Authority:** Planning and ticket-pack control document only. Prisma, contracts, module manifests, generated registry, ADRs, and `AGENTS.md` remain higher authority.
**Audit rule:** The Phase 3 audit report is an exit artifact only. It must remain a stub during planning and must say: "To be completed at Phase 3 closure."

## 1. Accepted Baseline

Phase 1 is `PASS`.

Phase 2 is `PASS_WITH_ACCEPTED_DEFERRALS`.

Phase 1 and Phase 2 are merged to `main`; post-merge audit, source refresh, and doctrine/process refresh have completed.

Phase 3 is next. Phase 4 deployment/staging/visual QA must wait until Phase 3 security/auth/tenant decisions are complete.

Architecture classifications to preserve:

| Classification | Scope |
|---|---|
| Platform Core | Organization, Access, Hierarchy, Gatekeeper, Audit, Outbox, Module Registry, Configuration, Portal Shell |
| Engagement Gateway Lite | Shared platform module |
| Lead Desk | Business module |
| WhatsApp stub | Integration adapter |

Accepted deferrals carried into Phase 3/Phase 4:

| Deferral | Phase 3 handling |
|---|---|
| production deployment | Not in Phase 3; Phase 4 only |
| production auth/session | Phase 3 decision and bounded implementation |
| production WhatsApp credentials | Not in Phase 3 |
| real outbound WhatsApp | Not in Phase 3 |
| fresh empty-database bootstrap baseline | Phase 3 decision or bounded deferral |
| runtime route limiting | Phase 3 decision and bounded implementation/handoff |
| browser-rendered frontend tests | Phase 4 unless explicitly scoped as Phase 3 security tests |

## 2. Phase 3 Verdict

Phase 3 is `HYBRID`, leaning `ADDING missing security/tenant architecture`.

Existing foundations are real but partial:

- service-level organization checks;
- Access Core actor/capability boundaries;
- Gatekeeper fail-closed checks;
- audit/outbox evidence;
- module manifests and generated registry;
- CI validation ladder from Phase 2.

Missing or incomplete foundations:

- production auth/session;
- trusted tenant context propagation;
- DB RLS enforcement;
- secrets/environment policy;
- runtime route limiting;
- session-aware frontend operator context;
- fresh DB/bootstrap path.

Phase 3 must not assume "hardening only." It must convert accepted decisions into runtime behavior, tests, and validation evidence wherever current repo authority and Phase 3 scope permit.

## 3. Security/Tenant Reality Assessment

| Area | Existing foundation | Repo evidence | Missing gaps | Verdict | Required decision |
|---|---|---|---|---|---|
| auth/session | no | `apps/api/src/main.ts`, API controllers, and web client rely on local/request-provided identity rather than a trusted auth/session layer | production auth/session strategy, trusted identity, session failure behavior | adding | P3-002 |
| tenant context propagation | partial | tenant/org IDs exist in Prisma, Access Core, Lead Desk, Engagement Gateway, and tests; current API identity often uses `x-actor-user-id` and route/body org context | trusted request tenant context provider and migration away from caller-controlled headers | hybrid | P3-002, P3-007A, P3-007B |
| RLS/database isolation | partial | Prisma tenant-scoped models include `organization_id`; registry metadata marks RLS requirements | no confirmed DB-level RLS policy implementation | hybrid | P3-003, P3-008 |
| service-level tenant checks | partial | Access Core, Lead Desk, Engagement Gateway, and Gatekeeper perform same-org and org-scoped checks | consistency after trusted auth context and broader negative coverage | hardening | P3-007B, P3-009, P3-013 |
| Access Core after auth | partial | Access Core checks actor/capability/org boundaries but actor identity is not session-backed | integration with trusted request context and equivalent/stronger tests | hybrid | P3-002, P3-009 |
| Gatekeeper after auth | partial | Gatekeeper fail-closed behavior exists and is used for high-risk flows | authenticated context binding and no-write-on-failure evidence after auth integration | hybrid | P3-002, P3-009 |
| secrets/env policy | partial | `DATABASE_URL` validation exists; no broad Phase 3 env/headers/CORS policy | non-secret templates, safe defaults, validation, headers/CORS controls | hybrid | P3-004, P3-011 |
| runtime route limiting | no | workflow and manifests note validation; no runtime limiter is wired in API bootstrap | decision between in-app, dependency-backed, or infrastructure-level limiting | adding | P3-005, P3-010 |
| frontend operator context | partial | Lead Desk web uses temporary `sessionStorage` operator context and sends `x-actor-user-id` | session-aware operator context replacement after auth/session decision | hybrid | P3-002, P3-012 |
| fresh DB/bootstrap path | partial | migrations exist as ticket deltas; Phase 2 accepted deferral documents fresh DB baseline gap | decision on Phase 3 action or Phase 4 bounded handoff | hybrid | P3-006 |
| CI/validation coverage | partial | `.github/workflows/phase1-validation.yml` is named Phase 1 but runs Phase 2 validation/job naming | Phase 3 naming/security-gate alignment without weakening Phase 1/2 checks | hardening | P3-014 |
| Phase 4 readiness | partial | roadmap and accepted deferrals identify Phase 4 as deployment/staging/visual QA | Phase 3 closure evidence and readiness handoff only | hardening | P3-GATE |

## 4. Maximum Concrete Capability Principle

Phase 3 must implement the maximum concrete security/auth/tenant capability that is justified by current repo authority and current Phase 3 scope.

Maximum concrete capability means:

- do not choose the shallow/document-only path when runtime implementation is safely possible;
- do not defer work merely because it is harder;
- do not leave decorative contracts, placeholder policies, or untested claims;
- convert accepted decisions into runtime behavior, tests, and validation evidence wherever current scope permits;
- prefer stronger implementation over temporary documentation when the repo already has enough authority to implement safely.

But it does not permit:

- inventing business rules;
- adding unapproved dependencies;
- accessing production secrets;
- implementing deployment/staging work;
- enabling real WhatsApp production behavior;
- expanding into Phase 4/5/6 work;
- making destructive migrations;
- bypassing ADRs, contracts, Prisma, manifests, or `AGENTS.md`.

## 5. Ordered Ticket Queue

The ordered ticket queue is authoritative. Phase groupings are explanatory only.

| Ticket | Title | Type | Gate notes |
|---|---|---|---|
| P3-000 | Track Phase 3 controls and baseline | control | Starts Phase 3 control tracking |
| P3-001 | Security Architecture ADR | decision/control | Decision only |
| P3-002 | Auth, Session, Identity, and Tenant Context Decision | decision/control | Gates P3-007A, P3-007B, P3-009, P3-012 |
| P3-003 | Tenant Isolation, RLS, and Service Enforcement Decision | decision/control | Gates P3-008 |
| P3-004 | Secrets, Environment, Headers, and CORS Policy | decision/control | Gates P3-011 |
| P3-005 | Runtime Route Limiting Decision | decision/control | Gates P3-010 |
| P3-006 | Fresh DB and Bootstrap Decision | decision/control | Gates bootstrap action or bounded deferral |
| P3-007A | Auth/Tenant Request Context Infrastructure | implementation | Infrastructure only; no broad API migration |
| P3-007B | API Surface Migration to Trusted Context | implementation | Bounded slices; split further if broad |
| P3-008 | Tenant Isolation Enforcement Implementation | implementation | Conditional re-plan required after P3-003 |
| P3-009 | Access Core and Gatekeeper Auth Integration | implementation | Must preserve fail-closed behavior |
| P3-010 | Runtime Route Limiting Resolution | implementation/control | Conditional re-plan required after P3-005 |
| P3-011 | Secrets, Env, Headers, and CORS Implementation | implementation | Must not become deployment work |
| P3-012 | Frontend Auth and Operator Context Replacement | implementation | Gated by P3-001 and P3-002 |
| P3-013 | Security and Tenant Negative Test Pass | validation | Must not weaken Phase 1/2 tests |
| P3-014 | Phase 3 CI / validation naming and security-gate alignment | implementation/control | Included because repo inspection confirms need and safe scope |
| P3-GATE | Phase 3 Closure Audit and Phase 4 Readiness Handoff | closure | Closure evidence only; no Phase 4 plan |

## 6. P3-014 Inclusion Decision

P3-014 is included.

Repo evidence:

- `.github/workflows/phase1-validation.yml` is still Phase 1-named;
- the workflow display name is `Phase 2 Validation`;
- the job is `phase2-validation`;
- the ladder includes Phase 2 registry verification.

This is safely scoped because P3-014 may align naming and security-gate validation only. It must not add deployment, secrets, production credentials, package dependencies, or unrelated CI behavior.

## 7. Global Ticket-Pack Rules

- `ordered_ticket_queue` is authoritative.
- Phase groupings are explanatory only.
- Exact-file planning is required before edits.
- Broad globs are inspection hints only.
- Control docs are stable contract, not a runtime ledger.
- Runtime progress comes from git commits, journal, artifacts, optional run-state, and queue order.
- Bounded repair is allowed only inside active ticket scope.
- Validation/test-runner wiring is allowed only when required by active-ticket tests.
- Full-access/elevated execution exception remains bounded by active control docs and stop conditions.
- Do not retire the full-access/elevated execution exception during Phase 3 planning or execution.
- Any ticket whose scope depends on an earlier decision must include `conditional_replan_required: true`.
- Any ticket with broad implementation risk must be split before execution, not repaired through broadening during execution.
- P3-001 through P3-006 are decision/control tickets only.
- P3-001 through P3-006 must not modify runtime source, Prisma schema, contracts, generated registry, dependencies, or workflow files unless reclassified and explicitly approved.
- Tests using `x-actor-user-id` may be updated only if replaced by equivalent or stronger trusted-context coverage.
- Removing old header-based tests without equivalent coverage is forbidden.
- Stale-ticket risk prevention is mandatory: tickets must encode dependency gates, runtime consistency chains, validation gates, re-planning triggers, non-scope boundaries, and stop conditions before implementation starts.

Phase 3 must not weaken Phase 1/2 protections:

- Access Core actor/capability boundaries;
- Gatekeeper fail-closed behavior;
- Lead Desk scope enforcement;
- Engagement Gateway mediated WhatsApp boundary;
- audit/outbox evidence;
- cross-org denial behavior.

## 8. Validation Gate Policy

After each decision/documentation ticket:

- run syntax checks where applicable;
- run `git diff --check`;
- run `git status --short --branch`;
- if JSON files changed, parse them with Node before commit.

After each implementation ticket:

- run ticket-specific validation;
- run the full applicable validation ladder before starting the next implementation ticket.

After schema, registry, auth, tenant, Access Core, Gatekeeper, CI, or security-boundary tickets:

- run full validation and drift checks;
- verify no previous Phase 1/2 tests or validation wiring were removed or weakened.

Any validation failure outside active ticket scope is a stop unless bounded repair is explicitly allowed by the ticket.

Standard full validation ladder:

```bash
pnpm contracts:validate
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm exec prisma generate --schema prisma/schema.prisma
pnpm registry:generate
git diff --exit-code -- generated/entity-registry.generated.json
pnpm registry:check
pnpm registry:verify:phase2
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff -- prisma/schema.prisma
git diff -- prisma/entity-registry.metadata.json
git diff --check
git status --short --branch
```

## 9. Runtime Consistency Chains

- auth/session decision -> request context -> controller/service migration -> tests;
- tenant isolation decision -> enforcement strategy -> cross-tenant negative tests;
- Access Core/Gatekeeper integration -> fail-closed behavior -> no-write-on-failure tests;
- frontend auth decision -> operator context replacement -> frontend tests;
- route limiting decision -> runtime or bounded deferral -> manifest/runtime alignment;
- fresh DB/bootstrap decision -> Phase 3 action or Phase 4 handoff.

## 10. Hard Boundaries

Phase 3 must not include:

- deployment/staging implementation;
- visual QA implementation;
- production WhatsApp credentials;
- real outbound WhatsApp;
- direct Lead Desk-to-Meta/WhatsApp coupling;
- new business modules;
- Foundry/module installer implementation;
- parallel module development;
- platform AI operations;
- destructive migrations;
- committed secrets;
- production credential access;
- new dependencies unless a ticket stops for explicit approval.

## 11. Phase 4 Deferrals

The following are explicitly deferred to Phase 4 or later:

- production deployment;
- staging deployment;
- deployment infrastructure;
- hosting-specific runtime configuration;
- production secret provisioning;
- browser-rendered visual QA;
- production WhatsApp credential activation;
- real outbound WhatsApp behavior;
- Foundry/module installer work;
- parallel installable module development.

## 12. Completion Target

Phase 3 may close only when:

- required ADRs/decisions are complete;
- auth/session and trusted tenant context behavior exist or are bounded by explicit decision;
- tenant isolation enforcement is implemented according to P3-003 and P3-008;
- Access Core and Gatekeeper remain fail-closed and auth-aware;
- route limiting is implemented or bounded by P3-005/P3-010;
- secrets/env/header/CORS policy and implementation are complete without deployment drift;
- frontend operator context no longer depends on caller-controlled temporary identity where Phase 3 authority permits;
- security and tenant negative tests pass;
- CI/security-gate naming alignment is resolved by P3-014;
- Phase 1/2 protections are not weakened;
- the Phase 3 audit report is completed at closure;
- P3-GATE creates a Phase 4 readiness handoff, not a Phase 4 plan.
