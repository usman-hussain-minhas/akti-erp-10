# P4A-008 Failure Classification

| Classification | Meaning | Stop or repair path |
| --- | --- | --- |
| `local_tooling_missing` | Required local command such as `curl` is unavailable | Stop and repair local workstation tooling outside app runtime scope |
| `api_unreachable` | Local API did not respond at the configured API URL | Inspect local API log and restart local runtime |
| `api_health_unhealthy` | API responded but did not report healthy status | Inspect API process/env and local DB connection |
| `web_unreachable` | Local Web server did not respond at the configured Web URL | Inspect local Web log and restart local runtime |
| `web_empty_response` | Web responded with an empty body | Inspect Web build/dev server output |
| `web_unexpected_response` | Web responded but did not look like AKTI ERP | Confirm the configured Web URL points to the local AKTI ERP app |
| `setup_unreachable` | Setup endpoint could not be reached | Confirm API is running and migrations were applied |
| `setup_unexpected_response` | Setup returned 201 without completed setup body | Inspect setup API response and service logs |
| `setup_conflict_unexpected` | Setup returned 409 without the expected local already-completed conflict | Reset only local/demo proof data if appropriate |
| `setup_failed` | Setup returned an unexpected HTTP status | Inspect API logs; do not use production/staging databases |
| `cors_probe_failed` | API did not respond to a local CORS probe | Inspect API process and port |
| `cors_header_missing` | Local Web origin was not allowed by API CORS | Confirm local-up CORS env contains the local Web origin |
| `security_header_missing` | Expected local API security header is absent | Confirm local-up keeps security headers enabled |

All failures are local/demo only. A fix must not require production credentials, cloud/VPS resources, dependency changes, Prisma/schema changes, Phase 4B redesign, Phase 5, Foundry, or AI runtime scope.
