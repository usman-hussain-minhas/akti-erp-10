# P4A-005 DB Safety Rules

- Allowed host: 127.0.0.1 or localhost only.
- Allowed port: 55432 for Phase 4A local/demo Postgres.
- Allowed database prefixes: akti_phase4a_local and akti_phase4a_demo.
- Forbidden: production/staging/shared hosts, cloud/VPS databases, production credential files, manual SQL patching as proof.
- Destructive commands are allowed only against the local/demo container volume created by Phase 4A scripts.
