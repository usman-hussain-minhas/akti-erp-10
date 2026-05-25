# AKTI ERP Phase 3 — Security, Auth, Tenant and Operational Trust Foundation Plan v1

**Status:** Planning brief only  
**Active repo path:** `docs/process/AKTI_ERP_Phase_3_Security_Auth_Tenant_Hardening_Plan_v1.md`  
**Purpose:** Define the direction, boundaries, required decisions, and planning requirements for Phase 3 before Codex creates the Phase 3 ticket pack.  
**Authority:** This document is a planning control document. It is not an implementation ticket pack, audit report, deployment plan, or final source of truth for individual tickets.

---

## 1. Current Accepted State

AKTI ERP has completed and merged:

```text
Phase 0 — Governance and source-of-truth baseline
Phase 1 — Platform foundation
Phase 1 hardening
Phase 2 — First module-layer proof
Phase 2 hardening
Phase 2 quality pass
Post-merge Phase 1 + Phase 2 audit
Post-Phase-2 source refresh
```

Current strategic classification:

```text
Platform Core = Organization, Access, Hierarchy, Gatekeeper, Audit, Outbox, Module Registry, Configuration, Portal Shell
Engagement Gateway Lite = shared platform module
Lead Desk = business module
WhatsApp stub = integration adapter
```

Current accepted deferrals carried from Phase 2:

```text
production deployment
production auth/session
production WhatsApp credentials
real outbound WhatsApp
fresh empty-database bootstrap baseline
runtime route limiting
browser-rendered frontend tests
```

Phase 3 must address the relevant security and trust deferrals before Phase 4 deployment/staging work begins.

---

## 2. Phase 3 Name

```text
Phase 3 — Security, Auth, Tenant and Operational Trust Foundation
```

---

## 3. Phase 3 Purpose

Phase 3 turns AKTI ERP from a validated internal platform into a **trust-ready platform foundation**.

The goal is not to deploy the system yet. The goal is to make the system trustworthy enough that Phase 4 can safely prepare staging, deployment, visual QA, and operations.

Phase 3 must resolve:

```text
authentication and session direction
tenant context propagation
tenant isolation strategy
role/capability enforcement after auth exists
Access Core and Gatekeeper relationship to authenticated identity
secrets and environment policy
runtime route limiting
security headers and CORS policy
temporary operator context replacement path
cross-tenant negative testing
fresh DB/bootstrap decision or bounded deferral
Phase 4 readiness assumptions
```

---

## 4. Phase 3 Is Not

Phase 3 must not become a hidden deployment or module-expansion phase.

Phase 3 is not:

```text
production deployment
staging deployment
visual QA implementation
real WhatsApp production enablement
real outbound WhatsApp messaging
new business module development
Foundry/module installer implementation
parallel module development
platform AI operations
marketplace or enterprise scaling
```

Those belong to later phases.

---

## 5. Critical Phase 3 Question

Before implementation, Codex must answer with repo evidence:

```text
Is Phase 3 mostly hardening existing security/tenant foundations,
or is Phase 3 adding missing security/tenant architecture?
```

This is the highest-risk Phase 3 planning question.

The answer changes the ticket pack:

```text
hardening = smaller ticket pack focused on strengthening existing foundations
adding = larger ticket pack with architecture decisions and new foundations first
hybrid = ADR decisions first, then implementation tickets based on the outcome
```

Codex must not assume “hardening only.” It must inspect repo reality and prove the answer.

---

## 6. Required Security/Tenant Reality Assessment

Before creating the final ticket pack, Codex must produce an evidence table like this:

| Area | Existing foundation? | Repo evidence | Missing gaps | Verdict |
|---|---|---|---|---|
| Auth/session | yes / partial / no | files/tests/docs | gaps | hardening / adding / hybrid |
| Tenant context propagation | yes / partial / no | files/tests/docs | gaps | hardening / adding / hybrid |
| RLS/database isolation | yes / partial / no | Prisma/migrations/docs | gaps | hardening / adding / hybrid |
| Service-level tenant checks | yes / partial / no | services/tests | gaps | hardening / adding / hybrid |
| Access Core after auth | yes / partial / no | services/contracts/tests | gaps | hardening / adding / hybrid |
| Gatekeeper after auth | yes / partial / no | services/contracts/tests | gaps | hardening / adding / hybrid |
| Secrets/env policy | yes / partial / no | docs/config/scripts | gaps | hardening / adding / hybrid |
| Runtime route limiting | yes / partial / no | manifests/runtime/tests | gaps | hardening / adding / hybrid |
| Frontend operator context | yes / partial / no | frontend/tests | gaps | hardening / adding / hybrid |
| Fresh DB/bootstrap path | yes / partial / no | migrations/docs | gaps | hardening / adding / hybrid |

This table must be reviewed before Phase 3 implementation is approved.

---

## 7. Required Phase 3 Documents

### 7.1 Documents Created Before Implementation

```text
docs/process/AKTI_ERP_Phase_3_Security_Auth_Tenant_Hardening_Plan_v1.md
docs/process/AKTI_ERP_Phase_3_Ticket_Pack_v1.json
```

The plan defines direction and boundaries.

The ticket pack is the implementation contract.

### 7.2 Exit Artifact Only

```text
docs/process/AKTI_ERP_Phase_3_Audit_Report_v1.md
```

Important rule:

```text
The Phase 3 Audit Report must not be populated during planning.
It may be created only as a placeholder/template marked:
"To be completed at Phase 3 closure."
```

Codex must not fill the audit report with planning-time assumptions or pretend Phase 3 findings are known before execution.

---

## 8. Required ADRs / Decisions Before Implementation

At minimum, Phase 3 needs decisions covering:

```text
Security Architecture Decision
Auth / Session Decision
Tenant Isolation / RLS Decision
Secrets and Environment Policy
Rate Limiting Decision
Frontend Auth / Operator Context Policy
Fresh DB / Bootstrap Decision or bounded deferral
```

If existing repo documents already cover part of this, Codex must cite the files and summarize the coverage.

If these are missing, Codex must propose new ADRs or subdecisions before implementation tickets are approved.

---

## 9. Phase 3 Workstreams

These are workstreams, not final tickets. Codex must convert them into a repo-grounded ticket proposal after inspection.

---

### Workstream A — Housekeeping and Baseline

Purpose:

```text
confirm main branch
confirm roadmap exists
confirm Phase 1/2 closure docs exist
confirm accepted deferrals exist
confirm source-of-truth basis
confirm Phase 3 plan file is tracked
create Phase 3 planning/ticket documents after approval
```

Expected output:

```text
clean repo baseline
Phase 3 source-of-truth context
any housekeeping findings
```

---

### Workstream B — Security Architecture Decision

Purpose:

```text
define auth/session/identity/tenant context strategy
answer hardening-vs-adding question
record decision before implementation
```

This workstream gates auth-dependent implementation.

No frontend auth/operator-context implementation may occur before Workstream B is accepted.

---

### Workstream C — Tenant Isolation and RLS / Service Strategy

Purpose:

```text
inspect schema and services
map tenant-scoped entities
decide RLS, service-level, or hybrid enforcement
define cross-tenant negative tests
define no-write-on-failure expectations
```

This must clarify whether tenant isolation is already present and needs hardening, or whether it must be added as a new foundation.

---

### Workstream D — Access Core, Gatekeeper and Auth Integration

Purpose:

```text
define how authenticated identity interacts with Access Core
define how Gatekeeper uses authenticated context
avoid duplicate permission layers
preserve capability-based authorization
preserve high-risk preflight boundaries
```

Expected result:

```text
clear relationship between auth, organization membership, capabilities, Access Core, and Gatekeeper
```

---

### Workstream E — Secrets, Environment, Security Headers and CORS

Purpose:

```text
define env templates
define secrets that must never be committed
define local/staging/production env boundaries
define allowed Codex access boundaries
define security headers
define CORS policy
prevent secret leakage
```

This workstream should produce rules that Phase 4 deployment can rely on.

---

### Workstream F — Runtime Route Limiting

Purpose:

```text
resolve Phase 2 runtime route-limiting deferral
decide whether to implement in Phase 3 or formally bound to deployment/security infrastructure
ensure manifests do not overclaim enforcement
```

If route limiting is deferred, the deferral must be explicit, bounded, and carried into Phase 4.

---

### Workstream G — Frontend Auth / Operator Context Replacement

Purpose:

```text
replace temporary operator context with session-aware pattern
define what can be implemented now
define what waits for provider/session implementation
prevent temporary actor input from being mistaken for production auth
```

Mandatory dependency:

```text
Workstream G implementation must wait until Workstream B decisions are accepted.
```

Codex may inspect and plan frontend implications early, but it must not implement frontend auth-context changes before the Security/Auth decisions are settled.

---

### Workstream H — Security and Tenant Negative Tests

Purpose:

```text
cross-tenant denial tests
missing auth tests
invalid session/actor tests
permission boundary tests
Gatekeeper denial tests
no-write-on-failure tests
rate-limit/security boundary tests where applicable
```

This workstream turns security from an architectural statement into evidence.

---

### Workstream I — Phase 3 Closure and Phase 4 Handoff

Purpose:

```text
final validation
security audit evidence
accepted deferrals update
Phase 4 readiness checklist
Phase 3 audit report completed at closure
```

Phase 4 should not begin implementation until this handoff exists.

---

## 10. Phase 3 Acceptance Target

Phase 3 is complete only when:

```text
Security Architecture Decision exists
Auth/session direction exists
Tenant isolation/RLS/service strategy exists
Access Core and Gatekeeper roles remain clear
temporary operator context is no longer mistaken for production auth
route limiting is resolved or formally bounded
secrets/env policy exists
security headers/CORS policy exists
cross-tenant negative tests pass
full validation passes
Phase 4 readiness handoff exists
Phase 3 audit report is completed at closure
```

---

## 11. Carry-Forward Deferrals from Phase 2

Phase 3 must carry these forward and resolve or bound the relevant ones:

```text
production deployment
production auth/session
production WhatsApp credentials
real outbound WhatsApp
fresh empty-database bootstrap baseline
runtime route limiting
browser-rendered frontend tests
```

### Phase 3 should directly address

```text
production auth/session
tenant/security model
runtime route limiting
secrets/env policy
fresh DB/bootstrap decision or bounded handoff
```

### Phase 4 should address

```text
deployment
staging
visual QA
browser-rendered frontend tests
operational runbook
```

---

## 12. Phase 3 Boundaries

Phase 3 must explicitly remain within security/auth/tenant hardening.

### Out of Phase 3

```text
deployment/staging implementation
visual QA implementation
production WhatsApp credentials
real outbound WhatsApp
new business modules
Foundry/module installer implementation
parallel module development
platform AI operations
```

### Must not weaken

```text
Access Core
Gatekeeper
Audit
Outbox
Module Registry
Tenant/org scoping
Phase 2 module boundaries
No direct Lead Desk-to-Meta/WhatsApp coupling
```

---

## 13. Phase 3 Planning Output Expected from Codex

Codex’s first Phase 3 planning run should return:

```text
A. Files inspected
B. Repo state summary
C. Housekeeping findings
D. Security/Tenant Reality Assessment table
E. Hardening-vs-Adding verdict
F. Required ADRs / decisions before implementation
G. Proposed Phase 3 ticket plan
H. Dependency gates and sequencing risks
I. What remains out of Phase 3
J. Final recommendation
```

Codex must not write the Phase 3 ticket pack until this proposal is reviewed.

---

## 14. Codex Plan Mode Prompt

Use this prompt to begin Phase 3 planning.

```text
We are in PLAN MODE ONLY.

Task:
Perform Phase 3 housekeeping and create a repo-grounded Phase 3 planning/ticket proposal.

Do not implement.
Do not edit app/runtime code.
Do not modify Prisma.
Do not modify contracts.
Do not modify generated registry.
Do not add dependencies.
Do not create a Phase 3 implementation branch.
Do not commit.
Do not push.
Do not deploy.

Current accepted state:
- Phase 1: PASS
- Phase 2: PASS_WITH_ACCEPTED_DEFERRALS
- Phase 1 + Phase 2 merged and validated on main
- docs/process/AKTI_ERP_Master_Roadmap_Reference_v1.md has been added
- Next phase: Phase 3 Security/Auth/Tenant Hardening
- Phase 4 must wait until Phase 3 security/tenant decisions are clear

Inspect:
- git status --short --branch
- git rev-parse HEAD
- git log --oneline --decorate -120
- AGENTS.md
- PLANS.md
- docs/process/AKTI_ERP_Master_Roadmap_Reference_v1.md
- docs/process/AKTI_ERP_Phase_3_4_Planning_Context_Stub_v1.md
- docs/process/AKTI_ERP_Accepted_Deferrals_After_Phase_2_v1.md
- docs/process/AKTI_ERP_Phase_1_2_Closure_Summary_v1.md
- docs/doctrine/AKTI_ERP_Failure_Prevention_Codex_Operating_Doctrine_v1.json
- docs/adr/*
- docs/process/*
- package.json
- pnpm-workspace.yaml
- .github/workflows/*
- prisma/schema.prisma
- prisma/migrations/*
- prisma/entity-registry.metadata.json
- generated/entity-registry.generated.json
- packages/contracts/*
- packages/contracts/scripts/*
- apps/api/src/*
- apps/web/app/*
- apps/web/test/*

Planning objectives:

1. Housekeeping check
- Confirm docs/process/AKTI_ERP_Master_Roadmap_Reference_v1.md exists and is tracked.
- Confirm main is clean and aligned.
- Confirm Phase 1 and Phase 2 closure docs exist.
- Confirm accepted deferrals after Phase 2 exist.
- Identify whether any doc-only housekeeping is needed before Phase 3 planning files are created.

2. Security/Tenant Reality Assessment
Create an evidence table for:
- auth/session
- tenant context propagation
- RLS/database isolation
- service-level tenant checks
- Access Core after auth
- Gatekeeper after auth
- secrets/env policy
- runtime route limiting
- frontend operator context
- fresh DB/bootstrap path

For each area, state:
- existing foundation: yes / partial / no
- repo evidence
- missing gaps
- verdict: hardening / adding / hybrid

3. Hardening-vs-Adding Determination
State whether Phase 3 is:
- mostly hardening
- mostly adding
- hybrid

This must be evidence-backed.
Do not assume “hardening only.”
If the repo evidence is thin, say so.

This answer determines ticket-pack size and must be credible.

4. Required Phase 3 documents
Propose the exact docs to create:
- docs/process/AKTI_ERP_Phase_3_Security_Auth_Tenant_Hardening_Plan_v1.md
- docs/process/AKTI_ERP_Phase_3_Ticket_Pack_v1.json

Audit report handling:
- docs/process/AKTI_ERP_Phase_3_Audit_Report_v1.md is an exit artifact.
- Do not populate it during planning.
- If recommended now, create only a stub/template marked:
  “to be completed at Phase 3 closure.”

5. Required ADRs / decisions
Identify which decisions must exist before implementation:
- Security Architecture Decision
- Auth / Session Decision
- Tenant Isolation / RLS Decision
- Secrets / Environment Policy
- Rate Limiting Decision
- Frontend Auth / Operator Context Policy
- Fresh DB / Bootstrap Decision or bounded deferral

If existing repo docs already cover any of these, identify the file and summarize coverage.
If missing, propose a new ADR/subdecision.

6. Phase 3 ticket plan proposal
Create a proposed ticket plan only.
Do not write the ticket pack yet.

Each proposed ticket should include:
- ticket_id
- title
- objective
- scope
- non_scope
- source_files_to_inspect
- expected_files
- forbidden_files
- tests_required
- validation_commands
- stop_conditions
- acceptance_criteria
- dependencies
- commit_message

7. Dependency gates
Explicitly enforce:
- Frontend auth/operator-context implementation depends on Security Architecture Decision and Auth/Session Decision.
- Deployment/staging implementation is out of Phase 3 and waits for Phase 4.
- Browser-rendered frontend tests are out of Phase 3 unless explicitly scoped as security tests without deployment.
- Production WhatsApp and real outbound WhatsApp remain out of Phase 3.

8. Carry-forward deferrals
Treat these as Phase 3/4 inputs:
- production deployment
- production auth/session
- production WhatsApp credentials
- real outbound WhatsApp
- fresh empty-database bootstrap baseline
- runtime route limiting
- browser-rendered frontend tests

Do not accidentally implement Phase 4 items.

9. Boundaries
Do not include:
- deployment/staging implementation
- visual QA implementation
- production WhatsApp credentials
- real outbound WhatsApp
- new business modules
- Foundry/module installer implementation
- parallel module development
- platform AI operations

Required output:

A. Files inspected

B. Repo state summary

C. Housekeeping findings:
- what exists
- what is missing
- whether roadmap is tracked
- whether Phase 3 planning files need to be created

D. Security/Tenant Reality Assessment table

E. Hardening-vs-Adding verdict:
- verdict
- evidence
- implication for ticket pack size

F. Required ADRs / decisions before implementation

G. Proposed Phase 3 ticket plan:
- table
- detailed ticket descriptions

H. Dependency gates and sequencing risks

I. What should explicitly remain out of Phase 3

J. Final recommendation:
- READY_TO_CREATE_PHASE_3_PLAN_AND_TICKET_PACK
- NEEDS_HOUSEKEEPING_FIRST
- NEEDS_CLARIFICATION_BEFORE_PHASE_3
```

---

## 15. Next Workflow

Recommended workflow:

```text
1. Place this file in docs/process/.
2. Ask Codex to run the Plan Mode prompt.
3. Bring Codex’s Phase 3 proposal back for review.
4. Review hardening-vs-adding verdict carefully.
5. If credible, ask Codex to create the Phase 3 plan and ticket pack.
6. Review ticket pack.
7. Approve autonomous Phase 3 execution.
```

No Phase 4 implementation should begin until Phase 3 closes and produces a Phase 4 readiness handoff.
