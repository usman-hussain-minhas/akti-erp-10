# P4-011 Smoke Test Matrix

| Smoke case | Command | Expected status | Expected body/header | Evidence artifact | Failure classification |
| --- | --- | --- | --- | --- | --- |
| API /health | curl local API /health | 200 | JSON service/status healthy | api-health-smoke-log.txt | validation_blocker |
| Web root/app availability | curl local web root and /app | 200 | AKTI ERP shell HTML served | web-availability-smoke-log.txt | validation_blocker |
| Setup organization path | POST /platform/setup/organization | 201 | setup_state completed | setup-organization-smoke-log.txt | validation_blocker |
| Auth/session success | GET Lead Desk list with Phase 3 bearer token | 200 | items array | auth-session-smoke-log.txt | validation_blocker |
| Auth/session failure | GET Lead Desk list without/invalid bearer token | 401 | AKTI bearer session required or malformed | auth-session-smoke-log.txt | security_blocker |
| Route org mismatch denial | GET Lead Desk list with mismatched route organization | 403 | session organization mismatch | tenant-denial-smoke-log.txt | security_blocker |
| Lead Desk list/create/detail | POST/GET/GET Lead Desk routes | 201/200/200 | lead_id created, list/detail returns lead | lead-desk-smoke-log.txt | validation_blocker |
| Engagement Gateway stub-only path | GET health and POST whatsapp_stub request | 200/201 | health healthy, request recorded through stub boundary | engagement-gateway-stub-smoke-log.txt | boundary_blocker |
| Audit/outbox verification | SQL counts after setup/Lead Desk/Gateway writes | n/a | expected audit/outbox rows exist | audit-outbox-smoke-log.txt | evidence_blocker |
| CORS/security headers | curl allowed/rejected origin and header checks | 200/blocked | allowed origin and security headers present; rejected origin not allowed | cors-security-header-smoke-log.txt | security_blocker |
| Phase 3 app-level route limit | restart API with low in-app limiter and call /health repeatedly | 429 on threshold breach | rate_limited body and Retry-After header | rate-limit-smoke-log.txt | security_blocker |

Route limiting note: P4-011 tests only the Phase 3 app-level limiter exposed by the local API process. Infrastructure, distributed, and proxy route-limiting posture remains owned by P4-015.
