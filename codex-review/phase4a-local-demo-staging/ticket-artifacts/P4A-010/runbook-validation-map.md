# P4A-010 Runbook Validation Map

| Runbook area | Source evidence | Validation result |
| --- | --- | --- |
| Startup command | `scripts/dev/local-up.sh`, P4A-006 | PASS |
| Shutdown command | `scripts/dev/local-down.sh`, P4A-007 | PASS |
| Reset command | `scripts/dev/local-reset-db.sh`, P4A-007 | PASS |
| Smoke command | `scripts/dev/local-smoke.sh`, P4A-008 | PASS |
| Browser capture command | `scripts/dev/local-capture-frontend.sh`, P4A-009 | PASS |
| Local URLs | P4A-006/P4A-008/P4A-009 artifacts | PASS |
| Committed migration proof | P4A-006/P4A-008 evidence | PASS |
| No `db push` final proof | Phase 4A plan and runbook text | PASS |
| Full Compose posture | P4A-011 explicit deferral evidence | PASS |
| No-secret warnings | Runbook evidence rules | PASS |
| Troubleshooting | Runbook troubleshooting table | PASS |

Command/path consistency evidence is recorded in `runbook-command-consistency-log.txt`.
