# AKTI ERP Accepted Deferrals After Phase 2 v1

## Purpose

This document records accepted deferrals after Phase 1 and Phase 2 closure. These items are not hidden blockers for the Phase 1/2 merge, but they must be considered during Phase 3 and Phase 4 planning.

## Accepted Deferrals

| Deferral | Status | Expected Future Handling |
| --- | --- | --- |
| Production deployment | Accepted deferral | Phase 4 Deployment/Staging/Visual QA |
| Production auth/session | Accepted deferral | Phase 3 Security/Auth/Tenant Hardening |
| Production WhatsApp credentials | Accepted deferral | Later approved WhatsApp/provider phase only |
| Real outbound WhatsApp | Accepted deferral | Later approved WhatsApp/provider phase only |
| Fresh empty-database bootstrap baseline | Accepted deferral | Phase 4 deployment-readiness work |
| Runtime route limiting | Accepted deferral | Phase 3 security hardening |
| Browser-rendered frontend tests | Accepted deferral | Phase 4 staging/visual QA |

## Boundaries

- No production secrets are approved by this document.
- No production deployment is approved by this document.
- No real outbound WhatsApp behavior is approved by this document.
- No direct Lead Desk-to-Meta/WhatsApp coupling is approved by this document.
