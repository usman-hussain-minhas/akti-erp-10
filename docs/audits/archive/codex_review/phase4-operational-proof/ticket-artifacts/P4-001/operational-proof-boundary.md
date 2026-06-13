# AKTI ERP Phase 4 Operational Proof Boundary Decision v1

**Status:** ACCEPTED_FOR_PHASE_4_EXECUTION
**Ticket:** P4-001
**Decision type:** Operational boundary/control decision

## Decision

Phase 4 proves controlled local/demo staging readiness. It does not authorize production launch, production credentials, cloud/provider resources, real outbound WhatsApp, Foundry/module installer work, platform AI runtime, new business modules, destructive migrations, or unapproved dependencies.

The approved Phase 4 proof target is a disposable local staging/demo runtime composed of:

- the checked-out Phase 4 branch;
- a disposable local PostgreSQL database when DB-backed proof is required;
- API and web processes started from repo scripts/build outputs;
- non-secret environment variables and placeholders only;
- evidence artifacts under `codex-review/phase4-operational-proof/`.

## What Counts As Running

Running means the API and web applications can build and start under the selected local/demo environment, the API can reach the disposable database where required, health/root endpoints respond, and smoke/browser evidence can be collected without production resources.

## What Counts As Operationally Proven

Phase 4 closure requires evidence that:

- a clean DB bootstraps or a classified blocker is recorded;
- controlled staging/demo processes run;
- smoke tests pass or unsupported smoke cases are explicitly classified;
- browser-rendered frontend proof exists;
- visual QA evidence exists;
- backup/restore proof exists;
- rollback proof exists;
- an operational runbook exists;
- no-secret/redaction checks pass;
- a final closure/audit package exists.

## What Does Not Count As Production Launch

The following are not production launch:

- local build/start proof;
- disposable local PostgreSQL proof;
- localhost browser rendering;
- placeholder/non-secret env documentation;
- source ZIP/audit package generation.

The following would be production launch or production-adjacent and are forbidden without separate approval:

- public hosting rollout;
- production domains, DNS, CDN, WAF, managed database, or cloud deployment;
- production auth provider credentials;
- production WhatsApp credentials or real outbound WhatsApp;
- production data or production backups.

## Allowed Environments

- Local developer machine and local disposable runtime under repo control.
- Localhost API/web ports selected in later decisions.
- Disposable PostgreSQL data directory or database for proof only.

## Forbidden Environments

- Production infrastructure.
- Shared customer/staff/student data environments.
- Cloud/provider staging resources unless separately approved.
- Any environment requiring real secrets or production credentials.

## Evidence Required For Closure

Evidence must be command-level or artifact-level, redacted, and traceable to Phase 4 tickets. Screenshots are evidence but not validation by themselves.

## Stop Conditions

Stop if any Phase 4 proof requires production launch, real secret access, production credentials, unapproved dependencies, destructive migrations, Phase 5/6 work, real outbound WhatsApp, or weakening Phase 1/2/3 protections.

## Phase 4 Exit Standard

Phase 4 may close only when the P4-GATE audit report and final package contain evidence for clean DB/bootstrap, controlled staging/demo run, smoke tests, browser/visual QA, backup/restore, rollback, runbook, no-secret audit, validation, accepted deferrals, and Phase 5 readiness handoff.
