# P4A-003 Full Docker Compose Option Matrix

| Option | Requirements | Pros | Cons | Decision |
| --- | --- | --- | --- | --- |
| Full Compose required | Docker Compose, Postgres service, API service, Web service, no production secrets | Best noob-proof demo posture; one command can run the whole stack | Requires careful local-only env and no package drift | Selected for P4A-011 resolution |
| Approval-gated | Human approval before Compose API/Web work | Lowest implementation risk | Leaves local demo less complete | Not selected because Docker/Compose are available and scope already allows local/demo Compose |
| Explicitly deferred | Evidence-backed deferral | Avoids Docker complexity | Would leave hybrid-only final posture | Not selected unless P4A-011 finds hard stop |

Observed Docker: Docker version 28.5.1, build e180ab8
Observed Docker Compose: Docker Compose version v2.40.2-desktop.1
