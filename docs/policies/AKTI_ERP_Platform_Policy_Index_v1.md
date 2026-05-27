# AKTI ERP Platform Policy Index v1

Status: Accepted Phase 5A governance output.

Ticket: P5A-012a

Source basis:
- docs/process/AKTI_ERP_Phase5_Strategic_Reference_v2_locked_final.md
- docs/process/AKTI_ERP_Phase_5A_Ticket_Pack_v1.json

### Objective

Create the execution-grade Phase 5A consolidation artifact for Platform Policy Index without drifting into Phase 5B runtime implementation.

### Decision / Policy

Create a policy index that maps every Phase 5A policy/ADR/standard to owner, enforcement point, Gatekeeper implication, Phase 5B input, and evidence source.

### Required Rules

- Index is navigational authority, not a replacement for source policies.
- Every upstream output must be represented.
- Missing owner or enforcement point blocks closure.

### Owner And Enforcement Point

- Policy owner: Platform Architecture.
- Execution owner: the Phase 5B implementer for this surface.
- Enforcement point: Gatekeeper preflight, Foundry lifecycle validation, CI/promotion checks, or service-contract validation as applicable.
- Evidence owner: ticket implementer must produce ticket artifacts and validation summary.

### Gatekeeper Implication

- Gatekeeper must classify changes against this artifact before later runtime implementation.
- Gatekeeper must return ALLOW, DENY, APPROVAL_REQUIRED, or STOP_FOR_REVIEW where this artifact is in scope.
- STOP_FOR_REVIEW remains owned by P5A-003f and immutable below platform architect level.

### Phase 5B Implementation Input

- Use index as Foundry/Gatekeeper implementation map.
- Track policy-to-validation coverage.
- Support final readiness handoff.

### Validation Expectations

- Exact-file planning before edits.
- Source-of-truth alignment with Prisma, contracts, module manifests, generated registry, ADRs, and the strategic reference.
- Evidence artifact proving the output path, owner, enforcement point, non-scope, stop conditions, and Phase 5B input.

### Non-Scope And Stop Conditions

- This is Phase 5A governance output only.
- It does not implement Foundry runtime, module installer runtime, business modules, production auth, scheduler runtime, notification runtime, reporting engine runtime, runtime AI, marketplace, external adapters, deployment, secrets, destructive migrations, Prisma/schema/migrations, generated registry changes, or package/dependency changes.
- Runtime implementation belongs to later approved phases and must be blocked if attempted from this artifact.

### Locked Decisions Preserved

- Reporting uses event-driven read models.
- Event schema uses an always-required envelope, context-required fields, and compliance-class mandatory fields.
- Gatekeeper is judge and policy enforcement only; Foundry is module installer and lifecycle runtime only.
- Gatekeeper outcomes are ALLOW, DENY, APPROVAL_REQUIRED, and STOP_FOR_REVIEW.
- STOP_FOR_REVIEW is immutable below platform architect level.
- Workflow Engine is a core platform service, not a Foundry module.
- Search baseline is PostgreSQL FTS with a pgvector extension path; Typesense is deferred unless measured targets fail.
- Multi-tenancy uses shared DB plus organization_id by default, with a future enterprise isolation path.
- Configurable labels are module defaults plus tenant overrides and are display-only.
- White-labeling is a core architectural constraint; white-label mode is none, partial, or full.
- Golden Module implementation belongs to Phase 6A, not Phase 5A or Phase 5B.

### Phase 5A Policy Output Index

| Ticket | Output | Type | Primary File |
| --- | --- | --- | --- |
| P5A-000 | Baseline controls, current-state inventory, roadmap housekeeping | control_policy | PLANS.md<br>docs/process/AKTI_ERP_Master_Roadmap_Reference_v2.md<br>docs/process/AKTI_ERP_Phase_Roadmap_v2.md<br>AGENTS.md |
| P5A-001a | Core Update & Platform Change Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-001b | Module Definition & Ownership Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-002a | Module Lifecycle State Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-002b | Module Installation Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-002c | Module Update / Upgrade Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-002d | Module Disable & Uninstall Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-002e | Module Rollback & Recovery Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-003a | Capability, Permission & Access Model Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-003b | Menu, Screen & Command Registration Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-003c | Settings & Configuration Registration Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-004a | Multi-Tenant Architecture Model | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-003d | Tenant Configuration & White-Label Governance Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-003e | Configurable Labels, Localization & Display Override Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-003f | Gatekeeper Preflight, Approval & STOP_FOR_REVIEW Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-004b | Tenant Isolation / RLS Enforcement Strategy | adr_decision | docs/adr/ADR-0015-tenant-rls-enforcement-strategy.md<br>docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-004c | Migration & Schema Contribution Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-005a | Adapter & External Dependency Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-005b | Secrets & Credential Management Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-005c | Security Baseline & Configuration Safety Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-006a | Event Schema Standard | standard_decision | docs/standards/AKTI_ERP_Event_Schema_Standard_v1.md |
| P5A-004d | Cross-Module Data Access Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-006b | Evidence & Audit Package Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-006c | Structured Logging & Observability Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-006d | Health Checks, SLO & SLA Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-007 | Platform Versioning Baseline and Repo-Readable Artifact Decision | adr_decision | docs/adr/ADR-0017-platform-versioning-baseline.md<br>platform.version.json |
| P5A-008 | Shell Base Capability / Session-Gated Screen Contract ADR | adr_decision | docs/adr/ADR-0016-shell-base-capability-or-session-gated-screen.md |
| P5A-009a | Module Registry Frontend API Boundary | policy_decision | docs/adr/ADR-0018-module-registry-frontend-api-boundary.md |
| P5A-009b | Module Service/API Contract Standard | standard_decision | docs/standards/AKTI_ERP_Module_Service_API_Contract_Standard_v1.md |
| P5A-010a | Notification & Communication Policy | policy_decision | docs/policies/AKTI_ERP_Notification_Communication_Policy_v1.md |
| P5A-010b | Background Job & Scheduler Policy | policy_decision | docs/policies/AKTI_ERP_Background_Job_Scheduler_Policy_v1.md |
| P5A-010c | Data Import & Export Policy | policy_decision | docs/policies/AKTI_ERP_Data_Import_Export_Reporting_Read_Model_Policy_v1.md |
| P5A-010d | Reporting & Read-Model Policy | policy_decision | docs/policies/AKTI_ERP_Data_Import_Export_Reporting_Read_Model_Policy_v1.md |
| P5A-011a | Module UI, Accessibility, Noob-Proof & White-Label UX Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-011b | AI-Ready Module Governance Policy | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-012a | Platform Policy Index | consolidation_policy | docs/policies/AKTI_ERP_Platform_Policy_Index_v1.md |
| P5A-012b | Gatekeeper Checklist Consolidation | consolidation_policy | docs/policies/AKTI_ERP_Gatekeeper_Module_Change_Checklist_v1.md |
| P5A-013a | Workflow Engine Core Service Architecture | architecture_decision | docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md |
| P5A-013b | Search Architecture Decision | architecture_decision | docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md |
| P5A-013c | Reporting / Read-Model Service Architecture | architecture_decision | docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md |
| P5A-013d | File / Document Service Architecture | architecture_decision | docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md |
| P5A-013e | AI Proxy / Governed AI Service Boundary | architecture_decision | docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md |
| P5A-013f | Data Import / Export Service Architecture | architecture_decision | docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md |
| P5A-013g | Tenant Configuration & Branding Service Architecture | architecture_decision | docs/process/AKTI_ERP_Phase_5A_Core_Platform_Service_Architecture_Decisions_v1.md |
| P5A-014a | Tenant Configuration API Contract | standard_decision | docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md |
| P5A-014b | Branding, Domain & Label Resolution API Contract | standard_decision | docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md |
| P5A-014c | Workflow Process Definition Contract | standard_decision | docs/standards/AKTI_ERP_Workflow_Process_Definition_Standard_v1.md |
| P5A-014d | Search Service Contract | standard_decision | docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md |
| P5A-014e | File / Document Service Contract | standard_decision | docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md |
| P5A-014f | Reporting / Read-Model Query Contract | standard_decision | docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md |
| P5A-014g | Data Import / Export Service Contract | standard_decision | docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md |
| P5A-014h | AI Proxy Call Contract | standard_decision | docs/standards/AKTI_ERP_Platform_Service_Contracts_Standard_v1.md |
| P5A-015a | Golden Module Certification Specification | policy_decision | docs/policies/AKTI_ERP_Platform_Policy_Pack_v1.md |
| P5A-012c | Phase 5B Input Consolidation | consolidation_policy | docs/process/AKTI_ERP_Foundry_Implementation_Requirements_From_Phase_5A_v1.md |
