# Phase 6B v16 Capability Ticket Pack v1

Status: `PHASE_6B_V16_EXECUTABLE_TICKET_PACK_READY_FOR_FINAL_REVIEW`

Implementation is not stale by itself. Tickets become stale.
Apply maximum concrete capability within the approved scope of each ticket.

## Summary

- Tickets: 17
- Source seeds mapped: 103/103
- Executable-review-ready tickets: 1
- Executable capability tickets: 0
- Blocked capability tickets: 15
- Ticket generation allowed: false
- Execution authorized: false

## Production-Grade Promotion Decision

- `P6B-CAP-000` is promoted to `EXECUTABLE_REVIEW_READY` as a schema/runtime baseline control ticket.
- `P6B-CAP-001` through `P6B-CAP-015` remain blocked until `P6B-CAP-000` is approved and executed.
- `P6B-CAP-016` remains review-gate only.

## Tickets

### P6B-CAP-000 - Produce Phase 6B schema/runtime baseline decision artifacts before capability execution

- Status: `EXECUTABLE_REVIEW_READY`
- Type: `schema_runtime_baseline_control_ticket`
- Dependencies: None
- MCR: The baseline decision artifacts explicitly map 103/103 Phase 6B seeds to current Prisma coverage, existing scaffold files, missing schema decision groups, and validation gates; `pnpm exec prisma validate --schema prisma/schema.prisma` and `pnpm registry:check` remain the required downstream proof commands before capability execution.

### P6B-CAP-001 - Implement Phase 6B Product Catalogue Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000
- MCR: After review approval, `product_catalogue.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.01; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-002 - Implement Phase 6B Product Pricing and Package Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-001
- MCR: After review approval, `product_pricing.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.02; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-003 - Implement Phase 6B Inventory and Stock Movement Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-001, P6B-CAP-002
- MCR: After review approval, `inventory_stock.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.03; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-004 - Implement Phase 6B CRM Lead Intake Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-001
- MCR: After review approval, `crm_lead_intake.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.04; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-005 - Implement Phase 6B CRM Deduplication and Identity Resolution Micro-service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-004
- MCR: After review approval, `crm_deduplication.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.05; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-006 - Implement Phase 6B CRM Pipeline and Timeline Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-004, P6B-CAP-005
- MCR: After review approval, `crm_pipeline.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.06; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-007 - Implement Phase 6B CRM Communication Engines capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-006
- MCR: After review approval, `crm_communication.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.07; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-008 - Implement Phase 6B CRM Scoring, Follow-Up, and Reporting Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-006, P6B-CAP-007
- MCR: After review approval, `crm_scoring_reporting.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.08; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-009 - Implement Phase 6B Finance Invoice and Receivables Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-001, P6B-CAP-002, P6B-CAP-006
- MCR: After review approval, `finance_invoice_receivables.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.09; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-010 - Implement Phase 6B Payment, Collection, and Top-Up Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-009
- MCR: After review approval, `payment_collection_topup.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.10; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-011 - Implement Phase 6B Expense, Purchase, and Vendor Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-010
- MCR: After review approval, `expense_purchase_vendor.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.11; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-012 - Implement Phase 6B General Ledger and Accounting Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-009, P6B-CAP-010, P6B-CAP-011
- MCR: After review approval, `general_ledger_accounting.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.12; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-013 - Implement Phase 6B Banking and Reconciliation Service capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-010, P6B-CAP-012
- MCR: After review approval, `banking_reconciliation.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.13; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-014 - Implement Phase 6B Finance Payroll Foundation capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-010, P6B-CAP-012
- MCR: After review approval, `finance_payroll_foundation.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.14; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-015 - Implement Phase 6B Finance Platform Billing UI and Customer Billing Operations capability surface

- Status: `BLOCKED_PENDING_P6B_CAP_000_SCHEMA_RUNTIME_BASELINE`
- Type: `capability_implementation_ticket_candidate`
- Dependencies: P6B-CAP-000, P6B-CAP-010, P6B-CAP-012
- MCR: After review approval, `finance_billing_operations.service.test.ts` and `pnpm --filter @akti/api typecheck` prove reviewed runtime behavior for all seeds in 6B.15; completion must be proven by the named runtime test and typecheck result.
- Blocked reason: Current repo truth has Phase 6B contract/NestJS scaffold files, but the service files are metadata-only and current Prisma schema lacks a complete Phase 6B commerce-domain entity baseline. Promoting this ticket now would force Codex to invent schema/API/runtime behavior.

### P6B-CAP-016 - Gate Phase 6B capability ticket pack before execution authorization

- Status: `REVIEW_GATE_ONLY`
- Type: `capability_ticket_pack_gate`
- Dependencies: P6B-CAP-000, P6B-CAP-001, P6B-CAP-002, P6B-CAP-003, P6B-CAP-004, P6B-CAP-005, P6B-CAP-006, P6B-CAP-007, P6B-CAP-008, P6B-CAP-009, P6B-CAP-010, P6B-CAP-011, P6B-CAP-012, P6B-CAP-013, P6B-CAP-014, P6B-CAP-015
- MCR: Gate report proves 103/103 seed coverage, zero executable exact-file overlaps, acyclic dependencies, and ticket_generation_allowed=false.
