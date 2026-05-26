# P4A-008 Local Smoke Matrix

| Smoke case | Command surface | Expected result | Failure classification | Remediation hint |
| --- | --- | --- | --- | --- |
| Local runtime startup | `bash scripts/dev/local-smoke.sh` delegates to `scripts/dev/local-up.sh` when API/Web are not reachable | Existing or freshly started local/demo runtime | `api_unreachable` / `web_unreachable` | Check local logs under `/tmp/akti-erp-phase4a-local/logs` and rerun `local-up` |
| API health | `GET /health` | HTTP 200 body includes `"status":"healthy"` | `api_health_unhealthy` | Inspect API log and local DATABASE_URL |
| Web root | `GET /` on local Web URL | HTTP 200 non-empty AKTI ERP HTML | `web_unexpected_response` | Inspect Web log and local API base URL |
| Setup/bootstrap path | `POST /platform/setup/organization` | HTTP 201 with `setup_state` completed, or expected HTTP 409 when local setup already exists | `setup_failed` / `setup_conflict_unexpected` | Reset only the local demo DB with `local-reset-db.sh` if local proof data is stale |
| CORS/security basics | `GET /health` with local Web `Origin` | Allowed local CORS origin and `X-Content-Type-Options: nosniff` | `cors_header_missing` / `security_header_missing` | Confirm local-up env includes local Web origin and security headers enabled |

The smoke script intentionally does not test authenticated Lead Desk flows. P4A-008 remains a local runtime smoke script; authenticated browser/session coverage is handled by the later browser/screenshot support and Phase 4 evidence chain.
